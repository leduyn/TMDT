import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import type { ProductDTO } from '../types';
import { Colors } from '../theme';

interface ProductCardProps {
  product: ProductDTO;
  onPress: (product: ProductDTO) => void;
  onAddToCart?: (product: ProductDTO) => void;
}

export function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  const displayPrice = product.appliedPrice ?? product.price;
  const oldPrice = product.oldAppliedPrice;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(product)} activeOpacity={0.7}>
      <Image
        source={{ uri: product.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.sku}>{product.sku || ''}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{displayPrice?.toLocaleString('vi-VN')}đ</Text>
          {oldPrice && oldPrice > displayPrice && (
            <Text style={styles.oldPrice}>{oldPrice.toLocaleString('vi-VN')}đ</Text>
          )}
        </View>
        {product.unit && <Text style={styles.unit}>/ {product.unit}</Text>}
        {onAddToCart && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => onAddToCart(product)}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#f3f4f6',
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  sku: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
  oldPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  unit: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  addBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
});
