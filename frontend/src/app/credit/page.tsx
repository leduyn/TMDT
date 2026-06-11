'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { creditApi, agencyApi, agencyDebtApi, CreditDetail, AgencyDTO } from '@/lib/api';

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number | null | undefined) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n ?? 0);

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleString('vi-VN') : '—';

const LEDGER_LABELS: Record<string, { label: string; color: string }> = {
  DEBT:     { label: 'Ghi nợ',     color: '#ef4444' },
  PAYMENT:  { label: 'Thanh toán', color: '#22c55e' },
  INTEREST: { label: 'Lãi',        color: '#f59e0b' },
  HOLD:     { label: 'Giữ quỹ',    color: '#a78bfa' },
  REFUND:   { label: 'Hoàn tiền',  color: '#38bdf8' },
};

// ── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${color}30`,
      borderRadius: 16,
      padding: '20px 24px',
      minWidth: 200,
      flex: 1,
    }}>
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#1e293b', borderRadius: 16, padding: 32, minWidth: 380, maxWidth: 480,
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Main Page Content ────────────────────────────────────────────────────────
function CreditManagementContent() {
  const searchParams = useSearchParams();
  const [agencies, setAgencies]         = useState<AgencyDTO[]>([]);
  const [selectedId, setSelectedId]     = useState<number | null>(null);
  const [detail, setDetail]             = useState<CreditDetail | null>(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  // Modal state
  const [modal, setModal] = useState<'limit' | 'deposit' | 'payment' | null>(null);
  const [inputAmount, setInputAmount]   = useState('');
  const [inputOrderId, setInputOrderId] = useState('');
  const [submitting, setSubmitting]     = useState(false);

  // Role detection
  const [isCompany, setIsCompany]       = useState(false);
  const [agencyIdFromToken, setAgencyIdFromToken] = useState<number | null>(null);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (raw) {
      try {
        const u = JSON.parse(raw);
        const roles: string[] = u.roles ?? [];
        setIsCompany(roles.includes('ROLE_COMPANY'));
        if (roles.includes('ROLE_AGENCY') && u.agencyId) {
          setAgencyIdFromToken(Number(u.agencyId));
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const qId = searchParams.get('agencyId');
    
    if (isCompany) {
      agencyApi.getAll().then(setAgencies).catch(() => {});
      if (qId) {
        setSelectedId(Number(qId));
      }
    } else if (agencyIdFromToken) {
      setSelectedId(agencyIdFromToken);
    }
  }, [isCompany, agencyIdFromToken, searchParams]);

  const [currentDebts, setCurrentDebts] = useState<any[]>([]);

  const loadDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError('');
    try {
      const [d, debts] = await Promise.all([
        creditApi.getDetail(id),
        agencyDebtApi.getByAgencyId(id)
      ]);
      setDetail(d);
      setCurrentDebts(debts);
    } catch (e: any) {
      setError(e.message ?? 'Không thể tải dữ liệu tín dụng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const notify = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const closeModal = () => { 
    setModal(null); 
    setInputAmount(''); 
    setInputOrderId(''); 
    setOrderDebts([]); 
  };

  const [orderDebts, setOrderDebts] = useState<any[]>([]);

  useEffect(() => {
    if (modal === 'payment' && inputOrderId && !isNaN(parseInt(inputOrderId))) {
      const fetchOrderDebts = async () => {
        try {
          const debts = await agencyDebtApi.getByOrderId(parseInt(inputOrderId));
          setOrderDebts(debts);
        } catch (e) {
          console.error(e);
          setOrderDebts([]);
        }
      };
      const timer = setTimeout(fetchOrderDebts, 500);
      return () => clearTimeout(timer);
    } else {
      setOrderDebts([]);
    }
  }, [modal, inputOrderId]);

  const handleSubmitModal = async () => {
    if (!selectedId || !detail) return;
    setSubmitting(true);
    try {
      const amt = parseFloat(inputAmount);
      if (modal === 'limit') {
        if (isNaN(amt) || amt < 0) throw new Error('Hạn mức không hợp lệ');
      } else {
        if (isNaN(amt) || amt <= 0) throw new Error('Số tiền không hợp lệ');
      }

      if (modal === 'limit') {
        await creditApi.updateLimit(selectedId, amt);
        notify(`Đã cập nhật hạn mức thành ${fmt(amt)}`);
      } else if (modal === 'deposit') {
        await creditApi.depositVtc(selectedId, amt);
        notify(`Đã nạp ${fmt(amt)} vào ví ký quỹ`);
      } else if (modal === 'payment') {
        const oid = inputOrderId ? parseInt(inputOrderId) : undefined;
        await creditApi.payDebt(selectedId, amt, oid);
        notify(`Thanh toán ${fmt(amt)} thành công`);
      }
      closeModal();
      loadDetail(selectedId);
    } catch (e: any) {
      setError(e.message ?? 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: '32px 24px',
    }}>
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 30, fontWeight: 800, margin: 0,
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            💰 Quản lý Tín dụng Khách hàng
          </h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>
            Theo dõi hạn mức khả dụng (HMKD), ví ký quỹ và lịch sử giao dịch
          </p>
        </div>

        {/* Agency selector (company only) */}
        {isCompany && (
          <div style={{ marginBottom: 28 }}>
            <label style={{ color: '#94a3b8', fontSize: 13, display: 'block', marginBottom: 8 }}>
              Chọn Khách hàng
            </label>
            <select
              id="credit-agency-select"
              value={selectedId ?? ''}
              onChange={e => setSelectedId(Number(e.target.value))}
              style={{
                background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155',
                borderRadius: 10, padding: '10px 16px', fontSize: 14, minWidth: 320,
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">-- Chọn Khách hàng --</option>
              {agencies.map(a => (
                <option key={a.id} value={a.id}>{a.name} (ID: {a.id})</option>
              ))}
            </select>
          </div>
        )}

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

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>
            <div style={{ fontSize: 36, marginBottom: 12, animation: 'spin 1s linear infinite' }}>⟳</div>
            Đang tải dữ liệu...
          </div>
        )}

        {/* Detail */}
        {!loading && detail && (
          <>
            {/* Agency info card */}
            {(() => {
              const agency = agencies.find(a => a.id === selectedId);
              if (!agency) return null;
              return (
                <div style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: '20px 24px', marginBottom: 24,
                  display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 24,
                    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700, color: '#fff',
                  }}>
                    {agency.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{agency.name}</div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 6, fontSize: 13, color: '#94a3b8' }}>
                      {agency.phone && <span>📞 {agency.phone}</span>}
                      {agency.email && <span>✉ {agency.email}</span>}
                      {agency.address && <span>📍 {agency.address}</span>}
                      {agency.taxCode && <span>🆔 MST: {agency.taxCode}</span>}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: agency.active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: agency.active ? '#22c55e' : '#ef4444',
                  }}>
                    {agency.active ? '● Hoạt động' : '● Ngừng'}
                  </div>
                </div>
              );
            })()}

            {/* Stats grid */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
              <StatCard label="Hạn mức khả dụng (HMKD)" value={fmt(detail.hmkd)}
                sub="= Hạn mức − (Dư nợ + Nợ bảo lãnh) + Ký quỹ" color="#38bdf8" />
              <StatCard label="Hạn mức tín dụng" value={fmt(detail.creditLimit)} color="#818cf8" />
              <StatCard label="Dư nợ (Khách hàng)" value={fmt(detail.totalDebt)}
                sub={detail.overdueDebts.length > 0 ? `${detail.overdueDebts.length} khoản quá hạn` : 'Không có nợ quá hạn'}
                color={detail.totalDebt > 0 ? '#ef4444' : '#22c55e'} />
              <StatCard label="Nợ bảo lãnh (Người mua)" value={fmt(detail.guaranteeDebt)}
                color={detail.guaranteeDebt > 0 ? '#f43f5e' : '#10b981'} />
              <StatCard label="Ví ký quỹ khả dụng" value={fmt(detail.vtcAvailable)}
                sub="Giá trị còn lại của ví ký quỹ sau khi trừ khoản bị tạm giữ do nợ quá hạn"
                color="#f59e0b" />
              <StatCard label="Ví ký quỹ tạm giữ" value={fmt(detail.vtcHold)}
                sub="Tạm giữ khi đơn hàng liên quan đến Người mua bị nợ quá hạn chưa được thanh toán"
                color="#a78bfa" />
            </div>

            {/* Action buttons (company only) */}
            {isCompany && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                <Link href="/credit/config">
                  <button style={{
                    background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', border: '1px solid #334155',
                    borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}>
                    ⚙️ Cấu hình công nợ
                  </button>
                </Link>
                <button 
                  onClick={async () => {
                    if (!selectedId) return;
                    setLoading(true);
                    try {
                      const res = await creditApi.recalculate(selectedId);
                      notify(res.message);
                      loadDetail(selectedId);
                    } catch (e: any) {
                      setError(e.message || 'Lỗi khi tính toán lại');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', border: '1px solid #334155',
                    borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  🔄 Tính lại công nợ
                </button>
                {[
                  { id: 'btn-update-limit',   action: () => setModal('limit'),   label: '✏️ Cập nhật hạn mức', bg: '#4f46e5' },
                  { id: 'btn-deposit-vtc',    action: () => setModal('deposit'), label: '💰 Nạp ký quỹ VTC',    bg: '#0891b2' },
                  { id: 'btn-pay-debt',       action: () => setModal('payment'), label: '💳 Thanh toán nợ',      bg: '#16a34a' },
                ].map(btn => (
                  <button key={btn.id} id={btn.id} onClick={btn.action} style={{
                    background: btn.bg, color: '#fff', border: 'none', borderRadius: 10,
                    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    transition: 'opacity .2s',
                  }}
                    onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                  >{btn.label}</button>
                ))}
              </div>
            )}

            {/* Agency pay debt button */}
            {!isCompany && (
              <div style={{ marginBottom: 28 }}>
                <button id="btn-agency-pay" onClick={() => setModal('payment')} style={{
                  background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10,
                  padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  💳 Thanh toán nợ
                </button>
              </div>
            )}

            {/* Overdue debts */}
            {detail.overdueDebts.length > 0 && (
              <div style={{
                background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 16, padding: 24, marginBottom: 24,
              }}>
                <h2 style={{ color: '#fca5a5', fontWeight: 700, fontSize: 16, marginTop: 0, marginBottom: 16 }}>
                  ⚠️ Nợ quá hạn ({detail.overdueDebts.length} khoản)
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: '#94a3b8' }}>
                        {['Đơn hàng', 'Gốc', 'Lãi tích lũy', 'Tổng phải trả', 'Ngày bắt đầu', 'Tính lãi lần cuối'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detail.overdueDebts.map(d => (
                        <tr key={d.id} style={{ color: '#e2e8f0' }}>
                          <td style={{ padding: '10px 12px' }}>#{d.orderId}</td>
                          <td style={{ padding: '10px 12px', color: '#ef4444' }}>{fmt(d.principalAmount)}</td>
                          <td style={{ padding: '10px 12px', color: '#f59e0b' }}>{fmt(d.interestAccrued)}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700 }}>{fmt(d.principalAmount + d.interestAccrued)}</td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{fmtDate(d.startDate)}</td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{fmtDate(d.lastCalculatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Current individual debts */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 24, marginBottom: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, margin: 0 }}>
                  📂 Danh sách công nợ chi tiết
                </h2>
                <Link href={`/credit/debts?agencyId=${selectedId}`}>
                  <span style={{ fontSize: 12, color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>
                    Xem tất cả & quản lý
                  </span>
                </Link>
              </div>
              {currentDebts.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: 32 }}>Không có khoản nợ nào</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: '#94a3b8' }}>
                        {['Mã nợ', 'Đơn hàng', 'Hạng mục', 'Kỳ hạn', 'Giá trị nợ', 'Còn lại', 'Hạn thanh toán'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentDebts.map((d, i) => (
                        <tr key={d.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '10px 12px' }}><code>{d.debtCode}</code></td>
                          <td style={{ padding: '10px 12px' }}>
                            <Link href={`/orders/${d.orderId}`}>
                              <span style={{ color: '#38bdf8', textDecoration: 'underline' }}>#{d.orderId}</span>
                            </Link>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{d.jobCategory}</td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{d.debtTermDays} ngày</td>
                          <td style={{ padding: '10px 12px' }}>{fmt(d.value)}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: d.remainingToCollect > 0 ? '#ef4444' : '#22c55e' }}>
                            {fmt(d.remainingToCollect)}
                          </td>
                          <td style={{ padding: '10px 12px', color: new Date(d.dueDate) < new Date() && d.remainingToCollect > 0 ? '#ef4444' : '#94a3b8' }}>
                            {fmtDate(d.dueDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Customer debt list */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 24, marginBottom: 24,
            }}>
              <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginTop: 0, marginBottom: 16 }}>
                👥 Dư nợ theo Người mua
              </h2>
              {!detail.customerDebts || detail.customerDebts.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: 32 }}>Không có dữ liệu Người mua</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: '#94a3b8' }}>
                        {['Người mua', 'Dư nợ hiện tại'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detail.customerDebts.map((c, i) => (
                        <tr key={c.customerId} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 500, color: '#f1f5f9' }}>{c.customerName}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: c.totalDebt > 0 ? '#f59e0b' : '#22c55e' }}>
                            {fmt(c.totalDebt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Ledger history */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 24,
            }}>
              <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginTop: 0, marginBottom: 16 }}>
                📋 Lịch sử giao dịch (50 gần nhất)
              </h2>
              {detail.ledgerHistory.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: 32 }}>Chưa có giao dịch nào</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: '#94a3b8' }}>
                        {['Loại', 'Đối tượng', 'Số tiền', 'Mã tham chiếu', 'Thời gian'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detail.ledgerHistory.map((l, i) => {
                        const meta = LEDGER_LABELS[l.type] ?? { label: l.type, color: '#94a3b8' };
                        const isCustomer = l.receiverType === 'CUSTOMER';
                        return (
                          <tr key={l.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                background: meta.color + '22', color: meta.color,
                                borderRadius: 6, padding: '2px 10px', fontWeight: 600, fontSize: 12,
                              }}>{meta.label}</span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                background: isCustomer ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.1)',
                                color: isCustomer ? '#f59e0b' : '#94a3b8',
                                borderRadius: 6, padding: '2px 10px', fontWeight: 600, fontSize: 12,
                              }}>
                                {isCustomer ? 'Nợ bảo lãnh' : 'Nợ Khách hàng'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', color: meta.color, fontWeight: 600 }}>
                              {['DEBT', 'HOLD', 'INTEREST'].includes(l.type) ? '−' : '+'}{fmt(l.amount)}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{l.referenceId ?? '—'}</td>
                            <td style={{ padding: '10px 12px', color: '#64748b' }}>{fmtDate(l.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Last updated */}
            <div style={{ textAlign: 'right', color: '#475569', fontSize: 12, marginTop: 12 }}>
              Cập nhật lần cuối: {fmtDate(detail.updatedAt)}
            </div>
          </>
        )}

        {!loading && !detail && selectedId && (
          <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>
            Không tìm thấy tài khoản tín dụng cho Khách hàng này.
          </div>
        )}

        {!loading && !selectedId && (
          <div style={{ textAlign: 'center', color: '#64748b', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
            <div>Vui lòng chọn một Khách hàng để xem thông tin tín dụng</div>
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {modal === 'limit' && (
        <Modal title="Cập nhật hạn mức tín dụng" onClose={closeModal}>
          <label style={{ color: '#94a3b8', fontSize: 13 }}>Hạn mức mới (VND)</label>
          <input
            id="input-credit-limit"
            type="number" min="0" value={inputAmount}
            onChange={e => setInputAmount(e.target.value)}
            placeholder="Ví dụ: 100000000"
            style={inputStyle}
          />
          {detail && <div style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>
            Hiện tại: {fmt(detail.creditLimit)}
          </div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button id="btn-confirm-limit" onClick={handleSubmitModal} disabled={submitting} style={confirmBtn('#4f46e5')}>
              {submitting ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
            <button onClick={closeModal} style={cancelBtn}>Huỷ</button>
          </div>
        </Modal>
      )}

      {modal === 'deposit' && (
        <Modal title="Nạp tiền ký quỹ VTC" onClose={closeModal}>
          <label style={{ color: '#94a3b8', fontSize: 13 }}>Số tiền nạp (VND)</label>
          <input
            id="input-deposit-amount"
            type="number" min="0" value={inputAmount}
            onChange={e => setInputAmount(e.target.value)}
            placeholder="Ví dụ: 5000000"
            style={inputStyle}
          />
          {detail && <div style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>
            Ký quỹ hiện tại: {fmt(detail.vtcAvailable)}
          </div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button id="btn-confirm-deposit" onClick={handleSubmitModal} disabled={submitting} style={confirmBtn('#0891b2')}>
              {submitting ? 'Đang xử lý...' : 'Nạp ngay'}
            </button>
            <button onClick={closeModal} style={cancelBtn}>Huỷ</button>
          </div>
        </Modal>
      )}

      {modal === 'payment' && (
        <Modal title="Thanh toán nợ tín dụng" onClose={closeModal}>
          <label style={{ color: '#94a3b8', fontSize: 13 }}>Số tiền thanh toán (VND)</label>
          <input
            id="input-payment-amount"
            type="number" min="0" value={inputAmount}
            onChange={e => setInputAmount(e.target.value)}
            placeholder="Ví dụ: 2000000"
            style={inputStyle}
          />
          <label style={{ color: '#94a3b8', fontSize: 13, marginTop: 14, display: 'block' }}>
            ID đơn hàng cụ thể (để trống = trả FIFO)
          </label>
          <input
            id="input-payment-order-id"
            type="number" min="0" value={inputOrderId}
            onChange={e => setInputOrderId(e.target.value)}
            placeholder="Bỏ trống để trả nợ cũ nhất trước"
            style={inputStyle}
          />
          {orderDebts.length > 0 && (
            <div style={{ marginTop: 16, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', fontSize: 12, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                Công nợ theo đơn #{inputOrderId}
              </div>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ color: '#64748b', textAlign: 'left' }}>
                      <th style={{ padding: '6px 10px' }}>Mã nợ</th>
                      <th style={{ padding: '6px 10px' }}>Hạng mục</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center' }}>Kỳ hạn</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right' }}>Còn lại</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center' }}>Hạn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDebts.map(debt => (
                      <tr 
                        key={debt.id} 
                        onClick={() => setInputAmount(debt.remainingToCollect.toString())}
                        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '8px 10px', color: '#38bdf8' }}>{debt.debtCode}</td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'normal', color: '#94a3b8' }}>{debt.jobCategory}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: '#94a3b8' }}>{debt.debtTermDays}n</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>{fmt(debt.remainingToCollect)}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>{new Date(debt.dueDate).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {detail && (detail.totalDebt > 0 || detail.guaranteeDebt > 0) && (
            <div style={{ color: '#f59e0b', fontSize: 12, marginTop: 6 }}>
              Dư nợ: {fmt(detail.totalDebt)} | Nợ bảo lãnh: {fmt(detail.guaranteeDebt)}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button id="btn-confirm-payment" onClick={handleSubmitModal} disabled={submitting} style={confirmBtn('#16a34a')}>
              {submitting ? 'Đang xử lý...' : 'Thanh toán'}
            </button>
            <button onClick={closeModal} style={cancelBtn}>Huỷ</button>
          </div>
        </Modal>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function CreditManagementPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>Đang tải...</div>}>
      <CreditManagementContent />
    </Suspense>
  );
}

// ── Shared button styles ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', marginTop: 8, padding: '10px 14px',
  background: '#0f172a', border: '1px solid #334155',
  borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none',
  boxSizing: 'border-box',
};

const confirmBtn = (bg: string): React.CSSProperties => ({
  flex: 1, background: bg, color: '#fff', border: 'none',
  borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer',
});

const cancelBtn: React.CSSProperties = {
  flex: 1, background: 'transparent', color: '#94a3b8',
  border: '1px solid #334155', borderRadius: 8, padding: '10px 0',
  fontWeight: 600, fontSize: 14, cursor: 'pointer',
};

