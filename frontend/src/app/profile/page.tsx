'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import NotificationModal from '@/components/NotificationModal';
import { agencyApi, userApi, uploadApi } from '@/lib/api';

import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Main from '@/components/Main';
import ImageUploader from '@/modules/common/components/ImageUploader';
import { User, ShieldCheck, Building, MapPin, Save, Smartphone, UserCircle, Hash, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Khách hàng', COMPANY: 'Quản trị', ADMIN: 'Quản trị viên',
};

const STATUS_BADGE: Record<string, { label: string; type: 'success' | 'error' | 'warning' | 'info' | 'primary' }> = {
  APPROVED: { label: 'Đã duyệt', type: 'success' },
  PENDING: { label: 'Chờ duyệt', type: 'warning' },
  REJECTED: { label: 'Từ chối', type: 'error' },
};

const TYPE_LABELS: Record<string, string> = {
  RETAIL: 'Bán lẻ', WHOLESALE: 'Bán sỉ',
};

const ACTIVE_BADGE: Record<string, { label: string; type: 'success' | 'error' | 'warning' | 'info' | 'primary' }> = {
  true: { label: 'Hoạt động', type: 'success' },
  false: { label: 'Vô hiệu', type: 'error' },
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</label>
      <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, isAgency } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'info' as any
  });

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    taxCode: '',
    organizationName: '',
    shippingAddress: '',
    billingAddress: '',
    password: '',
    confirmPassword: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const loadProfile = isAgency
        ? agencyApi.getMe().then(data => {
            setProfile(data);
            setFormData({
              email: '',
              phone: data.phone || '',
              taxCode: data.taxCode || '',
              organizationName: data.name || '',
              shippingAddress: data.shippingAddress || '',
              billingAddress: data.billingAddress || '',
              password: '',
              confirmPassword: '',
              avatarUrl: data.avatarUrl || ''
            });
          })
        : userApi.getMe().then(data => {
            setProfile(data);
            setFormData({
              email: data.email || '',
              phone: data.phone || '',
              taxCode: data.taxCode || '',
              organizationName: data.organizationName || '',
              shippingAddress: data.shippingAddress || '',
              billingAddress: data.billingAddress || '',
              password: '',
              confirmPassword: '',
              avatarUrl: data.avatarUrl || ''
            });
          });

      loadProfile
        .catch(err => {
          console.error(err);
          setModal({ isOpen: true, title: 'Lỗi', message: 'Không thể tải thông tin hồ sơ', type: 'error' });
        })
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router, isAgency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setModal({ isOpen: true, title: 'Lỗi', message: 'Mật khẩu xác nhận không khớp', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      if (isAgency) {
        const body: any = {};
        if (formData.phone) body.phone = formData.phone;
        if (formData.taxCode) body.taxCode = formData.taxCode;
        if (formData.shippingAddress) body.shippingAddress = formData.shippingAddress;
        if (formData.billingAddress) body.billingAddress = formData.billingAddress;
        if (formData.avatarUrl) body.avatarUrl = formData.avatarUrl;

        const res = await fetch(`/api/agencies/${profile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(body)
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Lỗi khi cập nhật hồ sơ đại lý');
        }
      } else {
        const body: any = {};
        if (formData.email) body.email = formData.email;
        if (formData.phone) body.phone = formData.phone;
        if (formData.organizationName) body.organizationName = formData.organizationName;
        if (formData.taxCode) body.taxCode = formData.taxCode;
        if (formData.shippingAddress) body.shippingAddress = formData.shippingAddress;
        if (formData.billingAddress) body.billingAddress = formData.billingAddress;
        if (formData.password) body.password = formData.password;

        const res = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(body)
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Lỗi khi cập nhật hồ sơ');
        }
      }

      setModal({ isOpen: true, title: 'Thành công', message: 'Cập nhật hồ sơ thành công!', type: 'success' });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err: any) {
      setModal({ isOpen: true, title: 'Lỗi cập nhật', message: err.message || 'Lỗi khi cập nhật hồ sơ', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) return <div className="loading-spinner" />;

  const applyBadge = (value: boolean | string | undefined, map: Record<string, any>, fallback = '---') => {
    if (value === undefined || value === null) return <span style={{ color: 'var(--text-muted)' }}>{fallback}</span>;
    const key = String(value);
    const entry = map[key];
    if (!entry) return <span>{key}</span>;
    if (typeof entry === 'string') return <span>{entry}</span>;
    return <Badge label={entry.label} type={entry.type as any} />;
  };

  return (
    <Main>
      <PageHeader
        title="Hồ sơ tài khoản"
        subtitle={isAgency ? 'Quản lý thông tin Đại lý' : 'Quản lý thông tin cá nhân và bảo mật tài khoản người dùng'}
        icon="User"
      />

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ width: 200 }}>
            <ImageUploader
              label="Ảnh đại diện"
              value={formData.avatarUrl}
              onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
              uploadFn={uploadApi.uploadAvatar}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* --- THÔNG TIN TÀI KHOẢN --- */}
          <GlassCard style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              {isAgency ? <Smartphone className="gradient-text" size={24} /> : <User className="gradient-text" size={24} />}
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Thông tin tài khoản</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {isAgency ? (
                <>
                  <Field label="Mã Đại lý" value={<><Hash size={14} style={{ color: 'var(--text-muted)' }} /> {profile?.code}</>} />
                  <Field label="Tên Đại lý" value={profile?.name} />
                  <Field label="Người đại diện" value={profile?.representativeName || <span style={{ color: 'var(--text-muted)' }}>---</span>} />
                  <Field label="Biệt danh" value={profile?.nickname || <span style={{ color: 'var(--text-muted)' }}>---</span>} />
                  <Field label="Số điện thoại" value={
                    <input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="SĐT chính thức" style={{ marginTop: 0 }} />
                  } />
                  <Field label="Loại" value={applyBadge(profile?.type, TYPE_LABELS)} />
                  <Field label="Trạng thái" value={applyBadge(profile?.status, STATUS_BADGE)} />
                  <Field label="Ngày tạo" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : '---'} />
                </>
              ) : (
                <>
                  <Field label="Tên đăng nhập" value={<span><UserCircle size={14} style={{ color: 'var(--text-muted)' }} /> {profile?.username}</span>} />
                  <Field label="Email liên hệ" value={
                    <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required style={{ marginTop: 0 }} />
                  } />
                  <Field label="Vai trò" value={applyBadge(profile?.role, ROLE_LABELS)} />
                  <Field label="Trạng thái" value={applyBadge(profile?.active, ACTIVE_BADGE)} />
                  <Field label="Số điện thoại" value={
                    <input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="SĐT liên hệ" style={{ marginTop: 0 }} />
                  } />
                  <Field label="Nhóm khách hàng" value={profile?.customerGroupName || <span style={{ color: 'var(--text-muted)' }}>---</span>} />
                  <Field label="Đại lý quản lý" value={
                    profile?.agencyNames?.length > 0
                      ? profile.agencyNames.join(', ')
                      : <span style={{ color: 'var(--text-muted)' }}>---</span>
                  } />
                </>
              )}
            </div>
          </GlassCard>

          {/* --- BẢO MẬT & MẬT KHẨU --- */}
          <GlassCard style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <ShieldCheck className="gradient-text" size={24} />
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Bảo mật & Mật khẩu</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mật khẩu mới</label>
                <input type="password" className="input-field" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Để trống nếu không muốn đổi" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Xác nhận mật khẩu</label>
                <input type="password" className="input-field" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Nhập lại mật khẩu mới" />
              </div>
            </div>
          </GlassCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* --- THÔNG TIN TỔ CHỨC --- */}
          <GlassCard style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <Building className="gradient-text" size={24} />
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Thông tin tổ chức</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {isAgency ? 'Tên Đại lý' : 'Tên tổ chức / Công ty'}
                </label>
                <input type="text" className="input-field" value={formData.organizationName}
                  onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                  disabled={isAgency}
                  placeholder={isAgency ? '' : 'Tên công ty hoặc hộ kinh doanh'}
                  style={isAgency ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mã số thuế</label>
                <input type="text" className="input-field" value={formData.taxCode} onChange={e => setFormData({ ...formData, taxCode: e.target.value })} placeholder="Nhập mã số thuế (nếu có)" />
              </div>
              {isAgency && (
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Người nhận hàng</label>
                  <input type="text" className="input-field" value={profile?.receiverName || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              )}
              {isAgency && (
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-muted)' }}>SĐT người nhận</label>
                  <input type="text" className="input-field" value={profile?.receiverPhone || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              )}
            </div>
          </GlassCard>

          {/* --- ĐỊA CHỈ LIÊN HỆ --- */}
          <GlassCard style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <MapPin className="gradient-text" size={24} />
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Địa chỉ liên hệ</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Địa chỉ nhận hàng</label>
                <textarea className="input-field" rows={3} value={formData.shippingAddress} onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })} placeholder="Địa chỉ nhận hàng mặc định" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Địa chỉ xuất hóa đơn</label>
                <textarea className="input-field" rows={3} value={formData.billingAddress} onChange={e => setFormData({ ...formData, billingAddress: e.target.value })} placeholder="Địa chỉ ghi trên hóa đơn" />
              </div>
            </div>
          </GlassCard>

          <button type="submit" className="btn-primary" style={{ padding: '16px', fontWeight: 600, fontSize: '1rem', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }} disabled={saving}>
            <Save size={20} />
            {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
          </button>
        </div>
        </div>
      </form>

      <NotificationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </Main>
  );
}