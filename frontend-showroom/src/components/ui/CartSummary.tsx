'use client'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatPrice } from '@/lib/utils'

export default function CartSummary() {
  const cart = useStore((s) => s.cart)
  const cartCount = useStore((s) => s.cartCount())
  const cartTotal = useStore((s) => s.cartTotal())
  const removeFromCart = useStore((s) => s.removeFromCart)
  const clearCart = useStore((s) => s.clearCart)

  if (cart.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/10">
      <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ShoppingCart className="w-5 h-5 text-neon-cyan" />
          <span className="text-sm text-white/70 font-mono">
            {cartCount} sản phẩm
          </span>
          <span className="text-sm text-white/40">|</span>
          <span className="text-sm font-mono text-neon-cyan font-semibold">
            {formatPrice(cartTotal)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {cart.slice(0, 4).map((item) => (
              <div
                key={item.product.id}
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[10px] font-mono text-white/50"
                title={item.product.name}
              >
                {item.quantity}
              </div>
            ))}
            {cart.length > 4 && (
              <div className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[10px] font-mono text-white/30">
                +{cart.length - 4}
              </div>
            )}
          </div>
          <button
            onClick={clearCart}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400/60" />
          </button>
        </div>
      </div>
    </div>
  )
}
