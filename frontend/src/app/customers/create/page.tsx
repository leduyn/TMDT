'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { customerApi, agencyApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SearchableSelect from '@/components/ui/SearchableSelect';

export default function CreateCustomerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAgency = user?.roles.includes('ROLE_AGENCY');
  const [formData, setFormData] = useState({
    agencyId: isAgency && user?.agencyId ? user.agencyId : 0,
    organizationName: '',
    taxCode: '',
    shippingAddress: '',
    billingAddress: '',
    receiverName: '',
    receiverPhone: '',
    note: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await customerApi.create({
        ...formData,
        agencyId: formData.agencyId || undefined
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
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Tạo hồ sơ người mua mới</p>
        </div>

        {error && (
          <div className="alert-error" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tên tổ chức / Công ty</label>
                <input type="text" className="input-field" value={formData.organizationName} onChange={e => setFormData({ ...formData, organizationName: e.target.value })} placeholder="Ví dụ: Công ty TNHH ABC" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Mã số thuế</label>
                <input type="text" className="input-field" value={formData.taxCode} onChange={e => setFormData({ ...formData, taxCode: e.target.value })} placeholder="0101234567" />
              </div>
            </div>

            {!isAgency && (
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Đại lý quản lý</label>
                <input type="number" className="input-field" value={formData.agencyId || ''} onChange={e => setFormData({ ...formData, agencyId: Number(e.target.value) })} placeholder="Nhập ID Đại lý" />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ nhận hàng</label>
              <textarea className="input-field" rows={2} value={formData.shippingAddress} onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..." />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ xuất hóa đơn</label>
              <textarea className="input-field" rows={2} value={formData.billingAddress} onChange={e => setFormData({ ...formData, billingAddress: e.target.value })} placeholder="Địa chỉ đăng ký kinh doanh..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Người nhận hàng</label>
                <input type="text" className="input-field" value={formData.receiverName} onChange={e => setFormData({ ...formData, receiverName: e.target.value })} placeholder="Tên người nhận" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>SĐT người nhận</label>
                <input type="text" className="input-field" value={formData.receiverPhone} onChange={e => setFormData({ ...formData, receiverPhone: e.target.value })} placeholder="Số điện thoại người nhận" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Ghi chú</label>
              <textarea className="input-field" rows={2} value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} placeholder="Ghi chú thêm về người mua..." />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => router.back()}>Hủy</button>
              <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu Người mua'}
              </button>
            </div>
          </form>
        </div>
      </Main>
    </>
  );
}
