'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/context/AuthContext';
import { priceListApi, PriceListDTO, PriceListItemDTO } from '@/lib/api';

export default function PriceListDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [priceList, setPriceList] = useState<PriceListDTO | null>(null);
  const [items, setItems] = useState<PriceListItemDTO[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'prices' | 'history'>('prices');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const numericId = Number(id);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [plData, itemsRes] = await Promise.all([
        priceListApi.getById(numericId),
        priceListApi.getItems(numericId, 0, 20),
      ]);
      setPriceList(plData);
      setItems(itemsRes.content);
      setTotalPages(itemsRes.totalPages);

      try {
        const historyRes = await fetch(`http://localhost:8080/api/price-vouchers/active-history/price-list/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const historyData = await historyRes.json();
        setHistory(Array.isArray(historyData) ? historyData : []);
      } catch {
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItems = async (pageNum: number, search?: string) => {
    setIsLoadingItems(true);
    try {
      const res = await priceListApi.getItems(numericId, pageNum, 20, search);
      setItems(res.content);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to fetch items', err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      fetchItems(0, value);
    }, 300);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchItems(newPage, searchQuery);
  };

  const handleUpdatePrice = async (productId: number, newPrice: number, isVisible: boolean) => {
    try {
      await fetch(`http://localhost:8080/api/price-lists/${id}/items`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, price: newPrice, isVisible }),
      });
      setItems(prev => prev.map(item =>
        item.productId === productId ? { ...item, price: newPrice, isVisible } : item
      ));
    } catch {
      alert('Cập nhật thất bại');
    }
  };

  if (isLoading || !priceList) return <div className="loading-spinner" />;

  return (
    <>
      <Navbar />
      <Main>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{priceList.name}</h1>
            {priceList.isDefault && <span className="badge badge-warning">Mặc định</span>}
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{priceList.description || 'Không có mô tả'}</p>
        </div>

        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
          {(['prices', 'history'] as const).map(tab => (
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
              }}
            >
              {tab === 'prices' ? 'Danh sách giá' : 'Lịch sử cập nhật'}
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
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  color: 'white',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div className="glass-card" style={{ padding: 0, position: 'relative' }}>
              {isLoadingItems && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 10, borderRadius: 12,
                }}>
                  <div className="spinner" />
                </div>
              )}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left' }}>Sản phẩm</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center' }}>Giá thiết lập</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center' }}>Giá gần nhất</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center' }}>Hiển thị</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? items.map(item => (
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
                            color: item.price === -1 ? 'var(--text-muted)' : 'var(--accent-light)',
                          }}
                        />
                        {item.price === -1 && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Liên hệ</div>}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center', color: item.oldPrice === undefined || item.oldPrice === -1 ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                        {item.oldPrice === undefined || item.oldPrice === -1 ? 'Liên hệ' : `${item.oldPrice.toLocaleString('vi-VN')} đ`}
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
                  )) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {searchQuery ? 'Không tìm thấy sản phẩm phù hợp' : 'Bảng giá chưa có sản phẩm nào'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="fade-in">
            {history.length === 0 ? (
              <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                Chưa có lịch sử cập nhật giá nào cho bảng giá này.
              </div>
            ) : (
              <div className="glass-card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left' }}>Tên phiếu cập nhật</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left' }}>Mô tả</th>
                      <th style={{ padding: '16px 24px', textAlign: 'center' }}>Số sản phẩm</th>
                      <th style={{ padding: '16px 24px', textAlign: 'center' }}>Ngày áp dụng</th>
                      <th style={{ padding: '16px 24px', textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                          <Link href={`/price-update-vouchers/${v.id}`} style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>
                            {v.name}
                          </Link>
                        </td>
                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                          {v.description || '—'}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 600, color: 'var(--accent)' }}>
                          {v.items?.length || 0}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                          {v.appliedAt ? new Date(v.appliedAt).toLocaleString('vi-VN') : '—'}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <Link href={`/price-update-vouchers/${v.id}`} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none' }}>
                            Xem chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Main>
    </>
  );
}
