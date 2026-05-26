'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { orderApi, OrderDTO } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge, { BadgeType } from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import { Eye, Search, Filter, Plus, CheckCircle2, Truck } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // If Admin/Company, we can get all. But getMyOrders should also work and handle role-based filtering on backend.
      const data = (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_COMPANY'))
        ? await orderApi.getAll()
        : await orderApi.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    let type: BadgeType = 'info';
    let label = status;

    switch (status) {
      case 'NEW':
      case 'PENDING':
        type = 'warning';
        label = 'Chờ xử lý';
        break;
      case 'PROCESSING':
        type = 'primary';
        label = 'Đang xử lý';
        break;
      case 'COMPLETED':
        type = 'success';
        label = 'Hoàn thành';
        break;
      case 'CANCELLED':
        type = 'error';
        label = 'Đã hủy';
        break;
    }
    return <Badge label={label} type={type} />;
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesSearch = o.id.toString().includes(searchTerm) || 
                         o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const columns: Column<OrderDTO>[] = [
    { header: 'Mã đơn', key: 'id', render: (o) => <strong>#{o.id}</strong> },
    { header: 'Ngày đặt', key: 'orderDate', render: (o) => new Date(o.orderDate).toLocaleDateString('vi-VN') },
    { header: 'Người mua', key: 'customerName' },
    { header: 'Khách hàng xử lý', key: 'agencyName', render: (o) => o.agencyName || <span style={{ color: 'var(--text-muted)' }}>Trực tiếp</span> },
    { header: 'Người tạo', key: 'createdByName', render: (o) => o.createdByName || 'N/A' },
    { header: 'Tổng tiền', key: 'totalAmount', align: 'right', render: (o) => <span style={{ fontWeight: 600 }}>{o.totalAmount?.toLocaleString()}đ</span> },
    { header: 'Trạng thái', key: 'status', align: 'center', render: (o) => getStatusBadge(o.status) },
    { 
      header: 'Cập nhật', 
      key: 'updatedDate', 
      render: (o) => o.updatedDate ? new Date(o.updatedDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '---' 
    },
    { 
      header: 'Thao tác', 
      key: 'actions', 
      align: 'right',
      render: (o) => {
        const canUpdate = user?.roles.some(r => ['ROLE_ADMIN', 'ROLE_COMPANY'].includes(r));
        return (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {canUpdate && (o.status === 'PENDING' || o.status === 'NEW') && (
              <button 
                onClick={() => handleUpdateStatus(o.id, 'PROCESSING')} 
                className="btn-quick-success" 
                title="Xác nhận & Xử lý"
              >
                <CheckCircle2 size={16} />
              </button>
            )}
            {canUpdate && o.status === 'PROCESSING' && (
              <button 
                onClick={() => handleUpdateStatus(o.id, 'COMPLETED')} 
                className="btn-quick-success" 
                title="Hoàn thành"
              >
                <Truck size={16} />
              </button>
            )}
            <Link href={`/orders/${o.id}`} className="btn-icon" title="Xem chi tiết">
              <Eye size={18} />
            </Link>
          </div>
        );
      }
    }
  ];

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    if (!confirm(`Bạn có chắc muốn chuyển trạng thái đơn hàng sang ${newStatus}?`)) return;
    try {
      await orderApi.updateStatus(id, newStatus);
      fetchOrders();
    } catch (error) {
      alert('Cập nhật thất bại: ' + error);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Quản lý đơn hàng</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Theo dõi và xử lý đơn hàng của hệ thống</p>
        </div>
        {(user?.roles.includes('ROLE_COMPANY') || user?.roles.includes('ROLE_AGENCY') || user?.roles.includes('ROLE_ADMIN')) && (
          <Link href="/orders/create" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} />
            Tạo đơn mới
          </Link>
        )}
      </div>

      <GlassCard style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Tìm theo mã đơn, Người mua..." 
              className="form-input"
              style={{ paddingLeft: 40 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Filter size={18} style={{ color: 'var(--text-muted)' }} />
            <select 
              className="form-input" 
              style={{ width: 180 }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="NEW">Mới / Chờ xử lý</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </GlassCard>

      <DataTable 
        data={filteredOrders} 
        columns={columns} 
        loading={loading}
        emptyMessage="Không tìm thấy đơn hàng nào"
      />

      <style jsx>{`
        .btn-primary {
          padding: 10px 20px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-primary:hover {
          background: var(--primary-dark);
        }
        .btn-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .btn-icon:hover {
          background: var(--primary-light);
          color: white;
          border-color: var(--primary);
        }
        .btn-quick-success {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #22c55e;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-quick-success:hover {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }
      `}</style>
    </div>
  );
}

