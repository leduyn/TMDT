'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { categoryApi, productApi, CategoryDTO, ProductDTO, PageResponse } from '@/lib/api';
import { resolveImageUrl } from '@/lib/utils';
import Pagination from './ui/Pagination';
import GlassCard from './ui/GlassCard';
import { Search, ChevronRight, Package, Plus, X } from 'lucide-react';

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyId: number;
  onAddToCart: (product: ProductDTO) => void;
}

interface TreeNode {
  category: CategoryDTO;
  children: TreeNode[];
  depth: number;
}

function CategoryTreeItem({ node, expandedIds, onToggle, selectedId, onSelect, searchQuery }: {
  node: TreeNode;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  selectedId: number | null;
  onSelect: (cat: CategoryDTO) => void;
  searchQuery: string;
}) {
  const { category: c, children } = node;
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(c.id);
  const isActive = selectedId === c.id;

  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ background: 'rgba(251,191,36,0.3)', borderRadius: 3, padding: '0 2px' }}>{text.slice(idx, idx + searchQuery.length)}</span>
        {text.slice(idx + searchQuery.length)}
      </>
    );
  };

  return (
    <>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '7px 10px', paddingLeft: 10 + (c.level ?? 0) * 16,
          borderBottom: '1px solid rgba(255,255,255,0.03)',
          cursor: 'pointer', transition: 'all 0.15s',
          borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
          background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
          fontSize: '0.82rem',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
        onClick={() => onSelect(c)}
      >
        <div
          onClick={(e) => { e.stopPropagation(); hasChildren && onToggle(c.id); }}
          style={{
            width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, visibility: hasChildren ? 'visible' : 'hidden',
            color: 'var(--text-muted)', transition: 'transform 0.2s',
            transform: isExpanded ? 'rotate(90deg)' : 'none',
          }}
        >
          <ChevronRight size={12} />
        </div>
        <span style={{ flex: 1, fontWeight: (c.level ?? 0) === 0 ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {highlightText(c.name)}
        </span>
      </div>
      {hasChildren && isExpanded && children.map(child => (
        <CategoryTreeItem key={child.category.id} node={child} expandedIds={expandedIds} onToggle={onToggle} selectedId={selectedId} onSelect={onSelect} searchQuery={searchQuery} />
      ))}
    </>
  );
}

export default function ProductPickerModal({ isOpen, onClose, agencyId, onAddToCart }: ProductPickerModalProps) {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [productData, setProductData] = useState<PageResponse<ProductDTO> | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productPage, setProductPage] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [catSearch, setCatSearch] = useState('');
  const [prodSearch, setProdSearch] = useState('');
  const [initialized, setInitialized] = useState(false);
  const openedOnce = useRef(false);
  const pageSize = 12;

  useEffect(() => {
    if (!isOpen || initialized) return;
    openedOnce.current = true;
    setLoading(true);
    Promise.all([
      categoryApi.getAll(),
      categoryApi.getLevelNames(),
    ]).then(([cats]) => {
      setCategories(cats);
      setInitialized(true);
    }).finally(() => setLoading(false));
  }, [isOpen, initialized]);

  const loadProducts = useCallback((catId: number | null, page: number, search: string) => {
    setProductLoading(true);
    const params: any = { page, size: pageSize, agencyId };
    if (catId !== null) params.categoryId = catId;
    if (search.trim()) params.search = search.trim();
    productApi.getPage(params)
      .then(setProductData)
      .catch(() => setProductData(null))
      .finally(() => setProductLoading(false));
  }, [agencyId]);

  useEffect(() => {
    if (!isOpen) return;
    setProductPage(0);
    loadProducts(selectedCategoryId, 0, prodSearch);
  }, [selectedCategoryId, prodSearch, isOpen, loadProducts]);

  useEffect(() => {
    if (!isOpen) return;
    loadProducts(selectedCategoryId, productPage, prodSearch);
  }, [productPage, isOpen, loadProducts]);

  const buildTree = useCallback((): TreeNode[] => {
    const map = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];
    const sorted = [...categories].sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
    for (const cat of sorted) {
      const node: TreeNode = { category: cat, children: [], depth: cat.level ?? 0 };
      map.set(cat.id, node);
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }, [categories]);

  const matchesFilter = useCallback((cat: CategoryDTO): boolean => {
    return cat.name.toLowerCase().includes(catSearch.toLowerCase());
  }, [catSearch]);

  const filterTreeNode = useCallback((nodes: TreeNode[]): TreeNode[] => {
    return nodes.reduce<TreeNode[]>((acc, node) => {
      const filteredChildren = filterTreeNode(node.children);
      if (matchesFilter(node.category) || filteredChildren.length > 0 || catSearch === '') {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  }, [matchesFilter]);

  const tree = useMemo(() => buildTree(), [buildTree]);
  const filteredTree = useMemo(() => catSearch ? filterTreeNode(tree) : tree, [tree, filterTreeNode, catSearch]);

  const getAncestorIds = useCallback((catId: number): number[] => {
    const result: number[] = [];
    let current = categories.find(c => c.id === catId);
    while (current?.parentId) {
      result.push(current.parentId);
      current = categories.find(c => c.id === current!.parentId);
    }
    return result;
  }, [categories]);

  useEffect(() => {
    if (catSearch) {
      const toExpand = new Set<number>();
      categories.forEach(c => {
        if (c.name.toLowerCase().includes(catSearch.toLowerCase())) {
          getAncestorIds(c.id).forEach(id => toExpand.add(id));
        }
      });
      setExpandedIds(toExpand);
    }
  }, [catSearch, categories, getAncestorIds]);

  const handleSelectCategory = useCallback((cat: CategoryDTO) => {
    if (selectedCategoryId === cat.id) {
      setSelectedCategoryId(null);
      setSelectedCategoryName('');
    } else {
      setSelectedCategoryId(cat.id);
      setSelectedCategoryName(cat.name);
    }
  }, [selectedCategoryId]);

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleAdd = useCallback((product: ProductDTO) => {
    onAddToCart(product);
  }, [onAddToCart]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: isOpen ? 'flex' : 'none',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }} onClick={onClose}>
      <div onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{ width: '100%', maxWidth: 960 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Chọn sản phẩm</h2>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1, padding: '0 4px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, height: 500 }}>
            {/* Left: Category tree */}
            <div style={{ width: 280, flexShrink: 0 }}>
              <GlassCard style={{ padding: 0, height: '100%', overflowY: 'auto' }}>
                <div style={{
                  padding: '10px 14px', borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '0.8rem', color: 'var(--text-muted)', position: 'sticky', top: 0,
                  background: 'rgba(15,15,20,0.95)', backdropFilter: 'blur(8px)', zIndex: 1,
                }}>
                  <span style={{ fontWeight: 600 }}>
                    <Package size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Danh mục
                  </span>
                </div>
                <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <Search size={13} />
                    </span>
                    <input
                      type="text"
                      placeholder="Tìm danh mục..."
                      style={{
                        width: '100%', padding: '6px 8px 6px 28px', fontSize: '0.8rem',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                        borderRadius: 6, color: 'var(--text-primary)', outline: 'none',
                      }}
                      value={catSearch}
                      onChange={e => setCatSearch(e.target.value)}
                    />
                  </div>
                </div>
                {loading ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                    Đang tải...
                  </div>
                ) : filteredTree.length === 0 ? (
                  <div style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {catSearch ? 'Không tìm thấy' : 'Chưa có danh mục'}
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '7px 10px', paddingLeft: 13,
                        cursor: 'pointer', borderLeft: selectedCategoryId === null ? '3px solid var(--accent)' : '3px solid transparent',
                        background: selectedCategoryId === null ? 'rgba(99,102,241,0.08)' : 'transparent',
                        fontSize: '0.82rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.03)',
                      }}
                      onClick={() => { setSelectedCategoryId(null); setSelectedCategoryName(''); }}
                      onMouseEnter={e => { if (selectedCategoryId !== null) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={e => { if (selectedCategoryId !== null) e.currentTarget.style.background = 'transparent'; }}
                    >
                      Tất cả sản phẩm
                    </div>
                    {filteredTree.map(node => (
                      <CategoryTreeItem
                        key={node.category.id}
                        node={node}
                        expandedIds={expandedIds}
                        onToggle={toggleExpand}
                        selectedId={selectedCategoryId}
                        onSelect={handleSelectCategory}
                        searchQuery={catSearch}
                      />
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Right: Product list */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  style={{
                    width: '100%', padding: '9px 12px 9px 36px', fontSize: '0.85rem',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text-primary)', outline: 'none',
                  }}
                  value={prodSearch}
                  onChange={e => setProdSearch(e.target.value)}
                />
              </div>

              {selectedCategoryName && (
                <div style={{
                  marginBottom: 10, padding: '6px 12px', borderRadius: 6,
                  background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                  fontSize: '0.82rem', color: 'var(--accent-light)',
                }}>
                  <strong>{selectedCategoryName}</strong>
                </div>
              )}

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {productLoading ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div className="spinner" style={{ marginBottom: 12 }}></div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Đang tải sản phẩm...</div>
                    </div>
                  </div>
                ) : !productData || productData.content.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Package size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                      <p style={{ fontSize: '0.9rem' }}>Không có sản phẩm nào</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, flexShrink: 0 }}>
                      {productData.totalElements} sản phẩm
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                      {productData.content.map(product => (
                        <div
                          key={product.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 10px', borderRadius: 8,
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <img
                            src={resolveImageUrl(product.imageUrl)}
                            alt=""
                            style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product.name}
                            </div>
                            <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              <span>Tồn: {product.stockQuantity ?? 0}</span>
                              {product.brand?.name && <span>| {product.brand.name}</span>}
                            </div>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-light)', whiteSpace: 'nowrap', minWidth: 80, textAlign: 'right' }}>
                            {(product.appliedPrice || product.basePrice || 0).toLocaleString()}₫
                          </div>
                          <button
                            onClick={() => handleAdd(product)}
                            style={{
                              background: 'var(--accent)', color: 'white', border: 'none',
                              borderRadius: 6, width: 28, height: 28,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.15s',
                            }}
                            title="Thêm vào giỏ hàng"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 4, flexShrink: 0 }}>
                      <Pagination
                        page={productData.number}
                        totalPages={productData.totalPages}
                        onPageChange={setProductPage}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
