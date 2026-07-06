'use client'
import { motion } from 'framer-motion'

export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      className={`h-3 rounded bg-white/10 ${className}`}
    />
  )
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className={`rounded-xl bg-white/5 ${className}`}
    />
  )
}

export function PanelSkeleton() {
  return (
    <div className="p-5 space-y-5">
      <SkeletonBlock className="w-full aspect-square" />
      <div className="space-y-2">
        <SkeletonLine className="w-3/4 h-5" />
        <SkeletonLine className="w-1/3 h-7 mt-2" />
      </div>
      <SkeletonBlock className="w-full h-24" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-16" />
      </div>
    </div>
  )
}

export function ShelfSkeleton() {
  return (
    <group>
      <SkeletonBlock className="w-32 h-4" />
    </group>
  )
}
