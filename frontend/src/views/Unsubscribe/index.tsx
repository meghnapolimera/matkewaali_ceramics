import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'
import styles from './Unsubscribe.module.css'

export default function Unsubscribe() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [status, setStatus] = useState<'pending' | 'done' | 'error'>('pending')

  useEffect(() => {
    if (!email) { setStatus('error'); return }
    api.unsubscribe(email)
      .then(() => setStatus('done'))
      .catch(() => setStatus('error'))
  }, [email])

  return (
    <div className={styles.page}>
      {status === 'pending' && <p>Unsubscribing...</p>}
      {status === 'done' && (
        <>
          <p>You've been unsubscribed from Matkewaali Ceramics.</p>
          <p className={styles.sub}>You won't receive any further emails from us.</p>
        </>
      )}
      {status === 'error' && (
        <p>Something went wrong. Please try again or contact us directly.</p>
      )}
    </div>
  )
}
