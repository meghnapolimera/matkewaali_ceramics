import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Logger } from '@aws-lambda-powertools/logger'

const logger = new Logger({ serviceName: 'matkewaali-analytics' })

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

export async function recordEvent(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}')
  const { event: eventName, properties = {} } = body

  if (!eventName || typeof eventName !== 'string') {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'event is required' }),
    }
  }

  logger.info('analytics_event', { event: eventName, properties })

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: '{}',
  }
}
