import { ScanCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { Logger } from '@aws-lambda-powertools/logger'
import { docClient, LOCKS_TABLE, PRODUCTS_TABLE } from '../clients/dynamodb'

const logger = new Logger({ serviceName: 'cleanup-expired-locks' })

export async function cleanupExpiredLocks(): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  const result = await docClient.send(new ScanCommand({
    TableName: LOCKS_TABLE,
    FilterExpression: 'expiresAt < :now',
    ExpressionAttributeValues: { ':now': now },
  }))

  const expired = result.Items ?? []
  logger.info('cleanup_scan', { expiredCount: expired.length })

  await Promise.all(expired.map(async (lock) => {
    try {
      await docClient.send(new DeleteCommand({
        TableName: LOCKS_TABLE,
        Key: { lockId: lock.lockId },
        ConditionExpression: 'attribute_exists(lockId)',
      }))
      await docClient.send(new UpdateCommand({
        TableName: PRODUCTS_TABLE,
        Key: { slug: lock.slug },
        UpdateExpression: 'ADD quantity :one',
        ExpressionAttributeValues: { ':one': 1 },
      }))
      logger.info('lock_cleaned_up', { lockId: lock.lockId, slug: lock.slug })
    } catch (e: unknown) {
      if ((e as { name?: string }).name === 'ConditionalCheckFailedException') {
        // Already deleted by TTL — stream handler will restore quantity
      } else {
        logger.error('cleanup_error', { lockId: lock.lockId, slug: lock.slug, error: e })
      }
    }
  }))
}
