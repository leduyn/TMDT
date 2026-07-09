'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
  guideApi,
  GuideDTO,
} from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

export default function GuidesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [guides, setGuides] = useState<GuideDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.roles?.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await guideApi.getAll();
      setGuides(data || []);
    } catch (err) {
      console.error('Failed to load guides', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa guide này?')) return;
    try {
      await guideApi.delete(id);
      loadData();
    } catch {
      alert('Không thể xóa guide này');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await guideApi.toggleActive(id);
      loadData();
    } catch {
      alert('Không thể thay đổi trạng thái');
    }
  };

  const filtered = guides.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<GuideDTO>[] = [
    {
      header: 'Tên Guide', key: 'name', width: '25%',
      render: (g) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white">{g.name}</span>
          <span className="text-[10px] text-[var(--text-secondary)]">v{g.version}</span>
        </div>
      ),
    },
    {
      header: 'Mô tả', key: 'description', width: '30%',
      render: (g) => <span className="text-xs text-[var(--text-secondary)]">{g.description || '—'}</span>,
    },
    {
      header: 'Số bước', key: 'steps', align: 'center', width: '10%',
      render: (g) => <span className="font-semibold">{g.steps?.length || 0}</span>,
    },
    {
      header: 'Trạng thái', key: 'isActive', align: 'center', width: '15%',
      render: (g) => (
        <Badge
          label={g.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
          type={g.isActive ? 'success' : 'error'}
          icon={g.isActive ? 'Eye' : 'EyeOff'}
        />
      ),
    },
    {
      header: 'Thao tác', key: 'actions', align: 'right', width: '20%',
      render: (g) => (
        <div className="flex justify-end gap-2">
          <button className="btn-outline p-2" style={{ borderRadius: 8 }} onClick={() => router.push(`/admin/guides/${g.id}`)}>
            <Edit2 size={14} />
          </button>
          <button className="btn-outline p-2" style={{ borderRadius: 8 }} onClick={() => handleToggleActive(g.id)} title={g.isActive ? 'Ẩn guide' : 'Hiện guide'}>
            {g.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button className="btn-outline p-2 text-red-400 border-red-950/20" style={{ borderRadius: 8 }} onClick={() => handleDelete(g.id)}>
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
        <PageHeader title="Quản lý Guide" subtitle="Tạo và quản lý các luồng hướng dẫn từng bước cho ứng dụng mobile" icon="BookOpen" />

        <SearchActionHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm guide theo tên..."
          actions={
            <button className="btn-primary" onClick={() => router.push('/admin/guides/new')}>
              <Plus size={16} /> Tạo guide mới
            </button>
          }
        />

        <DataTable
          data={filtered}
          columns={columns}
          loading={isLoading}
          emptyMessage={searchQuery ? 'Không tìm thấy guide nào' : 'Chưa có guide nào'}
        />
      </main>
    </>
  );
}
