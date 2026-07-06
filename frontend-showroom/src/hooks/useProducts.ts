'use client'
import { useEffect, useState } from 'react'
import { fetchJSON, APIError } from '@/lib/api'
import type { ProductDTO } from '@/types'
import { MOCK_PRODUCTS } from '@/lib/mock-data'

interface UseProductsResult {
  products: ProductDTO[]
  loading: boolean
  error: string | null
  isMock: boolean
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchJSON<ProductDTO[]>('/api/products')
      .then((data) => { if (!cancelled) { setProducts(data || []); setIsMock(false) } })
      .catch((err) => {
        if (!cancelled) {
          console.warn('Products API unavailable, using mock data:', err instanceof APIError ? err.message : err)
          setProducts(MOCK_PRODUCTS)
          setIsMock(true)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { products, loading, error, isMock }
}
