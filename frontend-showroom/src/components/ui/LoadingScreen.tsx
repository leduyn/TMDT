'use client'
import { Hexagon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] bg-space flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <Hexagon className="w-16 h-16 text-neon-cyan" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-sm font-mono text-white/40 tracking-widest"
      >
        ĐANG TẢI SHOWROOM...
      </motion.p>
      <div className="mt-6 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            className="w-2 h-2 rounded-full bg-neon-cyan"
          />
        ))}
      </div>
    </div>
  )
}
