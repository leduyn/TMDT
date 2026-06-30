'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { customerApi, CustomerDTO, orderApi, OrderDTO } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDTO | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'orders'>('info');

  useEffect(() => {
    if (!id) return;
    const customerId = Number(id);

    customerApi.getById(customerId)
      .then(setCustomer)
      .catch(err => {
        console.error(err);
        setError('Không thể tải thông tin người mua');
      })
      .finally(() => setLoading(false));

    orderApi.getByCustomerId(customerId)
      .then(setOrders)
      .catch(err => {
        console.error('Error fetching orders:', err);
      })
      .finally(() => setLoadingOrders(false));
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#2ecc71';
      case 'PROCESSING': return '#3498db';
      case 'PENDING': return '#f1c40f';
      case 'CANCELLED': return '#e74c3c';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'PROCESSING': return 'Đang xử lý';
      case 'PENDING': return 'Chờ xử lý';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) return <div className="loading-spinner" />;
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 70, height: 70, borderRadius: 20, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, color: 'white', fontWeight: 800,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            }}>
              {(customer.organizationName || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{customer.organizationName || '#' + customer.id}</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>ID: #{customer.id}{customer.taxCode ? ` • MST: ${customer.taxCode}` : ''}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href={`/customers/${id}/edit`} className="btn-primary" style={{ textDecoration: 'none' }}>
              Chỉnh sửa thông tin
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32,
          padding: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 16,
          width: 'fit-content'
        }}>
          <button
            onClick={() => setActiveTab('info')}
            style={{
              padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: activeTab === 'info' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'info' ? 'white' : 'var(--text-muted)',
              fontWeight: 600, transition: 'all 0.3s ease'
            }}
          >
            Thông tin chung
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: activeTab === 'orders' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'orders' ? 'white' : 'var(--text-muted)',
              fontWeight: 600, transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            Đơn hàng
            <span style={{
              fontSize: '0.75rem', padding: '2px 8px', borderRadius: 8,
              background: activeTab === 'orders' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'
            }}>
              {orders.length}
            </span>
          </button>
        </div>

        {activeTab === 'info' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="glass-card" style={{ padding: 24 }}>
                <h4 style={{ margin: '0 0 16px', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Người nhận</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block' }}>Tên người nhận</small>
                    <strong>{customer.receiverName || '---'}</strong>
                  </div>
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block' }}>Số điện thoại</small>
                    <strong>{customer.receiverPhone || '---'}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="glass-card" style={{ padding: 32 }}>
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
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Đại lý quản lý</small>
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.agencyId ? `ID: ${customer.agencyId}` : '---'}</p>
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
        ) : (
          <div className="glass-card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}>Lịch sử giao dịch</h3>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{orders.length} đơn hàng</span>
            </div>

            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="loading-spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : orders.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Mã đơn</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Ngày đặt</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Tổng tiền</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Loại</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Trạng thái</th>
                      <th style={{ padding: '12px 8px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} className="table-row-hover">
                        <td style={{ padding: '16px 8px', fontWeight: 600 }}>#{order.id}</td>
                        <td style={{ padding: '16px 8px' }}>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                        <td style={{ padding: '16px 8px', fontWeight: 700 }}>{order.totalAmount.toLocaleString('vi-VN')}đ</td>
                        <td style={{ padding: '16px 8px' }}>
                          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{order.orderType}</span>
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                            background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status),
                            border: `1px solid ${getStatusColor(order.status)}40`
                          }}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                          <Link href={`/orders/${order.id}`} className="btn-text" style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed var(--border)', borderRadius: 12 }}>
                <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>🛒</div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Chưa có giao dịch nào được ghi nhận</p>
              </div>
            )}
          </div>
        )}
      </Main>
    </>
  );
}
