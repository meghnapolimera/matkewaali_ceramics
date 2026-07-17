import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import productsData from '../../data/products.json'
import styles from './PrintCards.module.css'

const logoUrl = `${import.meta.env.VITE_ASSETS_BASE_URL}/matkewaali_ceramics_black_logo.png`

export default function PrintCards() {
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({})

  useEffect(() => {
    productsData.forEach(product => {
      const canvas = canvasRefs.current[product.id]
      if (canvas) {
        const url = `https://www.matkewaali.com/products/${product.slug}`
        QRCode.toCanvas(canvas, url, {
          width: 95,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' },
        })
      }
    })
  }, [])

  return (
    <div className={styles.printCards}>
      {productsData.map(product => (
        <div key={product.id} className={styles.card}>
          <div className={styles.cardFront}>
            <h2 className={styles.productName}>{product.name.toUpperCase()}</h2>
            <canvas
              ref={el => { canvasRefs.current[product.id] = el }}
              className={styles.qrCode}
            />
          </div>
          <div className={styles.cardBack}>
            <img src={logoUrl} alt="Matkewaali Ceramics" className={styles.logo} />
            <div className={styles.contactInfo}>
              <p className={styles.artistName}>Meghna Polimera</p>
              <p className={styles.contactDetail}>meghnapolimera@matkewaali.com</p>
              <p className={styles.contactDetail}>@matkewaali</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
