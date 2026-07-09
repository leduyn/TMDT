'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { upgradeApi } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import { Save } from 'lucide-react';

export default function CustomerUpgradeTermsPage() {
  const { user } = useAuth();
  const [terms, setTerms] = useState('');
  const [version, setVersion] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.roles?.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  useEffect(() => { loadTerms(); }, []);

  const loadTerms = async () => {
    setLoading(true);
    try {
      const data = await upgradeApi.getTerms();
      setTerms(data.content);
      setVersion(data.version);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await upgradeApi.updateTerms(terms);
      alert('Đã lưu điều khoản');
      setVersion(String(result.version));
    } catch (e: any) {
      alert(e?.message || 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] text-[var(--text-secondary)] text-sm">Bạn không có quyền truy cập module này.</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="main-content bg-grid">
        <PageHeader title="Điều khoản nâng cấp" subtitle="Quản lý nội dung điều khoản nâng cấp từ Bán lẻ lên Bán buôn" icon="FileText" />

        <div className="card p-6" style={{ maxWidth: 800 }}>
          {loading ? (
            <div className="text-[var(--text-secondary)] text-sm">Đang tải...</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[var(--text-secondary)]">
                  Phiên bản hiện tại: <strong>{version || 'Chưa có'}</strong>
                </span>
              </div>
              <textarea
                className="w-full border border-[var(--border)] rounded-lg p-4 bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm resize-none"
                rows={15}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Nhập nội dung điều khoản..."
              />
              <div className="flex justify-end mt-4">
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu điều khoản'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
