import React, { useState, useEffect } from 'react';
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
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api/order';
import { agencyApi } from '../../api/agency';
import { Colors, BorderRadius, Shadow, Spacing, FontSize, FontWeight } from '../../theme';
import type { OrderRequest, UserDTO } from '../../types';
import { resolveImageUrl } from '../../utils';

export function CheckoutScreen({ navigation }: any) {
  const { items, clearCart, totalAmount, totalItems } = useCart();
  const { user, agencyId } = useAuth();

  // Shipping Info States
  const [shippingAddress, setShippingAddress] = useState(
    user?.shippingAddress || '123 Đường B2B, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh'
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(shippingAddress);

  // Customer selection state
  const [customers, setCustomers] = useState<UserDTO[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<UserDTO | null>(null);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    if (agencyId) {
      setLoadingCustomers(true);
      agencyApi.getCustomers(agencyId)
        .then(setCustomers)
        .catch(() => {})
        .finally(() => setLoadingCustomers(false));
    }
  }, [agencyId]);

  const handleSelectCustomer = (customer: UserDTO) => {
    setSelectedCustomer(customer);
    if (customer.shippingAddress) setShippingAddress(customer.shippingAddress);
    setInvoiceFor('customer');
    const newName = customer.organizationName || '';
    const newTaxCode = customer.taxCode || '';
    const newAddress = customer.billingAddress || customer.shippingAddress || '';
    setInvoiceName(newName);
    setInvoiceTaxCode(newTaxCode);
    setInvoiceAddress(newAddress);
    setTempInvoiceName(newName);
    setTempInvoiceTaxCode(newTaxCode);
    setTempInvoiceAddress(newAddress);
    setShowCustomerPicker(false);
  };

  // Invoice State
  const [invoiceFor, setInvoiceFor] = useState<'creator' | 'customer'>('customer');
  const [invoiceName, setInvoiceName] = useState(user?.organizationName || '');
  const [invoiceTaxCode, setInvoiceTaxCode] = useState(user?.taxCode || '');
  const [invoiceAddress, setInvoiceAddress] = useState(user?.billingAddress || user?.shippingAddress || '');
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [tempInvoiceName, setTempInvoiceName] = useState(invoiceName);
  const [tempInvoiceTaxCode, setTempInvoiceTaxCode] = useState(invoiceTaxCode);
  const [tempInvoiceAddress, setTempInvoiceAddress] = useState(invoiceAddress);

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

  const handleSaveInvoice = () => {
    if (!tempInvoiceName.trim()) {
      Alert.alert('Lỗi', 'Tên công ty xuất hóa đơn không được để trống.');
      return;
    }
    if (!tempInvoiceTaxCode.trim()) {
      Alert.alert('Lỗi', 'Mã số thuế không được để trống.');
      return;
    }
    setInvoiceName(tempInvoiceName);
    setInvoiceTaxCode(tempInvoiceTaxCode);
    setInvoiceAddress(tempInvoiceAddress);
    setIsEditingInvoice(false);
  };

  const handleInvoiceForCreator = () => {
    setInvoiceFor('creator');
    const newName = user?.organizationName || '';
    const newTaxCode = user?.taxCode || '';
    const newAddress = user?.billingAddress || user?.shippingAddress || '';
    setInvoiceName(newName);
    setInvoiceTaxCode(newTaxCode);
    setInvoiceAddress(newAddress);
    setTempInvoiceName(newName);
    setTempInvoiceTaxCode(newTaxCode);
    setTempInvoiceAddress(newAddress);
  };

  const handleInvoiceForCustomer = () => {
    if (!selectedCustomer) {
      Alert.alert('Chưa chọn người mua', 'Vui lòng chọn người mua trước khi xuất hóa đơn cho khách hàng.');
      return;
    }
    setInvoiceFor('customer');
    const newName = selectedCustomer.organizationName || '';
    const newTaxCode = selectedCustomer.taxCode || '';
    const newAddress = selectedCustomer.billingAddress || selectedCustomer.shippingAddress || '';
    setInvoiceName(newName);
    setInvoiceTaxCode(newTaxCode);
    setInvoiceAddress(newAddress);
    setTempInvoiceName(newName);
    setTempInvoiceTaxCode(newTaxCode);
    setTempInvoiceAddress(newAddress);
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
        customerId: selectedCustomer?.id,
        promotionCode: appliedPromo || undefined,
        paymentMethod,
        orderType: 'DROPSHIP',
        deliveryFee: shippingFee,
        orderSource: 'Mobile',
        invoiceName: invoiceName || undefined,
        invoiceTaxCode: invoiceTaxCode || undefined,
        invoiceAddress: invoiceAddress || undefined,
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

          {/* Customer Selector for agency users */}
          {agencyId && (
            <TouchableOpacity style={styles.customerSelector} onPress={() => setShowCustomerPicker(true)} activeOpacity={0.85}>
              <View style={styles.customerSelectorLeft}>
                <Ionicons name="people-outline" size={18} color={Colors.primary} />
                <Text style={styles.customerSelectorLabel}>Người mua:</Text>
              </View>
              <View style={styles.customerSelectorRight}>
                <Text style={selectedCustomer ? styles.customerSelectorValue : styles.customerSelectorPlaceholder}>
                  {selectedCustomer
                    ? (selectedCustomer.displayName || selectedCustomer.username)
                    : 'Mặc định (tôi)'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>
          )}

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
              <View style={styles.addressCardActive}>
                <View style={styles.checkIconWrapper}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.addressTag}>ĐỊA CHỈ MẶC ĐỊNH</Text>
                <Text style={styles.addressName}>
                  {selectedCustomer
                    ? (selectedCustomer.displayName || selectedCustomer.username)
                    : (user?.displayName || user?.username || 'Đại lý Minh Phát')}
                </Text>
                <Text style={styles.addressPhone}>
                  {selectedCustomer ? selectedCustomer.phone || '' : (user?.phone || '090 123 4567')}
                </Text>
                <Text style={styles.addressDetail}>{shippingAddress}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Customer Picker Modal */}
        <Modal visible={showCustomerPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn người mua</Text>
                <TouchableOpacity onPress={() => setShowCustomerPicker(false)}>
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
              {loadingCustomers ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
              ) : customers.length === 0 ? (
                <Text style={styles.modalEmptyText}>Không có khách hàng nào</Text>
              ) : (
                <FlatList
                  data={customers}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => {
                    const isSelected = selectedCustomer?.id === item.id;
                    return (
                      <TouchableOpacity
                        style={[styles.customerItem, isSelected && styles.customerItemActive]}
                        onPress={() => handleSelectCustomer(item)}
                      >
                        <View style={styles.customerItemLeft}>
                          <Text style={styles.customerItemName}>
                            {item.displayName || item.username}
                          </Text>
                          {item.phone && <Text style={styles.customerItemPhone}>{item.phone}</Text>}
                        </View>
                        <View style={styles.customerItemRight}>
                          {isSelected ? (
                            <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                          ) : (
                            <View style={styles.customerRadio} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  contentContainerStyle={styles.customerListContent}
                />
              )}
            </View>
          </View>
        </Modal>

        {/* ─── Thông tin xuất hóa đơn (Invoice Info) ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrapper}>
              <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Thông tin xuất hóa đơn</Text>
            </View>
            {!isEditingInvoice ? (
              <TouchableOpacity onPress={() => {
                setTempInvoiceName(invoiceName);
                setTempInvoiceTaxCode(invoiceTaxCode);
                setTempInvoiceAddress(invoiceAddress);
                setIsEditingInvoice(true);
              }}>
                <Text style={styles.actionBtnText}>Thay đổi</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActionRow}>
                <TouchableOpacity onPress={handleSaveInvoice}>
                  <Text style={[styles.actionBtnText, { color: Colors.success }]}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditingInvoice(false)}>
                  <Text style={[styles.actionBtnText, { color: Colors.error }]}>Hủy</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Invoice toggle: creator or customer */}
          <View style={styles.invoiceToggleRow}>
            <TouchableOpacity
              style={[styles.invoiceToggleOption, invoiceFor === 'creator' && styles.invoiceToggleActive]}
              onPress={handleInvoiceForCreator}
            >
              <Ionicons
                name={invoiceFor === 'creator' ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={invoiceFor === 'creator' ? Colors.primary : Colors.textTertiary}
              />
              <Text style={[styles.invoiceToggleText, invoiceFor === 'creator' && styles.invoiceToggleTextActive]}>
                Xuất cho tôi
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.invoiceToggleOption, invoiceFor === 'customer' && styles.invoiceToggleActive]}
              onPress={handleInvoiceForCustomer}
            >
              <Ionicons
                name={invoiceFor === 'customer' ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={invoiceFor === 'customer' ? Colors.primary : Colors.textTertiary}
              />
              <Text style={[styles.invoiceToggleText, invoiceFor === 'customer' && styles.invoiceToggleTextActive]}>
                Xuất cho khách hàng
              </Text>
            </TouchableOpacity>
          </View>

          {isEditingInvoice ? (
            <View style={styles.editAddressContainer}>
              <TextInput
                style={styles.addressInput}
                placeholder="Tên công ty"
                placeholderTextColor={Colors.textTertiary}
                value={tempInvoiceName}
                onChangeText={setTempInvoiceName}
              />
              <View style={{ height: 10 }} />
              <TextInput
                style={styles.addressInput}
                placeholder="Mã số thuế"
                placeholderTextColor={Colors.textTertiary}
                value={tempInvoiceTaxCode}
                onChangeText={setTempInvoiceTaxCode}
              />
              <View style={{ height: 10 }} />
              <TextInput
                style={styles.addressInput}
                multiline
                numberOfLines={2}
                placeholder="Địa chỉ xuất hóa đơn"
                placeholderTextColor={Colors.textTertiary}
                value={tempInvoiceAddress}
                onChangeText={setTempInvoiceAddress}
              />
            </View>
          ) : (
            <View style={styles.addressCardList}>
              <View style={styles.addressCardActive}>
                <View style={styles.checkIconWrapper}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.addressTag}>
                  {invoiceFor === 'creator'
                    ? (user?.organizationName || user?.displayName || 'NGƯỜI TẠO ĐƠN').toUpperCase()
                    : (selectedCustomer?.displayName || selectedCustomer?.username || user?.organizationName || user?.displayName || 'KHÁCH HÀNG').toUpperCase()}
                </Text>
                {invoiceName ? <Text style={styles.addressName}>{invoiceName}</Text> : null}
                {invoiceTaxCode ? <Text style={styles.addressPhone}>MST: {invoiceTaxCode}</Text> : null}
                {invoiceAddress ? <Text style={styles.addressDetail}>{invoiceAddress}</Text> : null}
                {!invoiceName && !invoiceTaxCode && !invoiceAddress && (
                  <Text style={styles.addressDetail}>Chưa có thông tin xuất hóa đơn</Text>
                )}
              </View>
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
                    <Image source={{ uri: resolveImageUrl(item.product.imageUrl) }} style={styles.itemImage} />
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
  addAddressText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },

  // Customer Selector styles
  customerSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 12,
  },
  customerSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerSelectorLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  customerSelectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerSelectorValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  customerSelectorPlaceholder: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },

  // Customer Picker Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '60%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  modalEmptyText: {
    textAlign: 'center',
    color: Colors.textTertiary,
    paddingVertical: 40,
    fontSize: FontSize.sm,
  },
  customerListContent: {
    paddingHorizontal: 16,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  customerItemActive: {
    backgroundColor: '#F0F4FA',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  customerItemLeft: {
    flex: 1,
  },
  customerItemName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  customerItemPhone: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  customerItemRight: {
    marginLeft: 12,
  },
  customerRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  invoiceToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  invoiceToggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 10,
    backgroundColor: Colors.surface,
  },
  invoiceToggleActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F4FA',
  },
  invoiceToggleText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
  },
  invoiceToggleTextActive: {
    color: Colors.primary,
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
