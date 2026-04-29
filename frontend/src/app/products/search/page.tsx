'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import FacetPanel from '@/components/FacetPanel';
import {
  facetedSearchApi,
  categoryApi,
  FacetedSearchResponse,
  FacetGroupDTO,
  ProductDTO,
  CategoryDTO,
} from '@/lib/api';

export default function FacetedSearchPage() {
  const [response, setResponse] = useState<FacetedSearchResponse | null>(null);
  const [selectedValueIds, setSelectedValueIds] = useState<Set<number>>(new Set());
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // Load categories
  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(console.error);
  }, []);

  // Faceted search
  const doSearch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await facetedSearchApi.search({
        categoryId,
        selectedValueIds: Array.from(selectedValueIds),
        page,
        size: pageSize,
      });
      setResponse(result);
    } catch (err) {
      console.error('Faceted search failed:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, selectedValueIds, page]);

  useEffect(() => {
    doSearch();
  }, [doSearch]);

  const handleToggleValue = (valueId: number) => {
    setSelectedValueIds((prev) => {
      const next = new Set(prev);
      if (next.has(valueId)) {
        next.delete(valueId);
      } else {
        next.add(valueId);
      }
      return next;
    });
    setPage(0);
  };

  const handleClearAll = () => {
    setSelectedValueIds(new Set());
    setPage(0);
  };

  const handleCategoryChange = (catId: number | undefined) => {
    setCategoryId(catId);
    setSelectedValueIds(new Set());
    setPage(0);
  };

  const totalPages = response ? Math.ceil(response.totalCount / pageSize) : 0;
  const products = response?.products ?? [];
  const facets = response?.facets ?? [];

  const formatPrice = (price?: number) => {
    if (!price) return '—';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <>
      <Navbar />
      <div className="search-page bg-grid">
        {/* Hero */}
        <div className="search-hero">
          <h1 className="search-hero__title">
            <span className="gradient-text">Tìm kiếm sản phẩm</span>
          </h1>
          <p className="search-hero__subtitle">
            Sử dụng bộ lọc thông minh để tìm sản phẩm phù hợp nhất
          </p>

          {/* Category selector */}
          <div className="search-hero__categories">
            <button
              className={`category-chip ${!categoryId ? 'category-chip--active' : ''}`}
              onClick={() => handleCategoryChange(undefined)}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-chip ${categoryId === cat.id ? 'category-chip--active' : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="search-layout">
          {/* Sidebar — Facets */}
          <div className="search-sidebar">
            <FacetPanel
              facets={facets}
              selectedValueIds={selectedValueIds}
              onToggleValue={handleToggleValue}
              onClearAll={handleClearAll}
              loading={loading}
            />
          </div>

          {/* Products grid */}
          <div className="search-content">
            {/* Result count & active filters */}
            <div className="search-toolbar">
              <div className="search-toolbar__info">
                <span className="search-toolbar__count">
                  {response?.totalCount ?? 0} sản phẩm
                </span>
                {selectedValueIds.size > 0 && (
                  <span className="search-toolbar__filter-count">
                    {selectedValueIds.size} bộ lọc đang chọn
                  </span>
                )}
              </div>

              {/* Active filter tags */}
              {selectedValueIds.size > 0 && (
                <div className="search-toolbar__tags">
                  {facets.map((group) =>
                    group.values
                      .filter((v) => selectedValueIds.has(v.valueId))
                      .map((v) => (
                        <button
                          key={v.valueId}
                          className="filter-tag"
                          onClick={() => handleToggleValue(v.valueId)}
                        >
                          {group.displayName}: {v.value}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div className="search-loading">
                <div className="spinner" />
                <span>Đang tìm kiếm...</span>
              </div>
            )}

            {/* Empty state */}
            {!loading && products.length === 0 && (
              <div className="search-empty">
                <div className="search-empty__icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Thử thay đổi bộ lọc hoặc xoá bớt tiêu chí tìm kiếm</p>
                {selectedValueIds.size > 0 && (
                  <button className="btn-outline" onClick={handleClearAll}>
                    Xoá tất cả bộ lọc
                  </button>
                )}
              </div>
            )}

            {/* Product grid */}
            {!loading && products.length > 0 && (
              <div className="product-grid">
                {products.map((product, idx) => (
                  <div
                    key={product.id}
                    className="product-card fade-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="product-card__image">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} />
                      ) : (
                        <div className="product-card__placeholder">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                      {product.isDropship && (
                        <span className="badge badge-primary product-card__badge">
                          Dropship
                        </span>
                      )}
                    </div>

                    <div className="product-card__body">
                      {product.categoryName && (
                        <span className="product-card__category">{product.categoryName}</span>
                      )}
                      <h3 className="product-card__name">{product.name}</h3>
                      <div className="product-card__pricing">
                        <span className="product-card__price">
                          {formatPrice(product.basePrice)}
                        </span>
                        {product.dropshipPrice && (
                          <span className="product-card__dropship-price">
                            DS: {formatPrice(product.dropshipPrice)}
                          </span>
                        )}
                      </div>
                      <div className="product-card__meta">
                        <span className={`product-card__stock ${(product.stockQuantity ?? 0) > 0 ? '' : 'product-card__stock--out'}`}>
                          {(product.stockQuantity ?? 0) > 0 ? `Còn ${product.stockQuantity}` : 'Hết hàng'}
                        </span>
                        {product.brand && (
                          <span className="product-card__brand">{product.brand.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="search-pagination">
                <button
                  className="pagination-btn"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  ← Trước
                </button>
                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`pagination-page ${page === i ? 'pagination-page--active' : ''}`}
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="pagination-btn"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Sau →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .search-page {
          min-height: 100vh;
          padding-bottom: 60px;
        }

        /* ─── Hero ─────────────────────────────────────────────────────────── */
        .search-hero {
          text-align: center;
          padding: 48px 24px 32px;
        }

        .search-hero__title {
          font-size: 2.2rem;
          font-weight: 700;
          margin: 0 0 8px;
        }

        .search-hero__subtitle {
          color: #94a3b8;
          font-size: 1rem;
          margin: 0 0 24px;
        }

        .search-hero__categories {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          max-width: 800px;
          margin: 0 auto;
        }

        .category-chip {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .category-chip:hover {
          border-color: rgba(129, 140, 248, 0.3);
          color: #e2e8f0;
          background: rgba(129, 140, 248, 0.08);
        }

        .category-chip--active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-color: transparent;
          color: white;
        }

        .category-chip--active:hover {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
        }

        /* ─── Layout ───────────────────────────────────────────────────────── */
        .search-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .search-sidebar {
          position: sticky;
          top: 80px;
          height: fit-content;
        }

        /* ─── Toolbar ──────────────────────────────────────────────────────── */
        .search-toolbar {
          margin-bottom: 20px;
        }

        .search-toolbar__info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .search-toolbar__count {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .search-toolbar__filter-count {
          font-size: 12px;
          color: #818cf8;
          background: rgba(129, 140, 248, 0.1);
          padding: 4px 10px;
          border-radius: 12px;
        }

        .search-toolbar__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .filter-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(129, 140, 248, 0.12);
          border: 1px solid rgba(129, 140, 248, 0.2);
          color: #a5b4fc;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-tag:hover {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        /* ─── Loading ──────────────────────────────────────────────────────── */
        .search-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 80px 20px;
          color: #94a3b8;
          font-size: 14px;
        }

        /* ─── Empty ────────────────────────────────────────────────────────── */
        .search-empty {
          text-align: center;
          padding: 80px 20px;
        }

        .search-empty__icon {
          color: #334155;
          margin-bottom: 16px;
        }

        .search-empty h3 {
          color: #e2e8f0;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px;
        }

        .search-empty p {
          color: #64748b;
          font-size: 14px;
          margin: 0 0 20px;
        }

        /* ─── Product Grid ─────────────────────────────────────────────────── */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        .product-card {
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
        }

        .product-card__image {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: rgba(255, 255, 255, 0.02);
          overflow: hidden;
        }

        .product-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-card__image img {
          transform: scale(1.05);
        }

        .product-card__placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #334155;
        }

        .product-card__badge {
          position: absolute;
          top: 10px;
          right: 10px;
        }

        .product-card__body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-card__category {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #818cf8;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .product-card__name {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 10px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card__pricing {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 10px;
        }

        .product-card__price {
          font-size: 16px;
          font-weight: 700;
          color: #f1f5f9;
        }

        .product-card__dropship-price {
          font-size: 12px;
          color: #64748b;
        }

        .product-card__meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .product-card__stock {
          font-size: 12px;
          color: #10b981;
          font-weight: 500;
        }

        .product-card__stock--out {
          color: #ef4444;
        }

        .product-card__brand {
          font-size: 11px;
          color: #64748b;
          background: rgba(255, 255, 255, 0.04);
          padding: 2px 8px;
          border-radius: 6px;
        }

        /* ─── Pagination ───────────────────────────────────────────────────── */
        .search-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 32px;
          padding: 20px 0;
        }

        .pagination-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: rgba(129, 140, 248, 0.3);
          color: #e2e8f0;
        }

        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          gap: 4px;
        }

        .pagination-page {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #94a3b8;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pagination-page:hover {
          border-color: rgba(129, 140, 248, 0.3);
          color: #e2e8f0;
        }

        .pagination-page--active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-color: transparent;
          color: white;
        }

        /* ─── Responsive ───────────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .search-layout {
            grid-template-columns: 1fr;
          }

          .search-sidebar {
            position: static;
          }

          .search-hero__title {
            font-size: 1.6rem;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }
        }
      `}</style>
    </>
  );
}
