import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import styles from './Header.module.css'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { itemCount } = useCart()
  const assetsBaseUrl = import.meta.env.VITE_ASSETS_BASE_URL

  function toggleMenu() {
    setIsMenuOpen(prev => !prev)
  }

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <header>
      <div className={styles.logo}>
        <Link to="/">
          <img src={`${assetsBaseUrl}/matkewaali_ceramics_white_logo.png`} alt="Matkewaali Ceramics" />
        </Link>
      </div>
      <div className={styles.menuContainer}>
        <div className={styles.hamburger} onClick={toggleMenu}>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </div>
        <nav className={isMenuOpen ? styles.navActive : ''}>
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/products" onClick={closeMenu}>Shop</NavLink>
          <NavLink to="/about" onClick={closeMenu}>About</NavLink>
        </nav>
        <Link to="/cart" className={styles.cartIcon}>
          <i className="fas fa-shopping-cart"></i>
          {itemCount > 0 && <span className={styles.cartCount}>{itemCount}</span>}
        </Link>
      </div>
    </header>
  )
}
