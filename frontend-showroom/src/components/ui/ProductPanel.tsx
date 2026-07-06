'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Info, Cpu, DollarSign, Sparkles } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatPrice } from '@/lib/utils'
import ProductPreview from '@/components/3d/ProductPreview'

export default function ProductPanel() {
  const selectedProduct = useStore((s) => s.selectedProduct)
  const panelOpen = useStore((s) => s.panelOpen)
  const setPanelOpen = useStore((s) => s.setPanelOpen)
  const addToCart = useStore((s) => s.addToCart)
  const closePanel = () => { setPanelOpen(false); useStore.getState().selectProduct(null) }

  const [adding, setAdding] = useState(false)

  const handleAddToCart = () => {
    if (!selectedProduct) return
    setAdding(true)
    addToCart(selectedProduct)
    setTimeout(() => { setAdding(false); closePanel() }, 600)
  }

  return (
    <AnimatePresence>
      {panelOpen && selectedProduct && (
        <motion.div
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 h-full w-[400px] max-w-[90vw] z-50 glass-strong border-l border-white/10"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-sm font-mono tracking-wider text-white/70">CHI TIẾT SẢN PHẨM</h2>
              <button onClick={closePanel} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <ProductPreview
                product={selectedProduct}
                categoryName={selectedProduct.categoryName}
              />

              <div>
                <h3 className="text-lg font-semibold text-white/90">{selectedProduct.name}</h3>
                {selectedProduct.productCode && (
                  <p className="text-[10px] font-mono text-white/30 mt-0.5">SKU: {selectedProduct.productCode}</p>
                )}
                <p className="text-2xl font-mono text-neon-cyan font-bold mt-2">
                  {formatPrice(selectedProduct.basePrice ?? selectedProduct.appliedPrice)}
                </p>
              </div>

              {selectedProduct.description && (
                <div className="glass rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
                    <Info className="w-3.5 h-3.5" />
                    MÔ TẢ
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{selectedProduct.description}</p>
                </div>
              )}

              {selectedProduct.specification && (
                <div className="glass rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    THÔNG SỐ KỸ THUẬT
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed font-mono text-[11px]">
                    {selectedProduct.specification}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-2 text-white/40 text-[10px] font-mono">
                    <Cpu className="w-3 h-3" />
                    TỒN KHO
                  </div>
                  <p className="text-sm text-white/80 font-mono">{selectedProduct.stockQuantity}</p>
                </div>
                <div className="glass rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-2 text-white/40 text-[10px] font-mono">
                    <DollarSign className="w-3 h-3" />
                    ĐƠN VỊ
                  </div>
                  <p className="text-sm text-white/80 font-mono">{selectedProduct.unit || 'cái'}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10">
              <motion.button
                onClick={handleAddToCart}
                disabled={adding}
                whileTap={{ scale: 0.97 }}
                animate={adding ? { scale: [1, 1.05, 1], transition: { duration: 0.3 } } : {}}
                className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-space font-semibold py-3 rounded-xl transition-all relative overflow-hidden ${
                  adding ? 'opacity-80' : 'hover:opacity-90'
                }`}
              >
                {adding && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                )}
                <ShoppingCart className={`w-5 h-5 ${adding ? 'animate-bounce' : ''}`} />
                {adding ? 'ĐÃ THÊM!' : 'THÊM VÀO GIỎ'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
