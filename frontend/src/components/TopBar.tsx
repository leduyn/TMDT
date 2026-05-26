'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ChevronRight, 
  Home, 
  Bell, 
  Search, 
  LogOut, 
  User as UserIcon, 
  Key, 
  UserCog,
  ChevronDown,
  ShoppingCart,
  Sun,
  Moon
} from 'lucide-react';
import Badge from './ui/Badge';
import { useCart } from '@/context/CartContext';
import { useTheme } from 'next-themes';

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, setTheme } = useTheme();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const checkCollapse = () => {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved) setIsCollapsed(JSON.parse(saved));
    };

    checkCollapse();
    window.addEventListener('sidebarToggle', checkCollapse);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('sidebarToggle', checkCollapse);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('ROLE_COMPANY')) return { label: 'Công ty', type: 'warning' as const };
    if (roles.includes('ROLE_AGENCY')) return { label: 'Khách hàng', type: 'primary' as const };
    return { label: 'Người mua', type: 'success' as const };
  };

  const crumbs = (() => {
    const paths = pathname.split('/').filter(p => p);
    const c: { label: React.ReactNode; href: string }[] = [{ label: <Home size={18} />, href: '/' }];
    const pathMap: Record<string, string> = {
      'dashboard': 'Tổng quan', 'products': 'Sản phẩm', 'categories': 'Danh mục',
      'customers': 'Người mua', 'agencies': 'Khách hàng', 'price-lists': 'Bảng giá',
      'price-vouchers': 'Hẹn giờ giá', 'create': 'Tạo mới', 'edit': 'Chỉnh sửa',
      'my-customers': 'Người mua của tôi', 'profile': 'Trang cá nhân', 'credit': 'Tín dụng',
      'debts': 'Công nợ'
    };
    let currentPath = '';
    paths.forEach((p) => {
      currentPath += `/${p}`;
      c.push({ label: pathMap[p] || (isNaN(Number(p)) ? p : `Chi tiết #${p}`), href: currentPath });
    });
    return c;
  })();

  return (
    <header className="top-bar" style={{ left: mounted ? (isCollapsed ? 84 : 280) : 280 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={14} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />}
            <Link href={crumb.href} style={{ 
              fontSize: '0.92rem', color: idx === crumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
              textDecoration: 'none', fontWeight: idx === crumbs.length - 1 ? 600 : 400,
              display: 'flex', alignItems: 'center'
            }}>
              {crumb.label}
            </Link>
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(var(--text-primary), 0.05)', borderRadius: 10, padding: '6px 12px', border: '1px solid var(--border)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Tìm kiếm..." style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', marginLeft: 8, outline: 'none', width: 120 }} />
        </div>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border)', 
            color: 'var(--text-primary)', 
            cursor: 'pointer', 
            padding: 8, 
            borderRadius: 10, 
            display: 'flex',
            transition: 'all 0.3s ease'
          }}
          title={mounted ? (theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối') : undefined}
        >
          {mounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
          {!mounted && <div style={{ width: 20, height: 20 }} />}
        </button>
        
        <button style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', padding: 8, borderRadius: 10, display: 'flex' }}>
          <Bell size={20} />
        </button>

        <Link href="/checkout" style={{ position: 'relative', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', padding: 8, borderRadius: 10, display: 'flex' }}>
          <ShoppingCart size={20} />
          {totalItems > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: 'var(--accent)', color: 'white',
              fontSize: '0.65rem', padding: '2px 6px', borderRadius: 10, fontWeight: 800,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)', border: '2px solid var(--bg-primary)'
            }}>
              {totalItems}
            </span>
          )}
        </Link>

        {user && (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div 
              style={{ 
                display: 'flex', alignItems: 'center', gap: 12, padding: '4px 12px', borderRadius: 12,
                cursor: 'pointer', background: isDropdownOpen ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                border: `1px solid var(--border)`
              }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent-glow), var(--accent-glow))', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-light)' }}>
                <UserIcon size={18} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.username}</span>
                <Badge label={getRoleBadge(user.roles).label} type={getRoleBadge(user.roles).type} />
                <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </div>
            </div>

            {isDropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 260,
                background: 'var(--bg-card)', backdropFilter: 'blur(32px)', borderRadius: 16,
                border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                padding: '8px', zIndex: 100
              }}>
                <Link href="/profile" style={{ textDecoration: 'none' }} onClick={() => setIsDropdownOpen(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, color: 'var(--text-secondary)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <UserCog size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Cập nhật thông tin</span>
                  </div>
                </Link>
                <Link href="/profile/change-password" style={{ textDecoration: 'none' }} onClick={() => setIsDropdownOpen(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, color: 'var(--text-secondary)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Key size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Đổi mật khẩu</span>
                  </div>
                </Link>
                <div style={{ height: 1, background: 'var(--border)', margin: '6px 8px' }}></div>
                <div 
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, color: 'var(--danger)', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={18} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Đăng xuất hệ thống</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

