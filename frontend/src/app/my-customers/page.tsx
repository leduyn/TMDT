'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

interface Customer {
  id: number;
  username: string;
  email: string;
}

export default function MyCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    if (token && userId) {
      fetchMyCustomers();
    }
  }, [token, userId]);

  const fetchMyCustomers = async () => {
    try {
      // Bướ 1: Lấy agencyId từ userId
      const agencyRes = await fetch(`http://localhost:8080/api/agencies/me?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const agencyData = await agencyRes.json();
      
      if (agencyData.id) {
        // Bước 2: Lấy danh sách khách hàng của agency đó
        const customersRes = await fetch(`http://localhost:8080/api/agencies/${agencyData.id}/customers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const customersData = await customersRes.json();
        setCustomers(Array.isArray(customersData) ? customersData : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading-spinner" />;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Khách hàng của tôi</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Danh sách khách hàng đã từng đặt hàng tại đại lý của bạn</p>
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>TÊN KHÁCH HÀNG</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>LIÊN HỆ</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600 }}>{customer.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {customer.id}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>{customer.email}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Xem Lịch sử mua hàng</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              Chưa có khách hàng nào đặt hàng tại đại lý của bạn.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
