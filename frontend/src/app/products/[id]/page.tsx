'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { productApi, facetedSearchApi, attributeApi, ProductDTO, AttributeValueDTO } from '@/lib/api';
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
  const productId = Number(id);
  const router = useRouter();

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [attributes, setAttributes] = useState<EnrichedAttributeValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [variants, setVariants] = useState<VariantInfo[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!productId) return;
    
    Promise.all([
      productApi.getById(productId),
      facetedSearchApi.getProductAttributes(productId).catch(() => []),
      attributeApi.getAll().catch(() => [])
    ])
    .then(([prodData, attrData, allAttrs]) => {
      setProduct(prodData);
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

      if (prodData.categoryId) {
        facetedSearchApi.search({ categoryId: prodData.categoryId, size: 50 })
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
            }
          })
          .catch(e => console.error("Failed to load variants", e));
      }
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
  }, [productId]);

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
    
    if (bestMatch && bestMatch.id !== productId) {
      router.push(`/products/${bestMatch.id}`);
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px' }}>
        
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
                        onMouseLeave={(e) => { if(selectedImage !== img) e.currentTarget.style.opacity = '0.6' }}
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
                 <span>Mã SP: #{product.id}</span>
              </div>
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
                {formatPrice(product.basePrice || 0)}
              </div>
              <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {product.unit && <span>Đơn vị: <strong>{product.unit}</strong></span>}
                {product.innerPackaging && <span>Quy cách: <strong>{product.innerPackaging}</strong></span>}
                {product.outerPackaging && <span>Thùng: <strong>{product.outerPackaging}</strong></span>}
              </div>
              {product.isDropship && product.dropshipPrice && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 12 }}>
                  Giá Dropship: <span style={{ color: '#10b981', fontWeight: 600 }}>{formatPrice(product.dropshipPrice)}</span>
                </div>
              )}
            </div>

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
              <button className="btn-primary" style={{ flex: 1, padding: '14px', fontSize: '1rem' }} disabled={!(product.stockQuantity && product.stockQuantity > 0)}>
                🛒 Thêm vào giỏ hàng
              </button>
            </div>

            <div className="product-description" style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Mô tả sản phẩm</h3>
              {product.description ? (
                <div 
                  className="rich-text-content"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={{ __html: product.description }} 
                />
              ) : (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  Chưa có mô tả chi tiết cho sản phẩm này.
                </p>
              )}
            </div>

            {product.userManual && (
              <div className="product-manual" style={{ marginTop: 10 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Hướng dẫn sử dụng</h3>
                <div 
                  className="rich-text-content"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={{ __html: product.userManual }} 
                />
              </div>
            )}

            {attributes.length > 0 && (
              <div className="product-attributes" style={{ marginTop: 10 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Thông số kỹ thuật</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {attributes.map(attr => (
                    <li key={attr.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{attr.attributeName}</span>
                      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{attr.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      </main>

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
