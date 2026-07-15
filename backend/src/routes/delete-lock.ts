import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { Logger } from '@aws-lambda-powertools/logger'
import { docClient, PRODUCTS_TABLE, LOCKS_TABLE } from '../clients/dynamodb'

const logger = new Logger({ serviceName: 'delete-lock' })

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

export async function deleteLock(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const lockId = event.pathParameters?.lockId
  const cognitoIdentityId = event.requestContext.identity?.cognitoIdentityId ?? 'unknown'

  if (!lockId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'lockId is required' }),
    }
  }

  const result = await docClient.send(new GetCommand({
    TableName: LOCKS_TABLE,
    Key: { lockId },
  }))

  if (!result.Item) {
    return { statusCode: 200, headers: CORS_HEADERS, body: '{}' }
  }

  const lock = result.Item as { lockId: string; slug: string; cognitoIdentityId: string }

  if (lock.cognitoIdentityId !== cognitoIdentityId) {
    return {
      statusCode: 403,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Forbidden' }),
    }
  }

  await docClient.send(new TransactWriteCommand({
    TransactItems: [
      {
        Delete: {
          TableName: LOCKS_TABLE,
          Key: { lockId },
          ConditionExpression: 'attribute_exists(lockId)',
        },
      },
      {
        Update: {
          TableName: PRODUCTS_TABLE,
          Key: { slug: lock.slug },
          UpdateExpression: 'SET quantity = quantity + :one',
          ExpressionAttributeValues: { ':one': 1 },
        },
      },
    ],
  }))

  logger.info('lock_released', { lockId, slug: lock.slug, cognitoIdentityId })

  return { statusCode: 200, headers: CORS_HEADERS, body: '{}' }
}
