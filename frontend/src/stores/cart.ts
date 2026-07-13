import { reactive, computed } from 'vue'

interface CartItem {
  id: string
  slug: string
  name: string
  price: number
  image: string
  quantity: number
}

const stored = localStorage.getItem('cart')
const state = reactive<{ items: CartItem[] }>({
  items: stored ? JSON.parse(stored) : []
})

const persist = () => {
  localStorage.setItem('cart', JSON.stringify(state.items))
}

export function useCart() {
  const itemCount = computed(() => state.items.reduce((sum, i) => sum + i.quantity, 0))
  const total = computed(() => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0))

  function addItem(product: Omit<CartItem, 'quantity'>) {
    const existing = state.items.find(i => i.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      state.items.push({ ...product, quantity: 1 })
    }
    persist()
  }

  function removeItem(id: string) {
    const index = state.items.findIndex(i => i.id === id)
    if (index !== -1) {
      state.items.splice(index, 1)
      persist()
    }
  }

  function updateQuantity(id: string, quantity: number) {
    const item = state.items.find(i => i.id === id)
    if (item) {
      if (quantity <= 0) {
        removeItem(id)
      } else {
        item.quantity = quantity
        persist()
      }
    }
  }

  function clearCart() {
    state.items.splice(0)
    persist()
  }

  return { items: state.items, itemCount, total, addItem, removeItem, updateQuantity, clearCart }
}
