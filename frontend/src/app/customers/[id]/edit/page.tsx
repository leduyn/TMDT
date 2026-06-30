'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { customerApi } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function EditCustomerPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    organizationName: '',
    taxCode: '',
    shippingAddress: '',
    billingAddress: '',
    receiverName: '',
    receiverPhone: '',
    note: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    customerApi.getById(Number(id))
      .then(customer => {
        setFormData({
          organizationName: customer.organizationName || '',
          taxCode: customer.taxCode || '',
          shippingAddress: customer.shippingAddress || '',
          billingAddress: customer.billingAddress || '',
          receiverName: customer.receiverName || '',
          receiverPhone: customer.receiverPhone || '',
          note: customer.note || ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching customer:', err);
        setError('Không thể tải thông tin người mua');
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await customerApi.update(Number(id), formData);
      router.push('/customers');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật người mua');
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <>
      <Navbar />
      <Main>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Sửa Người mua</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Cập nhật thông tin người mua</p>
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
                <input type="text" className="input-field" value={formData.organizationName} onChange={e => setFormData({ ...formData, organizationName: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Mã số thuế</label>
                <input type="text" className="input-field" value={formData.taxCode} onChange={e => setFormData({ ...formData, taxCode: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ nhận hàng</label>
              <textarea className="input-field" rows={2} value={formData.shippingAddress} onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ xuất hóa đơn</label>
              <textarea className="input-field" rows={2} value={formData.billingAddress} onChange={e => setFormData({ ...formData, billingAddress: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Người nhận hàng</label>
                <input type="text" className="input-field" value={formData.receiverName} onChange={e => setFormData({ ...formData, receiverName: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>SĐT người nhận</label>
                <input type="text" className="input-field" value={formData.receiverPhone} onChange={e => setFormData({ ...formData, receiverPhone: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Ghi chú</label>
              <textarea className="input-field" rows={2} value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => router.back()}>Hủy</button>
              <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </Main>
    </>
  );
}
