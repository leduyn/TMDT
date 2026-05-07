'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { customerApi, UserDTO } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    customerApi.getById(Number(id))
      .then(setCustomer)
      .catch(err => {
        console.error(err);
        setError('Không thể tải thông tin khách hàng');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-spinner" />;
  if (error || !customer) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <p style={{ color: 'var(--error)' }}>{error || 'Không tìm thấy khách hàng'}</p>
      <button onClick={() => router.back()} className="btn-outline" style={{ marginTop: 16 }}>Quay lại</button>
    </div>
  );

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{customer.username}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Thông tin chi tiết tài khoản khách hàng</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href={`/customers/${id}/edit`} className="btn-primary" style={{ textDecoration: 'none' }}>
              Chỉnh sửa thông tin
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          {/* Sidebar / Quick Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ 
                width: 100, height: 100, borderRadius: '50%', background: 'var(--accent)', 
                margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40, color: 'white', fontWeight: 800
              }}>
                {customer.username.charAt(0).toUpperCase()}
              </div>
              <h3 style={{ margin: 0 }}>{customer.username}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>{customer.email}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>SĐT: {customer.phone || '---'}</p>
              <span className={`badge ${customer.active ? 'badge-success' : 'badge-warning'}`}>
                {customer.active ? 'Đang hoạt động' : 'Đã khóa'}
              </span>
            </div>

            <div className="glass-card" style={{ padding: 24 }}>
              <h4 style={{ margin: '0 0 16px', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Phân loại</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block' }}>Nhóm khách hàng</small>
                  <strong>{customer.customerGroupName || 'Vãng lai'}</strong>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block' }}>Đại lý quản lý</small>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {customer.agencyNames && customer.agencyNames.length > 0 ? (
                      customer.agencyNames.map((name, i) => (
                        <span key={i} className="badge badge-outline" style={{ borderColor: 'var(--accent)', color: 'var(--accent-light)' }}>{name}</span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Chưa gán đại lý</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Info Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{ padding: 32 }}>
              <h3 style={{ margin: '0 0 24px' }}>Hồ sơ tài khoản</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tên tài khoản</small>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.username}</p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Email đăng ký</small>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.email}</p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Vai trò</small>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.role}</p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Mã khách hàng (ID)</small>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>#{customer.id}</p>
                </div>
              </div>

              <div style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
                <h3 style={{ margin: '0 0 24px' }}>Thông tin tổ chức & Địa chỉ</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tên tổ chức / Công ty</small>
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.organizationName || '---'}</p>
                  </div>
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Mã số thuế</small>
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.taxCode || '---'}</p>
                  </div>
                  <div />
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Địa chỉ nhận hàng</small>
                    <p style={{ fontSize: '1rem', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{customer.shippingAddress || '---'}</p>
                  </div>
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Địa chỉ xuất hóa đơn</small>
                    <p style={{ fontSize: '1rem', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{customer.billingAddress || '---'}</p>
                  </div>
                </div>
              </div>

              {(customer.customName || customer.customShippingAddress || customer.customPhone) && (
                <div style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 32, background: 'rgba(52, 152, 219, 0.05)', padding: 24, borderRadius: 16 }}>
                  <h3 style={{ margin: '0 0 24px', color: '#3498db' }}>Thông tin riêng của đại lý</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                    <div>
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tên gợi nhớ</small>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{customer.customName || '---'}</p>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Số điện thoại riêng</small>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{customer.customPhone || '---'}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Địa chỉ nhận hàng riêng</small>
                      <p style={{ fontSize: '1rem', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{customer.customShippingAddress || '---'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Placeholder for future features */}
            <div className="glass-card" style={{ padding: 32, opacity: 0.7 }}>
              <h3 style={{ margin: '0 0 24px' }}>Lịch sử giao dịch</h3>
              <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border)', borderRadius: 12 }}>
                <p style={{ color: 'var(--text-muted)' }}>Tính năng lịch sử đơn hàng đang được phát triển</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
