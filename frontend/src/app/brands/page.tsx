'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import Pagination from '@/components/ui/Pagination';
import BrandFormModal from '@/components/ui/BrandFormModal';
import { brandApi, brandImportApi, BrandDTO } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Upload, Download } from 'lucide-react';


export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandDTO | null>(null);
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const pageSize = 20;

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

  const handleAdd = () => {
    setEditingBrand(null);
    setShowModal(true);
  };

  const handleEdit = (brand: BrandDTO) => {
    setEditingBrand(brand);
    setShowModal(true);
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

  const handleModalSuccess = () => {
    loadBrands();
  };

  const isAuthorized = user?.roles.some(r => ['ROLE_ADMIN', 'ROLE_COMPANY'].includes(r));
  const totalPages = Math.ceil(brands.length / pageSize) || 1;
  const paginatedData = brands.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <>
      <Navbar />
      <Main>
        <div className="fade-in-up" style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
              🏷️ <span className="gradient-text">Quản lý thương hiệu</span>
            </h1>
            <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
              Quản lý các thương hiệu sản phẩm trong hệ thống
            </p>
          </div>
          {isAuthorized && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link href={brandImportApi.exportBrandsUrl} className="btn-outline" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', fontSize: '0.85rem' }}>
                <Download size={16} /> Export
              </Link>
              <Link href="/brands/import" className="btn-outline" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', fontSize: '0.85rem' }}>
                <Upload size={16} /> Import Excel
              </Link>
              <button onClick={handleAdd} className="btn-primary" style={{ height: 42, whiteSpace: 'nowrap' }}>
                + Thêm thương hiệu
              </button>
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
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>LOGO</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>MÃ</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>TÊN THƯƠNG HIỆU</th>
                  {isAuthorized && <th style={{ padding: '16px 20px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>THAO TÁC</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((brand) => (
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
                {paginatedData.length === 0 && brands.length === 0 && (
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
        {brands.length > 0 && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Main>

      <BrandFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        brand={editingBrand}
      />
    </>
  );
}
