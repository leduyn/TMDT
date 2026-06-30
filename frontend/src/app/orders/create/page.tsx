'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { orderApi, agencyApi, AgencyDTO, ProductDTO, UserDTO, CustomerDTO, orderApi as api, productApi, creditApi, CreditDetail, salesPolicyApi, categoryApi, CategoryDTO, customerApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { Plus, Trash2, ChevronRight, Check, AlertTriangle, Search, Filter, Building, User, Package, Tag } from 'lucide-react';

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  basePrice: number;       // giá gốc từ bảng giá
  policyPrice?: number;    // giá sau chính sách bán hàng
  resolvingPrice?: boolean; // đang gọi API resolve
}

export default function CreateOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [agencies, setAgencies] = useState<AgencyDTO[]>([]);
  const [agencyCustomers, setAgencyCustomers] = useState<CustomerDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);

  const [selectedAgency, setSelectedAgency] = useState<AgencyDTO | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [creditDetail, setCreditDetail] = useState<CreditDetail | null>(null);
  const [orderDebtTerm, setOrderDebtTerm] = useState(30);
  const [paymentMethod, setPaymentMethod] = useState('');
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

  // Search and Filter States for UX enhancement with large datasets
  const [agencySearch, setAgencySearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [catOptions, setCatOptions] = useState<CategoryDTO[][]>([[], [], [], []]);
  const [catSelections, setCatSelections] = useState<(number | undefined)[]>([undefined, undefined, undefined, undefined]);
  const [levelNames, setLevelNames] = useState<string[]>(['Ngành hàng', 'Nhóm hàng', 'Loại SP', 'Dòng SP']);
  const [allCategories, setAllCategories] = useState<CategoryDTO[]>([]);

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
      const agency = await agencyApi.getMe();
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
    const allCustomers = await customerApi.getAll();
    setAgencyCustomers(allCustomers.filter(c => c.agencyId === agencyId));
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
    // Reset search queries and selections when customer changes to avoid state leaks
    setCustomerSearch('');
    setSelectedCustomer(null);
    setShowNewCustomerForm(false);
    setProductSearch('');
    setSelectedBrand(null);
    // Reset category filters
    setCatOptions([[], [], [], []]);
    setCatSelections([undefined, undefined, undefined, undefined]);
    setAllCategories([]);
    setCart([]); // Clear cart to prevent cross-agency price lists or inventory conflicts
    setStep(2);
  };

  const handleSelectCustomer = (customer: CustomerDTO | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      setShippingAddress(customer.shippingAddress || '');
    }
    // Reset product searches when buyer changes in case it impacts the price list
    setProductSearch('');
    setSelectedBrand(null);
    setStep(3);
  };

  // ─── Category loading for product filter ──────────────────────────
  useEffect(() => {
    if (step === 3 && selectedAgency) {
      categoryApi.getByLevel(0).then(data => {
        setCatOptions(prev => { const next = [...prev]; next[0] = data; return next; });
      }).catch(() => {});
      categoryApi.getLevelNames().then(names => {
        if (names) {
          setLevelNames([names[0] || 'Ngành hàng', names[1] || 'Nhóm hàng', names[2] || 'Loại SP', names[3] || 'Dòng SP']);
        }
      }).catch(() => {});
      categoryApi.getAll().then(data => {
        setAllCategories(data || []);
      }).catch(() => {});
    }
  }, [step, selectedAgency]);

  // ─── Category tree helpers ─────────────────────────────────────────
  const childrenMap = useMemo(() => {
    const map = new Map<number, CategoryDTO[]>();
    allCategories.forEach(cat => {
      const pid = cat.parentId ?? 0;
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid)!.push(cat);
    });
    return map;
  }, [allCategories]);

  const getLeafIds = useCallback((catId: number): Set<number> => {
    const result = new Set<number>();
    function traverse(id: number) {
      const children = childrenMap.get(id) || [];
      if (children.length === 0) {
        result.add(id);
      } else {
        children.forEach((c: CategoryDTO) => traverse(c.id));
      }
    }
    traverse(catId);
    return result;
  }, [childrenMap]);

  const effectiveLeafIds = useMemo(() => {
    let deepestSelected: number | undefined;
    for (let i = catSelections.length - 1; i >= 0; i--) {
      if (catSelections[i] !== undefined) {
        deepestSelected = catSelections[i];
        break;
      }
    }
    if (deepestSelected === undefined) return null;
    return getLeafIds(deepestSelected);
  }, [catSelections, getLeafIds]);

  const handleCategoryChange = useCallback(async (level: number, catId: number | undefined) => {
    setCatSelections(prev => {
      const next = [...prev];
      next[level] = catId;
      for (let l = level + 1; l < next.length; l++) next[l] = undefined;
      return next;
    });
    setCatOptions(prev => {
      const next = [...prev];
      for (let l = level + 1; l < next.length; l++) next[l] = [];
      return next;
    });
    if (catId && level < 3) {
      try {
        const children = await categoryApi.getChildren(catId);
        setCatOptions(prev => {
          const next = [...prev];
          next[level + 1] = children;
          return next;
        });
      } catch (err) {
        console.error('Failed to load category children:', err);
      }
    }
  }, []);

  // Debounce timer refs for quantity-based re-resolve
  const resolvePriceTimers = useRef<Record<number, NodeJS.Timeout>>({});

  const resolvePriceForItem = useCallback(async (productId: number, quantity: number, basePrice: number) => {
    if (!selectedAgency) return;
    try {
      setCart(prev => prev.map(item =>
        item.productId === productId ? { ...item, resolvingPrice: true } : item
      ));
      const resolved = await salesPolicyApi.resolvePrice(productId, selectedAgency.id, quantity);
      setCart(prev => prev.map(item => {
        if (item.productId !== productId) return item;
        const hasPolicyDiscount = resolved !== null && resolved !== undefined && resolved !== basePrice;
        return {
          ...item,
          price: resolved ?? basePrice,
          policyPrice: hasPolicyDiscount ? resolved : undefined,
          resolvingPrice: false
        };
      }));
    } catch (e) {
      console.error('Failed to resolve sales policy price', e);
      setCart(prev => prev.map(item =>
        item.productId === productId ? { ...item, resolvingPrice: false } : item
      ));
    }
  }, [selectedAgency]);

  const handleAddToCart = (product: ProductDTO) => {
    const existing = cart.find(item => item.productId === product.id);
    const basePrice = product.appliedPrice || product.basePrice || 0;
    if (existing) {
      const newQty = existing.quantity + 1;
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: newQty }
          : item
      ));
      // Re-resolve price with new quantity
      resolvePriceForItem(product.id, newQty, existing.basePrice);
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: basePrice,
        basePrice: basePrice,
      }]);
      // Resolve price for the new item
      resolvePriceForItem(product.id, 1, basePrice);
    }
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
    // Debounce re-resolve when quantity changes rapidly
    if (resolvePriceTimers.current[productId]) {
      clearTimeout(resolvePriceTimers.current[productId]);
    }
    const item = cart.find(i => i.productId === productId);
    if (item) {
      resolvePriceTimers.current[productId] = setTimeout(() => {
        resolvePriceForItem(productId, quantity, item.basePrice);
      }, 300);
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
      if (!window.confirm('Hạn mức tín dụng không đủ (' + creditDetail.hmkd.toLocaleString() + 'đ). Đơn hàng sẽ được tạo ở trạng thái chờ thanh toán (PENDING_PAYMENT). Bạn có muốn tiếp tục?')) {
        return;
      }
    }
    if (cart.length === 0) {
      setError('Vui lòng chọn ít nhất 1 sản phẩm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderSource = user?.roles.includes('ROLE_AGENCY') ? 'Web' : 'NVKD';

      const orderData: any = {
        agencyId: selectedAgency.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress,
        deliveryFee,
        debtTermDays: orderDebtTerm,
        paymentMethod,
        orderSource
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
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{selectedCustomer.organizationName || selectedCustomer.receiverName || `#${selectedCustomer.id}`}</div>
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
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Tìm khách hàng theo tên, số điện thoại, địa chỉ..."
                className="input-field"
                style={{ paddingLeft: 42 }}
                value={agencySearch}
                onChange={e => setAgencySearch(e.target.value)}
              />
            </div>

            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto', 
              paddingRight: 8,
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: 16 
            }}>
              {agencies.filter(agency => {
                const query = agencySearch.toLowerCase();
                return (
                  agency.name.toLowerCase().includes(query) ||
                  (agency.phone && agency.phone.toLowerCase().includes(query)) ||
                  (agency.billingAddress && agency.billingAddress.toLowerCase().includes(query))
                );
              }).length > 0 ? (
                agencies.filter(agency => {
                  const query = agencySearch.toLowerCase();
                  return (
                    agency.name.toLowerCase().includes(query) ||
                    (agency.phone && agency.phone.toLowerCase().includes(query)) ||
(agency.billingAddress && agency.billingAddress.toLowerCase().includes(query))
                  );
                }).map(agency => (
                  <div
                    key={agency.id}
                    className="agency-card glass-card"
                    onClick={() => handleSelectAgency(agency)}
                    style={{
                      padding: 16,
                      border: selectedAgency?.id === agency.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                      borderRadius: 12,
                      cursor: 'pointer',
                      background: selectedAgency?.id === agency.id ? 'var(--accent-glow)' : 'transparent',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ 
                      background: selectedAgency?.id === agency.id ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)', 
                      padding: 8, 
                      borderRadius: 8,
                      color: selectedAgency?.id === agency.id ? 'white' : 'var(--accent-light)' 
                    }}>
                      <Building size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{agency.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>SĐT: {agency.phone || 'N/A'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{agency.shippingAddress || agency.billingAddress || 'N/A'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  Không tìm thấy khách hàng nào phù hợp
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h3 style={{ margin: 0 }}>Chọn Người mua</h3>
                {!showNewCustomerForm && (
                  <button
                    onClick={() => setShowNewCustomerForm(true)}
                    className="btn-outline"
                    style={{ padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8 }}
                  >
                    <Plus size={14} /> Thêm Người mua mới
                  </button>
                )}
              </div>
              {creditDetail && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{
                    padding: '8px 12px',
                    background: getTotalAmount() > creditDetail.hmkd ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    borderRadius: 8, fontSize: 12, color: getTotalAmount() > creditDetail.hmkd ? '#fca5a5' : '#6ee7b7',
                    border: '1px solid currentColor'
                  }}>
                    Khách hàng HMKD: <strong>{creditDetail.hmkd.toLocaleString()}đ</strong>
                  </div>
                  <div style={{
                    padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8, fontSize: 12, color: '#fcd34d',
                    border: '1px solid currentColor'
                  }}>
                    Khách hàng NQH: <strong>{creditDetail.overdueDebts.filter(d => d.status === 'ACTIVE').reduce((sum, d) => sum + d.principalAmount, 0).toLocaleString()}đ</strong>
                  </div>
                </div>
              )}
            </div>

            {!showNewCustomerForm ? (
              <div>
                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm người mua theo tên, số điện thoại, username..."
                    className="input-field"
                    style={{ paddingLeft: 42 }}
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                  />
                </div>

                <div style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto', 
                  paddingRight: 8,
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: 16 
                }}>
                  {/* Default Buyer Selection Card */}
                  {customerSearch.length === 0 && (
                    <div
                      onClick={() => handleSelectCustomer(null)}
                      className="agency-card glass-card"
                      style={{
                        padding: 16,
                        border: !selectedCustomer ? '2px solid var(--accent)' : '1px solid var(--border)',
                        borderRadius: 12,
                        cursor: 'pointer',
                        background: !selectedCustomer ? 'var(--accent-glow)' : 'transparent',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ 
                        background: !selectedCustomer ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)', 
                        padding: 8, 
                        borderRadius: 8,
                        color: !selectedCustomer ? 'white' : 'var(--accent-light)' 
                      }}>
                        <User size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedAgency?.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Người mua nhận hàng mặc định</div>
                      </div>
                    </div>
                  )}

                  {/* Filtered Buyers */}
                  {agencyCustomers.filter(customer => {
                    const query = customerSearch.toLowerCase();
                    return (
                      (customer.organizationName || '').toLowerCase().includes(query) ||
                      (customer.receiverName || '').toLowerCase().includes(query) ||
                      (customer.receiverPhone && customer.receiverPhone.toLowerCase().includes(query))
                    );
                  }).length > 0 ? (
                    agencyCustomers.filter(customer => {
                      const query = customerSearch.toLowerCase();
                      return (
                        (customer.organizationName || '').toLowerCase().includes(query) ||
                        (customer.receiverName || '').toLowerCase().includes(query) ||
                        (customer.receiverPhone && customer.receiverPhone.toLowerCase().includes(query))
                      );
                    }).map(customer => {
                      const debtInfo = creditDetail?.customerDebts.find(d => d.customerId === customer.id);
                      const overdueDebt = creditDetail?.overdueDebts.filter(d => d.customerId === customer.id && d.status === 'ACTIVE').reduce((sum, d) => sum + d.principalAmount, 0) || 0;
                      const isSelected = selectedCustomer?.id === customer.id;

                      return (
                        <div
                          key={customer.id}
                          className="agency-card glass-card"
                          onClick={() => handleSelectCustomer(customer)}
                          style={{
                            padding: 16,
                            border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                            borderRadius: 12,
                            cursor: 'pointer',
                            background: isSelected ? 'var(--accent-glow)' : 'transparent',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-start',
                            position: 'relative',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ 
                            background: isSelected ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)', 
                            padding: 8, 
                            borderRadius: 8,
                            color: isSelected ? 'white' : 'var(--accent-light)' 
                          }}>
                            <User size={20} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customer.organizationName || customer.receiverName || `#${customer.id}`}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                              Dư nợ: <span style={{ color: (debtInfo?.totalDebt || 0) > 0 ? 'var(--danger)' : 'inherit', fontWeight: (debtInfo?.totalDebt || 0) > 0 ? 600 : 400 }}>{(debtInfo?.totalDebt || 0).toLocaleString()}đ</span>
                            </div>
                            {overdueDebt > 0 && (
                              <div style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600, marginTop: 2 }}>
                                Nợ quá hạn: {overdueDebt.toLocaleString()}đ
                              </div>
                            )}
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>SĐT: {customer.receiverPhone || 'N/A'}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    customerSearch.length > 0 && (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                        Không tìm thấy người mua nào phù hợp
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <button
                    onClick={() => { setShowNewCustomerForm(false); setSelectedCustomer(null); }}
                    className="btn-secondary"
                    style={{ marginBottom: 16 }}
                  >
                    ← Quay lại chọn người mua có sẵn
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

        {step === 3 && (() => {
          // Compute unique brands in scope
          const uniqueBrands = Array.from(new Set(products.map(p => p.brand?.name).filter(Boolean))) as string[];

          // Filter products reactively in-memory
          const filteredProducts = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                                  (product.brand?.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
                                  (product.categoryName || '').toLowerCase().includes(productSearch.toLowerCase());
            const matchesCategory = !effectiveLeafIds || (product.categoryId !== undefined && effectiveLeafIds.has(product.categoryId));
            const matchesBrand = !selectedBrand || product.brand?.name === selectedBrand;
            return matchesSearch && matchesCategory && matchesBrand;
          });

          const getProductInitials = (name: string) => {
            return name ? name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : 'SP';
          };

          return (
            <div>
              <h3 style={{ marginBottom: 16 }}>Chọn sản phẩm</h3>
              
              {/* Product Search Box */}
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Tìm sản phẩm theo tên, thương hiệu, danh mục..."
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />
              </div>

              {/* Category and Brand Filter Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
                {/* Hierarchical Category Selector */}
                {catOptions.some(opts => opts.length > 0) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 80, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Filter size={14} /> Danh mục:
                    </span>
                    {catOptions.map((options, level) => (
                      <SearchableSelect
                        key={level}
                        options={options.map(c => ({ value: c.id, label: c.name }))}
                        value={catSelections[level]}
                        onChange={(val) => handleCategoryChange(level, val !== undefined ? Number(val) : undefined)}
                        placeholder={levelNames[level]}
                        disabled={level > 0 && (catSelections[level - 1] === undefined || catOptions[level - 1].length === 0)}
                        style={{ minWidth: 140 }}
                      />
                    ))}
                    {catSelections.some(s => s !== undefined) && (
                      <button
                        onClick={() => {
                          setCatSelections([undefined, undefined, undefined, undefined]);
                          setCatOptions(prev => {
                            const next = [...prev];
                            for (let i = 1; i < next.length; i++) next[i] = [];
                            return next;
                          });
                        }}
                        style={{
                          padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem',
                          background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                      >
                        Xoá bộ lọc
                      </button>
                    )}
                  </div>
                )}

                {uniqueBrands.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 80, fontWeight: 500 }}>Thương hiệu:</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 2 }}>
                      <button
                        onClick={() => setSelectedBrand(null)}
                        className="badge"
                        style={{ 
                          cursor: 'pointer',
                          background: !selectedBrand ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                          color: !selectedBrand ? 'white' : 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                          transition: 'all 0.2s'
                        }}
                      >
                        Tất cả
                      </button>
                      {uniqueBrands.map(br => (
                        <button
                          key={br}
                          onClick={() => setSelectedBrand(br === selectedBrand ? null : br)}
                          className="badge"
                          style={{ 
                            cursor: 'pointer',
                            background: selectedBrand === br ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                            color: selectedBrand === br ? 'white' : 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                            transition: 'all 0.2s'
                          }}
                        >
                          {br}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Products List Zone */}
              <div style={{ 
                maxHeight: '450px', 
                overflowY: 'auto', 
                paddingRight: 8,
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                gap: 16, 
                marginBottom: 24 
              }}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleAddToCart(product)}
                      className="product-card glass-card"
                      style={{
                        padding: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                        position: 'relative',
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        {/* Image area */}
                        <div style={{
                          width: '100%',
                          height: 120,
                          borderRadius: 8,
                          background: 'rgba(255, 255, 255, 0.02)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          marginBottom: 10,
                          border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          ) : (
                            <div style={{
                              fontSize: 22,
                              fontWeight: 700,
                              color: 'var(--accent-light)',
                              background: 'linear-gradient(135deg, var(--accent-glow) 0%, rgba(139, 92, 246, 0.05) 100%)',
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {getProductInitials(product.name)}
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div style={{ 
                          fontWeight: 600, 
                          fontSize: 14, 
                          lineHeight: '1.4', 
                          marginBottom: 6, 
                          color: 'var(--text-primary)',
                          display: '-webkit-box', 
                          WebkitLineClamp: 2, 
                          WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden', 
                          height: 40 
                        }}>
                          {product.name}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                          {product.brand?.name && (
                            <span className="badge badge-primary" style={{ fontSize: 10, padding: '1px 6px' }}>{product.brand.name}</span>
                          )}
                          {product.categoryName && (
                            <span className="badge badge-info" style={{ fontSize: 10, padding: '1px 6px' }}>{product.categoryName}</span>
                          )}
                          {product.isDropship && (
                            <span className="badge badge-success" style={{ fontSize: 10, padding: '1px 6px' }}>Dropship</span>
                          )}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: 8, marginTop: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Đơn vị: {product.unit || 'Cái'}</span>
                          <span style={{ 
                            fontSize: 11, 
                            color: (product.stockQuantity || 0) > 0 ? 'var(--success)' : 'var(--danger)',
                            fontWeight: 600
                          }}>
                            {(product.stockQuantity || 0) > 0 ? `Tồn: ${product.stockQuantity}` : 'Hết hàng'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ color: 'var(--accent-light)', fontWeight: 700, fontSize: 15 }}>
                              {(product.appliedPrice || product.basePrice)?.toLocaleString()}đ
                            </div>
                            {product.oldAppliedPrice && product.oldAppliedPrice > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: 12 }}>
                                  {product.oldAppliedPrice.toLocaleString()}đ
                                </span>
                                <span style={{ 
                                  color: product.priceChangeRatio && product.priceChangeRatio < 0 ? '#10b981' : '#ef4444', 
                                  fontSize: 11, 
                                  fontWeight: 600,
                                  background: product.priceChangeRatio && product.priceChangeRatio < 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  padding: '1px 4px',
                                  borderRadius: 4
                                }}>
                                  {product.priceChangeRatio && product.priceChangeRatio > 0 ? `+${product.priceChangeRatio.toFixed(0)}%` : `${product.priceChangeRatio?.toFixed(0)}%`}
                                </span>
                              </div>
                            )}
                          </div>
                          <div style={{ 
                            background: 'var(--accent)', 
                            color: 'white', 
                            borderRadius: '50%', 
                            width: 26, 
                            height: 26, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: 16,
                            boxShadow: '0 2px 8px var(--accent-glow)'
                          }}>
                            +
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    Không tìm thấy sản phẩm nào phù hợp
                  </div>
                )}
              </div>

              {/* Cart Zone */}
              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Package size={18} style={{ color: 'var(--accent-light)' }} /> Giỏ hàng ({cart.length} sản phẩm)
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: 4 }}>
                    {cart.map(item => {
                      const hasPolicyDiscount = item.policyPrice !== undefined && item.policyPrice !== item.basePrice;
                      return (
                        <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                              {item.productName}
                              {hasPolicyDiscount && (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 3,
                                  background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                                  fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4
                                }}>
                                  <Tag size={10} /> CSBH
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                              {hasPolicyDiscount ? (
                                <>
                                  <span style={{ color: 'var(--text-muted)', fontSize: 11, textDecoration: 'line-through' }}>
                                    {item.basePrice.toLocaleString()}đ
                                  </span>
                                  <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>
                                    {item.policyPrice!.toLocaleString()}đ
                                  </span>
                                </>
                              ) : (
                                <span style={{ color: 'var(--accent-light)', fontSize: 12 }}>
                                  {item.price.toLocaleString()}đ
                                </span>
                              )}
                              {item.resolvingPrice && (
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>đang cập nhật...</span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} style={{ width: 28, height: 28, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', cursor: 'pointer' }}>-</button>
                            <span style={{ minWidth: 24, textAlign: 'center', fontSize: 13 }}>{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} style={{ width: 28, height: 28, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', cursor: 'pointer' }}>+</button>
                            <span style={{ minWidth: 70, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>
                              {(item.price * item.quantity).toLocaleString()}đ
                            </span>
                            <button onClick={() => removeFromCart(item.productId)} style={{ marginLeft: 4, background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {cart.some(item => item.policyPrice !== undefined && item.policyPrice !== item.basePrice) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '8px 12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <Tag size={14} style={{ color: '#10b981' }} />
                      <span style={{ fontSize: 12, color: '#6ee7b7' }}>Chính sách bán hàng đã được áp dụng cho một số sản phẩm</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
                    <span>Tổng tiền:</span>
                    <span style={{ color: 'var(--success)' }}>{getTotalAmount().toLocaleString()}đ</span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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
                <div>Người mua: <strong>{selectedCustomer?.organizationName || selectedCustomer?.receiverName || 'Người mua #' + selectedCustomer?.id}</strong></div>
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
                <div style={{ gridColumn: '1 / -1' }}>Địa chỉ giao: <strong>{shippingAddress || selectedAgency?.shippingAddress || selectedAgency?.billingAddress}</strong></div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Sản phẩm ({cart.length})</div>
              {cart.map(item => {
                const hasPolicyDiscount = item.policyPrice !== undefined && item.policyPrice !== item.basePrice;
                return (
                  <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{item.productName} x{item.quantity}</span>
                      {hasPolicyDiscount && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                          fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4
                        }}>
                          <Tag size={9} /> CSBH
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {hasPolicyDiscount && (
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 12 }}>
                          {(item.basePrice * item.quantity).toLocaleString()}đ
                        </span>
                      )}
                      <span style={{ fontWeight: hasPolicyDiscount ? 600 : 400, color: hasPolicyDiscount ? '#10b981' : 'inherit' }}>
                        {(item.price * item.quantity).toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                );
              })}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
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
                <label className="form-label">Phương thức thanh toán</label>
                <select className="form-input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="">-- Chọn --</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                </select>
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
