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
  FileText
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

  const getStatusBadge = (status: string) => {
    let type: BadgeType = 'info';
    let label = status;

    switch (status) {
      case 'PENDING': type = 'warning'; label = 'Chờ xử lý'; break;
      case 'PROCESSING': type = 'primary'; label = 'Đang xử lý'; break;
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
            Đặt lúc: {new Date(order.orderDate).toLocaleString('vi-VN')}
          </p>
        </div>

        {canUpdateStatus && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
          <div style={{ display: 'flex', gap: 12 }}>
            {order.status === 'PENDING' && (
              <button 
                className="btn btn-primary" 
                onClick={() => handleUpdateStatus('PROCESSING')}
                disabled={updating}
              >
                Xác nhận & Xử lý
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
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>{item.price.toLocaleString()}đ</td>
                    <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString()}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 40, color: 'var(--text-secondary)' }}>
                <span>Tạm tính:</span>
                <span style={{ minWidth: 100, textAlign: 'right' }}>{(order.totalAmount + order.discountAmount).toLocaleString()}đ</span>
              </div>
              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', gap: 40, color: 'var(--error)' }}>
                  <span>Giảm giá ({order.promotionCode || 'Loyalty'}):</span>
                  <span style={{ minWidth: 100, textAlign: 'right' }}>-{order.discountAmount.toLocaleString()}đ</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 40, fontSize: '1.25rem', fontWeight: 800, marginTop: 8 }}>
                <span>Tổng cộng:</span>
                <span className="gradient-text" style={{ minWidth: 100, textAlign: 'right' }}>{order.totalAmount.toLocaleString()}đ</span>
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
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(order.orderDate).toLocaleString('vi-VN')}</div>
                </div>
              </div>

              {order.status !== 'PENDING' && order.status !== 'CANCELLED' && (
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
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <GlassCard title="Thông tin khách hàng" icon={<User size={20} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Tên khách hàng</div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} />
                  {order.customerName}
                </div>
              </div>
              {order.agencyName && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Đại lý quản lý</div>
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
