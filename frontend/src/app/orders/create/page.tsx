'use client';

import React, { useState, useEffect } from 'react';
import { orderApi, agencyApi, AgencyDTO, ProductDTO, UserDTO, orderApi as api, productApi, creditApi, CreditDetail } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import { Plus, Trash2, ChevronRight, Check, AlertTriangle } from 'lucide-react';

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [agencies, setAgencies] = useState<AgencyDTO[]>([]);
  const [agencyCustomers, setAgencyCustomers] = useState<UserDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);

  const [selectedAgency, setSelectedAgency] = useState<AgencyDTO | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<UserDTO | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [creditDetail, setCreditDetail] = useState<CreditDetail | null>(null);
  const [orderDebtTerm, setOrderDebtTerm] = useState(30);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerInfo, setNewCustomerInfo] = useState({
    name: '',
    phone: '',
    shippingAddress: '',
    invoiceName: '',
    invoiceTaxCode: '',
    invoiceAddress: ''
  });

  useEffect(() => {
    loadAgencies();
  }, [user]);

  useEffect(() => {
    if (selectedAgency) {
      loadProducts();
    }
  }, [selectedAgency, step]);

  const loadAgencies = async () => {
    if (!user) return;
    if (user.roles.includes('ROLE_COMPANY') || user.roles.includes('ROLE_ADMIN')) {
      const data = await agencyApi.getAll();
      setAgencies(data.filter((a: AgencyDTO) => a.active));
    } else if (user.roles.includes('ROLE_AGENCY') && user.agencyId) {
      const agency = await agencyApi.getMe(user.id);
      setAgencies([agency]);
      setSelectedAgency(agency);
      loadAgencyCustomers(agency.id);
    }
  };

  const loadProducts = async () => {
    if (!selectedAgency) return;
    const agencyId = selectedAgency.id;
    const customerId = selectedCustomer?.id;
    const data = await productApi.getAll(agencyId, customerId);
    setProducts(data.filter((p: ProductDTO) => p.basePrice && p.basePrice > 0));
  };

  const loadAgencyCustomers = async (agencyId: number) => {
    const customers = await agencyApi.getCustomers(agencyId);
    setAgencyCustomers(customers);
  };

  const handleSelectAgency = async (agency: AgencyDTO) => {
    setSelectedAgency(agency);
    await loadAgencyCustomers(agency.id);
    try {
      const detail = await creditApi.getDetail(agency.id);
      setCreditDetail(detail);
      setOrderDebtTerm(detail.debtTermDays || 30);
    } catch (e) {
      console.error('Failed to load credit info', e);
    }
    setStep(2);
  };

  const handleSelectCustomer = (customer: UserDTO | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      setShippingAddress(customer.shippingAddress || '');
    }
    setStep(3);
  };

  const handleAddToCart = (product: ProductDTO) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.basePrice || 0
      }]);
    }
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (!selectedAgency) {
      setError('Vui lòng chọn Khách hàng');
      return;
    }

    const totalAmount = getTotalAmount();
    if (creditDetail && totalAmount > creditDetail.hmkd) {
      setError('Hạn mức tín dụng không đủ. Khả dụng: ' + creditDetail.hmkd.toLocaleString() + 'đ, Cần: ' + totalAmount.toLocaleString() + 'đ');
      return;
    }
    if (cart.length === 0) {
      setError('Vui lòng chọn ít nhất 1 sản phẩm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData: any = {
        agencyId: selectedAgency.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress,
        deliveryFee,
        debtTermDays: orderDebtTerm
      };

      if (selectedCustomer) {
        orderData.customerId = selectedCustomer.id;
      } else if (showNewCustomerForm && newCustomerInfo.name) {
        orderData.newCustomerInfo = newCustomerInfo;
      }

      if (user?.roles.includes('ROLE_AGENCY')) {
        await api.createByAgency(orderData);
      } else {
        await api.createByEmployee(orderData);
      }

      router.push('/orders');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedAgency;
      case 2: return !!selectedCustomer || showNewCustomerForm;
      case 3: return cart.length > 0;
      default: return false;
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>Tạo đơn hàng mới</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Tạo đơn hàng cho Khách hàng hoặc Người mua</p>
      </div>

      {selectedAgency && (
        <GlassCard style={{ padding: '16px 20px', marginBottom: 24, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ borderRight: '1px solid var(--border)', paddingRight: 24 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Khách hàng</div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{selectedAgency.name}</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>HM khả dụng: </span>
                  <strong style={{ color: (creditDetail?.hmkd || 0) > 0 ? '#10b981' : '#ef4444' }}>{(creditDetail?.hmkd || 0).toLocaleString()}đ</strong>
                </div>
                {creditDetail && creditDetail.overdueDebts.filter(d => d.status === 'ACTIVE').length > 0 && (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Nợ quá hạn: </span>
                    <strong style={{ color: '#ef4444' }}>
                      {creditDetail.overdueDebts.filter(d => d.status === 'ACTIVE').reduce((sum, d) => sum + d.principalAmount, 0).toLocaleString()}đ
                    </strong>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Người mua</div>
              {selectedCustomer ? (
                <>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{selectedCustomer.displayName || selectedCustomer.username}</div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ fontSize: 13 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Dư nợ KH: </span>
                      <strong style={{ color: (creditDetail?.customerDebts.find(d => d.customerId === selectedCustomer.id)?.totalDebt || 0) > 0 ? '#ef4444' : 'inherit' }}>
                        {(creditDetail?.customerDebts.find(d => d.customerId === selectedCustomer.id)?.totalDebt || 0).toLocaleString()}đ
                      </strong>
                    </div>
                    {creditDetail && creditDetail.overdueDebts.filter(d => d.customerId === selectedCustomer.id && d.status === 'ACTIVE').length > 0 && (
                      <div style={{ fontSize: 13 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Nợ quá hạn: </span>
                        <strong style={{ color: '#ef4444' }}>
                          {creditDetail.overdueDebts.filter(d => d.customerId === selectedCustomer.id && d.status === 'ACTIVE').reduce((sum, d) => sum + d.principalAmount, 0).toLocaleString()}đ
                        </strong>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 14 }}>
                  Chưa chọn Người mua
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{
            display: 'flex',
            alignItems: 'center',
            color: step >= s ? 'var(--primary)' : 'var(--text-muted)'
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: step >= s ? 'var(--success)' : 'var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: step >= s ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: 14
            }}>
              {step > s ? <Check size={16} style={{ marginLeft: 8, color: 'var(--primary)' }} /> : s}
            </div>
            <span style={{ marginLeft: 8, fontSize: 14 }}>
              {s === 1 ? 'Chọn Khách hàng' : s === 2 ? 'Chọn Người mua' : s === 3 ? 'Chọn Sản phẩm' : 'Xác nhận'}
            </span>
            {s < 4 && <ChevronRight size={16} style={{ marginLeft: 8, color: 'var(--primary)' }} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: 16, padding: 12, background: '#fee2e2', borderRadius: 8, color: '#dc2626' }}>
          {error}
        </div>
      )}

      <GlassCard style={{ padding: 24 }}>
        {step === 1 && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Chọn Khách hàng</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
              {agencies.map(agency => (
                <div
                  key={agency.id}
                  className="agency-card"
                  onClick={() => handleSelectAgency(agency)}
                  style={{
                    padding: 16,
                    border: selectedAgency?.id === agency.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: selectedAgency?.id === agency.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{agency.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{agency.phone}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{agency.address}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Chọn Người mua</h3>
              {creditDetail && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{
                    padding: '8px 12px',
                    background: getTotalAmount() > creditDetail.hmkd ? '#fee2e2' : '#dcfce7',
                    borderRadius: 6, fontSize: 12, color: getTotalAmount() > creditDetail.hmkd ? '#dc2626' : '#16a34a',
                    border: '1px solid currentColor'
                  }}>
                    Khách hàng HMKD: <strong>{creditDetail.hmkd.toLocaleString()}đ</strong>
                  </div>
                  <div style={{
                    padding: '8px 12px', background: '#fff7ed', borderRadius: 6, fontSize: 12, color: '#c2410c',
                    border: '1px solid currentColor'
                  }}>
                    Khách hàng NQH: <strong>{creditDetail.overdueDebts.filter(d => d.status === 'ACTIVE').reduce((sum, d) => sum + d.principalAmount, 0).toLocaleString()}đ</strong>
                  </div>
                </div>
              )}
            </div>

            {!showNewCustomerForm ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                <div
                  onClick={() => handleSelectCustomer(null)}
                  style={{
                    padding: 16,
                    border: !selectedCustomer ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: !selectedCustomer ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{selectedAgency?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Người mua nhận hàng</div>
                </div>
                {agencyCustomers.map(customer => {
                  const debtInfo = creditDetail?.customerDebts.find(d => d.customerId === customer.id);
                  const overdueDebt = creditDetail?.overdueDebts.filter(d => d.customerId === customer.id && d.status === 'ACTIVE').reduce((sum, d) => sum + d.principalAmount, 0) || 0;

                  return (
                    <div
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      style={{
                        padding: 16,
                        border: selectedCustomer?.id === customer.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: selectedCustomer?.id === customer.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{customer.displayName || customer.username}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Dư nợ: <span style={{ color: (debtInfo?.totalDebt || 0) > 0 ? '#ef4444' : 'inherit' }}>{(debtInfo?.totalDebt || 0).toLocaleString()}đ</span></div>
                      {overdueDebt > 0 && (
                        <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>Nợ quá hạn: {overdueDebt.toLocaleString()}đ</div>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{customer.phone}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <button
                    onClick={() => { setShowNewCustomerForm(false); setSelectedCustomer(null); }}
                    className="btn-secondary"
                    style={{ marginBottom: 16 }}
                  >
                    ← Quay lại chọn khách có sẵn
                  </button>
                </div>
                <div>
                  <label className="form-label">Tên Người mua</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newCustomerInfo.name}
                    onChange={e => setNewCustomerInfo({ ...newCustomerInfo, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newCustomerInfo.phone}
                    onChange={e => setNewCustomerInfo({ ...newCustomerInfo, phone: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Địa chỉ giao hàng</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newCustomerInfo.shippingAddress}
                    onChange={e => setNewCustomerInfo({ ...newCustomerInfo, shippingAddress: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Tên xuất hóa đơn</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newCustomerInfo.invoiceName}
                    onChange={e => setNewCustomerInfo({ ...newCustomerInfo, invoiceName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Mã số thuế</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newCustomerInfo.invoiceTaxCode}
                    onChange={e => setNewCustomerInfo({ ...newCustomerInfo, invoiceTaxCode: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Địa chỉ xuất hóa đơn</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newCustomerInfo.invoiceAddress}
                    onChange={e => setNewCustomerInfo({ ...newCustomerInfo, invoiceAddress: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1', marginTop: 16 }}>
                  <button
                    onClick={() => handleSelectCustomer(null)}
                    disabled={!newCustomerInfo.name || !newCustomerInfo.phone}
                    className="btn-primary"
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Chọn sản phẩm</h3>
            <div style={{ marginBottom: 24 }}>
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                className="form-input"
                onChange={e => {
                  const term = e.target.value.toLowerCase();
                  if (term) {
                    const filtered = products.filter((p: ProductDTO) => p.name.toLowerCase().includes(term));
                    if (filtered.length > 0) setProducts(filtered);
                  } else {
                    setProducts(products);
                  }
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
              {products.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  style={{
                    padding: 12,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{product.name}</div>
                  <div style={{ color: 'var(--primary)', fontWeight: 600 }}>{product.basePrice?.toLocaleString()}đ</div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <h4 style={{ marginBottom: 12 }}>Giỏ hàng ({cart.length} sản phẩm)</h4>
                {cart.map(item => (
                  <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.productName}</div>
                      <div style={{ color: 'var(--primary)' }}>{item.price.toLocaleString()}đ</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} style={{ width: 28, height: 28, background: 'var(--border)', border: 'none', borderRadius: 4, cursor: 'pointer' }}>-</button>
                      <span style={{ minWidth: 30, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} style={{ width: 28, height: 28, background: 'var(--border)', border: 'none', borderRadius: 4, cursor: 'pointer' }}>+</button>
                      <button onClick={() => removeFromCart(item.productId)} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 18, fontWeight: 600 }}>
                  <span>Tổng tiền:</span>
                  <span>{getTotalAmount().toLocaleString()}đ</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Xác nhận đơn hàng</h3>

            <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>Thông tin đơn</span>
                <span style={{ fontSize: 12, color: 'var(--primary)' }}>Kỳ hạn: {orderDebtTerm} ngày</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div>Khách hàng: <strong>{selectedAgency?.name}</strong></div>
                <div>Người mua: <strong>{selectedCustomer?.displayName || selectedCustomer?.username || 'Người mua'}</strong></div>
                {creditDetail && (
                  <>
                    <div style={{ color: creditDetail.hmkd < getTotalAmount() ? '#ef4444' : 'inherit' }}>
                      HMKD Khách hàng: <strong>{creditDetail.hmkd.toLocaleString()}đ</strong>
                    </div>
                    {selectedCustomer && (
                      <div>
                        Nợ KH: <strong>{(creditDetail.customerDebts.find(d => d.customerId === selectedCustomer.id)?.totalDebt || 0).toLocaleString()}đ</strong>
                      </div>
                    )}
                  </>
                )}
                <div style={{ gridColumn: '1 / -1' }}>Địa chỉ giao: <strong>{shippingAddress || selectedAgency?.address}</strong></div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Sản phẩm ({cart.length})</div>
              {cart.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>{item.productName} x{item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()}đ</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', marginTop: 8, borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <span>Tạm tính:</span>
                <span>{getTotalAmount().toLocaleString()}đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--text-secondary)' }}>
                <span>Phí giao hàng:</span>
                <span>{deliveryFee.toLocaleString()}đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', fontWeight: 600, fontSize: 18 }}>
                <span>Tổng cộng:</span>
                <span>{(getTotalAmount() + deliveryFee).toLocaleString()}đ</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Kỳ hạn nợ (ngày)</label>
                <input
                  type="number"
                  className="form-input"
                  value={orderDebtTerm}
                  onChange={e => setOrderDebtTerm(Number(e.target.value))}
                  min="0"
                />
              </div>
              <div>
                <label className="form-label">Phí giao hàng (đ)</label>
                <input
                  type="number"
                  className="form-input"
                  value={deliveryFee}
                  onChange={e => setDeliveryFee(Number(e.target.value))}
                  min="0"
                />
              </div>
              <div>
                <label className="form-label">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  className="form-input"
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  placeholder="Nhập địa chỉ giao hàng..."
                />
              </div>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: 14, fontSize: 16 }}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận tạo đơn'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          {step > 1 && step < 4 && (
            <button onClick={() => setStep(step - 1)} className="btn-secondary">
              Quay lại
            </button>
          )}
          {step === 3 && cart.length > 0 && (
            <button onClick={() => setStep(4)} className="btn-primary" style={{ marginLeft: 'auto' }}>
              Tiếp tục
            </button>
          )}
          {step === 4 && (
            <button onClick={() => setStep(3)} className="btn-secondary">
              Quay lại
            </button>
          )}
        </div>
      </GlassCard>

      <style jsx>{`
        .form-label {
          display: block;
          font-size: 13;
          font-weight: 500;
          margin-bottom: 6px;
          color: var(--text-secondary);
        }
        .form-input {
          width: 100%;
          padding: 10px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 14;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        /* .btn-primary {
          padding: 10px 20px;
          background: var(--primary);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        } */
        .btn-primary:hover:not(:disabled) {
          background: var(--primary-dark);
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-secondary {
          padding: 10px 20px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
