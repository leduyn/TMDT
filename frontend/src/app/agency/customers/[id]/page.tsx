'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { customerApi, UserDTO } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationModal from '@/components/NotificationModal';

export default function AgencyCustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [customer, setCustomer] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingModal, setSavingModal] = useState(false);
  const [modalData, setModalData] = useState({
    customName: '',
    customPhone: '',
    customShippingAddress: ''
  });
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'info' as any
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      if (!user.roles?.includes('ROLE_AGENCY')) {
        setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản Người mua.');
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!id) return;
    customerApi.getById(Number(id))
      .then(data => {
        setCustomer(data);
        setModalData({
          customName: data.customName || '',
          customPhone: data.customPhone || '',
          customShippingAddress: data.customShippingAddress || ''
        });
      })
      .catch(err => {
        console.error(err);
        setError('Không thể tải thông tin người mua');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveAgencyInfo = async () => {
    if (!customer) return;
    setSavingModal(true);
    try {
      // Send the current data + the updated custom data
      await customerApi.update(customer.id, {
        username: customer.username,
        email: customer.email,
        phone: customer.phone,
        active: customer.active,
        organizationName: customer.organizationName,
        shippingAddress: customer.shippingAddress,
        billingAddress: customer.billingAddress,
        taxCode: customer.taxCode,
        customerGroupId: customer.customerGroupId,
        agencyIds: customer.agencyIds,
        
        customName: modalData.customName,
        customPhone: modalData.customPhone,
        customShippingAddress: modalData.customShippingAddress
      });
      
      // Update local state
      setCustomer({
        ...customer,
        customName: modalData.customName,
        customPhone: modalData.customPhone,
        customShippingAddress: modalData.customShippingAddress
      });
      
      
      setModal({ isOpen: true, title: 'Thành công', message: 'Lưu thông tin người mua thành công!', type: 'success' });
      setShowEditModal(false);
    } catch (err: any) {
      console.error(err);
      setModal({ isOpen: true, title: 'Lỗi', message: err.message || 'Lỗi khi lưu thông tin', type: 'error' });
    } finally {
      setSavingModal(false);
    }
  };

  if (authLoading || loading) return <div className="loading-spinner" />;
  if (error || !customer) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <p style={{ color: 'var(--error)' }}>{error || 'Không tìm thấy người mua'}</p>
      <button onClick={() => router.back()} className="btn-outline" style={{ marginTop: 16 }}>Quay lại</button>
    </div>
  );

  return (
    <>
      <Navbar />
      <Main>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{customer.displayName || customer.username}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Thông tin chi tiết tài khoản người mua</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowEditModal(true)} className="btn-primary">
              Chỉnh sửa thông tin
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          {/* Sidebar / Quick Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ 
                width: 100, height: 100, borderRadius: '50%', background: 'var(--accent)', 
                margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40, color: 'white', fontWeight: 800
              }}>
                {customer.displayName?.charAt(0).toUpperCase() || customer.username.charAt(0).toUpperCase()}
              </div>
              <h3 style={{ margin: 0 }}>{customer.displayName || customer.username}</h3>
              {customer.displayName && <p style={{ color: 'var(--accent-light)', fontSize: '0.8rem', fontWeight: 600, margin: '4px 0' }}>Tên gợi nhớ</p>}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>{customer.email}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>SĐT: {customer.phone || '---'}</p>
              <span className={`badge ${customer.active ? 'badge-success' : 'badge-warning'}`}>
                {customer.active ? 'Đang hoạt động' : 'Đã khóa'}
              </span>
            </div>

            <div className="glass-card" style={{ padding: 24 }}>
              <h4 style={{ margin: '0 0 16px', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Phân loại</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block' }}>Nhóm người mua</small>
                  <strong>{customer.customerGroupName || 'Vãng lai'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Main Info Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{ padding: 32 }}>
              <h3 style={{ margin: '0 0 24px' }}>Hồ sơ tài khoản</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tên tài khoản</small>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.username}</p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Email đăng ký</small>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.email}</p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Vai trò</small>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.role}</p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Mã người mua (ID)</small>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>#{customer.id}</p>
                </div>
              </div>

              <div style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
                <h3 style={{ margin: '0 0 24px' }}>Thông tin tổ chức & Địa chỉ</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tên tổ chức / Công ty</small>
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.organizationName || '---'}</p>
                  </div>
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Mã số thuế</small>
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{customer.taxCode || '---'}</p>
                  </div>
                  <div />
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Địa chỉ nhận hàng</small>
                    <p style={{ fontSize: '1rem', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{customer.shippingAddress || '---'}</p>
                  </div>
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Địa chỉ xuất hóa đơn</small>
                    <p style={{ fontSize: '1rem', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{customer.billingAddress || '---'}</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 32, background: 'rgba(52, 152, 219, 0.05)', padding: 24, borderRadius: 16 }}>
                <h3 style={{ margin: '0 0 24px', color: '#3498db' }}>Thông tin riêng của khách hàng</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tên gợi nhớ</small>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{customer.customName || '---'}</p>
                  </div>
                  <div>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Số điện thoại riêng</small>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{customer.customPhone || '---'}</p>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Địa chỉ nhận hàng riêng</small>
                    <p style={{ fontSize: '1rem', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{customer.customShippingAddress || '---'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Main>

      {/* Edit Modal cho Người mua */}
      {showEditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 24
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 500, padding: 32, background: 'var(--bg-primary)' }}>
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>Sửa thông tin riêng cho Người mua</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tên gợi nhớ</label>
                <input
                  type="text"
                  className="input-field"
                  value={modalData.customName}
                  onChange={e => setModalData({ ...modalData, customName: e.target.value })}
                  placeholder="Ví dụ: Anh Tuấn VIP"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Số điện thoại riêng</label>
                <input
                  type="text"
                  className="input-field"
                  value={modalData.customPhone}
                  onChange={e => setModalData({ ...modalData, customPhone: e.target.value })}
                  placeholder="Số điện thoại dùng liên lạc riêng"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Địa chỉ nhận hàng riêng</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={modalData.customShippingAddress}
                  onChange={e => setModalData({ ...modalData, customShippingAddress: e.target.value })}
                  placeholder="Địa chỉ cụ thể cho khách hàng này..."
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button 
                className="btn-outline" 
                style={{ flex: 1 }}
                onClick={() => setShowEditModal(false)}
                disabled={savingModal}
              >
                Hủy
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 1 }}
                onClick={handleSaveAgencyInfo}
                disabled={savingModal}
              >
                {savingModal ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}


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
