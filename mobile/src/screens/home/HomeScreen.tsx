import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert,
  Image, TextInput, Dimensions, StatusBar, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { dashboardApi } from '../../api/notification';
import { productApi } from '../../api/product';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing, Shadow } from '../../theme';
import type { ProductDTO, DashboardDTO } from '../../types';

const { width } = Dimensions.get('window');

export function HomeScreen({ navigation }: any) {
  const { user, logout, agencyId } = useAuth();
  const { totalItems, addItem } = useCart();
  const [dashboard, setDashboard] = useState<DashboardDTO | null>(null);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dash, prods] = await Promise.all([
        dashboardApi.getDashboard().catch(() => null),
        productApi.getAll(agencyId ?? undefined).catch(() => []),
      ]);
      if (dash) setDashboard(dash);
      if (prods) setProducts(prods);
    } catch (err) {
      console.log('Error loading home data:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  const handleAddToCart = (product: ProductDTO) => {
    addItem(product, 1);
    Alert.alert('Thành công', `Đã thêm ${product.name} vào giỏ hàng`);
  };

  // Stacked mockup images for Bento grid
  const bentoNewImages = [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1496181130204-755241544e35?w=120&auto=format&fit=crop&q=60',
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="menu-outline" size={26} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>B2B Connect</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color={Colors.white} />
            <View style={styles.notiBadge} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'MP'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Search Bar Container */}
        <View style={styles.searchSection}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={20} color={Colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => navigation.navigate('ProductList', { search: searchQuery })}
            />
          </View>
        </View>

        {/* Hero Banner Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.8 }}
            style={styles.heroBg}
          >
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>ƯU ĐÃI THÁNG 10</Text>
            </View>
            <Text style={styles.heroTitle}>Gói Giải Pháp Agency{'\n'}Tiết Kiệm Đến 30%</Text>
            <Text style={styles.heroSub}>Tối ưu hóa nguồn hàng cho các đại lý Platinum với chiết khấu độc quyền.</Text>
            <TouchableOpacity 
              style={styles.heroBtn}
              onPress={() => navigation.navigate('Promotions')}
            >
              <Text style={styles.heroBtnText}>Xem Chi Tiết</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Bento Grid Section */}
        <View style={styles.bentoSection}>
          {/* Bento Item 1: New Products (Colspan 2) */}
          <TouchableOpacity 
            style={[styles.bentoCard, styles.bentoCardLarge]}
            onPress={() => navigation.navigate('CategoryList')}
          >
            <View>
              <Text style={styles.bentoTitle}>Sản phẩm mới</Text>
              <Text style={styles.bentoDesc}>Cập nhật xu hướng thị trường hàng tuần</Text>
            </View>
            <View style={styles.stackedImagesContainer}>
              <View style={styles.stackedImages}>
                {bentoNewImages.map((img, idx) => (
                  <Image 
                    key={idx} 
                    source={{ uri: img }} 
                    style={[styles.stackedAvatar, { left: idx * 24 }]} 
                  />
                ))}
                <View style={[styles.stackedAvatar, styles.stackedAvatarMore, { left: bentoNewImages.length * 24 }]}>
                  <Text style={styles.avatarMoreText}>+12</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.bentoRow}>
            {/* Bento Item 2: Best Selling (Orange Accent) */}
            <TouchableOpacity 
              style={[styles.bentoCardMini, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}
              onPress={() => navigation.navigate('ProductList', { tag: 'best-selling' })}
            >
              <Ionicons name="trending-up-outline" size={32} color="#D97706" />
              <Text style={[styles.bentoMiniTitle, { color: '#B45309' }]}>Bán chạy</Text>
            </TouchableOpacity>

            {/* Bento Item 3: Brands (Blue Accent) */}
            <TouchableOpacity 
              style={[styles.bentoCardMini, { backgroundColor: '#E0F2FE', borderColor: '#0284C7' }]}
              onPress={() => navigation.navigate('CategoryList')}
            >
              <Ionicons name="ribbon-outline" size={32} color="#0284C7" />
              <Text style={[styles.bentoMiniTitle, { color: '#0369A1' }]}>Thương hiệu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended Products Grid Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Gợi ý dành cho bạn</Text>
            <Text style={styles.sectionSubtitle}>Sản phẩm được tối ưu dựa trên lịch sử nhập hàng</Text>
          </View>
          <TouchableOpacity 
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('CategoryList')}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <Ionicons name="arrow-forward-outline" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Recommended Products Row/Grid */}
        <View style={styles.productsGrid}>
          {products.length > 0 ? (
            products.slice(0, 4).map((p) => {
              const displayPrice = p.appliedPrice ?? p.price ?? 0;
              const oldPrice = p.oldAppliedPrice;
              const hasDiscount = oldPrice && oldPrice > displayPrice;
              const discountPercent = hasDiscount ? Math.round(((oldPrice - displayPrice) / oldPrice) * 100) : 0;
              const isOutOfStock = p.stockQuantity === 0;

              return (
                <TouchableOpacity 
                  key={p.id} 
                  style={styles.prodCard}
                  onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}
                >
                  <View style={styles.prodImgWrapper}>
                    <Image
                      source={{ uri: p.imageUrl || 'https://via.placeholder.com/150' }}
                      style={styles.prodImg}
                      resizeMode="cover"
                    />
                    {hasDiscount && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{discountPercent}%</Text>
                      </View>
                    )}
                    <TouchableOpacity 
                      style={styles.addCartFloating}
                      onPress={() => handleAddToCart(p)}
                      disabled={isOutOfStock}
                    >
                      <Ionicons name="add-outline" size={20} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.prodInfo}>
                    <Text style={styles.prodBrand}>{p.brand?.name || 'GENERIC'}</Text>
                    <Text style={styles.prodName} numberOfLines={2}>{p.name}</Text>
                    <View style={styles.prodPriceRow}>
                      <Text style={styles.prodPrice}>{displayPrice.toLocaleString('vi-VN')}đ</Text>
                      {hasDiscount && (
                        <Text style={styles.prodOldPrice}>{oldPrice.toLocaleString('vi-VN')}đ</Text>
                      )}
                    </View>
                    
                    <View style={styles.prodFooter}>
                      <Text style={[styles.stockText, isOutOfStock && styles.outOfStockText]}>
                        <Ionicons name={isOutOfStock ? "close-circle-outline" : "cube-outline"} size={11} />
                        {' '}{isOutOfStock ? 'Hết hàng' : `Còn ${p.stockQuantity ?? 10}`}
                      </Text>
                      <Text style={styles.tierText}>Agency: Tier 1</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            // Mock Fallbacks if database is empty
            <>
              <View style={styles.prodCard}>
                <View style={styles.prodImgWrapper}>
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=60' }} style={styles.prodImg} />
                  <View style={styles.discountBadge}><Text style={styles.discountText}>-15%</Text></View>
                  <TouchableOpacity style={styles.addCartFloating}><Ionicons name="add-outline" size={20} color={Colors.white} /></TouchableOpacity>
                </View>
                <View style={styles.prodInfo}>
                  <Text style={styles.prodBrand}>NIKE PROFESSIONAL</Text>
                  <Text style={styles.prodName} numberOfLines={2}>Giày thể thao Air Max Zoom Edition Pro - Phiên bản giới hạn</Text>
                  <View style={styles.prodPriceRow}>
                    <Text style={styles.prodPrice}>2.450.000đ</Text>
                    <Text style={styles.prodOldPrice}>2.880.000đ</Text>
                  </View>
                  <View style={styles.prodFooter}>
                    <Text style={styles.stockText}><Ionicons name="cube-outline" size={11} /> Còn 45</Text>
                    <Text style={styles.tierText}>Agency: Tier 1</Text>
                  </View>
                </View>
              </View>

              <View style={styles.prodCard}>
                <View style={styles.prodImgWrapper}>
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&auto=format&fit=crop&q=60' }} style={styles.prodImg} />
                  <TouchableOpacity style={styles.addCartFloating}><Ionicons name="add-outline" size={20} color={Colors.white} /></TouchableOpacity>
                </View>
                <View style={styles.prodInfo}>
                  <Text style={styles.prodBrand}>RAY-BAN LUXURY</Text>
                  <Text style={styles.prodName} numberOfLines={2}>Kính Mắt Phân Cực Gold Classic Aviator Limited</Text>
                  <View style={styles.prodPriceRow}>
                    <Text style={styles.prodPrice}>4.120.000đ</Text>
                  </View>
                  <View style={styles.prodFooter}>
                    <Text style={styles.stockText}><Ionicons name="cube-outline" size={11} /> Còn 12</Text>
                    <Text style={styles.tierText}>Agency: Tier 1</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Agency Status Card (Bottom Banner) */}
        <View style={styles.agencyBanner}>
          <View style={styles.agencyHeader}>
            <View style={styles.badgePremium}>
              <Ionicons name="ribbon" size={18} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.agencyTitle}>
                Chào mừng, {user?.displayName || user?.organizationName || 'Đại lý Minh Phát'}
              </Text>
              <Text style={styles.agencySub}>
                Hạng: {user?.customerGroupName || 'Platinum Partner'} | ID: AG-{user?.id || '8829'}
              </Text>
            </View>
          </View>
          <View style={styles.agencyStatsDivider} />
          <View style={styles.agencyStats}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxLabel}>CÔNG NỢ</Text>
              <Text style={[styles.statBoxValue, { color: '#F59E0B' }]}>
                {user?.totalDebt ? `${user.totalDebt.toLocaleString('vi-VN')}đ` : '12.500.000đ'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBoxLabel}>ĐIỂM TÍCH LŨY</Text>
              <Text style={[styles.statBoxValue, { color: '#10B981' }]}>4.250 pts</Text>
            </View>
          </View>
        </View>

        {/* Logout Option Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.primary,
    borderBottomWidth: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBtn: {
    padding: Spacing.xs,
    position: 'relative',
  },
  notiBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 0,
  },
  avatarText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  searchSection: {
    marginBottom: Spacing.md,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  heroSection: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  heroBg: {
    padding: Spacing.xl,
  },
  heroBadge: {
    backgroundColor: '#0D9488',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    lineHeight: 28,
    marginBottom: Spacing.sm,
  },
  heroSub: {
    fontSize: FontSize.md,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  heroBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
  bentoSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  bentoCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadow.sm,
  },
  bentoCardLarge: {
    minHeight: 100,
  },
  bentoTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
    marginBottom: 2,
  },
  bentoDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  stackedImagesContainer: {
    width: 100,
    height: 48,
    justifyContent: 'center',
  },
  stackedImages: {
    flexDirection: 'row',
    position: 'relative',
    height: 40,
  },
  stackedAvatar: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.background,
  },
  stackedAvatarMore: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMoreText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  bentoCardMini: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 96,
    ...Shadow.sm,
  },
  bentoMiniTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  prodCard: {
    width: (width - 48) / 2,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  prodImgWrapper: {
    height: 140,
    width: '100%',
    backgroundColor: Colors.background,
    position: 'relative',
  },
  prodImg: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: '#0D9488',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  discountText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  addCartFloating: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  prodInfo: {
    padding: Spacing.md,
  },
  prodBrand: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  prodName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    height: 36,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  prodPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  prodPrice: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  prodOldPrice: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  prodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  stockText: {
    fontSize: FontSize.xs,
    color: '#0D9488',
    fontWeight: FontWeight.semibold,
  },
  outOfStockText: {
    color: Colors.error,
  },
  tierText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  agencyBanner: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  agencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  badgePremium: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agencyTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: 2,
  },
  agencySub: {
    fontSize: FontSize.xs,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  agencyStatsDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: Spacing.lg,
  },
  agencyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
  },
  statBoxLabel: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statBoxValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
  },
});

