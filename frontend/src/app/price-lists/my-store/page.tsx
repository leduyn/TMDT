'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { useAuth } from '@/context/AuthContext';

interface PriceList {
  id: number;
  name: string;
  description: string;
}

export default function MyStorePriceListPage() {
  const { user, token } = useAuth();
  const [effectivePriceList, setEffectivePriceList] = useState<PriceList | null>(null);
  const [availableLists, setAvailableLists] = useState<PriceList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log('MyStorePriceListPage loaded');
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Use agencyId from user context
      const agencyId = user?.agencyId || user?.id; 
      const [effectiveRes, allRes] = await Promise.all([
        fetch(`/api/price-lists/resolve/agency/${agencyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/price-lists`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      setEffectivePriceList(await effectiveRes.json());
      setAvailableLists(await allRes.json());
    } catch (err) {
      console.error('Failed to fetch store price list data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetStorePriceList = async (plId: number) => {
    try {
      const agencyId = user?.agencyId || user?.id;
      await fetch(`/api/price-lists/my-store/${plId}?agencyId=${agencyId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Đã cập nhật bảng giá cửa hàng thành công!');
    } catch (err) {
      alert('Cập nhật thất bại');
    }
  };

  if (isLoading) return <div className="loading-spinner" />;

  return (
    <>
      <Navbar />
      <Main>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Thiết lập <span className="gradient-text">Cửa hàng</span></h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
            Chọn bảng giá hiển thị cho Người mua khi họ truy cập cửa hàng của bạn.
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Bảng giá đang áp dụng cho bạn</h3>
          <div style={{ 
            padding: 20, 
            background: 'rgba(99,102,241,0.1)', 
            border: '1px solid rgba(99,102,241,0.2)', 
            borderRadius: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--accent-light)' }}>
                {effectivePriceList?.name || 'Chưa xác định'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Đây là bảng giá Công ty áp dụng cho bạn (dựa trên hạng hoặc chỉ định riêng).
              </div>
            </div>
            <span className="badge badge-primary">Hiệu lực</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Chọn bảng giá cho Người mua của bạn</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
            Hệ thống sẽ hiển thị giá sản phẩm theo bảng giá này khi khách lẻ mua hàng tại shop của bạn.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {availableLists.map(pl => (
              <div key={pl.id} 
                onClick={() => handleSetStorePriceList(pl.id)}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontWeight: 600 }}>{pl.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{pl.description}</div>
              </div>
            ))}
          </div>
        </div>
      </Main>
    </>
  );
}

