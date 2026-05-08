'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { creditApi, AgencyCreditSummary } from '@/lib/api';

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CreditConfigPage() {
  const [summaries, setSummaries] = useState<AgencyCreditSummary[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLimit, setEditLimit] = useState<string>('');
  const [editTerm, setEditTerm]   = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    setLoading(true);
    try {
      const data = await creditApi.getAllSummaries();
      setSummaries(data);
    } catch (e: any) {
      setError(e.message ?? 'Không thể tải danh sách tín dụng');
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
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
      notify('Cập nhật thông tin công nợ thành công');
      cancelEdit();
      loadSummaries();
    } catch (e: any) {
      setError(e.message ?? 'Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      padding: '32px 24px',
      color: '#f1f5f9',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, margin: 0,
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            ⚙️ Cấu hình Công nợ Đại lý
          </h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>
            Thiết lập hạn mức tín dụng và kỳ hạn thanh toán cho từng đại lý
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            background: '#450a0a', border: '1px solid #dc2626', borderRadius: 10,
            padding: '12px 16px', color: '#fca5a5', marginBottom: 20, fontSize: 14,
          }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{
            background: '#052e16', border: '1px solid #16a34a', borderRadius: 10,
            padding: '12px 16px', color: '#86efac', marginBottom: 20, fontSize: 14,
          }}>
            ✅ {success}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>
            Đang tải dữ liệu...
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                  <th style={thStyle}>Đại lý</th>
                  <th style={thStyle}>Hạn mức tín dụng</th>
                  <th style={thStyle}>Kỳ hạn nợ (ngày)</th>
                  <th style={thStyle}>HMKD Hiện tại</th>
                  <th style={thStyle}>Dư nợ</th>
                  <th style={thStyle}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map(s => (
                  <tr key={s.agencyId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{s.agencyName}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>ID: {s.agencyId} • {s.agencyPhone}</div>
                    </td>
                    <td style={tdStyle}>
                      {editingId === s.agencyId ? (
                        <input
                          type="number"
                          value={editLimit}
                          onChange={e => setEditLimit(e.target.value)}
                          style={inputStyle}
                        />
                      ) : (
                        <span style={{ fontWeight: 600, color: s.creditInitialized ? '#f1f5f9' : '#64748b' }}>
                          {s.creditInitialized ? fmt(s.creditLimit) : fmt(0)}
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {editingId === s.agencyId ? (
                        <input
                          type="number"
                          value={editTerm}
                          onChange={e => setEditTerm(e.target.value)}
                          style={inputStyle}
                        />
                      ) : (
                        <span>{s.debtTermDays} ngày</span>
                      )}
                    </td>
                    <td style={tdStyle}>{fmt(s.hmkd)}</td>
                    <td style={tdStyle}>
                      <div style={{ color: s.totalDebt > 0 ? '#ef4444' : '#22c55e' }}>{fmt(s.totalDebt)}</div>
                      {s.activeOverdueCount > 0 && (
                        <div style={{ fontSize: 11, color: '#ef4444' }}>⚠️ {s.activeOverdueCount} khoản quá hạn</div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {editingId === s.agencyId ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleUpdate(s.agencyId)}
                            disabled={submitting}
                            style={actionBtn('#16a34a')}
                          >
                            Lưu
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={actionBtn('transparent', '#94a3b8', '1px solid #334155')}
                          >
                            Huỷ
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => startEdit(s)}
                            style={actionBtn('#4f46e5')}
                          >
                            Chỉnh sửa
                          </button>
                          <Link href={`/credit?agencyId=${s.agencyId}`}>
                            <button style={actionBtn('rgba(255,255,255,0.05)', '#f1f5f9', '1px solid #334155')}>
                              Chi tiết
                            </button>
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '16px 20px', fontWeight: 600, fontSize: 13 };
const tdStyle: React.CSSProperties = { padding: '16px 20px' };

const inputStyle: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: 6,
  color: '#f1f5f9',
  padding: '6px 10px',
  width: '120px',
  outline: 'none',
  fontSize: 13
};

const actionBtn = (bg: string, color = '#fff', border = 'none'): React.CSSProperties => ({
  background: bg,
  color,
  border,
  borderRadius: 6,
  padding: '6px 12px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer'
});
