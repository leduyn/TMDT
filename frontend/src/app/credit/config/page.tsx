'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { creditApi, AgencyCreditSummary } from '@/lib/api';
import NotificationModal from '@/components/NotificationModal';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Settings, Search, Check, X, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CreditConfigPage() {
  const [summaries, setSummaries] = useState<AgencyCreditSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLimit, setEditLimit] = useState<string>('');
  const [editTerm, setEditTerm] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false, title: '', message: '', type: 'info'
  });

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    setLoading(true);
    try {
      const data = await creditApi.getAllSummaries();
      setSummaries(data);
    } catch (e: any) {
      setModal({ isOpen: true, title: 'Lỗi', message: e.message ?? 'Không thể tải danh sách tín dụng', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (s: AgencyCreditSummary) => {
    setEditingId(s.agencyId);
    setEditLimit(s.creditLimit.toString());
    setEditTerm(s.debtTermDays.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLimit('');
    setEditTerm('');
  };

  const handleUpdate = async (agencyId: number) => {
    setSubmitting(true);
    try {
      const limit = parseFloat(editLimit);
      const term = parseInt(editTerm);
      if (isNaN(limit) || limit < 0) throw new Error('Hạn mức không hợp lệ');
      if (isNaN(term) || term <= 0) throw new Error('Kỳ hạn nợ không hợp lệ');

      await creditApi.updateTerms(agencyId, {
        creditLimit: limit,
        debtTermDays: term
      });
      setModal({ isOpen: true, title: 'Thành công', message: 'Cập nhật thông tin công nợ thành công', type: 'success' });
      cancelEdit();
      loadSummaries();
    } catch (e: any) {
      setModal({ isOpen: true, title: 'Lỗi cập nhật', message: e.message ?? 'Cập nhật thất bại', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerOverdue = async () => {
    setSubmitting(true);
    try {
      const res = await creditApi.triggerOverdue();
      setModal({ isOpen: true, title: 'Kích hoạt', message: res.message || 'Đã kích hoạt kiểm tra nợ', type: 'success' });
      loadSummaries();
    } catch (e: any) {
      setModal({ isOpen: true, title: 'Lỗi', message: e.message ?? 'Không thể kích hoạt kiểm tra nợ', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSummaries = summaries.filter(s => 
    s.agencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.agencyPhone || '').includes(searchQuery) ||
    s.agencyId.toString().includes(searchQuery)
  );

  const columns: Column<any>[] = [
    { 
      header: 'Người mua', 
      key: 'agencyName',
      render: (s) => (
        <div>
          <div style={{ fontWeight: 600 }}>{s.agencyName}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ID: {s.agencyId} • {s.agencyPhone}
          </div>
        </div>
      )
    },
    { 
      header: 'Hạn mức tín dụng', 
      key: 'creditLimit',
      render: (s) => (
        editingId === s.agencyId ? (
          <input
            type="number"
            className="input-field"
            value={editLimit}
            onChange={e => setEditLimit(e.target.value)}
            style={{ width: 150, margin: 0, padding: '6px 12px' }}
          />
        ) : (
          <span style={{ fontWeight: 600, color: s.creditInitialized ? 'inherit' : 'var(--text-muted)' }}>
            {s.creditInitialized ? fmt(s.creditLimit) : fmt(0)}
          </span>
        )
      )
    },
    { 
      header: 'Kỳ hạn nợ', 
      key: 'debtTermDays',
      render: (s) => (
        editingId === s.agencyId ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              className="input-field"
              value={editTerm}
              onChange={e => setEditTerm(e.target.value)}
              style={{ width: 80, margin: 0, padding: '6px 12px' }}
            />
            <span style={{ fontSize: '0.85rem' }}>ngày</span>
          </div>
        ) : (
          <span>{s.debtTermDays} ngày</span>
        )
      )
    },
    { 
      header: 'HMKD Hiện tại', 
      key: 'hmkd',
      render: (s) => <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{fmt(s.hmkd)}</span>
    },
    { 
      header: 'Dư nợ', 
      key: 'totalDebt',
      render: (s) => (
        <div>
          <div style={{ color: s.totalDebt > 0 ? 'var(--error)' : 'var(--success)', fontWeight: 600 }}>
            {fmt(s.totalDebt)}
          </div>
          {s.activeOverdueCount > 0 && (
            <Badge 
              label={`${s.activeOverdueCount} quá hạn`} 
              type="error" 
              icon="AlertCircle"
              style={{ fontSize: '0.7rem', marginTop: 4 }}
            />
          )}
        </div>
      )
    },
    { 
      header: 'Thao tác', 
      key: 'actions', 
      align: 'right',
      render: (s) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {editingId === s.agencyId ? (
            <>
              <button
                onClick={() => handleUpdate(s.agencyId)}
                disabled={submitting}
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--success)' }}
              >
                <Check size={14} style={{ marginRight: 4 }} /> Lưu
              </button>
              <button
                onClick={cancelEdit}
                className="btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <X size={14} style={{ marginRight: 4 }} /> Huỷ
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEdit(s)}
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <RefreshCw size={14} style={{ marginRight: 4 }} /> Chỉnh sửa
              </button>
              <Link href={`/credit?agencyId=${s.agencyId}`} className="btn-outline" style={{ padding: '8px', borderRadius: 8 }}>
                <ExternalLink size={16} />
              </Link>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <Navbar />
      <main style={{ padding: '20px 0' }}>
        <PageHeader 
          title="Cấu hình Công nợ Người mua" 
          subtitle="Thiết lập hạn mức tín dụng và kỳ hạn thanh toán cho từng Người mua"
          icon="Settings"
          actions={
            <button 
              onClick={handleTriggerOverdue}
              disabled={submitting}
              className="btn-outline"
              style={{ 
                padding: '10px 20px', 
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Search size={18} />
              Kiểm tra nợ
            </button>
          }
        />

        <SearchActionHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm Người mua theo tên, ID hoặc số điện thoại..."
        />

        <DataTable 
          data={filteredSummaries.map(s => ({ ...s, id: s.agencyId }))}
          columns={columns}
          loading={loading}
          emptyMessage={searchQuery ? 'Không tìm thấy Người mua nào phù hợp' : 'Chưa có thông tin tín dụng nào'}
        />
      </main>

      <NotificationModal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </>
  );
}
