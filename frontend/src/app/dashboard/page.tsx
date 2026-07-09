'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { useAuth } from '@/context/AuthContext';
import { getDashboard, DashboardDTO } from '@/lib/api';

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: '#f59e0b',
  PROCESSING: '#3b82f6',
  SHIPPING: '#8b5cf6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

function DonutChart({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa có dữ liệu</p>;

  let cumulative = 0;
  const segments = data.map((d) => {
    const start = cumulative;
    cumulative += d.count;
    return { ...d, startAngle: (start / total) * 360, endAngle: (cumulative / total) * 360 };
  });

  const cx = 60, cy = 60, r = 50;

  function describeArc(sa: number, ea: number) {
    const sRad = ((sa - 90) * Math.PI) / 180;
    const eRad = ((ea - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(sRad);
    const y1 = cy + r * Math.sin(sRad);
    const x2 = cx + r * Math.cos(eRad);
    const y2 = cy + r * Math.sin(eRad);
    const large = ea - sa > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {segments.map((s) => (
          <path key={s.status} d={describeArc(s.startAngle, s.endAngle)} fill={STATUS_COLORS[s.status] || '#6366f1'} />
        ))}
        <circle cx={cx} cy={cy} r={28} fill="var(--card-bg)" />
      </svg>
      <div>
        {data.map((d) => (
          <div key={d.status} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[d.status] || '#6366f1', display: 'inline-block' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{STATUS_LABELS[d.status] || d.status}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{formatNumber(d.count)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      getDashboard()
        .then((d) => { setData(d); setLoading(false); })
        .catch((err) => { setError(err.message); setLoading(false); });
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const isAgency = user.roles.includes('ROLE_AGENCY');
  const isCompany = user.roles.includes('ROLE_COMPANY');
  const isCustomer = !isAgency && !isCompany;

  const getRoleName = () => {
    if (isCompany) return 'Công ty';
    if (isAgency) return 'Khách hàng';
    return 'Người mua';
  };

  const getRoleEmoji = () => {
    if (isCompany) return '\u{1F3E2}';
    if (isAgency) return '\u{1F3EA}';
    return '\u{1F464}';
  };

  const statsCards = data
    ? [
        { label: 'Tổng đơn hàng', value: formatNumber(data.stats.totalOrders), icon: '\u{1F4E6}', color: '#6366f1', desc: '' },
        { label: 'Doanh thu', value: formatVND(data.stats.totalRevenue), icon: '\u{1F4B0}', color: '#10b981', desc: 'Đã hoàn thành' },
        ...(isCompany
          ? [
              { label: 'Sản phẩm', value: formatNumber(data.stats.totalProducts), icon: '\u{1F6CD}\uFE0F', color: '#f59e0b', desc: '' },
              { label: 'Đại lý', value: formatNumber(data.stats.totalAgencies), icon: '\u{1F3E2}', color: '#3b82f6', desc: '' },
              { label: 'Người mua', value: formatNumber(data.stats.totalCustomers), icon: '\u{1F465}', color: '#ec4899', desc: '' },
            ]
          : []),
        ...(isAgency
          ? [
              { label: 'Sản phẩm', value: formatNumber(data.stats.totalProducts), icon: '\u{1F6CD}\uFE0F', color: '#f59e0b', desc: 'Sản phẩm của tôi' },
              { label: 'Khách hàng', value: formatNumber(data.stats.totalCustomers), icon: '\u{1F465}', color: '#ec4899', desc: 'Khách hàng của tôi' },
              { label: 'Đánh giá', value: data.stats.averageRating > 0 ? data.stats.averageRating.toFixed(1) : '---', icon: '\u{2B50}', color: '#ec4899', desc: data.stats.averageRating > 0 ? '/ 5' : 'Chưa có' },
            ]
          : []),
        ...(isCustomer
          ? [
              { label: 'Điểm tích lũy', value: formatNumber(data.stats.loyaltyPoints), icon: '\u{2B50}', color: '#f59e0b', desc: '' },
            ]
          : []),
      ]
    : [];

  const quickLinks = [
    { href: '/products', label: 'Xem sản phẩm', icon: '\u{1F6CD}\uFE0F', desc: 'Duyệt danh mục' },
    { href: '#', label: 'Đơn hàng của tôi', icon: '\u{1F4CB}', desc: 'Xem lịch sử' },
    ...(isCustomer ? [{ href: '#', label: 'Điểm tích lũy', icon: '\u{1F48E}', desc: 'Điểm & phần thưởng' }] : []),
    { href: '/profile', label: 'Hồ sơ của tôi', icon: '\u{1F464}', desc: 'Cập nhật thông tin' },
    ...(isAgency || isCompany ? [{ href: '/products/create', label: 'Thêm sản phẩm', icon: '\u{2795}', desc: 'Tạo sản phẩm mới' }] : []),
    ...(isAgency || isCompany ? [{ href: '/categories', label: 'Quản lý danh mục', icon: '\u{1F4C2}', desc: 'Quản lý loại sản phẩm' }] : []),
    ...(isCompany ? [{ href: '/attributes', label: 'Quản lý thuộc tính', icon: '\u{2699}\uFE0F', desc: 'Thiết lập EAV' }] : []),
    ...(isCompany
      ? [
          { href: '/price-lists', label: 'Bảng giá', icon: '\u{1F3F7}\uFE0F', desc: 'Quản lý bảng giá' },
          { href: '/customer-groups', label: 'Nhóm Người mua', icon: '\u{1F465}', desc: 'Quản lý nhóm KH' },
        ]
      : []),
    ...(isAgency ? [{ href: '/price-lists/my-store', label: 'Bảng giá shop', icon: '\u{1F3EA}', desc: 'Thiết lập giá shop' }] : []),
  ];

  return (
    <>
      <Navbar />
      <Main>
        {/* Welcome hero */}
        <div className="glass-card fade-in-up" style={{
          padding: 32, marginBottom: 32,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30, width: 200, height: 200,
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

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Đang tải dữ liệu...
          </div>
        )}

        {error && (
          <div className="glass-card" style={{ padding: 20, marginBottom: 24, borderLeft: '4px solid #ef4444' }}>
            <p style={{ margin: 0, color: '#ef4444', fontSize: '0.9rem' }}>Lỗi: {error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`, gap: 16, marginBottom: 32 }}>
              {statsCards.map((s, i) => (
                <div key={s.label} className="glass-card fade-in-up" style={{ padding: 20, animationDelay: `${i * 0.08}s` }}>
                  {s.label === 'Đại lý' && data?.stats.totalAgencies > 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 8 }}>Đại lý</p>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6' }}>{formatNumber(data.stats.totalAgencies)}</p>
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: '0.8rem', color: '#6366f1' }}>Sỉ: {formatNumber(data.stats.wholesaleAgencies)}</span>
                          <span style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>Lẻ: {formatNumber(data.stats.retailAgencies)}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 28 }}>{s.icon}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 6 }}>{s.label}</p>
                        <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: s.color }}>{s.value}</p>
                        {s.desc && <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.desc}</p>}
                      </div>
                      <span style={{ fontSize: 28 }}>{s.icon}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              {data.orderStatusCounts && data.orderStatusCounts.length > 0 && (
                <div className="glass-card fade-in-up" style={{ padding: 20, animationDelay: '0.2s' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Trạng thái đơn hàng
                  </h3>
                  <DonutChart data={data.orderStatusCounts} />
                </div>
              )}

              {data.recentOrders && data.recentOrders.length > 0 && (
                <div className="glass-card fade-in-up" style={{ padding: 20, animationDelay: '0.25s' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Đơn hàng gần đây
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--text-muted)', fontWeight: 500 }}>Mã ĐH</th>
                          <th style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--text-muted)', fontWeight: 500 }}>Khách hàng</th>
                          <th style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--text-muted)', fontWeight: 500 }}>Tổng tiền</th>
                          <th style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--text-muted)', fontWeight: 500 }}>Trạng thái</th>
                          <th style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--text-muted)', fontWeight: 500 }}>Ngày</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentOrders.map((o) => (
                          <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 4px', fontWeight: 600 }}>#{o.id}</td>
                            <td style={{ padding: '10px 4px' }}>{o.customerName}</td>
                            <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 600 }}>{formatVND(o.totalAmount)}</td>
                            <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block', padding: '2px 8px', borderRadius: 999,
                                fontSize: '0.72rem', fontWeight: 600,
                                color: STATUS_COLORS[o.status] || '#6366f1',
                                background: (STATUS_COLORS[o.status] || '#6366f1') + '18',
                              }}>
                                {STATUS_LABELS[o.status] || o.status}
                              </span>
                            </td>
                            <td style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{o.orderDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Quick actions */}
        <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Truy cập nhanh
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {quickLinks.map((link) => (
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
      </Main>
    </>
  );
}
