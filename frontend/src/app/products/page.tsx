'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { productApi, categoryApi, ProductDTO, PageResponse, CategoryDTO } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { resolveImageUrl } from '@/lib/utils';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import DataTable, { Column } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
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
  ExternalLink,
  Upload,
} from 'lucide-react';

export default function ProductsPage() {
  const [pageData, setPageData] = useState<PageResponse<ProductDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [categoryOptions, setCategoryOptions] = useState<CategoryDTO[][]>([[], [], [], []]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<(number | undefined)[]>([undefined, undefined, undefined, undefined]);
  const [levelNames, setLevelNames] = useState<string[]>(['Ngành hàng', 'Nhóm hàng', 'Loại SP', 'Dòng SP']);
  const [categoryFilterId, setCategoryFilterId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const savedMode = localStorage.getItem('productViewMode');
    if (savedMode === 'table' || savedMode === 'grid') {
      setViewMode(savedMode);
    }
  }, []);

  const fetchPage = useCallback(async (p: number, s: string, ps: number, catId?: number) => {
    setLoading(true);
    try {
      let currentAgencyId: number | undefined = undefined;
      const storedAgencyId = localStorage.getItem('agencyId');
      if (storedAgencyId) {
        currentAgencyId = Number(storedAgencyId);
      }
      const data = await productApi.getPage({
        page: p,
        size: ps,
        search: s || undefined,
        agencyId: currentAgencyId,
        categoryId: catId,
      });
      setPageData(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    categoryApi.getByLevel(0).then(data => {
      setCategoryOptions(prev => { const next = [...prev]; next[0] = data; return next; });
    }).catch(() => {});
    categoryApi.getLevelNames().then(names => {
      const labels = [...levelNames];
      if (names) { for (let i = 0; i <= 3; i++) { if (names[i]) labels[i] = names[i]; } }
      setLevelNames(labels);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(0);
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCategoryChange = useCallback(async (level: number, catId: number | undefined) => {
    setSelectedCategoryIds(prev => {
      const next = [...prev];
      next[level] = catId;
      for (let l = level + 1; l < next.length; l++) next[l] = undefined;
      return next;
    });
    setCategoryOptions(prev => {
      const next = [...prev];
      for (let l = level + 1; l < next.length; l++) next[l] = [];
      return next;
    });
    if (catId && level < 3) {
      try {
        const children = await categoryApi.getChildren(catId);
        setCategoryOptions(prev => {
          const next = [...prev];
          next[level + 1] = children;
          return next;
        });
      } catch (err) {
        console.error('Failed to fetch children:', err);
      }
    }
    setCategoryFilterId(catId);
    setPage(0);
  }, []);

  const clearCategoryFilter = useCallback(() => {
    setSelectedCategoryIds([undefined, undefined, undefined, undefined]);
    setCategoryOptions(prev => {
      const next = [...prev];
      for (let i = 1; i < next.length; i++) next[i] = [];
      return next;
    });
    setCategoryFilterId(undefined);
    setPage(0);
  }, []);

  useEffect(() => {
    fetchPage(page, debouncedSearch, pageSize, categoryFilterId);
  }, [page, pageSize, debouncedSearch, categoryFilterId, fetchPage]);

  const toggleViewMode = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('productViewMode', mode);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xoá sản phẩm này?')) return;
    try {
      await productApi.delete(id);
      fetchPage(page, debouncedSearch, pageSize, categoryFilterId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isAuthorized = user?.roles.some(r => ['ROLE_COMPANY', 'ROLE_AGENCY', 'ROLE_ADMIN'].includes(r));
  const isCompanyAdmin = user?.roles.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  const products = pageData?.content || [];
  const totalPages = pageData?.totalPages || 1;
  const totalElements = pageData?.totalElements || 0;

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
          {p.productCode && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mã: {p.productCode}</span>}
        </div>
      )
    },
    {
      header: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (p) => {
        if (p.status === 'ACTIVE') return <Badge label="Hoạt động" type="success" />;
        if (p.status === 'INACTIVE') return <Badge label="Ngừng HĐ" type="warning" />;
        if (p.status === 'DISCONTINUED') return <Badge label="Ngừng KD" type="error" />;
        return <Badge label="N/A" type="info" />;
      }
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
      <Main>
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
                <>
                  <Link href="/products/create" className="btn-primary" style={{ textDecoration: 'none' }}>
                    <Plus size={18} />
                    Thêm sản phẩm
                  </Link>
                  <Link href="/products/import" className="btn-outline" style={{ textDecoration: 'none' }}>
                    <Upload size={18} />
                    Import Excel
                  </Link>
                </>
              )}
            </div>
          }
        />

        {/* Category Filter */}
        <GlassCard style={{ padding: '12px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'middle' }}>
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
              </svg>
              Danh mục:
            </span>
            {categoryOptions.map((options, level) => (
              <SearchableSelect
                key={level}
                options={options.map(c => ({ value: c.id, label: c.name }))}
                value={selectedCategoryIds[level]}
                onChange={(val) => handleCategoryChange(level, val !== undefined ? Number(val) : undefined)}
                placeholder={levelNames[level] || `Cấp ${level}`}
                disabled={level > 0 && (selectedCategoryIds[level - 1] === undefined || categoryOptions[level - 1].length === 0)}
                style={{ minWidth: 150, flex: '0 1 auto' }}
              />
            ))}
            {categoryFilterId !== undefined && (
              <button
                onClick={clearCategoryFilter}
                className="btn-outline"
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', whiteSpace: 'nowrap', marginLeft: 4 }}
              >
                Xoá bộ lọc
              </button>
            )}
          </div>
        </GlassCard>

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
            <button onClick={() => fetchPage(page, debouncedSearch, pageSize, categoryFilterId)} className="btn-outline" style={{ marginTop: 20 }}>Thử lại</button>
          </GlassCard>
        ) : products.length === 0 ? (
          <GlassCard style={{ padding: '80px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}><Package size={64} style={{ margin: '0 auto' }} /></div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              {search ? 'Không tìm thấy sản phẩm nào phù hợp' : 'Hệ thống chưa có sản phẩm nào'}
            </p>
          </GlassCard>
        ) : (
          <>
            <div style={{ marginBottom: 20, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Hiển thị {totalElements} sản phẩm</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>Chế độ: {viewMode === 'grid' ? 'Lưới' : 'Bảng'}</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPage(0); setPageSize(Number(e.target.value)); }}
                  style={{
                    padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                    fontSize: '0.8rem', cursor: 'pointer'
                  }}
                >
                  <option value={12}>12 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                  <option value={100}>100 / trang</option>
                </select>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 24,
              }}>
                {products.map((product, i) => (
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
                      {product.productCode && <Badge label={`Mã: ${product.productCode}`} type="info" />}
                      {product.status === 'ACTIVE' ? <Badge label="Hoạt động" type="success" /> :
                       product.status === 'INACTIVE' ? <Badge label="Ngừng HĐ" type="warning" /> :
                       product.status === 'DISCONTINUED' ? <Badge label="Ngừng KD" type="error" /> : null}
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
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            ) : (
              <DataTable 
                data={products}
                columns={tableColumns}
                loading={loading}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Main>
    </>
  );
}

