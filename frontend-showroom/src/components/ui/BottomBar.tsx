'use client'
import { motion } from 'framer-motion'
import { ShoppingCart, Trash2, Sun, Moon, Sparkles, Eye } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatPrice } from '@/lib/utils'

export default function BottomBar() {
  const cart = useStore((s) => s.cart)
  const cartCount = useStore((s) => s.cartCount())
  const cartTotal = useStore((s) => s.cartTotal())
  const removeFromCart = useStore((s) => s.removeFromCart)
  const clearCart = useStore((s) => s.clearCart)

  const neonIntensity = useStore((s) => s.neonIntensity)
  const setNeonIntensity = useStore((s) => s.setNeonIntensity)
  const showGrid = useStore((s) => s.showGrid)
  const setShowGrid = useStore((s) => s.setShowGrid)

  if (cart.length === 0) return null

  return (
    <motion.div
      initial={{ y: 60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/10"
    >
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
          <div className="flex gap-1.5">
            {cart.slice(0, 4).map((item) => (
              <div
                key={item.product.id}
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[10px] font-mono text-white/50 relative group"
                title={item.product.name}
              >
                {item.quantity}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-500/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-2 h-2 text-white" />
                </button>
              </div>
            ))}
            {cart.length > 4 && (
              <div className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[10px] font-mono text-white/30">
                +{cart.length - 4}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <button
            onClick={() => setNeonIntensity(neonIntensity === 'high' ? 'low' : 'high')}
            className={`p-2 rounded-lg transition-all ${
              neonIntensity === 'high' ? 'text-neon-cyan bg-white/10' : 'text-white/30 hover:text-white/60'
            }`}
            title={`Neon: ${neonIntensity}`}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg transition-all ${
              showGrid ? 'text-neon-purple bg-white/10' : 'text-white/30 hover:text-white/60'
            }`}
            title={showGrid ? 'Ẩn grid' : 'Hiện grid'}
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={clearCart}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Xóa giỏ hàng"
          >
            <Trash2 className="w-4 h-4 text-red-400/60" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
