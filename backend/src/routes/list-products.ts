import { APIGatewayProxyResult } from 'aws-lambda'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { Logger } from '@aws-lambda-powertools/logger'
import { docClient, PRODUCTS_TABLE } from '../clients/dynamodb'
import { Product, ProductResponse } from '../types'

const logger = new Logger({ serviceName: 'list-products' })

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

export async function listProducts(): Promise<APIGatewayProxyResult> {
  logger.info('Fetching all active products')

  const result = await docClient.send(new ScanCommand({
    TableName: PRODUCTS_TABLE,
    FilterExpression: 'isActive = :active',
    ExpressionAttributeValues: { ':active': true },
  }))

  const products: ProductResponse[] = ((result.Items ?? []) as Product[])
    .map(p => ({ ...p, soldOut: p.quantity === 0 }))
    .sort((a, b) => {
      if (a.soldOut !== b.soldOut) return a.soldOut ? 1 : -1
      return a.name.localeCompare(b.name, undefined, { numeric: true })
    })

  logger.info('Products fetched', { count: products.length })

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(products),
  }
}
