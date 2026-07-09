'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { upgradeApi } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface UpgradeRequest {
  id: number;
  agencyId: number;
  agencyName?: string;
  agencyCode?: string;
  oldType: string;
  newType: string;
  changedByName?: string;
  reason?: string;
  termsVersion?: string;
  createdAt: string;
}

export default function CustomerUpgradePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalItem, setModalItem] = useState<UpgradeRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = user?.roles?.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await upgradeApi.getRequests();
      setRequests(data || []);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (approved: boolean) => {
    if (!modalItem) return;
    setActionLoading(true);
    try {
      await upgradeApi.approveUpgrade(modalItem.id, approved, rejectReason);
      setModalItem(null);
      setRejectReason('');
      loadRequests();
    } catch (e: any) {
      alert(e?.message || 'Lỗi khi xử lý');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = requests.filter(r =>
    (r.agencyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.agencyCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.changedByName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<UpgradeRequest>[] = [
    {
      header: 'Đại lý', key: 'agencyName', width: '25%',
      render: (r) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white">{r.agencyName || `#${r.agencyId}`}</span>
          {r.agencyCode && <span className="text-[10px] text-[var(--text-secondary)]">Mã: {r.agencyCode}</span>}
        </div>
      ),
    },
    {
      header: 'Người yêu cầu', key: 'changedByName', width: '15%',
      render: (r) => <span className="text-sm">{r.changedByName || '—'}</span>,
    },
    {
      header: 'Loại cũ → Mới', key: 'newType', align: 'center', width: '15%',
      render: (r) => (
        <div className="flex items-center gap-1 justify-center text-sm">
          <Badge label={r.oldType} type="default" />
          <span className="text-[var(--text-muted)]">→</span>
          <Badge label={r.newType} type="success" />
        </div>
      ),
    },
    {
      header: 'Thời gian', key: 'createdAt', width: '15%',
      render: (r) => <span className="text-xs text-[var(--text-secondary)]">{new Date(r.createdAt).toLocaleString('vi-VN')}</span>,
    },
    {
      header: 'Thao tác', key: 'actions', align: 'right', width: '30%',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button className="btn-outline p-2 text-green-400 border-green-950/20" style={{ borderRadius: 8 }} onClick={() => setModalItem(r)}>
            <CheckCircle size={16} />
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
        <PageHeader title="Yêu cầu nâng cấp" subtitle="Duyệt yêu cầu nâng cấp từ Bán lẻ lên Bán buôn của các đại lý" icon="ArrowUpDown" />

        <SearchActionHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm theo tên hoặc mã đại lý..."
        />

        <DataTable
          data={filtered}
          columns={columns}
          loading={isLoading}
          emptyMessage={searchQuery ? 'Không tìm thấy yêu cầu nào' : 'Chưa có yêu cầu nào'}
        />
      </main>

      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModalItem(null)}>
          <div className="glass-card w-full max-w-md p-6 rounded-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Xét duyệt nâng cấp</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Đại lý: <strong className="text-white">{modalItem.agencyName || `#${modalItem.agencyId}`}</strong>
              <br />
              Yêu cầu: <Badge label={modalItem.oldType} type="default" /> → <Badge label={modalItem.newType} type="success" />
              <br />
              Người yêu cầu: {modalItem.changedByName || '—'}
            </p>
            <textarea
              className="w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm resize-none mb-4"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Lý do từ chối (nếu có)..."
            />
            <div className="flex justify-end gap-3">
              <button className="btn-outline" onClick={() => setModalItem(null)}>Hủy</button>
              <button className="btn-outline text-red-400 border-red-950/20" disabled={actionLoading} onClick={() => handleAction(false)}>
                <XCircle size={16} /> {actionLoading ? 'Đang xử lý...' : 'Từ chối'}
              </button>
              <button className="btn-primary" disabled={actionLoading} onClick={() => handleAction(true)}>
                <CheckCircle size={16} /> {actionLoading ? 'Đang xử lý...' : 'Phê duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
