'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingCart, Moon, Sun, Package } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useStore } from '@/store/useStore'

const navLinks = [
  { label: 'Giải pháp', href: '#giai-phap' },
  { label: 'Sản phẩm', href: '/products' },
  { label: 'Đại lý', href: '#dai-ly' },
  { label: 'Về chúng tôi', href: '#ve-chung-toi' },
]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const cartCount = useStore((s) => s.cartCount())
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-700/50">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-900 dark:text-white tracking-tight">
              TMDT<span className="text-primary-500">.vn</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="btn-ghost text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2.5 rounded-xl"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <Link
              href="/products"
              className="relative btn-ghost p-2.5 rounded-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary text-[10px] font-bold flex items-center justify-center text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="#lien-he" className="hidden sm:inline-flex btn-primary text-sm px-5 py-2.5">
              Liên hệ tư vấn
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn-ghost p-2.5 rounded-xl"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-surface-200 dark:border-surface-700/50 bg-white dark:bg-surface-dark overflow-hidden"
          >
            <div className="container-page py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="#lien-he"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl gradient-primary text-white font-semibold text-center mt-2"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
