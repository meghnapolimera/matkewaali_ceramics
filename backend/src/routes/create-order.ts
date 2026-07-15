import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { BatchGetCommand, PutCommand, UpdateCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { Logger } from '@aws-lambda-powertools/logger'
import { SquareError } from 'square'
import { docClient, LOCKS_TABLE, ORDERS_TABLE, SUBSCRIBERS_TABLE } from '../clients/dynamodb'
import { getSquareClient } from '../clients/square'
import { sendOrderConfirmation } from '../clients/ses'

const logger = new Logger({ serviceName: 'create-order' })

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
])

const WA_TAX_RATE = 0.1025

interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
}

interface LockItem {
  lockId: string
  slug: string
  name: string
  price: number
  cognitoIdentityId: string
  expiresAt: number
}

const DECLINE_MESSAGES: Partial<Record<string, string>> = {
  GENERIC_DECLINE:                    'Your card was declined. Please try a different payment method.',
  INSUFFICIENT_FUNDS:                 'Your card has insufficient funds.',
  CARD_EXPIRED:                       'Your card has expired. Please use a different card.',
  INVALID_EXPIRATION:                 'Your card\'s expiration date is invalid.',
  CVV_FAILURE:                        'The CVV code is incorrect. Please check your card details.',
  VERIFY_CVV_FAILURE:                 'The CVV code is incorrect. Please check your card details.',
  ADDRESS_VERIFICATION_FAILURE:       'The billing address doesn\'t match. Please check your details.',
  VERIFY_AVS_FAILURE:                 'The billing address doesn\'t match. Please check your details.',
  INVALID_CARD:                       'Your card number is invalid. Please check and try again.',
  CARD_NOT_SUPPORTED:                 'This card type is not supported. Please use a different card.',
  CARD_DECLINED_CALL_ISSUER:          'Your card was declined. Please contact your bank.',
  CARD_DECLINED_VERIFICATION_REQUIRED:'Additional verification is required. Please contact your bank.',
  PAN_FAILURE:                        'Your card number is invalid. Please check and try again.',
  TRANSACTION_LIMIT:                  'This transaction exceeds your card limit. Please try a different card.',
  ALLOWABLE_PIN_TRIES_EXCEEDED:       'Too many incorrect PIN attempts. Please contact your bank.',
}

function squareDeclineMessage(e: unknown): string {
  if (e instanceof SquareError) {
    const code = e.errors[0]?.code
    return DECLINE_MESSAGES[code] ?? 'Your card was declined. Please try a different payment method.'
  }
  return 'Your card was declined. Please try a different payment method.'
}

function validateRequest(body: Record<string, unknown>): string | null {
  if (!body.squarePaymentToken || typeof body.squarePaymentToken !== 'string') return 'squarePaymentToken is required'
  if (!body.customerName || typeof body.customerName !== 'string') return 'customerName is required'
  if (!body.customerEmail || typeof body.customerEmail !== 'string') return 'customerEmail is required'
  if (!body.lockIds || !Array.isArray(body.lockIds) || body.lockIds.length === 0) return 'lockIds must be a non-empty array'

  const addr = body.shippingAddress as ShippingAddress | undefined
  if (!addr) return 'shippingAddress is required'
  if (!addr.line1) return 'shippingAddress.line1 is required'
  if (!addr.city) return 'shippingAddress.city is required'
  if (!addr.state || !US_STATES.has(addr.state)) return 'shippingAddress.state must be a valid US state code'
  if (!addr.zip || !/^\d{5}(-\d{4})?$/.test(addr.zip)) return 'shippingAddress.zip must be a valid US zip code'

  return null
}

async function markOrderFailed(orderId: string): Promise<void> {
  try {
    await docClient.send(new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderId },
      UpdateExpression: 'SET #s = :failed',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':failed': 'failed' },
    }))
  } catch (e) {
    logger.error('order_mark_failed_error', { orderId, error: e })
  }
}

export async function createOrder(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const cognitoIdentityId = event.requestContext.identity?.cognitoIdentityId ?? 'unknown'
  const body = JSON.parse(event.body ?? '{}')

  const validationError = validateRequest(body)
  if (validationError) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: validationError }) }
  }

  const { squarePaymentToken, customerName, customerEmail, lockIds, shippingAddress } = body as {
    squarePaymentToken: string
    customerName: string
    customerEmail: string
    lockIds: string[]
    shippingAddress: ShippingAddress
  }

  // Step 1: Validate all locks exist and have not expired
  const batchResult = await docClient.send(new BatchGetCommand({
    RequestItems: {
      [LOCKS_TABLE]: {
        Keys: lockIds.map(lockId => ({ lockId })),
      },
    },
  }))

  const locks = (batchResult.Responses?.[LOCKS_TABLE] ?? []) as LockItem[]
  const now = Math.floor(Date.now() / 1000)

  if (locks.length !== lockIds.length || locks.some(l => l.expiresAt <= now)) {
    return {
      statusCode: 409,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'One or more items in your cart have expired. Please return to your cart.' }),
    }
  }

  // Step 2: Calculate totals server-side
  const subtotal = locks.reduce((sum, l) => sum + l.price, 0)
  const tax = shippingAddress.state === 'WA' ? Math.round(subtotal * WA_TAX_RATE * 100) / 100 : 0
  const total = Math.round((subtotal + tax) * 100) / 100
  const totalCents = Math.round(total * 100)
  const items = locks.map(l => ({ lockId: l.lockId, slug: l.slug, name: l.name, price: l.price }))

  // Step 3: Write pending order — if this fails we return 500 before charging Square
  const orderId = randomUUID()

  await docClient.send(new PutCommand({
    TableName: ORDERS_TABLE,
    Item: {
      orderId,
      customerName,
      customerEmail,
      shippingAddress,
      items,
      subtotal,
      tax,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  }))

  // Step 4: Charge Square
  const square = await getSquareClient()
  let squarePaymentId: string

  try {
    const { payment } = await square.payments.create({
      sourceId: squarePaymentToken,
      idempotencyKey: randomUUID(),
      amountMoney: { amount: BigInt(totalCents), currency: 'USD' },
      locationId: process.env.SQUARE_LOCATION_ID!,
    })
    squarePaymentId = payment!.id!
  } catch (e: unknown) {
    await markOrderFailed(orderId)
    const message = squareDeclineMessage(e)
    logger.warn('square_payment_failed', { orderId, message, code: e instanceof SquareError ? e.errors[0]?.code : 'unknown' })
    return { statusCode: 402, headers: CORS_HEADERS, body: JSON.stringify({ message }) }
  }

  // Step 5: Update order to completed with Square payment ID
  // If this fails, the pending record exists and squarePaymentId is logged for manual reconciliation
  try {
    await docClient.send(new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderId },
      UpdateExpression: 'SET #s = :completed, squarePaymentId = :paymentId',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':completed': 'completed', ':paymentId': squarePaymentId },
    }))
  } catch (e) {
    logger.error('order_update_failed', { orderId, squarePaymentId, cognitoIdentityId, error: e })
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Internal server error' }) }
  }

  // Step 6: Delete locks without restoring quantity (items are sold)
  await docClient.send(new TransactWriteCommand({
    TransactItems: lockIds.map(lockId => ({
      Delete: { TableName: LOCKS_TABLE, Key: { lockId } },
    })),
  }))

  // Step 7: Send confirmation email + add to subscribers (both non-fatal — order is committed)
  await Promise.allSettled([
    sendOrderConfirmation({ to: customerEmail, customerName, orderId, items, subtotal, tax, total, shippingAddress })
      .catch(e => logger.error('confirmation_email_failed', { orderId, customerEmail, error: e })),
    docClient.send(new PutCommand({
      TableName: SUBSCRIBERS_TABLE,
      Item: { email: customerEmail.toLowerCase().trim(), subscribedAt: new Date().toISOString() },
    })).catch(e => logger.error('subscriber_add_failed', { customerEmail, error: e })),
  ])

  logger.info('order_created', { orderId, squarePaymentId, total, cognitoIdentityId })

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ orderId, squarePaymentId, subtotal, tax, total }),
  }
}
