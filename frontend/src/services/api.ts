const BASE_URL = import.meta.env.VITE_API_URL

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

async function fetchWithRetry(url: string): Promise<Response> {
  const retryDelays = [100, 200, 400]
  let response = await fetch(url)

  for (let i = 0; i < retryDelays.length && response.status >= 500; i++) {
    await new Promise(resolve => setTimeout(resolve, retryDelays[i]))
    response = await fetch(url)
  }

  return response
}

export const api = {
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
}
