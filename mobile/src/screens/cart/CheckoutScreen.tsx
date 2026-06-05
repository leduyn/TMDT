import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api/order';
import { Colors, BorderRadius, Shadow, Spacing, FontSize, FontWeight } from '../../theme';
import type { OrderRequest } from '../../types';

export function CheckoutScreen({ navigation }: any) {
  const { items, clearCart, totalAmount, totalItems } = useCart();
  const { user } = useAuth();

  // Shipping Info States
  const [shippingAddress, setShippingAddress] = useState(
    user?.shippingAddress || '123 Đường B2B, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh'
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(shippingAddress);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'Tiền mặt' | 'Chuyển khoản' | 'Thẻ tín dụng'>('Tiền mặt');

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>('FREESHIP_AGENCY');

  // Shipping and Discount math
  const baseShippingFee = 45000;
  const shippingFee = appliedPromo === 'FREESHIP_AGENCY' ? 0 : baseShippingFee;
  const promoDiscount = appliedPromo === 'FREESHIP_AGENCY' ? baseShippingFee : 0;
  const grandTotal = totalAmount + shippingFee;

  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const code = couponCode.trim().toUpperCase();
    if (code === 'FREESHIP_AGENCY') {
      setAppliedPromo(code);
      Alert.alert('Áp dụng thành công', 'Bạn đã được miễn phí vận chuyển 45.000đ!');
    } else {
      Alert.alert('Không hợp lệ', 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    setAppliedPromo(null);
  };

  const handleSaveAddress = () => {
    if (!tempAddress.trim()) {
      Alert.alert('Lỗi', 'Địa chỉ giao hàng không được để trống.');
      return;
    }
    setShippingAddress(tempAddress);
    setIsEditingAddress(false);
  };

  const handleConfirmOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.');
      return;
    }

    if (!shippingAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ nhận hàng.');
      return;
    }

    setLoading(false);
    
    // We confirm with user using standard Alert
    Alert.alert(
      'Xác nhận đặt hàng',
      `Tổng thanh toán: ${grandTotal.toLocaleString('vi-VN')}đ. Bạn có muốn gửi đơn hàng này không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đặt hàng', onPress: submitOrder }
      ]
    );
  };

  const submitOrder = async () => {
    setLoading(true);
    try {
      const requestData: OrderRequest = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        shippingAddress,
        promotionCode: appliedPromo || undefined,
        paymentMethod,
        orderType: 'DROPSHIP',
        deliveryFee: shippingFee,
        orderSource: 'Mobile'
      };

      // Determine which API depending on user roles
      if (user?.role === 'ROLE_AGENCY') {
        await orderApi.createByAgency(requestData);
      } else {
        await orderApi.create(requestData);
      }

      setLoading(false);
      Alert.alert(
        'Đặt hàng thành công',
        'Cảm ơn bạn! Đơn hàng của bạn đã được ghi nhận vào hệ thống.',
        [
          {
            text: 'Xem đơn hàng',
            onPress: () => {
              clearCart();
              // Reset to main dashboard stack
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }
          }
        ]
      );
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Lỗi đặt hàng', err.message || 'Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Desc */}
        <View style={styles.headerInfo}>
          <Text style={styles.headerSubtitle}>
            Vui lòng kiểm tra lại thông tin trước khi hoàn tất đặt hàng.
          </Text>
        </View>

        {/* ─── Thông tin nhận hàng (Shipping Info) ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrapper}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
            </View>
            {!isEditingAddress ? (
              <TouchableOpacity onPress={() => { setTempAddress(shippingAddress); setIsEditingAddress(true); }}>
                <Text style={styles.actionBtnText}>Thay đổi</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActionRow}>
                <TouchableOpacity onPress={handleSaveAddress}>
                  <Text style={[styles.actionBtnText, { color: Colors.success }]}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditingAddress(false)}>
                  <Text style={[styles.actionBtnText, { color: Colors.error }]}>Hủy</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isEditingAddress ? (
            <View style={styles.editAddressContainer}>
              <TextInput
                style={styles.addressInput}
                multiline
                numberOfLines={3}
                placeholder="Nhập địa chỉ nhận hàng chi tiết..."
                placeholderTextColor={Colors.textTertiary}
                value={tempAddress}
                onChangeText={setTempAddress}
              />
            </View>
          ) : (
            <View style={styles.addressCardList}>
              {/* Default Address Card */}
              <View style={styles.addressCardActive}>
                <View style={styles.checkIconWrapper}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.addressTag}>ĐỊA CHỈ MẶC ĐỊNH</Text>
                <Text style={styles.addressName}>{user?.displayName || user?.username || 'Đại lý Minh Phát'}</Text>
                <Text style={styles.addressPhone}>{user?.phone || '090 123 4567'}</Text>
                <Text style={styles.addressDetail}>{shippingAddress}</Text>
              </View>

              {/* Add New Address Card */}
              <TouchableOpacity style={styles.addAddressCard} activeOpacity={0.8}>
                <Ionicons name="add-outline" size={24} color={Colors.textSecondary} />
                <Text style={styles.addAddressText}>Thêm địa chỉ mới</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ─── Phương thức thanh toán (Payment Method) ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrapper}>
              <Ionicons name="card-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            </View>
          </View>

          <View style={styles.paymentList}>
            {/* COD */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'Tiền mặt' && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod('Tiền mặt')}
              activeOpacity={0.85}
            >
              <View style={styles.radioCircle}>
                {paymentMethod === 'Tiền mặt' && <View style={styles.radioInnerCircle} />}
              </View>
              <View style={styles.paymentIconWrapper}>
                <Ionicons name="cash-outline" size={18} color={paymentMethod === 'Tiền mặt' ? Colors.white : Colors.textSecondary} />
              </View>
              <View style={styles.paymentTextWrapper}>
                <Text style={styles.paymentTitle}>Tiền mặt khi nhận hàng (COD)</Text>
                <Text style={styles.paymentDesc}>Thanh toán trực tiếp cho nhân viên giao hàng.</Text>
              </View>
            </TouchableOpacity>

            {/* Bank Transfer */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'Chuyển khoản' && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod('Chuyển khoản')}
              activeOpacity={0.85}
            >
              <View style={styles.radioCircle}>
                {paymentMethod === 'Chuyển khoản' && <View style={styles.radioInnerCircle} />}
              </View>
              <View style={styles.paymentIconWrapper}>
                <Ionicons name="business-outline" size={18} color={paymentMethod === 'Chuyển khoản' ? Colors.white : Colors.textSecondary} />
              </View>
              <View style={styles.paymentTextWrapper}>
                <Text style={styles.paymentTitle}>Chuyển khoản ngân hàng</Text>
                <Text style={styles.paymentDesc}>Quét mã QR hoặc chuyển khoản ngân hàng 24/7.</Text>
              </View>
            </TouchableOpacity>

            {/* Credit Card */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'Thẻ tín dụng' && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod('Thẻ tín dụng')}
              activeOpacity={0.85}
            >
              <View style={styles.radioCircle}>
                {paymentMethod === 'Thẻ tín dụng' && <View style={styles.radioInnerCircle} />}
              </View>
              <View style={styles.paymentIconWrapper}>
                <Ionicons name="card-outline" size={18} color={paymentMethod === 'Thẻ tín dụng' ? Colors.white : Colors.textSecondary} />
              </View>
              <View style={styles.paymentTextWrapper}>
                <Text style={styles.paymentTitle}>Thẻ Tín dụng / Ghi nợ</Text>
                <Text style={styles.paymentDesc}>Hỗ trợ các thẻ Visa, Mastercard, JCB.</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Mã khuyến mãi (Promo Code) ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrapper}>
              <Ionicons name="pricetag-outline" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Mã khuyến mãi</Text>
            </View>
          </View>

          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Nhập mã ưu đãi của bạn..."
              placeholderTextColor={Colors.textTertiary}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.couponApplyBtn} onPress={handleApplyCoupon} activeOpacity={0.8}>
              <Text style={styles.couponApplyText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          {appliedPromo && (
            <View style={styles.appliedPromoContainer}>
              <View style={styles.appliedPromoChip}>
                <Text style={styles.appliedPromoText}>{appliedPromo}</Text>
                <TouchableOpacity onPress={handleRemoveCoupon}>
                  <Ionicons name="close-circle" size={16} color="#0D9488" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ─── Tóm tắt đơn hàng (Order Summary) ─── */}
        <View style={styles.sectionCard}>
          <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.divider} />

          {/* Cart items preview list */}
          <View style={styles.summaryItemsList}>
            {items.map((item) => (
              <View key={String(item.product.id)} style={styles.summaryItemRow}>
                <View style={styles.itemImageWrapper}>
                  {item.product.imageUrl ? (
                    <Image source={{ uri: item.product.imageUrl }} style={styles.itemImage} />
                  ) : (
                    <Text style={styles.itemImageText}>
                      {item.product.name ? item.product.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : 'SP'}
                    </Text>
                  )}
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemQty}>SL: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  {((item.product.appliedPrice || item.product.basePrice || 0) * item.quantity).toLocaleString('vi-VN')}đ
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Pricing calculations */}
          <View style={styles.pricingLines}>
            <View style={styles.pricingLine}>
              <Text style={styles.pricingLabel}>Tạm tính ({totalItems} sản phẩm)</Text>
              <Text style={styles.pricingValue}>{totalAmount.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.pricingLine}>
              <Text style={styles.pricingLabel}>Phí vận chuyển</Text>
              <Text style={styles.pricingValue}>{baseShippingFee.toLocaleString('vi-VN')}đ</Text>
            </View>
            {appliedPromo === 'FREESHIP_AGENCY' && (
              <View style={styles.pricingLine}>
                <Text style={[styles.pricingLabel, { color: '#0D9488' }]}>Giảm giá mã ưu đãi</Text>
                <Text style={[styles.pricingValue, { color: '#0D9488', fontWeight: '700' }]}>
                  -{promoDiscount.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            )}
          </View>

          <View style={styles.grandDivider} />

          <View style={styles.grandTotalLine}>
            <Text style={styles.grandTotalLabel}>Tổng thanh toán</Text>
            <Text style={styles.grandTotalValue}>{grandTotal.toLocaleString('vi-VN')}đ</Text>
          </View>
          <Text style={styles.taxNote}>(Đã bao gồm thuế GTGT)</Text>
        </View>

        {/* ─── Submit CTA Button ─── */}
        <TouchableOpacity
          style={styles.confirmOrderBtn}
          onPress={handleConfirmOrder}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Text style={styles.confirmOrderText}>Xác nhận đặt hàng</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} style={styles.confirmOrderArrow} />
            </>
          )}
        </TouchableOpacity>

        {/* Security Lock footer */}
        <View style={styles.securityFooter}>
          <Ionicons name="lock-closed-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.securityText}>Thanh toán bảo mật & an toàn</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerInfo: {
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Generic Card Container
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
    ...Shadow.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  actionBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  editActionRow: {
    flexDirection: 'row',
    gap: 12,
  },

  // Shipping Section styles
  editAddressContainer: {
    marginTop: 4,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    padding: 10,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  addressCardList: {
    gap: 12,
  },
  addressCardActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F0F4FA', // Colors.primarySoft
    padding: 14,
    position: 'relative',
  },
  checkIconWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  addressTag: {
    fontSize: FontSize.xs - 1,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  addressName: {
    fontSize: FontSize.md - 1,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  addressDetail: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  addAddressCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  addAddressText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },

  // Payment Section styles
  paymentList: {
    gap: 10,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 12,
    backgroundColor: Colors.surface,
  },
  paymentOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F4FA', // Colors.primarySoft
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  paymentIconWrapper: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentTextWrapper: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: FontSize.sm - 1,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  paymentDesc: {
    fontSize: FontSize.xs - 1,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Coupon styles
  couponRow: {
    flexDirection: 'row',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  couponApplyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponApplyText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  appliedPromoContainer: {
    marginTop: 10,
    flexDirection: 'row',
  },
  appliedPromoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(13,148,136,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(13,148,136,0.25)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  appliedPromoText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#0D9488',
  },

  // Summary Card styles
  summaryTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 10,
  },
  summaryItemsList: {
    gap: 12,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemImageWrapper: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImageText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  itemQty: {
    fontSize: FontSize.xs - 1,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  pricingLines: {
    gap: 8,
  },
  pricingLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: FontSize.sm - 1,
    color: Colors.textSecondary,
  },
  pricingValue: {
    fontSize: FontSize.sm - 1,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  grandDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 12,
    marginBottom: 10,
  },
  grandTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  grandTotalValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  taxNote: {
    fontSize: FontSize.xs - 1,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // CTA button
  confirmOrderBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadow.md,
    shadowColor: Colors.primary,
    marginTop: 10,
  },
  confirmOrderText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  confirmOrderArrow: {
    marginTop: 1,
  },

  // Security Footer
  securityFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  securityText: {
    fontSize: FontSize.xs - 1,
    color: Colors.textTertiary,
  },
});
