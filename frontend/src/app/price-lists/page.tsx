'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { useAuth } from '@/context/AuthContext';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import { Plus, Eye, Trash2, FileText, Clock } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    fetchPriceLists();
  }, []);

  const fetchPriceLists = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/price-lists', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPriceLists(data);
      }
    } catch (err) {
      console.error('Failed to fetch price lists', err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const filteredLists = priceLists.filter(pl => 
    pl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pl.description && pl.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredLists.length / pageSize) || 1;
  const paginatedLists = filteredLists.slice(page * pageSize, (page + 1) * pageSize);

  const columns: Column<PriceList>[] = [
    { 
      header: 'Tên bảng giá', 
      key: 'name', 
      width: '25%',
      render: (pl) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 600 }}>{pl.name}</span>
          {pl.isDefault && <Badge label="Mặc định" type="warning" icon="Star" />}
        </div>
      )
    },
    { 
      header: 'Mô tả', 
      key: 'description', 
      width: '30%',
      render: (pl) => (
        <div style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem',
          maxWidth: 300, 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis' 
        }}>
          {pl.description || '—'}
        </div>
      )
    },
    { 
      header: 'Sản phẩm', 
      key: 'itemCount', 
      align: 'center',
      width: '15%',
      render: (pl) => (
        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{pl.itemCount}</span>
      )
    },
    { 
      header: 'Trạng thái', 
      key: 'active', 
      align: 'center',
      width: '15%',
      render: (pl) => (
        <Badge 
          label={pl.active ? 'Đang hoạt động' : 'Tạm ngưng'} 
          type={pl.active ? 'success' : 'error'} 
          icon={pl.active ? 'CheckCircle' : 'PauseCircle'}
        />
      )
    },
    { 
      header: 'Thao tác', 
      key: 'actions', 
      align: 'right',
      render: (pl) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Link href={`/price-lists/${pl.id}`} className="btn-outline" style={{ padding: '8px', borderRadius: 8 }}>
            <Eye size={16} />
          </Link>
          {!pl.isDefault && (
            <button className="btn-outline" style={{ padding: '8px', borderRadius: 8, color: '#ef4444' }} 
                    onClick={() => handleDelete(pl.id)}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <Navbar />
      <Main>
        <PageHeader 
          title="Quản lý Bảng giá" 
          subtitle="Thiết lập các kịch bản giá cho các nhóm Khách hàng và Người mua khác nhau"
          icon="ClipboardList"
        />

        <SearchActionHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm bảng giá..."
          actions={
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/price-update-vouchers">
                <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} />
                  Cập nhật giá
                </button>
              </Link>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                <Plus size={18} />
                Tạo bảng giá mới
              </button>
            </div>
          }
        />

        <DataTable 
          data={paginatedLists}
          columns={columns}
          loading={isLoading}
          emptyMessage={searchQuery ? 'Không tìm thấy bảng giá nào phù hợp' : 'Chưa có bảng giá nào'}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Main>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <GlassCard className="fade-in-up" style={{ width: 500, padding: 32 }}>
            <h2 style={{ marginBottom: 24, marginTop: 0 }}>Tạo bảng giá mới</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Tên bảng giá</label>
                  <input required value={newListName} onChange={e => setNewListName(e.target.value)}
                    className="input-field" placeholder="Ví dụ: Bảng giá Khách hàng Vàng 2024" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Mô tả</label>
                  <textarea rows={3} value={newListDesc} onChange={e => setNewListDesc(e.target.value)}
                    className="input-field" placeholder="Ghi chú về đối tượng hoặc thời điểm áp dụng..." />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
                  <span style={{ fontSize: '0.9rem' }}>Đặt làm bảng giá mặc định</span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowCreateModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu bảng giá</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </>
  );
}

