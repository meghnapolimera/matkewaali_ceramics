import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { Logger } from '@aws-lambda-powertools/logger'
import { docClient } from '../clients/dynamodb'
import { sendSubscriptionConfirmation } from '../clients/ses'

const logger = new Logger({ serviceName: 'subscribe' })
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

const SUBSCRIBERS_TABLE = process.env.SUBSCRIBERS_TABLE!
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function subscribe(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}')
  const { email } = body as { email?: unknown }

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'A valid email address is required' }) }
  }

  await docClient.send(new PutCommand({
    TableName: SUBSCRIBERS_TABLE,
    Item: { email: email.toLowerCase().trim(), subscribedAt: new Date().toISOString() },
  }))

  logger.info('subscriber_added', { email })

  await sendSubscriptionConfirmation(email).catch(e => logger.error('subscription_email_failed', { email, error: e }))

  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) }
}
