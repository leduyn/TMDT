'use client'
import { motion } from 'framer-motion'
import { CheckCircle2, Building2, Users } from 'lucide-react'
import Link from 'next/link'

const companyFeatures = [
  'Quản lý kho hàng tổng tập trung',
  'Phân phối sản phẩm đến mạng lưới Đại lý',
  'Tự động xử lý đơn Dropship và hậu cần',
  'Phê duyệt & kiểm duyệt sản phẩm Đại lý',
  'Cấu hình chiết khấu & phí sàn linh hoạt',
  'Báo cáo doanh thu & đối soát tự động',
]

const agencyFeatures = [
  'Kinh doanh không cần vốn - mô hình Dropship',
  'Tự đăng bán sản phẩm riêng (Marketplace)',
  'Tiếp cận khách hàng theo vị trí địa lý',
  'Ví điện tử & rút tiền tự động',
  'Công cụ marketing & voucher riêng',
  'Báo cáo lợi nhuận chi tiết',
]

export default function SolutionsSection() {
  return (
    <section id="dai-ly" className="section-padding bg-surface-100/50 dark:bg-surface-800/30">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            Đối tượng
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mt-3">
            Giải pháp dành riêng cho{' '}
            <span className="text-primary-500">từng đối tượng</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card p-8 lg:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-surface-900 dark:text-white">
                  Dành cho Công ty
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Mở rộng kênh phân phối, quản lý tập trung
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {companyFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                  <span className="text-surface-700 dark:text-surface-300">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card p-8 lg:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-surface-900 dark:text-white">
                  Dành cho Đại lý
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Kinh doanh linh hoạt, tối ưu lợi nhuận
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {agencyFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-surface-700 dark:text-surface-300">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            Chưa rõ mô hình nào phù hợp? Chúng tôi sẽ tư vấn miễn phí.
          </p>
          <Link href="#lien-he" className="btn-primary">
            Nhận tư vấn miễn phí
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
