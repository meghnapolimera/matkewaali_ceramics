import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { SquareClient, SquareEnvironment } from 'square'

let _client: SquareClient | null = null

export async function getSquareClient(): Promise<SquareClient> {
  if (_client) return _client

  const ssm = new SSMClient({})
  const result = await ssm.send(new GetParameterCommand({
    Name: `/matkewaali/square/${process.env.ENVIRONMENT}/access-token`,
    WithDecryption: true,
  }))

  _client = new SquareClient({
    token: result.Parameter!.Value!,
    environment: process.env.ENVIRONMENT === 'prod' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  })

  return _client
}
