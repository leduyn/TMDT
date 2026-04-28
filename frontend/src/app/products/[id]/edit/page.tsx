'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GalleryUploader from '@/components/GalleryUploader';
import RichTextEditor from '@/components/RichTextEditor';
import { productApi, categoryApi, CategoryDTO, brandApi, BrandDTO } from '@/lib/api';

export default function EditProductPage() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    dropshipPrice: 0,
    stockQuantity: 0,
    categoryId: 0,
    brandId: 0,
    isDropship: false,
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCats, allBrands, product] = await Promise.all([
          categoryApi.getAll(),
          brandApi.getAll(),
          productApi.getById(Number(id))
        ]);
        setCategories(allCats);
        setBrands(allBrands);

        setFormData({
          name: product.name || '',
          description: product.description || '',
          basePrice: product.basePrice || 0,
          dropshipPrice: product.dropshipPrice || 0,
          stockQuantity: product.stockQuantity || 0,
          categoryId: product.categoryId || 0,
          brandId: product.brand?.id || 0,
          isDropship: product.isDropship || false,
        });
        // Load gallery hiện có; fallback về imageUrl nếu chưa có gallery
        if (product.imageUrls && product.imageUrls.length > 0) {
          setImageUrls(product.imageUrls);
        } else if (product.imageUrl) {
          setImageUrls([product.imageUrl]);
        }
      } catch (err: any) {
        setError('Không thể tải dữ liệu sản phẩm');
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
      await productApi.update(Number(id), {
        ...formData,
        imageUrls,
        imageUrl: imageUrls[0] || undefined,
      });
      router.push('/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
               type === 'number' ? Number(value) : value
    }));
  };

  if (fetching) return <Navbar />;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
        <div className="glass-card fade-in-up" style={{ padding: 32 }}>
          <h1 style={{ margin: '0 0 24px', fontSize: '1.5rem', fontWeight: 700 }}>
            ✏️ Chỉnh sửa sản phẩm
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tên sản phẩm</label>
              <input className="input-field" name="name" required value={formData.name} onChange={handleChange} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <RichTextEditor
                label="Mô tả sản phẩm"
                value={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Danh mục</label>
              <select className="input-field" name="categoryId" required value={formData.categoryId} onChange={handleChange}>
                <option value={0}>-- Chọn danh mục --</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Thương hiệu (Tùy chọn)</label>
              <select className="input-field" name="brandId" value={formData.brandId} onChange={handleChange}>
                <option value={0}>-- Chọn thương hiệu --</option>
                {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Số lượng kho</label>
              <input className="input-field" type="number" name="stockQuantity" required value={formData.stockQuantity} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Giá cơ bản (VND)</label>
              <input className="input-field" type="number" name="basePrice" required value={formData.basePrice} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Giá Dropship (VND)</label>
              <input className="input-field" type="number" name="dropshipPrice" value={formData.dropshipPrice} onChange={handleChange} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <GalleryUploader
                images={imageUrls}
                onChange={setImageUrls}
                label="Thư viện ảnh sản phẩm"
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" name="isDropship" checked={formData.isDropship} onChange={handleChange} id="isDropship" />
              <label htmlFor="isDropship" style={{ fontSize: '0.9rem' }}>Sản phẩm hỗ trợ Dropship</label>
            </div>

            {error && <div className="alert-error" style={{ gridColumn: 'span 2' }}>{error}</div>}

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Đang lưu...' : 'Cập nhật sản phẩm'}
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
