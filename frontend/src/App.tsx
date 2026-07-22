import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import { useCart } from './contexts/CartContext'
import { useShop } from './contexts/ShopContext'
import { api } from './services/api'

export default function App() {
  const { toast, itemCount } = useCart()
  const { setShopEnabled } = useShop()

  useEffect(() => {
    api.getConfig().then(config => {
      setShopEnabled(config.shopEnabled)
    })
  }, [setShopEnabled])

  return (
    <div id="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop />
      <div className="shipping-banner">Currently shipping to the United States only.</div>
      <Header />
      {itemCount > 0 && (
        <div className="cart-expiry-banner">
          Items in your cart are held for 15 minutes — complete checkout before your reservation expires.
        </div>
      )}
      <Outlet />
      <Footer />
      {toast && (
        <div className="toast">{toast.message}</div>
      )}
    </div>
  )
}
