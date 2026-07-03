'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/context/AuthContext';
import { priceOverrideVoucherApi, PriceOverrideVoucherDTO, PriceOverrideVoucherItemDTO } from '@/modules/price/priceApi';
import { productApi, ProductDTO, categoryApi, CategoryDTO } from '@/lib/api';

const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

type ItemEntry = { agencyId: number; agencyName: string; productId: number; productName: string; newPrice: number; isVisible: boolean };

export default function PriceOverrideVouchersPage() {
  const [vouchers, setVouchers] = useState<PriceOverrideVoucherDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [items, setItems] = useState<ItemEntry[]>([]);
  const [saving, setSaving] = useState(false);

  // Resources
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [agencies, setAgencies] = useState<{ id: number; name: string }[]>([]);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  // Bulk picker
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkAgencyIds, setBulkAgencyIds] = useState<number[]>([]);
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkCatFilter, setBulkCatFilter] = useState<number | null>(null);
  const [bulkSelected, setBulkSelected] = useState<number[]>([]);

  // CSV import
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvDragOver, setCsvDragOver] = useState(false);
  const [csvResult, setCsvResult] = useState<{ matched: { agencyId: number; productId: number; price: number }[]; notFound: string[] } | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvFileRef = useRef<HTMLInputElement>(null);

  const { user, token } = useAuth();
  const isCompany = user?.roles.includes('ROLE_COMPANY');

  useEffect(() => {
    if (isCompany) { loadData(); loadResources(); }
  }, [isCompany, page]);

  const loadResources = async () => {
    if (resourcesLoaded) return;
    try {
      const [pData, catData] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
      ]);
      setProducts(pData);
      setCategories(catData);
      // Fetch agencies
      const res = await fetch('http://localhost:8080/api/agencies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const aData = await res.json();
        setAgencies(Array.isArray(aData) ? aData.map((a: any) => ({ id: a.id, name: a.name })) : []);
      }
      setResourcesLoaded(true);
    } catch (err) { console.error(err); }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const vData = await priceOverrideVoucherApi.getAll(page, pageSize);
      if (Array.isArray(vData)) {
        setVouchers(vData);
        setTotalPages(Math.ceil(vData.length / pageSize) || 1);
      } else {
        setVouchers(vData.content);
        setTotalPages(vData.totalPages);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { alert('Vui lòng thêm ít nhất 1 sản phẩm!'); return; }
    setSaving(true);
    try {
      await priceOverrideVoucherApi.create({
        name,
        description,
        scheduledAt: scheduledAt.length === 16 ? scheduledAt + ':00' : scheduledAt,
        items: items.map(it => ({ agencyId: it.agencyId, productId: it.productId, newPrice: it.newPrice, isVisible: it.isVisible }))
      });
      setShowModal(false);
      loadData();
      resetForm();
    } catch { alert('Lỗi khi tạo phiếu'); }
    finally { setSaving(false); }
  };

  const resetForm = () => {
    setName(''); setDescription(''); setScheduledAt('');
    setItems([]); setBulkSelected([]); setCsvResult(null);
  };

  const addItem = (agencyId: number, productId: number) => {
    const agency = agencies.find(a => a.id === agencyId);
    const prod = products.find(p => p.id === productId);
    if (!agency || !prod) return;
    if (items.some(it => it.agencyId === agencyId && it.productId === productId)) return;
    setItems(prev => [...prev, { agencyId, agencyName: agency.name, productId, productName: prod.name, newPrice: prod.basePrice || 0, isVisible: true }]);
  };

  // ── Bulk picker ──
  const openBulkPicker = () => {
    setBulkAgencyIds([]);
    setBulkSelected(items.map(it => it.productId));
    setBulkSearch('');
    setBulkCatFilter(null);
    setBulkOpen(true);
  };

  const confirmBulkPicker = () => {
    const newItems: ItemEntry[] = [];
    bulkAgencyIds.forEach(aid => {
      const agency = agencies.find(a => a.id === aid);
      if (!agency) return;
      bulkSelected.forEach(pid => {
        const existing = items.find(it => it.agencyId === aid && it.productId === pid);
        if (existing) { newItems.push(existing); return; }
        const prod = products.find(p => p.id === pid);
        if (!prod) return;
        newItems.push({ agencyId: aid, agencyName: agency.name, productId: pid, productName: prod.name, newPrice: prod.basePrice || 0, isVisible: true });
      });
    });
    setItems(prev => {
      const combined = [...prev, ...newItems];
      const seen = new Set();
      return combined.filter(it => { const k = `${it.agencyId}-${it.productId}`; if (seen.has(k)) return false; seen.add(k); return true; });
    });
    setBulkOpen(false);
  };

  const selectAllProducts = () => {
    if (!confirm(`Thêm TẤT CẢ sản phẩm cho đại lý đã chọn?`)) return;
    const agencyIds = items.map(it => it.agencyId);
    if (agencyIds.length === 0) { alert('Vui lòng thêm ít nhất 1 đại lý trước'); return; }
    const uniqueAgents = [...new Set(agencyIds)];
    const newItems: ItemEntry[] = [];
    uniqueAgents.forEach(aid => {
      const agency = agencies.find(a => a.id === aid);
      if (!agency) return;
      products.forEach(prod => {
        if (items.some(it => it.agencyId === aid && it.productId === prod.id)) return;
        newItems.push({ agencyId: aid, agencyName: agency.name, productId: prod.id, productName: prod.name, newPrice: prod.basePrice || 0, isVisible: true });
      });
    });
    setItems(prev => [...prev, ...newItems]);
  };

  // ── CSV import ──
  const handleCsvFile = async (file: File) => {
    setCsvLoading(true);
    setCsvResult(null);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const matched: { agencyId: number; productId: number; price: number }[] = [];
      const notFound: string[] = [];

      lines.forEach((line, idx) => {
        const parts = line.split(',');
        if (parts.length < 3) return;
        const agencyRaw = parts[0].trim();
        const prodRaw = parts[1].trim();
        const priceRaw = parts[2] ? parts[2].trim() : '0';

        const agencyNum = parseInt(agencyRaw, 10);
        const agency = agencies.find(a => a.id === agencyNum || a.name.toLowerCase() === agencyRaw.toLowerCase());
        const prodNum = parseInt(prodRaw, 10);
        const prod = products.find(p => p.id === prodNum || p.name.toLowerCase() === prodRaw.toLowerCase());

        if (agency && prod) {
          matched.push({ agencyId: agency.id, productId: prod.id, price: parseFloat(priceRaw) || 0 });
        } else {
          notFound.push(`Dòng ${idx + 1}: agency=${agencyRaw}, product=${prodRaw}`);
        }
      });

      if (matched.length > 0) {
        const newItems: ItemEntry[] = matched.map(m => {
          const agency = agencies.find(a => a.id === m.agencyId)!;
          const prod = products.find(p => p.id === m.productId)!;
          return { agencyId: m.agencyId, agencyName: agency.name, productId: m.productId, productName: prod.name, newPrice: m.price, isVisible: true };
        });
        setItems(prev => {
          const seen = new Set(prev.map(it => `${it.agencyId}-${it.productId}`));
          return [...prev, ...newItems.filter(it => !seen.has(`${it.agencyId}-${it.productId}`))];
        });
      }
      setCsvResult({ matched, notFound });
    } catch { alert('Lỗi đọc file CSV'); }
    finally { setCsvLoading(false); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Hủy phiếu này?')) return;
    try {
      await priceOverrideVoucherApi.cancel(id);
      loadData();
    } catch { alert('Lỗi khi hủy phiếu'); }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, { bg: string; color: string; label: string }> = {
      PENDING: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', label: '⏳ Đang chờ' },
      APPLIED: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: '✅ Đã áp dụng' },
      CANCELLED: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: '❌ Đã hủy' },
    };
    const s = colors[status] || { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af', label: status };
    return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{s.label}</span>;
  };

  const formatDateTime = (dt: string) => {
    try { return new Date(dt).toLocaleString('vi-VN'); } catch { return dt; }
  };

  const filteredProducts = products.filter(p => {
    if (bulkSearch && !p.name.toLowerCase().includes(bulkSearch.toLowerCase())) return false;
    if (bulkCatFilter && p.categoryId !== bulkCatFilter) return false;
    return true;
  });

  if (!isCompany) return (
    <>
      <Navbar />
      <Main><div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Bạn không có quyền truy cập</div></Main>
    </>
  );

  return (
    <>
      <Navbar />
      <Main>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>📅 Phiếu hẹn giờ Override giá</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Lên lịch override giá cho từng đại lý theo từng sản phẩm
            </p>
          </div>
          <button className="btn-primary" onClick={() => { setShowModal(true); loadResources(); }}>
            + Tạo phiếu mới
          </button>
        </div>

        {/* List */}
        {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Đang tải...</div> : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {vouchers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: 16 }}>
                  Chưa có phiếu hẹn giờ nào
                </div>
              ) : vouchers.map(v => (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ flex: 2 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{v.description || ''}</div>
                  </div>
                  <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    🕐 {formatDateTime(v.scheduledAt)}
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    {v.items?.length || 0} sản phẩm
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    {statusBadge(v.status)}
                  </div>
                  <div>
                    {v.status === 'PENDING' && (
                      <button className="btn-outline" style={{ color: '#ef4444', padding: '6px 14px', fontSize: '0.78rem', borderRadius: 8 }}
                        onClick={() => handleCancel(v.id)}>
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Main>

      {/* ── Create Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', overflow: 'auto' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 32, maxWidth: 900, width: '95%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>📅 Tạo phiếu hẹn giờ Override giá</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>Tên phiếu *</label>
                  <input className="input-field" value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Override Tết 2024" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>Thời điểm thực hiện *</label>
                  <input className="input-field" type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>Mô tả</label>
                <textarea className="input-field" value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Ghi chú..." style={{ resize: 'vertical' }} />
              </div>

              {/* Items */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Danh sách sản phẩm override
                    <span style={{ marginLeft: 8, background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {items.length} mục
                    </span>
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={openBulkPicker}
                      style={{ padding: '7px 14px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(52,211,153,0.4)', background: 'rgba(52,211,153,0.08)', color: '#34d399' }}>
                      📋 Chọn nhiều
                    </button>
                    <button type="button" onClick={() => setCsvOpen(true)}
                      style={{ padding: '7px 14px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.08)', color: '#fbbf24' }}>
                      📤 Import Excel
                    </button>
                    <button type="button" onClick={selectAllProducts}
                      style={{ padding: '7px 14px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(167,139,250,0.4)', background: 'rgba(167,139,250,0.08)', color: '#a78bfa' }}>
                      ✅ Tất cả SP
                    </button>
                  </div>
                </div>

                {/* Quick add single row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <select className="input-field" style={{ flex: 1 }} defaultValue="" onChange={e => { if (e.target.value) { setItems(prev => [...prev, { agencyId: Number(e.target.value), agencyName: agencies.find(a => a.id === Number(e.target.value))?.name || '', productId: 0, productName: '', newPrice: 0, isVisible: true }]); e.target.value = ''; } }}>
                    <option value="" disabled>+ Chọn đại lý</option>
                    {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <select className="input-field" style={{ flex: 1 }} defaultValue="" onChange={e => { if (e.target.value && items.length > 0) { const last = items[items.length - 1]; if (!last.productId) { const prod = products.find(p => p.id === Number(e.target.value)); if (prod) { const updated = [...items]; updated[updated.length - 1] = { ...last, productId: prod.id, productName: prod.name, newPrice: prod.basePrice || 0 }; setItems(updated); } } } }}>
                    <option value="" disabled>+ Chọn sản phẩm</option>
                    {products.filter(p => !items.some(it => it.productId === p.id && it.agencyId === (items[items.length - 1]?.agencyId || 0))).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                {items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 20px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 14, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Chưa có mục nào. Dùng "Chọn nhiều" hoặc chọn từ dropdown phía trên.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                    {items.map((it, idx) => (
                      <div key={`${it.agencyId}-${it.productId}-${idx}`} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div style={{ flex: '0 0 180px', fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.agencyName}</div>
                        <div style={{ flex: 1, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.productName}</div>
                        <input type="number" className="input-field" style={{ width: 120, padding: '5px 8px', fontSize: '0.8rem' }} value={it.newPrice} onChange={e => { const updated = [...items]; updated[idx].newPrice = Number(e.target.value); setItems(updated); }} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <input type="checkbox" checked={it.isVisible} onChange={e => { const updated = [...items]; updated[idx].isVisible = e.target.checked; setItems(updated); }} style={{ accentColor: '#6366f1' }} />
                          Hiện
                        </label>
                        <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}><IconX /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? '⏳ Đang lưu...' : 'Tạo phiếu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Bulk Picker Modal ── */}
      {bulkOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 28, maxWidth: 700, width: '95%', maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>📋 Chọn đại lý & sản phẩm</h3>

            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>Chọn đại lý</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {agencies.map(a => (
                <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: bulkAgencyIds.includes(a.id) ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${bulkAgencyIds.includes(a.id) ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem' }}>
                  <input type="checkbox" checked={bulkAgencyIds.includes(a.id)} onChange={e => { if (e.target.checked) setBulkAgencyIds([...bulkAgencyIds, a.id]); else setBulkAgencyIds(bulkAgencyIds.filter(id => id !== a.id)); }} style={{ accentColor: '#6366f1' }} />
                  {a.name}
                </label>
              ))}
            </div>

            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>Chọn sản phẩm</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input className="input-field" placeholder="Tìm sản phẩm..." value={bulkSearch} onChange={e => setBulkSearch(e.target.value)} style={{ flex: 1 }} />
              <select className="input-field" value={bulkCatFilter ?? ''} onChange={e => setBulkCatFilter(e.target.value ? Number(e.target.value) : null)} style={{ width: 180 }}>
                <option value="">Tất cả danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.8rem' }}>
                <input type="checkbox" checked={bulkSelected.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={e => { if (e.target.checked) setBulkSelected(filteredProducts.map(p => p.id)); else setBulkSelected([]); }} style={{ accentColor: '#6366f1' }} />
                Chọn tất cả ({filteredProducts.length})
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 240, overflowY: 'auto', marginBottom: 20 }}>
              {filteredProducts.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem', background: bulkSelected.includes(p.id) ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
                  <input type="checkbox" checked={bulkSelected.includes(p.id)} onChange={e => { if (e.target.checked) setBulkSelected([...bulkSelected, p.id]); else setBulkSelected(bulkSelected.filter(id => id !== p.id)); }} style={{ accentColor: '#6366f1' }} />
                  {p.name}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" className="btn-outline" onClick={() => setBulkOpen(false)}>Hủy</button>
              <button type="button" className="btn-primary" onClick={confirmBulkPicker} disabled={bulkAgencyIds.length === 0 || bulkSelected.length === 0}>
                Thêm {bulkAgencyIds.length * bulkSelected.length} mục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSV Import Modal ── */}
      {csvOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 28, maxWidth: 600, width: '95%', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>📤 Import Excel</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              File CSV với cột: <code>agency_id, product_id, new_price</code>
            </p>
            <div
              onDragOver={e => { e.preventDefault(); setCsvDragOver(true); }}
              onDragLeave={() => setCsvDragOver(false)}
              onDrop={e => { e.preventDefault(); setCsvDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleCsvFile(f); }}
              onClick={() => csvFileRef.current?.click()}
              style={{ border: `2px dashed ${csvDragOver ? 'rgba(99,102,241,0.6)' : 'var(--border)'}`, borderRadius: 14, padding: 40, textAlign: 'center', cursor: 'pointer', background: csvDragOver ? 'rgba(99,102,241,0.08)' : 'transparent', transition: 'all 0.2s', marginBottom: 16 }}>
              <input ref={csvFileRef} type="file" accept=".csv,.xlsx" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleCsvFile(f); }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {csvLoading ? '⏳ Đang xử lý...' : 'Kéo thả file CSV vào đây, hoặc click để chọn file'}
              </div>
            </div>

            {csvResult && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 600 }}>✅ {csvResult.matched.length} dòng khớp</div>
                {csvResult.notFound.length > 0 && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>
                    ❌ {csvResult.notFound.length} dòng không tìm thấy:
                    <div style={{ maxHeight: 100, overflowY: 'auto', marginTop: 4 }}>
                      {csvResult.notFound.map((n, i) => <div key={i}>{n}</div>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline" onClick={() => { setCsvOpen(false); setCsvResult(null); }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
