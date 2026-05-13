'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { priceAssignmentVoucherApi, PriceAssignmentVoucher, priceListApi, PriceListDTO, agencyApi, AgencyDTO, customerApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import { Plus } from 'lucide-react';

export default function PriceVouchersPage() {
  const [vouchers, setVouchers] = useState<PriceAssignmentVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [priceLists, setPriceLists] = useState<PriceListDTO[]>([]);
  const [agencies, setAgencies] = useState<AgencyDTO[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();
  const isAdmin = user?.roles.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  // Form state
  const [name, setName] = useState('');
  const [priceListId, setPriceListId] = useState<number>(0);
  const [type, setType] = useState('ALL_AGENCY');
  const [rank, setRank] = useState('BRONZE');
  const [selectedAgencyId, setSelectedAgencyId] = useState<number>(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [scheduledAt, setScheduledAt] = useState('');

  // Reactivation state
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [reactivatingVoucherId, setReactivatingVoucherId] = useState<number | null>(null);
  const [reactivationType, setReactivationType] = useState<'IMMEDIATE' | 'SCHEDULED'>('IMMEDIATE');
  const [reactivationScheduledAt, setReactivationScheduledAt] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, plData, aData, cData] = await Promise.all([
        priceAssignmentVoucherApi.getAll(),
        priceListApi.getAll(),
        agencyApi.getAll(),
        customerApi.getAll()
      ]);
      setVouchers(vData);
      setPriceLists(plData);
      setAgencies(aData);
      setCustomers(cData);
      if (plData.length > 0) setPriceListId(plData[0].id);
      if (aData.length > 0) setSelectedAgencyId(aData[0].id);
      if (cData.length > 0) setSelectedCustomerId(cData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (priceListId === 0) return;

      const newVoucher: PriceAssignmentVoucher = {
        name,
        priceListId: priceListId,
        assignmentType: type,
        rankLevel: type === 'AGENCY_RANK' ? rank : undefined,
        agencyId: type === 'DIRECT_AGENCY' ? selectedAgencyId : undefined,
        customerId: type === 'DIRECT_CUSTOMER' ? selectedCustomerId : undefined,
        scheduledAt: scheduledAt.length === 16 ? scheduledAt + ':00' : scheduledAt,
      };

      await priceAssignmentVoucherApi.create(newVoucher);
      setShowModal(false);
      loadData();
      resetForm();
    } catch (err) {
      alert('Lỗi khi tạo lệnh hẹn giờ');
    }
  };

  const resetForm = () => {
    setName('');
    setType('ALL_AGENCY');
    setRank('BRONZE');
    setScheduledAt('');
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Bạn có chắc muốn hủy lệnh này?')) return;
    try {
      await priceAssignmentVoucherApi.cancel(id);
      loadData();
    } catch (err) {
      alert('Không thể hủy lệnh');
    }
  };

  const handleStop = async (id: number) => {
    if (!confirm('Bạn có chắc muốn dừng thiết lập này? Hệ thống sẽ khôi phục lại thiết lập trước đó.')) return;
    try {
      await priceAssignmentVoucherApi.stop(id);
      loadData();
    } catch (err) {
      alert('Không thể dừng thiết lập');
    }
  };

  const handleReactivate = async (id: number) => {
    setReactivatingVoucherId(id);
    setReactivationType('IMMEDIATE');
    setReactivationScheduledAt('');
    setShowReactivateModal(true);
  };

  const submitReactivate = async () => {
    if (!reactivatingVoucherId) return;
    try {
      const scheduledAtParam = reactivationType === 'SCHEDULED' 
        ? (reactivationScheduledAt.length === 16 ? reactivationScheduledAt + ':00' : reactivationScheduledAt)
        : undefined;
      
      await priceAssignmentVoucherApi.reactivate(reactivatingVoucherId, scheduledAtParam);
      setShowReactivateModal(false);
      loadData();
    } catch (err: any) {
      alert('Không thể kích hoạt lại thiết lập: ' + err.message);
    }
  };

  const filteredVouchers = vouchers.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.priceListName && v.priceListName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (v.agencyName && v.agencyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (v.customerName && v.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns: Column<PriceAssignmentVoucher>[] = [
    { header: 'Tên lệnh', key: 'name', width: '25%' },
    { header: 'Bảng giá', key: 'priceListName', width: '20%' },
    { 
      header: 'Đối tượng', 
      key: 'assignmentType', 
      width: '20%',
      render: (v) => (
        <div style={{ fontSize: '0.9rem' }}>
          {v.assignmentType === 'ALL_AGENCY' && 'Tất cả Khách hàng'}
          {v.assignmentType === 'AGENCY_RANK' && `Hạng ${v.rankLevel}`}
          {v.assignmentType === 'DIRECT_AGENCY' && `Khách hàng: ${v.agencyName}`}
          {v.assignmentType === 'DIRECT_CUSTOMER' && `Người mua: ${v.customerName}`}
        </div>
      )
    },
    { 
      header: 'Thời gian thực hiện', 
      key: 'scheduledAt', 
      width: '15%',
      render: (v) => (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {new Date(v.scheduledAt).toLocaleString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
          })}
        </div>
      )
    },
    { 
      header: 'Trạng thái', 
      key: 'status', 
      width: '10%',
      render: (v) => (
        <Badge 
          type={v.status === 'APPLIED' ? 'success' : v.status === 'PENDING' ? 'warning' : 'error'}
          label={v.status === 'PENDING' ? 'Đang chờ' : v.status === 'APPLIED' ? 'Đã áp dụng' : v.status === 'STOPPED' ? 'Đã dừng' : 'Đã hủy'}
          icon={v.status === 'APPLIED' ? 'CheckCircle' : v.status === 'PENDING' ? 'Clock' : 'XCircle'}
        />
      )
    },
    { 
      header: 'Thao tác', 
      key: 'actions', 
      align: 'center',
      render: (v) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {v.status === 'PENDING' && (
            <button onClick={() => v.id && handleCancel(v.id)} className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}>
              Hủy
            </button>
          )}
          {v.status === 'APPLIED' && (
            <button onClick={() => v.id && handleStop(v.id)} className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#f59e0b', borderColor: '#f59e0b' }}>
              Dừng
            </button>
          )}
          {v.status === 'STOPPED' && (
            <button onClick={() => v.id && handleReactivate(v.id)} className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#10b981', borderColor: '#10b981' }}>
              Kích hoạt lại
            </button>
          )}
        </div>
      )
    }
  ];

  if (!isAdmin) return <div className="p-8">Bạn không có quyền truy cập trang này.</div>;

  return (
    <>
      <Navbar />
      <main style={{ padding: '20px 0' }}>
        <PageHeader 
          title="Hẹn giờ áp dụng bảng giá" 
          subtitle="Tự động hóa việc gán bảng giá cho Khách hàng và Người mua lẻ theo lịch trình"
          icon="Clock"
        />

        <SearchActionHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm lệnh hẹn giờ..."
          actions={
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={18} />
              Tạo lệnh mới
            </button>
          }
        />

        <DataTable 
          data={filteredVouchers}
          columns={columns}
          loading={loading}
          emptyMessage={searchQuery ? 'Không tìm thấy lệnh nào phù hợp' : 'Chưa có lệnh hẹn giờ nào'}
        />

        {/* Create Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
          }}>
            <GlassCard style={{ width: '100%', maxWidth: 500, padding: 40 }}>
              <h2 style={{ marginTop: 0, marginBottom: 24 }}>Tạo lệnh hẹn giờ mới</h2>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Tên lệnh</label>
                  <input 
                    required 
                    className="input-field" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Ví dụ: Áp dụng bảng giá Tết cho Khách hàng Vàng"
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Bảng giá áp dụng</label>
                  <select 
                    className="input-field" 
                    value={priceListId} 
                    onChange={e => setPriceListId(Number(e.target.value))}
                  >
                    {priceLists.map(pl => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Đối tượng áp dụng</label>
                  <select 
                    className="input-field" 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                  >
                    <option value="ALL_AGENCY">Tất cả Khách hàng</option>
                    <option value="AGENCY_RANK">Theo hạng Khách hàng</option>
                    <option value="DIRECT_AGENCY">Khách hàng cụ thể</option>
                    <option value="DIRECT_CUSTOMER">Người mua cụ thể</option>
                  </select>
                </div>

                {type === 'AGENCY_RANK' && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Chọn Hạng</label>
                    <select className="input-field" value={rank} onChange={e => setRank(e.target.value)}>
                      <option value="BRONZE">BRONZE</option>
                      <option value="SILVER">SILVER</option>
                      <option value="GOLD">GOLD</option>
                      <option value="PLATINUM">PLATINUM</option>
                      <option value="DIAMOND">DIAMOND</option>
                    </select>
                  </div>
                )}

                {type === 'DIRECT_AGENCY' && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Chọn Khách hàng</label>
                    <select className="input-field" value={selectedAgencyId} onChange={e => setSelectedAgencyId(Number(e.target.value))}>
                      {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                )}

                {type === 'DIRECT_CUSTOMER' && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Chọn Người mua</label>
                    <select className="input-field" value={selectedCustomerId} onChange={e => setSelectedCustomerId(Number(e.target.value))}>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.username} ({c.email})</option>)}
                    </select>
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Thời điểm thực hiện</label>
                  <input 
                    required 
                    type="datetime-local" 
                    className="input-field" 
                    value={scheduledAt} 
                    onChange={e => setScheduledAt(e.target.value)} 
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Hủy</button>
                  <button type="submit" className="btn-primary">Lưu lệnh</button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}

        {/* Reactivate Modal */}
        {showReactivateModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
          }}>
            <GlassCard style={{ width: '100%', maxWidth: 450, padding: 40 }}>
              <h2 style={{ marginTop: 0, marginBottom: 24 }}>Kích hoạt lại thiết lập</h2>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="reactivationType" 
                    checked={reactivationType === 'IMMEDIATE'} 
                    onChange={() => setReactivationType('IMMEDIATE')} 
                  />
                  <span>Kích hoạt ngay lập tức</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="reactivationType" 
                    checked={reactivationType === 'SCHEDULED'} 
                    onChange={() => setReactivationType('SCHEDULED')} 
                  />
                  <span>Chọn thời gian thực hiện</span>
                </label>
              </div>

              {reactivationType === 'SCHEDULED' && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Thời điểm thực hiện mới</label>
                  <input 
                    required 
                    type="datetime-local" 
                    className="input-field" 
                    value={reactivationScheduledAt} 
                    onChange={e => setReactivationScheduledAt(e.target.value)} 
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowReactivateModal(false)} className="btn-outline">Đóng</button>
                <button onClick={submitReactivate} className="btn-primary">Xác nhận</button>
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </>
  );
}

