import { AwsClient } from 'aws4fetch'
import { getCredentials } from './auth'

const BASE_URL = import.meta.env.VITE_API_URL
const AWS_REGION = import.meta.env.VITE_AWS_REGION

export interface Product {
  slug: string
  name: string
  price: number
  description: string
  height: string
  width: string
  volume: string
  imageUrl: string
  quantity: number
  isActive: boolean
  soldOut: boolean
}

export class NotFoundError extends Error {}
export class ApiError extends Error {}
export class LockConflictError extends Error {}
export class OrderExpiredError extends Error {}
export class PaymentDeclinedError extends Error {}

async function signedFetch(url: string, options?: RequestInit): Promise<Response> {
  const creds = await getCredentials()
  const aws = new AwsClient({
    accessKeyId: creds.accessKeyId,
    secretAccessKey: creds.secretAccessKey,
    sessionToken: creds.sessionToken,
    region: AWS_REGION,
    service: 'execute-api',
  })
  return aws.fetch(url, options)
}

async function fetchWithRetry(url: string, options?: RequestInit): Promise<Response> {
  const retryDelays = [100, 200, 400]
  let response = await signedFetch(url, options)

  for (let i = 0; i < retryDelays.length && response.status >= 500; i++) {
    await new Promise(resolve => setTimeout(resolve, retryDelays[i]))
    response = await signedFetch(url, options)
  }

  return response
}

export const api = {
  async getConfig(): Promise<{ shopEnabled: boolean }> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/config`)
      if (!response.ok) return { shopEnabled: true }
      return response.json()
    } catch {
      return { shopEnabled: true }
    }
  },

  async getProducts(): Promise<Product[]> {
    const response = await fetchWithRetry(`${BASE_URL}/products`)
    if (!response.ok) throw new ApiError('Failed to fetch products')
    return response.json()
  },

  async getProduct(slug: string): Promise<Product> {
    const response = await fetchWithRetry(`${BASE_URL}/products/${slug}`)
    if (response.status === 404) throw new NotFoundError(`Product not found: ${slug}`)
    if (!response.ok) throw new ApiError('Failed to fetch product')
    return response.json()
  },

  async recordEvent(eventName: string, properties: Record<string, unknown> = {}): Promise<void> {
    try {
      await signedFetch(`${BASE_URL}/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventName, properties }),
      })
    } catch {
      // analytics failures are silent
    }
  },

  async createLock(slug: string): Promise<{ lockId: string; expiresAt: number }> {
    const response = await fetchWithRetry(`${BASE_URL}/locks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    if (response.status === 409) throw new LockConflictError('This item is no longer available')
    if (!response.ok) throw new ApiError('Failed to lock item')
    return response.json()
  },

  async releaseLock(lockId: string): Promise<void> {
    try {
      await signedFetch(`${BASE_URL}/locks/${lockId}`, { method: 'DELETE' })
    } catch {
      // silent — lock will expire via TTL anyway
    }
  },

  async subscribe(email: string): Promise<void> {
    await signedFetch(`${BASE_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
  },

  async unsubscribe(email: string): Promise<void> {
    await signedFetch(`${BASE_URL}/subscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
  },

  async getShippingRates(body: {
    lockIds: string[]
  }): Promise<{ shippingCost: number }> {
    const response = await signedFetch(`${BASE_URL}/shipping/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new ApiError('Failed to fetch shipping rates')
    return response.json()
  },

  async verifyAddress(body: {
    line1: string
    city: string
    state: string
    zip: string
  }): Promise<{ deliverable: boolean | null; standardized?: { line1: string; city: string; state: string; zip: string } }> {
    try {
      const response = await signedFetch(`${BASE_URL}/address/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) return { deliverable: null }
      return response.json()
    } catch {
      return { deliverable: null }
    }
  },

  async createOrder(body: {
    squarePaymentToken: string
    customerName: string
    customerEmail: string
    shippingAddress: { line1: string; line2?: string; city: string; state: string; zip: string }
    lockIds: string[]
  }): Promise<{ orderId: string; squarePaymentId: string; subtotal: number; tax: number; total: number }> {
    const response = await signedFetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (response.status === 409) throw new OrderExpiredError('Cart expired')
    if (response.status === 402) {
      const data = await response.json()
      throw new PaymentDeclinedError((data as { message: string }).message)
    }
    if (!response.ok) throw new ApiError('Failed to create order')
    return response.json()
  },
}
