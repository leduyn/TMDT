'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import { UserPlus, Eye, Phone, MapPin, User as UserIcon } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
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

  const filteredAgencies = agencies.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Agency>[] = [
    { 
      header: 'Đại lý', 
      key: 'name',
      width: '25%',
      render: (a) => (
        <div>
          <div style={{ fontWeight: 600 }}>{a.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {a.id}</div>
        </div>
      )
    },
    { 
      header: 'Liên hệ', 
      key: 'phone',
      width: '30%',
      render: (a) => (
        <div style={{ fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Phone size={14} style={{ color: 'var(--accent)' }} /> {a.phone}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
            <MapPin size={14} /> {a.address}
          </div>
        </div>
      )
    },
    { 
      header: 'Tài khoản', 
      key: 'username',
      width: '20%',
      render: (a) => (
        <Badge label={a.username} type="primary" icon="User" />
      )
    },
    { 
      header: 'Trạng thái', 
      key: 'active',
      align: 'center',
      width: '15%',
      render: (a) => (
        <Badge 
          label={a.active ? 'Đang hoạt động' : 'Tạm ngưng'} 
          type={a.active ? 'success' : 'error'} 
          icon={a.active ? 'CheckCircle' : 'PauseCircle'}
        />
      )
    },
    { 
      header: 'Thao tác', 
      key: 'actions', 
      align: 'right',
      render: (a) => (
        <button className="btn-outline" style={{ padding: '8px', borderRadius: 8 }}>
          <Eye size={16} />
        </button>
      )
    }
  ];

  return (
    <>
      <Navbar />
      <main style={{ padding: '20px 0' }}>
        <PageHeader 
          title="Quản lý Đại lý" 
          subtitle="Danh sách và thiết lập các đại lý ủy quyền trong hệ thống"
          icon="Building2"
        />

        <SearchActionHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm đại lý theo tên, SĐT hoặc tài khoản..."
          actions={
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <UserPlus size={18} />
              Thêm Đại lý mới
            </button>
          }
        />

        <DataTable 
          data={filteredAgencies}
          columns={columns}
          loading={isLoading}
          emptyMessage={searchQuery ? 'Không tìm thấy đại lý nào phù hợp' : 'Chưa có đại lý nào'}
        />

        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <GlassCard className="fade-in" style={{ width: '100%', maxWidth: 500, padding: 32 }}>
              <h2 style={{ marginBottom: 24, marginTop: 0 }}>Thêm Đại lý mới</h2>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tên Đại lý</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value={newAgency.name}
                    onChange={e => setNewAgency({...newAgency, name: e.target.value})}
                    placeholder="Nhập tên đại lý..."
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Số điện thoại</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      required 
                      value={newAgency.phone}
                      onChange={e => setNewAgency({...newAgency, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Chọn Tài khoản</label>
                    <select 
                      className="input-field" 
                      required 
                      value={newAgency.userId}
                      onChange={e => setNewAgency({...newAgency, userId: parseInt(e.target.value)})}
                    >
                      <option value="0">-- Chọn tài khoản --</option>
                      {unassignedUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Địa chỉ</label>
                  <input 
                    type="text" 
                    className="input-field" 
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
            </GlassCard>
          </div>
        )}
      </main>
    </>
  );
}
