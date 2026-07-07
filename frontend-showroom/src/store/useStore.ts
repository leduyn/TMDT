import { create } from 'zustand'
import type { ProductDTO } from '@/types'

interface CartItem {
  product: ProductDTO
  quantity: number
}

interface StoreState {
  cart: CartItem[]
  loading: boolean

  addToCart: (product: ProductDTO) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  setLoading: (loading: boolean) => void
  cartCount: () => number
  cartTotal: () => number
}

export const useStore = create<StoreState>((set, get) => ({
  cart: [],
  loading: true,

  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((item) => item.product.id === product.id)
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        }
      }
      return { cart: [...state.cart, { product, quantity: 1 }] }
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cart: quantity <= 0
        ? state.cart.filter((item) => item.product.id !== productId)
        : state.cart.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
    })),

  clearCart: () => set({ cart: [] }),
  setLoading: (loading) => set({ loading }),
  cartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
  cartTotal: () =>
    get().cart.reduce(
      (sum, item) => sum + (item.product.basePrice ?? item.product.appliedPrice ?? 0) * item.quantity,
      0
    ),
}))
