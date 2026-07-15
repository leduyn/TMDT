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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api/order';
import { agencyApi } from '../../api/agency';
import { customerApi } from '../../api/customer';
import { Colors, BorderRadius, Shadow, Spacing, FontSize, FontWeight } from '../../theme';
import type { OrderRequest, CustomerDTO } from '../../types';
import { resolveImageUrl } from '../../utils';

interface ShippingAddress {
  id: string;
  receiverName: string;
  receiverPhone: string;
  address: string;
  isDefault: boolean;
}

let addressCounter = 1;
const makeAddrId = () => `addr_${Date.now()}_${addressCounter++}`;

export function CheckoutScreen({ navigation }: any) {
  const { items, clearCart, totalAmount, totalItems } = useCart();
  const { user, agencyId, agencyType } = useAuth();

  // Shipping Info States
  const [shippingAddress, setShippingAddress] = useState(
    user?.shippingAddress || ''
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(shippingAddress);

  // Multi-address management
  const [addresses, setAddresses] = useState<ShippingAddress[]>(() => {
    const id = makeAddrId();
    return [{
      id,
      receiverName: user?.displayName || user?.username || '',
      receiverPhone: user?.phone || '',
      address: user?.shippingAddress || '',
      isDefault: true,
    }];
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.length > 0 ? addresses[0].id : ''
  );
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<ShippingAddress>({
    id: '',
    receiverName: '',
    receiverPhone: '',
    address: '',
    isDefault: false,
  });

  // Customer selection state
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [searchTaxCode, setSearchTaxCode] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    organizationName: '',
    taxCode: '',
    receiverName: '',
    receiverPhone: '',
    shippingAddress: '',
    billingAddress: '',
  });

  useEffect(() => {
    if (agencyType === 'WHOLESALE' && agencyId) {
      setLoadingCustomers(true);
      customerApi.getCustomers(agencyId)
        .then(setCustomers)
        .catch(() => {})
        .finally(() => setLoadingCustomers(false));
    }
  }, [agencyId, agencyType]);

  useEffect(() => {
    if (agencyId) {
      agencyApi.getById(agencyId).then(agency => {
        const name = agency.name || '';
        const taxCode = agency.taxCode || '';
        const addr = agency.billingAddress || agency.shippingAddress || '';
        setInvoiceName(name);
        setInvoiceTaxCode(taxCode);
        setInvoiceAddress(addr);
        setTempInvoiceName(name);
        setTempInvoiceTaxCode(taxCode);
        setTempInvoiceAddress(addr);
      }).catch(() => {});
    }
  }, [agencyId, agencyType]);

  const handleSelectCustomer = (customer: CustomerDTO) => {
    setSelectedCustomer(customer);
    if (customer.shippingAddress) setShippingAddress(customer.shippingAddress);
    setInvoiceFor('customer');
    const newName = customer.organizationName || '';
    const newTaxCode = customer.taxCode || '';
    const newAddr = customer.billingAddress || customer.shippingAddress || '';
    setInvoiceName(newName);
    setInvoiceTaxCode(newTaxCode);
    setInvoiceAddress(newAddr);
    setTempInvoiceName(newName);
    setTempInvoiceTaxCode(newTaxCode);
    setTempInvoiceAddress(newAddr);

    // Init shipping addresses from customer
    const defaultId = makeAddrId();
    const addrList: ShippingAddress[] = [{
      id: defaultId,
      receiverName: customer.receiverName || customer.organizationName || '',
      receiverPhone: customer.receiverPhone || '',
      address: customer.shippingAddress || '',
      isDefault: true,
    }];
    setAddresses(addrList);
    setSelectedAddressId(defaultId);
    setShippingAddress(customer.shippingAddress || '');

    setShowCustomerPicker(false);
    setSearchTaxCode('');
  };

  const handleSearchByTaxCode = async () => {
    if (!searchTaxCode.trim()) return;
    if (!agencyId) return;
    setSearchLoading(true);
    try {
      const result = await customerApi.checkByTaxCode(searchTaxCode.trim(), agencyId);
      if (result) {
        handleSelectCustomer(result);
      } else {
        Alert.alert(
          'Không tìm thấy khách hàng',
          `Không tìm thấy khách hàng với MST "${searchTaxCode}".`,
          [
            { text: 'Quay lại', style: 'cancel' },
            {
              text: 'Tạo mới',
              onPress: () => {
                setCreateForm(prev => ({ ...prev, taxCode: searchTaxCode.trim() }));
                setShowCreateForm(true);
                setSearchTaxCode('');
              },
            },
          ]
        );
      }
    } catch {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tra cứu mã số thuế.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!createForm.organizationName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên tổ chức.');
      return;
    }
    if (!createForm.taxCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã số thuế.');
      return;
    }
    if (!agencyId) return;
    setCreateLoading(true);
    try {
      const newCust = await customerApi.create({
        agencyId,
        organizationName: createForm.organizationName.trim(),
        taxCode: createForm.taxCode.trim(),
        receiverName: createForm.receiverName.trim() || undefined,
        receiverPhone: createForm.receiverPhone.trim() || undefined,
        shippingAddress: createForm.shippingAddress.trim() || undefined,
        billingAddress: createForm.billingAddress.trim() || undefined,
      });
      // Refresh customer list
      setCustomers(prev => [newCust, ...prev]);
      handleSelectCustomer(newCust);
      setShowCreateForm(false);
      setCreateForm({
        organizationName: '',
        taxCode: '',
        receiverName: '',
        receiverPhone: '',
        shippingAddress: '',
        billingAddress: '',
      });
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tạo khách hàng mới.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Invoice State
  const [invoiceFor, setInvoiceFor] = useState<'creator' | 'customer'>('creator');
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
  const [desiredDeliveryDate, setDesiredDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonthOffset, setPickerMonthOffset] = useState(0);
  const [adjustPrices, setAdjustPrices] = useState<Record<number, string>>({});
  const [showPriceAdjust, setShowPriceAdjust] = useState(false);

  const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const getMonthDays = (year: number, month: number) => {
    const days: (number | null)[] = [];
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monIndex = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    for (let i = 0; i < monIndex; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  };

  const isDateDisabled = (day: number, month: number, year: number) => {
    const d = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const pickerYear = desiredDeliveryDate.getFullYear();
  const pickerMonth = desiredDeliveryDate.getMonth() + pickerMonthOffset;
  const calYear = new Date(pickerYear, pickerMonth).getFullYear();
  const calMonth = new Date(pickerYear, pickerMonth).getMonth();
  const calDays = getMonthDays(calYear, calMonth);
  const todayStr = new Date().toDateString();

  const handleSelectDate = (day: number) => {
    const selected = new Date(calYear, calMonth, day);
    selected.setHours(12, 0, 0, 0);
    setDesiredDeliveryDate(selected);
    setPickerMonthOffset(0);
    setShowDatePicker(false);
  };

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
    // Update the selected address
    setAddresses(prev => prev.map(a =>
      a.id === selectedAddressId ? { ...a, address: tempAddress } : a
    ));
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

  const handleInvoiceForCreator = async () => {
    setInvoiceFor('creator');
    try {
      const agency = await agencyApi.getById(agencyId!);
      const newName = agency.name || '';
      const newTaxCode = agency.taxCode || '';
      const newAddr = agency.billingAddress || agency.shippingAddress || '';
      setInvoiceName(newName);
      setInvoiceTaxCode(newTaxCode);
      setInvoiceAddress(newAddr);
      setTempInvoiceName(newName);
      setTempInvoiceTaxCode(newTaxCode);
      setTempInvoiceAddress(newAddr);
    } catch {
      const newName = user?.organizationName || '';
      const newTaxCode = user?.taxCode || '';
      const newAddr = user?.billingAddress || user?.shippingAddress || '';
      setInvoiceName(newName);
      setInvoiceTaxCode(newTaxCode);
      setInvoiceAddress(newAddr);
      setTempInvoiceName(newName);
      setTempInvoiceTaxCode(newTaxCode);
      setTempInvoiceAddress(newAddr);
    }
  };

  const handleInvoiceForCustomer = () => {
    setShowCustomerPicker(true);
    setSearchTaxCode('');
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

    setLoading(true);

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
          quantity: item.quantity,
          ...(adjustPrices[item.product.id] ? { adjustedPrice: parseFloat(adjustPrices[item.product.id]) } : {}),
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
        desiredDeliveryDate: desiredDeliveryDate.toISOString(),
      };

      let result: { message: string; orderId?: number };
      if (user?.role === 'ROLE_AGENCY') {
        result = await orderApi.createByAgency(requestData);
      } else {
        result = await orderApi.create(requestData);
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
              navigation.replace('OrderDetail', { orderId: result.orderId });
            }
          },
          {
            text: 'Về trang chủ',
            onPress: () => {
              clearCart();
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

  // Address management helpers
  const handleSelectAddress = (id: string) => {
    const addr = addresses.find(a => a.id === id);
    if (addr) {
      setSelectedAddressId(id);
      setShippingAddress(addr.address);
      setTempAddress(addr.address);
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.receiverName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên người nhận.');
      return;
    }
    if (!newAddress.receiverPhone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại.');
      return;
    }
    if (!newAddress.address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ.');
      return;
    }
    const id = makeAddrId();
    const addr: ShippingAddress = { ...newAddress, id };
    setAddresses(prev => [...prev, addr]);
    setSelectedAddressId(id);
    setShippingAddress(addr.address);
    setTempAddress(addr.address);
    setNewAddress({ id: '', receiverName: '', receiverPhone: '', address: '', isDefault: false });
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (addresses.length <= 1) {
      Alert.alert('Không thể xóa', 'Phải có ít nhất một địa chỉ nhận hàng.');
      return;
    }
    setAddresses(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (selectedAddressId === id && filtered.length > 0) {
        const next = filtered[0];
        setSelectedAddressId(next.id);
        setShippingAddress(next.address);
        setTempAddress(next.address);
      }
      return filtered;
    });
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

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

        {/* ═══ 1. Thông tin xuất hóa đơn (Invoice) ═══ */}
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
            {agencyType !== 'RETAIL' && (
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
            )}
          </View>

          {/* Selected customer info when invoiceFor === 'customer' */}
          {invoiceFor === 'customer' && selectedCustomer && !isEditingInvoice && (
            <View style={styles.selectedCustInfo}>
              <Ionicons name="person-outline" size={16} color={Colors.primary} />
              <Text style={styles.selectedCustText}>
                {selectedCustomer.organizationName || `KH-${selectedCustomer.id}`}
              </Text>
            </View>
          )}

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
                    : (selectedCustomer?.organizationName || 'KHÁCH HÀNG').toUpperCase()}
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

        {/* Customer Picker Modal */}
        <Modal visible={showCustomerPicker} transparent animationType="slide">
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalContainer}>
              {showCreateForm ? (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Tạo khách hàng mới</Text>
                    <TouchableOpacity onPress={() => {
                      setShowCreateForm(false);
                      setCreateForm({
                        organizationName: '',
                        taxCode: '',
                        receiverName: '',
                        receiverPhone: '',
                        shippingAddress: '',
                        billingAddress: '',
                      });
                    }}>
                      <Ionicons name="close" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.createFormContainer}>
                    <TextInput
                      style={[styles.addressInput, styles.createFormInput]}
                      placeholder="Mã số thuế *"
                      placeholderTextColor={Colors.textTertiary}
                      value={createForm.taxCode}
                      onChangeText={(t) => setCreateForm(p => ({ ...p, taxCode: t }))}
                      autoCapitalize="characters"
                      editable={!createLoading}
                    />
                    <View style={{ height: 8 }} />
                    <TextInput
                      style={[styles.addressInput, styles.createFormInput]}
                      placeholder="Tên tổ chức *"
                      placeholderTextColor={Colors.textTertiary}
                      value={createForm.organizationName}
                      onChangeText={(t) => setCreateForm(p => ({ ...p, organizationName: t }))}
                      editable={!createLoading}
                    />
                    <View style={{ height: 8 }} />
                    <TextInput
                      style={[styles.addressInput, styles.createFormInput]}
                      placeholder="Người nhận"
                      placeholderTextColor={Colors.textTertiary}
                      value={createForm.receiverName}
                      onChangeText={(t) => setCreateForm(p => ({ ...p, receiverName: t }))}
                      editable={!createLoading}
                    />
                    <View style={{ height: 8 }} />
                    <TextInput
                      style={[styles.addressInput, styles.createFormInput]}
                      placeholder="SĐT người nhận"
                      placeholderTextColor={Colors.textTertiary}
                      value={createForm.receiverPhone}
                      onChangeText={(t) => setCreateForm(p => ({ ...p, receiverPhone: t }))}
                      keyboardType="phone-pad"
                      editable={!createLoading}
                    />
                    <View style={{ height: 8 }} />
                    <TextInput
                      style={[styles.addressInput, styles.createFormInput]}
                      multiline
                      numberOfLines={2}
                      placeholder="Địa chỉ nhận hàng"
                      placeholderTextColor={Colors.textTertiary}
                      value={createForm.shippingAddress}
                      onChangeText={(t) => setCreateForm(p => ({ ...p, shippingAddress: t }))}
                      editable={!createLoading}
                    />
                    <View style={{ height: 8 }} />
                    <TextInput
                      style={[styles.addressInput, styles.createFormInput]}
                      multiline
                      numberOfLines={2}
                      placeholder="Địa chỉ xuất hóa đơn"
                      placeholderTextColor={Colors.textTertiary}
                      value={createForm.billingAddress}
                      onChangeText={(t) => setCreateForm(p => ({ ...p, billingAddress: t }))}
                      editable={!createLoading}
                    />

                    <View style={styles.createFormActions}>
                      <TouchableOpacity
                        style={styles.createFormSaveBtn}
                        onPress={handleCreateCustomer}
                        disabled={createLoading}
                        activeOpacity={0.85}
                      >
                        {createLoading ? (
                          <ActivityIndicator size="small" color={Colors.white} />
                        ) : (
                          <Text style={styles.createFormSaveText}>Lưu</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.createFormBackBtn}
                        onPress={() => {
                          setShowCreateForm(false);
                          setCreateForm({
                            organizationName: '',
                            taxCode: '',
                            receiverName: '',
                            receiverPhone: '',
                            shippingAddress: '',
                            billingAddress: '',
                          });
                        }}
                        disabled={createLoading}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.createFormBackText}>Quay lại</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chọn người mua</Text>
                    <TouchableOpacity onPress={() => {
                      setShowCustomerPicker(false);
                      setSearchTaxCode('');
                    }}>
                      <Ionicons name="close" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  {/* Tax code search */}
                  <View style={styles.taxSearchRow}>
                    <TextInput
                      style={styles.taxSearchInput}
                      placeholder="Nhập mã số thuế..."
                      placeholderTextColor={Colors.textTertiary}
                      value={searchTaxCode}
                      onChangeText={setSearchTaxCode}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={styles.taxSearchBtn}
                      onPress={handleSearchByTaxCode}
                      disabled={searchLoading}
                      activeOpacity={0.85}
                    >
                      {searchLoading ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <Text style={styles.taxSearchBtnText}>Xác nhận</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Divider */}
                  <View style={styles.modalDivider}>
                    <View style={styles.modalDividerLine} />
                    <Text style={styles.modalDividerText}>hoặc chọn từ danh sách</Text>
                    <View style={styles.modalDividerLine} />
                  </View>

                  {/* Customer list */}
                  {loadingCustomers ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
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
                                {item.organizationName || `KH-${item.id}`}
                              </Text>
                              {item.taxCode && (
                                <Text style={styles.customerItemPhone}>MST: {item.taxCode}</Text>
                              )}
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
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* ═══ 2. Thông tin nhận hàng (Shipping) ═══ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrapper}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
            </View>
          </View>

          {/* Multi-address list */}
          {addresses.map((addr) => {
            const isActive = addr.id === selectedAddressId;
            return (
              <TouchableOpacity
                key={addr.id}
                style={[styles.addrCard, isActive && styles.addrCardActive]}
                onPress={() => handleSelectAddress(addr.id)}
                activeOpacity={0.85}
              >
                <View style={styles.addrCardLeft}>
                  <View style={[styles.addrRadio, isActive && styles.addrRadioActive]}>
                    {isActive && <View style={styles.addrRadioInner} />}
                  </View>
                </View>
                <View style={styles.addrCardContent}>
                  <Text style={styles.addrName}>{addr.receiverName}</Text>
                  <Text style={styles.addrPhone}>{addr.receiverPhone}</Text>
                  <Text style={styles.addrDetail}>{addr.address}</Text>
                </View>
                <TouchableOpacity
                  style={styles.addrDeleteBtn}
                  onPress={() => handleDeleteAddress(addr.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}

          {/* Add new address */}
          {!showAddAddress ? (
            <TouchableOpacity
              style={styles.addAddrBtn}
              onPress={() => setShowAddAddress(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
              <Text style={styles.addAddrBtnText}>Thêm địa chỉ nhận hàng</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addAddrForm}>
              <TextInput
                style={styles.addressInput}
                placeholder="Tên người nhận"
                placeholderTextColor={Colors.textTertiary}
                value={newAddress.receiverName}
                onChangeText={(t) => setNewAddress(p => ({ ...p, receiverName: t }))}
              />
              <View style={{ height: 8 }} />
              <TextInput
                style={styles.addressInput}
                placeholder="Số điện thoại"
                placeholderTextColor={Colors.textTertiary}
                value={newAddress.receiverPhone}
                onChangeText={(t) => setNewAddress(p => ({ ...p, receiverPhone: t }))}
                keyboardType="phone-pad"
              />
              <View style={{ height: 8 }} />
              <TextInput
                style={styles.addressInput}
                multiline
                numberOfLines={2}
                placeholder="Địa chỉ chi tiết"
                placeholderTextColor={Colors.textTertiary}
                value={newAddress.address}
                onChangeText={(t) => setNewAddress(p => ({ ...p, address: t }))}
              />
              <View style={styles.addAddrActions}>
                <TouchableOpacity style={styles.addAddrSaveBtn} onPress={handleAddAddress} activeOpacity={0.85}>
                  <Text style={styles.addAddrSaveText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addAddrCancelBtn} onPress={() => setShowAddAddress(false)} activeOpacity={0.85}>
                  <Text style={styles.addAddrCancelText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ═══ 3. Phương thức thanh toán (Payment Method) ═══ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrapper}>
              <Ionicons name="card-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            </View>
          </View>

          <View style={styles.paymentList}>
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

        {/* ═══ 4. Mã khuyến mãi (Promo Code) ═══ */}
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

        {/* ═══ 5. Ngày muốn nhận hàng ═══ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrapper}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Ngày muốn nhận hàng</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.datePickerText}>
              {desiredDeliveryDate.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>

          {/* Custom date picker modal */}
          <Modal visible={showDatePicker} transparent animationType="slide">
            <View style={styles.datePickerOverlay}>
              <View style={styles.datePickerContainer}>
                {/* Header */}
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity onPress={() => setPickerMonthOffset(p => p - 1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.datePickerMonthTitle}>
                    {MONTH_NAMES[calMonth]} {calYear}
                  </Text>
                  <TouchableOpacity onPress={() => setPickerMonthOffset(p => p + 1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="chevron-forward" size={22} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Day of week labels */}
                <View style={styles.datePickerWeekRow}>
                  {DAY_LABELS.map(label => (
                    <View key={label} style={styles.datePickerWeekCell}>
                      <Text style={styles.datePickerWeekLabel}>{label}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar grid */}
                <View style={styles.datePickerGrid}>
                  {calDays.map((day, i) => (
                    <View key={i} style={styles.datePickerDayCell}>
                      {day !== null ? (
                        <TouchableOpacity
                          style={[
                            styles.datePickerDayBtn,
                            calYear === desiredDeliveryDate.getFullYear() &&
                              calMonth === desiredDeliveryDate.getMonth() &&
                              day === desiredDeliveryDate.getDate() &&
                              styles.datePickerDayBtnSelected,
                            isDateDisabled(day, calMonth, calYear) && styles.datePickerDayBtnDisabled,
                          ]}
                          onPress={() => !isDateDisabled(day, calMonth, calYear) && handleSelectDate(day)}
                          disabled={isDateDisabled(day, calMonth, calYear)}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.datePickerDayText,
                            calYear === desiredDeliveryDate.getFullYear() &&
                              calMonth === desiredDeliveryDate.getMonth() &&
                              day === desiredDeliveryDate.getDate() &&
                              styles.datePickerDayTextSelected,
                            isDateDisabled(day, calMonth, calYear) && styles.datePickerDayTextDisabled,
                            new Date(calYear, calMonth, day).toDateString() === todayStr &&
                              !(calYear === desiredDeliveryDate.getFullYear() &&
                                calMonth === desiredDeliveryDate.getMonth() &&
                                day === desiredDeliveryDate.getDate()) &&
                              styles.datePickerDayTextToday,
                          ]}>{day}</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ))}
                </View>

                {/* Actions */}
                <View style={styles.datePickerActions}>
                  <TouchableOpacity
                    style={styles.datePickerCancelBtn}
                    onPress={() => {
                      setShowDatePicker(false);
                      setPickerMonthOffset(0);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.datePickerCancelText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        {/* ═══ 6. Tóm tắt đơn hàng (Order Summary) ═══ */}
        <View style={styles.sectionCard}>
          <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.divider} />

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
                  {((item.product.appliedPrice && item.product.appliedPrice !== -1 ? item.product.appliedPrice : item.product.basePrice && item.product.basePrice !== -1 ? item.product.basePrice : 0) * item.quantity).toLocaleString('vi-VN')}đ
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

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

        {/* Price adjustment button — WHOLESALE only */}
        {agencyType === 'WHOLESALE' && (
          <TouchableOpacity
            style={styles.priceAdjustBtn}
            onPress={() => setShowPriceAdjust(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="pricetags-outline" size={18} color={Colors.primary} />
            <Text style={styles.priceAdjustBtnText}>Điều chỉnh giá bán</Text>
          </TouchableOpacity>
        )}

        {/* Submit CTA Button */}
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

      {/* Price adjustment modal */}
      <Modal visible={showPriceAdjust} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContainer, { maxHeight: '70%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Điều chỉnh giá bán</Text>
              <TouchableOpacity onPress={() => setShowPriceAdjust(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => String(item.product.id)}
              contentContainerStyle={styles.priceAdjustList}
              renderItem={({ item }) => {
                const currentPrice = item.product.appliedPrice && item.product.appliedPrice !== -1
                  ? item.product.appliedPrice
                  : item.product.basePrice && item.product.basePrice !== -1
                    ? item.product.basePrice : 0;
                return (
                  <View style={styles.priceAdjustItem}>
                    <View style={styles.priceAdjustItemLeft}>
                      <Text style={styles.priceAdjustItemName} numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <Text style={styles.priceAdjustItemCurrent}>
                        Giá hiện tại: {currentPrice.toLocaleString('vi-VN')}đ
                      </Text>
                    </View>
                    <View style={styles.priceAdjustItemRight}>
                      <TextInput
                        style={styles.priceAdjustInput}
                        placeholder={currentPrice.toLocaleString('vi-VN')}
                        placeholderTextColor={Colors.textTertiary}
                        keyboardType="numeric"
                        value={adjustPrices[item.product.id] ?? ''}
                        onChangeText={(text) => setAdjustPrices(prev => ({
                          ...prev,
                          [item.product.id]: text,
                        }))}
                      />
                      <Text style={styles.priceAdjustUnit}>đ</Text>
                    </View>
                  </View>
                );
              }}
            />

            <View style={styles.priceAdjustActions}>
              <TouchableOpacity
                style={styles.priceAdjustCancelBtn}
                onPress={() => {
                  setAdjustPrices({});
                  setShowPriceAdjust(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.priceAdjustCancelText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.priceAdjustApplyBtn}
                onPress={() => setShowPriceAdjust(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.priceAdjustApplyText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  // Invoice
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
  selectedCustInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primarySoft,
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  selectedCustText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },

  // Address cards (shared between invoice + shipping)
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
    backgroundColor: '#F0F4FA',
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

  // Tax code search in modal
  taxSearchRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  taxSearchInput: {
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
  taxSearchBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taxSearchBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  modalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  modalDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  modalDividerText: {
    marginHorizontal: 10,
    fontSize: FontSize.xs,
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
    maxHeight: '70%',
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

  // Multi-address styles
  addrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 8,
    backgroundColor: Colors.surface,
  },
  addrCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F4FA',
  },
  addrCardLeft: {
    marginRight: 10,
  },
  addrRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrRadioActive: {
    borderColor: Colors.primary,
  },
  addrRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  addrCardContent: {
    flex: 1,
  },
  addrName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  addrPhone: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addrDetail: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
    lineHeight: 15,
  },
  addrDeleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  addAddrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    borderStyle: 'dashed',
    padding: 12,
    marginTop: 4,
  },
  addAddrBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  addAddrForm: {
    marginTop: 8,
  },
  addAddrActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  addAddrSaveBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addAddrSaveText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  addAddrCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addAddrCancelText: {
    fontSize: FontSize.sm,
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
    backgroundColor: '#F0F4FA',
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

  // Create Customer Form
  createFormContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  createFormInput: {
    fontSize: FontSize.sm,
  },
  createFormActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  createFormSaveBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createFormSaveText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  createFormBackBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createFormBackText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },

  // Date picker
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 14,
    backgroundColor: Colors.background,
  },
  datePickerText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },

  // Custom date picker modal
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    width: '85%',
    padding: 20,
    ...Shadow.md,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datePickerMonthTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  datePickerWeekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  datePickerWeekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  datePickerWeekLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
  },
  datePickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  datePickerDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerDayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerDayBtnSelected: {
    backgroundColor: Colors.primary,
  },
  datePickerDayBtnDisabled: {
    opacity: 0.3,
  },
  datePickerDayText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  datePickerDayTextSelected: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  datePickerDayTextDisabled: {
    color: Colors.textTertiary,
  },
  datePickerDayTextToday: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  datePickerCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  datePickerCancelText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },

  // Price adjustment
  priceAdjustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    padding: 14,
    marginBottom: 16,
  },
  priceAdjustBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  priceAdjustList: {
    paddingHorizontal: 16,
  },
  priceAdjustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  priceAdjustItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  priceAdjustItemName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  priceAdjustItemCurrent: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  priceAdjustItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceAdjustInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    minWidth: 100,
    textAlign: 'right',
  },
  priceAdjustUnit: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  priceAdjustActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceAdjustCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  priceAdjustCancelText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  priceAdjustApplyBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  priceAdjustApplyText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
