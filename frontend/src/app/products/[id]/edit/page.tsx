'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import GalleryUploader from '@/modules/common/components/GalleryUploader';
import ImageUploader from '@/modules/common/components/ImageUploader';
import RichTextEditor from '@/modules/common/components/RichTextEditor';
import Modal from '@/components/ui/Modal';
import { productApi, categoryApi, CategoryDTO, brandApi, BrandDTO, productTypeApi, ProductTypeDTO, attributeApi, AttributeDTO, facetedSearchApi } from '@/lib/api';
import SearchableSelect from '@/components/ui/SearchableSelect';

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
    productTypeId: 0,
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
    showDiscount: false,
    productCode: '',
    retailWarrantyPeriod: '',
    wholesaleWarrantyPeriod: '',
    status: 'ACTIVE',
    otherName: '',
    shortName: '',
    specification: '',
    feature1: '',
    feature2: '',
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeDTO[]>([]);
  const [attributes, setAttributes] = useState<AttributeDTO[]>([]);
  const [allAttributes, setAllAttributes] = useState<AttributeDTO[]>([]);
  // Store selected value IDs (if existing) or new string values
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, { valueId: number, isNew: boolean, newValue: string }>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Quick-create modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParentId, setNewCategoryParentId] = useState(0);
  const [newCategoryImageUrl, setNewCategoryImageUrl] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandCode, setNewBrandCode] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [creatingBrand, setCreatingBrand] = useState(false);

  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [newProductTypeCode, setNewProductTypeCode] = useState('');
  const [newProductTypeName, setNewProductTypeName] = useState('');
  const [creatingProductType, setCreatingProductType] = useState(false);

  // Add attribute modal
  const [showAddAttrModal, setShowAddAttrModal] = useState(false);
  const [showCreateAttrInModal, setShowCreateAttrInModal] = useState(false);
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrDisplayName, setNewAttrDisplayName] = useState('');
  const [newAttrIsVariant, setNewAttrIsVariant] = useState(false);
  const [creatingAttribute, setCreatingAttribute] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCats, allBrands, allProductTypes, product, currentAttrs, allAttrs] = await Promise.all([
          categoryApi.getAll(),
          brandApi.getAll(),
          productTypeApi.getAll(),
          productApi.getById(Number(id)),
          facetedSearchApi.getProductAttributes(Number(id)),
          attributeApi.getAll(),
        ]);
        setCategories(allCats.filter((c: CategoryDTO) => c.level === 4));
        setBrands(allBrands);
        setProductTypes(allProductTypes);
        setAllAttributes(allAttrs);

        setFormData({
          name: product.name || '',
          description: product.description || '',
          basePrice: product.basePrice || 0,
          dropshipPrice: product.dropshipPrice || 0,
          stockQuantity: product.stockQuantity || 0,
          categoryId: product.categoryId || 0,
          brandId: product.brand?.id || 0,
          productTypeId: product.productType?.id || 0,
          isDropship: product.isDropship || false,
          isAppVisible: product.isAppVisible ?? true,
          isWebVisible: product.isWebVisible ?? true,
          tags: product.tags || '',
          bravoOrder: product.bravoOrder || 0,
          unit: product.unit || '',
          innerPackaging: product.innerPackaging || '',
          outerPackaging: product.outerPackaging || '',
          minPurchaseQuantity: product.minPurchaseQuantity || 1,
          quantityStep: product.quantityStep || 1,
          userManual: product.userManual || '',
          showDiscount: product.showDiscount ?? false,
          productCode: product.productCode || '',
          retailWarrantyPeriod: product.retailWarrantyPeriod || '',
          wholesaleWarrantyPeriod: product.wholesaleWarrantyPeriod || '',
          status: product.status || 'ACTIVE',
          otherName: product.otherName || '',
          shortName: product.shortName || '',
          specification: product.specification || '',
          feature1: product.feature1 || '',
          feature2: product.feature2 || '',
        });

        // Pre-fill attributes
        const initialAttrMap: Record<number, { valueId: number, isNew: boolean, newValue: string }> = {};
        currentAttrs.forEach(av => {
          initialAttrMap[av.attributeId] = { valueId: av.id, isNew: false, newValue: '' };
        });
        setSelectedAttributes(initialAttrMap);

        // Load category attributes, then add extra attributes from product's existing values
        if (product.categoryId && product.categoryId > 0) {
          const catAttrs = await attributeApi.getAll(product.categoryId);
          const extraAttrIds = Object.keys(initialAttrMap).map(Number)
            .filter(attrId => !catAttrs.find(a => a.id === attrId));
          const extraAttrs = extraAttrIds.map(id => allAttrs.find(a => a.id === id)).filter(Boolean) as AttributeDTO[];
          setAttributes([...catAttrs, ...extraAttrs]);
        } else {
          setAttributes([]);
        }

        if (product.imageUrls && product.imageUrls.length > 0) {
          setImageUrls(product.imageUrls);
        } else if (product.imageUrl) {
          setImageUrls([product.imageUrl]);
        }
      } catch (err: any) {
        console.error(err);
        setError('Không thể tải dữ liệu sản phẩm');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  // Fetch attributes when category changes
  useEffect(() => {
    if (formData.categoryId > 0) {
      attributeApi.getAll(formData.categoryId)
        .then(catAttrs => {
          // Keep extra attributes that are already selected but outside this category
          const extraAttrIds = Object.keys(selectedAttributes).map(Number)
            .filter(attrId => !catAttrs.find(a => a.id === attrId));
          const extraAttrs = extraAttrIds.map(id => allAttributes.find(a => a.id === id)).filter(Boolean) as AttributeDTO[];
          setAttributes([...catAttrs, ...extraAttrs]);
        })
        .catch(err => {
          console.error('Failed to fetch attributes:', err);
          setAttributes([]);
        });
    } else {
      setAttributes([]);
    }
  }, [formData.categoryId]);

  const handleAddAttribute = (attrId: number) => {
    const attr = allAttributes.find(a => a.id === attrId);
    if (attr && !attributes.find(a => a.id === attrId)) {
      setAttributes(prev => [...prev, attr]);
    }
    setShowAddAttrModal(false);
    setShowCreateAttrInModal(false);
  };

  const handleRemoveAttribute = (attrId: number) => {
    setAttributes(prev => prev.filter(a => a.id !== attrId));
    setSelectedAttributes(prev => {
      const next = { ...prev };
      delete next[attrId];
      return next;
    });
  };

  const handleCreateAttribute = async () => {
    if (!newAttrName.trim() || !newAttrDisplayName.trim()) { alert('Vui lòng nhập tên và tên hiển thị'); return; }
    setCreatingAttribute(true);
    try {
      await attributeApi.create({
        name: newAttrName.trim(),
        displayName: newAttrDisplayName.trim(),
        categoryId: formData.categoryId > 0 ? formData.categoryId : undefined,
        isVariant: newAttrIsVariant,
      });
      const updated = await attributeApi.getAll();
      setAllAttributes(updated);
      const created = updated.find(a => a.name === newAttrName.trim());
      if (created) {
        setAttributes(prev => [...prev, created]);
      }
      setShowAddAttrModal(false);
      setShowCreateAttrInModal(false);
      setNewAttrName('');
      setNewAttrDisplayName('');
      setNewAttrIsVariant(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingAttribute(false);
    }
  };

  const handleQuickCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const created = await categoryApi.create({
        name: newCategoryName.trim(),
        ...(newCategoryParentId > 0 && { parentId: newCategoryParentId }),
        ...(newCategoryImageUrl && { imageUrl: newCategoryImageUrl }),
      });
      const updated = await categoryApi.getAll();
      setCategories(updated.filter((c: CategoryDTO) => c.level === 4));
      setFormData(prev => ({ ...prev, categoryId: created.id }));
      setShowCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryParentId(0);
      setNewCategoryImageUrl('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleQuickCreateBrand = async () => {
    if (!newBrandCode.trim() || !newBrandName.trim()) { alert('Vui lòng nhập mã và tên thương hiệu'); return; }
    setCreatingBrand(true);
    try {
      const created = await brandApi.create({ code: newBrandCode.trim(), name: newBrandName.trim() });
      const updated = await brandApi.getAll();
      setBrands(updated);
      setFormData(prev => ({ ...prev, brandId: created.id }));
      setShowBrandModal(false);
      setNewBrandCode('');
      setNewBrandName('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingBrand(false);
    }
  };

  const handleQuickCreateProductType = async () => {
    if (!newProductTypeCode.trim() || !newProductTypeName.trim()) { alert('Vui lòng nhập mã và tên loại sản phẩm'); return; }
    setCreatingProductType(true);
    try {
      const created = await productTypeApi.create({ code: newProductTypeCode.trim(), name: newProductTypeName.trim() });
      const updated = await productTypeApi.getAll();
      setProductTypes(updated);
      setFormData(prev => ({ ...prev, productTypeId: created.id }));
      setShowProductTypeModal(false);
      setNewProductTypeCode('');
      setNewProductTypeName('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingProductType(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      await productApi.update(Number(id), {
        ...formData,
        productTypeId: formData.productTypeId || undefined,
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

  if (fetching) return <Navbar />;

  return (
    <>
      <Navbar />
      <Main>
        <div className="glass-card fade-in-up" style={{ padding: 32 }}>
          <h1 style={{ margin: '0 0 24px', fontSize: '1.5rem', fontWeight: 700 }}>
            ✏️ Chỉnh sửa sản phẩm
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tên sản phẩm</label>
              <input className="input-field" name="name" required value={formData.name} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mã sản phẩm *</label>
              <input className="input-field" name="productCode" required value={formData.productCode} onChange={handleChange} placeholder="VD: SP001" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Trạng thái</label>
              <select className="input-field" name="status" value={formData.status} onChange={handleChange}>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
                <option value="DISCONTINUED">Ngừng kinh doanh</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tên khác</label>
              <input className="input-field" name="otherName" value={formData.otherName} onChange={handleChange} placeholder="Tên phụ/alias" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tên rút gọn</label>
              <input className="input-field" name="shortName" value={formData.shortName} onChange={handleChange} placeholder="Tên viết tắt" />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <RichTextEditor
                label="Mô tả sản phẩm"
                value={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
              />
            </div>

            {/* Image gallery / uploader */}
            <div style={{ gridColumn: 'span 2' }}>
              <GalleryUploader
                images={imageUrls}
                onChange={(imgs) => setImageUrls(imgs)}
                label="Hình ảnh sản phẩm"
                maxImages={8}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Danh mục</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <SearchableSelect
                  options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                  value={formData.categoryId || undefined}
                  onChange={(val) => setFormData(prev => ({ ...prev, categoryId: val ? Number(val) : 0 }))}
                  placeholder="-- Chọn danh mục --"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => setShowCategoryModal(true)} title="Thêm danh mục mới" style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>+</button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Thương hiệu (Tùy chọn)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <SearchableSelect
                  options={brands.map(brand => ({ value: brand.id, label: brand.name }))}
                  value={formData.brandId || undefined}
                  onChange={(val) => setFormData(prev => ({ ...prev, brandId: val ? Number(val) : 0 }))}
                  placeholder="-- Chọn thương hiệu --"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => setShowBrandModal(true)} title="Thêm thương hiệu mới" style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>+</button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loại sản phẩm (Tùy chọn)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <SearchableSelect
                  options={productTypes.map(type => ({ value: type.id, label: type.name }))}
                  value={formData.productTypeId || undefined}
                  onChange={(val) => setFormData(prev => ({ ...prev, productTypeId: val ? Number(val) : 0 }))}
                  placeholder="-- Chọn loại sản phẩm --"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => setShowProductTypeModal(true)} title="Thêm loại sản phẩm mới" style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>+</button>
              </div>
            </div>

            <div style={{ gridColumn: 'span 2', padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Thiết lập bán hàng & Quy cách</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bảo hành bán thường</label>
                  <input className="input-field" name="retailWarrantyPeriod" placeholder="VD: 12 tháng" value={formData.retailWarrantyPeriod} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bảo hành bán sỉ</label>
                  <input className="input-field" name="wholesaleWarrantyPeriod" placeholder="VD: 24 tháng" value={formData.wholesaleWarrantyPeriod} onChange={handleChange} />
                </div>
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

            <div style={{ gridColumn: 'span 2', padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Phiên bản sản phẩm</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quy cách</label>
                  <input className="input-field" name="specification" placeholder="VD: Cơ bản, Cao cấp" value={formData.specification} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Đặc điểm 1</label>
                  <input className="input-field" name="feature1" placeholder="VD: Có dây" value={formData.feature1} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Đặc điểm 2</label>
                  <input className="input-field" name="feature2" placeholder="VD: Công suất lớn" value={formData.feature2} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Dynamic Attributes Section */}
            <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-light)', margin: 0 }}>
                  Thuộc tính sản phẩm
                </h3>
                <button type="button" className="btn-outline" onClick={() => {
                  setShowCreateAttrInModal(false);
                  setShowAddAttrModal(true);
                }} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                  + Thêm thuộc tính
                </button>
              </div>
              {attributes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0', margin: 0 }}>
                  Chưa có thuộc tính nào. Chọn danh mục hoặc nhấn "Thêm thuộc tính" để bắt đầu.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {attributes.map(attr => {
                    const isCategoryAttr = formData.categoryId > 0 &&
                      allAttributes.find(a => a.id === attr.id)?.categoryId === formData.categoryId;
                    return (
                      <div key={attr.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>
                            {attr.displayName}
                            {!isCategoryAttr && attr.categoryId && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                                ({categories.find(c => c.id === attr.categoryId)?.name || 'Danh mục khác'})
                              </span>
                            )}
                          </label>
                          {!isCategoryAttr && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAttribute(attr.id)}
                              title="Xoá thuộc tính"
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: 1 }}
                            >×</button>
                          )}
                        </div>
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
                    );
                  })}
                </div>
              )}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" name="showDiscount" checked={formData.showDiscount} onChange={handleChange} id="showDiscount" />
                  <label htmlFor="showDiscount" style={{ fontSize: '0.9rem' }}>Hiển thị giá giảm / Giá trước thay đổi</label>
                </div>
              </div>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" name="isDropship" checked={formData.isDropship} onChange={handleChange} id="isDropship" />
              <label htmlFor="isDropship" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sản phẩm hỗ trợ Dropship</label>
            </div>

            {error && <div className="alert-error" style={{ gridColumn: 'span 2' }}>{error}</div>}

            {/* Quick-create modals */}
            <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Thêm danh mục mới">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tên danh mục</label>
                  <input className="input-field" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Nhập tên danh mục" autoFocus />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Danh mục cha (Tùy chọn)</label>
                  <SearchableSelect
                    options={categories.filter(c => c.id !== formData.categoryId).map(cat => ({ value: cat.id, label: cat.name }))}
                    value={newCategoryParentId || undefined}
                    onChange={(val) => setNewCategoryParentId(val ? Number(val) : 0)}
                    placeholder="-- Không có danh mục cha --"
                  />
                </div>
                <div>
                  <ImageUploader
                    value={newCategoryImageUrl}
                    onChange={url => setNewCategoryImageUrl(url)}
                    label="Hình ảnh đại diện (Tùy chọn)"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn-outline" onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryParentId(0);
                  setNewCategoryImageUrl('');
                }}>Hủy</button>
                <button type="button" className="btn-primary" disabled={creatingCategory || !newCategoryName.trim()} onClick={handleQuickCreateCategory}>
                  {creatingCategory ? 'Đang tạo...' : 'Lưu'}
                </button>
              </div>
            </Modal>

            <Modal isOpen={showBrandModal} onClose={() => setShowBrandModal(false)} title="Thêm thương hiệu mới">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mã thương hiệu</label>
                  <input className="input-field" value={newBrandCode} onChange={e => setNewBrandCode(e.target.value)} placeholder="VD: MAKITA" autoFocus />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tên thương hiệu</label>
                  <input className="input-field" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder="VD: Makita" />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-outline" onClick={() => setShowBrandModal(false)}>Hủy</button>
                  <button type="button" className="btn-primary" disabled={creatingBrand || !newBrandCode.trim() || !newBrandName.trim()} onClick={handleQuickCreateBrand}>
                    {creatingBrand ? 'Đang tạo...' : 'Lưu'}
                  </button>
                </div>
              </div>
            </Modal>

            <Modal isOpen={showProductTypeModal} onClose={() => setShowProductTypeModal(false)} title="Thêm loại sản phẩm mới">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mã loại sản phẩm</label>
                  <input className="input-field" value={newProductTypeCode} onChange={e => setNewProductTypeCode(e.target.value)} placeholder="VD: MACHINERY" autoFocus />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tên loại sản phẩm</label>
                  <input className="input-field" value={newProductTypeName} onChange={e => setNewProductTypeName(e.target.value)} placeholder="VD: Máy móc" />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-outline" onClick={() => setShowProductTypeModal(false)}>Hủy</button>
                  <button type="button" className="btn-primary" disabled={creatingProductType || !newProductTypeCode.trim() || !newProductTypeName.trim()} onClick={handleQuickCreateProductType}>
                    {creatingProductType ? 'Đang tạo...' : 'Lưu'}
                  </button>
                </div>
              </div>
            </Modal>

            {/* Add attribute modal */}
            <Modal isOpen={showAddAttrModal} onClose={() => { setShowAddAttrModal(false); setShowCreateAttrInModal(false); }} title="Thêm thuộc tính">
              {!showCreateAttrInModal ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setShowCreateAttrInModal(true)}
                    style={{ width: '100%', textAlign: 'center', padding: '10px' }}
                  >
                    + Tạo thuộc tính mới
                  </button>
                  <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                  {allAttributes.filter(a => !attributes.find(attr => attr.id === a.id)).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                      Tất cả thuộc tính đã được thêm.
                    </p>
                  ) : (
                    allAttributes
                      .filter(a => !attributes.find(attr => attr.id === a.id))
                      .map(attr => (
                        <div
                          key={attr.id}
                          onClick={() => handleAddAttribute(attr.id)}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{attr.displayName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {attr.categoryId ? (categories.find(c => c.id === attr.categoryId)?.name || 'Danh mục khác') : 'Toàn hệ thống'}
                              {attr.isVariant ? ' · Phiên bản' : ''}
                            </div>
                          </div>
                          <span style={{ color: 'var(--accent-light)', fontSize: '1.2rem' }}>+</span>
                        </div>
                      ))
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tên attribute</label>
                    <input className="input-field" value={newAttrName} onChange={e => setNewAttrName(e.target.value)} placeholder="VD: color" autoFocus />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tên hiển thị</label>
                    <input className="input-field" value={newAttrDisplayName} onChange={e => setNewAttrDisplayName(e.target.value)} placeholder="VD: Màu sắc" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id="newAttrIsVariant" checked={newAttrIsVariant} onChange={e => setNewAttrIsVariant(e.target.checked)} />
                    <label htmlFor="newAttrIsVariant" style={{ fontSize: '0.9rem' }}>Là thuộc tính phiên bản (isVariant)</label>
                  </div>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="button" className="btn-outline" onClick={() => setShowCreateAttrInModal(false)}>Quay lại</button>
                    <button type="button" className="btn-primary" disabled={creatingAttribute || !newAttrName.trim() || !newAttrDisplayName.trim()} onClick={handleCreateAttribute}>
                      {creatingAttribute ? 'Đang tạo...' : 'Tạo & Thêm'}
                    </button>
                  </div>
                </div>
              )}
            </Modal>

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
      </Main>
    </>
  );
}
