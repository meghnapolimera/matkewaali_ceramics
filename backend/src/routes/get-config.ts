import { APIGatewayProxyResult } from 'aws-lambda'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

const ssm = new SSMClient({})
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

let cachedShopEnabled: boolean | null = null
let cacheExpiry = 0

export async function getConfig(): Promise<APIGatewayProxyResult> {
  const now = Date.now()
  if (cachedShopEnabled === null || now > cacheExpiry) {
    try {
      const result = await ssm.send(new GetParameterCommand({
        Name: `/matkewaali/shop/${process.env.ENVIRONMENT}/enabled`,
      }))
      cachedShopEnabled = result.Parameter?.Value !== 'false'
    } catch {
      cachedShopEnabled = true  // fail open — keep shop accessible if SSM is unavailable
    }
    cacheExpiry = now + 60_000
  }
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ shopEnabled: cachedShopEnabled }),
  }
}
