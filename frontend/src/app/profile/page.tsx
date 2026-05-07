'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { customerApi, UserDTO } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import NotificationModal from '@/components/NotificationModal';

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'info' as any
  });

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    taxCode: '',
    organizationName: '',
    shippingAddress: '',
    billingAddress: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // Fetch profile data from /api/users/me (added in backend)
      fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setFormData({
          email: data.email || '',
          phone: data.phone || '',
          taxCode: data.taxCode || '',
          organizationName: data.organizationName || '',
          shippingAddress: data.shippingAddress || '',
          billingAddress: data.billingAddress || '',
          password: '',
          confirmPassword: ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setModal({ isOpen: true, title: 'Lỗi', message: 'Không thể tải thông tin hồ sơ', type: 'error' });
        setLoading(false);
      });
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setModal({ isOpen: true, title: 'Lỗi', message: 'Mật khẩu xác nhận không khớp', type: 'error' });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lỗi khi cập nhật hồ sơ');
      }

      setModal({ isOpen: true, title: 'Thành công', message: 'Cập nhật hồ sơ thành công!', type: 'success' });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err: any) {
      setModal({ isOpen: true, title: 'Lỗi cập nhật', message: err.message || 'Lỗi khi cập nhật hồ sơ', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) return <div className="loading-spinner" />;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>Hồ sơ tài khoản</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Quản lý thông tin cá nhân và bảo mật tài khoản</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{ padding: 32 }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '1.2rem' }}>Thông tin cơ bản</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Tên đăng nhập</label>
                  <input type="text" className="input-field" value={profile?.username} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Email</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Số điện thoại</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại chính thức"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 32 }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '1.2rem' }}>Đổi mật khẩu</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Mật khẩu mới</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Để trống nếu không muốn đổi"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Xác nhận mật khẩu</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={formData.confirmPassword} 
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{ padding: 32 }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '1.2rem' }}>Thông tin tổ chức</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Tên tổ chức / Công ty</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.organizationName} 
                    onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                    placeholder="Tên công ty hoặc hộ kinh doanh"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Mã số thuế</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.taxCode} 
                    onChange={e => setFormData({ ...formData, taxCode: e.target.value })}
                    placeholder="Nhập mã số thuế (nếu có)"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 32 }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '1.2rem' }}>Địa chỉ mặc định</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Địa chỉ nhận hàng</label>
                  <textarea 
                    className="input-field" 
                    rows={3} 
                    value={formData.shippingAddress} 
                    onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })}
                    placeholder="Địa chỉ nhận hàng mặc định"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Địa chỉ xuất hóa đơn</label>
                  <textarea 
                    className="input-field" 
                    rows={3} 
                    value={formData.billingAddress} 
                    onChange={e => setFormData({ ...formData, billingAddress: e.target.value })}
                    placeholder="Địa chỉ ghi trên hóa đơn"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ padding: '16px', fontWeight: 600, fontSize: '1rem', marginTop: 8 }}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
            </button>
          </div>
        </form>
      </main>

      <NotificationModal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </>
  );
}
