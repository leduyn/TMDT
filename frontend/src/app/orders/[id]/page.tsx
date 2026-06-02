'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderApi, OrderDTO } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import Badge, { BadgeType } from '@/components/ui/Badge';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  Phone,
  FileText,
  CreditCard
} from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getById(Number(id));
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order || !confirm(`Bạn có chắc muốn chuyển trạng thái đơn hàng sang ${newStatus}?`)) return;
    
    setUpdating(true);
    try {
      const updated = await orderApi.updateStatus(order.id, newStatus);
      setOrder(updated);
    } catch (error) {
      alert('Cập nhật trạng thái thất bại: ' + error);
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!order || !confirm('Xác nhận thanh toán cho đơn hàng này?')) return;
    setUpdating(true);
    try {
      await orderApi.confirmPayment(order.id);
      fetchOrder();
    } catch (error) {
      alert('Xác nhận thanh toán thất bại: ' + error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    let type: BadgeType = 'info';
    let label = status;

    switch (status) {
      case 'NEW':
      case 'PENDING': type = 'warning'; label = 'Chờ xử lý'; break;
      case 'PROCESSING': type = 'primary'; label = 'Đang xử lý'; break;
      case 'PENDING_PAYMENT': type = 'info'; label = 'Chờ thanh toán'; break;
      case 'COMPLETED': type = 'success'; label = 'Hoàn thành'; break;
      case 'CANCELLED': type = 'error'; label = 'Đã hủy'; break;
    }
    return <Badge label={label} type={type} />;
  };

  if (loading) return <div className="container">Đang tải chi tiết đơn hàng...</div>;
  if (!order) return <div className="container">Không tìm thấy đơn hàng.</div>;

  const canUpdateStatus = user?.roles.some(r => ['ROLE_ADMIN', 'ROLE_COMPANY'].includes(r));

  return (
    <div className="container">
      <div style={{ marginBottom: 24 }}>
        <button 
          onClick={() => router.back()} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: 8, 
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.95rem'
          }}
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 20 }}>
        <div>
          <h1 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            Đơn hàng #{order.id}
            {getStatusBadge(order.status)}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Đặt lúc: {order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : '—'}
          </p>
        </div>

        {canUpdateStatus && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
          <div style={{ display: 'flex', gap: 12 }}>
            {(order.status === 'PENDING' || order.status === 'NEW') && (
              <button 
                className="btn btn-primary" 
                onClick={() => handleUpdateStatus('PROCESSING')}
                disabled={updating}
              >
                Xác nhận đơn hàng
              </button>
            )}
            {order.status === 'PROCESSING' && (
              <button 
                className="btn btn-success" 
                onClick={() => handleUpdateStatus('COMPLETED')}
                disabled={updating}
              >
                Hoàn thành đơn hàng
              </button>
            )}
            {order.status === 'PENDING_PAYMENT' && (
              <button 
                className="btn btn-primary" 
                onClick={handleConfirmPayment}
                disabled={updating}
              >
                Xác nhận thanh toán
              </button>
            )}
            <button 
              className="btn btn-error" 
              onClick={() => handleUpdateStatus('CANCELLED')}
              disabled={updating}
            >
              Hủy đơn
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
        {/* Main Content: Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <GlassCard title="Danh sách sản phẩm" icon={<Package size={20} />}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Sản phẩm</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>Số lượng</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)' }}>Đơn giá</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {item.productImageUrl ? (
                          <img src={item.productImageUrl} alt={item.productName} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.05)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={20} style={{ opacity: 0.3 }} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.productName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {item.productId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>x{item.quantity}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>{(item.price ?? 0).toLocaleString()}đ</td>
                    <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 600 }}>{((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString()}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 40, color: 'var(--text-secondary)' }}>
                <span>Tạm tính (hàng):</span>
                <span style={{ minWidth: 100, textAlign: 'right' }}>{((order.totalAmount ?? 0) - (order.deliveryFee ?? 0) + (order.discountAmount ?? 0)).toLocaleString()}đ</span>
              </div>
              {(order.discountAmount ?? 0) > 0 && (
                <div style={{ display: 'flex', gap: 40, color: 'var(--error)' }}>
                  <span>Giảm giá ({order.promotionCode || 'Loyalty'}):</span>
                  <span style={{ minWidth: 100, textAlign: 'right' }}>-{(order.discountAmount ?? 0).toLocaleString()}đ</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 40, color: 'var(--text-secondary)' }}>
                <span>Phí giao hàng:</span>
                <span style={{ minWidth: 100, textAlign: 'right' }}>{(order.deliveryFee ?? 0).toLocaleString()}đ</span>
              </div>
              <div style={{ display: 'flex', gap: 40, fontSize: '1.25rem', fontWeight: 800, marginTop: 8 }}>
                <span>Tổng cộng:</span>
                <span className="gradient-text" style={{ minWidth: 100, textAlign: 'right' }}>{(order.totalAmount ?? 0).toLocaleString()}đ</span>
              </div>
            </div>
          </GlassCard>

          {/* Timeline Placeholder */}
          <GlassCard title="Lịch sử đơn hàng" icon={<Clock size={20} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '10px 0' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <CheckCircle2 size={14} />
                  </div>
                  <div style={{ width: 2, flex: 1, background: order.status !== 'PENDING' ? 'var(--primary)' : 'var(--border)', margin: '4px 0' }}></div>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Đã đặt hàng</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : '—'}</div>
                </div>
              </div>

              {(order.status !== 'PENDING' && order.status !== 'NEW') && order.status !== 'CANCELLED' && (
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <Truck size={14} />
                    </div>
                    <div style={{ width: 2, flex: 1, background: order.status === 'COMPLETED' ? 'var(--success)' : 'var(--border)', margin: '4px 0' }}></div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Đang xử lý</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hệ thống đang chuẩn bị hàng</div>
                  </div>
                </div>
              )}

              {order.status === 'COMPLETED' && (
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Giao hàng thành công</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Đơn hàng đã hoàn tất</div>
                  </div>
                </div>
              )}

              {order.status === 'CANCELLED' && (
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <XCircle size={14} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Đã hủy</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Đơn hàng đã bị hủy bỏ</div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {order.status === 'COMPLETED' && (
            <OrderDebtsSection orderId={order.id} />
          )}
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <GlassCard title="Thông tin người mua" icon={<User size={20} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Tên người mua</div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} />
                  {order.customerName}
                </div>
              </div>
              {order.agencyName && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Khách hàng quản lý</div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} />
                    {order.agencyName}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard title="Địa chỉ giao hàng" icon={<MapPin size={20} />}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <MapPin size={20} style={{ color: 'var(--primary)', marginTop: 4 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Địa chỉ nhận hàng</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {order.shippingAddress || 'Không có thông tin địa chỉ'}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Thông tin bổ sung" icon={<FileText size={20} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Loại đơn:</span>
                <span style={{ fontWeight: 500 }}>{order.orderType === 'DROPSHIP' ? 'Dropship' : 'Marketplace'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mã giảm giá:</span>
                <span style={{ fontWeight: 500 }}>{order.promotionCode || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Điểm sử dụng:</span>
                <span style={{ fontWeight: 500 }}>{order.pointsRedeemed || 0}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function OrderDebtsSection({ orderId }: { orderId: number }) {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState<any | null>(null);
  const [amount, setAmount] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.roles.some(r => ['ROLE_ADMIN', 'ROLE_COMPANY', 'ROLE_ACCOUNTANT'].includes(r));

  const load = async () => {
    try {
      const { agencyDebtApi } = await import('@/lib/api');
      const data = await agencyDebtApi.getByOrderId(orderId);
      setDebts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [orderId]);

  const handlePay = async () => {
    if (!payModal) return;
    try {
      const { agencyDebtApi } = await import('@/lib/api');
      await agencyDebtApi.payDebt(payModal.id, parseFloat(amount));
      setPayModal(null);
      load();
    } catch (e) {
      alert('Thanh toán thất bại');
    }
  };

  if (loading) return <GlassCard title="Đang tải thông tin công nợ..." icon={<Clock size={20} />} />;
  if (debts.length === 0) return null;

  return (
    <>
      <GlassCard title="Thông tin công nợ" icon={<CreditCard size={20} />}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Mã công nợ</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Hạng mục</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Kỳ hạn</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Giá trị nợ</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Còn lại</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Ngày tới hạn</th>
                {isAdmin && <th style={{ padding: '10px', textAlign: 'right' }}>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {debts.map(debt => (
                <tr key={debt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 10px' }}><code>{debt.debtCode}</code></td>
                  <td style={{ padding: '12px 10px' }}>{debt.jobCategory}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{debt.debtTermDays} ngày</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>{(debt.value ?? 0).toLocaleString()}đ</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 600, color: (debt.remainingToCollect ?? 0) > 0 ? 'var(--error)' : 'inherit' }}>
                    {(debt.remainingToCollect ?? 0).toLocaleString()}đ
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('vi-VN') : '—'}</td>
                  {isAdmin && (
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      {debt.remainingToCollect > 0 && (
                        <button 
                          className="btn-pay-sm"
                          onClick={() => { setPayModal(debt); setAmount(debt.remainingToCollect.toString()); }}
                        >
                          Thanh toán
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {payModal && (
        <div className="modal-overlay">
          <GlassCard style={{ maxWidth: 400, width: '100%', padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Thanh toán nợ</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Thanh toán cho khoản nợ: <strong>{payModal.debtCode}</strong>
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 6 }}>Số tiền (đ)</label>
              <input 
                type="number" 
                className="form-input" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => setPayModal(null)}>Hủy</button>
              <button 
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }} 
                onClick={handlePay}
              >
                Xác nhận
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      <style jsx>{`
        .btn-pay-sm {
          background: var(--primary);
          color: white;
          border: none;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
        }
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6); display: flex; align-items: center;
          justify-content: center; z-index: 1000; padding: 20px;
        }
        .form-input {
          width: 100%; padding: 10px; background: rgba(255,255,255,0.05);
          border: 1px solid var(--border); border-radius: 8px; color: white;
        }
      `}</style>
    </>
  );
}
