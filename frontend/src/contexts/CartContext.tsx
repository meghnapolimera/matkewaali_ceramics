import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'

export interface CartItem {
  id: string
  slug: string
  name: string
  price: number
  image: string
  quantity: number
  lockId: string
  lockedUntil: number
}

interface Toast {
  id: number
  message: string
}

interface CartState {
  items: CartItem[]
  toast: Toast | null
  expiredVersion: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_TOAST'; payload: Toast | null }
  | { type: 'REMOVE_EXPIRED'; payload: string[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) return state
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'SET_TOAST':
      return { ...state, toast: action.payload }
    case 'REMOVE_EXPIRED':
      return { ...state, items: state.items.filter(i => !action.payload.includes(i.id)), expiredVersion: state.expiredVersion + 1 }
    default:
      return state
  }
}

function loadInitialState(): CartState {
  try {
    const stored = localStorage.getItem('cart')
    return { items: stored ? JSON.parse(stored) : [], toast: null, expiredVersion: 0 }
  } catch {
    return { items: [], toast: null, expiredVersion: 0 }
  }
}

interface CartContextValue {
  items: CartItem[]
  toast: Toast | null
  itemCount: number
  total: number
  expiredVersion: number
  addItem: (product: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const itemsRef = useRef<CartItem[]>(state.items)

  useEffect(() => {
    itemsRef.current = state.items
  }, [state.items])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items))
  }, [state.items])

  function showToast(message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    dispatch({ type: 'SET_TOAST', payload: { id: Date.now(), message } })
    toastTimerRef.current = setTimeout(() => {
      dispatch({ type: 'SET_TOAST', payload: null })
    }, 4000)
  }

  function checkExpiredLocks(items: CartItem[]) {
    const now = Date.now()
    const expired = items.filter(item => item.lockedUntil < now)
    if (expired.length === 0) return
    dispatch({ type: 'REMOVE_EXPIRED', payload: expired.map(i => i.id) })
    expired.forEach(item => showToast(`Your reservation for ${item.name} has expired`))
  }

  useEffect(() => {
    checkExpiredLocks(state.items)
    const interval = setInterval(() => {
      checkExpiredLocks(itemsRef.current)
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  function addItem(product: Omit<CartItem, 'quantity'>) {
    dispatch({ type: 'ADD_ITEM', payload: product })
  }

  function removeItem(id: string) {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  function clearCart() {
    dispatch({ type: 'CLEAR_CART' })
  }

  return (
    <CartContext.Provider value={{ items: state.items, toast: state.toast, itemCount, total, expiredVersion: state.expiredVersion, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
