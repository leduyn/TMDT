'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import Pagination from '@/components/ui/Pagination';
import { productTypeApi, ProductTypeDTO, ProductTypeRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ProductTypesPage() {
  const [types, setTypes] = useState<ProductTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ProductTypeRequest>({ code: '', name: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const loadTypes = () => {
    setLoading(true);
    productTypeApi.getAll()
      .then(setTypes)
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productTypeApi.update(editingId, form);
      } else {
        await productTypeApi.create(form);
      }
      setForm({ code: '', name: '', description: '' });
      setEditingId(null);
      loadTypes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (type: ProductTypeDTO) => {
    setEditingId(type.id);
    setForm({ code: type.code, name: type.name, description: type.description || '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xoá loại sản phẩm này?')) return;
    try {
      await productTypeApi.delete(id);
      loadTypes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isAuthorized = user?.roles.some(r => ['ROLE_ADMIN', 'ROLE_COMPANY'].includes(r));
  const totalPages = Math.ceil(types.length / pageSize) || 1;
  const paginatedData = types.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <>
      <Navbar />
      <Main>
        <div className="fade-in-up" style={{ marginBottom: 40 }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
            🏷️ <span className="gradient-text">Quản lý loại sản phẩm</span>
          </h1>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            Quản lý các loại sản phẩm như Máy móc, Phụ tùng, Dụng cụ, ...
          </p>
        </div>

        {isAuthorized && (
          <div className="glass-card fade-in-up" style={{ padding: 24, marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 20 }}>
              {editingId ? '📝 Cập nhật loại sản phẩm' : '✨ Thêm loại sản phẩm mới'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mã loại (Duy nhất)</label>
                <input
                  className="input-field"
                  placeholder="VD: MACHINERY"
                  value={form.code}
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tên loại sản phẩm</label>
                <input
                  className="input-field"
                  placeholder="VD: Máy móc"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 8, alignSelf: 'end' }}>
                <button type="submit" className="btn-primary" style={{ height: 42 }}>
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
                {editingId && (
                  <button type="button" className="btn-outline" onClick={() => { setEditingId(null); setForm({code:'', name:'', description:''}); }} style={{ height: 42 }}>
                    Hủy
                  </button>
                )}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mô tả (Tùy chọn)</label>
                <textarea
                  className="input-field"
                  placeholder="VD: Các loại máy móc, thiết bị công nghiệp"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  rows={2}
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
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>MÃ</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>TÊN LOẠI</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>MÔ TẢ</th>
                  {isAuthorized && <th style={{ padding: '16px 20px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>THAO TÁC</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((type) => (
                  <tr key={type.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: 600 }}>{type.code}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{type.name}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{type.description || '—'}</td>
                    {isAuthorized && (
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEdit(type)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            Sửa
                          </button>
                          <button onClick={() => handleDelete(type.id)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}>
                            Xoá
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {paginatedData.length === 0 && types.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Chưa có loại sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {types.length > 0 && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Main>
    </>
  );
}
