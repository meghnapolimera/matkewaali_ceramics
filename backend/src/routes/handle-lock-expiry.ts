import { DynamoDBStreamEvent } from 'aws-lambda'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { Logger } from '@aws-lambda-powertools/logger'
import { docClient, PRODUCTS_TABLE } from '../clients/dynamodb'

const logger = new Logger({ serviceName: 'lock-expiry' })

export async function handleLockExpiry(event: DynamoDBStreamEvent): Promise<void> {
  for (const record of event.Records) {
    if (record.eventName !== 'REMOVE' || !record.dynamodb?.OldImage) continue

    const slug = record.dynamodb.OldImage.slug?.S
    const lockId = record.dynamodb.OldImage.lockId?.S

    if (!slug || !lockId) continue

    logger.info('lock_expired', { lockId, slug })

    await docClient.send(new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: { slug },
      UpdateExpression: 'SET quantity = quantity + :one',
      ExpressionAttributeValues: { ':one': 1 },
    }))
  }
}
