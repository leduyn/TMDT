'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { productApi, ProductDTO } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { resolveImageUrl } from '@/lib/utils';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const loadProducts = () => {
    setLoading(true);
    productApi.getAll()
      .then(setProducts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xoá sản phẩm này?')) return;
    try {
      await productApi.delete(id);
      loadProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isAuthorized = user?.roles.some(r => ['ROLE_COMPANY', 'ROLE_AGENCY', 'ROLE_ADMIN'].includes(r));

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Page header */}
        <div className="fade-in-up" style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
              🛍️ <span className="gradient-text">Danh sách sản phẩm</span>
            </h1>
            <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
              Khám phá hàng nghìn sản phẩm từ các đại lý uy tín
            </p>
          </div>
          {isAuthorized && (
            <Link href="/products/create" className="btn-primary" style={{ textDecoration: 'none' }}>
              + Thêm sản phẩm
            </Link>
          )}
        </div>

        {/* Search bar */}
        <div className="fade-in-up" style={{ marginBottom: 32, animationDelay: '0.1s' }}>
          <input
            className="input-field"
            type="search"
            placeholder="🔍  Tìm kiếm sản phẩm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 480, fontSize: '0.95rem' }}
          />
        </div>

        {/* States */}
        {loading && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 16, padding: '80px 0',
          }}>
            <div style={{
              width: 48, height: 48,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: 'var(--text-secondary)' }}>Đang tải sản phẩm...</p>
          </div>
        )}

        {error && (
          <div className="alert-error fade-in-up" style={{ maxWidth: 480, margin: '40px auto' }}>
            <strong>⚠️ Không thể tải sản phẩm</strong>
            <br />{error}
            <br />
            <small style={{ color: 'var(--text-muted)', marginTop: 6, display: 'block' }}>
              Hãy chắc chắn backend đang chạy ở localhost:8080
            </small>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <p style={{ fontSize: '1.1rem' }}>
              {search ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào trong hệ thống'}
            </p>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
              Hiển thị {filtered.length} sản phẩm
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}>
              {filtered.map((product, i) => (
                <div
                  key={product.id}
                  className="product-card fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s`, display: 'flex', flexDirection: 'column' }}
                >
                  {/* Product image */}
                  <div style={{
                    height: 180, borderRadius: 12, marginBottom: 16,
                    backgroundImage: product.imageUrl ? `url(${resolveImageUrl(product.imageUrl)})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: `hsl(${(product.id * 47) % 360}, 40%, 15%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 48,
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {!product.imageUrl && '🛒'}
                    {product.isDropship && (
                      <span style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'var(--accent)', color: 'white',
                        fontSize: '0.65rem', padding: '4px 8px', borderRadius: 20, fontWeight: 700
                      }}>DROPSHIP</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">{product.categoryName || 'Chưa phân loại'}</span>
                    {product.stockQuantity !== undefined && (
                      <span className={`badge ${product.stockQuantity > 0 ? 'badge-success' : 'badge-warning'}`}>
                        {product.stockQuantity > 0 ? `Kho: ${product.stockQuantity}` : 'Hết hàng'}
                      </span>
                    )}
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4 }}>
                    {product.name || 'Sản phẩm'}
                  </h3>
                  <p style={{
                    margin: '0 0 16px', color: 'var(--text-muted)',
                    fontSize: '0.85rem', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    flexGrow: 1
                  }}>
                    {product.description || 'Chưa có mô tả'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-light)' }}>
                      {formatPrice(product.basePrice || 0)}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isAuthorized ? (
                        <>
                          <Link href={`/products/${product.id}/edit`} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none' }}>
                            Sửa
                          </Link>
                          <button onClick={() => handleDelete(product.id)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}>
                            Xoá
                          </button>
                        </>
                      ) : (
                        <button className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                          Chi tiết
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

