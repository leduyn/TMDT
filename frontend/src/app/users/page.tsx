'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userApi, UserDTO, agencyApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import NotificationModal from '@/components/NotificationModal';
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Users, Trash2, Shield, Search, Eye, X } from 'lucide-react';

export default function UserManagementPage() {
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserDTO | null>(null);
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false, title: '', message: '', type: 'info'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (e: any) {
      setModal({ isOpen: true, title: 'Lỗi', message: e.message || 'Không thể tải danh sách người dùng', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user || !user.roles.includes('ROLE_COMPANY')) {
        router.push('/login');
        return;
      }
      fetchUsers();
    }
  }, [user, isLoading, router]);

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await userApi.delete(id);
      setModal({ isOpen: true, title: 'Thành công', message: 'Đã xóa người dùng', type: 'success' });
      fetchUsers();
    } catch (e: any) {
      setModal({ isOpen: true, title: 'Lỗi', message: e.message || 'Không thể xóa người dùng', type: 'error' });
    }
  };

  const handleGoToAgencyDetails = async (userId: number) => {
    setIsNavigating(true);
    try {
      const agency = await agencyApi.getMe(userId);
      if (agency && agency.id) {
        router.push(`/agencies/${agency.id}`);
      } else {
        setModal({ isOpen: true, title: 'Lỗi', message: 'Không tìm thấy hồ sơ Khách hàng của người dùng này.', type: 'error' });
      }
    } catch (error) {
      setModal({ isOpen: true, title: 'Lỗi', message: 'Lỗi khi lấy thông tin Khách hàng.', type: 'error' });
    } finally {
      setIsNavigating(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.phone?.includes(searchQuery);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'COMPANY': return <Badge label="Công ty" type="warning" icon="Shield" />;
      case 'AGENCY': return <Badge label="Khách hàng" type="primary" icon="Users" />;
      case 'CUSTOMER': return <Badge label="Người mua" type="success" icon="Users" />;
      default: return <Badge label={role} type="info" />;
    }
  };

  const columns: Column<UserDTO>[] = [
    {
      header: 'Tài khoản',
      key: 'username',
      render: (u) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.username}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>ID: {u.id}</div>
        </div>
      )
    },
    {
      header: 'Liên hệ',
      key: 'email',
      render: (u) => (
        <div>
          <div>{u.email}</div>
          {u.phone && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{u.phone}</div>}
        </div>
      )
    },
    {
      header: 'Vai trò',
      key: 'role',
      render: (u) => getRoleBadge(u.role)
    },
    {
      header: 'Trạng thái',
      key: 'active',
      render: (u) => (
        <Badge 
          label={u.active ? 'Đang hoạt động' : 'Đã khóa / Chờ duyệt'} 
          type={u.active ? 'success' : 'error'} 
        />
      )
    },
    {
      header: 'Thao tác',
      key: 'actions',
      align: 'right',
      render: (u) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={() => setSelectedUserForDetails(u)}
            className="btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--primary)', borderColor: 'var(--border)' }}
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDeleteUser(u.id)}
            className="btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
            title="Xóa người dùng"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <Navbar />
      <main style={{ padding: '20px 0' }}>
        <PageHeader 
          title="Quản lý Người dùng" 
          subtitle="Danh sách toàn bộ người dùng trên hệ thống"
          icon="Users"
        />

        <SearchActionHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm người dùng theo tên đăng nhập, email hoặc số điện thoại..."
          actions={
            <select
              className="input-field"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{ width: 180, margin: 0, padding: '10px 16px' }}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="COMPANY">Công ty</option>
              <option value="AGENCY">Khách hàng (Đại lý)</option>
              <option value="CUSTOMER">Người mua</option>
            </select>
          }
        />

        <DataTable 
          data={filteredUsers}
          columns={columns}
          loading={loading}
          emptyMessage={searchQuery ? 'Không tìm thấy người dùng nào phù hợp' : 'Chưa có người dùng nào trên hệ thống'}
        />
      </main>

      <NotificationModal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {selectedUserForDetails && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)'
        }} className="fade-in">
          <div className="glass-card" style={{ width: 650, maxWidth: '95vw', padding: 32, position: 'relative' }}>
            <button 
              onClick={() => setSelectedUserForDetails(null)}
              style={{ position: 'absolute', right: 20, top: 20, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            >
              <X size={18} />
            </button>
            
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700, boxShadow: '0 8px 16px var(--accent-glow)' }}>
                {selectedUserForDetails.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>{selectedUserForDetails.username}</h3>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {getRoleBadge(selectedUserForDetails.role)}
                  <Badge 
                    label={selectedUserForDetails.active ? 'Đang hoạt động' : 'Đã khóa / Chờ duyệt'} 
                    type={selectedUserForDetails.active ? 'success' : 'error'} 
                  />
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 20px' }}>
              {/* Cột 1: Thông tin chung */}
              <div>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={16} /> Thông tin liên hệ
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID Hệ thống</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{selectedUserForDetails.id}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedUserForDetails.email}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Số điện thoại</div>
                    <div style={{ fontWeight: 500, color: selectedUserForDetails.phone ? 'var(--text-primary)' : 'var(--text-muted)' }}>{selectedUserForDetails.phone || 'Chưa cập nhật'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mã số thuế</div>
                    <div style={{ fontWeight: 500, color: selectedUserForDetails.taxCode ? 'var(--text-primary)' : 'var(--text-muted)' }}>{selectedUserForDetails.taxCode || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>

              {/* Cột 2: Thông tin theo vai trò */}
              <div>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={16} /> Chi tiết vai trò
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {selectedUserForDetails.role === 'CUSTOMER' && (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nhóm Người mua</div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedUserForDetails.customerGroupName || 'Không thuộc nhóm nào'}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Khách hàng (Đại lý) quản lý</div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {selectedUserForDetails.agencyNames && selectedUserForDetails.agencyNames.length > 0 
                            ? selectedUserForDetails.agencyNames.join(', ') 
                            : 'Chưa được gán'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dư nợ hiện tại</div>
                        <div style={{ fontWeight: 700, color: (selectedUserForDetails.totalDebt || 0) > 0 ? 'var(--danger)' : 'var(--success)' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedUserForDetails.totalDebt || 0)}
                        </div>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Link href={`/customers/${selectedUserForDetails.id}`} style={{ textDecoration: 'none' }}>
                          <button className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, borderRadius: 10 }}>
                            <Users size={16} /> Đi tới Quản lý Người mua
                          </button>
                        </Link>
                      </div>
                    </>
                  )}

                  {selectedUserForDetails.role === 'AGENCY' && (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tên tổ chức / Đại lý</div>
                        <div style={{ fontWeight: 500, color: selectedUserForDetails.organizationName ? 'var(--text-primary)' : 'var(--text-muted)' }}>{selectedUserForDetails.organizationName || 'Chưa cập nhật'}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Địa chỉ xuất hóa đơn</div>
                        <div style={{ fontWeight: 500, color: selectedUserForDetails.billingAddress ? 'var(--text-primary)' : 'var(--text-muted)' }}>{selectedUserForDetails.billingAddress || 'Chưa cập nhật'}</div>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <button 
                          className="btn-outline" 
                          onClick={() => handleGoToAgencyDetails(selectedUserForDetails.id)}
                          disabled={isNavigating}
                          style={{ padding: '8px 16px', fontSize: '0.85rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, borderRadius: 10, cursor: isNavigating ? 'wait' : 'pointer', opacity: isNavigating ? 0.7 : 1 }}
                        >
                          <Shield size={16} /> {isNavigating ? 'Đang chuyển hướng...' : 'Đi tới Quản lý Khách hàng'}
                        </button>
                      </div>
                    </>
                  )}

                  {selectedUserForDetails.role === 'COMPANY' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phân quyền</div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Toàn quyền quản trị hệ thống</div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setSelectedUserForDetails(null)} className="btn-primary">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
