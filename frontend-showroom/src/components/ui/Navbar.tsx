'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Hexagon, ChevronDown, Layers } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { CategoryDTO } from '@/types'

interface Props {
  categories?: CategoryDTO[]
}

export default function Navbar({ categories = [] }: Props) {
  const cartCount = useStore((s) => s.cartCount())
  const setPanelOpen = useStore((s) => s.setPanelOpen)
  const setCameraTarget = useStore((s) => s.setCameraTarget)
  const setFocusedCategory = useStore((s) => s.setFocusedCategory)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Hexagon className="w-6 h-6 text-neon-cyan" />
            <span className="text-lg font-bold tracking-wider text-white/90 font-mono">
              SHOWROOM<span className="text-neon-cyan">_3D</span>
            </span>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white/80 transition-colors font-mono"
            >
              <Layers className="w-3.5 h-3.5" />
              Danh mục
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-0 w-56 glass-strong rounded-xl border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setCameraTarget('overview')
                      setFocusedCategory(null)
                      setDropdownOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono text-white/60 hover:bg-white/5 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-neon-cyan" />
                    TỔNG QUAN
                  </button>
                  <div className="h-px bg-white/5 mx-3" />
                  {categories.slice(0, 8).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setFocusedCategory(cat.id)
                        setCameraTarget({ categoryId: cat.id })
                        setDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan/50" />
                      {cat.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() => setPanelOpen(true)}
          className="relative flex items-center gap-2 glass-strong px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
        >
          <ShoppingCart className="w-5 h-5 text-neon-cyan" />
          <span className="text-sm text-white/80">Giỏ hàng</span>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neon-cyan text-space text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}
