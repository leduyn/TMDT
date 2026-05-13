'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderApi, OrderRequest } from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  CreditCard, 
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

export default function CheckoutPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState(user?.shippingAddress || '');
  const [loading, setLoading] = useState(false);
  const [promotionCode, setPromotionCode] = useState('');

  const handleSubmitOrder = async () => {
    if (items.length === 0) return;
    if (!shippingAddress.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    setLoading(true);
    try {
      const orderRequest: OrderRequest = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        shippingAddress,
        promotionCode,
        orderType: 'DROPSHIP' // Default
      };

      // Determine which API to call based on role
      let response;
      if (user?.roles.includes('ROLE_COMPANY') || user?.roles.includes('ROLE_ADMIN')) {
        response = await orderApi.createByEmployee(orderRequest);
      } else if (user?.roles.includes('ROLE_AGENCY')) {
        response = await orderApi.createByAgency(orderRequest);
      } else {
        response = await orderApi.create(orderRequest);
      }

      alert('Đặt hàng thành công!');
      clearCart();
      router.push('/orders');
    } catch (error) {
      alert('Đặt hàng thất bại: ' + error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.3 }}>
          <ShoppingBag size={80} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ marginBottom: 16 }}>Giỏ hàng của bạn đang trống</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Hãy quay lại danh sách sản phẩm để chọn món đồ yêu thích</p>
        <button className="btn btn-primary" onClick={() => router.push('/products')}>
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: 32 }}>
        <button 
          onClick={() => router.back()} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}
        >
          <ChevronLeft size={18} /> Quay lại
        </button>
        <h1>Xác nhận đơn hàng</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>
        {/* Left: Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <GlassCard title="Sản phẩm trong giỏ" icon={<ShoppingBag size={20} />}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item) => (
                <div 
                  key={item.product.id} 
                  style={{ 
                    display: 'flex', gap: 20, padding: '20px 0', 
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  <div style={{ 
                    width: 80, height: 80, borderRadius: 12, overflow: 'hidden',
                    background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ShoppingBag size={32} style={{ opacity: 0.2 }} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.product.name}</h4>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 4 }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                      {item.product.categoryName || 'Chưa phân loại'}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 4, border: '1px solid var(--border)' }}>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ width: 40, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {((item.product.appliedPrice || item.product.basePrice || 0) * item.quantity).toLocaleString()}đ
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Địa chỉ giao hàng" icon={<MapPin size={20} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Địa chỉ nhận hàng</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <GlassCard title="Tổng kết đơn hàng" icon={<CreditCard size={20} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Tạm tính</span>
                <span>{totalPrice.toLocaleString()}đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Phí vận chuyển</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>Miễn phí</span>
              </div>
              
              <div style={{ marginTop: 8 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Mã giảm giá</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Nhập mã..." 
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value)}
                  />
                  <button className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>Áp dụng</button>
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 800 }}>
                <span>Tổng cộng</span>
                <span className="gradient-text">{totalPrice.toLocaleString()}đ</span>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', height: 54, fontSize: '1.1rem', fontWeight: 700 }}
              onClick={handleSubmitOrder}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (
                <>
                  Đặt hàng ngay <ArrowRight size={20} style={{ marginLeft: 8 }} />
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 16 }}>
              Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
            </p>
          </GlassCard>

          <GlassCard style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ background: 'var(--primary)', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>!</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Hệ thống sẽ tự động áp dụng giá tốt nhất dựa trên bảng giá của bạn.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

