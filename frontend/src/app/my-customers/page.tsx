'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { agencyApi, UserDTO } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function MyCustomersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Check if user has AGENCY role before calling API
      if (!user.roles?.includes('ROLE_AGENCY')) {
        setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản Đại lý.');
        setIsLoading(false);
        return;
      }

      if (user.id) {
        fetchMyCustomers(user.id);
      } else {
        setIsLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchMyCustomers = async (userId: number) => {
    try {
      setError('');
      
      let agencyId = user?.agencyId;
      
      // Nếu chưa có agencyId trong user object, thử lấy từ API
      if (!agencyId) {
        const agencyData = await agencyApi.getMe(userId);
        agencyId = agencyData.id;
      }

      if (agencyId) {
        const customersData = await agencyApi.getCustomers(agencyId);
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } else {
        setError('Không tìm thấy thông tin đại lý cho tài khoản này.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải danh sách khách hàng.');
    } finally {
      setIsLoading(false);
    }
  };


  const filteredCustomers = customers.filter(c => 
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div className="spinner" style={{ width: 40, height: 40 }}></div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Khách hàng của tôi</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Quản lý danh sách khách hàng đang do đại lý của bạn phụ trách</p>
          </div>
          <Link href="/agency/customers/create" className="btn-primary" style={{ textDecoration: 'none' }}>
            + Tạo khách hàng mới
          </Link>
        </div>

        {error && (
          <div className="alert-error" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm khách hàng theo tên hoặc email..." 
            className="input-field"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ margin: 0, maxWidth: 400 }}
          />
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>KHÁCH HÀNG</th>
                 <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>LIÊN HỆ</th>
                 <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>NHÓM KHÁCH HÀNG</th>
                 <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>TRẠNG THÁI</th>
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
                        {customer.active ? 'Đang hoạt động' : 'Chờ Admin duyệt'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <Link href={`/agency/customers/${customer.id}`} className="btn-outline" style={{ padding: '6px 16px', fontSize: '0.8rem', textDecoration: 'none' }}>
                        Xem chi tiết
                      </Link>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              {searchQuery ? 'Không tìm thấy khách hàng nào.' : 'Bạn chưa quản lý khách hàng nào.'}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
