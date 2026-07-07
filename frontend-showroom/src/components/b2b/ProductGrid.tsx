'use client'
import { motion } from 'framer-motion'
import { ShoppingCart, Package } from 'lucide-react'
import type { ProductDTO } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { useState } from 'react'

interface Props {
  products: ProductDTO[]
}

export default function ProductGrid({ products }: Props) {
  const addToCart = useStore((s) => s.addToCart)
  const [addingId, setAddingId] = useState<number | null>(null)

  const handleAddToCart = (product: ProductDTO) => {
    setAddingId(product.id)
    addToCart(product)
    setTimeout(() => setAddingId(null), 600)
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
        <p className="text-surface-500 dark:text-surface-400 text-lg">Chưa có sản phẩm</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, idx) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
          className="card card-hover overflow-hidden flex flex-col"
        >
          <div className="aspect-square bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-700 dark:to-surface-800 flex items-center justify-center p-8">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <Package className="w-20 h-20 text-surface-300 dark:text-surface-600" />
            )}
          </div>

          <div className="p-5 flex-1 flex flex-col">
            {product.categoryName && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400 mb-1">
                {product.categoryName}
              </span>
            )}
            <h3 className="font-semibold text-surface-900 dark:text-white leading-snug mb-1 line-clamp-2">
              {product.name}
            </h3>
            {product.productCode && (
              <p className="text-xs font-mono text-surface-400 dark:text-surface-500 mb-2">
                SKU: {product.productCode}
              </p>
            )}
            <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-2 mb-3 flex-1">
              {product.description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-100 dark:border-surface-700/50">
              <div>
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400 font-mono">
                  {formatPrice(product.basePrice ?? product.appliedPrice)}
                </p>
                {product.stockQuantity > 0 ? (
                  <p className="text-[11px] text-surface-400">
                    Kho: {product.stockQuantity}
                  </p>
                ) : (
                  <p className="text-[11px] text-red-500">Hết hàng</p>
                )}
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={addingId === product.id || product.stockQuantity <= 0}
                className={`p-2.5 rounded-xl transition-all ${
                  addingId === product.id
                    ? 'bg-emerald-500 text-white scale-110'
                    : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 active:scale-95'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
