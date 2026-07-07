import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProductDTO } from '../types';
import { Colors } from '../theme';
import { resolveImageUrl, formatPrice } from '../utils';

interface ProductCardHorizontalProps {
  product: ProductDTO;
  onPress: (product: ProductDTO) => void;
  onAddToCart?: (product: ProductDTO) => void;
  averageRating?: number;
  soldCount?: number;
  isFavorited?: boolean;
  onToggleFavorite?: (product: ProductDTO) => void;
}

export function ProductCardHorizontal({ product, onPress, onAddToCart, averageRating = 4.5, soldCount = 0, isFavorited: controlledFav, onToggleFavorite }: ProductCardHorizontalProps) {
  const [localFav, setLocalFav] = useState(false);
  const isFav = controlledFav !== undefined ? controlledFav : localFav;

  const displayPrice = product.appliedPrice ?? product.price;
  const oldPrice = product.oldAppliedPrice;
  const isContactPrice = displayPrice === null || displayPrice === undefined || displayPrice === -1;

  const handleToggleFav = () => {
    if (onToggleFavorite) {
      onToggleFavorite(product);
    } else {
      setLocalFav(prev => !prev);
    }
  };

  const renderStar = (rating: number) => {
    let star: React.ReactNode;
    if (rating > 0 && rating < 1.0) {
      star = (<Ionicons name="star-half" size={16} color="#f59e0b" />);
    } else if (rating >= 1) {
      star = (<Ionicons name="star" size={16} color="#f59e0b" />);
    } else {
      star = (<Ionicons name="star-outline" size={16} color="#f59e0b" />);
    }
    return star;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(product)} activeOpacity={0.7}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: resolveImageUrl(product.imageUrl) || 'https://via.placeholder.com/150' }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity onPress={handleToggleFav} style={styles.favBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? '#e11d48' : '#fff'} />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        {product.categoryName ? (
          <Text style={styles.categoryName}>{product.categoryName}</Text>
        ) : null}
        {!isContactPrice ? (
          <>
            <View style={styles.priceRow}>
              {oldPrice && oldPrice > displayPrice ? (
                <Text style={styles.oldPrice}>{oldPrice.toLocaleString('vi-VN')}₫</Text>
              ) : null}
              <Text style={styles.price}>{formatPrice(displayPrice)}</Text>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.ratingRow}>
                {renderStar(averageRating)}
                {averageRating > 0 ? (
                  <Text style={styles.metaText}>{averageRating.toFixed(1)}</Text>
                ) : null}
              </View>
              {soldCount > 0 ? (
                <Text style={styles.metaText}>| Đã bán {soldCount}</Text>
              ) : null}
              {product.stockQuantity != null && product.stockQuantity >= 0 ? (
                <Text style={styles.metaText}>| Kho: {product.stockQuantity}</Text>
              ) : null}
            </View>
          </>
        ) : null}
        <View style={{ flex: 1 }} />
        <View style={styles.bottomRow}>
          {isContactPrice ? (
            <Text style={styles.contactPriceText}>Liên hệ</Text>
          ) : null}
          {onAddToCart && (
            <TouchableOpacity style={styles.addBtn} onPress={() => onAddToCart(product)}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 140,
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
  },
  favBtn: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  categoryName: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
  oldPrice: {
    fontSize: 13,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  contactPriceText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
  },
  addBtn: {
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
