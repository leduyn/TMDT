'use client'
import { useEffect, useState } from 'react'
import { fetchJSON, APIError } from '@/lib/api'
import type { CategoryDTO } from '@/types'
import { MOCK_CATEGORIES } from '@/lib/mock-data'

interface UseCategoriesResult {
  categories: CategoryDTO[]
  loading: boolean
  error: string | null
  isMock: boolean
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchJSON<CategoryDTO[]>('/api/categories')
      .then((data) => { if (!cancelled) { setCategories(data || []); setIsMock(false) } })
      .catch((err) => {
        if (!cancelled) {
          console.warn('Categories API unavailable, using mock data:', err instanceof APIError ? err.message : err)
          setCategories(MOCK_CATEGORIES)
          setIsMock(true)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { categories, loading, error, isMock }
}
