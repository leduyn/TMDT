import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Dimensions, Platform, Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productApi } from '../../api/product';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing, Shadow } from '../../theme';
import type { ProductDTO } from '../../types';

const { width } = Dimensions.get('window');

export function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const { agencyId } = useAuth();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Selected Variations
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(1); // Default size index 1 (40)
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Mock colors & sizes
  const colors = ['#dc2626', '#1e293b', '#e2e8f0'];
  const sizes = [39, 40, 41, 42, 43, 44];

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const data = await productApi.getById(productId, agencyId ?? undefined);
      setProduct(data);
      navigation.setOptions({
        headerTitle: 'Chi tiết sản phẩm',
        headerRight: () => (
          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Cart')}>
              <Ionicons name="cart-outline" size={22} color={Colors.white} />
              {items.length > 0 && (
                <View style={styles.cartCountBadge}>
                  <Text style={styles.cartCountText}>{items.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ),
      });
    } catch (err) {
      console.log('Error loading product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Xem sản phẩm B2B: ${product.name} tại B2B Connect!`,
      });
    } catch {}
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, qty);
    Alert.alert('Đã thêm', `Đã thêm ${qty} ${product.unit || 'sản phẩm'} vào giỏ hàng`, [
      { text: 'Tiếp tục mua' },
      { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, qty);
    navigation.navigate('Cart');
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  const price = product.appliedPrice ?? product.price;
  const oldPrice = product.oldAppliedPrice;
  const hasDiscount = oldPrice && oldPrice > price;
  const discountPercent = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const priceSaving = hasDiscount ? oldPrice - price : 0;
  const minQty = product.minPurchaseQuantity || 1;

  // Build image list (fallback to placeholders if none defined)
  const productImages = product.imageUrl 
    ? [product.imageUrl, ...(product.imageUrls || []).filter(url => url !== product.imageUrl)] 
    : [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1496181130204-755241544e35?w=600&auto=format&fit=crop&q=60',
      ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image Banner with discount badge */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: productImages[activeImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>ƯU ĐÃI -{discountPercent}%</Text>
            </View>
          )}
        </View>

        {/* Image Gallery Thumbnails scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll}>
          {productImages.map((img, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.thumbnailWrapper,
                activeImageIndex === idx && styles.thumbnailWrapperActive
              ]}
              onPress={() => setActiveImageIndex(idx)}
            >
              <Image source={{ uri: img }} style={styles.thumbnailImg} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product Basic Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.brandTitle}>{product.brand?.name || 'PREMIUM PERFORMANCE'}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingScore}>4.8</Text>
              <Text style={styles.ratingCount}>(124 đánh giá)</Text>
            </View>
            <View style={styles.statDivider} />
            <Text style={styles.soldText}>Đã bán 1.2k+</Text>
          </View>
        </View>

        {/* B2B Pricing Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{price.toLocaleString('vi-VN')}đ</Text>
            {hasDiscount && (
              <Text style={styles.oldPrice}>{oldPrice.toLocaleString('vi-VN')}đ</Text>
            )}
          </View>
          <View style={styles.priceTagRow}>
            <View style={styles.priceTagBadge}>
              <Text style={styles.priceTagBadgeText}>
                {product.appliedPriceListName ? product.appliedPriceListName.toUpperCase() : 'GIÁ ĐẠI LÝ PLATINUM'}
              </Text>
            </View>
            {priceSaving > 0 && (
              <Text style={styles.saveNoteText}>Tiết kiệm thêm {priceSaving.toLocaleString('vi-VN')}đ</Text>
            )}
          </View>
        </View>

        {/* Color Variations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Màu sắc</Text>
          <View style={styles.colorsRow}>
            {colors.map((color, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.colorBtn,
                  selectedColor === idx && styles.colorBtnActive
                ]}
                onPress={() => setSelectedColor(idx)}
              >
                <View style={[styles.colorInner, { backgroundColor: color }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Size Variations */}
        <View style={styles.section}>
          <View style={styles.sizeHeader}>
            <Text style={styles.sectionTitle}>Kích thước (EU)</Text>
            <TouchableOpacity>
              <Text style={styles.sizeGuideText}>Hướng dẫn chọn size</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sizesGrid}>
            {sizes.map((size, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.sizeBtn,
                  selectedSize === idx && styles.sizeBtnActive
                ]}
                onPress={() => setSelectedSize(idx)}
              >
                <Text style={[
                  styles.sizeBtnText,
                  selectedSize === idx && styles.sizeBtnTextActive
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity Controls Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số lượng đặt hàng ({product.unit || 'chiếc'})</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(minQty, qty - 1))}>
              <Ionicons name="remove" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
              <Ionicons name="add" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
            {minQty > 1 && (
              <Text style={styles.minQtyNote}>Mức mua tối thiểu: {minQty}</Text>
            )}
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>
            {product.description || 'Trải nghiệm tốc độ vượt trội với Speed Pro Elite G-Series. Công nghệ đế Hyper-Grip thế hệ mới tăng cường độ bám lên tới 30%, phù hợp cho mọi địa hình. Chất liệu vải dệt kim thoáng khí giúp đôi chân luôn khô ráo.'}
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Chất liệu: Sợi tổng hợp cao cấp</Text>
            <Text style={styles.bulletItem}>• Trọng lượng siêu nhẹ: 240g/chiếc</Text>
            <Text style={styles.bulletItem}>• Hệ thống đệm khí Air-Flow tích hợp</Text>
            <Text style={styles.bulletItem}>• Bảo hành chính hãng 12 tháng</Text>
          </View>
        </View>

        {/* Customer Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá khách hàng</Text>
          <View style={styles.reviewsSummaryCard}>
            <View style={styles.reviewsAvg}>
              <Text style={styles.avgScore}>4.8</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons key={s} name={s <= 4 ? "star" : "star-half"} size={14} color="#F59E0B" />
                ))}
              </View>
              <Text style={styles.avgLabel}>Dựa trên 124 đánh giá</Text>
            </View>
            <View style={styles.reviewsBreakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownNum}>5</Text>
                <View style={styles.breakdownTrack}><View style={[styles.breakdownBar, { width: '85%' }]} /></View>
                <Text style={styles.breakdownPercent}>85%</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownNum}>4</Text>
                <View style={styles.breakdownTrack}><View style={[styles.breakdownBar, { width: '10%' }]} /></View>
                <Text style={styles.breakdownPercent}>10%</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownNum}>3</Text>
                <View style={styles.breakdownTrack}><View style={[styles.breakdownBar, { width: '3%' }]} /></View>
                <Text style={styles.breakdownPercent}>3%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Extra Stock detail and SKU information */}
        <View style={styles.extraSection}>
          {product.sku && <Text style={styles.extraText}>SKU: {product.sku}</Text>}
          <Text style={styles.extraText}>Trạng thái kho: Còn {product.stockQuantity ?? 120} {product.unit || 'sản phẩm'}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Sticky Bottom Actions Container */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.favBtn}>
          <Ionicons name="heart-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={20} color={Colors.primary} />
          <Text style={styles.addCartBtnText}>Thêm giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
          <Text style={styles.buyNowBtnText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    fontSize: FontSize.lg,
    color: Colors.textTertiary,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingRight: Spacing.sm,
  },
  headerBtn: {
    position: 'relative',
    padding: 4,
  },
  cartCountBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartCountText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: FontWeight.bold,
  },
  imageContainer: {
    width: width,
    height: width,
    backgroundColor: Colors.white,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    backgroundColor: '#0D9488',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    ...Shadow.sm,
  },
  discountText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  thumbnailScroll: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
  },
  thumbnailWrapper: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  thumbnailWrapperActive: {
    borderColor: Colors.primary,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  brandTitle: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  productName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingScore: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  ratingCount: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
  },
  soldText: {
    fontSize: FontSize.sm,
    color: '#0D9488',
    fontWeight: FontWeight.semibold,
  },
  priceCard: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.md,
  },
  price: {
    fontSize: 26,
    fontWeight: FontWeight.extrabold,
    color: Colors.error,
  },
  oldPrice: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  priceTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  priceTagBadge: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  priceTagBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  saveNoteText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
    marginBottom: Spacing.md,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  colorBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  colorBtnActive: {
    borderColor: Colors.primary,
  },
  colorInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sizeGuideText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    textDecorationLine: 'underline',
  },
  sizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sizeBtn: {
    width: (width - 64) / 4,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  sizeBtnActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  sizeBtnText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  sizeBtnTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    minWidth: 40,
    textAlign: 'center',
  },
  minQtyNote: {
    fontSize: FontSize.sm,
    color: '#D97706',
    fontWeight: FontWeight.semibold,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  bulletList: {
    gap: Spacing.sm,
  },
  bulletItem: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  reviewsSummaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  reviewsAvg: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingRight: Spacing.md,
  },
  avgScore: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.extrabold,
    color: '#0F172A',
  },
  starsRow: {
    flexDirection: 'row',
    marginVertical: 4,
    gap: 2,
  },
  avgLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  reviewsBreakdown: {
    flex: 2,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  breakdownNum: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    width: 10,
  },
  breakdownTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  breakdownPercent: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    width: 30,
    textAlign: 'right',
  },
  extraSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: 4,
  },
  extraText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.md,
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.lg,
  },
  favBtn: {
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  addCartBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  buyNowBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});

