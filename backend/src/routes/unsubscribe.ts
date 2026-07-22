import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { Logger } from '@aws-lambda-powertools/logger'
import { docClient, SUBSCRIBERS_TABLE } from '../clients/dynamodb'

const logger = new Logger({ serviceName: 'unsubscribe' })

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function unsubscribe(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}')
  const { email } = body as { email?: unknown }

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'A valid email address is required' }) }
  }

  await docClient.send(new DeleteCommand({
    TableName: SUBSCRIBERS_TABLE,
    Key: { email: email.toLowerCase().trim() },
  }))

  logger.info('unsubscribed', { email })

  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) }
}
