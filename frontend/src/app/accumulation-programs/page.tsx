'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { accumulationApi, AccumulationProgramDTO } from '@/modules/accumulation/accumulationApi';
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Plus, Edit2, Trash2, Play, CheckCircle, Eye } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

export default function AccumulationProgramsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [programs, setPrograms] = useState<AccumulationProgramDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const isAdmin = user?.roles?.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setIsLoading(true);
    try {
      const data = await accumulationApi.getAll();
      setPrograms(data || []);
    } catch (err) {
      console.error('Failed to load programs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; type: 'info' | 'success' | 'warning' | 'error' | 'primary' }> = {
      DRAFT: { label: 'Nháp', type: 'info' },
      ACTIVE: { label: 'Đang chạy', type: 'success' },
      ENDED: { label: 'Đã kết thúc', type: 'info' },
      STAGE1_PENDING: { label: 'Chờ duyệt Đợt 1', type: 'warning' },
      STAGE1_APPROVED: { label: 'Đã duyệt Đợt 1', type: 'info' },
      COMPLETED: { label: 'Hoàn tất', type: 'success' },
    };
    return <Badge label={map[status]?.label || status} type={map[status]?.type || 'info'} />;
  };

  const handleStage1 = async (id: number) => {
    if (!confirm('Tính hoa hồng đợt 1 cho tất cả đại lý trong chương trình này?')) return;
    try {
      await accumulationApi.calculateStage1(id);
      loadPrograms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveAll = async (id: number) => {
    if (!confirm('Duyệt hoa hồng đợt 1 cho tất cả đại lý?')) return;
    try {
      await accumulationApi.approveAllStage1(id);
      loadPrograms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa chương trình tích lũy này?')) return;
    try {
      await accumulationApi.delete(id);
      loadPrograms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = programs.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedPrograms = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const columns: Column<AccumulationProgramDTO>[] = [
    {
      header: 'Chương trình',
      key: 'name',
      width: '25%',
      render: (p) => (
        <div>
          <div className="font-semibold text-white">{p.name}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">{p.description}</div>
        </div>
      ),
    },
    {
      header: 'Thời gian',
      key: 'startDate',
      width: '20%',
      render: (p) => (
        <div className="text-sm">
          <div>{new Date(p.startDate).toLocaleDateString('vi-VN')}</div>
          <div className="text-[var(--text-muted)]">→ {new Date(p.endDate).toLocaleDateString('vi-VN')}</div>
        </div>
      ),
    },
    {
      header: 'Cách tính',
      key: 'rebateCalculationType',
      width: '15%',
      render: (p) => (
        <Badge
          label={p.rebateCalculationType === 'HIGHEST_THRESHOLD' ? 'Mốc cao nhất' : 'Lũy tiến'}
          type={p.rebateCalculationType === 'HIGHEST_THRESHOLD' ? 'info' : 'primary'}
        />
      ),
    },
    {
      header: 'Trạng thái',
      key: 'status',
      width: '18%',
      render: (p) => getStatusBadge(p.status),
    },
    {
      header: 'Thao tác',
      key: 'actions',
      align: 'right',
      width: '22%',
      render: (p) => (
        <div className="flex justify-end gap-2">
          <button className="btn-outline p-2" style={{ borderRadius: 8 }} title="Xem chi tiết"
            onClick={() => router.push(`/accumulation-programs/${p.id}`)}>
            <Eye size={14} />
          </button>
          {p.status === 'ACTIVE' && (
            <button className="btn-outline p-2 text-yellow-400" style={{ borderRadius: 8 }} title="Tính đợt 1"
              onClick={() => handleStage1(p.id)}>
              <Play size={14} />
            </button>
          )}
          {p.status === 'STAGE1_PENDING' && (
            <button className="btn-outline p-2 text-green-400" style={{ borderRadius: 8 }} title="Duyệt tất cả"
              onClick={() => handleApproveAll(p.id)}>
              <CheckCircle size={14} />
            </button>
          )}
          {p.status === 'DRAFT' && (
            <button className="btn-outline p-2" style={{ borderRadius: 8 }} title="Sửa"
              onClick={() => router.push(`/accumulation-programs/${p.id}`)}>
              <Edit2 size={14} />
            </button>
          )}
          {p.status === 'DRAFT' && (
            <button className="btn-outline p-2 text-red-400" style={{ borderRadius: 8 }} title="Xóa"
              onClick={() => handleDelete(p.id)}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] text-[var(--text-secondary)] text-sm">
        Bạn không có quyền truy cập module này.
      </div>
    );
  }

  return (
    <main className="main-content bg-grid">
      <PageHeader
        title="Chương trình Tích lũy"
        subtitle="Thiết lập chương trình tích lũy doanh số, xét hạn mức và tính hoa hồng trả thưởng cho đại lý"
        icon="ShieldCheck"
      />
      <SearchActionHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Tìm kiếm chương trình..."
        actions={
          <button className="btn-primary" onClick={() => router.push('/accumulation-programs/new')}>
            <Plus size={16} />
            Tạo chương trình
          </button>
        }
      />
      <DataTable
        data={paginatedPrograms}
        columns={columns}
        loading={isLoading}
        emptyMessage="Chưa có chương trình tích lũy nào"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </main>
  );
}
