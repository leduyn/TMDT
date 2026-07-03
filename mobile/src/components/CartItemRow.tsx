import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors, BorderRadius, Shadow } from '../theme';
import type { CartItem } from '../types';
import { resolveImageUrl, formatPrice } from '../utils';
import { useCart } from '../context/CartContext';

interface Props {
  item: CartItem;
  onUpdateQuantity: (productId: number, qty: number) => void;
}

export function CartItemRow({ item, onUpdateQuantity }: Props) {
  const { product, quantity } = item;
  const { removeItem } = useCart();
  const price = product.appliedPrice ?? product.price;
  const hasDiscount = product.appliedPrice && product.appliedPrice < product.price;
  const isContactPrice = price === null || price === undefined || price === -1;
  const subtotal = isContactPrice ? 0 : price * quantity;

  // Determine stock status badge
  const getStockBadge = () => {
    if (product.stock != null && product.stock <= 5 && product.stock > 0) {
      return { text: 'Sắp hết hàng', bg: 'rgba(225,29,72,0.1)', color: Colors.error };
    }
    if (product.stock === 0) {
      return { text: 'Hết hàng', bg: 'rgba(225,29,72,0.1)', color: Colors.error };
    }
    return { text: 'Sẵn hàng', bg: 'rgba(13,148,136,0.1)', color: '#0D9488' };
  };

  const badge = getStockBadge();

  return (
    <View style={styles.container}>
      {/* Product Image */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: resolveImageUrl(product.imageUrl) || 'https://via.placeholder.com/96' }}
          style={styles.image}
        />
      </View>

      {/* Product Info */}
      <View style={styles.infoSection}>
        <View style={styles.topRow}>
          <View style={styles.textInfo}>
            <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.sku}>
              Mã: {product.sku || `SP-${product.id}`} {product.unit ? `| ${product.unit}` : ''}
            </Text>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
            </View>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => {
              Alert.alert('Xóa sản phẩm', `Bạn có chắc muốn xóa "${product.name}"?`, [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: () => removeItem(product.id) },
              ]);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom: Quantity + Price */}
        <View style={styles.bottomRow}>
          {/* Quantity Counter */}
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => onUpdateQuantity(product.id, quantity - 1)}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>
              {String(quantity).padStart(2, '0')}
            </Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => onUpdateQuantity(product.id, quantity + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.priceMain}>
              {isContactPrice ? formatPrice(price) : subtotal.toLocaleString('vi-VN') + 'đ'}
            </Text>
            {!isContactPrice && hasDiscount && (
              <Text style={styles.priceOriginal}>
                {(product.price * quantity).toLocaleString('vi-VN')}đ
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  imageWrapper: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: '#F2F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoSection: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textInfo: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  sku: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  deleteIcon: {
    fontSize: 16,
    opacity: 0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 10,
    fontVariant: ['tabular-nums'],
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceMain: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  priceOriginal: {
    fontSize: 12,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    textDecorationColor: 'rgba(225,29,72,0.5)',
    marginTop: 2,
  },
});
