'use client';

import React, { useEffect, useState } from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export default function NotificationModal({ isOpen, onClose, title, message, type = 'info' }: NotificationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success': return { icon: '✅', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'error': return { icon: '❌', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      case 'warning': return { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
      default: return { icon: 'ℹ️', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
    }
  };

  const styles = getTypeStyles();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div 
        className="glass-card fade-in-up" 
        style={{
          width: '100%', maxWidth: 400, padding: 32, textAlign: 'center',
          background: 'var(--bg-primary)', border: `1px solid ${styles.color}44`,
          boxShadow: `0 20px 50px rgba(0,0,0,0.3), 0 0 20px ${styles.color}22`
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: styles.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 20px', color: styles.color,
          border: `1px solid ${styles.color}33`
        }}>
          {styles.icon}
        </div>
        
        <h2 style={{ margin: '0 0 12px', fontSize: '1.5rem', fontWeight: 700 }}>
          {title || (type === 'error' ? 'Đã có lỗi xảy ra' : 'Thông báo')}
        </h2>
        
        <p style={{ margin: '0 0 32px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {message}
        </p>
        
        <button 
          onClick={onClose}
          className="btn-primary"
          style={{ 
            minWidth: 120, padding: '12px 32px', background: styles.color, 
            borderColor: styles.color, color: 'white' 
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
