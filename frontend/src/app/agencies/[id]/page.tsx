'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { agencyApi, AgencyDTO, UserDTO, orderApi, OrderDTO, creditApi, CreditDetail, priceListApi, PriceListDTO, priceUpdateVoucherApi, PriceUpdateVoucherDTO, customerPriceApi, AgencyProductPriceDTO, AgencyProductPriceHistoryDTO } from '@/lib/api';
import Link from 'next/link';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import { 
  Building2, Phone, MapPin, Mail, User as UserIcon, 
  ShieldCheck, CreditCard, PieChart, Users, ArrowLeft,
  Calendar, Map as MapIcon, Percent, ShoppingCart,
  Tag, Search, DollarSign, Image as ImageIcon, History, X, Edit, RefreshCw, Upload, Download
} from 'lucide-react';

export default function AgencyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [agency, setAgency] = useState<AgencyDTO | null>(null);
  const [credit, setCredit] = useState<CreditDetail | null>(null);
  const [customers, setCustomers] = useState<UserDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [activePriceList, setActivePriceList] = useState<PriceListDTO | null>(null);
  const [customerPrices, setCustomerPrices] = useState<AgencyProductPriceDTO[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'prices'>('info');
  
  // States for Price Update History Modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [priceHistory, setPriceHistory] = useState<AgencyProductPriceHistoryDTO[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Edit Price Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<AgencyProductPriceDTO | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchPriceHistory = async (productId: number) => {
    if (!id) return;
    setIsLoadingHistory(true);
    setSelectedProductId(productId);
    try {
      const historyData = await customerPriceApi.getHistory(Number(id), productId);
      setPriceHistory(historyData || []);
    } catch (err) {
      console.error('Error fetching price history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleOverridePrice = async () => {
    if (!id || !editingPrice) return;
    setIsSaving(true);
    try {
      await customerPriceApi.overridePrice(Number(id), editingPrice.productId, newPriceValue);
      setIsEditModalOpen(false);
      fetchPriceAndProducts();
    } catch (err) {
      alert('Lỗi cập nhật giá');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRollbackPrice = async (historyId: number) => {
    if (!confirm('Bạn có chắc chắn muốn quay lại mức giá này?')) return;
    try {
      await customerPriceApi.rollbackPrice(historyId);
      if (selectedProductId) {
        fetchPriceHistory(selectedProductId);
      }
      fetchPriceAndProducts();
    } catch (err) {
      alert('Lỗi khôi phục giá');
    }
  };

  const handleRemoveOverride = async (productId: number) => {
    if (!id) return;
    if (!confirm('Bạn có chắc chắn muốn xóa giá ghi đè riêng của sản phẩm này và quay lại sử dụng giá từ bảng giá mặc định?')) return;
    try {
      setIsLoading(true);
      await customerPriceApi.removeOverride(Number(id), productId);
      alert('Đã xóa giá ghi đè thành công');
      fetchPriceAndProducts();
    } catch (err) {
      alert('Lỗi khi xóa giá ghi đè');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncPrices = async () => {
    if (!id) return;
    if (!confirm('Hệ thống sẽ đồng bộ lại toàn bộ giá cho khách hàng này dựa trên bảng giá. Quá trình này chạy ngầm. Tiếp tục?')) return;
    try {
      await customerPriceApi.syncAgencyPrices(Number(id));
      alert('Đã gửi yêu cầu đồng bộ. Vui lòng tải lại trang sau ít phút.');
    } catch (err) {
      alert('Lỗi đồng bộ giá');
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;
    try {
      setIsLoading(true);
      const res = await customerPriceApi.importPrices(Number(id), file);
      alert('Nhập dữ liệu thành công!\n' + res);
      fetchPriceAndProducts();
    } catch (err: any) {
      alert('Lỗi nhập dữ liệu: ' + err.message);
    } finally {
      setIsLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const fetchPriceAndProducts = async () => {
    if (!token || !id) return;
    try {
      const agencyId = parseInt(id as string);
      const [priceListData, pricesData] = await Promise.all([
        priceListApi.resolveForAgency(agencyId).catch(() => null),
        customerPriceApi.getPricesForAgency(agencyId).catch(() => [])
      ]);
      setActivePriceList(priceListData);
      setCustomerPrices(pricesData || []);
    } catch (err) {
      console.error('Error fetching prices/products:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
      fetchOrders();
      fetchPriceAndProducts();
    }
  }, [id, token]);

  const fetchData = async () => {
    if (!token || !id) return;
    setIsLoading(true);
    try {
      const agencyId = parseInt(id as string);
      const [agencyData, customersData, creditData] = await Promise.all([
        agencyApi.getById(agencyId),
        agencyApi.getCustomers(agencyId),
        creditApi.getDetail(agencyId).catch(() => null) // Nếu khách hàng chưa có tín dụng thì trả về null
      ]);
      setAgency(agencyData);
      setCustomers(customersData);
      setCredit(creditData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!token || !id) return;
    setIsLoadingOrders(true);
    try {
      const agencyId = parseInt(id as string);
      const ordersData = await orderApi.getByAgencyId(agencyId);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching agency orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#2ecc71';
      case 'PROCESSING': return '#3498db';
      case 'PENDING': return '#f1c40f';
      case 'CANCELLED': return '#e74c3c';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'PROCESSING': return 'Đang xử lý';
      case 'PENDING': return 'Chờ xử lý';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      </>
    );
  }

  if (!agency) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Không tìm thấy khách hàng</h2>
          <button className="btn-outline" onClick={() => router.back()} style={{ marginTop: 20 }}>
            <ArrowLeft size={16} style={{ marginRight: 8 }} /> Quay lại
          </button>
        </div>
      </>
    );
  }

  const customerColumns: Column<UserDTO>[] = [
    { 
      header: 'Người mua', 
      key: 'username',
      render: (u) => (
        <div>
          <div style={{ fontWeight: 600 }}>{u.displayName || u.username}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
        </div>
      )
    },
    { header: 'Số điện thoại', key: 'phone' },
    { 
      header: 'Trạng thái', 
      key: 'approved',
      render: (u) => (
        <Badge 
          label={u.approved ? 'Đã duyệt' : 'Chờ duyệt'} 
          type={u.approved ? 'success' : 'warning'}
          icon={u.approved ? 'CheckCircle' : 'Clock'}
        />
      )
    }
  ];

  return (
    <>
      <Navbar />
      <main style={{ padding: '20px 0' }}>
        <div style={{ padding: '0 24px', marginBottom: 16 }}>
          <button 
            className="btn-outline" 
            onClick={() => router.back()} 
            style={{ 
              padding: '8px 16px', 
              borderRadius: 12, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8 
            }}
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
        </div>

        <PageHeader 
          title={agency.name} 
          subtitle={`Chi tiết thông tin khách hàng ID: ${agency.id}`}
          icon="Building2"
          actions={
            <div style={{ display: 'flex', gap: 12 }}>
              <Badge 
                label={agency.status === 'PENDING' ? 'Chờ duyệt' : (agency.active ? 'Đang hoạt động' : 'Tạm ngưng')} 
                type={agency.status === 'PENDING' ? 'warning' : (agency.active ? 'success' : 'error')} 
                style={{ fontSize: '0.9rem', padding: '8px 16px' }}
              />
            </div>
          }
        />

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', gap: 8, margin: '0 24px 32px', 
          padding: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 16,
          width: 'fit-content'
        }}>
          <button 
            onClick={() => setActiveTab('info')}
            style={{ 
              padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: activeTab === 'info' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'info' ? 'white' : 'var(--text-muted)',
              fontWeight: 600, transition: 'all 0.3s ease'
            }}
          >
            Thông tin chung
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            style={{ 
              padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: activeTab === 'orders' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'orders' ? 'white' : 'var(--text-muted)',
              fontWeight: 600, transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            Đơn hàng
            <span style={{ 
              fontSize: '0.75rem', padding: '2px 8px', borderRadius: 8,
              background: activeTab === 'orders' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'
            }}>
              {orders.length}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('prices')}
            style={{ 
              padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: activeTab === 'prices' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'prices' ? 'white' : 'var(--text-muted)',
              fontWeight: 600, transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            Bảng giá áp dụng
          </button>
        </div>

        {activeTab === 'prices' ? (
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <GlassCard style={{ padding: 32 }}>
              <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                <Tag size={20} /> Bảng giá đang áp dụng
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 4 }}>
                    {activePriceList?.name || 'Chưa thiết lập bảng giá'}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Bảng giá hệ thống đang áp dụng làm cơ sở. Tuy nhiên, giá thực tế bên dưới đã được tính toán đồng bộ cho riêng khách hàng này.
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {activePriceList?.isDefault && (
                    <Badge label="Mặc định" type="info" />
                  )}
                  <button 
                    onClick={() => document.getElementById('import-excel')?.click()}
                    className="btn-outline"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      padding: '8px 16px',
                      borderRadius: 12,
                      borderColor: 'rgba(56, 189, 248, 0.4)',
                      color: '#38bdf8',
                      background: 'rgba(56, 189, 248, 0.05)',
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={16} /> Nhập Excel
                    <input 
                      type="file" 
                      id="import-excel" 
                      style={{ display: 'none' }} 
                      accept=".xlsx, .xls"
                      onChange={handleImportExcel}
                    />
                  </button>
                  <button 
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      window.open(`/api/customer-prices/export/${id}?token=${token}`, '_blank');
                    }}
                    className="btn-outline"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      padding: '8px 16px',
                      borderRadius: 12,
                      borderColor: 'rgba(56, 189, 248, 0.4)',
                      color: '#38bdf8',
                      background: 'rgba(56, 189, 248, 0.05)',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={16} /> Xuất Excel
                  </button>
                  <button 
                    onClick={handleSyncPrices}
                    className="btn-outline"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      padding: '8px 16px',
                      borderRadius: 12,
                      borderColor: 'rgba(56, 189, 248, 0.4)',
                      color: '#38bdf8',
                      background: 'rgba(56, 189, 248, 0.05)',
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={16} /> Đồng bộ giá
                  </button>
                </div>
              </div>
            </GlassCard>

            <GlassCard style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                  <DollarSign size={20} /> Chi tiết giá sản phẩm
                </h3>
                <div style={{ position: 'relative', width: '300px' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 16px 8px 36px',
                      borderRadius: 20,
                      border: '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600, width: 60 }}>Ảnh</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Tên sản phẩm</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Giá cũ</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Tỷ lệ tăng giảm</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Giá thực tế</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Nguồn giá</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Ngày hiệu lực</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerPrices
                      .filter(p => p.productName.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {p.productImageUrl ? (
                              <img src={p.productImageUrl} alt={p.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <ImageIcon size={20} color="var(--text-muted)" />
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 8px', fontWeight: 500 }}>{p.productName}</td>
                        <td style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>
                          {p.oldPrice === -1 || !p.oldPrice ? (
                            <span>-</span>
                          ) : (
                            <span>{p.oldPrice.toLocaleString('vi-VN')}đ</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          {(() => {
                            if (!p.oldPrice || p.oldPrice <= 0 || p.price <= 0) return <span style={{ color: 'var(--text-muted)' }}>-</span>;
                            const diff = p.price - p.oldPrice;
                            const pct = (diff / p.oldPrice) * 100;
                            if (pct === 0) return <span style={{ color: 'var(--text-muted)' }}>0%</span>;
                            if (pct < 0) {
                              return <span style={{ color: '#2ecc71', fontWeight: 600 }}>{pct.toFixed(1)}%</span>;
                            }
                            return <span style={{ color: '#e74c3c', fontWeight: 600 }}>+{pct.toFixed(1)}%</span>;
                          })()}
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          {p.price === -1 ? (
                            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Liên hệ</span>
                          ) : (
                            <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.05rem' }}>
                              {p.price?.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          {p.isOverride ? (
                            <Badge label="Cài đặt riêng" type="warning" style={{ fontSize: '0.8rem', padding: '2px 8px' }} />
                          ) : (
                            <Badge label={p.sourcePriceListName || 'N/A'} type="info" style={{ fontSize: '0.8rem', padding: '2px 8px' }} />
                          )}
                        </td>
                        <td style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>
                          {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                              onClick={() => {
                                setEditingPrice(p);
                                setNewPriceValue(p.price);
                                setIsEditModalOpen(true);
                              }}
                              className="btn-icon" title="Ghi đè giá"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setIsHistoryModalOpen(true);
                                fetchPriceHistory(p.productId);
                              }}
                              className="btn-icon" title="Lịch sử giá"
                            >
                              <History size={16} />
                            </button>
                            {p.isOverride && (
                              <button 
                                onClick={() => handleRemoveOverride(p.productId)}
                                className="btn-icon" 
                                title="Xóa giá riêng (Trở về giá mặc định)"
                                style={{ color: '#ef4444' }}
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {customerPrices.filter(p => p.productName.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                          Không tìm thấy sản phẩm nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        ) : activeTab === 'info' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, padding: '0 24px' }}>
            {/* Cột trái: Thông tin cơ bản & Tài khoản */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <GlassCard style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                  <UserIcon size={20} /> Thông tin liên hệ
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <InfoItem icon={<Phone size={16} />} label="Số điện thoại" value={agency.phone || 'N/A'} />
                  <InfoItem icon={<Mail size={16} />} label="Email" value={agency.email || 'N/A'} />
                  <InfoItem icon={<MapPin size={16} />} label="Địa chỉ" value={agency.address || 'N/A'} />
                  <InfoItem icon={<UserIcon size={16} />} label="Tài khoản" value={agency.username || 'N/A'} />
                </div>
              </GlassCard>

              <GlassCard style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                  <PieChart size={20} /> Thiết lập hệ thống
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <InfoItem 
                    icon={<Percent size={16} />} 
                    label="Chiết khấu mặc định" 
                    value={`${agency.defaultCommissionRate || 0}%`} 
                  />
                  <InfoItem 
                    icon={<Calendar size={16} />} 
                    label="Ngày tham gia" 
                    value="08/05/2026" 
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <InfoItem icon={<MapIcon size={16} />} label="Vĩ độ" value={agency.latitude?.toString() || '0.0'} />
                    <InfoItem icon={<MapIcon size={16} />} label="Kinh độ" value={agency.longitude?.toString() || '0.0'} />
                  </div>
                </div>
              </GlassCard>

              {/* Thông tin Tín dụng */}
              {credit && (
                <GlassCard style={{ padding: 24, border: '1px solid rgba(56, 189, 248, 0.3)', background: 'rgba(56, 189, 248, 0.02)' }}>
                  <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10, color: '#38bdf8' }}>
                    <CreditCard size={20} /> Quản lý Công nợ & Tín dụng
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <small style={{ color: 'var(--text-muted)' }}>Hạn mức khả dụng</small>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>{credit.hmkd.toLocaleString('vi-VN')}đ</div>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-muted)' }}>Hạn mức tín dụng</small>
                      <div style={{ fontSize: '1rem', fontWeight: 600 }}>{credit.creditLimit.toLocaleString('vi-VN')}đ</div>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-muted)' }}>Dư nợ (Khách hàng)</small>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: credit.totalDebt > 0 ? '#ef4444' : 'var(--text-primary)' }}>
                        {credit.totalDebt.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-muted)' }}>Nợ bảo lãnh (Người mua)</small>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: credit.guaranteeDebt > 0 ? '#f43f5e' : 'var(--text-primary)' }}>
                        {credit.guaranteeDebt.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-muted)' }}>Ký quỹ khả dụng</small>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f59e0b' }}>
                        {credit.vtcAvailable.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-muted)' }}>Ký quỹ tạm giữ</small>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#a78bfa' }}>
                        {credit.vtcHold.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Cột phải: Thông tin hóa đơn & Danh sách người mua */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <GlassCard style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                  <CreditCard size={20} /> Thông tin xuất hóa đơn
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <InfoItem label="Tên tổ chức / Công ty" value={agency.organizationName || 'Chưa cập nhật'} fullWidth />
                  <InfoItem label="Mã số thuế" value={agency.taxCode || 'Chưa cập nhật'} />
                  <InfoItem label="Địa chỉ hóa đơn" value={agency.billingAddress || 'Chưa cập nhật'} fullWidth />
                </div>
              </GlassCard>

              <GlassCard style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                    <Users size={20} /> Người mua thuộc khách hàng
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tổng số: {customers.length}</span>
                </div>
                <DataTable 
                  data={customers}
                  columns={customerColumns}
                  emptyMessage="Người mua này chưa có người mua nào"
                />
              </GlassCard>
            </div>
          </div>
        ) : (
          <div style={{ padding: '0 24px' }}>
            <GlassCard style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                  <ShoppingCart size={20} /> Lịch sử đơn hàng của khách hàng
                </h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{orders.length} đơn hàng</span>
              </div>
              
              {isLoadingOrders ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto', width: 30, height: 30 }} />
                </div>
              ) : orders.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Mã đơn</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Người mua</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Ngày đặt</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Tổng tiền</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Trạng thái</th>
                        <th style={{ padding: '12px 8px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '16px 8px', fontWeight: 600 }}>#{order.id}</td>
                          <td style={{ padding: '16px 8px' }}>{order.customerName}</td>
                          <td style={{ padding: '16px 8px' }}>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                          <td style={{ padding: '16px 8px', fontWeight: 700 }}>{order.totalAmount.toLocaleString('vi-VN')}đ</td>
                          <td style={{ padding: '16px 8px' }}>
                            <span style={{ 
                              padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                              background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status),
                              border: `1px solid ${getStatusColor(order.status)}40`
                            }}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                            <Link href={`/orders/${order.id}`} className="btn-text" style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
                              Chi tiết
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed var(--border)', borderRadius: 12 }}>
                  <ShoppingCart size={40} style={{ marginBottom: 16, opacity: 0.2 }} />
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Chưa có đơn hàng nào được thực hiện</p>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* Modal Lịch sử cập nhật giá */}
        {isHistoryModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, padding: 20
          }}>
            <div className="glass-card fade-in-up" style={{
              width: '100%', maxWidth: '650px', maxHeight: '80vh',
              overflowY: 'auto', padding: 32, borderRadius: 24,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              background: 'rgba(25, 25, 35, 0.95)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                style={{
                  position: 'absolute', top: 20, right: 20,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={24} />
              </button>

              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 10 }}>
                <History size={24} /> Lịch sử biến động giá
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
                Danh sách các đợt thay đổi giá áp dụng cho sản phẩm này của khách hàng.
              </p>

              {isLoadingHistory ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <div className="spinner" style={{ width: 40, height: 40 }} />
                </div>
              ) : priceHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border)', borderRadius: 16 }}>
                  <History size={40} style={{ marginBottom: 16, opacity: 0.1, marginLeft: 'auto', marginRight: 'auto' }} />
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Chưa có biến động giá nào cho sản phẩm này.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {priceHistory.map((hist) => (
                    <div key={hist.id} style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 16, padding: 20
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                            {hist.changeSource === 'PRICE_LIST_UPDATED' && 'Cập nhật từ Bảng giá'}
                            {hist.changeSource === 'AGENCY_ASSIGNMENT_CHANGED' && 'Đổi Bảng giá cho Khách'}
                            {hist.changeSource === 'MANUAL_OVERRIDE' && 'Ghi đè giá thủ công'}
                            {hist.changeSource === 'ROLLBACK' && 'Khôi phục giá cũ'}
                            {!hist.changeSource && 'Thay đổi giá'}
                          </h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Nguồn: {hist.sourcePriceListName || 'N/A'} {hist.changedByUsername ? `(Bởi: ${hist.changedByUsername})` : ''}
                          </p>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 500 }}>
                          {hist.changedAt ? new Date(hist.changedAt).toLocaleString('vi-VN') : ''}
                        </span>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Giá cũ</div>
                            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{hist.oldPrice != null ? hist.oldPrice.toLocaleString('vi-VN') + 'đ' : 'N/A'}</div>
                          </div>
                          <ArrowLeft size={16} color="var(--text-muted)" style={{ transform: 'rotate(180deg)' }} />
                          <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 8 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Giá mới</div>
                            <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{hist.newPrice?.toLocaleString('vi-VN')}đ</div>
                          </div>
                        </div>
                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                          <button 
                            onClick={() => handleRollbackPrice(hist.id)}
                            className="btn-outline" 
                            style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: 8 }}
                          >
                            Quay lại mức giá này
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Ghi đè giá */}
        {isEditModalOpen && editingPrice && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, padding: 20
          }}>
            <div className="glass-card fade-in-up" style={{
              width: '100%', maxWidth: '400px',
              padding: 32, borderRadius: 24,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              background: 'rgba(25, 25, 35, 0.95)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  position: 'absolute', top: 20, right: 20,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', transition: 'color 0.2s'
                }}
              >
                <X size={24} />
              </button>

              <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Edit size={24} /> Ghi đè giá riêng
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
                Thiết lập mức giá riêng cho <strong>{editingPrice.productName}</strong>. 
                Mức giá này sẽ không bị thay đổi ngay cả khi Bảng giá gốc được cập nhật.
              </p>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Giá mới (VNĐ)</label>
                <input
                  type="number"
                  value={newPriceValue}
                  onChange={(e) => setNewPriceValue(Number(e.target.value))}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => setIsEditModalOpen(false)} className="btn-outline">Hủy</button>
                <button onClick={handleOverridePrice} className="btn-primary" disabled={isSaving} style={{ background: '#f59e0b', color: '#fff', border: 'none' }}>
                  {isSaving ? 'Đang lưu...' : 'Lưu giá riêng'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .info-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .info-value {
          font-weight: 500;
          color: var(--text-primary);
        }
      `}</style>
    </>
  );
}

function InfoItem({ icon, label, value, fullWidth = false }: { icon?: React.ReactNode, label: string, value: string, fullWidth?: boolean }) {
  return (
    <div style={{ gridColumn: fullWidth ? 'span 2' : 'span 1' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon} {label}
      </div>
      <div style={{ fontWeight: 500, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
        {value}
      </div>
    </div>
  );
}
