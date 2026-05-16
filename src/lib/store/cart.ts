'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
  discountAmount: number
  discountCode: string | null
  applyDiscount: (code: string, amount: number) => void
  removeDiscount: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      discountAmount: 0,
      discountCode: null,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product, quantity }] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [], discountAmount: 0, discountCode: null }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => {
          const price = i.product.discount_price ?? i.product.price
          return sum + price * i.quantity
        }, 0),

      applyDiscount: (code, amount) => set({ discountCode: code, discountAmount: amount }),

      removeDiscount: () => set({ discountCode: null, discountAmount: 0 }),
    }),
    {
      name: 'toko-cart',
    }
  )
)
