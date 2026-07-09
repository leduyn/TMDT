'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
  guideTargetApi,
  GuideTargetDTO,
  CreateGuideTargetRequest,
} from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function GuideTargetsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [targets, setTargets] = useState<GuideTargetDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<GuideTargetDTO | null>(null);
  const [form, setForm] = useState<CreateGuideTargetRequest>({
    key: '', name: '', description: '', screenName: '',
  });

  const isAdmin = user?.roles?.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await guideTargetApi.getAll();
      setTargets(data || []);
    } catch (err) {
      console.error('Failed to load guide targets', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ key: '', name: '', description: '', screenName: '' });
    setEditingTarget(null);
    setShowForm(false);
  };

  const openEdit = (t: GuideTargetDTO) => {
    setForm({ key: t.key, name: t.name, description: t.description || '', screenName: t.screenName });
    setEditingTarget(t);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingTarget) {
        await guideTargetApi.update(editingTarget.id, form);
      } else {
        await guideTargetApi.create(form);
      }
      resetForm();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu guide target');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa target này?')) return;
    try {
      await guideTargetApi.delete(id);
      loadData();
    } catch {
      alert('Không thể xóa target này');
    }
  };

  const filtered = targets.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<GuideTargetDTO>[] = [
    { header: 'Key', key: 'key', width: '15%', render: (t) => <code className="text-[var(--accent-light)] text-xs">{t.key}</code> },
    { header: 'Tên', key: 'name', width: '20%' },
    { header: 'Màn hình', key: 'screenName', width: '15%' },
    { header: 'Mô tả', key: 'description', width: '35%' },
    {
      header: 'Thao tác', key: 'actions', align: 'right', width: '15%',
      render: (t) => (
        <div className="flex justify-end gap-2">
          <button className="btn-outline p-2" style={{ borderRadius: 8 }} onClick={() => openEdit(t)}>
            <Edit2 size={14} />
          </button>
          <button className="btn-outline p-2 text-red-400 border-red-950/20" style={{ borderRadius: 8 }} onClick={() => handleDelete(t.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] text-[var(--text-secondary)] text-sm">Bạn không có quyền truy cập module này.</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="main-content bg-grid">
        <PageHeader title="Quản lý Guide Targets" subtitle="Định nghĩa các vị trí (target) trên màn hình để sử dụng trong hướng dẫn" icon="Target" />

        <SearchActionHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm target theo tên hoặc key..."
          actions={
            <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus size={16} /> Thêm target
            </button>
          }
        />

        {showForm && (
          <div className="card p-6 mb-6" style={{ border: '1px solid var(--accent)', borderRadius: 12 }}>
            <h3 className="text-base font-bold mb-4">{editingTarget ? 'Sửa target' : 'Thêm target mới'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Key *</label>
                <input className="input w-full" value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} placeholder="Ví dụ: category-fab" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Tên *</label>
                <input className="input w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Tên hiển thị" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Screen Name *</label>
                <input className="input w-full" value={form.screenName} onChange={e => setForm({ ...form, screenName: e.target.value })} placeholder="Ví dụ: CategoryList" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Mô tả</label>
                <input className="input w-full" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn-primary" onClick={handleSubmit}>{editingTarget ? 'Cập nhật' : 'Tạo mới'}</button>
              <button className="btn-outline" onClick={resetForm}>Hủy</button>
            </div>
          </div>
        )}

        <DataTable
          data={filtered}
          columns={columns}
          loading={isLoading}
          emptyMessage={searchQuery ? 'Không tìm thấy target nào' : 'Chưa có target nào'}
        />
      </main>
    </>
  );
}
