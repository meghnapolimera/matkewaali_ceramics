import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import styles from './Footer.module.css'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.subscribe(email)
      setSubscribed(true)
      setEmail('')
    } catch {
      // silent — non-critical
    }
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerNewsletter}>
          <p className={styles.footerLabel}>Subscribe for updates</p>
          {!subscribed ? (
            <form onSubmit={handleSubmit} className={styles.subscriptionForm}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className={styles.emailInput}
              />
              <button type="submit" className={styles.submitButton}>Sign up</button>
            </form>
          ) : (
            <p className={styles.subscribedMsg}>You're subscribed!</p>
          )}
        </div>

        <div className={styles.footerLinks}>
          <Link to="/contact" className={styles.footerLink}>Contact</Link>
          <span className={styles.footerDivider}>·</span>
          <Link to="/faq" className={styles.footerLink}>FAQ</Link>
          <span className={styles.footerDivider}>·</span>
          <Link to="/terms" className={styles.footerLink}>T&amp;C</Link>
          <span className={styles.footerDivider}>·</span>
          <a href="https://www.instagram.com/matkewaali/" target="_blank" rel="noopener noreferrer" className={`${styles.footerLink} ${styles.footerIg}`}>
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </footer>
  )
}
