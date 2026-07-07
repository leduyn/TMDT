import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProductDTO } from '../types';
import { Colors } from '../theme';
import { resolveImageUrl, formatPrice } from '../utils';

interface ProductCardProps {
  product: ProductDTO;
  onPress: (product: ProductDTO) => void;
  onAddToCart?: (product: ProductDTO) => void;
  averageRating?: number;
  isFavorited?: boolean;
  onToggleFavorite?: (product: ProductDTO) => void;
}

export function ProductCard({ product, onPress, onAddToCart, averageRating = 0, isFavorited: controlledFav, onToggleFavorite }: ProductCardProps) {
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
  const renderStars = (rating: number) => {
    let star: React.ReactNode;
    if (rating > 0 && rating < 1.0) {
      star = (<Ionicons name="star-half" size={20} color="#f59e0b" />);
    } else if (rating >= 1) {
      star = (<Ionicons name="star" size={20} color="#f59e0b" />);
    } else {
      star = (<Ionicons name="star-outline" size={20} color="#f59e0b" />);
    }
    return star;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(product)} activeOpacity={0.7}>
      <Image
        source={{ uri: resolveImageUrl(product.imageUrl) || 'https://via.placeholder.com/150' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <View style={styles.infoContent}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.sku}>{product.sku || ''}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(displayPrice)}</Text>
            {!isContactPrice && !!oldPrice && oldPrice > displayPrice && (
              <Text style={styles.oldPrice}>{oldPrice.toLocaleString('vi-VN')}đ</Text>
            )}
            {!isContactPrice && product.unit ? (
              <Text style={styles.unit}>/ {product.unit}</Text>
            ) : null}
          </View>
        </View>
        {!isContactPrice && (
          <View style={styles.bottomRow}>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={handleToggleFav} style={styles.favBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? '#e11d48' : '#9ca3af'} />
              </TouchableOpacity>
              <View style={styles.ratingRow}>
                {renderStars(averageRating)}
                <Text style={styles.ratingText}>{averageRating.toFixed(1)}</Text>
              </View>
            </View>

            {onAddToCart && (
              <TouchableOpacity style={styles.addBtn} onPress={() => onAddToCart(product)}>
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 4,
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
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
  },
  infoContent: {
    // wraps name, sku, priceRow to push bottomRow down
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
    flexWrap: 'wrap',
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
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Để khoảng cách đều nhau
    //marginTop: 8,
  },
  favBtn: {
    padding: 2,
    marginRight: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
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
