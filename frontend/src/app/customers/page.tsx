'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

interface Customer {
  id: number;
  username: string;
  email: string;
  role: string;
  customerGroupName: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (token) {
      fetch('http://localhost:8080/api/users/customers', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          setCustomers(Array.isArray(d) ? d : []);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [token]);

  const filteredCustomers = customers.filter(c => 
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="loading-spinner" />;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Quản lý Khách hàng</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Danh sách khách lẻ đăng ký trên hệ thống</p>
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
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Xem Đơn hàng</button>
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
    </>
  );
}
