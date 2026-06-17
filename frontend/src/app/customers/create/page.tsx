'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { customerApi, agencyApi, customerGroupApi, AgencyDTO } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CreateCustomerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAgency = user?.roles.includes('ROLE_AGENCY');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    customerGroupId: '',
    agencyIds: [] as number[],
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

  const [agencies, setAgencies] = useState<AgencyDTO[]>([]);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      agencyApi.getAll(),
      customerGroupApi.getAll()
    ]).then(([agenciesData, groupsData]) => {
      setAgencies(agenciesData);
      setGroups(groupsData);
      
      // Nếu là Khách hàng, tự động gán agencyId của chính họ
      if (isAgency && user?.agencyId) {
        setFormData(prev => ({ ...prev, agencyIds: [user.agencyId!] }));
      }
    }).catch(err => console.error('Error fetching data:', err));
  }, [isAgency, user?.agencyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await customerApi.create({
        ...formData,
        customerGroupId: formData.customerGroupId ? Number(formData.customerGroupId) : undefined,
        agencyIds: formData.agencyIds
      });
      router.push('/customers');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo Người mua');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Main>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Thêm Người mua</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Tạo tài khoản Người mua mới và gán quản lý</p>
        </div>

        {error && (
          <div className="alert-error" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tên đăng nhập</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="Ví dụ: customer01"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@example.com"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Số điện thoại</label>
              <input
                type="text"
                className="input-field"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ví dụ: 0987654321"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Mật khẩu</label>
              <input
                type="password"
                className="input-field"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Bỏ trống để dùng mật khẩu mặc định (123456)"
              />
            </div>

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
                placeholder="Ví dụ: 0101234567"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ nhận hàng</label>
              <textarea
                className="input-field"
                rows={2}
                value={formData.shippingAddress}
                onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ xuất hóa đơn</label>
              <textarea
                className="input-field"
                rows={2}
                value={formData.billingAddress}
                onChange={e => setFormData({ ...formData, billingAddress: e.target.value })}
                placeholder="Nhập địa chỉ đăng ký kinh doanh..."
              />
            </div>

            {isAgency && (
              <div style={{ background: 'rgba(52, 152, 219, 0.1)', padding: 24, borderRadius: 16, border: '1px solid rgba(52, 152, 219, 0.2)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#3498db' }}>Thông tin riêng của Người mua</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tên gợi nhớ (Chỉ Người mua thấy)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.customName}
                      onChange={e => setFormData({ ...formData, customName: e.target.value })}
                      placeholder="Ví dụ: Anh Tuấn VIP"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Số điện thoại riêng</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.customPhone}
                      onChange={e => setFormData({ ...formData, customPhone: e.target.value })}
                      placeholder="Số điện thoại dùng để liên lạc riêng..."
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ giao hàng riêng</label>
                    <textarea
                      className="input-field"
                      rows={2}
                      value={formData.customShippingAddress}
                      onChange={e => setFormData({ ...formData, customShippingAddress: e.target.value })}
                      placeholder="Địa chỉ cụ thể cho Người mua này..."
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Nhóm Người mua</label>
                <select
                  className="input-field"
                  value={formData.customerGroupId}
                  onChange={e => setFormData({ ...formData, customerGroupId: e.target.value })}
                >
                  <option value="">-- Mặc định (Vãng lai) --</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              
              {!isAgency && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: 12, fontWeight: 500 }}>Người mua quản lý (Có thể chọn nhiều)</label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                    gap: 12,
                    maxHeight: 200,
                    overflowY: 'auto',
                    padding: 16,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    border: '1px solid var(--border)'
                  }}>
                    {agencies.map(a => (
                      <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.agencyIds.includes(a.id)}
                          onChange={e => {
                            const newIds = e.target.checked 
                              ? [...formData.agencyIds, a.id]
                              : formData.agencyIds.filter(id => id !== a.id);
                            setFormData({ ...formData, agencyIds: newIds });
                          }}
                        />
                        {a.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={e => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="active" style={{ fontWeight: 500 }}>Kích hoạt tài khoản</label>
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
                style={{ flex: 2 }}
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu Người mua'}
              </button>
            </div>
          </form>
        </div>
      </Main>
    </>
  );
}

