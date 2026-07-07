'use client'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, TrendingUp, Package } from 'lucide-react'
import Link from 'next/link'

const stats = [
  { icon: Shield, label: 'Bảo mật cấp doanh nghiệp' },
  { icon: Zap, label: 'Vận hành tự động 99%' },
  { icon: TrendingUp, label: 'Tối ưu doanh thu' },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container-page w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700/50"
            >
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                Nền tảng B2B2C hàng đầu Việt Nam
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-surface-900 dark:text-white leading-tight text-balance"
            >
              Giải pháp thương mại điện tử{' '}
              <span className="gradient-primary bg-clip-text text-transparent">
                toàn diện
              </span>{' '}
              cho doanh nghiệp
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-surface-600 dark:text-surface-400 leading-relaxed max-w-xl"
            >
              Kết nối Công ty - Đại lý - Khách hàng trên một nền tảng duy nhất.
              Dropship thông minh, Marketplace linh hoạt, vận hành tự động.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="#lien-he" className="btn-primary text-base px-8 py-4">
                Liên hệ tư vấn
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/dang-ky-dai-ly" className="btn-secondary text-base px-8 py-4">
                Đăng ký làm Đại lý
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-6 pt-4"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                  <stat.icon className="w-4 h-4 text-primary-500" />
                  {stat.label}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 gradient-primary rounded-3xl opacity-10 blur-3xl" />
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-surface-800 border border-primary-200 dark:border-primary-700/30 overflow-hidden flex items-center justify-center">
                <div className="text-center p-12">
                  <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">
                    Hệ sinh thái B2B2C
                  </h3>
                  <div className="space-y-4 text-left">
                    {[
                      { label: 'Công ty', desc: 'Quản lý kho tổng, vận hành dropship' },
                      { label: 'Đại lý', desc: 'Kinh doanh không cần vốn, tự đăng sản phẩm' },
                      { label: 'Khách hàng', desc: 'Mua sắm tập trung, theo dõi đơn hàng' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5">
                        <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />
                        <div>
                          <p className="font-semibold text-surface-900 dark:text-white text-sm">{item.label}</p>
                          <p className="text-surface-500 dark:text-surface-400 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
