'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { productApi, ProductDTO } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { resolveImageUrl } from '@/lib/utils';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import { Plus, Edit, Trash2, Eye, Package, ShoppingCart } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const loadProducts = async () => {
    setLoading(true);
    try {
      let currentAgencyId: number | undefined = undefined;
      const storedAgencyId = localStorage.getItem('agencyId');
      if (storedAgencyId) {
        currentAgencyId = Number(storedAgencyId);
      }

      const data = await productApi.getAll(currentAgencyId);
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
  const isCompanyAdmin = user?.roles.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: number) => {
    if (price === -1) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

  return (
    <>
      <Navbar />
      <main style={{ padding: '20px 0' }}>
        <PageHeader 
          title="Danh sách sản phẩm" 
          subtitle="Khám phá hàng nghìn sản phẩm từ các đối tác và đại lý uy tín"
          icon="ShoppingBag"
        />

        <SearchActionHeader 
          searchQuery={search}
          onSearchChange={setSearch}
          placeholder="Tìm kiếm sản phẩm..."
          actions={isAuthorized && (
            <Link href="/products/create" className="btn-primary" style={{ textDecoration: 'none' }}>
              <Plus size={18} />
              Thêm sản phẩm
            </Link>
          )}
        />

        {/* States */}
        {loading ? (
          <GlassCard style={{ padding: '80px 0', textAlign: 'center' }}>
            <div className="spinner" style={{ marginBottom: 16 }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách sản phẩm...</p>
          </GlassCard>
        ) : error ? (
          <GlassCard style={{ padding: 40, textAlign: 'center', borderColor: 'var(--danger)' }}>
            <h3 style={{ color: 'var(--danger)', marginBottom: 12 }}>⚠️ Không thể tải dữ liệu</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button onClick={loadProducts} className="btn-outline" style={{ marginTop: 20 }}>Thử lại</button>
          </GlassCard>
        ) : filtered.length === 0 ? (
          <GlassCard style={{ padding: '80px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}><Package size={64} style={{ margin: '0 auto' }} /></div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              {search ? 'Không tìm thấy sản phẩm nào phù hợp' : 'Hệ thống chưa có sản phẩm nào'}
            </p>
          </GlassCard>
        ) : (
          <>
            <div style={{ marginBottom: 20, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Hiển thị {filtered.length} sản phẩm
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}>
              {filtered.map((product, i) => (
                <GlassCard
                  key={product.id}
                  hoverable
                  className="fade-in-up"
                  style={{ 
                    animationDelay: `${i * 0.05}s`, 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: 20
                  }}
                >
                  {/* Product image */}
                  <Link href={`/products/${product.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      height: 180, borderRadius: 12, marginBottom: 16,
                      backgroundImage: product.imageUrl ? `url(${resolveImageUrl(product.imageUrl)})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: `hsl(${(product.id * 47) % 360}, 40%, 15%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {!product.imageUrl && <ShoppingCart size={48} style={{ opacity: 0.2 }} />}
                      {product.isDropship && (
                        <span style={{
                          position: 'absolute', top: 12, right: 12,
                          background: 'var(--accent)', color: 'white',
                          fontSize: '0.65rem', padding: '4px 8px', borderRadius: 20, fontWeight: 700
                        }}>DROPSHIP</span>
                      )}
                    </div>
                  </Link>

                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    <Badge label={product.categoryName || 'Chưa phân loại'} type="primary" />
                    {product.stockQuantity !== undefined && (
                      <Badge 
                        label={product.stockQuantity > 0 ? `Kho: ${product.stockQuantity}` : 'Hết hàng'} 
                        type={product.stockQuantity > 0 ? 'success' : 'warning'} 
                        icon={product.stockQuantity > 0 ? 'Package' : 'AlertTriangle'}
                      />
                    )}
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4 }}>
                    <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {product.name || 'Sản phẩm'}
                    </Link>
                  </h3>
                  <p style={{
                    margin: '0 0 16px', color: 'var(--text-muted)',
                    fontSize: '0.85rem', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    flexGrow: 1
                  }}>
                    {stripHtml(product.description || '') || 'Chưa có mô tả'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-light)' }}>
                      {formatPrice(isCompanyAdmin ? (product.basePrice || 0) : (product.appliedPrice !== undefined ? product.appliedPrice : (product.basePrice || 0)))}
                    </span>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isAuthorized ? (
                        <>
                          <Link href={`/products/${product.id}/edit`} className="btn-outline" style={{ padding: '8px', borderRadius: 8 }}>
                            <Edit size={16} />
                          </Link>
                          <button onClick={() => handleDelete(product.id)} className="btn-outline" style={{ padding: '8px', borderRadius: 8, color: '#ef4444' }}>
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <Link href={`/products/${product.id}`} className="btn-outline" style={{ padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: '0.85rem' }}>
                          <Eye size={16} style={{ marginRight: 6 }} /> Chi tiết
                        </Link>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
