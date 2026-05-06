'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { attributeApi, categoryApi, CategoryDTO, AttributeDTO, AttributeValueDTO } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AttributesManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [attributes, setAttributes] = useState<AttributeDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states for Create/Edit Attribute
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [editingAttr, setEditingAttr] = useState<AttributeDTO | null>(null);
  const [attrForm, setAttrForm] = useState({ name: '', displayName: '', categoryId: 0, isVariant: false });

  // Value management states
  const [selectedAttrForValues, setSelectedAttrForValues] = useState<AttributeDTO | null>(null);
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('ROLE_COMPANY'))) {
      router.push('/dashboard');
      return;
    }
    
    const fetchData = async () => {
      try {
        const [attrs, cats] = await Promise.all([
          attributeApi.getAll(),
          categoryApi.getAll()
        ]);
        setAttributes(attrs);
        setCategories(cats);
      } catch (err: any) {
        setError('Không thể tải dữ liệu thuộc tính');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.roles.includes('ROLE_COMPANY')) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const handleOpenAttrModal = (attr: AttributeDTO | null = null) => {
    if (attr) {
      setEditingAttr(attr);
      setAttrForm({
        name: attr.name,
        displayName: attr.displayName,
        categoryId: attr.categoryId || 0,
        isVariant: attr.isVariant || false
      });
    } else {
      setEditingAttr(null);
      setAttrForm({ name: '', displayName: '', categoryId: 0, isVariant: false });
    }
    setShowAttrModal(true);
  };

  const handleSaveAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...attrForm,
        categoryId: attrForm.categoryId > 0 ? attrForm.categoryId : undefined
      };
      
      if (editingAttr) {
        await attributeApi.update(editingAttr.id, data);
      } else {
        await attributeApi.create(data);
      }
      
      const updatedAttrs = await attributeApi.getAll();
      setAttributes(updatedAttrs);
      setShowAttrModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttribute = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thuộc tính này? Tất cả các giá trị liên quan cũng sẽ bị xóa.')) return;
    setLoading(true);
    try {
      await attributeApi.delete(id);
      setAttributes(prev => prev.filter(a => a.id !== id));
      if (selectedAttrForValues?.id === id) setSelectedAttrForValues(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttrForValues || !newValue.trim()) return;
    
    try {
      await attributeApi.addValue(selectedAttrForValues.id, newValue.trim());
      const updatedAttr = await attributeApi.getById(selectedAttrForValues.id);
      setSelectedAttrForValues(updatedAttr);
      setAttributes(prev => prev.map(a => a.id === updatedAttr.id ? updatedAttr : a));
      setNewValue('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteValue = async (valueId: number) => {
    if (!confirm('Xóa giá trị này?')) return;
    try {
      await attributeApi.deleteValue(valueId);
      if (selectedAttrForValues) {
        const updatedAttr = await attributeApi.getById(selectedAttrForValues.id);
        setSelectedAttrForValues(updatedAttr);
        setAttributes(prev => prev.map(a => a.id === updatedAttr.id ? updatedAttr : a));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (authLoading || loading && attributes.length === 0) return <Navbar />;

  return (
    <>
      <Navbar />
      <main className="attr-page">
        <header className="attr-header">
          <div>
            <h1 className="attr-title">Quản lý Thuộc tính</h1>
            <p className="attr-subtitle">Thiết lập các đặc tính kỹ thuật cho sản phẩm theo danh mục</p>
          </div>
          <button className="btn-primary" onClick={() => handleOpenAttrModal()}>
            + Thêm Thuộc tính
          </button>
        </header>

        {error && <div className="alert-error" style={{ marginBottom: 24 }}>{error}</div>}

        <div className="attr-layout">
          {/* Attributes List */}
          <section className="attr-list-section">
            <div className="glass-card">
              <table className="attr-table">
                <thead>
                  <tr>
                    <th>Tên hiển thị</th>
                    <th>Tên kỹ thuật</th>
                    <th>Danh mục</th>
                    <th>Biến thể</th>
                    <th>Số giá trị</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.map(attr => (
                    <tr key={attr.id} className={selectedAttrForValues?.id === attr.id ? 'active-row' : ''} onClick={() => setSelectedAttrForValues(attr)}>
                      <td><strong>{attr.displayName}</strong></td>
                      <td><code>{attr.name}</code></td>
                      <td>{attr.categoryName || <span style={{ color: '#64748b' }}>Toàn hệ thống</span>}</td>
                      <td>
                        {attr.isVariant ? (
                          <span className="badge badge-primary">Có</span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>Không</span>
                        )}
                      </td>
                      <td>{attr.values?.length || 0}</td>
                      <td>
                        <div className="table-actions">
                          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); handleOpenAttrModal(attr); }} title="Sửa">
                            ✏️
                          </button>
                          <button className="icon-btn delete" onClick={(e) => { e.stopPropagation(); handleDeleteAttribute(attr.id); }} title="Xóa">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {attributes.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                        Chưa có thuộc tính nào được tạo
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Value Management Sidebar */}
          <aside className="value-management">
            <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  {selectedAttrForValues ? `Giá trị cho: ${selectedAttrForValues.displayName}` : 'Chọn một thuộc tính để quản lý giá trị'}
                </h3>
              </div>
              
              {selectedAttrForValues ? (
                <>
                  <div className="value-list">
                    {selectedAttrForValues.values?.map(val => (
                      <div key={val.id} className="value-item">
                        <span>{val.value}</span>
                        <button className="icon-btn delete sm" onClick={() => handleDeleteValue(val.id)}>×</button>
                      </div>
                    ))}
                    {(!selectedAttrForValues.values || selectedAttrForValues.values.length === 0) && (
                      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', padding: 20 }}>
                        Chưa có giá trị nào
                      </p>
                    )}
                  </div>
                  <form className="value-add-form" onSubmit={handleAddValue}>
                    <input 
                      className="input-field" 
                      placeholder="Thêm giá trị mới..." 
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ width: 'auto' }}>+</button>
                  </form>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', color: '#64748b' }}>
                  <p>Vui lòng click vào một dòng ở bảng bên trái để quản lý các giá trị của thuộc tính đó</p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Attribute Modal */}
        {showAttrModal && (
          <div className="modal-overlay">
            <div className="glass-card modal-content">
              <h2 style={{ margin: '0 0 20px', fontSize: '1.25rem' }}>
                {editingAttr ? 'Chỉnh sửa Thuộc tính' : 'Thêm Thuộc tính mới'}
              </h2>
              <form onSubmit={handleSaveAttribute}>
                <div className="form-group">
                  <label className="form-label">Tên kỹ thuật (ví dụ: ram, color)</label>
                  <input 
                    className="input-field" 
                    required 
                    value={attrForm.name} 
                    onChange={e => setAttrForm({...attrForm, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên hiển thị (ví dụ: Dung lượng RAM)</label>
                  <input 
                    className="input-field" 
                    required 
                    value={attrForm.displayName} 
                    onChange={e => setAttrForm({...attrForm, displayName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gắn vào Danh mục (Tùy chọn)</label>
                  <select 
                    className="input-field"
                    value={attrForm.categoryId}
                    onChange={e => setAttrForm({...attrForm, categoryId: Number(e.target.value)})}
                  >
                    <option value={0}>Dùng chung cho mọi danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <input 
                    type="checkbox" 
                    id="isVariant"
                    checked={attrForm.isVariant}
                    onChange={e => setAttrForm({...attrForm, isVariant: e.target.checked})}
                    style={{ width: 16, height: 16 }}
                  />
                  <label htmlFor="isVariant" style={{ margin: 0, cursor: 'pointer', color: 'var(--text)' }}>
                    Sử dụng làm biến thể (hiển thị nút chọn)
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Lưu</button>
                  <button type="button" className="btn-outline" onClick={() => setShowAttrModal(false)} style={{ flex: 1 }}>Hủy</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style jsx>{`
          .attr-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 24px;
          }
          .attr-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
          }
          .attr-header .btn-primary {
            width: auto;
          }
          .attr-title {
            margin: 0 0 4px;
            font-size: 1.75rem;
            font-weight: 700;
          }
          .attr-subtitle {
            margin: 0;
            color: var(--text-secondary);
            font-size: 0.95rem;
          }
          .attr-layout {
            display: grid;
            grid-template-columns: 1fr 320px;
            gap: 24px;
            align-items: start;
          }
          .attr-table {
            width: 100%;
            border-collapse: collapse;
          }
          .attr-table th {
            text-align: left;
            padding: 16px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            border-bottom: 1px solid var(--border);
          }
          .attr-table td {
            padding: 16px;
            font-size: 0.95rem;
            border-bottom: 1px solid rgba(255,255,255,0.03);
          }
          .attr-table tbody tr {
            cursor: pointer;
            transition: all 0.2s;
          }
          .attr-table tbody tr:hover {
            background: rgba(255,255,255,0.02);
          }
          .attr-table tr.active-row {
            background: rgba(99,102,241,0.08);
          }
          .attr-table code {
            background: rgba(255,255,255,0.05);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.85rem;
            color: var(--accent-light);
          }
          .table-actions {
            display: flex;
            gap: 8px;
          }
          .icon-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;
          }
          .icon-btn:hover { background: rgba(255,255,255,0.1); }
          .icon-btn.delete:hover { background: rgba(239,68,68,0.2); }
          
          .value-list {
            flex: 1;
            padding: 12px;
            overflow-y: auto;
            max-height: 400px;
          }
          .value-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            border-radius: 8px;
            margin-bottom: 6px;
            font-size: 0.9rem;
          }
          .value-add-form {
            padding: 16px;
            border-top: 1px solid var(--border);
            display: flex;
            gap: 8px;
          }
          .value-item .icon-btn.sm {
            font-size: 1.2rem;
            padding: 0 4px;
            line-height: 1;
            color: #64748b;
          }

          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .modal-content {
            width: 100%;
            max-width: 450px;
            padding: 32px;
          }
        `}</style>
      </main>
    </>
  );
}
