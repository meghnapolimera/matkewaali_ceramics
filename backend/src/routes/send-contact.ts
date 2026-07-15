import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Logger } from '@aws-lambda-powertools/logger'
import { sendContactEmail } from '../clients/ses'

const logger = new Logger({ serviceName: 'send-contact' })
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function sendContact(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}')
  const { name, email, message } = body as { name?: unknown; email?: unknown; message?: unknown }

  if (!name || typeof name !== 'string' || name.trim().length === 0)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Name is required' }) }
  if (name.trim().length > 200)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Name must be under 200 characters' }) }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email))
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'A valid email address is required' }) }
  if (!message || typeof message !== 'string' || message.trim().length === 0)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Message is required' }) }
  if (message.trim().length > 2000)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Message must be under 2000 characters' }) }

  try {
    await sendContactEmail({ name: name.trim(), email: email.trim(), message: message.trim() })
    logger.info('contact_sent', { email })
  } catch (e) {
    logger.error('contact_email_failed', { error: e })
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Failed to send your message. Please try again.' }) }
  }

  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) }
}
