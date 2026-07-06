'use client'
import { useEffect, useState } from 'react'
import { fetchJSON, APIError } from '@/lib/api'
import type { ProductDTO } from '@/types'
import { MOCK_PRODUCTS } from '@/lib/mock-data'

interface UseProductDetailResult {
  product: ProductDTO | null
  loading: boolean
  error: string | null
}

export function useProductDetail(id: number | null): UseProductDetailResult {
  const [product, setProduct] = useState<ProductDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id === null) { setProduct(null); setError(null); return }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchJSON<ProductDTO>(`/api/products/${id}`, { retries: 1 })
      .then((data) => { if (!cancelled) setProduct(data) })
      .catch((err) => {
        if (!cancelled) {
          console.warn(`Product detail API unavailable for id=${id}, using mock fallback`)
          const mock = MOCK_PRODUCTS.find((p) => p.id === id) || null
          if (mock) {
            setProduct(mock)
          } else {
            setError(err instanceof APIError ? err.message : 'Failed to load product detail')
          }
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id])

  return { product, loading, error }
}
