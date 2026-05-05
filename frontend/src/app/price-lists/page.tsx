'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

interface PriceList {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
  active: boolean;
  createdAt: string;
  itemCount: number;
}

export default function PriceListsPage() {
  const { user, token } = useAuth();
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('PriceListsPage loaded');
    fetchPriceLists();
  }, []);

  const fetchPriceLists = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/price-lists', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPriceLists(data);
      } else {
        console.error('Data is not an array:', data);
        setPriceLists([]);
      }
    } catch (err) {
      console.error('Failed to fetch price lists', err);
      setPriceLists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/api/price-lists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newListName, description: newListDesc, isDefault })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewListName('');
        setNewListDesc('');
        setIsDefault(false);
        fetchPriceLists();
      } else {
        const err = await res.json();
        alert(err.message || 'Lỗi khi tạo bảng giá');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bảng giá này?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/price-lists/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchPriceLists();
      else alert('Không thể xóa bảng giá (có thể đây là bảng giá mặc định)');
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
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Quản lý <span className="gradient-text">Bảng giá</span></h1>
            <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
              Thiết lập giá sản phẩm cho các nhóm đối tượng khác nhau.
            </p>
          </div>
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => setShowCreateModal(true)}>
            + Tạo bảng giá mới
          </button>
        </div>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Tên bảng giá</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Mô tả</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>Số sản phẩm</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {priceLists.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Chưa có bảng giá nào.
                  </td>
                </tr>
              ) : priceLists.map((pl) => (
                <tr key={pl.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 600 }}>{pl.name}</span>
                      {pl.isDefault && <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Mặc định</span>}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pl.description || '—'}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{pl.itemCount}</span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span className={`badge ${pl.active ? 'badge-success' : 'badge-danger'}`}>
                      {pl.active ? 'Đang hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <Link href={`/price-lists/${pl.id}`}>
                        <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Chi tiết</button>
                      </Link>
                      {!pl.isDefault && (
                        <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#ff4d4f' }} 
                                onClick={() => handleDelete(pl.id)}>Xóa</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form className="glass-card fade-in-up" style={{ width: 500, padding: 32 }} onSubmit={handleCreate}>
            <h2 style={{ marginBottom: 24 }}>Tạo bảng giá mới</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Tên bảng giá</label>
                <input required value={newListName} onChange={e => setNewListName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Mô tả</label>
                <textarea rows={3} value={newListDesc} onChange={e => setNewListDesc(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
                <span style={{ fontSize: '0.9rem' }}>Đặt làm bảng giá mặc định</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" className="btn-outline" style={{ width: 'auto' }} onClick={() => setShowCreateModal(false)}>Hủy</button>
              <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Lưu bảng giá</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
