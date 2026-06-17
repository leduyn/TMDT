'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { customerApi, UserDTO } from '@/lib/api';
import Link from 'next/link';
import NotificationModal from '@/components/NotificationModal';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { UserPlus, CheckCircle, Eye, Edit, ShieldCheck } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { agencyApi } from '@/lib/api';
import Pagination from '@/components/ui/Pagination';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'info' as any
  });
  const [page, setPage] = useState(0);
  const pageSize = 20;
  
  // Conversion state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [convertData, setConvertData] = useState({
    name: '', phone: '', address: '', defaultCommissionRate: 10
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
      setModal({ isOpen: true, title: 'Thành công', message: 'Đã kích hoạt Người mua thành công!', type: 'success' });
      fetchCustomers();
    } catch (err: any) {
      setModal({ isOpen: true, title: 'Lỗi kích hoạt', message: err.message || 'Lỗi khi duyệt Người mua', type: 'error' });
    }
  };

  const openConvertModal = (user: UserDTO) => {
    setSelectedUser(user);
    setConvertData({
      name: user.displayName || user.username,
      phone: user.phone || '',
      address: '',
      defaultCommissionRate: 10
    });
    setShowConvertModal(true);
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await agencyApi.convertFromUser(selectedUser.id, convertData);
      setShowConvertModal(false);
      setModal({ isOpen: true, title: 'Thành công', message: 'Đã chuyển Người mua thành Khách hàng thành công!', type: 'success' });
      fetchCustomers();
    } catch (err: any) {
      setModal({ isOpen: true, title: 'Lỗi chuyển đổi', message: err.message || 'Lỗi khi chuyển đổi Người mua', type: 'error' });
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = filteredCustomers.slice(page * pageSize, (page + 1) * pageSize);

  const columns: Column<UserDTO>[] = [
    { 
      header: 'Người mua', 
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
      header: 'Khách hàng quản lý', 
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
          <button 
            onClick={() => openConvertModal(c)}
            className="btn-primary" 
            style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <ShieldCheck size={14} style={{ marginRight: 4 }} /> Khách hàng
          </button>
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
          subtitle="Danh sách khách lẻ đăng ký trên hệ thống"
          icon="Users"
        />

        <SearchActionHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm Người mua theo tên hoặc email..."
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

        {/* Modal Chuyển đổi thành Người mua */}
        {showConvertModal && selectedUser && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <GlassCard className="fade-in" style={{ width: '100%', maxWidth: 500, padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <ShieldCheck size={32} style={{ color: '#10b981' }} />
                </div>
                <h2 style={{ margin: 0 }}>Chuyển thành Khách hàng</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                  Tài khoản <strong>{selectedUser.username}</strong> sẽ được nâng cấp thành Khách hàng
                </p>
              </div>

              <form onSubmit={handleConvert}>
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Tên Khách hàng</label>
                  <input type="text" className="input-field" required value={convertData.name} onChange={e => setConvertData({...convertData, name: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label">Số điện thoại</label>
                    <input type="text" className="input-field" required value={convertData.phone} onChange={e => setConvertData({...convertData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">% Chiết khấu</label>
                    <input type="number" className="input-field" required value={convertData.defaultCommissionRate} onChange={e => setConvertData({...convertData, defaultCommissionRate: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label className="form-label">Địa chỉ</label>
                  <input type="text" className="input-field" required value={convertData.address} onChange={e => setConvertData({...convertData, address: e.target.value})} />
                </div>
                
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-outline" onClick={() => setShowConvertModal(false)}>Hủy</button>
                  <button type="submit" className="btn-primary" style={{ background: '#10b981' }}>Xác nhận chuyển</button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
      </Main>

      <NotificationModal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      <style jsx>{`
        .form-label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
      `}</style>
    </>
  );
}

