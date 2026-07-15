import { reactive, computed } from 'vue'

interface CartItem {
  id: string
  slug: string
  name: string
  price: number
  image: string
  quantity: number
  lockId: string
  lockedUntil: number  // epoch ms
}

interface Toast {
  id: number
  message: string
}

const stored = localStorage.getItem('cart')
const state = reactive<{ items: CartItem[]; toast: Toast | null }>({
  items: stored ? JSON.parse(stored) : [],
  toast: null,
})

const persist = () => {
  localStorage.setItem('cart', JSON.stringify(state.items))
}

function showToast(message: string) {
  state.toast = { id: Date.now(), message }
  setTimeout(() => { state.toast = null }, 4000)
}

function checkExpiredLocks() {
  const now = Date.now()
  const expired = state.items.filter(item => item.lockedUntil < now)
  if (expired.length === 0) return

  for (const item of expired) {
    state.items.splice(state.items.indexOf(item), 1)
    showToast(`Your reservation for ${item.name} has expired`)
  }
  persist()
}

// Check on init (handles page refresh after lock may have expired)
checkExpiredLocks()

// Check every 30 seconds
setInterval(checkExpiredLocks, 30_000)

export function useCart() {
  const itemCount = computed(() => state.items.reduce((sum, i) => sum + i.quantity, 0))
  const total = computed(() => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0))

  function addItem(product: Omit<CartItem, 'quantity'>) {
    const existing = state.items.find(i => i.id === product.id)
    if (existing) return  // already locked, no-op
    state.items.push({ ...product, quantity: 1 })
    persist()
  }

  function removeItem(id: string) {
    const index = state.items.findIndex(i => i.id === id)
    if (index !== -1) {
      state.items.splice(index, 1)
      persist()
    }
  }

  function clearCart() {
    state.items.splice(0)
    persist()
  }

  return {
    items: state.items,
    toast: computed(() => state.toast),
    itemCount,
    total,
    addItem,
    removeItem,
    clearCart,
  }
}
