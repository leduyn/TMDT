import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderApi } from '../../api/order';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing, Shadow } from '../../theme';
import type { OrderDTO, OrderStatus } from '../../types';
import { formatPrice } from '../../utils';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  NEW: { label: 'Mới', color: '#3B82F6', icon: 'document-outline' },
  PENDING: { label: 'Chờ xử lý', color: '#F59E0B', icon: 'time-outline' },
  PROCESSING: { label: 'Đang xử lý', color: '#8B5CF6', icon: 'sync-outline' },
  COMPLETED: { label: 'Hoàn thành', color: '#10B981', icon: 'checkmark-circle-outline' },
  CANCELLED: { label: 'Đã hủy', color: '#EF4444', icon: 'close-circle-outline' },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: '#EC4899', icon: 'card-outline' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#6B7280', icon: 'help-outline' as const };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.color + '20', borderColor: cfg.color }]}>
      <Ionicons name={cfg.icon} size={14} color={cfg.color} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={Colors.textSecondary} style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function OrderDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getById(orderId)
      .then(setOrder)
      .catch(() => Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleConfirmPayment = async () => {
    try {
      await orderApi.confirmPayment(orderId);
      Alert.alert('Thành công', 'Đã xác nhận thanh toán');
      const updated = await orderApi.getById(orderId);
      setOrder(updated);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Xác nhận thanh toán thất bại');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const orderDate = order.orderDate
    ? new Date(order.orderDate).toLocaleString('vi-VN')
    : '';

  const status = order.status as OrderStatus;
  const totalItems = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  const subtotal = order.totalAmount - order.deliveryFee + order.discountAmount;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.orderTitle}>ĐƠN HÀNG #{order.id}</Text>
          <StatusBadge status={status} />
        </View>
        <View style={styles.headerMeta}>
          <InfoRow icon="calendar-outline" label="Ngày đặt" value={orderDate} />
          <InfoRow icon="cube-outline" label="Loại" value={order.orderType === 'DROPSHIP' ? 'Dropship' : order.orderType} />
          {order.orderSource && (
            <InfoRow icon="globe-outline" label="Nguồn" value={order.orderSource} />
          )}
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Khách hàng</Text>
        <InfoRow icon="person-outline" label="Tên" value={order.customerName} />
        {order.agencyName && (
          <InfoRow icon="business-outline" label="Đại lý" value={order.agencyName} />
        )}
        <InfoRow icon="location-outline" label="Địa chỉ giao" value={order.shippingAddress} />
        {order.createdByName && (
          <InfoRow icon="person-circle-outline" label="Người tạo" value={order.createdByName} />
        )}
      </View>

      {/* Payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thanh toán</Text>
        <InfoRow icon="card-outline" label="Phương thức" value={order.paymentMethod} />
        <InfoRow icon="pricetag-outline" label="Mã giảm giá" value={order.promotionCode} />
        {order.pointsRedeemed != null && order.pointsRedeemed > 0 && (
          <InfoRow icon="gift-outline" label="Điểm sử dụng" value={String(order.pointsRedeemed)} />
        )}
      </View>

      {/* Invoice Info */}
      {(order.invoiceName || order.invoiceTaxCode || order.invoiceAddress) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Xuất hóa đơn</Text>
          <InfoRow icon="document-text-outline" label="Tên công ty" value={order.invoiceName} />
          <InfoRow icon="receipt-outline" label="Mã số thuế" value={order.invoiceTaxCode} />
          <InfoRow icon="location-outline" label="Địa chỉ" value={order.invoiceAddress} />
        </View>
      )}

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm ({totalItems})</Text>
        {order.items?.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemImageWrapper}>
              {item.productImageUrl ? (
                <Image source={{ uri: item.productImageUrl }} style={styles.itemImage} />
              ) : (
                <Ionicons name="image-outline" size={20} color={Colors.textTertiary} />
              )}
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
              <Text style={styles.itemMeta}>
                {formatPrice(item.price)} x {item.quantity}
              </Text>
            </View>
            <Text style={styles.itemTotal}>
              {formatPrice(item.price * item.quantity)}
            </Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tổng cộng</Text>
        <View style={styles.summaryLine}>
          <Text style={styles.summaryLabel}>Tạm tính</Text>
          <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
        </View>
        {order.discountAmount > 0 && (
          <View style={styles.summaryLine}>
            <Text style={[styles.summaryLabel, { color: '#0D9488' }]}>Giảm giá</Text>
            <Text style={[styles.summaryValue, { color: '#0D9488' }]}>-{formatPrice(order.discountAmount)}</Text>
          </View>
        )}
        <View style={styles.summaryLine}>
          <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
          <Text style={styles.summaryValue}>{formatPrice(order.deliveryFee)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryLine}>
          <Text style={styles.grandLabel}>Tổng thanh toán</Text>
          <Text style={styles.grandValue}>{formatPrice(order.totalAmount)}</Text>
        </View>
      </View>

      {/* Actions */}
      {status === 'PENDING_PAYMENT' && (
        <TouchableOpacity style={styles.actionBtn} onPress={handleConfirmPayment} activeOpacity={0.9}>
          <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
          <Text style={styles.actionBtnText}>Xác nhận thanh toán</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
    ...Shadow.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  headerMeta: {},
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginRight: 4,
    minWidth: 80,
  },
  infoValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
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
    marginRight: 10,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  itemMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  grandLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  grandValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    ...Shadow.md,
    shadowColor: Colors.primary,
  },
  actionBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
