'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/context/AuthContext';
import { priceListApi, PriceListDTO, productApi, ProductDTO, priceUpdateVoucherApi, PriceUpdateVoucherDTO, categoryApi, CategoryDTO } from '@/lib/api';
import SearchableSelect from '@/components/ui/SearchableSelect';

// ─── Icons (inline SVGs to avoid extra deps) ─────────────────────────────────
const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const IconListChecks = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 6H21M10 12H21M10 18H21M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>
  </svg>
);
const IconSquare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);
const IconCheckSquare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconSheet = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
// ─────────────────────────────────────────────────────────────────────────────

type ItemEntry = { productId: number; newPrice: number; productName: string; isVisible: boolean };

export default function PriceUpdateVouchersPage() {
  const [vouchers, setVouchers] = useState<PriceUpdateVoucherDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [priceLists, setPriceLists] = useState<PriceListDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [defaultPriceListItems, setDefaultPriceListItems] = useState<any[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedPLIds, setSelectedPLIds] = useState<number[]>([]);
  const [items, setItems] = useState<ItemEntry[]>([]);

  // ── Bulk product picker modal ──
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkCatFilter, setBulkCatFilter] = useState<number | null>(null);
  const [bulkSelected, setBulkSelected] = useState<number[]>([]);

  // ── CSV import modal ──
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvDragOver, setCsvDragOver] = useState(false);
  const [csvResult, setCsvResult] = useState<{ matched: { id: number; name: string; price: number }[]; notFound: string[] } | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvFileRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const isCompany = user?.roles.includes('ROLE_COMPANY');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    if (isCompany) loadData();
  }, [isCompany]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, plData, pData, catData] = await Promise.all([
        priceUpdateVoucherApi.getAll(),
        priceListApi.getAll(),
        productApi.getAll(),
        categoryApi.getAll(),
      ]);
      setVouchers(vData);
      setPriceLists(plData);
      setProducts(pData);
      setCategories(catData);

      const defaultPL = plData.find(pl => pl.isDefault);
      if (defaultPL) {
        const res = await priceListApi.getItems(defaultPL.id, 0, 9999);
        setDefaultPriceListItems(res.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm vào phiếu!');
      return;
    }
    try {
      const payload = {
        name,
        description,
        scheduledAt: scheduledAt.length === 16 ? scheduledAt + ':00' : scheduledAt,
        priceListIds: selectedPLIds,
        items: items.map(it => ({ productId: it.productId, newPrice: it.newPrice, isVisible: it.isVisible }))
      };
      await priceUpdateVoucherApi.create(payload);
      setShowModal(false);
      loadData();
      resetForm();
    } catch {
      alert('Lỗi khi tạo phiếu');
    }
  };

  const resetForm = () => {
    setName(''); setDescription(''); setScheduledAt('');
    setSelectedPLIds([]); setItems([]);
    setBulkSelected([]); setCsvResult(null);
  };

  const getDefaultPrice = (productId: number) => {
    const item = defaultPriceListItems.find(it => it.productId === productId);
    if (!item) {
      const prod = products.find(p => p.id === productId);
      return prod?.basePrice !== undefined ? `${prod.basePrice.toLocaleString('vi-VN')} đ` : '—';
    }
    if (item.price === -1) {
      return 'Liên hệ';
    }
    return `${item.price.toLocaleString('vi-VN')} đ`;
  };

  const addSingleProduct = (productId: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    if (items.some(it => it.productId === productId)) return;
    setItems(prev => [...prev, { productId, newPrice: prod.basePrice || 0, productName: prod.name, isVisible: true }]);
  };

  // ── Bulk picker ────────────────────────────────────────────────────────────
  const openBulkPicker = () => {
    setBulkSelected(items.map(it => it.productId));
    setBulkSearch('');
    setBulkCatFilter(null);
    setBulkOpen(true);
  };

  const confirmBulkPicker = () => {
    const newItems: ItemEntry[] = bulkSelected.map(pid => {
      const existing = items.find(it => it.productId === pid);
      if (existing) return existing;
      const prod = products.find(p => p.id === pid)!;
      return { productId: pid, newPrice: prod.basePrice || 0, productName: prod.name, isVisible: true };
    });
    setItems(newItems);
    setBulkOpen(false);
  };

  const selectAllProducts = () => {
    if (!confirm(`Thêm TẤT CẢ ${products.length} sản phẩm vào phiếu?`)) return;
    const newItems: ItemEntry[] = products.map(prod => {
      const existing = items.find(it => it.productId === prod.id);
      return existing ?? { productId: prod.id, newPrice: prod.basePrice || 0, productName: prod.name, isVisible: true };
    });
    setItems(newItems);
  };

  // ── CSV import ─────────────────────────────────────────────────────────────
  const parseCSV = (text: string) => {
    setCsvLoading(true);
    try {
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const matched: { id: number; name: string; price: number }[] = [];
      const notFound: string[] = [];

      lines.forEach(line => {
        const parts = line.split(',');
        const raw = parts[0].trim();
        const priceRaw = parts[1] ? parts[1].trim() : '';

        // Try numeric ID
        const numId = parseInt(raw, 10);
        let prod: ProductDTO | undefined;
        if (!isNaN(numId)) {
          prod = products.find(p => p.id === numId);
        }
        if (!prod) {
          prod = products.find(p => p.name.toLowerCase() === raw.toLowerCase());
        }
        if (!prod && raw) {
          prod = products.find(p => p.sku && p.sku.toLowerCase() === raw.toLowerCase());
        }

        if (prod) {
          if (!matched.find(m => m.id === prod!.id)) {
            const price = parseFloat(priceRaw) || prod.basePrice || 0;
            matched.push({ id: prod.id, name: prod.name, price });
          }
        } else {
          notFound.push(raw);
        }
      });

      setCsvResult({ matched, notFound });
    } finally {
      setCsvLoading(false);
    }
  };

  const handleCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => parseCSV(e.target?.result as string);
    reader.readAsText(file, 'UTF-8');
  };

  const confirmCSVImport = () => {
    if (!csvResult) return;
    const newItems: ItemEntry[] = csvResult.matched.map(m => {
      const existing = items.find(it => it.productId === m.id);
      return existing ?? { productId: m.id, newPrice: m.price, productName: m.name, isVisible: true };
    });
    // merge: keep existing items, add new ones
    const merged = [...items];
    newItems.forEach(ni => {
      if (!merged.find(it => it.productId === ni.productId)) merged.push(ni);
      else {
        const idx = merged.findIndex(it => it.productId === ni.productId);
        merged[idx].newPrice = ni.newPrice; // update price from CSV if already exists
      }
    });
    setItems(merged);
    setCsvOpen(false);
    setCsvResult(null);
  };

  const downloadSampleCSV = () => {
    const header = 'ID,Tên sản phẩm (hoặc tên/SKU),Giá mới (tuỳ chọn)';
    const rows = products.slice(0, 5).map(p => `${p.id},${p.name},${p.basePrice || 0}`).join('\n');
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mau_import_gia.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!isCompany) return <div className="p-8">Bạn không có quyền truy cập.</div>;

  const totalPages = Math.ceil(vouchers.length / pageSize) || 1;
  const paginatedData = vouchers.slice(page * pageSize, (page + 1) * pageSize);

  // ── Bulk picker filter ─────────────────────────────────────────────────────
  const bulkFiltered = products.filter(p => {
    const matchSearch = !bulkSearch || p.name.toLowerCase().includes(bulkSearch.toLowerCase()) || (p.sku || '').toLowerCase().includes(bulkSearch.toLowerCase());
    const matchCat = !bulkCatFilter || p.categoryId === bulkCatFilter;
    return matchSearch && matchCat;
  });
  const allFilteredSelected = bulkFiltered.length > 0 && bulkFiltered.every(p => bulkSelected.includes(p.id));

  return (
    <>
      <Navbar />
      <Main>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
              ⏰ <span className="gradient-text">Phiếu cập nhật giá</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
              Quản lý các đợt cập nhật giá sản phẩm hàng loạt
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Tạo phiếu mới
          </button>
        </div>

        {/* Voucher list */}
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                <tr>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Tên phiếu</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Thời gian hẹn</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Trạng thái</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Sản phẩm</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(v => (
                  <tr key={v.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                      <a href={`/price-update-vouchers/${v.id}`} style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>
                        {v.name}
                      </a>
                    </td>
                    <td style={{ padding: '16px 20px' }}>{new Date(v.scheduledAt).toLocaleString('vi-VN')}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge ${v.status === 'APPLIED' ? 'badge-success' : v.status === 'CANCELLED' ? 'badge-error' : 'badge-warning'}`}>
                        {v.status === 'PENDING' ? 'Đang chờ' : v.status === 'APPLIED' ? 'Đã áp dụng' : 'Đã hủy'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>{v.items?.length || 0} sản phẩm</td>
                    <td style={{ padding: '16px 20px' }}>{new Date(v.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vouchers.length > 0 && (
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center' }}>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}

        {/* ══════════ CREATE VOUCHER MODAL ══════════ */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content glass-card" style={{ maxWidth: 860, width: '94%', maxHeight: '92vh', overflowY: 'auto', padding: 40 }}>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Tạo phiếu cập nhật giá mới</h2>
                  <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Cập nhật giá hàng loạt và đặt lịch áp dụng
                  </p>
                </div>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <IconX />
                </button>
              </div>

              <form onSubmit={handleCreate}>
                {/* Row 1: Name + Schedule */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>Tên phiếu *</label>
                    <input className="input-field" value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Cập nhật giá tháng 6/2026" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>Thời điểm thực hiện *</label>
                    <input className="input-field" type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required />
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>Mô tả</label>
                  <textarea className="input-field" value={description} onChange={e => setDescription(e.target.value)}
                    rows={2} placeholder="Ghi chú về đợt cập nhật giá..." style={{ resize: 'vertical' }} />
                </div>

                {/* Price lists */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 10, fontSize: '0.85rem', fontWeight: 600 }}>Áp dụng cho các bảng giá</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {priceLists.map(pl => (
                      <label key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', background: selectedPLIds.includes(pl.id) ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${selectedPLIds.includes(pl.id) ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={selectedPLIds.includes(pl.id)}
                          onChange={e => { if (e.target.checked) setSelectedPLIds([...selectedPLIds, pl.id]); else setSelectedPLIds(selectedPLIds.filter(id => id !== pl.id)); }}
                          style={{ accentColor: '#6366f1' }}
                        />
                        {pl.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* ── PRODUCT LIST SECTION ─────────────────────────────── */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Danh sách sản phẩm & giá mới
                      <span style={{ marginLeft: 8, background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {items.length} sản phẩm
                      </span>
                    </label>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" onClick={openBulkPicker}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(52,211,153,0.4)', background: 'rgba(52,211,153,0.08)', color: '#34d399', transition: 'all 0.2s' }}>
                        <IconListChecks /> Chọn nhiều
                      </button>
                      <button type="button" onClick={() => setCsvOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.08)', color: '#fbbf24', transition: 'all 0.2s' }}>
                        <IconUpload /> Import CSV
                      </button>
                      <button type="button" onClick={selectAllProducts}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(167,139,250,0.4)', background: 'rgba(167,139,250,0.08)', color: '#a78bfa', transition: 'all 0.2s' }}>
                        <IconCheckSquare /> Tất cả SP
                      </button>
                    </div>
                  </div>

                  {/* Single product dropdown */}
                  <select className="input-field" onChange={e => { addSingleProduct(Number(e.target.value)); e.target.value = ''; }} defaultValue="" style={{ marginBottom: 14 }}>
                    <option value="" disabled>-- Hoặc chọn từng sản phẩm --</option>
                    {products.filter(p => !items.some(it => it.productId === p.id)).map(p => (
                      <option key={p.id} value={p.id}>{p.sku ? `[${p.sku}] ` : ''}{p.name}</option>
                    ))}
                  </select>

                  {/* Items list */}
                  {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 20px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 14, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Chưa có sản phẩm nào. Dùng các nút phía trên để thêm sản phẩm.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
                      {items.map((it, idx) => (
                        <div key={it.productId} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.productName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>ID: {it.productId}</div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Giá mặc định */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Giá mặc định:</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                                {getDefaultPrice(it.productId)}
                              </span>
                            </div>

                            {/* Giá mới */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Giá mới:</span>
                              <input type="number" className="input-field"
                                style={{ width: 130, padding: '7px 10px', fontSize: '0.85rem' }}
                                value={it.newPrice}
                                onChange={e => {
                                  const newItems = [...items];
                                  newItems[idx].newPrice = Number(e.target.value);
                                  setItems(newItems);
                                }}
                              />
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>đ</span>
                            </div>
                          </div>

                          <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                            <input type="checkbox" checked={it.isVisible}
                              onChange={e => {
                                const newItems = [...items];
                                newItems[idx].isVisible = e.target.checked;
                                setItems(newItems);
                              }}
                              style={{ accentColor: '#6366f1' }}
                            />
                            Hiển thị
                          </label>

                          <button type="button"
                            style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', border: 'none', padding: '6px 10px', borderRadius: 7, cursor: 'pointer', flexShrink: 0 }}
                            onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  <button type="button" className="btn" onClick={() => { setShowModal(false); resetForm(); }}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={items.length === 0}>
                    Lưu phiếu ({items.length} SP)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Main>

      {/* ══════════ BULK PRODUCT PICKER MODAL ══════════ */}
      {bulkOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => setBulkOpen(false)}>
          <div style={{ background: '#0f172a', borderRadius: 20, border: '1px solid var(--border)', width: 760, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.7)' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', borderRadius: '20px 20px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                  <IconListChecks />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Chọn nhiều sản phẩm</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Đã chọn: <span style={{ color: '#34d399', fontWeight: 700 }}>{bulkSelected.length}</span> / {products.length} sản phẩm
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setBulkOpen(false)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <IconX />
              </button>
            </div>

            {/* Search + filter */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <IconSearch />
                </span>
                <input type="text" placeholder="Tìm tên sản phẩm hoặc SKU..."
                  value={bulkSearch} onChange={e => setBulkSearch(e.target.value)} autoFocus
                  style={{ width: '100%', padding: '9px 12px 9px 34px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <SearchableSelect
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                value={bulkCatFilter ?? undefined}
                onChange={(val) => setBulkCatFilter(val ? Number(val) : null)}
                placeholder="Tất cả danh mục"
                style={{ minWidth: 160 }}
              />
              <button type="button"
                onClick={() => {
                  if (allFilteredSelected) {
                    setBulkSelected(prev => prev.filter(id => !bulkFiltered.some(p => p.id === id)));
                  } else {
                    setBulkSelected(prev => Array.from(new Set([...prev, ...bulkFiltered.map(p => p.id)])));
                  }
                }}
                style={{ padding: '9px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                  background: allFilteredSelected ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
                  borderColor: allFilteredSelected ? 'rgba(52,211,153,0.4)' : 'var(--border)',
                  color: allFilteredSelected ? '#34d399' : 'var(--text-secondary)'
                }}>
                {allFilteredSelected ? <IconCheckSquare /> : <IconSquare />}
                {allFilteredSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${bulkFiltered.length})`}
              </button>
            </div>

            {/* Product list */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '6px 0' }}>
              {bulkFiltered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>Không tìm thấy sản phẩm nào</div>
              ) : bulkFiltered.map(p => {
                const isSelected = bulkSelected.includes(p.id);
                return (
                  <div key={p.id}
                    onClick={() => setBulkSelected(prev => isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px', cursor: 'pointer',
                      background: isSelected ? 'rgba(52,211,153,0.06)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${isSelected ? '#34d399' : 'rgba(255,255,255,0.2)'}`, background: isSelected ? '#34d399' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      {isSelected && <IconCheck />}
                    </div>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} style={{ width: 42, height: 42, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 42, height: 42, borderRadius: 9, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#34d399', flexShrink: 0 }}>
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 10, marginTop: 2 }}>
                        {p.sku && <span style={{ color: '#818cf8', fontFamily: 'monospace' }}>{p.sku}</span>}
                        {p.categoryName && <span>{p.categoryName}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>{(p.basePrice || 0).toLocaleString()}đ</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tồn: {p.stockQuantity ?? p.stock}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '0 0 20px 20px' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {bulkSelected.length > 0 ? <span>Đã chọn <strong style={{ color: '#34d399' }}>{bulkSelected.length}</strong> sản phẩm</span> : 'Chưa chọn sản phẩm nào'}
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setBulkOpen(false)}
                  style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  Hủy
                </button>
                <button type="button" onClick={confirmBulkPicker} disabled={bulkSelected.length === 0}
                  style={{ padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: bulkSelected.length === 0 ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #059669, #34d399)', border: 'none', color: 'white', opacity: bulkSelected.length === 0 ? 0.5 : 1 }}>
                  Áp dụng {bulkSelected.length > 0 ? `(${bulkSelected.length})` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ IMPORT CSV MODAL ══════════ */}
      {csvOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => { setCsvOpen(false); setCsvResult(null); }}>
          <div style={{ background: '#0f172a', borderRadius: 20, border: '1px solid var(--border)', width: 620, maxHeight: '86vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.7)' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', borderRadius: '20px 20px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                  <IconSheet />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Import sản phẩm từ file CSV</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hỗ trợ: ID, tên sản phẩm, SKU + giá mới</div>
                </div>
              </div>
              <button type="button" onClick={() => { setCsvOpen(false); setCsvResult(null); }}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <IconX />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>
              {!csvResult ? (
                <>
                  {/* Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setCsvDragOver(true); }}
                    onDragLeave={() => setCsvDragOver(false)}
                    onDrop={e => { e.preventDefault(); setCsvDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleCSVFile(f); }}
                    onClick={() => csvFileRef.current?.click()}
                    style={{
                      border: `2px dashed ${csvDragOver ? '#fbbf24' : 'rgba(255,255,255,0.15)'}`,
                      borderRadius: 16, padding: '44px 24px', textAlign: 'center', cursor: 'pointer',
                      background: csvDragOver ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.2s', marginBottom: 20
                    }}>
                    <div style={{ color: '#fbbf24', marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
                      <IconUpload />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>
                      {csvLoading ? '⏳ Đang xử lý file...' : 'Kéo thả file CSV vào đây'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>hoặc nhấp để chọn file từ máy tính (.csv, .txt)</div>
                    <input ref={csvFileRef} type="file" accept=".csv,.txt" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleCSVFile(f); e.target.value = ''; }}
                    />
                  </div>

                  {/* Format guide */}
                  <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📋 Định dạng file CSV</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 2 }}>
                      • Mỗi dòng = một sản phẩm<br />
                      • Cột 1: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 7px', borderRadius: 4, color: '#fbbf24' }}>ID số</code> hoặc <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 7px', borderRadius: 4, color: '#fbbf24' }}>Tên sản phẩm</code> hoặc <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 7px', borderRadius: 4, color: '#fbbf24' }}>SKU</code><br />
                      • Cột 2 (tuỳ chọn): <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 7px', borderRadius: 4, color: '#fbbf24' }}>Giá mới</code> — nếu để trống sẽ lấy giá gốc<br />
                      • Ví dụ: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 7px', borderRadius: 4 }}>42,250000</code> hoặc <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 7px', borderRadius: 4 }}>SKU-001,180000</code>
                    </div>
                  </div>

                  <button type="button" onClick={downloadSampleCSV}
                    style={{ width: '100%', padding: '11px', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <IconSheet /> Tải file mẫu CSV (5 sản phẩm đầu)
                  </button>
                </>
              ) : (
                <>
                  {/* Result */}
                  <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
                    <div style={{ flex: 1, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: 30, fontWeight: 800, color: '#34d399' }}>{csvResult.matched.length}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>✅ Khớp / Thêm được</div>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: 30, fontWeight: 800, color: '#f87171' }}>{csvResult.notFound.length}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>❌ Không tìm thấy</div>
                    </div>
                  </div>

                  {csvResult.matched.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sản phẩm sẽ được thêm vào phiếu:</div>
                      <div style={{ maxHeight: 220, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {csvResult.matched.map(m => (
                          <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                              <IconCheck />
                              <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 10, flexShrink: 0 }}>#{m.id}</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                            </div>
                            <span style={{ color: '#34d399', fontWeight: 700, flexShrink: 0 }}>{m.price.toLocaleString()}đ</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {csvResult.notFound.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Không tìm thấy trên hệ thống:</div>
                      <div style={{ maxHeight: 100, overflowY: 'auto', background: 'rgba(239,68,68,0.05)', borderRadius: 10, padding: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {csvResult.notFound.map((item, i) => (
                          <span key={i} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '3px 9px', fontSize: 11, color: '#f87171', fontFamily: 'monospace' }}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button type="button" onClick={() => setCsvResult(null)}
                    style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    ← Import file khác
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'rgba(0,0,0,0.2)', borderRadius: '0 0 20px 20px' }}>
              <button type="button" onClick={() => { setCsvOpen(false); setCsvResult(null); }}
                style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                Hủy
              </button>
              {csvResult && csvResult.matched.length > 0 && (
                <button type="button" onClick={confirmCSVImport}
                  style={{ padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #d97706, #fbbf24)', border: 'none', color: '#1a1a1a' }}>
                  Thêm {csvResult.matched.length} sản phẩm vào phiếu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .badge {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-warning { background: rgba(245,158,11,0.2); color: #f59e0b; }
        .badge-success { background: rgba(16,185,129,0.2); color: #10b981; }
        .badge-error { background: rgba(239,68,68,0.2); color: #ef4444; }
      `}</style>
    </>
  );
}
