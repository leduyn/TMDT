'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { priceAssignmentVoucherApi, PriceAssignmentVoucher, priceListApi, PriceListDTO, agencyApi, AgencyDTO, customerApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function PriceVouchersPage() {
  const [vouchers, setVouchers] = useState<PriceAssignmentVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [priceLists, setPriceLists] = useState<PriceListDTO[]>([]);
  const [agencies, setAgencies] = useState<AgencyDTO[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
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
        // Gửi lên backend theo múi giờ local của thiết bị (vì backend dùng LocalDateTime)
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

  if (!isAdmin) return <div className="p-8">Bạn không có quyền truy cập trang này.</div>;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
              ⏰ <span className="gradient-text">Hẹn giờ áp dụng bảng giá</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
              Tự động hóa việc gán bảng giá cho đại lý theo lịch trình
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Tạo lệnh mới
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>Đang tải dữ liệu...</div>
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                <tr>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Tên lệnh</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Bảng giá</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Đối tượng</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Thời gian thực hiện</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Trạng thái</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(v => (
                  <tr key={v.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{v.name}</td>
                    <td style={{ padding: '16px 20px' }}>{v.priceListName}</td>
                    <td style={{ padding: '16px 20px' }}>
                      {v.assignmentType === 'ALL_AGENCY' && 'Tất cả đại lý'}
                      {v.assignmentType === 'AGENCY_RANK' && `Hạng ${v.rankLevel}`}
                      {v.assignmentType === 'DIRECT_AGENCY' && `Đại lý: ${v.agencyName}`}
                      {v.assignmentType === 'DIRECT_CUSTOMER' && `Khách hàng: ${v.customerName}`}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {new Date(v.scheduledAt).toLocaleString('vi-VN', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                        timeZoneName: 'short'
                      })}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge ${
                        v.status === 'APPLIED' ? 'badge-success' : 
                        v.status === 'CANCELLED' ? 'badge-error' : 
                        v.status === 'STOPPED' ? 'badge-error' : 'badge-warning'
                      }`}>
                        {v.status === 'PENDING' ? 'Đang chờ' : 
                         v.status === 'APPLIED' ? 'Đã áp dụng' : 
                         v.status === 'STOPPED' ? 'Đã dừng' : 'Đã hủy'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
          }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: 500, padding: 40 }}>
              <h2 style={{ marginTop: 0, marginBottom: 24 }}>Tạo lệnh hẹn giờ mới</h2>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Tên lệnh</label>
                  <input 
                    required 
                    className="input-field" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Ví dụ: Áp dụng bảng giá Tết cho Đại lý Vàng"
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
                    <option value="ALL_AGENCY">Tất cả đại lý</option>
                    <option value="AGENCY_RANK">Theo hạng đại lý</option>
                    <option value="DIRECT_AGENCY">Đại lý cụ thể</option>
                    <option value="DIRECT_CUSTOMER">Khách hàng cụ thể</option>
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
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Chọn Đại lý</label>
                    <select className="input-field" value={selectedAgencyId} onChange={e => setSelectedAgencyId(Number(e.target.value))}>
                      {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                )}

                {type === 'DIRECT_CUSTOMER' && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Chọn Khách hàng</label>
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
            </div>
          </div>
        )}
        {showReactivateModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
          }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: 450, padding: 40 }}>
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
            </div>
          </div>
        )}
      </main>
    </>
  );
}
