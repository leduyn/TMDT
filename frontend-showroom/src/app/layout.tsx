import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

export const metadata: Metadata = {
  title: 'TMDT - Nền tảng Thương mại Điện tử B2B2C',
  description:
    'Giải pháp thương mại điện tử toàn diện cho Doanh nghiệp và Đại lý. Dropship, Marketplace, quản lý đơn hàng tập trung.',
  keywords: ['thương mại điện tử', 'B2B', 'dropship', 'marketplace', 'đại lý', 'bán hàng online'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
