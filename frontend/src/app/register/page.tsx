'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { agencyApi } from '@/lib/api';
import NotificationModal from '@/components/NotificationModal';

export default function RegisterPage() {
  const [form, setForm] = useState({
    code: '', name: '', phone: '', password: '', confirm: '',
    representativeName: '', taxCode: '', billingAddress: '', shippingAddress: '',
    receiverName: '', receiverPhone: '', nickname: ''
  });
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'info' as any
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.phone || !form.password) {
      setModal({ isOpen: true, title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin bắt buộc.', type: 'error' });
      return;
    }
    if (form.password !== form.confirm) {
      setModal({ isOpen: true, title: 'Lỗi mật khẩu', message: 'Mật khẩu xác nhận không khớp.', type: 'error' });
      return;
    }
    if (form.password.length < 6) {
      setModal({ isOpen: true, title: 'Lỗi bảo mật', message: 'Mật khẩu phải có ít nhất 6 ký tự.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await agencyApi.register({
        code: form.code, name: form.name, phone: form.phone, password: form.password,
        representativeName: form.representativeName || undefined,
        taxCode: form.taxCode || undefined,
        billingAddress: form.billingAddress || undefined,
        shippingAddress: form.shippingAddress || undefined,
        receiverName: form.receiverName || undefined,
        receiverPhone: form.receiverPhone || undefined,
        nickname: form.nickname || undefined
      });
      setModal({ isOpen: true, title: 'Thành công', message: 'Đăng ký thành công! Vui lòng chờ Admin duyệt. Đang chuyển hướng...', type: 'success' });
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      setModal({ isOpen: true, title: 'Lỗi đăng ký', message: err instanceof Error ? err.message : 'Đăng ký thất bại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24,
      background: 'radial-gradient(ellipse at bottom right, #1a1a3e 0%, var(--bg-primary) 60%)',
    }} className="bg-grid">
      <div style={{
        position: 'fixed', top: '10%', right: '15%',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="glass-card fade-in-up" style={{ width: '100%', maxWidth: 560, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            borderRadius: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
            fontSize: 24, color: 'white',
            boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
          }}>✨</div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Đăng ký Đại lý</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Tham gia sàn TMDT với tư cách Đại lý
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 12px 0', color: 'var(--accent)' }}>Thông tin tài khoản</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-code">Mã Đại lý</label>
              <input id="reg-code" className="input-field" type="text" placeholder="VD: DL001" value={form.code} onChange={update('code')} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Tên Đại lý</label>
              <input id="reg-name" className="input-field" type="text" placeholder="Tên cửa hàng" value={form.name} onChange={update('name')} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-phone">Số điện thoại (tên đăng nhập)</label>
            <input id="reg-phone" className="input-field" type="text" placeholder="Số điện thoại" value={form.phone} onChange={update('phone')} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Mật khẩu</label>
              <input id="reg-password" className="input-field" type="password" placeholder="Ít nhất 6 ký tự" value={form.password} onChange={update('password')} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Xác nhận</label>
              <input id="reg-confirm" className="input-field" type="password" placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={update('confirm')} required />
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', margin: '20px 0 12px 0', color: 'var(--accent)' }}>Thông tin chi tiết</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-rep">Người đại diện</label>
              <input id="reg-rep" className="input-field" type="text" placeholder="Tên người đại diện" value={form.representativeName} onChange={update('representativeName')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-tax">Mã số thuế</label>
              <input id="reg-tax" className="input-field" type="text" placeholder="MST doanh nghiệp" value={form.taxCode} onChange={update('taxCode')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-ship">Địa chỉ nhận hàng</label>
            <input id="reg-ship" className="input-field" type="text" placeholder="Địa chỉ giao hàng" value={form.shippingAddress} onChange={update('shippingAddress')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-bill">Địa chỉ xuất hóa đơn</label>
            <input id="reg-bill" className="input-field" type="text" placeholder="Địa chỉ trên hóa đơn" value={form.billingAddress} onChange={update('billingAddress')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-rec-name">Người nhận hàng</label>
              <input id="reg-rec-name" className="input-field" type="text" placeholder="Tên người nhận" value={form.receiverName} onChange={update('receiverName')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-rec-phone">SĐT người nhận</label>
              <input id="reg-rec-phone" className="input-field" type="text" placeholder="SĐT người nhận" value={form.receiverPhone} onChange={update('receiverPhone')} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 24 }}>
            {loading && <span className="spinner" />}
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: 'var(--accent-light)', fontWeight: 600, textDecoration: 'none' }}>
            Đăng nhập
          </Link>
        </p>
      </div>

      <NotificationModal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </main>
  );
}
