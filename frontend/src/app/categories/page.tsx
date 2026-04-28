'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { categoryApi, CategoryDTO } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const loadCategories = () => {
    setLoading(true);
    categoryApi.getAll()
      .then(setCategories)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xoá danh mục này?')) return;
    try {
      await categoryApi.delete(id);
      loadCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isAuthorized = user?.roles.some(r => ['ROLE_ADMIN', 'ROLE_COMPANY', 'ROLE_AGENCY'].includes(r));

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        <div className="fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
              📂 <span className="gradient-text">Danh mục sản phẩm</span>
            </h1>
            <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
              Quản lý phân loại sản phẩm trong hệ thống
            </p>
          </div>
          {isAuthorized && (
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/brands" className="btn-outline" style={{ textDecoration: 'none' }}>
                🏷️ Quản lý thương hiệu
              </Link>
              <Link href="/categories/create" className="btn-primary" style={{ textDecoration: 'none' }}>
                + Thêm danh mục
              </Link>
            </div>
          )}
        </div>

        {loading && <p>Đang tải...</p>}
        {error && <div className="alert-error">{error}</div>}

        {!loading && !error && (
          <div className="glass-card fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                <tr>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>ID</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>TÊN DANH MỤC</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>DANH MỤC CHA</th>
                  {isAuthorized && <th style={{ padding: '16px 20px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>THAO TÁC</th>}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px' }}>#{cat.id}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{cat.name}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      {cat.parentName || <span style={{ opacity: 0.3 }}>—</span>}
                    </td>
                    {isAuthorized && (
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                          <Link href={`/categories/${cat.id}/edit`} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none' }}>
                            Sửa
                          </Link>
                          <button onClick={() => handleDelete(cat.id)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}>
                            Xoá
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Chưa có danh mục nào
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
