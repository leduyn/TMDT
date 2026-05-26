'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { customerApi, customerGroupApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationModal from '@/components/NotificationModal';

export default function AgencyCreateCustomerPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    customerGroupId: '',
    active: true,
    organizationName: '',
    shippingAddress: '',
    billingAddress: '',
    taxCode: '',
    phone: '',
    customName: '',
    customShippingAddress: '',
    customPhone: ''
  });

  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      if (!user.roles?.includes('ROLE_AGENCY')) {
        setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản Người mua.');
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    customerGroupApi.getAll()
      .then(setGroups)
      .catch(err => console.error('Error fetching groups:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user?.agencyId) {
        throw new Error('Không thể xác định thông tin Người mua của bạn.');
      }

      await customerApi.create({
        ...formData,
        customerGroupId: formData.customerGroupId ? Number(formData.customerGroupId) : undefined,
        agencyIds: [user.agencyId] // Tự động gán cho Khách hàng hiện tại
      });
      router.push('/my-customers');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo Người mua');
      setShowErrorModal(true);
      setLoading(false);
    }
  };

  if (authLoading) return <div className="loading-spinner" />;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Tạo Người mua Mới</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Thêm Người mua vào danh sách quản lý của Người mua bạn</p>
        </div>



        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tên đăng nhập (Bắt buộc)</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="Ví dụ: nguyenvan_a"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email (Bắt buộc)</label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tên tổ chức / Công ty</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.organizationName}
                  onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder="Ví dụ: Công ty TNHH ABC"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Mã số thuế</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.taxCode}
                  onChange={e => setFormData({ ...formData, taxCode: e.target.value })}
                  placeholder="Mã số thuế doanh nghiệp"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ xuất hóa đơn</label>
              <textarea
                className="input-field"
                rows={2}
                value={formData.billingAddress}
                onChange={e => setFormData({ ...formData, billingAddress: e.target.value })}
                placeholder="Địa chỉ ghi trên hóa đơn tài chính..."
              />
            </div>

            <div style={{ background: 'rgba(52, 152, 219, 0.1)', padding: 24, borderRadius: 16, border: '1px solid rgba(52, 152, 219, 0.2)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#3498db' }}>Thông tin quản lý của Người mua</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tên gọi Người mua</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.customName}
                    onChange={e => setFormData({ ...formData, customName: e.target.value })}
                    placeholder="Tên gợi nhớ để Người mua dễ quản lý..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Số điện thoại liên lạc</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.customPhone}
                    onChange={e => setFormData({ ...formData, customPhone: e.target.value })}
                    placeholder="Số điện thoại của Người mua..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ giao hàng mặc định</label>
                  <textarea
                    className="input-field"
                    rows={2}
                    value={formData.customShippingAddress}
                    onChange={e => setFormData({ ...formData, customShippingAddress: e.target.value })}
                    placeholder="Địa chỉ cụ thể..."
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1 }}
                onClick={() => router.back()}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !!error}
                style={{ padding: '12px 32px' }}
              >
                {loading ? 'Đang tạo...' : 'Tạo Người mua'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <NotificationModal 
        isOpen={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
        type="error"
        message={error}
      />
    </>
  );
}

