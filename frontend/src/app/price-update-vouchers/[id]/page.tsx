'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { priceUpdateVoucherApi, PriceUpdateVoucherDTO, PriceUpdateVoucherItemDTO, priceListApi, PriceListDTO, productApi, ProductDTO } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Pagination from '@/components/ui/Pagination';

export default function PriceUpdateVoucherDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isCompany = user?.roles.includes('ROLE_COMPANY');

  const [voucher, setVoucher] = useState<PriceUpdateVoucherDTO | null>(null);
  const [priceLists, setPriceLists] = useState<PriceListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultPriceListItems, setDefaultPriceListItems] = useState<any[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);

  const [items, setItems] = useState<PriceUpdateVoucherItemDTO[]>([]);
  const [itemsPage, setItemsPage] = useState(0);
  const [itemsTotalPages, setItemsTotalPages] = useState(1);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    if (isCompany && id) {
      loadData();
    }
  }, [isCompany, id]);

  useEffect(() => {
    if (isCompany && id) {
      loadItems();
    }
  }, [isCompany, id, itemsPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, plData, prodData] = await Promise.all([
        priceUpdateVoucherApi.getById(Number(id)),
        priceListApi.getAll(),
        productApi.getAll()
      ]);
      setVoucher(vData);
      setPriceLists(plData);
      setProducts(prodData);

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

  const loadItems = async () => {
    setItemsLoading(true);
    try {
      const data = await priceUpdateVoucherApi.getItems(Number(id), itemsPage, 20);
      setItems(data.content);
      setItemsTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setItemsLoading(false);
    }
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

  const handleCancel = async () => {
    if (!confirm('Bạn có chắc muốn hủy phiếu này?')) return;
    try {
      await priceUpdateVoucherApi.cancel(Number(id));
      loadData();
    } catch (err) {
      alert('Lỗi khi hủy phiếu');
    }
  };

  const handleApply = async () => {
    if (!confirm('Bạn có chắc muốn áp dụng phiếu này ngay lập tức?')) return;
    try {
      await priceUpdateVoucherApi.apply(Number(id));
      loadData();
    } catch (err) {
      alert('Lỗi khi áp dụng phiếu');
    }
  };

  if (!isCompany) return <div className="p-8">Bạn không có quyền truy cập.</div>;
  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (!voucher) return <div className="p-8 text-center">Không tìm thấy phiếu.</div>;

  const appliedPLs = priceLists.filter(pl => voucher.priceListIds.includes(pl.id));

  return (
    <>
      <Navbar />
      <Main>
        <button onClick={() => router.back()} className="btn-outline" style={{ marginBottom: 24 }}>
          ← Quay lại danh sách
        </button>

        <div className="glass-card" style={{ padding: 40, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800 }} className="gradient-text">
                {voucher.name}
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: '1.1rem' }}>
                {voucher.description || 'Không có mô tả'}
              </p>
            </div>
            <span className={`badge ${
              voucher.status === 'APPLIED' ? 'badge-success' : 
              voucher.status === 'CANCELLED' ? 'badge-error' : 'badge-warning'
            }`} style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
              {voucher.status === 'PENDING' ? 'Đang chờ' : 
               voucher.status === 'APPLIED' ? 'Đã áp dụng' : 'Đã hủy'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Thời gian hẹn</div>
              <div style={{ fontWeight: 600 }}>{new Date(voucher.scheduledAt).toLocaleString('vi-VN')}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Ngày tạo</div>
              <div style={{ fontWeight: 600 }}>{new Date(voucher.createdAt).toLocaleString('vi-VN')}</div>
            </div>
            {voucher.appliedAt && (
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Ngày áp dụng thực tế</div>
                <div style={{ fontWeight: 600, color: 'var(--success)' }}>{new Date(voucher.appliedAt).toLocaleString('vi-VN')}</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 16, fontSize: '1.2rem' }}>Áp dụng cho các bảng giá:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {appliedPLs.map(pl => (
                <span key={pl.id} style={{ padding: '8px 16px', background: 'var(--accent-glow)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.9rem' }}>
                  {pl.name}
                </span>
              ))}
            </div>
          </div>

          {voucher.status === 'PENDING' && (
            <div style={{ display: 'flex', gap: 12, marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
              <button onClick={handleApply} className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>
                Áp dụng ngay bây giờ
              </button>
              <button onClick={handleCancel} className="btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                Hủy phiếu
              </button>
            </div>
          )}
        </div>

        <h2 style={{ marginBottom: 20, fontSize: '1.5rem' }}>Danh sách sản phẩm thay đổi giá ({voucher.items.length})</h2>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
              <tr>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Sản phẩm</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Giá mặc định</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Giá mới</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Trạng thái hiển thị</th>
              </tr>
            </thead>
            <tbody>
              {itemsLoading ? (
                <tr><td colSpan={4} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Không có sản phẩm nào</td></tr>
              ) : items.map((it) => (
                <tr key={it.productId} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600 }}>{it.productName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {it.productId}</div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    {getDefaultPrice(it.productId)}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-light)', fontSize: '1.1rem' }}>
                    {(it.newPrice ?? 0).toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span className={`badge ${it.isVisible ? 'badge-success' : 'badge-error'}`}>
                      {it.isVisible ? 'Hiển thị' : 'Ẩn'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length > 0 && (
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center' }}>
              <Pagination page={itemsPage} totalPages={itemsTotalPages} onPageChange={setItemsPage} />
            </div>
          )}
        </div>
      </Main>

      <style jsx>{`
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .badge-warning { background: rgba(245,158,11,0.2); color: #f59e0b; }
        .badge-success { background: rgba(16,185,129,0.2); color: #10b981; }
        .badge-error { background: rgba(239,68,68,0.2); color: #ef4444; }
      `}</style>
    </>
  );
}
