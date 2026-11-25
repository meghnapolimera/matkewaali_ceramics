import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { Logger } from '@aws-lambda-powertools/logger'
import { docClient } from '../clients/dynamodb'

const logger = new Logger({ serviceName: 'subscribe' })
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

const SUBSCRIBERS_TABLE = process.env.SUBSCRIBERS_TABLE!
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const GARBLED_GMAIL_RE = /^([a-z0-9]{1,2}\.){3,}[a-z0-9]+@gmail\.com$/

export async function subscribe(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}')
  const { email, website } = body as { email?: unknown; website?: unknown }

  // honeypot — bots fill this, humans don't see it
  if (website) {
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) }
  }

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'A valid email address is required' }) }
  }

  if (GARBLED_GMAIL_RE.test(email.toLowerCase().trim())) {
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) }
  }

  try {
    await docClient.send(new PutCommand({
      TableName: SUBSCRIBERS_TABLE,
      Item: { email: email.toLowerCase().trim(), subscribedAt: new Date().toISOString() },
      ConditionExpression: 'attribute_not_exists(email)',
    }))
    logger.info('subscriber_added', { email })
  } catch (e) {
    if (!(e instanceof ConditionalCheckFailedException)) throw e
    // already subscribed — return success silently
  }

  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) }
}
