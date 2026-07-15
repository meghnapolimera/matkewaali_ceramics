import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
export const docClient = DynamoDBDocumentClient.from(client)

export const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!
export const LOCKS_TABLE = process.env.LOCKS_TABLE!
export const ORDERS_TABLE = process.env.ORDERS_TABLE!
export const SUBSCRIBERS_TABLE = process.env.SUBSCRIBERS_TABLE!
