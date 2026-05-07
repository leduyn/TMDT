'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { agencyApi, UserDTO } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { UserPlus, Eye, Mail, Users as UsersIcon } from 'lucide-react';

export default function MyCustomersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        window.location.href = '/login';
        return;
      }

      if (!user.roles?.includes('ROLE_AGENCY')) {
        setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản Đại lý.');
        setIsLoading(false);
        return;
      }

      if (user.id) {
        fetchMyCustomers(user.id);
      } else {
        setIsLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchMyCustomers = async (userId: number) => {
    try {
      setError('');
      setIsLoading(true);
      
      let agencyId = user?.agencyId;
      if (!agencyId) {
        const agencyData = await agencyApi.getMe(userId);
        agencyId = agencyData.id;
      }

      if (agencyId) {
        const customersData = await agencyApi.getCustomers(agencyId);
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } else {
        setError('Không tìm thấy thông tin đại lý cho tài khoản này.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải danh sách khách hàng.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<UserDTO>[] = [
    { 
      header: 'Khách hàng', 
      key: 'username',
      width: '30%',
      render: (c) => (
        <div>
          <div style={{ fontWeight: 600 }}>{c.username}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {c.id}</div>
        </div>
      )
    },
    { 
      header: 'Liên hệ', 
      key: 'email',
      width: '25%',
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
          <Mail size={14} style={{ color: 'var(--accent)' }} /> {c.email}
        </div>
      )
    },
    { 
      header: 'Nhóm', 
      key: 'customerGroupName',
      width: '20%',
      render: (c) => (
        <Badge 
          label={c.customerGroupName || 'Vãng lai'} 
          type={c.customerGroupName ? 'primary' : 'info'} 
          icon="Users"
        />
      )
    },
    { 
      header: 'Trạng thái', 
      key: 'active',
      width: '15%',
      render: (c) => (
        <Badge 
          label={c.active ? 'Đang hoạt động' : 'Chờ Admin duyệt'} 
          type={c.active ? 'success' : 'warning'} 
          icon={c.active ? 'CheckCircle' : 'Clock'}
        />
      )
    },
    { 
      header: 'Thao tác', 
      key: 'actions', 
      align: 'right',
      render: (c) => (
        <Link href={`/agency/customers/${c.id}`} className="btn-outline" style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem', textDecoration: 'none' }}>
          <Eye size={16} style={{ marginRight: 6 }} /> Chi tiết
        </Link>
      )
    }
  ];

  return (
    <>
      <Navbar />
      <main style={{ padding: '20px 0' }}>
        <PageHeader 
          title="Khách hàng của tôi" 
          subtitle="Quản lý danh sách khách hàng đang thuộc sự phụ trách của đại lý"
          icon="Users"
        />

        {error && (
          <div className="alert-error" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        <SearchActionHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm khách hàng theo tên hoặc email..."
          actions={
            <Link href="/agency/customers/create" className="btn-primary" style={{ textDecoration: 'none' }}>
              <UserPlus size={18} />
              Tạo khách hàng mới
            </Link>
          }
        />

        <DataTable 
          data={filteredCustomers}
          columns={columns}
          loading={isLoading}
          emptyMessage={searchQuery ? 'Không tìm thấy khách hàng nào phù hợp' : 'Bạn chưa quản lý khách hàng nào'}
        />
      </main>
    </>
  );
}
