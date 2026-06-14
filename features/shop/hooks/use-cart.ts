"use client"

import { useCallback, useSyncExternalStore } from "react"
import {
  addToCart as addLine,
  clearCart as clearStoredCart,
  getCartCountSnapshot,
  getCartSnapshot,
  getServerCartCountSnapshot,
  getServerCartSnapshot,
  removeFromCart as removeLine,
  setCartQuantity as setLineQuantity,
  subscribeCart,
} from "@/features/shop/cart-storage"

export function useCart() {
  const items = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  )
  const count = useSyncExternalStore(
    subscribeCart,
    getCartCountSnapshot,
    getServerCartCountSnapshot,
  )

  const addToCart = useCallback((productId: string, quantity = 1) => {
    addLine(productId, quantity)
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLineQuantity(productId, quantity)
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    removeLine(productId)
  }, [])

  const clearCart = useCallback(() => {
    clearStoredCart()
  }, [])

  return { items, count, addToCart, setQuantity, removeFromCart, clearCart }
}
