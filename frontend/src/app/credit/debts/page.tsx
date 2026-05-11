'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { agencyDebtApi, agencyApi, AgencyDebtDTO, AgencyDTO } from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';
import Badge, { BadgeType } from '@/components/ui/Badge';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileText, 
  CreditCard, 
  Clock, 
  Coins,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString('vi-VN') : '—';

export default function AgencyDebtsPage() {
  return (
    <Suspense fallback={<div className="container">Đang tải...</div>}>
      <AgencyDebtsContent />
    </Suspense>
  );
}

function AgencyDebtsContent() {
  const searchParams = useSearchParams();
  const [agencies, setAgencies] = useState<AgencyDTO[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
  const [debts, setDebts] = useState<AgencyDebtDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // User role info
  const [isAdmin, setIsAdmin] = useState(false);
  const [myAgencyId, setMyAgencyId] = useState<number | null>(null);

  // Payment modal
  const [paymentModal, setPaymentModal] = useState<{ debt: AgencyDebtDTO; amount: string } | null>(null);
  const [paying, setPaying] = useState(false);
  
  // Order details modal
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        const roles = u.roles || [];
        const adminRoles = ['ROLE_ADMIN', 'ROLE_COMPANY', 'ROLE_ACCOUNTANT'];
        const isAdm = roles.some((r: string) => adminRoles.includes(r));
        setIsAdmin(isAdm);
        
        if (roles.includes('ROLE_AGENCY') && u.agencyId) {
          setMyAgencyId(Number(u.agencyId));
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      agencyApi.getAll().then(setAgencies).catch(() => {});
      const qId = searchParams.get('agencyId');
      if (qId) setSelectedAgencyId(Number(qId));
    } else if (myAgencyId) {
      setSelectedAgencyId(myAgencyId);
    }
  }, [isAdmin, myAgencyId, searchParams]);

  const loadDebts = useCallback(async (agencyId: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await agencyDebtApi.getByAgencyId(agencyId);
      setDebts(data);
    } catch (e: any) {
      setError(e.message || 'Không thể tải danh sách công nợ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAgencyId) {
      loadDebts(selectedAgencyId);
    }
  }, [selectedAgencyId, loadDebts]);

  const handlePay = async () => {
    if (!paymentModal) return;
    const amount = parseFloat(paymentModal.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Số tiền không hợp lệ');
      return;
    }

    setPaying(true);
    try {
      await agencyDebtApi.payDebt(paymentModal.debt.id, amount);
      setPaymentModal(null);
      if (selectedAgencyId) loadDebts(selectedAgencyId);
    } catch (e: any) {
      alert(e.message || 'Thanh toán thất bại');
    } finally {
      setPaying(false);
    }
  };

  const getDebtTypeBadge = (type: string) => {
    let label = type;
    let badgeType: BadgeType = 'info';
    switch (type) {
      case 'ORDER_VALUE': label = 'Đơn hàng'; badgeType = 'primary'; break;
      case 'DELIVERY_FEE': label = 'Phí giao hàng'; badgeType = 'warning'; break;
      case 'INCREASE': label = 'Tăng công nợ'; badgeType = 'error'; break;
      case 'DECREASE': label = 'Giảm công nợ'; badgeType = 'success'; break;
    }
    return <Badge label={label} type={badgeType} />;
  };

  return (
    <div className="container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>Quản lý Công nợ Đại lý</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Theo dõi chi tiết công nợ theo từng đơn hàng và phí vận chuyển</p>
      </div>

      {isAdmin && (
        <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <div style={{ flex: 1, maxWidth: 300 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Chọn Đại lý</label>
            <select 
              className="form-input"
              value={selectedAgencyId || ''}
              onChange={e => setSelectedAgencyId(Number(e.target.value))}
            >
              <option value="">-- Tất cả đại lý --</option>
              {agencies.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" onClick={() => selectedAgencyId && loadDebts(selectedAgencyId)}>
            <Search size={18} style={{ marginRight: 8 }} />
            Lọc dữ liệu
          </button>
        </div>
      )}

      {error && (
        <div style={{ padding: 16, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 8, color: '#ef4444', marginBottom: 24 }}>
          {error}
        </div>
      )}

      <GlassCard style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="debt-table">
            <thead>
              <tr>
                <th>Ngày ghi nhận</th>
                <th>Khách hàng</th>
                <th>Mã công nợ</th>
                <th>Mã ĐH</th>
                <th>Loại</th>
                <th>Hạng mục</th>
                <th>Kỳ hạn</th>
                <th>Giá trị</th>
                <th>Đã TT</th>
                <th>Còn lại</th>
                <th>Ngày tới hạn</th>
                <th>A-coin</th>
                {isAdmin && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={13} style={{ textAlign: 'center', padding: 48 }}>Đang tải...</td>
                </tr>
              ) : debts.length === 0 ? (
                <tr>
                  <td colSpan={13} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    Không có dữ liệu công nợ
                  </td>
                </tr>
              ) : debts.map(debt => {
                const isOverdue = new Date(debt.dueDate) < new Date() && debt.remainingToCollect > 0;
                return (
                  <tr key={debt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td>{fmtDate(debt.recordingDate)}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{debt.customerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{debt.customerCode} • {debt.customerLevel}</div>
                    </td>
                    <td><code style={{ fontSize: 11 }}>{debt.debtCode}</code></td>
                    <td>
                      <button 
                        onClick={() => setSelectedOrderId(debt.orderId)}
                        style={{ 
                          background: 'none', border: 'none', color: 'var(--primary)', 
                          cursor: 'pointer', padding: 0, textDecoration: 'underline',
                          fontWeight: 500
                        }}
                      >
                        #{debt.orderId}
                      </button>
                    </td>
                    <td>{getDebtTypeBadge(debt.debtType)}</td>
                    <td style={{ fontSize: 12, maxWidth: 150 }}>{debt.jobCategory}</td>
                    <td style={{ textAlign: 'center' }}>{debt.debtTermDays} ngày</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(debt.value)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--success)' }}>{fmt(debt.paidValue)}</td>
                    <td style={{ textAlign: 'right', color: debt.remainingToCollect > 0 ? 'var(--error)' : 'inherit', fontWeight: 700 }}>
                      {fmt(debt.remainingToCollect)}
                    </td>
                    <td>
                      <div style={{ 
                        color: isOverdue ? 'var(--error)' : 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {isOverdue && <AlertCircle size={14} />}
                        {fmtDate(debt.dueDate)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#f59e0b' }}>
                        <Coins size={14} />
                        {debt.aCoin}
                      </div>
                    </td>
                    {isAdmin && (
                      <td>
                        {debt.remainingToCollect > 0 && (
                          <button 
                            className="btn-sm-primary"
                            onClick={() => setPaymentModal({ debt, amount: debt.remainingToCollect.toString() })}
                          >
                            Thanh toán
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {paymentModal && (
        <div className="modal-overlay">
          <GlassCard className="modal-content" style={{ maxWidth: 400, width: '100%', padding: 24 }}>
            <h3 style={{ marginBottom: 20 }}>Thanh toán công nợ</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Mã công nợ</div>
              <div style={{ fontWeight: 600 }}>{paymentModal.debt.debtCode}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Số tiền thanh toán (đ)</label>
              <input 
                type="number" 
                className="form-input"
                value={paymentModal.amount}
                onChange={e => setPaymentModal({ ...paymentModal, amount: e.target.value })}
              />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Còn lại cần thu: {fmt(paymentModal.debt.remainingToCollect)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setPaymentModal(null)}>Hủy</button>
              <button 
                className="btn-primary" 
                style={{ flex: 1 }} 
                onClick={handlePay}
                disabled={paying}
              >
                {paying ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {selectedOrderId && (
        <OrderDebtsModal 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)} 
          onPay={(debt) => setPaymentModal({ debt, amount: debt.remainingToCollect.toString() })}
        />
      )}

      <style jsx>{`
        .debt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .debt-table th {
          text-align: left;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
          font-weight: 600;
          white-space: nowrap;
        }
        .debt-table td {
          padding: 14px 16px;
          white-space: nowrap;
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .btn-sm-primary {
          background: var(--primary);
          color: white;
          border: none;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }
        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border);
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        .form-input {
          width: 100%;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-primary);
        }
        .form-label {
          display: block;
          font-size: 13px;
          margin-bottom: 6px;
          color: var(--text-muted);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
      `}</style>
    </div>
  );
}

function OrderDebtsModal({ orderId, onClose, onPay }: { orderId: number; onClose: () => void; onPay: (debt: AgencyDebtDTO) => void }) {
  const [debts, setDebts] = useState<AgencyDebtDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agencyDebtApi.getByOrderId(orderId)
      .then(setDebts)
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="modal-overlay">
      <GlassCard className="modal-content" style={{ maxWidth: 800, width: '100%', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3>Công nợ Đơn hàng #{orderId}</h3>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '4px 12px' }}>Đóng</button>
        </div>
        
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="debt-table">
              <thead>
                <tr>
                  <th>Mã công nợ</th>
                  <th>Hạng mục</th>
                  <th style={{ textAlign: 'center' }}>Kỳ hạn</th>
                  <th style={{ textAlign: 'right' }}>Giá trị</th>
                  <th style={{ textAlign: 'right' }}>Còn lại</th>
                  <th>Ngày tới hạn</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {debts.map(debt => (
                  <tr key={debt.id}>
                    <td><code>{debt.debtCode}</code></td>
                    <td>{debt.jobCategory}</td>
                    <td style={{ textAlign: 'center' }}>{debt.debtTermDays} ngày</td>
                    <td style={{ textAlign: 'right' }}>{fmt(debt.value)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: debt.remainingToCollect > 0 ? 'var(--error)' : 'inherit' }}>
                      {fmt(debt.remainingToCollect)}
                    </td>
                    <td>{fmtDate(debt.dueDate)}</td>
                    <td>
                      {debt.remainingToCollect > 0 && (
                        <button className="btn-sm-primary" onClick={() => { onClose(); onPay(debt); }}>
                          Thanh toán
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
