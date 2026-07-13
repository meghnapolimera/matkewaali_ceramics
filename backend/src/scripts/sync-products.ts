#!/usr/bin/env npx ts-node
import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

const PRODUCTS_JSON = path.resolve(__dirname, '../../../frontend/src/data/products.json')
const IMAGES_DIR = path.resolve(__dirname, '../../../frontend/src/assets/products')

interface SourceProduct {
  slug: string
  name: string
  price: number
  description: string
  image: string
  height: string
  width: string
  volume: string
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim().toLowerCase())
    })
  })
}

async function main() {
  const env = await prompt('Deploy to (test/prod): ')
  if (env !== 'test' && env !== 'prod') {
    console.error('Invalid environment. Must be "test" or "prod".')
    process.exit(1)
  }

  const bucketName = `matkewaali-product-images-${env}`
  const tableName = `matkewaali-products-${env}`
  const date = new Date().toISOString().split('T')[0]

  const s3 = new S3Client({})
  const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))

  const products: SourceProduct[] = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf-8'))

  console.log(`\nSyncing ${products.length} product(s) to ${env}...\n`)

  for (const product of products) {
    const ext = path.extname(product.image)
    const s3Key = `${date}/${product.slug}${ext}`
    const imagePath = path.join(IMAGES_DIR, product.image)

    const imageBuffer = fs.readFileSync(imagePath)
    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: imageBuffer,
      ContentType: 'image/jpeg',
    }))

    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${s3Key}`

    await ddb.send(new PutCommand({
      TableName: tableName,
      Item: {
        slug: product.slug,
        name: product.name,
        price: product.price,
        description: product.description,
        height: product.height,
        width: product.width,
        volume: product.volume,
        imageUrl,
        quantity: 1,
        isActive: true,
      },
    }))

    console.log(`✓ ${product.name}`)
    console.log(`  S3:      s3://${bucketName}/${s3Key}`)
    console.log(`  DynamoDB: ${tableName} → slug="${product.slug}"\n`)
  }

  console.log(`Done. ${products.length} product(s) synced to ${env}.`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
