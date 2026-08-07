import { useEffect } from 'react'

const DEFAULT_OG_IMAGE = `${window.location.origin}/og-image.jpeg`

function setMeta(property: string, content: string, useProperty = false) {
  const selector = useProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`
  let tag = document.querySelector<HTMLMetaElement>(selector)
  if (!tag) {
    tag = document.createElement('meta')
    if (useProperty) tag.setAttribute('property', property)
    else tag.name = property
    document.head.appendChild(tag)
  }
  tag.content = content
}

function setCanonical(url: string) {
  let tag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!tag) {
    tag = document.createElement('link')
    tag.rel = 'canonical'
    document.head.appendChild(tag)
  }
  tag.href = url
}

function setJsonLd(data: object | null) {
  let tag = document.querySelector<HTMLScriptElement>('script[data-type="product-ld"]')
  if (!data) {
    tag?.remove()
    return
  }
  if (!tag) {
    tag = document.createElement('script')
    tag.type = 'application/ld+json'
    tag.setAttribute('data-type', 'product-ld')
    document.head.appendChild(tag)
  }
  tag.textContent = JSON.stringify(data)
}

export interface ProductMeta {
  name: string
  description: string
  image: string
  price: number
  availability: 'InStock' | 'OutOfStock'
  url: string
}

export function usePageMeta(title: string, description: string, image?: string, product?: ProductMeta) {
  useEffect(() => {
    const ogImage = image ?? DEFAULT_OG_IMAGE
    const canonical = `${window.location.origin}${window.location.pathname}`

    document.title = title
    setMeta('description', description)
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:image', ogImage, true)
    setMeta('og:type', product ? 'product' : 'website', true)
    setMeta('og:url', canonical, true)
    setCanonical(canonical)

    setJsonLd(product ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image,
      url: product.url,
      brand: { '@type': 'Brand', name: 'Matkewaali Ceramics' },
      offers: {
        '@type': 'Offer',
        price: product.price.toFixed(2),
        priceCurrency: 'USD',
        availability: `https://schema.org/${product.availability}`,
        url: product.url,
      },
    } : null)
  }, [title, description, image, product])
}
