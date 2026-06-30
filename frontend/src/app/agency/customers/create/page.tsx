'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { customerApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationModal from '@/components/NotificationModal';

export default function AgencyCreateCustomerPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
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
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user?.agencyId) {
        throw new Error('Không thể xác định thông tin Đại lý của bạn.');
      }

      await customerApi.create({
        ...formData,
        agencyId: user.agencyId
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
      <Main>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Tạo Người mua Mới</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Thêm Người mua vào danh sách quản lý của bạn</p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tên tổ chức / Công ty</label>
                <input type="text" className="input-field" value={formData.organizationName} onChange={e => setFormData({ ...formData, organizationName: e.target.value })} placeholder="Ví dụ: Công ty TNHH ABC" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Mã số thuế</label>
                <input type="text" className="input-field" value={formData.taxCode} onChange={e => setFormData({ ...formData, taxCode: e.target.value })} placeholder="Mã số thuế doanh nghiệp" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ nhận hàng</label>
              <textarea className="input-field" rows={2} value={formData.shippingAddress} onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })} placeholder="Địa chỉ giao hàng..." />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ xuất hóa đơn</label>
              <textarea className="input-field" rows={2} value={formData.billingAddress} onChange={e => setFormData({ ...formData, billingAddress: e.target.value })} placeholder="Địa chỉ ghi trên hóa đơn..." />
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
              <textarea className="input-field" rows={2} value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} placeholder="Ghi chú thêm..." />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => router.back()}>Hủy</button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px 32px' }}>
                {loading ? 'Đang tạo...' : 'Tạo Người mua'}
              </button>
            </div>
          </form>
        </div>
      </Main>

      <NotificationModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        message={error}
      />
    </>
  );
}
