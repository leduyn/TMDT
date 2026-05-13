'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GalleryUploader from '@/components/GalleryUploader';
import RichTextEditor from '@/components/RichTextEditor';
import { productApi, categoryApi, CategoryDTO, brandApi, BrandDTO, attributeApi, AttributeDTO } from '@/lib/api';

export default function CreateProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    dropshipPrice: 0,
    stockQuantity: 0,
    categoryId: 0,
    brandId: 0,
    isDropship: false,
    isAppVisible: true,
    isWebVisible: true,
    tags: '',
    bravoOrder: 0,
    unit: '',
    innerPackaging: '',
    outerPackaging: '',
    minPurchaseQuantity: 1,
    quantityStep: 1,
    userManual: '',
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [attributes, setAttributes] = useState<AttributeDTO[]>([]);
  // Store selected value IDs (if existing) or new string values
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, { valueId: number, isNew: boolean, newValue: string }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(console.error);
    brandApi.getAll().then(setBrands).catch(console.error);
  }, []);

  // Fetch attributes when category changes
  useEffect(() => {
    if (formData.categoryId > 0) {
      attributeApi.getAll(formData.categoryId)
        .then(setAttributes)
        .catch(err => {
          console.error('Failed to fetch attributes:', err);
          setAttributes([]);
        });
    } else {
      setAttributes([]);
    }
    setSelectedAttributes({});
  }, [formData.categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categoryId === 0) {
      setError('Vui lòng chọn danh mục');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Handle creating new attribute values first
      const finalAttributeValueIds: number[] = [];
      for (const attrId in selectedAttributes) {
        const selection = selectedAttributes[attrId];
        if (selection.isNew && selection.newValue.trim() !== '') {
          // Create new value via API
          const createdValue = await attributeApi.addValue(Number(attrId), selection.newValue.trim());
          finalAttributeValueIds.push(createdValue.id);
        } else if (!selection.isNew && selection.valueId > 0) {
          finalAttributeValueIds.push(selection.valueId);
        }
      }

      await productApi.create({
        ...formData,
        imageUrls,
        imageUrl: imageUrls[0] || undefined,
        attributeValueIds: finalAttributeValueIds,
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

  const handleAttributeChange = (attributeId: number, valueId: number) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeId]: { valueId, isNew: valueId === -1, newValue: prev[attributeId]?.newValue || '' }
    }));
  };

  const handleAttributeNewValueChange = (attributeId: number, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeId]: { ...prev[attributeId], newValue: value }
    }));
  };

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
        <div className="glass-card fade-in-up" style={{ padding: 32 }}>
          <h1 style={{ margin: '0 0 24px', fontSize: '1.5rem', fontWeight: 700 }}>
            📦 Thêm sản phẩm mới
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

            <div style={{ gridColumn: 'span 2', padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Thiết lập bán hàng & Quy cách</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Đơn vị tính</label>
                  <input className="input-field" name="unit" placeholder="VD: Cái, Hộp" value={formData.unit} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quy cách trong</label>
                  <input className="input-field" name="innerPackaging" placeholder="VD: 10 cái/hộp" value={formData.innerPackaging} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quy cách ngoài</label>
                  <input className="input-field" name="outerPackaging" placeholder="VD: 50 hộp/thùng" value={formData.outerPackaging} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mua tối thiểu</label>
                  <input className="input-field" type="number" name="minPurchaseQuantity" value={formData.minPurchaseQuantity} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bước nhảy số lượng</label>
                  <input className="input-field" type="number" name="quantityStep" value={formData.quantityStep} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Dynamic Attributes Section */}
            {attributes.length > 0 && (
              <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, color: 'var(--accent-light)' }}>
                  Thuộc tính sản phẩm
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {attributes.map(attr => (
                    <div key={attr.id}>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {attr.displayName}
                      </label>
                      <select 
                        className="input-field" 
                        value={selectedAttributes[attr.id]?.valueId || 0}
                        onChange={(e) => handleAttributeChange(attr.id, Number(e.target.value))}
                        style={{ marginBottom: selectedAttributes[attr.id]?.isNew ? 8 : 0 }}
                      >
                        <option value={0}>-- Chọn {attr.displayName.toLowerCase()} --</option>
                        {attr.values.map(val => (
                          <option key={val.id} value={val.id}>{val.value}</option>
                        ))}
                        <option value={-1}>+ Thêm giá trị mới...</option>
                      </select>
                      {selectedAttributes[attr.id]?.isNew && (
                        <input 
                          className="input-field" 
                          placeholder="Nhập giá trị mới..." 
                          value={selectedAttributes[attr.id]?.newValue || ''}
                          onChange={(e) => handleAttributeNewValueChange(attr.id, e.target.value)}
                          autoFocus
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              <RichTextEditor
                label="Hướng dẫn sử dụng"
                value={formData.userManual || ''}
                onChange={(content) => setFormData(prev => ({ ...prev, userManual: content }))}
              />
            </div>

            <div style={{ gridColumn: 'span 2', padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Cấu hình hiển thị</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tags (Cách nhau dấu phẩy)</label>
                  <input className="input-field" name="tags" placeholder="VD: Mới, Giảm giá" value={formData.tags} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Thứ tự sắp xếp (Bravo Order)</label>
                  <input className="input-field" type="number" name="bravoOrder" value={formData.bravoOrder} onChange={handleChange} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" name="isAppVisible" checked={formData.isAppVisible} onChange={handleChange} id="isAppVisible" />
                  <label htmlFor="isAppVisible" style={{ fontSize: '0.9rem' }}>Hiển thị trên App</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" name="isWebVisible" checked={formData.isWebVisible} onChange={handleChange} id="isWebVisible" />
                  <label htmlFor="isWebVisible" style={{ fontSize: '0.9rem' }}>Hiển thị trên Web</label>
                </div>
              </div>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" name="isDropship" checked={formData.isDropship} onChange={handleChange} id="isDropship" />
              <label htmlFor="isDropship" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sản phẩm hỗ trợ Dropship</label>
            </div>

            {error && <div className="alert-error" style={{ gridColumn: 'span 2' }}>{error}</div>}

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
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

