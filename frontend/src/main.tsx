import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import { ShopProvider } from './contexts/ShopContext'
import App from './App'
import Home from './views/Home'
import About from './views/About'
import Contact from './views/Contact'
import FAQ from './views/FAQ'
import Products from './views/Products'
import ProductDetail from './views/ProductDetail'
import Cart from './views/Cart'
import Checkout from './views/Checkout'
import Terms from './views/Terms'
import Stories from './views/Stories'
import Story from './views/Story'
import Unsubscribe from './views/Unsubscribe'
import './assets/global.css'
import './assets/app.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'faq', element: <FAQ /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:slug', element: <ProductDetail /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'terms', element: <Terms /> },
      { path: 'stories', element: <Stories /> },
      { path: 'stories/:slug', element: <Story /> },
      { path: 'unsubscribe', element: <Unsubscribe /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ShopProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </ShopProvider>
  </React.StrictMode>,
)
