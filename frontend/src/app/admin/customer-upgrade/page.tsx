'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { upgradeApi, RetailAgencyDTO } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { CheckCircle, XCircle, Plus, Search } from 'lucide-react';

interface UpgradeRequest {
  id: number;
  agencyId: number;
  agencyName?: string;
  agencyCode?: string;
  oldType: string;
  newType: string;
  changedByName?: string;
  status: string;
  rejectReason?: string;
  createdAt: string;
}

export default function CustomerUpgradePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // approve/reject modal
  const [modalItem, setModalItem] = useState<UpgradeRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // direct upgrade modal
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [retailAgencies, setRetailAgencies] = useState<RetailAgencyDTO[]>([]);
  const [agencySearch, setAgencySearch] = useState('');
  const [selectedAgency, setSelectedAgency] = useState<RetailAgencyDTO | null>(null);
  const [directLoading, setDirectLoading] = useState(false);

  const isAdmin = user?.roles?.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await upgradeApi.getRequests();
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(sorted);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  const loadRetailAgencies = async () => {
    try {
      const data = await upgradeApi.getRetailAgencies();
      setRetailAgencies(data || []);
    } catch {}
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

  const openDirectModal = async () => {
    setSelectedAgency(null);
    setAgencySearch('');
    setShowDirectModal(true);
    loadRetailAgencies();
  };

  const handleDirectUpgrade = async () => {
    if (!selectedAgency) return;
    setDirectLoading(true);
    try {
      await upgradeApi.directUpgrade(selectedAgency.id);
      setShowDirectModal(false);
      loadRequests();
    } catch (e: any) {
      alert(e?.message || 'Lỗi khi nâng cấp');
    } finally {
      setDirectLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge label="Chờ duyệt" type="warning" />;
      case 'APPROVED': return <Badge label="Đã duyệt" type="success" />;
      case 'REJECTED': return <Badge label="Từ chối" type="error" />;
      default: return <Badge label={status} type="default" />;
    }
  };

  const filtered = requests.filter(r =>
    (r.agencyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.agencyCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.changedByName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAgencies = retailAgencies.filter(a =>
    a.name.toLowerCase().includes(agencySearch.toLowerCase()) ||
    a.code.toLowerCase().includes(agencySearch.toLowerCase()) ||
    a.phone?.toLowerCase().includes(agencySearch.toLowerCase())
  );

  const columns: Column<UpgradeRequest>[] = [
    {
      header: 'Đại lý', key: 'agencyName', width: '22%',
      render: (r) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white">{r.agencyName || `#${r.agencyId}`}</span>
          {r.agencyCode && <span className="text-[10px] text-[var(--text-secondary)]">Mã: {r.agencyCode}</span>}
        </div>
      ),
    },
    {
      header: 'Người yêu cầu', key: 'changedByName', width: '13%',
      render: (r) => <span className="text-sm">{r.changedByName || 'Admin'}</span>,
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
      header: 'Trạng thái', key: 'status', align: 'center', width: '13%',
      render: (r) => getStatusBadge(r.status),
    },
    {
      header: 'Thời gian', key: 'createdAt', width: '17%',
      render: (r) => <span className="text-xs text-[var(--text-secondary)]">{new Date(r.createdAt).toLocaleString('vi-VN')}</span>,
    },
    {
      header: 'Thao tác', key: 'actions', align: 'right', width: '20%',
      render: (r) => (
        <div className="flex justify-end gap-2">
          {r.status === 'PENDING' ? (
            <button className="btn-outline p-2 text-green-400 border-green-950/20" style={{ borderRadius: 8 }} onClick={() => setModalItem(r)}>
              <CheckCircle size={16} />
            </button>
          ) : null}
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
          actions={
            <button className="btn-primary" onClick={openDirectModal}>
              <Plus size={16} /> Yêu cầu nâng cấp
            </button>
          }
        />

        <DataTable
          data={filtered}
          columns={columns}
          loading={isLoading}
          emptyMessage={searchQuery ? 'Không tìm thấy yêu cầu nào' : 'Chưa có yêu cầu nào'}
        />
      </main>

      {/* Approve / Reject modal */}
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

      {/* Direct upgrade modal */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowDirectModal(false); setSelectedAgency(null); }}>
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Yêu cầu nâng cấp</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Chọn đại lý Bán lẻ để nâng cấp lên Bán buôn</p>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                className="w-full border border-[var(--border)] rounded-lg py-2.5 pl-9 pr-3 bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm"
                placeholder="Tìm đại lý..."
                value={agencySearch}
                onChange={(e) => { setAgencySearch(e.target.value); setSelectedAgency(null); }}
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 mb-4">
              {filteredAgencies.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)] text-center py-4">Không tìm thấy đại lý</p>
              ) : filteredAgencies.map(a => (
                <button
                  key={a.id}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedAgency?.id === a.id
                      ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/40 text-white'
                      : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-transparent'
                  }`}
                  onClick={() => setSelectedAgency(a)}
                >
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">Mã: {a.code} | {a.phone}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button className="btn-outline" onClick={() => { setShowDirectModal(false); setSelectedAgency(null); }}>Hủy</button>
              <button className="btn-primary" disabled={!selectedAgency || directLoading} onClick={handleDirectUpgrade}>
                {directLoading ? 'Đang xử lý...' : 'Xác nhận nâng cấp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
