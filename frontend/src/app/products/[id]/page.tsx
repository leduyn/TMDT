'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { productApi, facetedSearchApi, attributeApi, ProductDTO, AttributeValueDTO } from '@/lib/api';
import { resolveImageUrl } from '@/lib/utils';
import Link from 'next/link';

interface EnrichedAttributeValue extends AttributeValueDTO {
  attributeName: string;
}

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const productId = Number(id);

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [attributes, setAttributes] = useState<EnrichedAttributeValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      allAttrs.forEach((a: any) => attrMap.set(a.id, a.displayName || a.name));
      
      const enrichedAttrs = attrData.map(val => ({
        ...val,
        attributeName: attrMap.get(val.attributeId) || `Thuộc tính ${val.attributeId}`
      }));
      setAttributes(enrichedAttrs);
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
  }, [productId]);

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
              <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                 {product.brand && <span>Thương hiệu: <strong>{product.brand.name}</strong></span>}
                 <span>Mã SP: #{product.id}</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px 24px', background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-light)', marginBottom: 8 }}>
                {formatPrice(product.basePrice || 0)}
              </div>
              {product.isDropship && product.dropshipPrice && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Giá Dropship: <span style={{ color: '#10b981', fontWeight: 600 }}>{formatPrice(product.dropshipPrice)}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span className={`badge ${product.stockQuantity && product.stockQuantity > 0 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                {product.stockQuantity && product.stockQuantity > 0 ? `Còn hàng (${product.stockQuantity})` : 'Hết hàng'}
              </span>
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
