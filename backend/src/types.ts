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
}

export interface ProductResponse extends Product {
  soldOut: boolean
}
