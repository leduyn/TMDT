'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

interface PriceListItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  price: number;
  isVisible: boolean;
}

interface PriceList {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
  active: boolean;
}

export default function PriceListDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  
  // State
  const [priceList, setPriceList] = useState<PriceList | null>(null);
  const [items, setItems] = useState<PriceListItem[]>([]);
  const [activeTab, setActiveTab] = useState<'prices'>('prices');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Effects
  useEffect(() => {
    console.log('PriceListDetailPage loaded', id);
    fetchData();
  }, [id]);



  // Handlers
  const fetchData = async () => {
    try {
      const [plRes, itemsRes] = await Promise.all([
        fetch(`http://localhost:8080/api/price-lists/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`http://localhost:8080/api/price-lists/${id}/items`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const plData = await plRes.json();
      const itemsData = await itemsRes.json();
      
      setPriceList(plData);
      if (Array.isArray(itemsData)) setItems(itemsData);
      else setItems([]);
    } catch (err) {
      console.error('Failed to fetch data', err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePrice = async (productId: number, newPrice: number, isVisible: boolean) => {
    try {
      await fetch(`http://localhost:8080/api/price-lists/${id}/items`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, price: newPrice, isVisible })
      });
      setItems(prev => prev.map(item => 
        item.productId === productId ? { ...item, price: newPrice, isVisible } : item
      ));
    } catch (err) {
      alert('Cập nhật thất bại');
    }
  };



  const filteredItems = items.filter(item => 
    item.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || !priceList) return <div className="loading-spinner" />;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{priceList.name}</h1>
            {priceList.isDefault && <span className="badge badge-warning">Mặc định</span>}
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{priceList.description || 'Không có mô tả'}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
          {(['prices'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 4px',
                background: 'none',
                border: 'none',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? 600 : 500,
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Danh sách giá
            </button>
          ))}
        </div>

        {activeTab === 'prices' && (
          <div className="fade-in">
            <div style={{ marginBottom: 20 }}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  color: 'white',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div className="glass-card" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left' }}>Sản phẩm</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center' }}>Giá thiết lập</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center' }}>Hiển thị</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img src={item.productImageUrl || '/placeholder.png'} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                          <span style={{ fontWeight: 500 }}>{item.productName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <input
                          type="number"
                          defaultValue={item.price}
                          onBlur={(e) => handleUpdatePrice(item.productId, parseFloat(e.target.value), item.isVisible)}
                          style={{
                            width: 120,
                            padding: '8px',
                            textAlign: 'right',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            color: item.price === -1 ? 'var(--text-muted)' : 'var(--accent-light)'
                          }}
                        />
                        {item.price === -1 && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Liên hệ</div>}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={item.isVisible}
                          onChange={(e) => handleUpdatePrice(item.productId, item.price, e.target.checked)}
                          style={{ width: 18, height: 18, cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button className="btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Lịch sử</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


      </main>
    </>
  );
}
