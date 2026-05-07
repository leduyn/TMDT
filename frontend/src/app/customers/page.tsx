'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { customerApi, UserDTO } from '@/lib/api';
import Link from 'next/link';
import NotificationModal from '@/components/NotificationModal';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { UserPlus, CheckCircle, Eye, Edit } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'info' as any
  });
  
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    setIsLoading(true);
    customerApi.getAll()
      .then(d => {
        setCustomers(d);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const handleActivate = async (id: number) => {
    try {
      await customerApi.activate(id);
      setModal({ isOpen: true, title: 'Thành công', message: 'Đã kích hoạt khách hàng thành công!', type: 'success' });
      fetchCustomers();
    } catch (err: any) {
      setModal({ isOpen: true, title: 'Lỗi kích hoạt', message: err.message || 'Lỗi khi duyệt khách hàng', type: 'error' });
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
      render: (c) => (
        <div>
          <div style={{ fontWeight: 600 }}>{c.username}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {c.id}</div>
        </div>
      )
    },
    { header: 'Email', key: 'email' },
    { 
      header: 'Nhóm', 
      key: 'customerGroupName',
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
      render: (c) => (
        <Badge 
          label={c.active ? 'Đang hoạt động' : 'Chờ duyệt'} 
          type={c.active ? 'success' : 'warning'} 
          icon={c.active ? 'CheckCircle' : 'Clock'}
        />
      )
    },
    { 
      header: 'Đại lý quản lý', 
      key: 'agencyNames',
      render: (c) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {c.agencyNames && c.agencyNames.length > 0 ? (
            c.agencyNames.map((name, i) => (
              <Badge key={i} label={name} type="primary" />
            ))
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa gán</span>
          )}
        </div>
      )
    },
    { 
      header: 'Thao tác', 
      key: 'actions', 
      align: 'right',
      render: (c) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {!c.active && (
            <button 
              onClick={() => handleActivate(c.id)}
              className="btn-primary" 
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              <CheckCircle size={14} style={{ marginRight: 4 }} /> Duyệt
            </button>
          )}
          <Link href={`/customers/${c.id}`} className="btn-outline" style={{ padding: '8px', borderRadius: 8 }}>
            <Eye size={16} />
          </Link>
          <Link href={`/customers/${c.id}/edit`} className="btn-outline" style={{ padding: '8px', borderRadius: 8 }}>
            <Edit size={16} />
          </Link>
        </div>
      )
    }
  ];

  return (
    <>
      <Navbar />
      <main style={{ padding: '20px 0' }}>
        <PageHeader 
          title="Quản lý Khách hàng" 
          subtitle="Danh sách khách lẻ đăng ký trên hệ thống"
          icon="Users"
        />

        <SearchActionHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm khách hàng theo tên hoặc email..."
          actions={
            <Link href="/customers/create" className="btn-primary" style={{ textDecoration: 'none' }}>
              <UserPlus size={18} />
              Thêm khách hàng
            </Link>
          }
        />

        <DataTable 
          data={filteredCustomers}
          columns={columns}
          loading={isLoading}
          emptyMessage={searchQuery ? 'Không tìm thấy khách hàng nào phù hợp' : 'Chưa có khách hàng nào'}
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
