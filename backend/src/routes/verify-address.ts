import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Logger } from '@aws-lambda-powertools/logger'
import { verifyAddress as uspsVerify } from '../clients/usps'

const logger = new Logger({ serviceName: 'verify-address' })

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

export async function verifyAddress(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}') as {
    line1?: unknown
    city?: unknown
    state?: unknown
    zip?: unknown
  }

  const { line1, city, state, zip } = body

  if (!line1 || typeof line1 !== 'string' || line1.trim().length === 0)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'line1 is required' }) }
  if (!city || typeof city !== 'string' || city.trim().length === 0)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'city is required' }) }
  if (!state || typeof state !== 'string' || state.trim().length === 0)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'state is required' }) }
  if (!zip || typeof zip !== 'string' || zip.trim().length === 0)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'zip is required' }) }

  try {
    const result = await uspsVerify({
      streetAddress: line1.trim(),
      city: city.trim(),
      state: state.trim(),
      ZIPCode: zip.trim().slice(0, 5),
    })

    const deliverable = result.dpvConfirmation === 'Y' || result.dpvConfirmation === 'S' || result.dpvConfirmation === 'D'

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        deliverable,
        standardized: {
          line1: result.address.streetAddress,
          city: result.address.city,
          state: result.address.state,
          zip: result.address.ZIPCode,
        },
      }),
    }
  } catch (error) {
    logger.error('USPS verification failed', { error })
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ deliverable: null }),
    }
  }
}
