import React, { createContext, useContext, useState } from 'react'

interface ShopContextValue {
  shopEnabled: boolean
  setShopEnabled: (val: boolean) => void
}

const ShopContext = createContext<ShopContextValue | null>(null)

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [shopEnabled, setShopEnabled] = useState(true)

  return (
    <ShopContext.Provider value={{ shopEnabled, setShopEnabled }}>
      {children}
    </ShopContext.Provider>
  )
}

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}
