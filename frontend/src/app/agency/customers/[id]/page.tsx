'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { customerApi, CustomerDTO } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationModal from '@/components/NotificationModal';

export default function AgencyCustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [customer, setCustomer] = useState<CustomerDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'info' as any
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      if (!user.roles?.includes('ROLE_AGENCY')) {
        setError('Bạn không có quyền truy cập trang này.');
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!id) return;
    customerApi.getById(Number(id))
      .then(data => {
        setCustomer(data);
      })
      .catch(err => {
        console.error(err);
        setError('Không thể tải thông tin người mua');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (authLoading || loading) return <div className="loading-spinner" />;
  if (error || !customer) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <p style={{ color: 'var(--error)' }}>{error || 'Không tìm thấy người mua'}</p>
      <button onClick={() => router.back()} className="btn-outline" style={{ marginTop: 16 }}>Quay lại</button>
    </div>
  );

  return (
    <>
      <Navbar />
      <Main>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{customer.organizationName || '#' + customer.id}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Thông tin chi tiết người mua</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%', background: 'var(--accent)',
                margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40, color: 'white', fontWeight: 800
              }}>
                {(customer.organizationName || 'C').charAt(0).toUpperCase()}
              </div>
              <h3 style={{ margin: 0 }}>{customer.organizationName || '#' + customer.id}</h3>
              {customer.receiverName && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>Người nhận: {customer.receiverName}</p>}
              {customer.receiverPhone && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>SĐT: {customer.receiverPhone}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{ padding: 32 }}>
              <h3 style={{ margin: '0 0 24px' }}>Hồ sơ người mua</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tên tổ chức</small>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.organizationName || '---'}</p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Mã số thuế</small>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.taxCode || '---'}</p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Người nhận</small>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.receiverName || '---'}</p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>SĐT người nhận</small>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.receiverPhone || '---'}</p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Địa chỉ nhận hàng</small>
                  <p style={{ fontSize: '1rem', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{customer.shippingAddress || '---'}</p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Địa chỉ xuất hóa đơn</small>
                  <p style={{ fontSize: '1rem', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{customer.billingAddress || '---'}</p>
                </div>
                {customer.note && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Ghi chú</small>
                    <p style={{ fontSize: '1rem', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{customer.note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  );
}
