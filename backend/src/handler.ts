import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Logger } from '@aws-lambda-powertools/logger'
import { listProducts } from './routes/list-products'
import { getProduct } from './routes/get-product'

const logger = new Logger({ serviceName: 'matkewaali-service' })

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, requestContext } = event

  logger.appendKeys({ path, method: httpMethod, requestId: requestContext.requestId })
  logger.info('Incoming request')

  try {
    if (httpMethod === 'GET' && path === '/products') {
      return await listProducts()
    }

    if (httpMethod === 'GET' && /^\/products\/[^/]+$/.test(path)) {
      return await getProduct(event)
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
