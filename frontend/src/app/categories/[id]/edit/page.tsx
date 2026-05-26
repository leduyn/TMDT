'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ImageUploader from '@/modules/common/components/ImageUploader';
import { categoryApi, CategoryDTO } from '@/lib/api';

export default function EditCategoryPage() {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [parentId, setParentId] = useState<number | undefined>();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCats, cat] = await Promise.all([
          categoryApi.getAll(),
          categoryApi.getById(Number(id)),
        ]);
        setCategories(allCats.filter(c => c.id !== Number(id)));
        setName(cat.name);
        setImageUrl(cat.imageUrl || '');
        setParentId(cat.parentId);
      } catch {
        setError('Không thể tải dữ liệu danh mục');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await categoryApi.update(Number(id), { name, parentId, imageUrl: imageUrl || undefined });
      router.push('/categories');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Navbar />;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '40px auto', padding: '0 24px' }}>
        <div className="glass-card fade-in-up" style={{ padding: 32 }}>
          <h1 style={{ margin: '0 0 24px', fontSize: '1.5rem', fontWeight: 700 }}>
            ✏️ Chỉnh sửa danh mục
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Tên danh mục
              </label>
              <input
                className="input-field"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nhập tên danh mục..."
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Danh mục cha (Tùy chọn)
              </label>
              <select
                className="input-field"
                value={parentId || ''}
                onChange={e => setParentId(e.target.value ? Number(e.target.value) : undefined)}
                style={{ appearance: 'none' }}
              >
                <option value="">-- Không có --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <ImageUploader
              value={imageUrl}
              onChange={setImageUrl}
              label="Ảnh đại diện danh mục"
            />

            {error && <div className="alert-error">{error}</div>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Đang lưu...' : 'Cập nhật danh mục'}
              </button>
              <button type="button" className="btn-outline" onClick={() => router.back()} style={{ flex: 1 }}>
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
