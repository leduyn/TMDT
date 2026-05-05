'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 48, height: 48,
          border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  const isAgency = user.roles.includes('ROLE_AGENCY');
  const isCompany = user.roles.includes('ROLE_COMPANY');

  const getRoleName = () => {
    if (isCompany) return 'Công ty';
    if (isAgency) return 'Đại lý';
    return 'Khách hàng';
  };

  const getRoleEmoji = () => {
    if (isCompany) return '🏢';
    if (isAgency) return '🏪';
    return '👤';
  };

  const statsCards = [
    { label: 'Tổng đơn hàng', value: '—', icon: '📦', color: '#6366f1', desc: 'Chưa có dữ liệu' },
    { label: 'Điểm tích lũy', value: '—', icon: '⭐', color: '#f59e0b', desc: 'Xem tại /api/loyalty/balance' },
    { label: 'Doanh thu', value: '—', icon: '💰', color: '#10b981', desc: isAgency ? 'Dành cho đại lý' : 'N/A' },
    { label: 'Đánh giá', value: '—', icon: '⭐', color: '#ec4899', desc: 'Xem tại /api/reviews' },
  ];

  const quickLinks = [
    { href: '/products', label: 'Xem sản phẩm', icon: '🛍️', desc: 'Duyệt danh mục' },
    { href: '#', label: 'Đơn hàng của tôi', icon: '📋', desc: 'Xem lịch sử' },
    { href: '#', label: 'Điểm tích lũy', icon: '💎', desc: 'Điểm & phần thưởng' },
    ...(isAgency || isCompany ? [{ href: '/products/create', label: 'Thêm sản phẩm', icon: '➕', desc: 'Tạo sản phẩm mới' }] : []),
    ...(isAgency || isCompany ? [{ href: '/categories', label: 'Quản lý danh mục', icon: '📂', desc: 'Quản lý loại sản phẩm' }] : []),
    ...(isCompany ? [{ href: '/attributes', label: 'Quản lý thuộc tính', icon: '⚙️', desc: 'Thiết lập EAV' }] : []),
    ...(isCompany ? [
      { href: '/price-lists', label: 'Bảng giá', icon: '🏷️', desc: 'Quản lý bảng giá' },
      { href: '/price-vouchers', label: 'Phiếu cập nhật', icon: '⏰', desc: 'Hẹn giờ cập nhật giá' },
      { href: '/customer-groups', label: 'Nhóm khách hàng', icon: '👥', desc: 'Quản lý nhóm KH' }
    ] : []),
    ...(isAgency ? [{ href: '/price-lists/my-store', label: 'Bảng giá shop', icon: '🏪', desc: 'Thiết lập giá shop' }] : []),
    ...(isAgency || isCompany ? [{ href: '#', label: 'Quản lý đơn', icon: '📊', desc: 'Xử lý đơn hàng' }] : []),
  ];

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Welcome hero */}
        <div className="glass-card fade-in-up" style={{
          padding: 32, marginBottom: 32,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            }}>
              {getRoleEmoji()}
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Xin chào,</p>
              <h1 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 700 }}>
                {user.username} <span className="gradient-text">✨</span>
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {user.email} · {getRoleName()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {statsCards.map((s, i) => (
            <div key={s.label} className="glass-card fade-in-up" style={{ padding: 20, animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 6 }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.desc}</p>
                </div>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Truy cập nhanh
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {quickLinks.map(link => (
              <Link key={link.label} href={link.href} style={{ textDecoration: 'none' }}>
                <div className="product-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 28 }}>{link.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{link.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{link.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* API token info */}
        <div className="fade-in-up glass-card" style={{
          marginTop: 32, padding: 20, animationDelay: '0.4s',
          background: 'rgba(10,15,30,0.5)',
        }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            🔑 JWT Token (dùng để gọi API được bảo vệ)
          </p>
          <code style={{
            display: 'block', fontSize: '0.72rem', color: 'var(--accent-light)',
            wordBreak: 'break-all', lineHeight: 1.6,
          }}>
            {user.roles.join(', ')} · ID: {user.id}
          </code>
        </div>
      </main>
    </>
  );
}
