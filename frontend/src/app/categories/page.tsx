'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { categoryApi, CategoryDTO } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import { Plus, Tag, Edit, Trash2, Settings, Upload, ChevronRight } from 'lucide-react';

interface TreeNode {
  category: CategoryDTO;
  children: TreeNode[];
  depth: number;
}

function TreeNodeComponent({ node, expandedIds, onToggle, isAuthorized, levelNames, searchQuery, onDelete }: {
  node: TreeNode;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  isAuthorized: boolean;
  levelNames: Record<number, string>;
  searchQuery: string;
  onDelete: (id: number) => void;
}) {
  const { category: c, children } = node;
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(c.id);
  const depth = c.level ?? 0;

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
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', paddingLeft: 20 + depth * 24,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          transition: 'background 0.15s',
          cursor: hasChildren ? 'pointer' : 'default',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Toggle */}
        <div
          onClick={() => hasChildren && onToggle(c.id)}
          style={{
            width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, visibility: hasChildren ? 'visible' : 'hidden',
            color: 'var(--text-muted)', transition: 'transform 0.2s',
            transform: isExpanded ? 'rotate(90deg)' : 'none',
          }}
        >
          <ChevronRight size={16} />
        </div>

        {/* Connector line */}
        {depth > 0 && (
          <div style={{
            width: 1, height: 16, background: 'var(--border)', flexShrink: 0, marginRight: 4,
          }} />
        )}

        {/* Name */}
        <span style={{ flex: 1, fontWeight: depth === 0 ? 700 : 500, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {highlightText(c.name)}
        </span>

        {/* Level badge */}
        <Badge
          label={c.levelName || levelNames[c.level ?? 0] || `Cấp ${c.level ?? 0}`}
          type={getBadgeType(c.level)}
          icon="Layers"
        />

        {/* Parent name */}
        {c.parentName && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            ↳ {c.parentName}
          </span>
        )}

        {/* Actions */}
        {isAuthorized && (
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <Link href={`/categories/${c.id}/edit`} className="btn-outline" style={{ padding: '6px', borderRadius: 6, display: 'flex' }}>
              <Edit size={14} />
            </Link>
            <button onClick={() => onDelete(c.id)} className="btn-outline" style={{ padding: '6px', borderRadius: 6, display: 'flex', color: '#ef4444' }}>
              <Trash2 size={14} />
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
  const [levelFilter, setLevelFilter] = useState<number | 'ALL'>('ALL');
  const [parentFilter, setParentFilter] = useState<number | 'ALL'>('ALL');

  const loadCategories = () => {
    setLoading(true);
    categoryApi.getAll()
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

  const uniqueLevels = [...new Set(categories.map(c => c.level).filter((l): l is number => l !== undefined))].sort();
  const parentCategories = categories.filter(c => c.level === 0);

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
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || cat.level === levelFilter;
    const matchesParent = parentFilter === 'ALL' || cat.parentId === parentFilter;
    return matchesSearch && matchesLevel && matchesParent;
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

  const filteredTree = searchQuery || levelFilter !== 'ALL' || parentFilter !== 'ALL'
    ? filterTreeNode(tree)
    : tree;

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
              <Link href="/categories/create" className="btn-primary" style={{ textDecoration: 'none' }}>
                <Plus size={18} />
                Thêm danh mục
              </Link>
            </div>
          )}
        />

        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Cấp danh mục</label>
            <select
              className="input-field"
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              style={{ width: '100%' }}
            >
              <option value="ALL">Tất cả cấp</option>
              {uniqueLevels.map(lvl => (
                <option key={lvl} value={lvl}>{levelNames[lvl] || `Cấp ${lvl}`}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Danh mục cha</label>
            <SearchableSelect
              options={parentCategories.map(pc => ({ value: pc.id, label: pc.name }))}
              value={parentFilter === 'ALL' ? undefined : parentFilter}
              onChange={(val) => setParentFilter(val !== undefined ? Number(val) : 'ALL')}
              placeholder="Tất cả cha"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <GlassCard style={{ padding: 0 }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>{loading ? 'Đang tải...' : `${totalTreeItems} danh mục`}</span>
          </div>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
              Đang tải danh mục...
            </div>
          ) : filteredTree.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
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
                />
              ))}
            </div>
          )}
        </GlassCard>

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

