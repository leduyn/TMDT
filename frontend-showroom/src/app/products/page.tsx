'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import Navbar from '@/components/b2b/Navbar'
import Footer from '@/components/b2b/Footer'
import ProductGrid from '@/components/b2b/ProductGrid'
import { useCategories } from '@/hooks/useCategories'
import { useProducts } from '@/hooks/useProducts'
import { useStore } from '@/store/useStore'

export default function ProductsPage() {
  const { categories } = useCategories()
  const { products, loading } = useProducts()
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !selectedCat || p.categoryId === selectedCat
    return matchSearch && matchCat
  })

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="container-page py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
                Danh sách sản phẩm
              </h1>
              <p className="text-surface-500 dark:text-surface-400 mt-1">
                {filtered.length} sản phẩm
                {selectedCat && ` • ${categories.find((c) => c.id === selectedCat)?.name}`}
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-ghost sm:hidden"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Bộ lọc
            </button>
          </motion.div>

          <div className="flex gap-6">
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`w-56 shrink-0 ${showFilters ? 'block' : 'hidden'} sm:block`}
            >
              <div className="sticky top-24 space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-3">
                    Danh mục
                  </h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCat(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !selectedCat
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700/50'
                      }`}
                    >
                      Tất cả
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCat(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCat === cat.id
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700/50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedCat && (
                  <button
                    onClick={() => setSelectedCat(null)}
                    className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </motion.aside>

            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card animate-pulse">
                      <div className="aspect-square bg-surface-200 dark:bg-surface-700 rounded-t-2xl" />
                      <div className="p-5 space-y-3">
                        <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/3" />
                        <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
                        <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ProductGrid products={filtered} />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
