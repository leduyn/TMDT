import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { SafeScreen } from '../../components/SafeScreen';
import { useCart } from '../../context/CartContext';
import { CartItemRow } from '../../components/CartItemRow';
import { Colors, BorderRadius, Shadow, Spacing, FontSize, FontWeight } from '../../theme';
import { CartCreditBar } from '../../components/CartCreditBar';
import { CompactCreditBar } from '../../components/CompactCreditBar';
import { creditApi } from '../../api/credit';
import { useAuth } from '../../context/AuthContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental && typeof UIManager.setLayoutAnimationEnabledExperimental === 'function') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BOTTOM_BUFFER = 100;

export function CartScreen({ navigation }: any) {
  const { items, updateQuantity, clearCart, totalAmount, totalItems } = useCart();
  const { agencyId, storedAgencyId } = useAuth();
  const effectiveAgencyId = agencyId || storedAgencyId;
  const [couponCode, setCouponCode] = useState('');
  const [hmkd, setHmkd] = useState<number | null>(null);
  const [showCompactBar, setShowCompactBar] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollViewHeight = useRef(0);
  const contentHeight = useRef(0);

  useEffect(() => {
    if (!effectiveAgencyId) return;
    creditApi.getHmkd(effectiveAgencyId)
      .then(res => setHmkd(res.hmkd))
      .catch(() => { });
  }, [effectiveAgencyId]);

  // Computed values
  const discountRate = 0.05;
  const vatRate = 0.08;
  const discount = Math.round(totalAmount * discountRate);
  const shipping = totalAmount >= 10000000 ? 0 : 35000;
  const subtotalAfterDiscount = totalAmount - discount;
  const vat = Math.round(subtotalAfterDiscount * vatRate);
  const grandTotal = subtotalAfterDiscount + vat + shipping;

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng');
      return;
    }
    navigation.navigate('Checkout');
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      Alert.alert('Mã ưu đãi', `Mã "${couponCode}" đang được kiểm tra...`);
    }
  };

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const scrollH = scrollViewHeight.current;
    const contentH = contentHeight.current;

    if (contentH <= scrollH) return;

    const nearBottom = y + scrollH >= contentH - BOTTOM_BUFFER;

    if (nearBottom && !isAtBottom) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsAtBottom(true);
      setShowCompactBar(false);
    } else if (!nearBottom && isAtBottom) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsAtBottom(false);
      setShowCompactBar(true);
    }
  };

  const handleContentSizeChange = (w: number, h: number) => {
    contentHeight.current = h;
  };

  const handleScrollLayout = (e: any) => {
    scrollViewHeight.current = e.nativeEvent.layout.height;
  };

  // ───── Empty Cart State ─────
  if (items.length === 0) {
    return (
      <SafeScreen style={styles.container} statusBar={{ barStyle: 'light-content', backgroundColor: Colors.primary }}>
        <View style={styles.cartHeader}>
          <Text style={styles.cartHeaderTitle}>Giỏ hàng</Text>
          <Text style={styles.cartHeaderCount}>0 sản phẩm</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Text style={styles.emptyIcon}>🛒</Text>
          </View>
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>
            Hãy khám phá các sản phẩm chất lượng dành cho đại lý
          </Text>
          <TouchableOpacity
            style={styles.emptyShopBtn}
            onPress={() => navigation.navigate('CategoryList')}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyShopBtnText}>🛍  Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  // ───── Cart with Items ─────
  return (
    <SafeScreen style={styles.screen} statusBar={{ barStyle: 'light-content', backgroundColor: Colors.primary }}>
      {/* Header */}
      <View style={styles.cartHeader}>
        <Text style={styles.cartHeaderTitle}>Giỏ hàng</Text>
        <Text style={styles.cartHeaderCount}>{totalItems} sản phẩm</Text>
      </View>
      {/* CompactCreditBar — fixed above ScrollView, hidden when at bottom */}
      {hmkd !== null && showCompactBar && (
        <View style={styles.compactBarOuter}>
          <CompactCreditBar cartValue={grandTotal} hmkd={hmkd} />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleScrollLayout}
      >
        {/* ─── Cart Items Card ─── */}
        <View style={styles.itemsCard}>
          {items.map((item) => (
            <CartItemRow
              key={String(item.product.id)}
              item={item}
              onUpdateQuantity={updateQuantity}
            />
          ))}
        </View>

        {/* ─── Promo Bento Grid ─── */}
        <View style={styles.bentoGrid}>
          <View style={styles.warrantyCard}>
            <View style={styles.warrantyContent}>
              <Text style={styles.warrantyTitle}>Gói bảo hành vàng</Text>
              <Text style={styles.warrantyDesc}>
                Thêm bảo hành 2 năm cho tất cả thiết bị chỉ với 499.000đ
              </Text>
              <TouchableOpacity style={styles.warrantyBtn} activeOpacity={0.85}>
                <Text style={styles.warrantyBtnText}>Thêm ngay</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.warrantyBgIcon}>🛡</Text>
          </View>

          <View style={styles.shippingCard}>
            <View style={styles.shippingHeader}>
              <Text style={styles.shippingIcon}>🚚</Text>
              <Text style={styles.shippingBadge}>MIỄN PHÍ</Text>
            </View>
            <Text style={styles.shippingTitle}>Vận chuyển hỏa tốc</Text>
            <Text style={styles.shippingDesc}>
              Dành cho đơn hàng trên 10 triệu
            </Text>
          </View>
        </View>

        {/* ─── Order Summary ─── */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryDivider} />

          <View style={styles.summaryRows}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng tiền hàng</Text>
              <Text style={styles.summaryValue}>
                {totalAmount.toLocaleString('vi-VN')}đ
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá đại lý (5%)</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                -{discount.toLocaleString('vi-VN')}đ
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>
                {shipping === 0 ? '0đ' : `${shipping.toLocaleString('vi-VN')}đ`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thuế VAT (8%)</Text>
              <Text style={styles.summaryValue}>
                {vat.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </View>

          <View style={styles.grandTotalDivider} />
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Tổng thanh toán</Text>
            <Text style={styles.grandTotalValue}>
              {grandTotal.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <Text style={styles.taxNote}>Đã bao gồm các loại thuế và phí</Text>

          {/* Coupon Input */}
          <View style={styles.couponWrapper}>
            <TextInput
              style={styles.couponInput}
              placeholder="Nhập mã ưu đãi..."
              placeholderTextColor={Colors.textTertiary}
              value={couponCode}
              onChangeText={setCouponCode}
            />
            <TouchableOpacity
              style={styles.couponBtn}
              onPress={handleApplyCoupon}
              activeOpacity={0.85}
            >
              <Text style={styles.couponBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={handleCheckout}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutBtnText}>Tiến hành thanh toán</Text>
            <Text style={styles.checkoutArrow}>→</Text>
          </TouchableOpacity>

          {/* Continue Shopping */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => navigation.navigate('CategoryList')}
            activeOpacity={0.7}
          >
            <Text style={styles.continueBtnIcon}>🛍</Text>
            <Text style={styles.continueBtnText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>

        {/* CartCreditBar (bottom) — collapsed by default, expands when at bottom */}
        {hmkd !== null && (
          <CartCreditBar cartValue={grandTotal} hmkd={hmkd} expanded={isAtBottom} />
        )}

        {/* Clear Cart */}
        <TouchableOpacity
          style={styles.clearCartBtn}
          onPress={() => {
            Alert.alert('Xóa giỏ hàng', 'Bạn có chắc muốn xóa tất cả sản phẩm?', [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Xóa tất cả', style: 'destructive', onPress: clearCart },
            ]);
          }}
        >
          <Text style={styles.clearCartText}>🗑  Xóa toàn bộ giỏ hàng</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },

  // ─── Cart Header ───
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  cartHeaderTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  cartHeaderCount: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FontWeight.semibold,
  },

  // ─── Empty State ───
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 44,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  emptyShopBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    ...Shadow.md,
  },
  emptyShopBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // ─── CompactCreditBar Outer (fixed above ScrollView) ───
  compactBarOuter: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: Colors.background,
  },

  // ─── Items Card ───
  itemsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },

  // ─── Bento Promo Grid ───
  bentoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  warrantyCard: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  warrantyContent: {
    position: 'relative',
    zIndex: 2,
  },
  warrantyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
  },
  warrantyDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 17,
    maxWidth: 160,
  },
  warrantyBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  warrantyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  warrantyBgIcon: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    fontSize: 80,
    opacity: 0.1,
  },
  shippingCard: {
    flex: 1,
    backgroundColor: Colors.accentLight,
    borderRadius: BorderRadius.lg,
    padding: 14,
    justifyContent: 'space-between',
  },
  shippingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingIcon: {
    fontSize: 20,
  },
  shippingBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#713B00',
    letterSpacing: 0.5,
  },
  shippingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#713B00',
    marginTop: 10,
  },
  shippingDesc: {
    fontSize: 10,
    color: 'rgba(113,59,0,0.7)',
    marginTop: 4,
  },

  // ─── Order Summary ───
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginTop: 16,
    ...Shadow.sm,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 14,
  },
  summaryRows: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  discountValue: {
    color: '#0D9488',
  },
  grandTotalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 16,
    marginBottom: 12,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  taxNote: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },

  // Coupon
  couponWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    marginBottom: 10,
  },
  couponInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  couponBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 4,
    borderRadius: 8,
  },
  couponBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.3,
  },

  // Checkout
  checkoutBtn: {
    backgroundColor: '#904D00',
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadow.lg,
    shadowColor: '#904D00',
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  checkoutArrow: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    marginTop: 10,
  },
  continueBtnIcon: {
    fontSize: 14,
  },
  continueBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.3,
  },

  // Clear cart
  clearCartBtn: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  clearCartText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});
