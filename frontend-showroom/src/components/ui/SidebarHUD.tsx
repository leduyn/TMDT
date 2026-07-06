'use client'
import { motion } from 'framer-motion'
import { Layers, Eye } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { CategoryDTO } from '@/types'

interface Props {
  categories: CategoryDTO[]
}

export default function SidebarHUD({ categories }: Props) {
  const setCameraTarget = useStore((s) => s.setCameraTarget)
  const cameraTarget = useStore((s) => s.cameraTarget)
  const setFocusedCategory = useStore((s) => s.setFocusedCategory)

  const isActive = (id: number) =>
    typeof cameraTarget === 'object' && cameraTarget.categoryId === id

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2"
    >
      <button
        onClick={() => {
          setCameraTarget('overview')
          setFocusedCategory(null)
        }}
        className={`flex items-center gap-2 glass px-3 py-2.5 rounded-xl transition-all ${
          cameraTarget === 'overview' ? 'neon-glow-cyan border border-neon-cyan/30' : 'hover:bg-white/10'
        }`}
      >
        <Eye className="w-4 h-4 text-neon-cyan" />
        <span className="text-[10px] font-mono tracking-wider text-white/60 hidden md:block">TỔNG QUAN</span>
      </button>
      <div className="w-px h-4 bg-white/10 mx-auto" />
      {categories.slice(0, 8).map((cat) => (
        <motion.button
          key={cat.id}
          onClick={() => {
            setFocusedCategory(cat.id)
            setCameraTarget({ categoryId: cat.id })
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={
            isActive(cat.id)
              ? {
                  boxShadow: [
                    '0 0 10px rgba(79,172,254,0.2), 0 0 30px rgba(79,172,254,0.05)',
                    '0 0 20px rgba(79,172,254,0.4), 0 0 60px rgba(79,172,254,0.1)',
                    '0 0 10px rgba(79,172,254,0.2), 0 0 30px rgba(79,172,254,0.05)',
                  ],
                }
              : {}
          }
          transition={
            isActive(cat.id)
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : {}
          }
          className={`flex items-center gap-2 glass px-3 py-2.5 rounded-xl transition-all ${
            isActive(cat.id) ? 'neon-glow-purple border border-neon-purple/30' : 'hover:bg-white/10'
          }`}
        >
          <Layers className="w-4 h-4 text-neon-purple" />
          <span className="text-[10px] font-mono tracking-wider text-white/60 hidden md:block truncate max-w-[80px]">
            {cat.name}
          </span>
        </motion.button>
      ))}
    </motion.div>
  )
}
