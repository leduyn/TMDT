'use client'
import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { useCategories } from '@/hooks/useCategories'
import { useProducts } from '@/hooks/useProducts'
import Scene from '@/components/3d/Scene'
import Navbar from '@/components/ui/Navbar'
import SidebarHUD from '@/components/ui/SidebarHUD'
import ProductPanel from '@/components/ui/ProductPanel'
import BottomBar from '@/components/ui/BottomBar'
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function ShowroomPage() {
  const { categories, loading: catLoading, error: catError } = useCategories()
  const { products, loading: prodLoading, error: prodError } = useProducts()
  const loading = useStore((s) => s.loading)
  const setLoading = useStore((s) => s.setLoading)

  useEffect(() => {
    if (!catLoading && !prodLoading) {
      const timer = setTimeout(() => setLoading(false), 600)
      return () => clearTimeout(timer)
    }
  }, [catLoading, prodLoading, setLoading])

  useEffect(() => {
    const fallback = setTimeout(() => setLoading(false), 6000)
    return () => clearTimeout(fallback)
  }, [setLoading])

  return (
    <>
      {loading && <LoadingScreen />}

      <Scene categories={categories} products={products} />

      <Navbar categories={categories} />

      <SidebarHUD categories={categories} />

      <ProductPanel />

      <BottomBar />
    </>
  )
}
