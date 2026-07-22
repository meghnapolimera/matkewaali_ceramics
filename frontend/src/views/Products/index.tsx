import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, type Product, ApiError } from '../../services/api'
import { useShop } from '../../contexts/ShopContext'
import { useCart } from '../../contexts/CartContext'
import styles from './Products.module.css'

export default function Products() {
  const { shopEnabled } = useShop()
  const { items, expiredVersion } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function fetchProducts() {
    setLoading(true)
    setError(false)
    try {
      const data = await api.getProducts()
      setProducts(data)
    } catch (e) {
      if (e instanceof ApiError) {
        setError(true)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [expiredVersion])

  if (loading) {
    return (
      <div className={styles.productsPage}>
        <div className={styles.statusMessage}>
          <span className={styles.spinner}></span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.productsPage}>
        <div className={styles.statusMessage}>
          <p>Unable to load products, please try again.</p>
          <button className={styles.retryBtn} onClick={fetchProducts}>Retry</button>
        </div>
      </div>
    )
  }

  if (!shopEnabled || products.length === 0) {
    return (
      <div className={styles.productsPage}>
        <div className={styles.statusMessage}>
          <p>Shop is currently closed.</p>
          <p className={styles.closedSub}>Have a request? <Link to="/contact" className={styles.contactLink}>Get in touch</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.productsPage}>
      <div className={styles.productsGrid}>
        {products.slice().sort((a, b) => {
          const aUnavailable = a.soldOut && !items.some(i => i.slug === a.slug)
          const bUnavailable = b.soldOut && !items.some(i => i.slug === b.slug)
          return (aUnavailable ? 1 : 0) - (bUnavailable ? 1 : 0)
        }).map(product => (
          <Link
            key={product.slug}
            to={`/products/${product.slug}`}
            className={styles.productCard}
          >
            <div className={`${styles.productThumbnail}${product.soldOut && !items.some(i => i.slug === product.slug) ? ` ${styles.isSoldOut}` : ''}`}>
              <img src={product.imageUrl} alt={product.name} />
              {items.some(i => i.slug === product.slug)
                ? <div className={styles.soldOutBadge}>In your cart</div>
                : product.soldOut && <div className={styles.soldOutBadge}>Unavailable</div>
              }
            </div>
            <div className={styles.productInfo}>
              <span className={styles.productName}>{product.name}</span>
              <span className={styles.productPrice}>${product.price}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
