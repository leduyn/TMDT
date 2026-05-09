'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { agencyApi, AgencyDTO, UserDTO, orderApi, OrderDTO } from '@/lib/api';
import Link from 'next/link';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import { 
  Building2, Phone, MapPin, Mail, User as UserIcon, 
  ShieldCheck, CreditCard, PieChart, Users, ArrowLeft,
  Calendar, Map as MapIcon, Percent, ShoppingCart
} from 'lucide-react';

export default function AgencyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [agency, setAgency] = useState<AgencyDTO | null>(null);
  const [customers, setCustomers] = useState<UserDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'orders'>('info');
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (id) {
      fetchData();
      fetchOrders();
    }
  }, [id, token]);

  const fetchData = async () => {
    if (!token || !id) return;
    setIsLoading(true);
    try {
      const agencyId = parseInt(id as string);
      const [agencyData, customersData] = await Promise.all([
        agencyApi.getById(agencyId),
        agencyApi.getCustomers(agencyId)
      ]);
      setAgency(agencyData);
      setCustomers(customersData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!token || !id) return;
    setIsLoadingOrders(true);
    try {
      const agencyId = parseInt(id as string);
      const ordersData = await orderApi.getByAgencyId(agencyId);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching agency orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#2ecc71';
      case 'PROCESSING': return '#3498db';
      case 'PENDING': return '#f1c40f';
      case 'CANCELLED': return '#e74c3c';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'PROCESSING': return 'Đang xử lý';
      case 'PENDING': return 'Chờ xử lý';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      </>
    );
  }

  if (!agency) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Không tìm thấy đại lý</h2>
          <button className="btn-outline" onClick={() => router.back()} style={{ marginTop: 20 }}>
            <ArrowLeft size={16} style={{ marginRight: 8 }} /> Quay lại
          </button>
        </div>
      </>
    );
  }

  const customerColumns: Column<UserDTO>[] = [
    { 
      header: 'Khách hàng', 
      key: 'username',
      render: (u) => (
        <div>
          <div style={{ fontWeight: 600 }}>{u.displayName || u.username}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
        </div>
      )
    },
    { header: 'Số điện thoại', key: 'phone' },
    { 
      header: 'Trạng thái', 
      key: 'approved',
      render: (u) => (
        <Badge 
          label={u.approved ? 'Đã duyệt' : 'Chờ duyệt'} 
          type={u.approved ? 'success' : 'warning'}
          icon={u.approved ? 'CheckCircle' : 'Clock'}
        />
      )
    }
  ];

  return (
    <>
      <Navbar />
      <main style={{ padding: '20px 0' }}>
        <div style={{ padding: '0 24px', marginBottom: 16 }}>
          <button 
            className="btn-outline" 
            onClick={() => router.back()} 
            style={{ 
              padding: '8px 16px', 
              borderRadius: 12, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8 
            }}
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
        </div>

        <PageHeader 
          title={agency.name} 
          subtitle={`Chi tiết thông tin đại lý ID: ${agency.id}`}
          icon="Building2"
          actions={
            <div style={{ display: 'flex', gap: 12 }}>
              <Badge 
                label={agency.status === 'PENDING' ? 'Chờ duyệt' : (agency.active ? 'Đang hoạt động' : 'Tạm ngưng')} 
                type={agency.status === 'PENDING' ? 'warning' : (agency.active ? 'success' : 'error')} 
                style={{ fontSize: '0.9rem', padding: '8px 16px' }}
              />
            </div>
          }
        />

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', gap: 8, margin: '0 24px 32px', 
          padding: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 16,
          width: 'fit-content'
        }}>
          <button 
            onClick={() => setActiveTab('info')}
            style={{ 
              padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: activeTab === 'info' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'info' ? 'white' : 'var(--text-muted)',
              fontWeight: 600, transition: 'all 0.3s ease'
            }}
          >
            Thông tin chung
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            style={{ 
              padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: activeTab === 'orders' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'orders' ? 'white' : 'var(--text-muted)',
              fontWeight: 600, transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            Đơn hàng
            <span style={{ 
              fontSize: '0.75rem', padding: '2px 8px', borderRadius: 8,
              background: activeTab === 'orders' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'
            }}>
              {orders.length}
            </span>
          </button>
        </div>

        {activeTab === 'info' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, padding: '0 24px' }}>
            {/* Cột trái: Thông tin cơ bản & Tài khoản */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <GlassCard style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                  <UserIcon size={20} /> Thông tin liên hệ
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <InfoItem icon={<Phone size={16} />} label="Số điện thoại" value={agency.phone || 'N/A'} />
                  <InfoItem icon={<Mail size={16} />} label="Email" value={agency.email || 'N/A'} />
                  <InfoItem icon={<MapPin size={16} />} label="Địa chỉ" value={agency.address || 'N/A'} />
                  <InfoItem icon={<UserIcon size={16} />} label="Tài khoản" value={agency.username || 'N/A'} />
                </div>
              </GlassCard>

              <GlassCard style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                  <PieChart size={20} /> Thiết lập hệ thống
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <InfoItem 
                    icon={<Percent size={16} />} 
                    label="Chiết khấu mặc định" 
                    value={`${agency.defaultCommissionRate || 0}%`} 
                  />
                  <InfoItem 
                    icon={<Calendar size={16} />} 
                    label="Ngày tham gia" 
                    value="08/05/2026" 
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <InfoItem icon={<MapIcon size={16} />} label="Vĩ độ" value={agency.latitude?.toString() || '0.0'} />
                    <InfoItem icon={<MapIcon size={16} />} label="Kinh độ" value={agency.longitude?.toString() || '0.0'} />
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Cột phải: Thông tin hóa đơn & Danh sách khách hàng */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <GlassCard style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                  <CreditCard size={20} /> Thông tin xuất hóa đơn
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <InfoItem label="Tên tổ chức / Công ty" value={agency.organizationName || 'Chưa cập nhật'} fullWidth />
                  <InfoItem label="Mã số thuế" value={agency.taxCode || 'Chưa cập nhật'} />
                  <InfoItem label="Địa chỉ hóa đơn" value={agency.billingAddress || 'Chưa cập nhật'} fullWidth />
                </div>
              </GlassCard>

              <GlassCard style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                    <Users size={20} /> Khách hàng thuộc đại lý
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tổng số: {customers.length}</span>
                </div>
                <DataTable 
                  data={customers}
                  columns={customerColumns}
                  emptyMessage="Đại lý này chưa có khách hàng nào"
                />
              </GlassCard>
            </div>
          </div>
        ) : (
          <div style={{ padding: '0 24px' }}>
            <GlassCard style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                  <ShoppingCart size={20} /> Lịch sử đơn hàng của đại lý
                </h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{orders.length} đơn hàng</span>
              </div>
              
              {isLoadingOrders ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto', width: 30, height: 30 }} />
                </div>
              ) : orders.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Mã đơn</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Khách hàng</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Ngày đặt</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Tổng tiền</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Trạng thái</th>
                        <th style={{ padding: '12px 8px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '16px 8px', fontWeight: 600 }}>#{order.id}</td>
                          <td style={{ padding: '16px 8px' }}>{order.customerName}</td>
                          <td style={{ padding: '16px 8px' }}>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                          <td style={{ padding: '16px 8px', fontWeight: 700 }}>{order.totalAmount.toLocaleString('vi-VN')}đ</td>
                          <td style={{ padding: '16px 8px' }}>
                            <span style={{ 
                              padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                              background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status),
                              border: `1px solid ${getStatusColor(order.status)}40`
                            }}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                            <Link href={`/orders/${order.id}`} className="btn-text" style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
                              Chi tiết
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed var(--border)', borderRadius: 12 }}>
                  <ShoppingCart size={40} style={{ marginBottom: 16, opacity: 0.2 }} />
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Chưa có đơn hàng nào được thực hiện</p>
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </main>

      <style jsx>{`
        .info-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .info-value {
          font-weight: 500;
          color: var(--text-primary);
        }
      `}</style>
    </>
  );
}

function InfoItem({ icon, label, value, fullWidth = false }: { icon?: React.ReactNode, label: string, value: string, fullWidth?: boolean }) {
  return (
    <div style={{ gridColumn: fullWidth ? 'span 2' : 'span 1' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon} {label}
      </div>
      <div style={{ fontWeight: 500, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
        {value}
      </div>
    </div>
  );
}
