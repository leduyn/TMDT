'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

const ROLES = [
  { value: 'CUSTOMER', label: '👤 Khách hàng', desc: 'Mua sắm sản phẩm từ sàn' },
  { value: 'AGENCY', label: '🏪 Đại lý', desc: 'Bán & dropship sản phẩm' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', role: 'CUSTOMER' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin.'); return;
    }
    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp.'); return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.'); return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({ username: form.username, email: form.email, password: form.password, role: form.role });
      setSuccess(res.message || 'Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => router.push('/login'), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24,
      background: 'radial-gradient(ellipse at bottom right, #1a1a3e 0%, var(--bg-primary) 60%)',
    }} className="bg-grid">
      <div style={{
        position: 'fixed', top: '10%', right: '15%',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="glass-card fade-in-up" style={{ width: '100%', maxWidth: 480, padding: 40 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            borderRadius: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
            fontSize: 24, color: 'white',
            boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
          }}>✨</div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Tạo tài khoản</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Tham gia sàn TMDT ngay hôm nay
          </p>
        </div>

        {/* Role selector */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">Loại tài khoản</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r.value }))}
                style={{
                  background: form.role === r.value
                    ? 'rgba(99,102,241,0.15)' : 'rgba(10,15,30,0.4)',
                  border: `1px solid ${form.role === r.value ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '12px', cursor: 'pointer',
                  textAlign: 'left', color: 'var(--text-primary)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 2, fontSize: '0.9rem' }}>{r.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Tên đăng nhập</label>
            <input id="reg-username" className="input-field" type="text" placeholder="Từ 3-20 ký tự" value={form.username} onChange={update('username')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input id="reg-email" className="input-field" type="email" placeholder="example@email.com" value={form.email} onChange={update('email')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Mật khẩu</label>
              <input id="reg-password" className="input-field" type="password" placeholder="Ít nhất 6 ký tự" value={form.password} onChange={update('password')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Xác nhận</label>
              <input id="reg-confirm" className="input-field" type="password" placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={update('confirm')} />
            </div>
          </div>

          {error && <div className="alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
          {success && <div className="alert-success" style={{ marginBottom: 16 }}>✅ {success}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: 'var(--accent-light)', fontWeight: 600, textDecoration: 'none' }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
