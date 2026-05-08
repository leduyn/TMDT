'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { agencyApi, AgencyDTO, UserDTO } from '@/lib/api';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import { 
  Building2, Phone, MapPin, Mail, User as UserIcon, 
  ShieldCheck, CreditCard, PieChart, Users, ArrowLeft,
  Calendar, Map as MapIcon, Percent
} from 'lucide-react';

export default function AgencyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [agency, setAgency] = useState<AgencyDTO | null>(null);
  const [customers, setCustomers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (id) {
      fetchData();
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
