'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Badge from './ui/Badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Layers, 
  Users, 
  Building2, 
  Clock, 
  LayoutDashboard, 
  LogOut,
  ClipboardList,
  CreditCard,
  User as UserIcon,
} from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved) setIsCollapsed(JSON.parse(saved));
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    window.dispatchEvent(new Event('sidebarToggle'));
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('ROLE_COMPANY')) return { label: 'Công ty', type: 'warning' as const };
    if (roles.includes('ROLE_AGENCY')) return { label: 'Đại lý', type: 'primary' as const };
    return { label: 'Khách hàng', type: 'success' as const };
  };

  const navItems = [
    { label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard, roles: ['ROLE_USER'] },
    { label: 'Sản phẩm', href: '/products', icon: ShoppingBag, roles: ['ROLE_USER'] },
    { label: 'Danh mục', href: '/categories', icon: Layers, roles: ['ROLE_USER'] },
    { label: 'Bảng giá', href: '/price-lists', icon: ClipboardList, roles: ['ROLE_COMPANY', 'ROLE_ADMIN'] },
    { label: 'Hẹn giờ giá', href: '/price-vouchers', icon: Clock, roles: ['ROLE_COMPANY', 'ROLE_ADMIN'] },
    { label: 'Đại lý', href: '/agencies', icon: Building2, roles: ['ROLE_COMPANY', 'ROLE_ADMIN'] },
    { label: 'Khách hàng', href: '/customers', icon: Users, roles: ['ROLE_COMPANY', 'ROLE_ADMIN'] },
    { label: 'Khách của tôi', href: '/my-customers', icon: Users, roles: ['ROLE_AGENCY'] },
    { label: 'Tín dụng', href: '/credit', icon: CreditCard, roles: ['ROLE_COMPANY', 'ROLE_AGENCY'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes('ROLE_USER') || 
    (user && user.roles.some(r => item.roles.includes(r)))
  );

  return (
    <aside className="sidebar" style={{ width: isCollapsed ? 84 : 280 }}>
      {/* Header */}
      <div style={{ 
        height: 80, 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 24px',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        marginBottom: 10
      }}>
        {!isCollapsed && (
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: 'white',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>T</div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="gradient-text">TMDT</span>
          </Link>
        )}
        {isCollapsed && (
           <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: 'white',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>T</div>
        )}
        
        {!isCollapsed && (
          <button 
            onClick={toggleCollapse}
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
              color: 'var(--text-muted)', borderRadius: 8,
              cursor: 'pointer', padding: 6, display: 'flex'
            }}
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button 
          onClick={toggleCollapse}
          style={{ 
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
            color: 'var(--text-muted)', borderRadius: '50%',
            cursor: 'pointer', padding: 6, display: 'flex', margin: '0 auto 20px'
          }}
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 0 20px', overflowY: 'auto', overflowX: 'hidden' }}>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : ''}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
