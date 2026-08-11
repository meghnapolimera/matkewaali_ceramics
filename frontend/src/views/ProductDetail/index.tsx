import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, type Product, NotFoundError, ApiError, LockConflictError } from '../../services/api'
import { useCart } from '../../contexts/CartContext'
import { useShop } from '../../contexts/ShopContext'
import styles from './ProductDetail.module.css'
import { usePageMeta, type ProductMeta } from '../../hooks/usePageMeta'

function OtherProducts({ currentSlug }: { currentSlug: string }) {
  const [others, setOthers] = useState<Product[]>([])

  useEffect(() => {
    api.getProducts().then(data => {
      setOthers(data.filter(p => p.slug !== currentSlug && !p.soldOut))
    }).catch(() => {})
  }, [currentSlug])

  if (others.length === 0) return null

  return (
    <div className={styles.otherProducts}>
      <h2 className={styles.otherTitle}>More from the shop</h2>
      <div className={styles.otherScroll}>
        {others.map(p => (
          <Link key={p.slug} to={`/products/${p.slug}`} className={styles.otherCard}>
            <img src={p.images?.[0] ?? p.imageUrl} alt={p.altText ?? p.name} className={styles.otherImg} />
            <div className={styles.otherInfo}>
              <span className={styles.otherName}>{p.name}</span>
              <span className={styles.otherPrice}>${p.price}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { shopEnabled } = useShop()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const { items, addItem, removeItem, expiredVersion } = useCart()
  const inCartCount = items.filter(i => i.slug === slug).length

  const images = product ? (product.images ?? [product.imageUrl]) : []

  const productMeta: ProductMeta | undefined = product ? {
    name: product.name,
    description: `${product.description} Individually handmade in Seattle, WA.`,
    image: images[0] ?? product.imageUrl,
    price: product.price,
    availability: product.soldOut ? 'OutOfStock' : 'InStock',
    url: `https://matkewaali.com/products/${product.slug}`,
  } : undefined

  usePageMeta(
    product ? `${product.name} — Handmade Ceramics | Matkewaali Seattle` : 'Matkewaali Ceramics',
    product ? `${product.description} Individually handmade in Seattle, WA.` : '',
    images[0],
    productMeta,
  )

  async function loadProduct() {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    setError(false)
    setActiveIndex(0)
    try {
      const data = await api.getProduct(slug)
      setProduct(data)
    } catch (e) {
      if (e instanceof NotFoundError) {
        setNotFound(true)
      } else if (e instanceof ApiError) {
        setError(true)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProduct()
  }, [slug, expiredVersion])

  function removeOneFromCart() {
    const item = items.find(i => i.slug === slug)
    if (!item) return
    api.releaseLock(item.lockId)
    removeItem(item.id)
    setUnavailable(false)
    setProduct(p => p ? { ...p, quantity: p.quantity + 1 } : p)
  }

  async function addToCart() {
    if (!product) return
    try {
      const { lockId, expiresAt } = await api.createLock(product.slug)
      addItem({
        id: lockId,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: images[0] ?? product.imageUrl,
        lockId,
        lockedUntil: expiresAt * 1000,
      })
      setProduct(p => p ? { ...p, quantity: p.quantity - 1 } : p)
      api.recordEvent('add_to_cart', { slug: product.slug })
    } catch (e) {
      if (e instanceof LockConflictError) {
        setUnavailable(true)
      }
    }
  }

  if (loading) {
    return (
      <div className={styles.productDetail}>
        <div className={styles.statusMessage}>
          <span className={styles.spinner}></span>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className={styles.productDetail}>
        <div className={styles.statusMessage}>
          <h1>404</h1>
          <p>This product doesn't exist or may have been removed.</p>
          <Link to="/products" className={styles.backLink}>Back to Shop</Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.productDetail}>
        <div className={styles.statusMessage}>
          <p>Something went wrong. Please try again.</p>
          <button className={styles.retryBtn} onClick={loadProduct}>Retry</button>
        </div>
      </div>
    )
  }

  if (!product) return null

  const hasMultiple = images.length > 1

  return (
    <div className={styles.productDetail}>
      <div className={styles.productContainer}>
        <div className={styles.productImage}>
          <div className={styles.mainImageWrap}>
            {hasMultiple && (
              <button
                className={`${styles.arrow} ${styles.arrowLeft}`}
                onClick={() => setActiveIndex(i => (i - 1 + images.length) % images.length)}
                aria-label="Previous image"
              >&#8249;</button>
            )}
            <img src={images[activeIndex]} alt={product.altText ?? product.name} loading="lazy" />
            {hasMultiple && (
              <button
                className={`${styles.arrow} ${styles.arrowRight}`}
                onClick={() => setActiveIndex(i => (i + 1) % images.length)}
                aria-label="Next image"
              >&#8250;</button>
            )}
          </div>
          {hasMultiple && (
            <div className={styles.thumbnails}>
              {images.map((src, i) => (
                <button
                  key={i}
                  className={`${styles.thumbnail} ${i === activeIndex ? styles.thumbnailActive : ''}`}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productPrice}>${product.price}</p>

          {product.description && (
            <p className={styles.productDescription}>{product.description}</p>
          )}

          {(product.height || product.width || product.volume) && (
            <div className={styles.productDetails}>
              {product.depth && <p className={styles.detailItem}>Depth: {product.depth}</p>}
              {product.height && <p className={styles.detailItem}>Height: {product.height}</p>}
              {product.width && <p className={styles.detailItem}>Width: {product.width}</p>}
              {product.volume && <p className={styles.detailItem}>Volume: {product.volume}</p>}
            </div>
          )}

          <div className={styles.productNotes}>
            <p>All items are individually handmade, please allow variations between them and the images displayed</p>
            <p>All items are food and dishwasher safe, however hand wash with care is highly recommended</p>
          </div>

          {!shopEnabled ? (
            <button className={styles.soldOutBtn} disabled>Shop is currently closed</button>
          ) : product.soldOut ? (
            <button className={styles.soldOutBtn} disabled>Unavailable</button>
          ) : inCartCount > 0 ? (
            <div className={styles.quantityControl}>
              <button className={styles.qtyBtn} onClick={removeOneFromCart}>−</button>
              <span className={styles.qtyCount}>{inCartCount}</span>
              <button className={styles.qtyBtn} onClick={addToCart} disabled={unavailable || product.quantity <= 0}>+</button>
            </div>
          ) : unavailable || product.quantity <= 0 ? (
            <button className={styles.soldOutBtn} disabled>Unavailable</button>
          ) : (
            <button className={styles.addToCart} onClick={addToCart}>Add to Cart</button>
          )}
          <Link to="/products" className={styles.backToShop}>← Go to Shop</Link>
        </div>
      </div>
      {slug && <OtherProducts currentSlug={slug} />}
    </div>
  )
}
