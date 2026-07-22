import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { BatchGetCommand } from '@aws-sdk/lib-dynamodb'
import { Logger } from '@aws-lambda-powertools/logger'
import { docClient, LOCKS_TABLE } from '../clients/dynamodb'
import { BASE_PACKAGING_LBS, PER_ITEM_PACKAGING_LBS } from '../constants'
import { shippingCostForWeight } from '../shipping'

const logger = new Logger({ serviceName: 'get-shipping-rates' })

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

interface LockItem {
  lockId: string
  weightLbs: number
}

export async function getShippingRates(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}') as { lockIds?: unknown }

  if (!body.lockIds || !Array.isArray(body.lockIds) || body.lockIds.length === 0)
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'lockIds must be a non-empty array' }) }

  const { lockIds } = body as { lockIds: string[] }

  const batchResult = await docClient.send(new BatchGetCommand({
    RequestItems: {
      [LOCKS_TABLE]: { Keys: lockIds.map(lockId => ({ lockId })) },
    },
  }))

  const locks = (batchResult.Responses?.[LOCKS_TABLE] ?? []) as LockItem[]
  const totalWeightLbs = locks.reduce((sum, l) => sum + (l.weightLbs ?? 0), 0) + BASE_PACKAGING_LBS + (locks.length * PER_ITEM_PACKAGING_LBS)
  const shippingCost = shippingCostForWeight(totalWeightLbs)

  logger.info('shipping_rate_calculated', { totalWeightLbs, shippingCost })

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ shippingCost }),
  }
}
