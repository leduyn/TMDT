'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { productApi, ProductDTO } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { resolveImageUrl } from '@/lib/utils';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import DataTable, { Column } from '@/components/ui/DataTable';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  ShoppingCart, 
  LayoutGrid, 
  List as ListIcon,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    // Load preference from localStorage
    const savedMode = localStorage.getItem('productViewMode');
    if (savedMode === 'table' || savedMode === 'grid') {
      setViewMode(savedMode);
    }
  }, []);

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

  const toggleViewMode = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('productViewMode', mode);
  };

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
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: number) => {
    if (price === -1 || price === undefined) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

  const tableColumns: Column<ProductDTO>[] = [
    {
      header: 'Hình ảnh',
      key: 'imageUrl',
      width: '80px',
      render: (p) => (
        <div style={{ 
          width: 48, height: 48, borderRadius: 8, 
          backgroundImage: p.imageUrl ? `url(${resolveImageUrl(p.imageUrl)})` : 'none',
          backgroundSize: 'cover', backgroundPosition: 'center',
          backgroundColor: 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {!p.imageUrl && <ShoppingCart size={20} style={{ opacity: 0.3 }} />}
        </div>
      )
    },
    {
      header: 'Tên sản phẩm',
      key: 'name',
      render: (p) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link href={`/products/${p.id}`} style={{ fontWeight: 600, color: 'white', textDecoration: 'none' }}>
            {p.name}
          </Link>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.categoryName || 'Chưa phân loại'}</span>
        </div>
      )
    },
    {
      header: 'Giá áp dụng',
      key: 'appliedPrice',
      align: 'right',
      render: (p) => {
        const price = isCompanyAdmin ? p.basePrice : (p.appliedPrice !== undefined ? p.appliedPrice : p.basePrice);
        
        let oldPrice = 0;
        let ratio = 0;
        let hasDiscount = false;
        
        if (!isCompanyAdmin) {
          if (p.oldAppliedPrice && p.oldAppliedPrice > 0) {
            oldPrice = p.oldAppliedPrice;
            ratio = p.priceChangeRatio || 0;
            hasDiscount = true;
          }
        }
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <span style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{formatPrice(price || 0)}</span>
            {hasDiscount && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  {formatPrice(oldPrice)}
                </span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  padding: '1px 5px', 
                  borderRadius: 4, 
                  fontWeight: 600,
                  background: ratio < 0 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                  color: ratio < 0 ? '#2ecc71' : '#e74c3c'
                }}>
                  {ratio < 0 ? '' : '+'}{ratio.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Tồn kho',
      key: 'stockQuantity',
      align: 'center',
      render: (p) => (
        <Badge 
          label={p.stockQuantity !== undefined ? p.stockQuantity.toString() : 'N/A'} 
          type={(p.stockQuantity || 0) > 0 ? 'success' : 'warning'} 
        />
      )
    },
    {
      header: 'Loại',
      key: 'isDropship',
      align: 'center',
      render: (p) => p.isDropship ? <Badge label="Dropship" type="primary" /> : <Badge label="Standard" type="info" />
    },
    {
      header: 'Thao tác',
      key: 'actions',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Link href={`/products/${p.id}`} className="btn-outline" style={{ padding: '8px', borderRadius: 8 }}>
            <Eye size={16} />
          </Link>
          <button 
            onClick={() => {
              addToCart(p, 1);
              alert('Đã thêm vào giỏ hàng!');
            }} 
            className="btn-outline" 
            style={{ padding: '8px', borderRadius: 8, color: 'var(--accent-light)' }}
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={16} />
          </button>
          {isAuthorized && (
            <>
              <Link href={`/products/${p.id}/edit`} className="btn-outline" style={{ padding: '8px', borderRadius: 8 }}>
                <Edit size={16} />
              </Link>
              <button onClick={() => handleDelete(p.id)} className="btn-outline" style={{ padding: '8px', borderRadius: 8, color: '#ef4444' }}>
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <Navbar />
      <main style={{ padding: '20px 0' }}>
        <PageHeader 
          title="Danh sách sản phẩm" 
          subtitle="Khám phá hàng nghìn sản phẩm từ các đối tác và Người mua uy tín"
          icon="ShoppingBag"
        />

        <SearchActionHeader 
          searchQuery={search}
          onSearchChange={setSearch}
          placeholder="Tìm kiếm sản phẩm..."
          actions={
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {/* View Switcher */}
              <div style={{ 
                display: 'flex', 
                background: 'rgba(255,255,255,0.05)', 
                padding: 4, 
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                marginRight: 8
              }}>
                <button 
                  onClick={() => toggleViewMode('grid')}
                  style={{ 
                    padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: viewMode === 'grid' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: viewMode === 'grid' ? 'white' : 'rgba(255,255,255,0.4)',
                    display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                  }}
                  title="Xem dạng lưới"
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => toggleViewMode('table')}
                  style={{ 
                    padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: viewMode === 'table' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: viewMode === 'table' ? 'white' : 'rgba(255,255,255,0.4)',
                    display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                  }}
                  title="Xem dạng bảng"
                >
                  <ListIcon size={18} />
                </button>
              </div>

              {isAuthorized && (
                <Link href="/products/create" className="btn-primary" style={{ textDecoration: 'none' }}>
                  <Plus size={18} />
                  Thêm sản phẩm
                </Link>
              )}
            </div>
          }
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
            <div style={{ marginBottom: 20, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Hiển thị {filtered.length} sản phẩm</span>
              <span>Chế độ: {viewMode === 'grid' ? 'Lưới' : 'Bảng'}</span>
            </div>

            {viewMode === 'grid' ? (
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
                      {(() => {
                        const price = isCompanyAdmin ? product.basePrice : (product.appliedPrice !== undefined ? product.appliedPrice : product.basePrice);
                        let oldPrice = 0;
                        let ratio = 0;
                        let hasDiscount = false;
                        
                        if (!isCompanyAdmin) {
                          if (product.oldAppliedPrice && product.oldAppliedPrice > 0) {
                            oldPrice = product.oldAppliedPrice;
                            ratio = product.priceChangeRatio || 0;
                            hasDiscount = true;
                          }
                        }
                        
                        if (hasDiscount) {
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                                  {formatPrice(oldPrice)}
                                </span>
                                <span style={{ 
                                  fontSize: '0.65rem', 
                                  padding: '1px 5px', 
                                  borderRadius: 4, 
                                  fontWeight: 600,
                                  background: ratio < 0 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                                  color: ratio < 0 ? '#2ecc71' : '#e74c3c'
                                }}>
                                  {ratio < 0 ? '' : '+'}{ratio.toFixed(1)}%
                                </span>
                              </div>
                              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-light)' }}>
                                {formatPrice(price || 0)}
                              </span>
                            </div>
                          );
                        }
                        
                        return (
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-light)' }}>
                            {formatPrice(price || 0)}
                          </span>
                        );
                      })()}
                      
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
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Link href={`/products/${product.id}`} className="btn-outline" style={{ padding: '8px', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
                              <Eye size={16} />
                            </Link>
                            <button 
                              onClick={() => {
                                addToCart(product, 1);
                                alert('Đã thêm vào giỏ hàng!');
                              }} 
                              className="btn-primary" 
                              style={{ padding: '8px 12px', borderRadius: 8, fontSize: '0.85rem' }}
                            >
                              <ShoppingCart size={16} style={{ marginRight: 6 }} /> Thêm
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <DataTable 
                data={filtered}
                columns={tableColumns}
                loading={loading}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}

