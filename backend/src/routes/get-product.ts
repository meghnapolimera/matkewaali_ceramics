import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { Logger } from '@aws-lambda-powertools/logger'
import { docClient, PRODUCTS_TABLE } from '../clients/dynamodb'
import { Product, ProductResponse } from '../types'

const logger = new Logger({ serviceName: 'get-product' })

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

export async function getProduct(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const slug = event.pathParameters?.slug

  if (!slug) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Missing slug' }) }
  }

  logger.info('Fetching product', { slug })

  const result = await docClient.send(new GetCommand({
    TableName: PRODUCTS_TABLE,
    Key: { slug },
  }))

  if (!result.Item) {
    logger.info('Product not found', { slug })
    return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Product not found' }) }
  }

  const product = result.Item as Product
  const response: ProductResponse = { ...product, soldOut: product.quantity === 0 }

  logger.info('Product fetched', { slug })

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(response),
  }
}
