import Link from 'next/link'
import { Package, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = [
  {
    title: 'Giải pháp',
    links: [
      { label: 'Dropship', href: '#' },
      { label: 'Marketplace', href: '#' },
      { label: 'Quản lý đơn hàng', href: '#' },
      { label: 'Đối soát tài chính', href: '#' },
    ],
  },
  {
    title: 'Đối tác',
    links: [
      { label: 'Đăng ký Đại lý', href: '#' },
      { label: 'Chính sách chiết khấu', href: '#' },
      { label: 'Hướng dẫn sử dụng', href: '#' },
      { label: 'Câu hỏi thường gặp', href: '#' },
    ],
  },
  {
    title: 'Về chúng tôi',
    links: [
      { label: 'Giới thiệu', href: '#' },
      { label: 'Tin tức', href: '#' },
      { label: 'Tuyển dụng', href: '#' },
      { label: 'Liên hệ', href: '#lien-he' },
    ],
  },
]

export default function Footer() {
  return (
    <footer id="ve-chung-toi" className="bg-surface-900 dark:bg-surface-950 text-surface-300 border-t border-surface-700/50">
      <div className="container-page py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                TMDT<span className="text-primary-400">.vn</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed mb-6 max-w-xs">
              Nền tảng thương mại điện tử B2B2C hàng đầu, kết nối Công ty - Đại lý - Khách hàng trên cùng một hệ sinh thái.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 text-surface-400">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Hà Nội, Việt Nam</span>
              </div>
              <div className="flex items-center gap-3 text-surface-400">
                <Phone className="w-4 h-4 shrink-0" />
                <span>1900 xxxx</span>
              </div>
              <div className="flex items-center gap-3 text-surface-400">
                <Mail className="w-4 h-4 shrink-0" />
                <span>contact@tmdt.vn</span>
              </div>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-semibold text-white mb-4 text-sm">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-surface-800">
        <div className="container-page py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500">
            &copy; {new Date().getFullYear()} TMDT.vn. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-surface-500">
            <Link href="#" className="hover:text-surface-300 transition-colors">
              Điều khoản
            </Link>
            <Link href="#" className="hover:text-surface-300 transition-colors">
              Bảo mật
            </Link>
            <Link href="#" className="hover:text-surface-300 transition-colors">
              Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
