'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationModal from '@/components/NotificationModal';
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { regionApi, BusinessRegionDTO, BusinessRegionRequest, ProvinceDTO, WardDTO } from '@/lib/api';
import { MapPin, Plus, Edit2, Trash2, X, Map, RefreshCw } from 'lucide-react';
import LocationSelector from '@/modules/region/LocationSelector';
import Pagination from '@/components/ui/Pagination';

export default function RegionManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [regions, setRegions] = useState<BusinessRegionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<BusinessRegionDTO | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<BusinessRegionRequest>({
    code: '',
    name: '',
    description: '',
    active: true,
    wardIds: []
  });
  const [hierarchy, setHierarchy] = useState<ProvinceDTO[]>([]);

  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false, title: '', message: '', type: 'info'
  });

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const data = await regionApi.getAll();
      setRegions(data);
    } catch (e: any) {
      setNotification({ isOpen: true, title: 'Lỗi', message: e.message || 'Không thể tải danh sách khu vực', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user || !user.roles.includes('ROLE_COMPANY')) {
        router.push('/login');
        return;
      }
      fetchRegions();
      regionApi.getHierarchy().then(setHierarchy).catch(console.error);
    }
  }, [user, isLoading, router]);

  const handleOpenCreate = () => {
    setEditingRegion(null);
    setFormData({ code: '', name: '', description: '', active: true, wardIds: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (region: BusinessRegionDTO) => {
    setEditingRegion(region);
    setFormData({
      code: region.code,
      name: region.name,
      description: region.description || '',
      active: region.active,
      wardIds: region.wardIds || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khu vực này?')) return;
    try {
      await regionApi.delete(id);
      setNotification({ isOpen: true, title: 'Thành công', message: 'Đã xóa khu vực', type: 'success' });
      fetchRegions();
    } catch (e: any) {
      setNotification({ isOpen: true, title: 'Lỗi', message: e.message || 'Không thể xóa khu vực', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRegion) {
        await regionApi.update(editingRegion.id, formData);
        setNotification({ isOpen: true, title: 'Thành công', message: 'Cập nhật khu vực thành công', type: 'success' });
      } else {
        await regionApi.create(formData);
        setNotification({ isOpen: true, title: 'Thành công', message: 'Thêm khu vực thành công', type: 'success' });
      }
      setIsModalOpen(false);
      fetchRegions();
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Lỗi', message: error.message || 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const handleSyncProvinces = async () => {
    try {
      const res = await regionApi.syncProvinces();
      setNotification({ isOpen: true, title: 'Đang đồng bộ', message: res.message || 'Quá trình đồng bộ tỉnh thành đã bắt đầu', type: 'info' });
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Lỗi', message: error.message || 'Không thể đồng bộ', type: 'error' });
    }
  };



  const handleSyncWards = async () => {
    try {
      const res = await regionApi.syncWards();
      setNotification({ isOpen: true, title: 'Đang đồng bộ', message: res.message || 'Quá trình đồng bộ phường xã đã bắt đầu', type: 'info' });
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Lỗi', message: error.message || 'Không thể đồng bộ', type: 'error' });
    }
  };

  const filteredRegions = regions.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRegions.length / pageSize) || 1;
  const paginatedRegions = filteredRegions.slice(page * pageSize, (page + 1) * pageSize);

  const columns: Column<BusinessRegionDTO>[] = [
    {
      header: 'Mã',
      key: 'code',
      render: (r) => <strong style={{ color: 'var(--accent)' }}>{r.code}</strong>
    },
    {
      header: 'Tên khu vực',
      key: 'name',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.name}</div>
          {r.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.description}</div>}
        </div>
      )
    },
    {
      header: 'Phạm vi khu vực',
      key: 'wardIds',
      render: (r) => {
        const selectedWards = (r.wardIds || []).map(Number);
        if (selectedWards.length === 0) return <span style={{ color: 'var(--text-muted)' }}>Chưa cấu hình</span>;

        let provinceCount = 0;
        (hierarchy || []).forEach(p => {
          const hasWard = (p.wards || []).some(w => selectedWards.includes(Number(w.id)));
          if (hasWard) provinceCount++;
        });

        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span className="badge badge-outline" style={{ fontSize: '0.75rem', padding: '3px 8px', color: 'var(--accent)' }}>
              {provinceCount} Tỉnh/TP
            </span>
            <span className="badge badge-outline" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
              {selectedWards.length} Xã/Phường
            </span>
          </div>
        );
      }
    },
    {
      header: 'Trạng thái',
      key: 'active',
      render: (r) => (
        <Badge 
          label={r.active ? 'Hoạt động' : 'Tạm ngưng'} 
          type={r.active ? 'success' : 'error'} 
        />
      )
    },
    {
      header: 'Thao tác',
      key: 'actions',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => handleOpenEdit(r)} className="btn-outline" style={{ padding: '6px 12px' }} title="Chỉnh sửa">
            <Edit2 size={16} />
          </button>
          <button onClick={() => handleDelete(r.id)} className="btn-outline" style={{ padding: '6px 12px', color: 'var(--danger)', borderColor: 'var(--danger)' }} title="Xóa">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <Navbar />
      <Main>
        <PageHeader 
          title="Khu vực Kinh doanh" 
          subtitle="Quản lý và phân bổ các tỉnh/thành phố theo vùng miền"
          icon="MapPin"
        />

        <SearchActionHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm theo mã hoặc tên khu vực..."
          actions={
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSyncProvinces} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }} title="Đồng bộ Tỉnh/TP từ API v2">
                  <RefreshCw size={18} /> Đồng bộ Tỉnh/TP
                </button>
                <button onClick={handleSyncWards} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }} title="Đồng bộ Phường/Xã từ API v2">
                  <RefreshCw size={18} /> Đồng bộ Xã/Phường
                </button>
              </div>
              <button onClick={handleOpenCreate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={18} /> Thêm khu vực
              </button>
            </div>
          }
        />

        <DataTable 
          data={paginatedRegions}
          columns={columns}
          loading={loading}
          emptyMessage={searchQuery ? 'Không tìm thấy khu vực nào' : 'Chưa có dữ liệu khu vực'}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Main>

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-card fade-in" style={{ width: 600, maxWidth: '95vw', maxHeight: '90vh', padding: 32, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 1 }}
            >
              <X size={24} />
            </button>
            <h2 style={{ margin: '0 0 24px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <MapPin size={24} color="var(--accent)" />
              {editingRegion ? 'Chỉnh sửa Khu vực' : 'Thêm Khu vực mới'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: 4 }}>
              <div style={{ flexShrink: 0 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Mã khu vực <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="VD: MIEN_DONG"
                  required
                />
              </div>

              <div style={{ flexShrink: 0 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Tên khu vực <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="VD: Miền Đông"
                  required
                />
              </div>

              <div style={{ flexShrink: 0 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Mô tả</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Mô tả ngắn về khu vực"
                />
              </div>

              <div style={{ flexShrink: 0 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>
                  Phạm vi địa lý (Tỉnh / Xã) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <LocationSelector 
                  selectedWardIds={formData.wardIds}
                  onChange={(ids) => setFormData({ ...formData, wardIds: ids })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexShrink: 0 }}>
                <input 
                  type="checkbox" 
                  id="activeRegion"
                  checked={formData.active} 
                  onChange={e => setFormData({...formData, active: e.target.checked})}
                  style={{ width: 16, height: 16 }}
                />
                <label htmlFor="activeRegion" style={{ fontWeight: 500, cursor: 'pointer' }}>Khu vực đang hoạt động</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, flexShrink: 0 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">Hủy bỏ</button>
                <button type="submit" className="btn-primary">
                  {editingRegion ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NotificationModal 
        isOpen={notification.isOpen} 
        onClose={() => setNotification({ ...notification, isOpen: false })} 
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </>
  );
}
