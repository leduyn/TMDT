'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('ROLE_COMPANY')) return { label: 'Công ty', cls: 'badge-warning' };
    if (roles.includes('ROLE_AGENCY')) return { label: 'Đại lý', cls: 'badge-primary' };
    return { label: 'Khách hàng', cls: 'badge-success' };
  };

  return (
    <nav className="navbar">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: 'white',
              }}>T</div>
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }} className="gradient-text">TMDT</span>
            </div>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/products" style={{
              color: 'var(--text-secondary)', textDecoration: 'none',
              padding: '8px 16px', borderRadius: 8,
              fontSize: '0.9rem', fontWeight: 500,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Sản phẩm
            </Link>

            <Link href="/categories" style={{
              color: 'var(--text-secondary)', textDecoration: 'none',
              padding: '8px 16px', borderRadius: 8,
              fontSize: '0.9rem', fontWeight: 500,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Danh mục
            </Link>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href="/dashboard" style={{
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  padding: '8px 16px', borderRadius: 8,
                  fontSize: '0.9rem', fontWeight: 500,
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >Dashboard</Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${getRoleBadge(user.roles).cls}`}>
                    {getRoleBadge(user.roles).label}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {user.username}
                  </span>
                </div>

                <button onClick={handleLogout} className="btn-outline"
                  style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/login">
                  <button className="btn-outline" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
                    Đăng nhập
                  </button>
                </Link>
                <Link href="/register">
                  <button className="btn-primary" style={{ width: 'auto', padding: '7px 16px', fontSize: '0.85rem' }}>
                    Đăng ký
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
