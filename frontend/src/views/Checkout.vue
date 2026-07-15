<template>
  <div class="checkout-page">
    <div class="checkout-container">

      <!-- Expired -->
      <div v-if="step === 'expired'" class="status-message">
        <p>One or more items in your cart have expired.</p>
        <router-link to="/cart" class="action-btn">Return to Cart</router-link>
      </div>

      <!-- Success -->
      <div v-else-if="step === 'success'" class="status-message">
        <p>Order confirmed! A confirmation email has been sent to {{ submittedEmail }}.</p>
        <router-link to="/products" class="action-btn">Continue Shopping</router-link>
      </div>

      <!-- Form -->
      <div v-else class="checkout-layout">
        <form ref="formEl" class="checkout-form" @submit.prevent="submit">
          <h2 class="section-title">Contact</h2>
          <div class="field-row">
            <label class="field">
              <span>Name</span>
              <input v-model="form.customerName" type="text" required />
            </label>
            <label class="field">
              <span>Email</span>
              <input v-model="form.customerEmail" type="email" required />
            </label>
          </div>

          <h2 class="section-title">Shipping Address</h2>
          <label class="field">
            <span>Address Line 1</span>
            <input v-model="form.line1" type="text" required />
          </label>
          <label class="field">
            <span>Address Line 2 (optional)</span>
            <input v-model="form.line2" type="text" />
          </label>
          <div class="field-row">
            <label class="field">
              <span>City</span>
              <input v-model="form.city" type="text" required />
            </label>
            <label class="field field--sm">
              <span>State</span>
              <select v-model="form.state" required>
                <option value="" disabled>—</option>
                <option v-for="s in US_STATES" :key="s" :value="s">{{ s }}</option>
              </select>
            </label>
            <label class="field field--sm">
              <span>Zip</span>
              <input v-model="form.zip" type="text" pattern="^\d{5}(-\d{4})?$" required placeholder="12345" />
            </label>
          </div>

          <h2 class="section-title">Payment</h2>
          <div id="sq-card-element" class="sq-card-element" :class="{ 'sq-card-element--ready': cardMounted }"></div>
          <p v-if="cardError" class="field-error">{{ cardError }}</p>
          <p v-if="paymentError" class="field-error">{{ paymentError }}</p>

          <button type="submit" class="submit-btn" :disabled="step === 'processing'">
            <span v-if="step === 'processing'" class="spinner"></span>
            <template v-else>Place Order — ${{ total.toFixed(2) }}</template>
          </button>
        </form>

        <div class="order-summary">
          <h2 class="section-title">Order Summary</h2>
          <div class="summary-items">
            <div v-for="item in items" :key="item.id" class="summary-item">
              <span>{{ item.name }}</span>
              <span>${{ item.price.toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-line">
            <span>Subtotal</span>
            <span>${{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-line">
            <span>Tax{{ form.state === 'WA' ? ' (WA 10.25%)' : '' }}</span>
            <span>${{ tax.toFixed(2) }}</span>
          </div>
          <div class="summary-line summary-total">
            <span>Total</span>
            <span>${{ total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/stores/cart'
import { useShop } from '@/stores/shop'
import { api, OrderExpiredError, PaymentDeclinedError } from '@/services/api'

const { shopEnabled } = useShop()
watch(shopEnabled, (val) => { if (!val) router.push('/products') })

declare global {
  interface Window {
    Square: {
      payments(appId: string, locationId: string): Promise<{
        card(options?: Record<string, unknown>): Promise<{ attach(selector: string): Promise<void>; tokenize(): Promise<{ status: string; token?: string; errors?: Array<{ message: string }> }> }>
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

const router = useRouter()
const { items, clearCart } = useCart()

const step = ref<'form' | 'processing' | 'success' | 'expired'>('form')
const submittedEmail = ref('')
const cardError = ref('')
const paymentError = ref('')
const cardMounted = ref(false)
const formEl = ref<HTMLFormElement | null>(null)

const form = ref({
  customerName: '',
  customerEmail: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  zip: '',
})

const subtotal = computed(() => items.reduce((sum, i) => sum + i.price, 0))
const tax = computed(() => form.value.state === 'WA' ? Math.round(subtotal.value * WA_TAX_RATE * 100) / 100 : 0)
const total = computed(() => Math.round((subtotal.value + tax.value) * 100) / 100)

let card: Awaited<ReturnType<Awaited<ReturnType<typeof window.Square.payments>>['card']>> | null = null

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

onMounted(async () => {
  if (!shopEnabled.value) {
    router.push('/products')
    return
  }
  if (items.length === 0) {
    router.push('/cart')
    return
  }

  try {
    await loadSquareSdk()
    const payments = await window.Square.payments(
      import.meta.env.VITE_SQUARE_APP_ID,
      import.meta.env.VITE_SQUARE_LOCATION_ID,
    )
    card = await payments.card({
      style: {
        '.input-container': {
          borderColor: '#333333',
          borderRadius: '0px',
        },
        '.input-container.is-focus': {
          borderColor: '#FEFCF3',
        },
        '.input-container.is-error': {
          borderColor: '#e57373',
        },
        input: {
          backgroundColor: '#000000',
          color: '#FEFCF3',
          fontSize: '16px',
        },
        'input::placeholder': {
          color: '#555555',
        },
        '.message-text': {
          color: '#999999',
        },
        '.message-text.is-error': {
          color: '#e57373',
        },
        '.message-icon': {
          color: '#999999',
        },
        '.message-icon.is-error': {
          color: '#e57373',
        },
      },
    })
    await card.attach('#sq-card-element')
    cardMounted.value = true
  } catch (e) {
    console.error('Square SDK init error:', e)
    cardError.value = 'Unable to load payment form. Please refresh and try again.'
  }
})

async function submit() {
  cardError.value = ''
  paymentError.value = ''

  if (!formEl.value?.reportValidity()) return

  if (!card) {
    cardError.value = 'Payment form is not ready yet. Please wait a moment and try again.'
    return
  }

  let result: Awaited<ReturnType<typeof card.tokenize>>
  try {
    result = await card.tokenize()
  } catch (e) {
    cardError.value = 'Unable to process card. Please try again.'
    console.error('Square tokenize error:', e)
    return
  }

  if (result.status !== 'OK' || !result.token) {
    cardError.value = result.errors?.[0]?.message ?? 'Invalid card details. Please try again.'
    return
  }

  step.value = 'processing'

  try {
    await api.createOrder({
      squarePaymentToken: result.token,
      customerName: form.value.customerName,
      customerEmail: form.value.customerEmail,
      shippingAddress: {
        line1: form.value.line1,
        line2: form.value.line2 || undefined,
        city: form.value.city,
        state: form.value.state,
        zip: form.value.zip,
      },
      lockIds: items.map(i => i.lockId),
    })

    submittedEmail.value = form.value.customerEmail
    clearCart()
    step.value = 'success'
  } catch (e) {
    if (e instanceof OrderExpiredError) {
      step.value = 'expired'
    } else if (e instanceof PaymentDeclinedError) {
      paymentError.value = e.message
      step.value = 'form'
    } else {
      paymentError.value = 'Something went wrong. Please try again.'
      step.value = 'form'
    }
  }
}
</script>

<style scoped>
.checkout-page {
  min-height: calc(100vh - 20vh);
  background-color: black;
  padding: 0 36px 60px;
}

.checkout-container {
  max-width: 1000px;
  margin: 0 auto;
}

.status-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 80px 20px;
  color: #FEFCF3;
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 200;
  text-align: center;
}

.action-btn {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 1px;
  color: #FEFCF3;
  background-color: black;
  border: 1px solid #FEFCF3;
  padding: 10px 28px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.action-btn:hover {
  background-color: #FEFCF3;
  color: black;
}

.checkout-layout {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

@media (min-width: 768px) {
  .checkout-layout {
    flex-direction: row;
    align-items: flex-start;
    gap: 60px;
  }

  .checkout-form {
    flex: 1;
  }

  .order-summary {
    width: 280px;
    flex-shrink: 0;
    position: sticky;
    top: 24vh;
  }
}

.section-title {
  font-family: "Dosis", sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  letter-spacing: 2px;
  color: #999;
  text-transform: uppercase;
  margin: 32px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #222;
}

.checkout-form .section-title:first-child {
  margin-top: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  width: 100%;
}

.field span {
  font-family: "Dosis", sans-serif;
  font-size: 0.85rem;
  font-weight: 200;
  color: #999;
  letter-spacing: 0.5px;
}

.field input,
.field select {
  background: transparent;
  border: 1px solid #333;
  color: #FEFCF3;
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 200;
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.field input:focus,
.field select:focus {
  border-color: #FEFCF3;
}

.field select option {
  background-color: #111;
  color: #FEFCF3;
}

.field-row {
  display: flex;
  gap: 16px;
}

.field--sm {
  flex: 0 0 100px;
}

.sq-card-element {
  margin-bottom: 8px;
}

.sq-card-element--ready {
}

.field-error {
  font-family: "Dosis", sans-serif;
  font-size: 0.9rem;
  font-weight: 200;
  color: #e57373;
  margin: 0 0 16px;
}

.submit-btn {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 1.5px;
  color: #FEFCF3;
  background-color: black;
  border: 1px solid #FEFCF3;
  padding: 10px 28px;
  width: 100%;
  cursor: pointer;
  margin-top: 0;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #FEFCF3;
  color: black;
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.spinner {
  display: block;
  width: 16px;
  height: 16px;
  border: 1px solid #666;
  border-top-color: #FEFCF3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.order-summary .section-title {
  margin-top: 0;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 200;
  color: #FEFCF3;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  font-family: "Dosis", sans-serif;
  font-size: 0.95rem;
  font-weight: 200;
  color: #999;
  padding: 6px 0;
  border-top: 1px solid #222;
}

.summary-total {
  color: #FEFCF3;
  font-size: 1rem;
  font-weight: 300;
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
