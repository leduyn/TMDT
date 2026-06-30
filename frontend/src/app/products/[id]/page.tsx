'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { productApi, facetedSearchApi, attributeApi, ProductDTO, AttributeValueDTO, ProductPolicyPreviewDTO, PolicyEffectDTO, PriceFlowDetailsDTO } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { resolveImageUrl } from '@/lib/utils';
import Link from 'next/link';

interface EnrichedAttributeValue extends AttributeValueDTO {
  attributeName: string;
  isVariant?: boolean;
}

interface VariantInfo {
  id: number;
  attributes: Record<string, string>;
}

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const [activeProductId, setActiveProductId] = useState<number>(Number(id));
  const router = useRouter();

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [attributes, setAttributes] = useState<EnrichedAttributeValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [variants, setVariants] = useState<VariantInfo[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<Record<string, string[]>>({});
  const [resolvedPrice, setResolvedPrice] = useState<number | null>(null);
  const [agencyId, setAgencyId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'DESCRIPTION' | 'MANUAL' | 'SPECIFICATIONS'>('DESCRIPTION');
  const { user } = useAuth();
  const isCompanyAdmin = user?.roles.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  // Sync state when URL parameter changes (e.g. browser back/forward)
  useEffect(() => {
    if (id) {
      const newId = Number(id);
      if (newId !== activeProductId) {
        setProduct(null);
        setActiveProductId(newId);
      }
    }
  }, [id]);

  useEffect(() => {
    if (!activeProductId) return;

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    let currentAgencyId: number | undefined = undefined;

    const fetchAllData = async () => {
      if (!product) {
        setLoading(true);
      }
      try {
        const storedAgencyId = localStorage.getItem('agencyId');
        if (storedAgencyId) {
          currentAgencyId = Number(storedAgencyId);
          setAgencyId(currentAgencyId);
        }

        const [prodData, attrData, allAttrs] = await Promise.all([
          productApi.getById(activeProductId, currentAgencyId),
          facetedSearchApi.getProductAttributes(activeProductId).catch(() => []),
          attributeApi.getAll().catch(() => [])
        ]);

        handleProductData(prodData, attrData, allAttrs, currentAgencyId);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [activeProductId]);

  const handleProductData = (prodData: ProductDTO, attrData: any[], allAttrs: any[], curAgencyId?: number) => {
    setProduct(prodData);
    if (prodData.appliedPrice !== undefined) {
      setResolvedPrice(prodData.appliedPrice);
    }
    if (prodData.imageUrl) {
      setSelectedImage(prodData.imageUrl);
    } else if (prodData.imageUrls && prodData.imageUrls.length > 0) {
      setSelectedImage(prodData.imageUrls[0]);
    }

    const attrMap = new Map();
    const attrVariantMap = new Map();
    allAttrs.forEach((a: any) => {
      attrMap.set(a.id, a.displayName || a.name);
      attrVariantMap.set(a.id, a.isVariant);
    });

    const enrichedAttrs = attrData.map(val => ({
      ...val,
      attributeName: attrMap.get(val.attributeId) || `Thuộc tính ${val.attributeId}`,
      isVariant: attrVariantMap.get(val.attributeId)
    }));
    setAttributes(enrichedAttrs);

    const hasVariantAttrs = enrichedAttrs.some(a => a.isVariant);

    if (hasVariantAttrs && prodData.categoryId) {
      facetedSearchApi.search({ categoryId: prodData.categoryId, size: 50, agencyId: curAgencyId })
        .then(async (searchRes) => {
          const categoryProducts = searchRes.products || [];
          if (categoryProducts.length > 1) {
            const variantPromises = categoryProducts.map(async (p) => {
              const pAttrs = await facetedSearchApi.getProductAttributes(p.id).catch(() => []);
              const attrDict: Record<string, string> = {};
              pAttrs.forEach(a => {
                const isVar = attrVariantMap.get(a.attributeId);
                if (isVar) {
                  const name = attrMap.get(a.attributeId) || `Thuộc tính ${a.attributeId}`;
                  attrDict[name] = a.value;
                }
              });
              return { id: p.id, attributes: attrDict };
            });

            const resolvedVariants = await Promise.all(variantPromises);
            setVariants(resolvedVariants);

            const available: Record<string, Set<string>> = {};
            resolvedVariants.forEach(v => {
              Object.entries(v.attributes).forEach(([key, val]) => {
                if (!available[key]) available[key] = new Set();
                available[key].add(val);
              });
            });

            const availableArrays: Record<string, string[]> = {};
            Object.entries(available).forEach(([k, v]) => availableArrays[k] = Array.from(v));
            setAvailableAttributes(availableArrays);
          } else {
            setVariants([]);
            setAvailableAttributes({});
          }
        })
        .catch(e => console.error("Failed to load variants", e));
    } else {
      setVariants([]);
      setAvailableAttributes({});
    }
  };

  const handleVariantSelect = (attrName: string, val: string) => {
    const currentSelection: Record<string, string> = {};
    attributes.forEach(a => currentSelection[a.attributeName] = a.value);

    const targetSelection = { ...currentSelection, [attrName]: val };

    let bestMatch = variants.find(v => {
      if (v.attributes[attrName] !== val) return false;
      return Object.keys(targetSelection).every(key => !v.attributes[key] || v.attributes[key] === targetSelection[key]);
    });

    if (!bestMatch) {
      bestMatch = variants.find(v => v.attributes[attrName] === val);
    }

    if (bestMatch && bestMatch.id !== activeProductId) {
      setActiveProductId(bestMatch.id);
      window.history.pushState(null, '', `/products/${bestMatch.id}`);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '100px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
          Đang tải thông tin sản phẩm...
        </div>
        <style jsx>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top-color: var(--accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '100px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h3>Không thể tải sản phẩm</h3>
          <p>{error}</p>
          <Link href="/products" className="btn-outline" style={{ marginTop: 20, display: 'inline-block', textDecoration: 'none' }}>
            Quay lại danh sách
          </Link>
        </div>
      </>
    );
  }

  const formatPrice = (price: number) => {
    if (price === -1) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <>
      <Navbar />
      <Main>

        <div className="fade-in-up" style={{ marginBottom: 24 }}>
          <Link href="/products" style={{ color: 'var(--accent-light)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            ← Quay lại danh sách
          </Link>
        </div>

        <div className="product-detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>

          {/* Left: Images */}
          <div className="product-images glass-card fade-in-up" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{
              width: '100%', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden',
              backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {selectedImage ? (
                <img src={resolveImageUrl(selectedImage)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 64 }}>🛒</span>
              )}
            </div>
            {(() => {
              const allImages: string[] = [];
              if (product.imageUrl) allImages.push(product.imageUrl);
              if (product.imageUrls) {
                product.imageUrls.forEach(img => {
                  if (img !== product.imageUrl) allImages.push(img);
                });
              }

              if (allImages.length > 1) {
                return (
                  <div style={{ display: 'flex', gap: 10, marginTop: 16, overflowX: 'auto', paddingBottom: 8 }}>
                    {allImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        style={{
                          width: 80, height: 80, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                          border: selectedImage === img ? '2px solid var(--accent)' : '2px solid transparent',
                          cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)',
                          transition: 'all 0.2s',
                          opacity: selectedImage === img ? 1 : 0.6
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => { if (selectedImage !== img) e.currentTarget.style.opacity = '0.6' }}
                      >
                        <img src={resolveImageUrl(img)} alt={`${product.name} ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Right: Info */}
          <div className="product-info fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, animationDelay: '0.1s' }}>
            <div>
              {product.categoryName && <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-block' }}>{product.categoryName}</span>}
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.3 }}>{product.name}</h1>
              <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
                {product.brand && <span>Thương hiệu: <strong>{product.brand.name}</strong></span>}
                {product.productType && <span>Loại SP: <strong>{product.productType.name}</strong></span>}
                <span>Mã SP: <strong>{product.productCode || `#${product.id}`}</strong></span>
                {product.status && (
                  <span>Trạng thái: 
                    <strong style={{
                      color: product.status === 'ACTIVE' ? '#2ecc71' : 
                             product.status === 'INACTIVE' ? '#f59e0b' : '#ef4444'
                    }}>
                      {' '}{product.status === 'ACTIVE' ? 'Hoạt động' : 
                         product.status === 'INACTIVE' ? 'Ngừng HĐ' : 
                         product.status === 'DISCONTINUED' ? 'Ngừng KD' : product.status}
                    </strong>
                  </span>
                )}
              </div>
              {product.otherName && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>
                  Tên khác: <strong style={{ color: 'var(--text-secondary)' }}>{product.otherName}</strong>
                </div>
              )}
              {product.shortName && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>
                  Tên rút gọn: <strong style={{ color: 'var(--text-secondary)' }}>{product.shortName}</strong>
                </div>
              )}
            </div>

            {Object.keys(availableAttributes).length > 0 && (
              <div className="variant-selector" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                {Object.entries(availableAttributes).map(([attrName, values]) => (
                  <div key={attrName}>
                    <div style={{ fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>{attrName}</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {values.map(val => {
                        const isSelected = attributes.some(a => a.attributeName === attrName && a.value === val);
                        return (
                          <button
                            key={val}
                            onClick={() => handleVariantSelect(attrName, val)}
                            style={{
                              padding: '8px 16px', borderRadius: 8,
                              border: isSelected ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                              background: isSelected ? 'rgba(99,102,241,0.1)' : 'transparent',
                              color: isSelected ? 'var(--accent-light)' : 'var(--text-secondary)',
                              cursor: 'pointer',
                              fontWeight: isSelected ? 600 : 400,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--accent)' }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="glass-card" style={{ padding: '20px 24px', background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-light)', marginBottom: 8 }}>
                {formatPrice(isCompanyAdmin ? (product.basePrice || 0) : (resolvedPrice !== null ? resolvedPrice : (product.basePrice || 0)))}
              </div>
              {!isCompanyAdmin && resolvedPrice !== null && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {(() => {
                    let oldPrice = 0;
                    let ratio = 0;
                    let hasDiscount = false;

                    if (product.oldAppliedPrice && product.oldAppliedPrice > 0) {
                      oldPrice = product.oldAppliedPrice;
                      ratio = product.priceChangeRatio || 0;
                      hasDiscount = true;
                    }

                    if (hasDiscount) {
                      return (
                        <>
                          <span style={{ textDecoration: 'line-through' }}>{formatPrice(oldPrice)}</span>
                          <span className="badge" style={{
                            fontSize: '0.75rem',
                            padding: '1px 5px',
                            borderRadius: 4,
                            fontWeight: 600,
                            background: ratio < 0 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                            color: ratio < 0 ? '#2ecc71' : '#e74c3c'
                          }}>
                            {ratio < 0 ? '' : '+'}{ratio.toFixed(1)}%
                          </span>
                        </>
                      );
                    }

                    return null;
                  })()}
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    Áp dụng: {product.appliedPriceListName || 'Bảng giá hệ thống'} (ID: {product.appliedPriceListId})
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: '0.95rem', flexWrap: 'wrap' }}>
                {product.unit && <span>Đơn vị: <strong>{product.unit}</strong></span>}
                {product.innerPackaging && <span>Quy cách: <strong>{product.innerPackaging}</strong></span>}
                {product.outerPackaging && <span>Thùng: <strong>{product.outerPackaging}</strong></span>}
                {product.retailWarrantyPeriod && <span>BH bán thường: <strong>{product.retailWarrantyPeriod}</strong></span>}
                {product.wholesaleWarrantyPeriod && <span>BH bán sỉ: <strong>{product.wholesaleWarrantyPeriod}</strong></span>}
              </div>
              {product.isDropship && product.dropshipPrice && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 12 }}>
                  Giá Dropship: <span style={{ color: '#10b981', fontWeight: 600 }}>{formatPrice(product.dropshipPrice)}</span>
                </div>
              )}
              {isCompanyAdmin && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Dành cho Admin</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fca5a5' }}>
                    Giá gốc (Base Price): {formatPrice(product.basePrice || 0)}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {product.policyPreview && (
          <PricingBreakdown
            preview={product.policyPreview}
            retailEligible={!!(
              product.retailPriceEligible ||
              (product.policyPreview.retailFlow?.originalPrice !== undefined &&
                product.policyPreview.retailFlow.originalPrice !== product.policyPreview.wholesaleFlow.originalPrice)
            )}
            formatPrice={formatPrice}
          />
        )}

        <div className="product-info fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, animationDelay: '0.1s' }}>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span className={`badge ${product.stockQuantity && product.stockQuantity > 0 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
              {product.stockQuantity && product.stockQuantity > 0 ? `Còn hàng (${product.stockQuantity})` : 'Hết hàng'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 4 }}>
              <button className="icon-btn" style={{ padding: '8px 12px' }}>-</button>
              <input
                type="number"
                defaultValue={product.minPurchaseQuantity || 1}
                min={product.minPurchaseQuantity || 1}
                step={product.quantityStep || 1}
                style={{ width: 50, textAlign: 'center', background: 'transparent', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 600 }}
              />
              <button className="icon-btn" style={{ padding: '8px 12px' }}>+</button>
            </div>
            <button
              className="btn-primary"
              style={{ flex: 1, padding: '14px', fontSize: '1rem' }}
              disabled={!(product.stockQuantity && product.stockQuantity > 0) || (resolvedPrice !== null ? resolvedPrice : product.basePrice) === -1}
            >
              🛒 Thêm vào giỏ hàng
            </button>
          </div>

        </div>

        <div className="fade-in-up" style={{ marginTop: 48, animationDelay: '0.2s' }}>
          {/* Tab Headers */}
          <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('DESCRIPTION')}
              style={{
                padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer',
                color: activeTab === 'DESCRIPTION' ? 'var(--accent-light)' : 'var(--text-muted)',
                fontWeight: 700, fontSize: '1.1rem',
                borderBottom: activeTab === 'DESCRIPTION' ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap'
              }}
            >
              Mô tả sản phẩm
            </button>
            {product.userManual && (
              <button
                onClick={() => setActiveTab('MANUAL')}
                style={{
                  padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer',
                  color: activeTab === 'MANUAL' ? 'var(--accent-light)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '1.1rem',
                  borderBottom: activeTab === 'MANUAL' ? '3px solid var(--accent)' : '3px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap'
                }}
              >
                Hướng dẫn sử dụng
              </button>
            )}
            {attributes.length > 0 && (
              <button
                onClick={() => setActiveTab('SPECIFICATIONS')}
                style={{
                  padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer',
                  color: activeTab === 'SPECIFICATIONS' ? 'var(--accent-light)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '1.1rem',
                  borderBottom: activeTab === 'SPECIFICATIONS' ? '3px solid var(--accent)' : '3px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap'
                }}
              >
                Thông số kỹ thuật
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="tab-content fade-in" key={activeTab} style={{ minHeight: 200 }}>
            {activeTab === 'DESCRIPTION' && (
              <div className="product-description">
                {product.description ? (
                  <div
                    className="rich-text-content"
                    style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Chưa có mô tả chi tiết cho sản phẩm này.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'MANUAL' && product.userManual && (
              <div className="product-manual">
                <div
                  className="rich-text-content"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}
                  dangerouslySetInnerHTML={{ __html: product.userManual }}
                />
              </div>
            )}

            {activeTab === 'SPECIFICATIONS' && attributes.length > 0 && (
              <div className="product-attributes">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {attributes.map(attr => (
                    <div key={attr.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{attr.attributeName}</span>
                      <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '1rem' }}>{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </Main>

      <style jsx>{`
        @media (max-width: 768px) {
          .product-detail-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

function PricingBreakdown({ preview, retailEligible, formatPrice: fmt }: {
  preview: ProductPolicyPreviewDTO;
  retailEligible: boolean;
  formatPrice: (p: number) => string;
}) {
  const wf = preview.wholesaleFlow;
  const rf = preview.retailFlow;
  const allPromotions = preview.promotions || [];

  const policyNames = (list: PolicyEffectDTO[]) => list.map(p => p.name).join(', ');

  return (
    <div className="glass-card" style={{ marginTop: 24, padding: '24px 28px', background: 'rgba(16,185,129,0.03)', borderColor: 'rgba(16,185,129,0.15)', width: '100%' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 20 }}>
        Chi tiết giá &amp; ưu đãi
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: retailEligible ? '1fr 1fr' : '1fr', gap: 28 }}>
        <PriceFlow
          title="GIÁ BÁN (Bán buôn)"
          titleColor="var(--accent-light)"
          icon="📦"
          flow={wf}
          fmt={fmt}
          policyNames={policyNames}
        />

        {retailEligible && (
          <PriceFlow
            title="GIÁ BÁN LẺ (Bán lẻ)"
            titleColor="#f59e0b"
            icon="🏪"
            flow={rf}
            fmt={fmt}
            policyNames={policyNames}
          />
        )}
      </div>

      {allPromotions.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f59e0b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏷️</span> Chương trình khuyến mãi
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allPromotions.map((p, i) => (
              <PolicyDetailCard key={`prom-${p.id}-${i}`} policy={p} fmt={fmt} type="CTKM" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PriceFlow({ title, titleColor, icon, flow, fmt, policyNames }: {
  title: string;
  titleColor: string;
  icon: string;
  flow: PriceFlowDetailsDTO;
  fmt: (p: number) => string;
  policyNames: (list: PolicyEffectDTO[]) => string;
}) {
  const hasPolicy = flow.appliedPolicies.length > 0;
  const hasPromotion = flow.appliedPromotions.length > 0;

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: '1rem', color: titleColor, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{icon}</span> {title}
      </div>
      <PriceFlowRow label="Giá" value={flow.originalPrice} fmt={fmt} isBold />
      {hasPolicy && (
        <PriceFlowRow
          label="→ Ưu đãi CSBH"
          value={flow.policyDiscount}
          fmt={fmt}
          color="#10b981"
          note={policyNames(flow.appliedPolicies)}
        />
      )}
      <PriceFlowRow label="→ Sau CSBH" value={flow.priceAfterPolicy} fmt={fmt} isSub />
      {hasPromotion && (
        <PriceFlowRow
          label="→ Khuyến mãi"
          value={flow.promotionDiscount}
          fmt={fmt}
          color="#f59e0b"
          note={policyNames(flow.appliedPromotions)}
        />
      )}
      <PriceFlowRow label="→ Sau CTKM" value={flow.finalPrice} fmt={fmt} isBold accent />

      {/* Mốc áp dụng - visible policy milestones */}
      {(hasPolicy || hasPromotion) && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>
            Mốc áp dụng
          </div>
          {flow.appliedPolicies.map((p: PolicyEffectDTO, i: number) => (
            <PolicyDetailCard key={`p-${p.id}-${i}`} policy={p} fmt={fmt} type="CSBH" />
          ))}
          {flow.appliedPromotions.map((p: PolicyEffectDTO, i: number) => (
            <PolicyDetailCard key={`prom-${p.id}-${i}`} policy={p} fmt={fmt} type="CTKM" />
          ))}
        </div>
      )}
    </div>
  );
}

function PriceFlowRow({ label, value, fmt, color, note, isBold, isSub, accent }: {
  label: string;
  value: number;
  fmt: (p: number) => string;
  color?: string;
  note?: string;
  isBold?: boolean;
  isSub?: boolean;
  accent?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 0', fontSize: isBold ? '1rem' : '0.9rem',
      fontWeight: isBold ? 700 : 400,
      color: accent ? 'var(--accent-light)' : isSub ? 'var(--text-secondary)' : 'var(--text-primary)',
      borderBottom: '1px solid rgba(255,255,255,0.04)'
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {label}
        {note && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({note})</span>}
      </span>
      <span style={{ color: color || undefined }}>
        {fmt(value)}
      </span>
    </div>
  );
}

function PolicyDetailCard({ policy: p, fmt, type }: { policy: PolicyEffectDTO; fmt: (p: number) => string; type: string }) {
  const adjDisplay = p.adjustmentType === 'PERCENTAGE'
    ? `${p.adjustmentValue}%`
    : p.adjustmentType === 'FIXED_AMOUNT'
      ? fmt(p.adjustmentValue)
      : p.adjustmentType === 'SPECIFIC_PRICE'
        ? fmt(p.adjustmentValue)
        : `${p.adjustmentValue}`;

  const isMet = p.conditionMet === true;
  const isNotMet = p.conditionMet === false;
  const isPending = p.conditionMet === null || p.conditionMet === undefined;

  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      border: '1px solid',
      borderColor: isMet ? 'rgba(16,185,129,0.35)' : isNotMet ? 'rgba(239,68,68,0.25)' : 'rgba(148,163,184,0.2)',
      background: isMet ? 'rgba(16,185,129,0.06)' : isNotMet ? 'rgba(239,68,68,0.04)' : 'rgba(148,163,184,0.03)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isMet ? '#10b981' : isNotMet ? '#ef4444' : '#94a3b8',
            flexShrink: 0,
          }} />
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isMet ? '#10b981' : isNotMet ? '#ef4444' : 'var(--text-secondary)' }}>
            {type}
          </span>
          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            {p.name}
          </span>
        </div>
        <span style={{
          fontWeight: 700, fontSize: '0.8rem',
          color: isMet ? '#10b981' : isNotMet ? '#ef4444' : '#94a3b8',
        }}>
          {isMet ? 'Áp dụng' : isNotMet ? 'Chưa đạt' : 'Chờ xét'}
        </span>
      </div>

      {/* Details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span style={{ color: 'var(--text-muted)' }}>Loại ưu đãi:</span>
        <span>{p.adjustmentType === 'PERCENTAGE' ? 'Phần trăm' : p.adjustmentType === 'FIXED_AMOUNT' ? 'Số tiền cố định' : p.adjustmentType === 'SPECIFIC_PRICE' ? 'Giá cụ thể' : p.adjustmentType || 'N/A'}</span>

        <span style={{ color: 'var(--text-muted)' }}>Giá trị:</span>
        <span style={{ fontWeight: 600, color: (p.adjustmentValue || 0) < 0 ? '#10b981' : '#f59e0b' }}>
          {p.adjustmentValue < 0 ? 'Giảm ' : 'Tăng '}{adjDisplay}
        </span>

        {p.conditionText && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>Điều kiện:</span>
            <span>{p.conditionText}</span>
          </>
        )}

        {p.conditionNote && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>Ghi chú:</span>
            <span>{p.conditionNote}</span>
          </>
        )}

        {p.giftProductName && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>🎁 Quà tặng:</span>
            <span style={{ fontWeight: 600, color: '#10b981' }}>{p.giftProductName} {p.giftQuantity ? `(x${p.giftQuantity})` : ''}</span>
          </>
        )}
      </div>

      {/* Price change row */}
      {p.adjustedPrice !== undefined && p.originalPrice !== undefined && (
        <div style={{
          marginTop: 4, padding: '6px 10px', borderRadius: 6,
          background: 'rgba(0,0,0,0.15)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '0.8rem',
        }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {fmt(p.originalPrice)}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{ fontWeight: 700, color: isMet ? '#10b981' : 'var(--text-secondary)' }}>
            {fmt(p.adjustedPrice)}
          </span>
        </div>
      )}
    </div>
  );
}
