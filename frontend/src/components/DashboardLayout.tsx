'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
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
      <Sidebar />
      <TopBar />
      <main 
        className="main-content" 
        style={{ 
          marginLeft: isCollapsed ? 80 : 260,
          width: `calc(100% - ${isCollapsed ? 80 : 260}px)`
        }}
      >
        {children}
      </main>
    </div>
  );
}

