'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { priceListApi, PriceListDTO, productApi, ProductDTO } from '@/lib/api';

export default function PriceUpdateVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [priceLists, setPriceLists] = useState<PriceListDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedPLIds, setSelectedPLIds] = useState<number[]>([]);
  const [items, setItems] = useState<{ productId: number; newPrice: number; productName: string }[]>([]);

  const { user } = useAuth();
  const isCompany = user?.roles.includes('ROLE_COMPANY');

  useEffect(() => {
    if (isCompany) {
      loadData();
    }
  }, [isCompany]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [vRes, plData, pData] = await Promise.all([
        fetch('/api/price-vouchers', { headers: { Authorization: `Bearer ${token}` } }),
        priceListApi.getAll(),
        productApi.getAll()
      ]);
      
      if (vRes.ok) setVouchers(await vRes.ok ? await vRes.json() : []);
      setPriceLists(plData);
      setProducts(pData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name,
        description,
        scheduledAt: new Date(scheduledAt).toISOString(),
        priceListIds: selectedPLIds,
        items: items.map(it => ({ productId: it.productId, newPrice: it.newPrice }))
      };

      const res = await fetch('/api/price-vouchers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        loadData();
        // Reset form
        setName(''); setDescription(''); setScheduledAt(''); setSelectedPLIds([]); setItems([]);
      }
    } catch (err) {
      alert('Lỗi khi tạo phiếu');
    }
  };

  const addProduct = (productId: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    if (items.some(it => it.productId === productId)) return;
    setItems([...items, { productId, newPrice: prod.basePrice || 0, productName: prod.name }]);
  };

  if (!isCompany) return <div className="p-8">Bạn không có quyền truy cập.</div>;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
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
                {vouchers.map(v => (
                  <tr key={v.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{v.name}</td>
                    <td style={{ padding: '16px 20px' }}>{new Date(v.scheduledAt).toLocaleString('vi-VN')}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge ${v.status === 'APPLIED' ? 'badge-success' : v.status === 'CANCELLED' ? 'badge-error' : 'badge-warning'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>{v.items?.length || 0} sản phẩm</td>
                    <td style={{ padding: '16px 20px' }}>{new Date(v.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content glass-card" style={{ maxWidth: 800, width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: 40 }}>
              <h2 style={{ marginBottom: 24 }}>Tạo phiếu cập nhật giá mới</h2>
              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Tên phiếu</label>
                    <input className="input-field" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Thời điểm thực hiện</label>
                    <input className="input-field" type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Áp dụng cho các bảng giá</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {priceLists.map(pl => (
                      <label key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedPLIds.includes(pl.id)} 
                          onChange={e => {
                            if (e.target.checked) setSelectedPLIds([...selectedPLIds, pl.id]);
                            else setSelectedPLIds(selectedPLIds.filter(id => id !== pl.id));
                          }}
                        />
                        {pl.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Danh sách sản phẩm & giá mới</label>
                  <select className="input-field" onChange={e => addProduct(Number(e.target.value))} defaultValue="">
                    <option value="" disabled>-- Chọn sản phẩm để thêm vào phiếu --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>

                  <div style={{ marginTop: 12 }}>
                    {items.map((it, idx) => (
                      <div key={it.productId} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <span style={{ flex: 1, fontSize: '0.9rem' }}>{it.productName}</span>
                        <input 
                          type="number" 
                          className="input-field" 
                          style={{ width: 150 }} 
                          value={it.newPrice} 
                          onChange={e => {
                            const newItems = [...items];
                            newItems[idx].newPrice = Number(e.target.value);
                            setItems(newItems);
                          }}
                        />
                        <button type="button" style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" className="btn" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">Lưu phiếu</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

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
