import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, type Product, NotFoundError, ApiError, LockConflictError } from '../../services/api'
import { useCart } from '../../contexts/CartContext'
import { useShop } from '../../contexts/ShopContext'
import styles from './ProductDetail.module.css'

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
            <img src={p.imageUrl} alt={p.name} className={styles.otherImg} />
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
  const { items, addItem, expiredVersion } = useCart()
  const inCart = items.some(i => i.slug === slug)

  async function loadProduct() {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    setError(false)
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

  async function addToCart() {
    if (!product) return
    try {
      const { lockId, expiresAt } = await api.createLock(product.slug)
      addItem({
        id: product.slug,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        lockId,
        lockedUntil: expiresAt * 1000,
      })
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

  return (
    <div className={styles.productDetail}>
      <div className={styles.productContainer}>
        <div className={styles.productImage}>
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        </div>

        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productPrice}>${product.price}</p>

          {product.description && (
            <p className={styles.productDescription}>{product.description}</p>
          )}

          {(product.height || product.width || product.volume) && (
            <div className={styles.productDetails}>
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
          ) : inCart ? (
            <button className={styles.soldOutBtn} disabled>In your cart</button>
          ) : product.soldOut || unavailable ? (
            <button className={styles.soldOutBtn} disabled>Sold Out</button>
          ) : (
            <button className={styles.addToCart} onClick={addToCart}>Add to Cart</button>
          )}
        </div>
      </div>
      {slug && <OtherProducts currentSlug={slug} />}
    </div>
  )
}
