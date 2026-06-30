'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { customerApi, CustomerDTO } from '@/lib/api';
import Link from 'next/link';

import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { UserPlus, Eye, Edit, Building, Phone, MapPin } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

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

  const filteredCustomers = customers.filter(c =>
    (c.organizationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.taxCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.receiverName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.receiverPhone || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = filteredCustomers.slice(page * pageSize, (page + 1) * pageSize);

  const columns: Column<CustomerDTO>[] = [
    {
      header: 'Khách hàng',
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
        <div style={{ fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Building size={14} style={{ color: 'var(--accent)' }} /> {c.receiverName || '---'}
          </div>
          {c.receiverPhone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
              <Phone size={14} /> {c.receiverPhone}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Địa chỉ',
      key: 'shippingAddress',
      width: '30%',
      render: (c) => (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <MapPin size={14} style={{ marginTop: 2, flexShrink: 0, color: 'var(--accent)' }} />
            <span>{c.shippingAddress || c.billingAddress || '---'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Thao tác',
      key: 'actions',
      align: 'right',
      width: '25%',
      render: (c) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
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
      <Main>
        <PageHeader
          title="Quản lý Người mua"
          subtitle="Danh sách người mua (khách hàng của đại lý) trên hệ thống"
          icon="Users"
        />

        <SearchActionHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm Người mua theo tên, MST, SĐT..."
          actions={
            <Link href="/customers/create" className="btn-primary" style={{ textDecoration: 'none' }}>
              <UserPlus size={18} />
              Thêm Người mua
            </Link>
          }
        />

        <DataTable
          data={paginatedCustomers}
          columns={columns}
          loading={isLoading}
          emptyMessage={searchQuery ? 'Không tìm thấy Người mua nào phù hợp' : 'Chưa có Người mua nào'}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Main>
    </>
  );
}
