'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

interface PriceUpdateVoucher {
  id: number;
  name: string;
  description: string;
  scheduledAt: string;
  status: 'PENDING' | 'APPLIED' | 'CANCELLED';
  createdAt: string;
  appliedAt: string | null;
}

export default function PriceVouchersPage() {
  const { token } = useAuth();
  const [vouchers, setVouchers] = useState<PriceUpdateVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedPriceLists, setSelectedPriceLists] = useState<number[]>([]);
  const [voucherItems, setVoucherItems] = useState<{productId: number, newPrice: number, isVisible: boolean}[]>([]);
  const [allPriceLists, setAllPriceLists] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchVouchers();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      fetch('http://localhost:8080/api/price-lists', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json()).then(d => setAllPriceLists(Array.isArray(d) ? d : []));
      fetch('http://localhost:8080/api/products', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json()).then(d => setAllProducts(Array.isArray(d) ? d : []));
    }
  }, [showCreateModal, token]);

  const fetchVouchers = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/price-vouchers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setVouchers(data);
      else setVouchers([]);
    } catch (err) {
      console.error('Failed to fetch vouchers', err);
      setVouchers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPriceLists.length === 0 || voucherItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 bảng giá và 1 sản phẩm');
      return;
    }
    try {
      const res = await fetch('http://localhost:8080/api/price-vouchers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name, description, scheduledAt,
          priceListIds: selectedPriceLists,
          items: voucherItems
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchVouchers();
      } else {
        const err = await res.json();
        alert(err.message || 'Lỗi khi tạo phiếu');
      }
    } catch (err) {
      alert('Lỗi hệ thống');
    }
  };

  const togglePriceList = (id: number) => {
    setSelectedPriceLists(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addProductToVoucher = (productId: number) => {
    if (voucherItems.find(i => i.productId === productId)) return;
    setVoucherItems([...voucherItems, { productId, newPrice: -1, isVisible: true }]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-warning">Đang chờ</span>;
      case 'APPLIED': return <span className="badge badge-success">Đã áp dụng</span>;
      case 'CANCELLED': return <span className="badge badge-danger">Đã huỷ</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  if (isLoading) return <div className="loading-spinner" />;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Phiếu <span className="gradient-text">Cập nhật giá</span></h1>
            <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
              Hẹn giờ cập nhật giá hàng loạt cho nhiều bảng giá.
            </p>
          </div>
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => setShowCreateModal(true)}>
            + Tạo phiếu hẹn giờ
          </button>
        </div>

        <div className="glass-card" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Tên phiếu</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Thời gian hẹn</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Ngày tạo</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Chưa có phiếu cập nhật nào được tạo.
                  </td>
                </tr>
              ) : vouchers.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600 }}>{v.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.description || '—'}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ color: 'var(--accent-light)' }}>{new Date(v.scheduledAt).toLocaleString('vi-VN')}</div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    {getStatusBadge(v.status)}
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {new Date(v.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create Voucher Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form className="glass-card fade-in-up" style={{ width: 800, maxHeight: '90vh', overflowY: 'auto', padding: 32 }} onSubmit={handleCreateVoucher}>
            <h2 style={{ marginBottom: 24 }}>Tạo phiếu cập nhật mới</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Tên phiếu</label>
                  <input required value={name} onChange={e => setName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Thời gian áp dụng</label>
                  <input type="datetime-local" required value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 10 }}>Áp dụng cho bảng giá</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {allPriceLists.map(pl => (
                    <div key={pl.id} onClick={() => togglePriceList(pl.id)}
                      className={`badge ${selectedPriceLists.includes(pl.id) ? 'badge-primary' : 'badge-outline'}`}
                      style={{ cursor: 'pointer', padding: '6px 12px' }}>
                      {pl.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 10 }}>Sản phẩm cần cập nhật</label>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <select onChange={(e) => addProductToVoucher(parseInt(e.target.value))}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                  <option value="">-- Chọn sản phẩm để thêm --</option>
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', fontSize: '0.8rem' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Sản phẩm</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Giá mới</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Ẩn/Hiện</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucherItems.map((item, idx) => {
                      const prod = allProducts.find(p => p.id === item.productId);
                      return (
                        <tr key={item.productId} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px', fontSize: '0.9rem' }}>{prod?.name || 'Loading...'}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <input type="number" value={item.newPrice} 
                              onChange={(e) => {
                                const newItems = [...voucherItems];
                                newItems[idx].newPrice = parseFloat(e.target.value);
                                setVoucherItems(newItems);
                              }}
                              style={{ width: 80, padding: 5, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} />
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <input type="checkbox" checked={item.isVisible} 
                              onChange={(e) => {
                                const newItems = [...voucherItems];
                                newItems[idx].isVisible = e.target.checked;
                                setVoucherItems(newItems);
                              }} />
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button type="button" onClick={() => setVoucherItems(voucherItems.filter(x => x.productId !== item.productId))}
                              style={{ color: '#ff4d4f', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" className="btn-outline" style={{ width: 'auto' }} onClick={() => setShowCreateModal(false)}>Hủy</button>
              <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Lưu phiếu & Hẹn giờ</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
