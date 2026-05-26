'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { categoryApi, CategoryDTO } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Plus, Tag, Edit, Trash2 } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const loadCategories = () => {
    setLoading(true);
    categoryApi.getAll()
      .then(setCategories)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
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

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.parentName && c.parentName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      width: '40%',
      render: (c) => <span style={{ fontWeight: 600 }}>{c.name}</span>
    },
    { 
      header: 'Danh mục cha', 
      key: 'parentName', 
      width: '30%',
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
      <main style={{ padding: '20px 0' }}>
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

        <DataTable 
          data={filteredCategories}
          columns={columns}
          loading={loading}
          emptyMessage={searchQuery ? 'Không tìm thấy danh mục nào phù hợp' : 'Chưa có danh mục nào'}
        />

        {error && (
          <div className="alert-error" style={{ marginTop: 20 }}>
            {error}
          </div>
        )}
      </main>
    </>
  );
}

