'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

interface Agency {
  id: number;
  name: string;
  phone: string;
  address: string;
  username: string;
  userId: number;
  active: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAgency, setNewAgency] = useState({ name: '', phone: '', address: '', userId: 0 });
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const [agenciesRes, usersRes] = await Promise.all([
        fetch('http://localhost:8080/api/agencies', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:8080/api/users/agencies-unassigned', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const agenciesData = await agenciesRes.json();
      const usersData = await usersRes.json();
      setAgencies(Array.isArray(agenciesData) ? agenciesData : []);
      setUnassignedUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/api/agencies', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgency)
      });
      if (res.ok) {
        setShowModal(false);
        setNewAgency({ name: '', phone: '', address: '', userId: 0 });
        fetchData();
      }
    } catch (err) {
      alert('Lỗi khi tạo đại lý');
    }
  };

  if (isLoading) return <div className="loading-spinner" />;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Quản lý Đại lý</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Danh sách và thiết lập các đại lý trong hệ thống</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Thêm Đại lý mới</button>
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>ĐẠI LÝ</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>LIÊN HỆ</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>TÀI KHOẢN</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>TRẠNG THÁI</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map(agency => (
                <tr key={agency.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600 }}>{agency.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {agency.id}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div>{agency.phone}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{agency.address}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className="badge badge-outline">{agency.username}</span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span className={`badge ${agency.active ? 'badge-success' : 'badge-danger'}`}>
                      {agency.active ? 'Đang hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 500, padding: 32 }}>
              <h2 style={{ marginBottom: 24 }}>Thêm Đại lý mới</h2>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tên Đại lý</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={newAgency.name}
                    onChange={e => setNewAgency({...newAgency, name: e.target.value})}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Số điện thoại</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={newAgency.phone}
                      onChange={e => setNewAgency({...newAgency, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Chọn Tài khoản</label>
                    <select 
                      className="form-control" 
                      required 
                      value={newAgency.userId}
                      onChange={e => setNewAgency({...newAgency, userId: parseInt(e.target.value)})}
                    >
                      <option value="0">-- Chọn tài khoản --</option>
                      {unassignedUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.username} ({user.email})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Địa chỉ</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={newAgency.address}
                    onChange={e => setNewAgency({...newAgency, address: e.target.value})}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn-primary">Tạo Đại lý</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
