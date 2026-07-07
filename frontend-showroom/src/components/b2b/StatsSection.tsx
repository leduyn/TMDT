'use client'
import { motion } from 'framer-motion'
import { Users, Package, Zap, Building2 } from 'lucide-react'

const stats = [
  { icon: Building2, value: '1000+', label: 'Đại lý đối tác' },
  { icon: Package, value: '50.000+', label: 'Sản phẩm trên sàn' },
  { icon: Zap, value: '99%', label: 'Vận hành tự động' },
  { icon: Users, value: '500.000+', label: 'Khách hàng' },
]

export default function StatsSection() {
  return (
    <section className="py-16 bg-primary-600 dark:bg-primary-800">
      <div className="container-page">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-8 h-8 text-white/60 mx-auto mb-3" />
              <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-white/70 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
