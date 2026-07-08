'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { categoryApi, productApi, CategoryDTO, ProductDTO, PageResponse } from '@/lib/api';
import { resolveImageUrl } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import DataTable, { Column } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { Plus, Tag, Edit, Trash2, Settings, Upload, ChevronRight, Download, Package, Eye } from 'lucide-react';

interface TreeNode {
  category: CategoryDTO;
  children: TreeNode[];
  depth: number;
}

function TreeNodeComponent({ node, expandedIds, onToggle, isAuthorized, levelNames, searchQuery, onDelete, selectedCategoryId, onSelect }: {
  node: TreeNode;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  isAuthorized: boolean;
  levelNames: Record<number, string>;
  searchQuery: string;
  onDelete: (id: number) => void;
  selectedCategoryId: number | null;
  onSelect: (cat: CategoryDTO) => void;
}) {
  const { category: c, children } = node;
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(c.id);
  const depth = c.level ?? 0;
  const isActive = selectedCategoryId === c.id;

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

  const getBadgeType = (lvl?: number) => {
    if (lvl === 0) return 'primary' as const;
    if (lvl === 1) return 'info' as const;
    if (lvl === 2) return 'success' as const;
    return 'warning' as const;
  };

  return (
    <>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', paddingLeft: 12 + depth * 20,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          transition: 'all 0.15s',
          cursor: 'pointer',
          borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
          background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
        onClick={() => onSelect(c)}
      >
        {/* Toggle */}
        <div
          onClick={(e) => { e.stopPropagation(); hasChildren && onToggle(c.id); }}
          style={{
            width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, visibility: hasChildren ? 'visible' : 'hidden',
            color: 'var(--text-muted)', transition: 'transform 0.2s',
            transform: isExpanded ? 'rotate(90deg)' : 'none',
          }}
        >
          <ChevronRight size={14} />
        </div>

        {/* Name */}
        <span style={{ flex: 1, fontWeight: depth === 0 ? 700 : 500, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {highlightText(c.name)}
        </span>

        {/* Level badge */}
        <Badge
          label={c.levelName || levelNames[c.level ?? 0] || `Cấp ${c.level ?? 0}`}
          type={getBadgeType(c.level)}
          icon="Layers"
        />

        {/* Actions */}
        {isAuthorized && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <Link href={`/categories/${c.id}/edit`} className="btn-outline" style={{ padding: '4px', borderRadius: 6, display: 'flex' }}>
              <Edit size={12} />
            </Link>
            <button onClick={() => onDelete(c.id)} className="btn-outline" style={{ padding: '4px', borderRadius: 6, display: 'flex', color: '#ef4444' }}>
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        children.map(child => (
          <TreeNodeComponent
            key={child.category.id}
            node={child}
            expandedIds={expandedIds}
            onToggle={onToggle}
            isAuthorized={isAuthorized}
            levelNames={levelNames}
            searchQuery={searchQuery}
            onDelete={onDelete}
            selectedCategoryId={selectedCategoryId}
            onSelect={onSelect}
          />
        ))
      )}
    </>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [levelNames, setLevelNames] = useState<Record<number, string>>({
    0: 'Ngành hàng',
    1: 'Nhóm hàng',
    2: 'Loại sản phẩm',
    3: 'Dòng sản phẩm'
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const { user } = useAuth();

  // Category selection
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  // Product list state
  const [productData, setProductData] = useState<PageResponse<ProductDTO> | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productPage, setProductPage] = useState(0);
  const [productPageSize] = useState(15);

  const loadCategories = () => {
    setLoading(true);
    const isAgency = user?.roles.includes('ROLE_AGENCY');
    const agencyId = user?.agencyId;
    const promise = isAgency && agencyId
      ? categoryApi.getForAgency(agencyId)
      : categoryApi.getAll();
    promise
      .then(setCategories)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  const loadLevelNames = () => {
    categoryApi.getLevelNames()
      .then(setLevelNames)
      .catch(console.error);
  };

  useEffect(() => {
    loadCategories();
    loadLevelNames();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xoá danh mục này?')) return;
    try {
      await categoryApi.delete(id);
      loadCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await categoryApi.updateLevelNames(levelNames);
      setShowConfigModal(false);
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật cấu hình');
    } finally {
      setSavingConfig(false);
    }
  };

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Load products when selected category changes
  const loadProducts = useCallback((catId: number, page: number) => {
    setProductLoading(true);
    productApi.getPage({ categoryId: catId, page, size: productPageSize })
      .then(setProductData)
      .catch(() => setProductData(null))
      .finally(() => setProductLoading(false));
  }, [productPageSize]);

  useEffect(() => {
    if (!selectedCategoryId) { setProductData(null); return; }
    setProductPage(0);
    loadProducts(selectedCategoryId, 0);
  }, [selectedCategoryId, loadProducts]);

  useEffect(() => {
    if (!selectedCategoryId) return;
    loadProducts(selectedCategoryId, productPage);
  }, [productPage, selectedCategoryId, loadProducts]);

  const handleCategorySelect = (cat: CategoryDTO) => {
    if (selectedCategoryId === cat.id) {
      setSelectedCategoryId(null);
      setSelectedCategoryName('');
    } else {
      setSelectedCategoryId(cat.id);
      setSelectedCategoryName(cat.name);
    }
  };

  const buildTree = (): TreeNode[] => {
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
  };

  const getAncestorIds = (catId: number): number[] => {
    const result: number[] = [];
    let current = categories.find(c => c.id === catId);
    while (current?.parentId) {
      result.push(current.parentId);
      current = categories.find(c => c.id === current!.parentId);
    }
    return result;
  };

  const matchesFilter = (cat: CategoryDTO): boolean => {
    return cat.name.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const tree = buildTree();

  const filterTreeNode = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.reduce<TreeNode[]>((acc, node) => {
      const filteredChildren = filterTreeNode(node.children);
      if (matchesFilter(node.category) || filteredChildren.length > 0 || searchQuery === '') {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  };

  const filteredTree = searchQuery ? filterTreeNode(tree) : tree;

  useEffect(() => {
    if (searchQuery) {
      const toExpand = new Set<number>();
      categories.forEach(c => {
        if (c.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          getAncestorIds(c.id).forEach(id => toExpand.add(id));
        }
      });
      setExpandedIds(toExpand);
    }
  }, [searchQuery, categories]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const countLeaves = (nodes: TreeNode[]): number => {
    let count = 0;
    for (const n of nodes) {
      if (n.children.length === 0) count++;
      else count += countLeaves(n.children);
    }
    return count;
  };
  const totalTreeItems = countLeaves(filteredTree);

  const isAuthorized = user?.roles.some(r => ['ROLE_ADMIN', 'ROLE_COMPANY', 'ROLE_AGENCY'].includes(r));

  const productColumns: Column<ProductDTO>[] = [
    {
      header: '', key: 'imageUrl', width: 80,
      render: (p) => (
        <img
          src={resolveImageUrl(p.imageUrl)}
          alt=""
          style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', background: 'rgba(255,255,255,0.05)' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )
    },
    {
      header: 'Sản phẩm', key: 'name',
      render: (p) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
          {p.productCode && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.productCode}</div>}
        </div>
      )
    },
    {
      header: 'Giá', key: 'appliedPrice', align: 'right',
      render: (p) => (
        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
          {p.appliedPrice != null ? p.appliedPrice.toLocaleString('vi-VN') + '₫' : '—'}
        </span>
      )
    },
    {
      header: 'Tồn kho', key: 'stockQuantity', align: 'center',
      render: (p) => (
        <span style={{ fontSize: '0.85rem' }}>{p.stockQuantity ?? 0}</span>
      )
    },
    {
      header: 'Trạng thái', key: 'status', align: 'center',
      render: (p) => (
        <Badge
          label={p.status || 'N/A'}
          type={p.status === 'ACTIVE' ? 'success' : p.status === 'INACTIVE' ? 'warning' : 'info'}
        />
      )
    },
    {
      header: '', key: 'id', align: 'right',
      render: (p) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          {isAuthorized && (
            <Link href={`/products/${p.id}/edit`} className="btn-outline" style={{ padding: '8px', borderRadius: 8, display: 'inline-flex' }}>
              <Edit size={16} />
            </Link>
          )}
          <Link href={`/products/${p.id}`} className="btn-outline" style={{ padding: '8px', borderRadius: 8, display: 'inline-flex' }}>
            <Eye size={16} />
          </Link>
        </div>
      )
    },
  ];

  return (
    <>
      <Navbar />
      <Main>
        <PageHeader
          title="Danh mục sản phẩm"
          subtitle="Quản lý phân loại và cấu trúc sản phẩm trong hệ thống"
          icon="Layers"
        />

        <SearchActionHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm kiếm danh mục..."
          actions={isAuthorized && (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowConfigModal(true)}
                className="btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Settings size={18} />
                Cấu hình cấp
              </button>
              <Link href="/brands" className="btn-outline" style={{ textDecoration: 'none' }}>
                <Tag size={18} />
                Thương hiệu
              </Link>
              <Link href="/categories/import" className="btn-outline" style={{ textDecoration: 'none' }}>
                <Upload size={18} />
                Import Excel
              </Link>
              <a
                href={categoryApi.exportUrl}
                download
                className="btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
              >
                <Download size={18} />
                Xuất Excel
              </a>
              <Link href="/categories/create" className="btn-primary" style={{ textDecoration: 'none' }}>
                <Plus size={18} />
                Thêm danh mục
              </Link>
            </div>
          )}
        />

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginTop: 16 }}>
          {/* LEFT: Category tree */}
          <div style={{ width: 380, flexShrink: 0 }}>
            <GlassCard style={{ padding: 0, maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '0.85rem', color: 'var(--text-muted)', position: 'sticky', top: 0,
                background: 'rgba(15,15,20,0.95)', backdropFilter: 'blur(8px)', zIndex: 1,
              }}>
                <span style={{ fontWeight: 600 }}>
                  <Package size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Cây danh mục
                </span>
                <span>{loading ? '...' : `${totalTreeItems} mục`}</span>
              </div>
              {loading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                  Đang tải...
                </div>
              ) : filteredTree.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {searchQuery ? 'Không tìm thấy danh mục nào phù hợp' : 'Chưa có danh mục nào'}
                </div>
              ) : (
                <div>
                  {filteredTree.map(node => (
                    <TreeNodeComponent
                      key={node.category.id}
                      node={node}
                      expandedIds={expandedIds}
                      onToggle={toggleExpand}
                      isAuthorized={!!isAuthorized}
                      levelNames={levelNames}
                      searchQuery={searchQuery}
                      onDelete={handleDelete}
                      selectedCategoryId={selectedCategoryId}
                      onSelect={handleCategorySelect}
                    />
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* RIGHT: Products list */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!selectedCategoryId ? (
              <GlassCard style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Package size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                <p style={{ fontSize: '1rem', fontWeight: 500 }}>Chọn danh mục bên trái để xem sản phẩm</p>
                <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Sản phẩm sẽ hiển thị theo danh mục và các danh mục con</p>
              </GlassCard>
            ) : (
              <>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 12, padding: '10px 16px', borderRadius: 10,
                  background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                }}>
                  <div style={{ fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Đang xem: </span>
                    <strong style={{ color: 'var(--accent-light)' }}>{selectedCategoryName}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {productData?.totalElements ?? 0} sản phẩm
                  </div>
                </div>
                <DataTable
                  data={productData?.content || []}
                  columns={productColumns}
                  loading={productLoading}
                  emptyMessage="Không có sản phẩm nào trong danh mục này"
                  page={productPage}
                  totalPages={productData?.totalPages || 0}
                  onPageChange={setProductPage}
                />
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="alert-error" style={{ marginTop: 20 }}>
            {error}
          </div>
        )}

        {showConfigModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="glass-card fade-in-up" style={{
              width: '100%',
              maxWidth: 500,
              padding: 30,
              borderRadius: 16,
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Settings size={22} style={{ color: 'var(--color-primary)' }} /> Cấu hình Cấp Danh Mục
              </h3>
              <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                  {Object.keys(levelNames)
                    .map(Number)
                    .sort((a, b) => a - b)
                    .map((level) => (
                      <div key={level} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                            Tên hiển thị Cấp {level}
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={levelNames[level] || ''}
                            onChange={(e) => setLevelNames({ ...levelNames, [level]: e.target.value })}
                            placeholder={`Nhập tên hiển thị cấp ${level}...`}
                            required
                          />
                        </div>
                        {level > 3 && (
                          <button
                            type="button"
                            className="btn-outline"
                            style={{ padding: '10px', color: '#ef4444', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}
                            onClick={() => {
                              const updated = { ...levelNames };
                              delete updated[level];
                              setLevelNames(updated);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                </div>

                <button
                  type="button"
                  className="btn-outline"
                  style={{ width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={() => {
                    const sortedLevels = Object.keys(levelNames).map(Number).sort((a, b) => a - b);
                    const nextLevel = sortedLevels.length > 0 ? sortedLevels[sortedLevels.length - 1] + 1 : 0;
                    setLevelNames({
                      ...levelNames,
                      [nextLevel]: `Cấp ${nextLevel}`
                    });
                  }}
                >
                  <Plus size={16} /> Thêm cấp mới
                </button>

                <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                  <button type="submit" className="btn-primary" disabled={savingConfig} style={{ flex: 1 }}>
                    {savingConfig ? 'Đang lưu...' : 'Lưu cấu hình'}
                  </button>
                  <button type="button" className="btn-outline" onClick={() => setShowConfigModal(false)} style={{ flex: 1 }}>
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Main>
    </>
  );
}
