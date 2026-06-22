'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { agencyApi } from '@/lib/api';

import { useRouter } from 'next/navigation';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import SearchableSelect from '@/components/ui/SearchableSelect';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import { UserPlus, Eye, Phone, MapPin, User as UserIcon, CheckCircle, XCircle, ShieldCheck, Mail, Lock, Edit } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

interface Agency {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  username?: string;
  userId?: number;
  active: boolean;
  status?: string;
  latitude?: number;
  longitude?: number;
  defaultCommissionRate?: number;
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function AgenciesPage() {
  const router = useRouter();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  
  // Form for creation
  const [creationMode, setCreationMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [newAgency, setNewAgency] = useState({ 
    name: '', phone: '', address: '', userId: 0,
    username: '', email: '', password: '', defaultCommissionRate: 10,
    organizationName: '', taxCode: '', billingAddress: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    id: 0, name: '', phone: '', address: '', latitude: 0, longitude: 0, defaultCommissionRate: 10, active: true
  });
  
  // Form for approval
  const [approvalData, setApprovalData] = useState({
    name: '', phone: '', address: '', defaultCommissionRate: 10, latitude: 0, longitude: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const agenciesData = await agencyApi.getAll();
      setAgencies(Array.isArray(agenciesData) ? agenciesData : []);
      
      // Fetch unassigned users (optional, if still want that flow)
      const usersRes = await fetch('http://localhost:8080/api/users/agencies-unassigned', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const usersData = await usersRes.json();
      setUnassignedUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (creationMode === 'EXISTING') {
        const res = await fetch('http://localhost:8080/api/agencies', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newAgency.name,
            phone: newAgency.phone,
            address: newAgency.address,
            userId: newAgency.userId,
            defaultCommissionRate: newAgency.defaultCommissionRate
          })
        });
        if (res.ok) {
          setShowCreateModal(false);
          resetForm();
          fetchData();
        }
      } else {
        await agencyApi.createWithAccount({
          username: newAgency.username,
          email: newAgency.email,
          password: newAgency.password,
          name: newAgency.name,
          phone: newAgency.phone,
          address: newAgency.address,
          defaultCommissionRate: newAgency.defaultCommissionRate,
          organizationName: newAgency.organizationName,
          taxCode: newAgency.taxCode,
          billingAddress: newAgency.billingAddress
        });
        setShowCreateModal(false);
        resetForm();
        fetchData();
      }
    } catch (err) {
      alert('Lỗi khi tạo Khách hàng');
    }
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgency) return;
    try {
      await agencyApi.approve(selectedAgency.id, approvalData);
      setShowApproveModal(false);
      setSelectedAgency(null);
      fetchData();
    } catch (err) {
      alert('Lỗi khi duyệt Khách hàng');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await agencyApi.update(editData.id, {
        name: editData.name,
        phone: editData.phone,
        address: editData.address,
        latitude: editData.latitude,
        longitude: editData.longitude,
        defaultCommissionRate: editData.defaultCommissionRate,
        active: editData.active
      });
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      alert('Lỗi khi cập nhật Khách hàng');
    }
  };

  const resetForm = () => {
    setNewAgency({ 
      name: '', phone: '', address: '', userId: 0,
      username: '', email: '', password: '', defaultCommissionRate: 10,
      organizationName: '', taxCode: '', billingAddress: ''
    });
  };

  const openApproveModal = (agency: Agency) => {
    setSelectedAgency(agency);
    setApprovalData({
      name: agency.name || '',
      phone: agency.phone || '',
      address: agency.address || '',
      defaultCommissionRate: 10,
      latitude: 0,
      longitude: 0
    });
    setShowApproveModal(true);
  };

  const openEditModal = (agency: any) => {
    setEditData({
      id: agency.id,
      name: agency.name || '',
      phone: agency.phone || '',
      address: agency.address || '',
      latitude: agency.latitude || 0,
      longitude: agency.longitude || 0,
      defaultCommissionRate: agency.defaultCommissionRate || 10,
      active: agency.active
    });
    setShowEditModal(true);
  };

  const filteredAgencies = agencies.filter(a => {
    const matchesSearch = (a.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (a.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (a.username?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    if (activeTab === 'ALL') return matchesSearch;
    if (activeTab === 'PENDING') return matchesSearch && a.status === 'PENDING';
    if (activeTab === 'APPROVED') return matchesSearch && a.status === 'APPROVED';
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredAgencies.length / pageSize) || 1;
  const paginatedAgencies = filteredAgencies.slice(page * pageSize, (page + 1) * pageSize);

  const columns: Column<Agency>[] = [
    { 
      header: 'Khách hàng', 
      key: 'name',
      width: '25%',
      render: (a) => (
        <div>
          <div style={{ fontWeight: 600 }}>{a.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {a.id}</div>
        </div>
      )
    },
    { 
      header: 'Liên hệ', 
      key: 'phone',
      width: '25%',
      render: (a) => (
        <div style={{ fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Phone size={14} style={{ color: 'var(--accent)' }} /> {a.phone || 'N/A'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
            <MapPin size={14} /> {a.address || 'Chưa cập nhật'}
          </div>
        </div>
      )
    },
    { 
      header: 'Tài khoản', 
      key: 'username',
      width: '15%',
      render: (a) => (
        <Badge label={a.username || 'N/A'} type="primary" icon="User" />
      )
    },
    { 
      header: 'Trạng thái', 
      key: 'status',
      align: 'center',
      width: '15%',
      render: (a) => (
        <Badge 
          label={a.status === 'PENDING' ? 'Chờ duyệt' : (a.active ? 'Đang hoạt động' : 'Tạm ngưng')} 
          type={a.status === 'PENDING' ? 'warning' : (a.active ? 'success' : 'error')} 
          icon={a.status === 'PENDING' ? 'Clock' : (a.active ? 'CheckCircle' : 'PauseCircle')}
        />
      )
    },
    { 
      header: 'Thao tác', 
      key: 'actions', 
      align: 'right',
      width: '20%',
      render: (a) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {a.status === 'PENDING' && (
            <button 
              className="btn-primary" 
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={() => openApproveModal(a)}
            >
              <ShieldCheck size={14} style={{ marginRight: 4 }} />
              Duyệt
            </button>
          )}
          <button 
            className="btn-outline" 
            style={{ padding: '8px', borderRadius: 8 }}
            onClick={() => openEditModal(a)}
          >
            <Edit size={16} />
          </button>
          <button 
            className="btn-outline" 
            style={{ padding: '8px', borderRadius: 8 }}
            onClick={() => router.push(`/agencies/${a.id}`)}
          >
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <Navbar />
      <Main>
        <PageHeader 
          title="Quản lý Khách hàng" 
          subtitle="Danh sách và thiết lập các Khách hàng ủy quyền trong hệ thống"
          icon="Building2"
        />

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, padding: '0 24px' }}>
          <button 
            className={activeTab === 'ALL' ? 'tab-active' : 'tab-inactive'} 
            onClick={() => setActiveTab('ALL')}
            style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
          >
            Tất cả ({agencies.length})
          </button>
          <button 
            className={activeTab === 'PENDING' ? 'tab-active' : 'tab-inactive'} 
            onClick={() => setActiveTab('PENDING')}
            style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
          >
            Chờ duyệt ({agencies.filter(a => a.status === 'PENDING').length})
          </button>
          <button 
            className={activeTab === 'APPROVED' ? 'tab-active' : 'tab-inactive'} 
            onClick={() => setActiveTab('APPROVED')}
            style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
          >
            Đã duyệt ({agencies.filter(a => a.status === 'APPROVED').length})
          </button>
        </div>

        <SearchActionHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm Khách hàng theo tên, SĐT hoặc tài khoản..."
          actions={
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <UserPlus size={18} />
              Thêm Khách hàng mới
            </button>
          }
        />

        <DataTable 
          data={paginatedAgencies}
          columns={columns}
          loading={isLoading}
          emptyMessage={searchQuery ? 'Không tìm thấy Khách hàng nào phù hợp' : 'Chưa có Khách hàng nào'}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        {/* Modal Thêm Khách hàng Mới */}
        {showCreateModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <GlassCard className="fade-in" style={{ width: '100%', maxWidth: 600, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ marginBottom: 24, marginTop: 0 }}>Thêm Khách hàng mới</h2>
              
              <div style={{ display: 'flex', gap: 12, marginBottom: 24, background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 12 }}>
                <button 
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: creationMode === 'NEW' ? 'var(--accent)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setCreationMode('NEW')}
                >
                  Tạo tài khoản mới
                </button>
                <button 
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: creationMode === 'EXISTING' ? 'var(--accent)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setCreationMode('EXISTING')}
                >
                  Dùng tài khoản sẵn có
                </button>
              </div>

              <form onSubmit={handleCreate}>
                {creationMode === 'NEW' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <h3 style={{ fontSize: '1rem', margin: '0 0 12px 0', color: 'var(--accent)' }}>Thông tin tài khoản</h3>
                    </div>
                    <div>
                      <label className="form-label">Tên đăng nhập</label>
                      <div style={{ position: 'relative' }}>
                        <UserIcon size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                        <input type="text" className="input-field" style={{ paddingLeft: 36 }} required value={newAgency.username} onChange={e => setNewAgency({...newAgency, username: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Email</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                        <input type="email" className="input-field" style={{ paddingLeft: 36 }} required value={newAgency.email} onChange={e => setNewAgency({...newAgency, email: e.target.value})} />
                      </div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Mật khẩu</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                        <input type="password" className="input-field" style={{ paddingLeft: 36 }} required value={newAgency.password} onChange={e => setNewAgency({...newAgency, password: e.target.value})} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 24 }}>
                    <label className="form-label">Chọn Tài khoản</label>
                    <SearchableSelect
                      options={unassignedUsers.map(user => ({ value: user.id, label: `${user.username} (${user.email})` }))}
                      value={newAgency.userId || undefined}
                      onChange={(val) => setNewAgency(prev => ({ ...prev, userId: val ? Number(val) : 0 }))}
                      placeholder="-- Chọn tài khoản --"
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: '1rem', margin: '0 0 12px 0', color: 'var(--accent)' }}>Thông tin Khách hàng</h3>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Tên Khách hàng</label>
                    <input type="text" className="input-field" required value={newAgency.name} onChange={e => setNewAgency({...newAgency, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Số điện thoại</label>
                    <input type="text" className="input-field" required value={newAgency.phone} onChange={e => setNewAgency({...newAgency, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">% Chiết khấu mặc định</label>
                    <input type="number" className="input-field" required value={newAgency.defaultCommissionRate} onChange={e => setNewAgency({...newAgency, defaultCommissionRate: parseFloat(e.target.value)})} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Địa chỉ</label>
                    <input type="text" className="input-field" required value={newAgency.address} onChange={e => setNewAgency({...newAgency, address: e.target.value})} />
                  </div>

                  {creationMode === 'NEW' && (
                    <>
                      <div style={{ gridColumn: 'span 2' }}>
                        <h3 style={{ fontSize: '1rem', margin: '12px 0 12px 0', color: 'var(--accent)' }}>Thông tin xuất hóa đơn</h3>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Tên tổ chức (Công ty)</label>
                        <input type="text" className="input-field" value={newAgency.organizationName} onChange={e => setNewAgency({...newAgency, organizationName: e.target.value})} placeholder="Nhập tên công ty xuất hóa đơn..." />
                      </div>
                      <div>
                        <label className="form-label">Mã số thuế</label>
                        <input type="text" className="input-field" value={newAgency.taxCode} onChange={e => setNewAgency({...newAgency, taxCode: e.target.value})} placeholder="Nhập MST..." />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Địa chỉ xuất hóa đơn</label>
                        <input type="text" className="input-field" value={newAgency.billingAddress} onChange={e => setNewAgency({...newAgency, billingAddress: e.target.value})} placeholder="Nhập địa chỉ ghi trên hóa đơn..." />
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32 }}>
                  <button type="button" className="btn-outline" onClick={() => setShowCreateModal(false)}>Hủy</button>
                  <button type="submit" className="btn-primary">Tạo Khách hàng</button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}

        {/* Modal Duyệt Khách hàng */}
        {showApproveModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <GlassCard className="fade-in" style={{ width: '100%', maxWidth: 500, padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <ShieldCheck size={32} style={{ color: '#10b981' }} />
                </div>
                <h2 style={{ margin: 0 }}>Duyệt Khách hàng</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Vui lòng kiểm tra và hoàn thiện thông tin Khách hàng</p>
              </div>

              <form onSubmit={handleApprove}>
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Tên Khách hàng</label>
                  <input type="text" className="input-field" required value={approvalData.name} onChange={e => setApprovalData({...approvalData, name: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label">Số điện thoại</label>
                    <input type="text" className="input-field" required value={approvalData.phone} onChange={e => setApprovalData({...approvalData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">% Chiết khấu</label>
                    <input type="number" className="input-field" required value={approvalData.defaultCommissionRate} onChange={e => setApprovalData({...approvalData, defaultCommissionRate: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label className="form-label">Địa chỉ</label>
                  <input type="text" className="input-field" required value={approvalData.address} onChange={e => setApprovalData({...approvalData, address: e.target.value})} />
                </div>
                
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-outline" onClick={() => setShowApproveModal(false)}>Hủy</button>
                  <button type="submit" className="btn-primary" style={{ background: '#10b981' }}>Duyệt ngay</button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}

        {/* Modal Điều chỉnh Khách hàng */}
        {showEditModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <GlassCard className="fade-in" style={{ width: '100%', maxWidth: 550, padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Edit size={32} style={{ color: 'var(--accent)' }} />
                </div>
                <h2 style={{ margin: 0 }}>Điều chỉnh Khách hàng</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Cập nhật thông tin và tọa độ định vị Khách hàng</p>
              </div>

              <form onSubmit={handleUpdate}>
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Tên Khách hàng</label>
                  <input type="text" className="input-field" required value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label">Số điện thoại</label>
                    <input type="text" className="input-field" required value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">% Chiết khấu</label>
                    <input type="number" className="input-field" required value={editData.defaultCommissionRate} onChange={e => setEditData({...editData, defaultCommissionRate: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Địa chỉ</label>
                  <input type="text" className="input-field" required value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label className="form-label">Vĩ độ (Latitude)</label>
                    <input type="number" step="any" className="input-field" required value={editData.latitude} onChange={e => setEditData({...editData, latitude: parseFloat(e.target.value)})} placeholder="VD: 10.762622" />
                  </div>
                  <div>
                    <label className="form-label">Kinh độ (Longitude)</label>
                    <input type="number" step="any" className="input-field" required value={editData.longitude} onChange={e => setEditData({...editData, longitude: parseFloat(e.target.value)})} placeholder="VD: 106.660172" />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <input type="checkbox" checked={editData.active} onChange={e => setEditData({...editData, active: e.target.checked})} id="edit-active" style={{ width: 18, height: 18 }} />
                  <label htmlFor="edit-active" style={{ color: 'white', fontWeight: 500, cursor: 'pointer' }}>Kích hoạt tài khoản</label>
                </div>
                
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)}>Hủy</button>
                  <button type="submit" className="btn-primary">Lưu thay đổi</button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}

        <style jsx>{`
          .tab-active {
            background: var(--accent);
            color: white;
            box-shadow: 0 4px 12px rgba(99,102,241,0.3);
          }
          .tab-inactive {
            background: rgba(255,255,255,0.05);
            color: var(--text-muted);
          }
          .tab-inactive:hover {
            background: rgba(255,255,255,0.1);
            color: var(--text-primary);
          }
          .form-label {
            display: block;
            margin-bottom: 8px;
            font-size: 0.85rem;
            color: var(--text-muted);
            font-weight: 500;
          }
        `}</style>
      </Main>
    </>
  );
}
