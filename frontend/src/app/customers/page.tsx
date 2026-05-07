'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

import { customerApi, UserDTO } from '@/lib/api';
import Link from 'next/link';
import NotificationModal from '@/components/NotificationModal';

type Customer = UserDTO;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'info' as any
  });
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    customerApi.getAll()
      .then(d => {
        setCustomers(d);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const handleActivate = async (id: number) => {
    try {
      await customerApi.activate(id);
      setModal({ isOpen: true, title: 'Thành công', message: 'Đã kích hoạt khách hàng thành công!', type: 'success' });
      fetchCustomers();
    } catch (err: any) {
      setModal({ isOpen: true, title: 'Lỗi kích hoạt', message: err.message || 'Lỗi khi duyệt khách hàng', type: 'error' });
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="loading-spinner" />;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Quản lý Khách hàng</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Danh sách khách lẻ đăng ký trên hệ thống</p>
          </div>
          <Link href="/customers/create" className="btn-primary" style={{ textDecoration: 'none' }}>
            + Thêm khách hàng
          </Link>
        </div>

        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm khách hàng theo tên hoặc email..." 
            className="form-control"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>KHÁCH HÀNG</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>EMAIL</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>NHÓM KHÁCH HÀNG</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>TRẠNG THÁI</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>ĐẠI LÝ QUẢN LÝ</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600 }}>{customer.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {customer.id}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>{customer.email}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className="badge badge-outline">{customer.customerGroupName || 'Vãng lai'}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className={`badge ${customer.active ? 'badge-success' : 'badge-warning'}`}>
                      {customer.active ? 'Đang hoạt động' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {customer.agencyNames && customer.agencyNames.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {customer.agencyNames.map((name, i) => (
                          <span key={i} className="badge badge-outline" style={{ fontSize: '0.7rem', borderColor: 'var(--accent)', color: 'var(--accent-light)' }}>{name}</span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa gán</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                      {!customer.active && (
                        <button 
                          onClick={() => handleActivate(customer.id)}
                          className="btn-primary" 
                          style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                        >
                          Duyệt
                        </button>
                      )}
                      <Link href={`/customers/${customer.id}`} className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem', textDecoration: 'none' }}>Chi tiết</Link>
                      <Link href={`/customers/${customer.id}/edit`} className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem', textDecoration: 'none' }}>Sửa</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              Không tìm thấy khách hàng nào.
            </div>
          )}
        </div>
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
