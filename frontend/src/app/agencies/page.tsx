'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { agencyApi, AgencyApproveRequest } from '@/lib/api';

import { useRouter } from 'next/navigation';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import { UserPlus, Eye, Phone, MapPin, ShieldCheck, Edit, Tag } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

interface Agency {
  id: number;
  code: string;
  name: string;
  phone?: string;
  representativeName?: string;
  taxCode?: string;
  billingAddress?: string;
  shippingAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  nickname?: string;
  active: boolean;
  status?: string;
  type?: string;
}

export default function AgenciesPage() {
  const router = useRouter();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  
  const [newAgency, setNewAgency] = useState({ 
    code: '', name: '', phone: '', password: '',
    representativeName: '', taxCode: '', billingAddress: '', shippingAddress: '',
    receiverName: '', receiverPhone: '', nickname: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    id: 0, name: '', phone: '', representativeName: '', taxCode: '',
    billingAddress: '', shippingAddress: '', receiverName: '', receiverPhone: '', nickname: '', active: true
  });

  const [approveType, setApproveType] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');
  const [depositAmount, setDepositAmount] = useState(0);
  const [debtTermDays, setDebtTermDays] = useState(30);
  const [contractTerms, setContractTerms] = useState('');
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceData, setPriceData] = useState<{ id: number; name: string; agencyId: number } | null>(null);

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await agencyApi.register({
        code: newAgency.code,
        name: newAgency.name,
        phone: newAgency.phone,
        password: newAgency.password,
        representativeName: newAgency.representativeName,
        taxCode: newAgency.taxCode,
        billingAddress: newAgency.billingAddress,
        shippingAddress: newAgency.shippingAddress,
        receiverName: newAgency.receiverName,
        receiverPhone: newAgency.receiverPhone,
        nickname: newAgency.nickname,
      });
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert('Lỗi khi tạo Khách hàng');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await agencyApi.update(editData.id, {
        name: editData.name,
        phone: editData.phone,
        representativeName: editData.representativeName,
        taxCode: editData.taxCode,
        billingAddress: editData.billingAddress,
        shippingAddress: editData.shippingAddress,
        receiverName: editData.receiverName,
        receiverPhone: editData.receiverPhone,
        nickname: editData.nickname,
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
      code: '', name: '', phone: '', password: '',
      representativeName: '', taxCode: '', billingAddress: '', shippingAddress: '',
      receiverName: '', receiverPhone: '', nickname: ''
    });
  };

  const openApproveModal = (agency: Agency) => {
    setSelectedAgency(agency);
    setApproveType('RETAIL');
    setDepositAmount(0);
    setDebtTermDays(30);
    setContractTerms('');
    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    if (!selectedAgency) return;
    try {
      const data: AgencyApproveRequest = { type: approveType };
      if (approveType === 'WHOLESALE') {
        data.depositAmount = depositAmount;
        data.debtTermDays = debtTermDays;
        data.contractTerms = contractTerms;
      }
      const result = await agencyApi.approve(selectedAgency.id, data);
      setShowApproveModal(false);
      setSelectedAgency(null);
      fetchData();

      if (approveType === 'RETAIL') {
        try {
          const prices = await agencyApi.getPrices(result.id);
          setPriceData(prices);
          setShowPriceModal(true);
        } catch (e) {
          // ignore price fetch errors
        }
      }
    } catch (err) {
      alert('Lỗi khi duyệt Khách hàng');
    }
  };

  const openEditModal = (agency: any) => {
    setEditData({
      id: agency.id,
      name: agency.name || '',
      phone: agency.phone || '',
      representativeName: agency.representativeName || '',
      taxCode: agency.taxCode || '',
      billingAddress: agency.billingAddress || '',
      shippingAddress: agency.shippingAddress || '',
      receiverName: agency.receiverName || '',
      receiverPhone: agency.receiverPhone || '',
      nickname: agency.nickname || '',
      active: agency.active
    });
    setShowEditModal(true);
  };

  const filteredAgencies = agencies.filter(a => {
    const matchesSearch = (a.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (a.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (a.code?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
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
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {a.id} • Mã: {a.code}</div>
        </div>
      )
    },
    { 
      header: 'Liên hệ', 
      key: 'phone',
      width: '20%',
      render: (a) => (
        <div style={{ fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Phone size={14} style={{ color: 'var(--accent)' }} /> {a.phone || 'N/A'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
            <MapPin size={14} /> {a.shippingAddress || a.billingAddress || 'Chưa cập nhật'}
          </div>
        </div>
      )
    },
    {
      header: 'Phân loại',
      key: 'type',
      align: 'center' as const,
      width: '15%',
      render: (a) => (
        <Badge
          label={a.type === 'WHOLESALE' ? 'Bán sỉ' : a.type === 'RETAIL' ? 'Bán lẻ' : '---'}
          type={a.type === 'WHOLESALE' ? 'primary' : a.type === 'RETAIL' ? 'success' : 'info'}
        />
      )
    },
    { 
      header: 'Trạng thái', 
      key: 'status',
      align: 'center',
      width: '20%',
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

              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: '1rem', margin: '0 0 12px 0', color: 'var(--accent)' }}>Thông tin tài khoản</h3>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Tên Khách hàng</label>
                    <input type="text" className="input-field" required value={newAgency.name} onChange={e => setNewAgency({...newAgency, name: e.target.value})} placeholder="Tên cửa hàng hoặc cá nhân" />
                  </div>
                  <div>
                    <label className="form-label">Mã Khách hàng</label>
                    <input type="text" className="input-field" required value={newAgency.code} onChange={e => setNewAgency({...newAgency, code: e.target.value})} placeholder="Mã định danh" />
                  </div>
                  <div>
                    <label className="form-label">Số điện thoại</label>
                    <input type="text" className="input-field" required value={newAgency.phone} onChange={e => setNewAgency({...newAgency, phone: e.target.value})} placeholder="SĐT đăng nhập" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Mật khẩu</label>
                    <input type="password" className="input-field" required value={newAgency.password} onChange={e => setNewAgency({...newAgency, password: e.target.value})} placeholder="Mật khẩu đăng nhập" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: '1rem', margin: '12px 0 12px 0', color: 'var(--accent)' }}>Thông tin chi tiết</h3>
                  </div>
                  <div>
                    <label className="form-label">Người đại diện</label>
                    <input type="text" className="input-field" value={newAgency.representativeName} onChange={e => setNewAgency({...newAgency, representativeName: e.target.value})} placeholder="Tên người đại diện" />
                  </div>
                  <div>
                    <label className="form-label">Mã số thuế</label>
                    <input type="text" className="input-field" value={newAgency.taxCode} onChange={e => setNewAgency({...newAgency, taxCode: e.target.value})} placeholder="MST doanh nghiệp" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Địa chỉ nhận hàng</label>
                    <input type="text" className="input-field" value={newAgency.shippingAddress} onChange={e => setNewAgency({...newAgency, shippingAddress: e.target.value})} placeholder="Địa chỉ giao hàng" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Địa chỉ xuất hóa đơn</label>
                    <input type="text" className="input-field" value={newAgency.billingAddress} onChange={e => setNewAgency({...newAgency, billingAddress: e.target.value})} placeholder="Địa chỉ trên hóa đơn" />
                  </div>
                  <div>
                    <label className="form-label">Người nhận hàng</label>
                    <input type="text" className="input-field" value={newAgency.receiverName} onChange={e => setNewAgency({...newAgency, receiverName: e.target.value})} placeholder="Tên người nhận" />
                  </div>
                  <div>
                    <label className="form-label">SĐT người nhận</label>
                    <input type="text" className="input-field" value={newAgency.receiverPhone} onChange={e => setNewAgency({...newAgency, receiverPhone: e.target.value})} placeholder="SĐT người nhận" />
                  </div>
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
        {showApproveModal && selectedAgency && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <GlassCard className="fade-in" style={{ width: '100%', maxWidth: 520, padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <ShieldCheck size={32} style={{ color: '#10b981' }} />
                </div>
                <h2 style={{ margin: 0 }}>Duyệt Khách hàng</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Xác nhận duyệt Khách hàng <strong>{selectedAgency.name}</strong></p>
              </div>

              <div style={{ marginBottom: 20, padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><span style={{ color: 'var(--text-muted)', width: 120 }}>Mã:</span><strong>{selectedAgency.code}</strong></div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><span style={{ color: 'var(--text-muted)', width: 120 }}>SĐT:</span><strong>{selectedAgency.phone}</strong></div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><span style={{ color: 'var(--text-muted)', width: 120 }}>Địa chỉ:</span><strong>{selectedAgency.shippingAddress || selectedAgency.billingAddress || '---'}</strong></div>
                <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--text-muted)', width: 120 }}>MST:</span><strong>{selectedAgency.taxCode || '---'}</strong></div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ marginBottom: 10 }}>Phân loại Khách hàng</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setApproveType('RETAIL')}
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: 12, border: approveType === 'RETAIL' ? '2px solid #10b981' : '1px solid var(--border)',
                      background: approveType === 'RETAIL' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                      color: approveType === 'RETAIL' ? '#10b981' : 'var(--text-secondary)', cursor: 'pointer',
                      fontWeight: 600, transition: 'all 0.2s', textAlign: 'center' as const
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>🛍️</div>
                    <div>Khách Lẻ (Bán lẻ)</div>
                    <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4, opacity: 0.7 }}>HMKD=0, KHN=0</div>
                  </button>
                  <button
                    onClick={() => setApproveType('WHOLESALE')}
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: 12, border: approveType === 'WHOLESALE' ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: approveType === 'WHOLESALE' ? 'var(--accent-glow)' : 'rgba(255,255,255,0.03)',
                      color: approveType === 'WHOLESALE' ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer',
                      fontWeight: 600, transition: 'all 0.2s', textAlign: 'center' as const
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>🏢</div>
                    <div>Nhà phân phối (Bán sỉ)</div>
                    <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4, opacity: 0.7 }}>Cọc & Công nợ</div>
                  </button>
                </div>
              </div>

              {approveType === 'WHOLESALE' && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label">Giá trị đặt cọc (VNĐ)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={depositAmount || ''}
                      onChange={e => setDepositAmount(Number(e.target.value))}
                      placeholder="Nhập số tiền đặt cọc thỏa thuận"
                      min={0}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label">Kỳ hạn nợ - KHN (số ngày)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={debtTermDays}
                      onChange={e => setDebtTermDays(Number(e.target.value))}
                      placeholder="Ví dụ: 30"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="form-label">Điều khoản hợp đồng</label>
                    <textarea
                      className="input-field"
                      value={contractTerms}
                      onChange={e => setContractTerms(e.target.value)}
                      placeholder="Nhập điều khoản thỏa thuận (nếu có)"
                      rows={3}
                      style={{ width: '100%', resize: 'vertical' as const }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" onClick={() => setShowApproveModal(false)}>Hủy</button>
                <button
                  className="btn-primary"
                  style={{ background: approveType === 'RETAIL' ? '#10b981' : 'var(--accent)' }}
                  onClick={handleApprove}
                  disabled={approveType === 'WHOLESALE' && (!depositAmount || depositAmount <= 0)}
                >
                  Duyệt & Kích hoạt
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Modal Mở giá (sau khi duyệt Retail) */}
        {showPriceModal && priceData && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
            <GlassCard className="fade-in" style={{ width: '100%', maxWidth: 480, padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Tag size={32} style={{ color: 'var(--accent)' }} />
                </div>
                <h2 style={{ margin: 0 }}>Mở giá</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                  Bảng giá áp dụng: <strong>{priceData.name}</strong>
                </p>
              </div>

              <div style={{ marginBottom: 24, padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)', width: 120 }}>Bảng giá ID:</span>
                  <strong>{priceData.id}</strong>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--text-muted)', width: 120 }}>Trạng thái:</span>
                  <strong style={{ color: '#10b981' }}>Đã kích hoạt</strong>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  Khách hàng có thể xem giá sản phẩm khi đặt hàng. 
                  HMKD=0, KHN=0 — khách chỉ thanh toán ngay khi nhận hàng.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-primary" onClick={() => setShowPriceModal(false)}>Đóng</button>
              </div>
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
                <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Cập nhật thông tin Khách hàng</p>
              </div>

              <form onSubmit={handleUpdate}>
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Tên Khách hàng</label>
                  <input type="text" className="input-field" required value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Số điện thoại</label>
                  <input type="text" className="input-field" required value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Người đại diện</label>
                  <input type="text" className="input-field" value={editData.representativeName} onChange={e => setEditData({...editData, representativeName: e.target.value})} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Địa chỉ nhận hàng</label>
                  <input type="text" className="input-field" value={editData.shippingAddress} onChange={e => setEditData({...editData, shippingAddress: e.target.value})} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Địa chỉ xuất hóa đơn</label>
                  <input type="text" className="input-field" value={editData.billingAddress} onChange={e => setEditData({...editData, billingAddress: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label">Người nhận</label>
                    <input type="text" className="input-field" value={editData.receiverName} onChange={e => setEditData({...editData, receiverName: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">SĐT người nhận</label>
                    <input type="text" className="input-field" value={editData.receiverPhone} onChange={e => setEditData({...editData, receiverPhone: e.target.value})} />
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
