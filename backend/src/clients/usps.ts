import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

const USPS_BASE = 'https://api.usps.com'

let _token: { value: string; expiresAt: number } | null = null

async function getCredentials(): Promise<{ key: string; secret: string }> {
  const ssm = new SSMClient({})
  const env = process.env.ENVIRONMENT
  const [keyResult, secretResult] = await Promise.all([
    ssm.send(new GetParameterCommand({ Name: `/matkewaali/usps/${env}/consumer-key`, WithDecryption: true })),
    ssm.send(new GetParameterCommand({ Name: `/matkewaali/usps/${env}/consumer-secret`, WithDecryption: true })),
  ])
  return {
    key: keyResult.Parameter!.Value!,
    secret: secretResult.Parameter!.Value!,
  }
}

async function getToken(): Promise<string> {
  if (_token && _token.expiresAt > Date.now() + 60_000) return _token.value

  const { key, secret } = await getCredentials()
  const response = await fetch(`${USPS_BASE}/oauth2/v3/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: key,
      client_secret: secret,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`USPS token request failed: ${response.status} ${body}`)
  }

  const data = await response.json() as { access_token: string; expires_in: number }
  _token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  return _token.value
}

export interface UspsAddress {
  streetAddress: string
  city: string
  state: string
  ZIPCode: string
  ZIPPlus4?: string
}

export interface UspsVerifyResult {
  address: UspsAddress
  dpvConfirmation: 'Y' | 'S' | 'D' | 'N'
}

export async function verifyAddress(params: {
  streetAddress: string
  city: string
  state: string
  ZIPCode: string
}): Promise<UspsVerifyResult> {
  const token = await getToken()
  const query = new URLSearchParams(params)
  const response = await fetch(`${USPS_BASE}/addresses/v3/address?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) throw new Error(`USPS address API failed: ${response.status}`)

  const data = await response.json() as {
    address: UspsAddress
    additionalInfo: { DPVConfirmation: string }
  }

  return {
    address: data.address,
    dpvConfirmation: data.additionalInfo.DPVConfirmation as UspsVerifyResult['dpvConfirmation'],
  }
}
