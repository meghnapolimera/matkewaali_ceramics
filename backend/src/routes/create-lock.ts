import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { randomUUID } from 'crypto'
import { Logger } from '@aws-lambda-powertools/logger'
import { docClient, PRODUCTS_TABLE, LOCKS_TABLE } from '../clients/dynamodb'

const logger = new Logger({ serviceName: 'create-lock' })

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

const LOCK_TTL_SECONDS = 15 * 60

export async function createLock(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body ?? '{}')
  const { slug } = body
  const cognitoIdentityId = event.requestContext.identity?.cognitoIdentityId ?? 'unknown'

  if (!slug || typeof slug !== 'string') {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'slug is required' }),
    }
  }

  const productResult = await docClient.send(new GetCommand({
    TableName: PRODUCTS_TABLE,
    Key: { slug },
  }))

  if (!productResult.Item) {
    return {
      statusCode: 409,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'This item is no longer available' }),
    }
  }

  const { name, price } = productResult.Item as { name: string; price: number }

  const lockId = randomUUID()
  const expiresAt = Math.floor(Date.now() / 1000) + LOCK_TTL_SECONDS

  try {
    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: PRODUCTS_TABLE,
            Key: { slug },
            UpdateExpression: 'SET quantity = quantity - :one',
            ConditionExpression: 'quantity > :zero AND isActive = :active',
            ExpressionAttributeValues: { ':one': 1, ':zero': 0, ':active': true },
          },
        },
        {
          Put: {
            TableName: LOCKS_TABLE,
            Item: { lockId, slug, name, price, cognitoIdentityId, expiresAt },
          },
        },
      ],
    }))
  } catch (e) {
    if (e instanceof TransactionCanceledException) {
      logger.info('lock_unavailable', { slug })
      return {
        statusCode: 409,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'This item is no longer available' }),
      }
    }
    throw e
  }

  logger.info('lock_created', { lockId, slug, cognitoIdentityId })

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ lockId, expiresAt }),
  }
}
