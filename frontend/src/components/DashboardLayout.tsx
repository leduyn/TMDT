'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { isPendingAgency, isPendingDepositAgency } = useAuth();
  const isRestrictedAgency = isPendingAgency || isPendingDepositAgency;
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Don't show layout on login/register pages
  const isAuthPage = ['/login', '/register'].includes(pathname);

  useEffect(() => {
    const checkCollapse = () => {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved) setIsCollapsed(JSON.parse(saved));
    };

    checkCollapse();
    window.addEventListener('sidebarToggle', checkCollapse);
    return () => window.removeEventListener('sidebarToggle', checkCollapse);
  }, []);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="app-layout">
      {isRestrictedAgency && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white', textAlign: 'center', padding: '8px 16px',
          fontSize: '0.9rem', fontWeight: 600,
          boxShadow: '0 2px 12px rgba(245,158,11,0.4)',
        }}>
          {isPendingDepositAgency
            ? 'Tài khoản đang chờ đặt cọc — Bạn chỉ có thể xem thông tin sản phẩm'
            : 'Tài khoản đang chờ duyệt — Bạn chỉ có thể xem thông tin sản phẩm'}
        </div>
      )}
      <Sidebar />
      <TopBar />
      <main 
        className="main-content" 
        style={{ 
          marginTop: isPendingAgency ? 40 : 0,
          marginLeft: isCollapsed ? 80 : 260,
          width: `calc(100% - ${isCollapsed ? 80 : 260}px)`
        }}
      >
        {children}
      </main>
    </div>
  );
}

