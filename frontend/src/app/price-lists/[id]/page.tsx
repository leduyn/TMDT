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
  const [activeTab, setActiveTab] = useState<'prices' | 'conditions' | 'agencies'>('prices');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [conditions, setConditions] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [assignedAgencyIds, setAssignedAgencyIds] = useState<number[]>([]);
  const [customerGroups, setCustomerGroups] = useState<any[]>([]);

  // Effects
  useEffect(() => {
    console.log('PriceListDetailPage loaded', id);
    fetchData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'conditions') {
      fetch(`http://localhost:8080/api/customer-groups`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json()).then(d => setCustomerGroups(Array.isArray(d) ? d : []));
    }
    if (activeTab === 'agencies') {
      fetch(`http://localhost:8080/api/agencies`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json()).then(d => setAgencies(Array.isArray(d) ? d : []));
      fetch(`http://localhost:8080/api/price-lists/${id}/assigned-agencies`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json()).then(d => setAssignedAgencyIds(Array.isArray(d) ? d : []));
    }
  }, [activeTab, token]);

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

  const handleAddCondition = async (conditionType: string, value: string | number) => {
    try {
      await fetch(`http://localhost:8080/api/price-lists/conditions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceListId: id, 
          conditionType, 
          rankLevel: conditionType === 'AGENCY_RANK' ? value : null,
          customerGroupId: conditionType === 'CUSTOMER_GROUP' ? value : null
        })
      });
      alert('Đã thêm điều kiện thành công');
    } catch (err) {
      alert('Lỗi khi thêm điều kiện');
    }
  };

  const toggleAssignAgency = async (agencyId: number) => {
    const isAssigned = assignedAgencyIds.includes(agencyId);
    try {
      if (isAssigned) {
        await fetch(`http://localhost:8080/api/price-lists/unassign-agency/${agencyId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setAssignedAgencyIds(prev => prev.filter(aid => aid !== agencyId));
      } else {
        await fetch(`http://localhost:8080/api/price-lists/assign-agency`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ agencyId, priceListId: id })
        });
        setAssignedAgencyIds(prev => [...prev, agencyId]);
      }
    } catch (err) {
      alert('Lỗi khi cập nhật chỉ định');
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
          {(['prices', 'conditions', 'agencies'] as const).map(tab => (
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
              {tab === 'prices' ? 'Danh sách giá' : tab === 'conditions' ? 'Điều kiện áp dụng' : 'Đại lý được chỉ định'}
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

        {activeTab === 'conditions' && (
          <div className="fade-in glass-card" style={{ padding: 32 }}>
            <h3 style={{ marginBottom: 20 }}>Thiết lập điều kiện áp dụng tự động</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <h4 style={{ color: 'var(--accent-light)', marginBottom: 12 }}>Cho Đại lý</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map(rank => (
                    <button key={rank} className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => handleAddCondition('AGENCY_RANK', rank)}>
                      Áp dụng cho hạng: {rank} <span>+</span>
                    </button>
                  ))}
                  <button className="btn-outline" onClick={() => handleAddCondition('ALL_AGENCY', 'ALL')}>Áp dụng cho TẤT CẢ đại lý <span>+</span></button>
                </div>
              </div>
              <div>
                <h4 style={{ color: 'var(--accent-light)', marginBottom: 12 }}>Cho Khách lẻ</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {customerGroups.map(group => (
                    <button key={group.id} className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => handleAddCondition('CUSTOMER_GROUP', group.id)}>
                      Nhóm: {group.name} <span>+</span>
                    </button>
                  ))}
                  <button className="btn-outline" onClick={() => handleAddCondition('ALL_CUSTOMER', 'ALL')}>Áp dụng cho TẤT CẢ khách lẻ <span>+</span></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agencies' && (
          <div className="fade-in glass-card" style={{ padding: 32 }}>
            <h3 style={{ marginBottom: 20 }}>Chỉ định trực tiếp cho Đại lý</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Việc chỉ định trực tiếp sẽ ghi đè mọi thiết lập điều kiện tự động khác.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {agencies.map(agency => {
                const isAssigned = assignedAgencyIds.includes(agency.id);
                return (
                  <div 
                    key={agency.id} 
                    className={`glass-card ${isAssigned ? 'assigned' : ''}`} 
                    style={{ 
                      cursor: 'pointer', 
                      padding: '16px',
                      border: isAssigned ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: isAssigned ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }} 
                    onClick={() => toggleAssignAgency(agency.id)}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{agency.name || `Agency #${agency.id}`}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{agency.phone || 'Không có SĐT'}</div>
                    </div>
                    {isAssigned && <span style={{ color: 'var(--accent)', fontWeight: 900 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
