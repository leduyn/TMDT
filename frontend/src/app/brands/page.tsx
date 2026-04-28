'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { brandApi, BrandDTO, BrandRequest, uploadApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/ImageUploader';

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<BrandRequest>({ code: '', name: '', logoUrl: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const { user } = useAuth();

  const loadBrands = () => {
    setLoading(true);
    brandApi.getAll()
      .then(setBrands)
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await brandApi.update(editingId, form);
      } else {
        await brandApi.create(form);
      }
      setForm({ code: '', name: '', logoUrl: '' });
      setEditingId(null);
      loadBrands();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (brand: BrandDTO) => {
    setEditingId(brand.id);
    setForm({ code: brand.code, name: brand.name, logoUrl: brand.logoUrl || '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xoá thương hiệu này?')) return;
    try {
      await brandApi.delete(id);
      loadBrands();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isAuthorized = user?.roles.some(r => ['ROLE_ADMIN', 'ROLE_COMPANY'].includes(r));

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        <div className="fade-in-up" style={{ marginBottom: 40 }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
            🏷️ <span className="gradient-text">Quản lý thương hiệu</span>
          </h1>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            Quản lý các thương hiệu sản phẩm trong hệ thống
          </p>
        </div>

        {isAuthorized && (
          <div className="glass-card fade-in-up" style={{ padding: 24, marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 20 }}>
              {editingId ? '📝 Cập nhật thương hiệu' : '✨ Thêm thương hiệu mới'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '250px 1fr auto', gap: 24 }}>
              <div style={{ gridRow: 'span 2' }}>
                <ImageUploader 
                  label="Logo thương hiệu"
                  value={form.logoUrl}
                  onChange={url => setForm({...form, logoUrl: url})}
                  uploadFn={uploadApi.uploadBrandLogo}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mã thương hiệu (Duy nhất)</label>
                <input 
                  className="input-field" 
                  placeholder="VD: SAM" 
                  value={form.code} 
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: 8, alignSelf: 'end' }}>
                <button type="submit" className="btn-primary" style={{ height: 42 }}>
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
                {editingId && (
                  <button type="button" className="btn-outline" onClick={() => { setEditingId(null); setForm({code:'', name:'', logoUrl:''}); }} style={{ height: 42 }}>
                    Hủy
                  </button>
                )}
              </div>
              <div style={{ gridColumn: '2 / span 2' }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tên thương hiệu</label>
                <input 
                  className="input-field" 
                  placeholder="VD: Samsung" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})}
                  required 
                />
              </div>
            </form>
          </div>
        )}

        {loading && <p>Đang tải...</p>}
        {error && <div className="alert-error">{error}</div>}

        {!loading && !error && (
          <div className="glass-card fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                <tr>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>LOGO</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>MÃ</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>TÊN THƯƠNG HIỆU</th>
                  {isAuthorized && <th style={{ padding: '16px 20px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>THAO TÁC</th>}
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4, background: '#fff', padding: 2 }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 4, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>NA</div>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: 600 }}>{brand.code}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{brand.name}</td>
                    {isAuthorized && (
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEdit(brand)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            Sửa
                          </button>
                          <button onClick={() => handleDelete(brand.id)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}>
                            Xoá
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {brands.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Chưa có thương hiệu nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
