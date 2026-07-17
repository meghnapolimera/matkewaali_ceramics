import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useShop } from '../../contexts/ShopContext'
import { api } from '../../services/api'
import styles from './Cart.module.css'

export default function Cart() {
  const navigate = useNavigate()
  const { shopEnabled } = useShop()
  const { items, total, removeItem } = useCart()

  function formatExpiry(lockedUntil: number): string {
    return new Date(lockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function handleRemove(item: { id: string; lockId: string }) {
    api.releaseLock(item.lockId)
    removeItem(item.id)
  }

  if (items.length === 0) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.cartContainer}>
          <div className={styles.cartEmpty}>
            <p>Your cart is empty.</p>
            <Link to="/products" className={styles.continueLink}>Continue shopping</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.cartContainer}>
        <div className={styles.cartItems}>
          {items.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                <img src={item.image} alt={item.name} />
              </div>
              <div className={styles.itemDetails}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemPrice}>${item.price}</span>
                <span className={styles.itemExpires}>Reserved until {formatExpiry(item.lockedUntil)}</span>
              </div>
              <div className={styles.itemTotal}>${item.price}</div>
              <button className={styles.removeBtn} onClick={() => handleRemove(item)}>✕</button>
            </div>
          ))}
        </div>

        <div className={styles.cartFooter}>
          <div className={styles.cartTotal}>
            <span>Total</span>
            <span>${total}</span>
          </div>
          {!shopEnabled ? (
            <p className={styles.shopClosedNote}>Shop is currently closed — checkout is unavailable.</p>
          ) : (
            <button className={styles.checkoutBtn} onClick={() => navigate('/checkout')}>Checkout</button>
          )}
        </div>
      </div>
    </div>
  )
}
