import { create } from 'zustand'
import type { ProductDTO, CameraTarget } from '@/types'

interface CartItem {
  product: ProductDTO
  quantity: number
}

interface StoreState {
  cameraTarget: CameraTarget
  selectedProduct: ProductDTO | null
  cart: CartItem[]
  focusedCategory: number | null
  panelOpen: boolean
  loading: boolean
  showGrid: boolean
  neonIntensity: 'low' | 'high'

  setCameraTarget: (target: CameraTarget) => void
  selectProduct: (product: ProductDTO | null) => void
  addToCart: (product: ProductDTO) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  setFocusedCategory: (id: number | null) => void
  setPanelOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setShowGrid: (show: boolean) => void
  setNeonIntensity: (intensity: 'low' | 'high') => void
  cartCount: () => number
  cartTotal: () => number
}

export const useStore = create<StoreState>((set, get) => ({
  cameraTarget: 'overview',
  selectedProduct: null,
  cart: [],
  focusedCategory: null,
  panelOpen: false,
  loading: true,
  showGrid: true,
  neonIntensity: 'high',

  setCameraTarget: (target) => set({ cameraTarget: target }),
  selectProduct: (product) => set({ selectedProduct: product, panelOpen: !!product }),
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
  clearCart: () => set({ cart: [] }),
  setFocusedCategory: (id) => set({ focusedCategory: id }),
  setPanelOpen: (open) => set({ panelOpen: open }),
  setLoading: (loading) => set({ loading }),
  setShowGrid: (show) => set({ showGrid: show }),
  setNeonIntensity: (intensity) => set({ neonIntensity: intensity }),
  cartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
  cartTotal: () => get().cart.reduce((sum, item) => sum + (item.product.basePrice ?? item.product.appliedPrice ?? 0) * item.quantity, 0),
}))
