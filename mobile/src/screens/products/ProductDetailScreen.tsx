import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Dimensions, Platform, Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productApi, attributeApi, facetedSearchApi } from '../../api/product';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing, Shadow } from '../../theme';
import type { ProductDTO } from '../../types';
import { resolveImageUrl } from '../../utils';

const { width } = Dimensions.get('window');

export function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const { agencyId } = useAuth();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeProductId, setActiveProductId] = useState<number>(productId);
  
  // Selected Variations
  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [activeTab, setActiveTab] = useState(0);

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

  const hasContent = (val: string | undefined | null) => val && stripHtml(val).length > 0;

  // Dynamic Product Attributes & Variants State
  const [attributes, setAttributes] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (productId && productId !== activeProductId) {
      setProduct(null);
      setActiveProductId(productId);
      setActiveTab(0);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [activeProductId]);

  const loadProduct = async () => {
    if (!product) {
      setLoading(true);
    }
    try {
      const [prodData, attrData, allAttrs] = await Promise.all([
        productApi.getById(activeProductId, agencyId ?? undefined),
        facetedSearchApi.getProductAttributes(activeProductId).catch(() => []),
        attributeApi.getAll().catch(() => [])
      ]);

      setProduct(prodData);
      
      // Update header options
      navigation.setOptions({
        headerTitle: prodData.name || 'Chi tiết sản phẩm',
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

      // Build attribute maps
      const attrMap = new Map();
      const attrVariantMap = new Map();
      allAttrs.forEach((a: any) => {
        attrMap.set(a.id, a.displayName || a.name);
        attrVariantMap.set(a.id, a.isVariant);
      });

      const enrichedAttrs = attrData.map((val: any) => ({
        ...val,
        attributeName: attrMap.get(val.attributeId) || `Thuộc tính ${val.attributeId}`,
        isVariant: attrVariantMap.get(val.attributeId)
      }));
      setAttributes(enrichedAttrs);

      const hasVariantAttrs = enrichedAttrs.some(a => a.isVariant);

      // Load variants from the same category only if product has variant attributes
      if (hasVariantAttrs && prodData.categoryId) {
        try {
          const categoryProducts = await productApi.getByCategory(prodData.categoryId, agencyId ?? undefined);
          if (categoryProducts && categoryProducts.length > 0) {
            const variantPromises = categoryProducts.map(async (p) => {
              const pAttrs = await facetedSearchApi.getProductAttributes(p.id).catch(() => []);
              const attrDict: Record<string, string> = {};
              pAttrs.forEach(a => {
                const isVar = attrVariantMap.get(a.attributeId);
                if (isVar) {
                  const name = attrMap.get(a.attributeId) || `Thuộc tính ${a.attributeId}`;
                  attrDict[name] = a.value;
                }
              });
              return { id: p.id, attributes: attrDict };
            });

            const resolvedVariants = await Promise.all(variantPromises);
            setVariants(resolvedVariants);

            const available: Record<string, Set<string>> = {};
            resolvedVariants.forEach(v => {
              Object.entries(v.attributes).forEach(([key, val]) => {
                if (!available[key]) available[key] = new Set();
                available[key].add(val);
              });
            });

            const availableArrays: Record<string, string[]> = {};
            Object.entries(available).forEach(([k, v]) => {
              availableArrays[k] = Array.from(v);
            });
            setAvailableAttributes(availableArrays);
          } else {
            setVariants([]);
            setAvailableAttributes({});
          }
        } catch (variantErr) {
          console.log('Error loading product variants:', variantErr);
        }
      } else {
        setVariants([]);
        setAvailableAttributes({});
      }
    } catch (err) {
      console.log('Error loading product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (attrName: string, val: string) => {
    const currentSelection: Record<string, string> = {};
    attributes.forEach(a => {
      if (a.isVariant) {
        currentSelection[a.attributeName] = a.value;
      }
    });

    const targetSelection = { ...currentSelection, [attrName]: val };

    let bestMatch = variants.find(v => {
      if (v.attributes[attrName] !== val) return false;
      return Object.keys(targetSelection).every(key => !v.attributes[key] || v.attributes[key] === targetSelection[key]);
    });

    if (!bestMatch) {
      bestMatch = variants.find(v => v.attributes[attrName] === val);
    }

    if (bestMatch && bestMatch.id !== activeProductId) {
      setActiveProductId(bestMatch.id);
      navigation.setParams({ productId: bestMatch.id });
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

  const price = product.appliedPrice ?? product.price ?? 0;
  const oldPrice = product.oldAppliedPrice;
  const hasDiscount = oldPrice && oldPrice > price;
  const discountPercent = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const priceSaving = hasDiscount ? oldPrice - price : 0;
  const minQty = product.minPurchaseQuantity || 1;

  // Build image list (fallback to placeholders if none defined)
  const productImages = product.imageUrl 
    ? [resolveImageUrl(product.imageUrl), ...(product.imageUrls || []).map(resolveImageUrl).filter((url): url is string => !!url && url !== resolveImageUrl(product.imageUrl))] 
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

        {/* Dynamic Attribute Variations Selectors */}
        {Object.entries(availableAttributes).map(([attrName, values]) => {
          return (
            <View key={attrName} style={styles.section}>
              <View style={styles.sizeHeader}>
                <Text style={styles.sectionTitle}>{attrName}</Text>
                {(attrName.toLowerCase().includes('size') || attrName.toLowerCase().includes('kích thước') || attrName.toLowerCase().includes('cỡ')) && (
                  <TouchableOpacity>
                    <Text style={styles.sizeGuideText}>Hướng dẫn chọn size</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.attributesRow}>
                {values.map((val) => {
                  const isSelected = attributes.some(
                    (a) => a.attributeName === attrName && a.value === val
                  );
                  const isHex = val.startsWith('#');

                  return (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.attrBtn,
                        isSelected && styles.attrBtnActive,
                        isHex && { width: 42, height: 42, borderRadius: 21, paddingHorizontal: 0, paddingVertical: 0, minWidth: 0 }
                      ]}
                      onPress={() => handleVariantSelect(attrName, val)}
                    >
                      {isHex ? (
                        <View style={[styles.colorInnerDot, { backgroundColor: val }]} />
                      ) : (
                        <Text style={[
                          styles.attrBtnText,
                          isSelected && styles.attrBtnTextActive
                        ]}>
                          {val}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Quantity Controls Section */}
        <View style={[styles.section, styles.qtySection]}>
          <Text style={styles.qtyLabel}>Số lượng đặt hàng ({product.unit || 'chiếc'})</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(minQty, qty - 1))}>
              <Ionicons name="remove" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
              <Ionicons name="add" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          {minQty > 1 && (
            <Text style={styles.minQtyNote}>Mức mua tối thiểu: {minQty}</Text>
          )}
        </View>

        {/* Tabs: Description / Specifications / Usage Instructions */}
        {(() => {
          const cleanDesc = product.description ? stripHtml(product.description) : '';
          const hasSpecs = attributes.length > 0;
          const hasUsage = hasContent(product.userManual);

          const tabs = [
            { label: 'Mô tả sản phẩm', visible: hasContent(product.description) },
            { label: 'Thông số kỹ thuật', visible: hasSpecs },
            { label: 'Hướng dẫn sử dụng', visible: hasUsage },
          ].filter(t => t.visible);

          if (tabs.length === 0) return null;

          const safeTabIndex = Math.min(activeTab, tabs.length - 1);

          return (
            <View style={styles.section}>
              <View style={styles.tabBar}>
                {tabs.map((tab, idx) => (
                  <TouchableOpacity
                    key={tab.label}
                    style={[styles.tabItem, safeTabIndex === idx && styles.tabItemActive]}
                    onPress={() => setActiveTab(idx)}
                  >
                    <Text style={[styles.tabText, safeTabIndex === idx && styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.tabContent}>
                {safeTabIndex === 0 && (
                  <Text style={styles.description}>{cleanDesc}</Text>
                )}
                {safeTabIndex === 1 && (
                  hasSpecs ? (
                    <View>
                      {attributes.map((attr, idx) => (
                        <View key={idx} style={styles.specRow}>
                          <Text style={styles.specName}>{attr.attributeName}</Text>
                          <Text style={styles.specValue}>{attr.value}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null
                )}
                {safeTabIndex === 2 && hasUsage && (
                  <Text style={styles.description}>
                    {product.userManual ? stripHtml(product.userManual) : ''}
                  </Text>
                )}
              </View>
            </View>
          );
        })()}

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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    fontWeight: FontWeight.semibold,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  tabContent: {
    minHeight: 40,
  },
  attributesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  attrBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  attrBtnActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  attrBtnText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  attrBtnTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  colorInnerDot: {
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
  specRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  specName: {
    flex: 1,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
  specValue: {
    flex: 2,
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
  },
  qtySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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

