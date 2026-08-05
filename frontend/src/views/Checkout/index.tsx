import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useShop } from '../../contexts/ShopContext'
import { api, OrderExpiredError, PaymentDeclinedError } from '../../services/api'
import styles from './Checkout.module.css'

declare global {
  interface Window {
    Square: {
      payments(appId: string, locationId: string): Promise<{
        card(options?: Record<string, unknown>): Promise<{
          attach(selector: string): Promise<void>
          tokenize(): Promise<{ status: string; token?: string; errors?: Array<{ message: string }> }>
        }>
      }>
    }
  }
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

const WA_TAX_RATE = 0.1025

type Step = 'form' | 'processing' | 'success' | 'expired'

export default function Checkout() {
  const navigate = useNavigate()
  const { shopEnabled } = useShop()
  const { items, clearCart } = useCart()

  const [step, setStep] = useState<Step>('form')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [cardError, setCardError] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [pickup, setPickup] = useState(false)
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [shippingLoading, setShippingLoading] = useState(true)
  const cardRef = useRef<Awaited<ReturnType<Awaited<ReturnType<typeof window.Square.payments>>['card']>> | null>(null)
  const squareInitialized = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
  })

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price, 0), [items])
  const tax = useMemo(() => (pickup || form.state === 'WA') ? Math.round(subtotal * WA_TAX_RATE * 100) / 100 : 0, [subtotal, form.state, pickup])
  const total = useMemo(() => Math.round((subtotal + tax + (pickup ? 0 : (shippingCost ?? 0))) * 100) / 100, [subtotal, tax, pickup, shippingCost])

  useEffect(() => {
    if (!shopEnabled) { navigate('/products'); return }
    if (items.length === 0 && step === 'form') { navigate('/cart'); return }

    function loadSquareSdk(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (window.Square) { resolve(); return }
        const isSandbox = import.meta.env.VITE_SQUARE_APP_ID?.startsWith('sandbox-')
        const src = isSandbox
          ? 'https://sandbox.web.squarecdn.com/v1/square.js'
          : 'https://web.squarecdn.com/v1/square.js'
        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Square SDK'))
        document.head.appendChild(script)
      })
    }

    async function initSquare() {
      if (squareInitialized.current) return
      squareInitialized.current = true
      try {
        await loadSquareSdk()
        const payments = await window.Square.payments(
          import.meta.env.VITE_SQUARE_APP_ID,
          import.meta.env.VITE_SQUARE_LOCATION_ID,
        )
        const card = await payments.card({
          style: {
            '.input-container': { borderColor: '#333333', borderRadius: '0px' },
            '.input-container.is-focus': { borderColor: '#FEFCF3' },
            '.input-container.is-error': { borderColor: '#e57373' },
            input: { backgroundColor: '#000000', color: '#FEFCF3', fontSize: '16px' },
            'input::placeholder': { color: '#555555' },
            '.message-text': { color: '#999999' },
            '.message-text.is-error': { color: '#e57373' },
            '.message-icon': { color: '#999999' },
            '.message-icon.is-error': { color: '#e57373' },
          },
        })
        await card.attach('#sq-card-element')
        cardRef.current = card
      } catch (e) {
        console.error('Square SDK init error:', e)
        setCardError('Unable to load payment form. Please refresh and try again.')
      }
    }

    async function loadShipping() {
      try {
        const { shippingCost: cost } = await api.getShippingRates({ lockIds: items.map(i => i.lockId) })
        setShippingCost(cost)
      } catch {
        setShippingCost(null)
      } finally {
        setShippingLoading(false)
      }
    }

    initSquare()
    loadShipping()
  }, [shopEnabled, items.length, navigate])

  function handleChange(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setCardError('')
    setPaymentError('')

    if (!formRef.current?.reportValidity()) return

    if (!cardRef.current) {
      setCardError('Payment form is not ready yet. Please wait a moment and try again.')
      return
    }

    if (!pickup && shippingCost === null) {
      setPaymentError('Unable to calculate shipping. Please refresh and try again.')
      return
    }

    let result: Awaited<ReturnType<typeof cardRef.current.tokenize>>
    try {
      result = await cardRef.current.tokenize()
    } catch (e) {
      setCardError('Unable to process card. Please try again.')
      return
    }

    if (result.status !== 'OK' || !result.token) {
      setCardError(result.errors?.[0]?.message ?? 'Invalid card details. Please try again.')
      return
    }

    setStep('processing')

    try {
      await api.createOrder({
        squarePaymentToken: result.token,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        pickup: pickup || undefined,
        shippingAddress: pickup ? undefined : {
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          zip: form.zip,
        },
        lockIds: items.map(i => i.lockId),
      })

      setSubmittedEmail(form.customerEmail)
      clearCart()
      setStep('success')
    } catch (err) {
      if (err instanceof OrderExpiredError) {
        setStep('expired')
      } else if (err instanceof PaymentDeclinedError) {
        setPaymentError(err.message)
        setStep('form')
      } else {
        setPaymentError('Something went wrong. Please try again.')
        setStep('form')
      }
    }
  }

  if (step === 'expired') {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.checkoutContainer}>
          <div className={styles.statusMessage}>
            <p>One or more items in your cart have expired.</p>
            <Link to="/cart" className={styles.actionBtn}>Return to Cart</Link>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.checkoutContainer}>
          <div className={styles.statusMessage}>
            <p>Order confirmed! A confirmation email has been sent to {submittedEmail}.</p>
            <Link to="/products" className={styles.actionBtn}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.checkoutContainer}>
        <div className={styles.checkoutLayout}>
          <form ref={formRef} className={styles.checkoutForm} onSubmit={submit}>
            <h2 className={styles.sectionTitle}>Contact</h2>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span>Name <span className={styles.required}>*</span></span>
                <input type="text" required value={form.customerName} onChange={e => handleChange('customerName', e.target.value)} />
              </label>
              <label className={styles.field}>
                <span>Email <span className={styles.required}>*</span></span>
                <input type="email" required value={form.customerEmail} onChange={e => handleChange('customerEmail', e.target.value)} />
              </label>
            </div>

            <h2 className={styles.sectionTitle}>Delivery</h2>
            <div className={styles.deliveryOptions}>
              <button type="button" className={`${styles.deliveryOption} ${!pickup ? styles.deliveryOptionActive : ''}`} onClick={() => setPickup(false)}>
                Ship to me
              </button>
              <button type="button" className={`${styles.deliveryOption} ${pickup ? styles.deliveryOptionActive : ''}`} onClick={() => setPickup(true)}>
                Local pickup — Ballard, Seattle
              </button>
            </div>

            {pickup && (
              <p className={styles.pickupNote}>Pickup details will be provided via email — please make sure to enter a valid email address.</p>
            )}

            {!pickup && (
              <>
                <label className={styles.field}>
                  <span>Address Line 1 <span className={styles.required}>*</span></span>
                  <input type="text" required value={form.line1} onChange={e => handleChange('line1', e.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Address Line 2 (optional)</span>
                  <input type="text" value={form.line2} onChange={e => handleChange('line2', e.target.value)} />
                </label>
                <div className={styles.fieldRow}>
                  <label className={styles.field}>
                    <span>City <span className={styles.required}>*</span></span>
                    <input type="text" required value={form.city} onChange={e => handleChange('city', e.target.value)} />
                  </label>
                  <label className={`${styles.field} ${styles.fieldSm}`}>
                    <span>State <span className={styles.required}>*</span></span>
                    <select required value={form.state} onChange={e => handleChange('state', e.target.value)}>
                      <option value="" disabled>—</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className={`${styles.field} ${styles.fieldSm}`}>
                    <span>Zip <span className={styles.required}>*</span></span>
                    <input type="text" pattern="^\d{5}(-\d{4})?$" required placeholder="12345" value={form.zip} onChange={e => handleChange('zip', e.target.value)} />
                  </label>
                </div>
              </>
            )}

            <h2 className={styles.sectionTitle}>Payment</h2>
            <div id="sq-card-element" className={styles.sqCardElement}></div>
            {cardError && <p className={styles.fieldError}>{cardError}</p>}
            {paymentError && <p className={styles.fieldError}>{paymentError}</p>}

            <button type="submit" className={styles.submitBtn} disabled={step === 'processing' || (!pickup && shippingLoading)}>
              {step === 'processing' || (!pickup && shippingLoading) ? <span className={styles.spinner} /> : `Place Order — $${total.toFixed(2)}`}
            </button>
          </form>

          <div className={styles.orderSummary}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            <div className={styles.summaryItems}>
              {items.map(item => (
                <div key={item.id} className={styles.summaryItem}>
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className={styles.summaryLine}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryLine}>
              <span>Tax{form.state === 'WA' ? ' (WA 10.25%)' : ''}</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className={styles.summaryLine}>
              <span>Shipping</span>
              <span>{pickup ? 'Free' : shippingLoading ? '...' : shippingCost !== null ? `$${shippingCost.toFixed(2)}` : '—'}</span>
            </div>
            <div className={`${styles.summaryLine} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
