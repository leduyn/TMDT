'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { customerApi, agencyApi, CustomerDTO } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { UserPlus, Eye, Building, Phone } from 'lucide-react';

export default function MyCustomersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      if (!user.roles?.includes('ROLE_AGENCY')) {
        setError('Bạn không có quyền truy cập trang này.');
        setIsLoading(false);
        return;
      }
      fetchMyCustomers();
    }
  }, [user, authLoading]);

  const fetchMyCustomers = async () => {
    try {
      setError('');
      setIsLoading(true);
      const agencyId = user?.agencyId;
      if (agencyId) {
        const allCustomers = await customerApi.getAll();
        setCustomers(allCustomers.filter(c => c.agencyId === agencyId));
      } else {
        setError('Không tìm thấy thông tin Đại lý cho tài khoản này.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải danh sách Người mua.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    (c.organizationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.receiverName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.receiverPhone || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = filteredCustomers.slice(page * pageSize, (page + 1) * pageSize);

  const columns: Column<CustomerDTO>[] = [
    {
      header: 'Tên tổ chức',
      key: 'organizationName',
      width: '25%',
      render: (c) => (
        <div>
          <div style={{ fontWeight: 600 }}>{c.organizationName || `#${c.id}`}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {c.id}{c.taxCode ? ` • MST: ${c.taxCode}` : ''}</div>
        </div>
      )
    },
    {
      header: 'Người nhận',
      key: 'receiverName',
      width: '20%',
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
          <Building size={14} style={{ color: 'var(--accent)' }} /> {c.receiverName || '---'}
        </div>
      )
    },
    {
      header: 'Liên hệ',
      key: 'receiverPhone',
      width: '20%',
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
          <Phone size={14} style={{ color: 'var(--accent)' }} /> {c.receiverPhone || '---'}
        </div>
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
      <Main>
        <PageHeader
          title="Người mua của tôi"
          subtitle="Danh sách Người mua thuộc Đại lý của bạn"
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
          placeholder="Tìm kiếm Người mua..."
          actions={
            <Link href="/agency/customers/create" className="btn-primary" style={{ textDecoration: 'none' }}>
              <UserPlus size={18} />
              Tạo Người mua mới
            </Link>
          }
        />

        <DataTable
          data={paginatedCustomers}
          columns={columns}
          loading={isLoading}
          emptyMessage={searchQuery ? 'Không tìm thấy Người mua nào phù hợp' : 'Bạn chưa quản lý Người mua nào'}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Main>
    </>
  );
}
