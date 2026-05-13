'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

interface CustomerGroup {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export default function CustomerGroupsPage() {
  const { token } = useAuth();
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/customer-groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setGroups(data);
      else setGroups([]);
    } catch (err) {
      console.error('Failed to fetch groups', err);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenModal = (group: CustomerGroup | null = null) => {
    setEditingGroup(group);
    setName(group ? group.name : '');
    setDescription(group ? group.description : '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingGroup 
      ? `http://localhost:8080/api/customer-groups/${editingGroup.id}`
      : 'http://localhost:8080/api/customer-groups';
    const method = editingGroup ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description })
      });
      if (res.ok) {
        setShowModal(false);
        fetchGroups();
      } else {
        const err = await res.json();
        alert(err.message || 'Thao tác thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhóm này?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/customer-groups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchGroups();
      else alert('Xóa thất bại');
    } catch (err) {
      alert('Lỗi hệ thống');
    }
  };

  if (isLoading) return <div className="loading-spinner" />;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Nhóm <span className="gradient-text">Người mua</span></h1>
            <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
              Phân loại Người mua để áp dụng các chính sách giá riêng biệt.
            </p>
          </div>
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => handleOpenModal()}>
            + Tạo nhóm mới
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
          {groups.map(group => (
            <div key={group.id} className="glass-card fade-in-up" style={{ padding: 24, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{group.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ID: {group.id}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, minHeight: 40 }}>
                {group.description || 'Không có mô tả cho nhóm này.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Tạo ngày: {new Date(group.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleOpenModal(group)}>Sửa</button>
                  <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#ff4d4f' }} onClick={() => handleDelete(group.id)}>Xóa</button>
                </div>
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Chưa có nhóm Người mua nào được thiết lập.
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form className="glass-card fade-in-up" style={{ width: 450, padding: 32 }} onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: 24 }}>{editingGroup ? 'Cập nhật nhóm' : 'Tạo nhóm mới'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Tên nhóm</label>
                <input required value={name} onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Mô tả</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" className="btn-outline" style={{ width: 'auto' }} onClick={() => setShowModal(false)}>Hủy</button>
              <button type="submit" className="btn-primary" style={{ width: 'auto' }}>{editingGroup ? 'Cập nhật' : 'Lưu nhóm'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

