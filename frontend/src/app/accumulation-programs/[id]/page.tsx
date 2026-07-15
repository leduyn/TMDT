'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { accumulationApi, AccumulationProgramDTO, AccumulationSummaryDTO, AccumulationDebtDetailDTO, AccumulationDebtStatsDTO } from '@/modules/accumulation/accumulationApi';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import TierProgressBar from '@/components/TierProgressBar';
import { Play, CheckCircle, XCircle, DollarSign, ArrowLeft, BarChart3, List, ChevronDown, ChevronUp } from 'lucide-react';

export default function AccumulationProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Number(params.id);

  const [program, setProgram] = useState<AccumulationProgramDTO | null>(null);
  const [summaries, setSummaries] = useState<AccumulationSummaryDTO[]>([]);
  const [debtStats, setDebtStats] = useState<AccumulationDebtStatsDTO | null>(null);
  const [debts, setDebts] = useState<AccumulationDebtDetailDTO[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'debts'>('summary');
  const [expandedAgency, setExpandedAgency] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.roles?.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prog, summs, stats, debtList] = await Promise.all([
        accumulationApi.getById(id),
        accumulationApi.getAllSummaries(id),
        accumulationApi.getProgramDebtStats(id),
        accumulationApi.getProgramDebts(id),
      ]);
      setProgram(prog);
      setSummaries(summs || []);
      setDebtStats(stats);
      setDebts(debtList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

   const handleActivate = async () => {
     if (!confirm('Kích hoạt chương trình tích lũy này?')) return;
     try {
       await accumulationApi.activate(id);
       loadData();
     } catch (err: any) { alert(err.message); }
   };

   const handleStage1 = async () => {
    if (!confirm('Tính hoa hồng đợt 1 cho tất cả đại lý?')) return;
    try {
      await accumulationApi.calculateStage1(id);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleApproveAll = async () => {
    if (!confirm('Duyệt hoa hồng đợt 1 cho tất cả đại lý?')) return;
    try {
      await accumulationApi.approveAllStage1(id);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleApproveAgency = async (agencyId: number) => {
    try {
      await accumulationApi.approveStage1(id, agencyId);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleRejectAgency = async (agencyId: number) => {
    const notes = prompt('Lý do từ chối:');
    if (notes === null) return;
    try {
      await accumulationApi.rejectStage1(id, agencyId, notes || undefined);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleStage2 = async (agencyId: number) => {
    if (!confirm('Tính hoa hồng đợt 2 cho đại lý này?')) return;
    try {
      await accumulationApi.calculateStage2(id, agencyId);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const getStatusBadge = (status?: string) => {
    const map: Record<string, { label: string; type: 'success' | 'warning' | 'error' | 'info' | 'primary' }> = {
      PENDING: { label: 'Chờ duyệt', type: 'warning' },
      APPROVED: { label: 'Đã duyệt', type: 'success' },
      PAID: { label: 'Đã trả', type: 'info' },
      REJECTED: { label: 'Từ chối', type: 'error' },
    };
    if (!status) return <span className="text-[var(--text-muted)]">—</span>;
    return <Badge label={map[status]?.label || status} type={map[status]?.type || 'info'} />;
  };

  const formatCurrency = (v?: number) => {
    if (v == null) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  };

  const columns: Column<AccumulationSummaryDTO>[] = [
    { header: 'Đại lý', key: 'agencyName', width: '15%',
      render: s => <span className="font-semibold">{s.agencyName}</span>
    },
    {
      header: 'Tích lũy', key: 'totalAccumulatedValue', width: '12%',
      render: s => <span>{formatCurrency(s.totalAccumulatedValue)}</span>,
    },
    {
      header: 'Đã thu', key: 'totalCollectedValue', width: '12%',
      render: s => <span>{formatCurrency(s.totalCollectedValue)}</span>,
    },
    {
      header: 'Tỷ lệ', key: 'currentTierRate', width: '8%',
      render: s => <span>{(s.currentTierRate * 100).toFixed(2)}%</span>,
    },
    {
      header: 'HH Đợt 1', key: 'estimatedStage1', width: '12%',
      render: s => <div>
        <div className="text-sm">{formatCurrency(s.estimatedStage1)}</div>
        {s.paidStage1 != null && <div className="text-xs text-[var(--text-muted)]">Đã trả: {formatCurrency(s.paidStage1)}</div>}
      </div>,
    },
    {
      header: 'Đợt 1 Status', key: 'stage1Status', width: '10%',
      render: s => getStatusBadge(s.stage1Status),
    },
    {
      header: 'HH Đợt 2', key: 'estimatedStage2', width: '12%',
      render: s => <div>
        <div className="text-sm">{formatCurrency(s.estimatedStage2)}</div>
        {s.paidStage2 != null && <div className="text-xs text-[var(--text-muted)]">Đã trả: {formatCurrency(s.paidStage2)}</div>}
      </div>,
    },
    {
      header: 'Thao tác', key: 'actions', align: 'right', width: '19%',
      render: s => (
        <div className="flex justify-end gap-1">
          {program?.status === 'STAGE1_PENDING' && s.stage1Status === 'PENDING' && (
            <>
              <button className="btn-outline p-1.5 text-green-400" style={{ borderRadius: 6 }} title="Duyệt đợt 1"
                onClick={() => handleApproveAgency(s.agencyId)}>
                <CheckCircle size={13} />
              </button>
              <button className="btn-outline p-1.5 text-red-400" style={{ borderRadius: 6 }} title="Từ chối"
                onClick={() => handleRejectAgency(s.agencyId)}>
                <XCircle size={13} />
              </button>
            </>
          )}
          {program?.status === 'STAGE1_APPROVED' && !s.paidStage2 && (
            <button className="btn-outline p-1.5 text-yellow-400" style={{ borderRadius: 6 }} title="Tính đợt 2"
              onClick={() => handleStage2(s.agencyId)}>
              <DollarSign size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const debtColumns: Column<AccumulationDebtDetailDTO>[] = [
    { header: 'Mã nợ', key: 'debtCode', width: '12%', render: d => <span className="font-semibold">{d.debtCode}</span> },
    { header: 'Đơn hàng', key: 'orderId', width: '8%', render: d => d.orderId ? <span>#{d.orderId}</span> : <span className="text-[var(--text-muted)]">—</span> },
    { header: 'Đại lý', key: 'agencyName', width: '12%' },
    { header: 'Khách hàng', key: 'customerName', width: '12%' },
    { header: 'Giá trị', key: 'value', width: '10%', align: 'right', render: d => <span>{formatCurrency(d.value)}</span> },
    { header: 'Đã thu', key: 'paidValue', width: '10%', align: 'right', render: d => <span style={{ color: '#16a34a' }}>{formatCurrency(d.paidValue)}</span> },
    { header: 'Còn nợ', key: 'remainingToCollect', width: '10%', align: 'right', render: d => <span style={{ color: d.remainingToCollect > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{formatCurrency(d.remainingToCollect)}</span> },
    { header: 'Ngày ghi nhận', key: 'recordingDate', width: '10%', render: d => new Date(d.recordingDate).toLocaleDateString('vi-VN') },
    { header: 'Hạn nợ', key: 'dueDate', width: '8%', render: d => {
      const due = new Date(d.dueDate);
      const now = new Date();
      const isOverdue = due < now && d.remainingToCollect > 0;
      return <span style={{ color: isOverdue ? '#dc2626' : 'inherit' }}>{due.toLocaleDateString('vi-VN')}</span>;
    }},
    { header: 'Trạng thái', key: 'paidValue', width: '8%', align: 'center', render: d => {
      if (d.remainingToCollect <= 0) return <Badge label="Đã hết nợ" type="success" />;
      if (d.paidValue > 0) return <Badge label="Đang trả" type="warning" />;
      return <Badge label="Chưa trả" type="error" />;
    }},
  ];

  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-[80vh] text-[var(--text-secondary)] text-sm">Truy cập bị từ chối</div>;
  }

  if (isLoading) {
    return (
      <main className="main-content bg-grid">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="spinner" />
        </div>
      </main>
    );
  }

  if (!program) {
    return (
      <main className="main-content bg-grid">
        <div className="text-center py-20 text-[var(--text-muted)]">Không tìm thấy chương trình</div>
      </main>
    );
  }

  const programStatusBadge: Record<string, { label: string; type: 'success' | 'warning' | 'error' | 'info' | 'primary' }> = {
    DRAFT: { label: 'Nháp', type: 'info' },
    ACTIVE: { label: 'Đang chạy', type: 'success' },
    ENDED: { label: 'Đã kết thúc', type: 'info' },
    STAGE1_PENDING: { label: 'Chờ duyệt Đợt 1', type: 'warning' },
    STAGE1_APPROVED: { label: 'Đã duyệt Đợt 1', type: 'info' },
    COMPLETED: { label: 'Hoàn tất', type: 'success' },
  };

  return (
    <main className="main-content bg-grid">
      <button className="btn-outline mb-4" onClick={() => router.push('/accumulation-programs')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={16} /> Quay lại
      </button>

      <PageHeader
        title={program.name}
        subtitle={`${new Date(program.startDate).toLocaleDateString('vi-VN')} → ${new Date(program.endDate).toLocaleDateString('vi-VN')} · ${program.rebateCalculationType === 'HIGHEST_THRESHOLD' ? 'Mốc cao nhất' : 'Lũy tiến bậc thang'}`}
        icon="ShieldCheck"
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge label={programStatusBadge[program.status]?.label || program.status}
              type={programStatusBadge[program.status]?.type || 'info'} />
          </div>
        }
      />

       {program.description && (
         <GlassCard style={{ padding: 16, marginBottom: 24 }}>
           <p className="text-sm text-[var(--text-secondary)]">{program.description}</p>
         </GlassCard>
       )}

       <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
         {program.status === 'DRAFT' && (
           <button className="btn-primary" onClick={handleActivate} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
             <Play size={16} /> Kích hoạt chương trình
           </button>
         )}
         {program.status === 'ACTIVE' && (
           <button className="btn-primary" onClick={handleStage1} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
             <Play size={16} /> Tính hoa hồng đợt 1
           </button>
         )}
         {program.status === 'STAGE1_PENDING' && (
           <button className="btn-primary" onClick={handleApproveAll} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
             <CheckCircle size={16} /> Duyệt tất cả đợt 1
           </button>
         )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('summary')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'summary' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'summary' ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <BarChart3 size={14} /> Tiến độ tích lũy
          </button>
          <button
            onClick={() => setActiveTab('debts')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'debts' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'debts' ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <List size={14} /> Đơn hàng tích lũy ({debtStats?.totalOrders || 0})
          </button>
        </div>

        {activeTab === 'summary' && program?.rebateCalculationType === 'TIERED_PROGRESSIVE' && (
          <>
            <h3 className="text-lg font-semibold mb-4">Tiến độ tích lũy theo mốc lũy tiến</h3>
            {summaries.map(s => (
              <div key={s.agencyId} style={{ marginBottom: 12 }}>
                <div
                  onClick={() => setExpandedAgency(expandedAgency === s.agencyId ? null : s.agencyId)}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: expandedAgency === s.agencyId ? 'var(--bg-secondary)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flex: 1 }}>
                    <span style={{ fontWeight: 600, minWidth: 150 }}>{s.agencyName}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Tích lũy: <strong>{formatCurrency(s.totalAccumulatedValue)}</strong>
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Đã thu: <strong style={{ color: '#16a34a' }}>{formatCurrency(s.totalCollectedValue)}</strong>
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      HH: <strong style={{ color: 'var(--primary)' }}>{formatCurrency(s.totalCommissionFromTiers || s.estimatedCommission)}</strong>
                    </span>
                    {s.stage1Status && (
                      <span>{getStatusBadge(s.stage1Status)}</span>
                    )}
                  </div>
                  {s.tierProgress && s.tierProgress.length > 0 && (
                    expandedAgency === s.agencyId ? <ChevronUp size={18} /> : <ChevronDown size={18} />
                  )}
                </div>
                {expandedAgency === s.agencyId && s.tierProgress && (
                  <TierProgressBar tiers={s.tierProgress} totalValue={s.totalAccumulatedValue} unlimited={program?.unlimited} />
                )}
              </div>
            ))}
            {summaries.length === 0 && (
              <div className="text-center py-10 text-[var(--text-muted)]">Chưa có đại lý tham gia chương trình</div>
            )}
          </>
        )}

        {activeTab === 'summary' && program?.rebateCalculationType !== 'TIERED_PROGRESSIVE' && (
          <>
            <h3 className="text-lg font-semibold mb-4">Tiến độ tích lũy của đại lý</h3>
            <DataTable
              data={summaries.map(s => ({ ...s, id: s.agencyId }))}
              columns={columns}
              loading={isLoading}
              emptyMessage="Chưa có đại lý tham gia chương trình"
            />
          </>
        )}

        {activeTab === 'debts' && debtStats && (
          <>
            <GlassCard style={{ padding: 20, marginBottom: 24 }}>
              <h3 className="text-lg font-semibold mb-4">Thống kê đơn hàng tích lũy</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tổng giá trị tích lũy</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(debtStats.totalDebtValue)}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tổng tiền đã thu</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>{formatCurrency(debtStats.totalCollectedValue)}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Nợ còn lại</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>{formatCurrency(debtStats.totalRemainingValue)}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tỷ lệ thu hồi</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{(debtStats.collectionRate * 100).toFixed(1)}%</div>
                </div>
                <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tổng đơn hàng</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{debtStats.totalOrders}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Đã thanh toán hết</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>{debtStats.fullyPaidOrders}</div>
                </div>
                <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Chưa thanh toán hết</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>{debtStats.unpaidOrders}</div>
                </div>
              </div>

              {debtStats.perAgencyStats && debtStats.perAgencyStats.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4 className="text-md font-semibold mb-3">Thống kê theo đại lý</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                    {debtStats.perAgencyStats.map((a: any) => (
                      <div key={a.agencyId} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>{a.agencyName}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 13 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Đơn hàng:</span>
                          <span style={{ fontWeight: 500 }}>{a.orderCount}</span>
                          <span style={{ color: 'var(--text-muted)' }}>Giá trị:</span>
                          <span style={{ fontWeight: 500 }}>{formatCurrency(a.totalValue)}</span>
                          <span style={{ color: 'var(--text-muted)' }}>Đã thu:</span>
                          <span style={{ fontWeight: 500, color: '#16a34a' }}>{formatCurrency(a.totalPaid)}</span>
                          <span style={{ color: 'var(--text-muted)' }}>Còn nợ:</span>
                          <span style={{ fontWeight: 500, color: '#dc2626' }}>{formatCurrency(a.totalRemaining)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>

            <h3 className="text-lg font-semibold mb-4">Chi tiết đơn hàng tích lũy</h3>
            <DataTable
              data={debts.map(d => ({ ...d, id: d.debtId }))}
              columns={debtColumns}
              loading={isLoading}
              emptyMessage="Chưa có đơn hàng tích lũy"
            />
          </>
        )}
    </main>
  );
}
