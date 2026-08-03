import { APIGatewayProxyEvent, APIGatewayProxyResult, DynamoDBStreamEvent } from 'aws-lambda'
import { Logger } from '@aws-lambda-powertools/logger'
import { listProducts } from './routes/list-products'
import { getProduct } from './routes/get-product'
import { recordEvent } from './routes/record-event'
import { createLock } from './routes/create-lock'
import { deleteLock } from './routes/delete-lock'
import { handleLockExpiry } from './routes/handle-lock-expiry'
import { createOrder } from './routes/create-order'
import { getConfig } from './routes/get-config'
import { subscribe } from './routes/subscribe'
import { unsubscribe } from './routes/unsubscribe'
import { verifyAddress } from './routes/verify-address'
import { getShippingRates } from './routes/get-shipping-rates'
import { cleanupExpiredLocks } from './routes/cleanup-expired-locks'

const logger = new Logger({ serviceName: 'matkewaali-service' })

export const handler = async (
  event: APIGatewayProxyEvent | DynamoDBStreamEvent
): Promise<APIGatewayProxyResult | void> => {
  if ('Records' in event && event.Records?.[0]?.eventSource === 'aws:dynamodb') {
    return handleLockExpiry(event as DynamoDBStreamEvent)
  }

  if ('source' in event && event.source === 'aws.events') {
    await cleanupExpiredLocks()
    return
  }

  const apiEvent = event as APIGatewayProxyEvent
  const { httpMethod, path, requestContext } = apiEvent

  logger.appendKeys({ path, method: httpMethod, requestId: requestContext.requestId })
  logger.info('Incoming request')

  try {
    if (httpMethod === 'GET' && path === '/config') {
      return await getConfig()
    }

    if (httpMethod === 'GET' && path === '/products') {
      return await listProducts()
    }

    if (httpMethod === 'GET' && /^\/products\/[^/]+$/.test(path)) {
      return await getProduct(apiEvent)
    }

    if (httpMethod === 'POST' && path === '/analytics/event') {
      return await recordEvent(apiEvent)
    }

    if (httpMethod === 'POST' && path === '/locks') {
      return await createLock(apiEvent)
    }

    if (httpMethod === 'DELETE' && /^\/locks\/[^/]+$/.test(path)) {
      return await deleteLock(apiEvent)
    }

    if (httpMethod === 'POST' && path === '/orders') {
      return await createOrder(apiEvent)
    }

    if (httpMethod === 'POST' && path === '/subscribe') {
      return await subscribe(apiEvent)
    }

    if (httpMethod === 'DELETE' && path === '/subscribe') {
      return await unsubscribe(apiEvent)
    }

    if (httpMethod === 'POST' && path === '/address/verify') {
      return await verifyAddress(apiEvent)
    }

    if (httpMethod === 'POST' && path === '/shipping/rates') {
      return await getShippingRates(apiEvent)
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Not found' }),
    }
  } catch (error) {
    logger.error('Unhandled error', { error })
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
}
