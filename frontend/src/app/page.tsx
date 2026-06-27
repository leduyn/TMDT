'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { usePrefetchProducts } from '@/modules/product/hooks';

export default function HomePage() {
  const { prefetch } = usePrefetchProducts();
  return (
    <>
      <main style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 60%)',
        position: 'relative',
      }} className="bg-grid">
        {/* Glow blobs */}
        <div style={{
          position: 'absolute', top: '15%', left: '5%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Hero section */}
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '100px 24px 60px',
          textAlign: 'center', position: 'relative',
        }}>
          <div className="fade-in-up" style={{ marginBottom: 24 }}>
            <span className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '6px 14px', marginBottom: 20, display: 'inline-flex' }}>
              ✨ Nền tảng B2B2C thế hệ mới
            </span>
          </div>

          <h1 className="fade-in-up" style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 800, lineHeight: 1.15,
            margin: '0 0 24px', animationDelay: '0.1s',
          }}>
            Sàn thương mại điện tử<br />
            <span className="gradient-text">kết nối toàn diện</span>
          </h1>

          <p className="fade-in-up" style={{
            fontSize: '1.15rem', color: 'var(--text-secondary)',
            maxWidth: 580, margin: '0 auto 40px',
            lineHeight: 1.7, animationDelay: '0.2s',
          }}>
            Kết nối Công ty, Khách hàng và Người mua trên một nền tảng thống nhất.
            Hỗ trợ Dropshipping, Marketplace và tích lũy điểm thưởng.
          </p>

          <div className="fade-in-up" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }}>
            <Link href="/products" onMouseEnter={() => prefetch({ page: 0, size: 20 })}>
              <button className="btn-primary" style={{ width: 'auto', padding: '14px 32px', fontSize: '1rem' }}>
                🛍️ Xem sản phẩm
              </button>
            </Link>
            <Link href="/register">
              <button className="btn-outline" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                🚀 Đăng ký miễn phí
              </button>
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                icon: '🏢', title: 'Dành cho Công ty',
                desc: 'Quản lý Khách hàng, cấu hình hoa hồng linh hoạt, theo dõi doanh thu và xếp hạng Khách hàng hàng tháng.',
                gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
                border: 'rgba(99,102,241,0.3)',
              },
              {
                icon: '🏪', title: 'Dành cho Khách hàng',
                desc: 'Bán sản phẩm của công ty qua mô hình Dropship hoặc đăng bán sản phẩm riêng trên Marketplace.',
                gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
                border: 'rgba(139,92,246,0.3)',
              },
              {
                icon: '👤', title: 'Dành cho Người mua',
                desc: 'Mua sắm đa dạng sản phẩm, tích lũy điểm thưởng, nhận ưu đãi và theo dõi đơn hàng dễ dàng.',
                gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
                border: 'rgba(16,185,129,0.3)',
              },
            ].map((f, i) => (
              <div key={f.title} className="glass-card fade-in-up" style={{
                padding: 28, background: f.gradient,
                borderColor: f.border, animationDelay: `${0.4 + i * 0.1}s`,
              }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 700 }}>{f.title}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* API status section */}
          <div className="glass-card fade-in-up" style={{
            marginTop: 32, padding: '24px 28px',
            background: 'rgba(10,15,30,0.5)',
            animationDelay: '0.7s',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              📡 API Endpoints sẵn dùng
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
              {[
                ['POST', '/api/auth/signin', 'Đăng nhập'],
                ['POST', '/api/auth/signup', 'Đăng ký'],
                ['GET', '/api/products', 'Danh sách SP'],
                ['GET', '/api/promotions', 'Khuyến mãi'],
                ['GET', '/api/loyalty/balance', 'Điểm tích lũy'],
                ['GET', '/api/chat', 'Chat WebSocket'],
              ].map(([method, path, label]) => (
                <div key={path} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  <span className={`badge ${method === 'POST' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.65rem', minWidth: 38, justifyContent: 'center' }}>
                    {method}
                  </span>
                  <div>
                    <code style={{ fontSize: '0.72rem', color: 'var(--accent-light)' }}>{path}</code>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

