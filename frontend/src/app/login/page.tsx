'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import NotificationModal from '@/components/NotificationModal';

export default function LoginPage() {
  const [tab, setTab] = useState<'user' | 'agency'>('user');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const creds = tab === 'user' ? username : phone;
    if (!creds || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      setShowError(true);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = tab === 'user'
        ? await authApi.login({ username, password })
        : await authApi.agencyLogin({ phone, password });
      login(res);
      if (res.agencyId && res.agencyStatus === 'PENDING') {
        router.push('/');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24,
      background: 'radial-gradient(ellipse at top, #1a1a3e 0%, var(--bg-primary) 60%)',
    }} className="bg-grid">
      <div style={{
        position: 'fixed', top: '20%', left: '10%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '20%', right: '10%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="glass-card fade-in-up" style={{ width: '100%', maxWidth: 440, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
            fontSize: 24, color: 'white',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}>🛒</div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>
            Chào mừng trở lại
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Đăng nhập để tiếp tục
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 12 }}>
          <button
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: tab === 'user' ? 'var(--accent)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
            onClick={() => setTab('user')}
          >
            Tài khoản
          </button>
          <button
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: tab === 'agency' ? 'var(--accent)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
            onClick={() => setTab('agency')}
          >
            Đại lý
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'user' ? (
            <div className="form-group">
              <label className="form-label" htmlFor="username">Tên đăng nhập</label>
              <input
                id="username"
                className="input-field"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Số điện thoại</label>
              <input
                id="phone"
                className="input-field"
                type="text"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              className="input-field"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Chưa có tài khoản?{' '}
          <Link href="/register" style={{ color: 'var(--accent-light)', fontWeight: 600, textDecoration: 'none' }}>
            Đăng ký ngay
          </Link>
        </p>

        <div style={{
          marginTop: 20, padding: '12px 16px',
          background: 'rgba(99,102,241,0.08)',
          border: '1px dashed rgba(99,102,241,0.3)',
          borderRadius: 10, fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          💡 <strong style={{ color: 'var(--text-secondary)' }}>Demo:</strong> Đảm bảo backend đang chạy ở <code style={{ color: 'var(--accent-light)' }}>localhost:8080</code>
        </div>
      </div>

      <NotificationModal 
        isOpen={showError} 
        onClose={() => setShowError(false)} 
        type="error"
        message={error}
      />
    </main>
  );
}
