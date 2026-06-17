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
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Plus, Tag, Edit, Trash2, Settings } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

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
  const [page, setPage] = useState(0);
  const [levelFilter, setLevelFilter] = useState<number | 'ALL'>('ALL');
  const [parentFilter, setParentFilter] = useState<number | 'ALL'>('ALL');
  const pageSize = 20;

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

  const uniqueLevels = [...new Set(categories.map(c => c.level).filter((l): l is number => l !== undefined))].sort();
  const parentCategories = categories.filter(c => c.level === 0);

  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.parentName && c.parentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.levelName && c.levelName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = levelFilter === 'ALL' || c.level === levelFilter;
    const matchesParent = parentFilter === 'ALL' || c.parentId === parentFilter;
    return matchesSearch && matchesLevel && matchesParent;
  });

  useEffect(() => { setPage(0); }, [searchQuery, levelFilter, parentFilter]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize) || 1;
  const paginatedCategories = filteredCategories.slice(page * pageSize, (page + 1) * pageSize);

  const isAuthorized = user?.roles.some(r => ['ROLE_ADMIN', 'ROLE_COMPANY', 'ROLE_AGENCY'].includes(r));

  const columns: Column<CategoryDTO>[] = [
    { 
      header: 'ID', 
      key: 'id', 
      width: '10%',
      render: (c) => <span style={{ color: 'var(--text-muted)' }}>#{c.id}</span>
    },
    { 
      header: 'Tên danh mục', 
      key: 'name', 
      width: '30%',
      render: (c) => <span style={{ fontWeight: 600 }}>{c.name}</span>
    },
    {
      header: 'Cấp danh mục',
      key: 'levelName',
      width: '25%',
      render: (c) => {
        const getBadgeType = (lvl?: number) => {
          if (lvl === 0) return 'primary' as const;
          if (lvl === 1) return 'info' as const;
          if (lvl === 2) return 'success' as const;
          return 'warning' as const;
        };
        return (
          <Badge 
            label={c.levelName || `Cấp ${c.level ?? 0}`} 
            type={getBadgeType(c.level)} 
            icon="Layers" 
          />
        );
      }
    },
    { 
      header: 'Danh mục cha', 
      key: 'parentName', 
      width: '25%',
      render: (c) => c.parentName ? (
        <Badge label={c.parentName} type="info" icon="FolderTree" />
      ) : (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gốc</span>
      )
    }
  ];

  if (isAuthorized) {
    columns.push({
      header: 'Thao tác',
      key: 'actions',
      align: 'right',
      render: (c) => (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Link href={`/categories/${c.id}/edit`} className="btn-outline" style={{ padding: '8px', borderRadius: 8 }}>
            <Edit size={16} />
          </Link>
          <button onClick={() => handleDelete(c.id)} className="btn-outline" style={{ padding: '8px', borderRadius: 8, color: '#ef4444' }}>
            <Trash2 size={16} />
          </button>
        </div>
      )
    });
  }

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
            <select
              className="input-field"
              value={parentFilter}
              onChange={e => setParentFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              style={{ width: '100%' }}
            >
              <option value="ALL">Tất cả cha</option>
              {parentCategories.map(pc => (
                <option key={pc.id} value={pc.id}>{pc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <DataTable 
          data={paginatedCategories}
          columns={columns}
          loading={loading}
          emptyMessage={searchQuery ? 'Không tìm thấy danh mục nào phù hợp' : 'Chưa có danh mục nào'}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxH: '300px', overflowY: 'auto', paddingRight: '4px' }}>
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

