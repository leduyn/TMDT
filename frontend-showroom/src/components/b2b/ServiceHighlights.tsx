'use client'
import { motion } from 'framer-motion'
import { Package, Store, Truck, BarChart3, ArrowRight } from 'lucide-react'

const services = [
  {
    icon: Package,
    title: 'Kho hàng tổng - Dropship',
    description:
      'Khai thác toàn bộ kho hàng của Công ty mà không cần vốn. Đặt hàng trực tiếp giao tới khách, hưởng chiết khấu hoa hồng.',
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    borderLight: 'border-blue-200 dark:border-blue-700/30',
  },
  {
    icon: Store,
    title: 'Gian hàng Marketplace',
    description:
      'Đại lý tự đăng bán sản phẩm riêng trên sàn chung. Hệ thống tự động đề xuất sản phẩm theo vị trí địa lý khách hàng.',
    color: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderLight: 'border-emerald-200 dark:border-emerald-700/30',
  },
  {
    icon: Truck,
    title: 'Vận hành & Hậu cần',
    description:
      'Tự động phân luồng đơn hàng Dropship về kho Công ty. Đại lý tự xử lý đơn Marketplace. Theo dõi vận chuyển tập trung.',
    color: 'from-violet-500 to-violet-600',
    bgLight: 'bg-violet-50 dark:bg-violet-900/20',
    borderLight: 'border-violet-200 dark:border-violet-700/30',
  },
  {
    icon: BarChart3,
    title: 'Đối soát & Tài chính',
    description:
      'Tự động tính hoa hồng Dropship, cắt phí sàn Marketplace. Ví điện tử, đối soát dòng tiền, báo cáo lãi lỗ theo thời gian thực.',
    color: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    borderLight: 'border-amber-200 dark:border-amber-700/30',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function ServiceHighlights() {
  return (
    <section id="giai-phap" className="section-padding">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            Giải pháp
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mt-3">
            Mọi công cụ bạn cần để{' '}
            <span className="text-primary-500">phát triển kênh bán hàng</span>
          </h2>
          <p className="text-surface-600 dark:text-surface-400 mt-4 text-lg">
            Từ kho hàng tổng đến vận hành, chúng tôi lo mọi thứ để bạn tập trung kinh doanh.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className={`card card-hover p-6 ${service.bgLight} ${service.borderLight}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                <service.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
