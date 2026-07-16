import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Platform
} from 'react-native';
import { SafeScreen } from '../../components/SafeScreen';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { categoryApi, productApi, brandApi } from '../../api/product';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../../theme';
import type { CategoryDTO, ProductDTO, BrandDTO } from '../../types';
import { CategoryItem } from '../../components/CategoryItem';
import { resolveImageUrl } from '../../utils';
import { ProductCard } from '../../components/ProductCard';
import { useGuideTarget } from '../../guide/useGuideTarget';
import { useGuide } from '../../guide/useGuide';

export function CategoryListScreen({ navigation }: any) {
  const { agencyId, userRole } = useAuth();
  const { addItem } = useCart();
  const { startGuide } = useGuide();

  const fabRef = useGuideTarget('categoryFab');
  const searchBarRef = useGuideTarget('searchBar');
  const sidebarRef = useGuideTarget('categorySidebar');
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryDTO | null>(null);
  const [subCategories, setSubCategories] = useState<CategoryDTO[]>([]);
  const [subCategoryProducts, setSubCategoryProducts] = useState<Record<number, ProductDTO[]>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);

  const [sidebarTab, setSidebarTab] = useState<'category' | 'brand'>('category');
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [activeBrand, setActiveBrand] = useState<BrandDTO | null>(null);
  const [brandProducts, setBrandProducts] = useState<ProductDTO[]>([]);
  const [brandProductsLoading, setBrandProductsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'default' | 'price_asc' | 'price_desc'>('default');

  useFocusEffect(useCallback(() => {
    loadCategories();
    loadBrands();
  }, []));

  useEffect(() => {
    if (activeCategory && sidebarTab === 'category') {
      loadSubCategories(activeCategory.id);
    }
  }, [activeCategory, sidebarTab]);

  useEffect(() => {
    if (activeBrand && sidebarTab === 'brand') {
      loadBrandProducts(activeBrand.id);
    }
  }, [activeBrand, sidebarTab]);

  useEffect(() => {
    if (agencyId) {
      const timer = setTimeout(() => {
        try { startGuide('3'); } catch { }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [agencyId]);

  const loadCategories = async () => {
    try {
      const data = userRole === 'AGENCY' && agencyId
        ? await categoryApi.getForAgency(agencyId)
        : await categoryApi.getAll();
      const level = data.filter(c => c.level === 1);
      setCategories(level);
      if (level.length > 0) {
        setActiveCategory(level[0]);
      }
    } catch (err) {
      console.log('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubCategories = async (catId: number) => {
    setSubLoading(true);
    setSubCategories([]);
    setSubCategoryProducts({});
    try {
      const children = await categoryApi.getChildren(catId);

      if (children.length > 0) {
        const results = await Promise.all(
          children.map(child =>
            productApi.getByCategoryPaged(child.id, agencyId ?? undefined, 0, 10)
              .then(res => ({ childId: child.id, products: res.content }))
              .catch(() => ({ childId: child.id, products: [] as ProductDTO[] }))
          )
        );

        const productsMap: Record<number, ProductDTO[]> = {};
        results.forEach(r => {
          if (r.products.length > 0) {
            productsMap[r.childId] = r.products;
          }
        });
        setSubCategoryProducts(productsMap);
        setSubCategories(children.filter(c => productsMap[c.id]));
      } else {
        const selfProducts = await productApi.getByCategoryPaged(catId, agencyId ?? undefined, 0, 10)
          .then(res => res.content)
          .catch(() => [] as ProductDTO[]);

        if (selfProducts.length > 0) {
          const productsMap: Record<number, ProductDTO[]> = {
            [catId]: selfProducts
          };
          setSubCategoryProducts(productsMap);
          const currentCat = categories.find(c => c.id === catId) || activeCategory;
          if (currentCat) {
            setSubCategories([currentCat]);
          }
        } else {
          setSubCategories([]);
        }
      }
    } catch (err) {
      console.log('Error loading subcategories:', err);
    } finally {
      setSubLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const data = await brandApi.getAll();
      setBrands(data);
      if (data.length > 0) {
        setActiveBrand(data[0]);
      }
    } catch (err) {
      console.log('Error loading brands:', err);
    }
  };

  const loadBrandProducts = async (brandId: number) => {
    setBrandProductsLoading(true);
    setBrandProducts([]);
    try {
      const res = await productApi.getByBrandPaged(brandId, agencyId ?? undefined, 0, 20);
      setBrandProducts(res.content);
    } catch (err) {
      console.log('Error loading brand products:', err);
    } finally {
      setBrandProductsLoading(false);
    }
  };

  const handleAddToCart = (product: ProductDTO) => {
    addItem(product, 1);
    Alert.alert('Thành công', `Đã thêm ${product.name} vào giỏ hàng`);
  };

  const processedProductsMap = useMemo(() => {
    let map = subCategoryProducts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const result: Record<number, ProductDTO[]> = {};
      Object.entries(subCategoryProducts).forEach(([catIdStr, products]) => {
        const filtered = products.filter(p => p.name.toLowerCase().includes(q));
        if (filtered.length > 0) result[Number(catIdStr)] = filtered;
      });
      map = result;
    }

    if (sortOrder !== 'default') {
      const result: Record<number, ProductDTO[]> = {};
      Object.entries(map).forEach(([catIdStr, products]) => {
        result[Number(catIdStr)] = [...products].sort((a, b) => {
          const pa = a.appliedPrice ?? a.price ?? 0;
          const pb = b.appliedPrice ?? b.price ?? 0;
          return sortOrder === 'price_asc' ? pa - pb : pb - pa;
        });
      });
      map = result;
    }

    return map;
  }, [searchQuery, subCategoryProducts, sortOrder]);

  const visibleSubCategories = useMemo(
    () => subCategories.filter(c => processedProductsMap[c.id]),
    [subCategories, processedProductsMap]
  );

  const sortedBrandProducts = useMemo(() => {
    if (sortOrder === 'default') return brandProducts;
    return [...brandProducts].sort((a, b) => {
      const pa = a.appliedPrice ?? a.price ?? 0;
      const pb = b.appliedPrice ?? b.price ?? 0;
      return sortOrder === 'price_asc' ? pa - pb : pb - pa;
    });
  }, [brandProducts, sortOrder]);

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
    );
  }

  const renderSection = (subCat: CategoryDTO) => {
    const products = processedProductsMap[subCat.id] || [];
    if (products.length === 0) return null;

    return (
      <View key={subCat.id} style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => navigation.navigate('CategoryProducts', { categoryId: subCat.id, categoryName: subCat.name })}
          activeOpacity={0.6}
        >
          <Text style={styles.sectionTitle}>{subCat.name}</Text>
          <View style={styles.sectionArrow}>
            <Text style={styles.sectionSeeAll}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </View>
        </TouchableOpacity>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsRow}
        >
          {products.map(product => (
            <View key={product.id} style={styles.productCardWrapper}>
              <ProductCard
                product={product}
                onPress={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
                onAddToCart={handleAddToCart}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeScreen style={styles.container} statusBar={{ barStyle: 'light-content', backgroundColor: Colors.primary }}>
      <View style={styles.searchHeader}>
        <View ref={searchBarRef} style={styles.searchWrapper} collapsable={false}>
          <Ionicons name="search-outline" size={18} color={Colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm trong danh mục..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => navigation.navigate('ProductList', { search: searchQuery })}
          />
        </View>
        <TouchableOpacity style={styles.cartHeaderBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}>
          <Ionicons name="cart-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
        {userRole === 'AGENCY' && (
          <TouchableOpacity style={styles.guideBtn} onPress={() => startGuide('3')}>
            <Ionicons name="help-circle-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {categories.length === 0 ? (
        <View style={[styles.center, { flex: 1 }]}>
          <Ionicons name="layers-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>Không có danh mục</Text>
          {userRole === 'AGENCY' && (
            <Text style={styles.emptyHintText}>Chạm vào nút + để mở thêm danh mục</Text>
          )}
        </View>
      ) : (
        <View style={styles.splitBody}>
          {/* Sidebar Tabs + List */}
          <View ref={sidebarRef} style={styles.sidebar} collapsable={false}>
            <View style={styles.sidebarTabs}>
              <TouchableOpacity
                style={[styles.sidebarTab, sidebarTab === 'category' && styles.sidebarTabActive]}
                onPress={() => setSidebarTab('category')}
              >
                <Ionicons
                  name="grid-outline"
                  size={14}
                  color={sidebarTab === 'category' ? Colors.primary : Colors.textTertiary}
                />
                <Text style={[styles.sidebarTabText, sidebarTab === 'category' && styles.sidebarTabTextActive]}>
                  DM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sidebarTab, sidebarTab === 'brand' && styles.sidebarTabActive]}
                onPress={() => setSidebarTab('brand')}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={14}
                  color={sidebarTab === 'brand' ? Colors.primary : Colors.textTertiary}
                />
                <Text style={[styles.sidebarTabText, sidebarTab === 'brand' && styles.sidebarTabTextActive]}>
                  TH
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sidebarContent}
            >
              {sidebarTab === 'category'
                ? categories.map((cat) => (
                  <CategoryItem
                    key={cat.id}
                    name={cat.name}
                    imageUrl={cat.imageUrl}
                    isActive={activeCategory?.id === cat.id}
                    onPress={() => setActiveCategory(cat)}
                  />
                ))
                : brands.map((b) => (
                  <CategoryItem
                    key={b.id}
                    name={b.name}
                    imageUrl={b.logoUrl}
                    //iconName="pricetag-outline"
                    isActive={activeBrand?.id === b.id}
                    onPress={() => setActiveBrand(b)}
                  />
                ))}
            </ScrollView>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.sortBar}>
              <TouchableOpacity
                style={[styles.sortBtn, sortOrder !== 'default' && styles.sortBtnActive]}
                onPress={() => {
                  setSortOrder(prev =>
                    prev === 'default' ? 'price_asc' :
                      prev === 'price_asc' ? 'price_desc' : 'default'
                  );
                }}
              >
                <Ionicons
                  name={sortOrder === 'price_asc' ? 'arrow-up' : sortOrder === 'price_desc' ? 'arrow-down' : 'swap-vertical'}
                  size={14}
                  color={sortOrder !== 'default' ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.sortBtnText, sortOrder !== 'default' && styles.sortBtnTextActive]}>
                  {sortOrder === 'default' ? 'Mặc định' :
                    sortOrder === 'price_asc' ? 'Giá ↑' : 'Giá ↓'}
                </Text>
              </TouchableOpacity>
            </View>
            {sidebarTab === 'category' ? (
              subLoading ? (
                <View style={styles.productsCenter}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : visibleSubCategories.length > 0 ? (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.sectionsContainer}
                >
                  {visibleSubCategories.map(renderSection)}
                </ScrollView>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name={searchQuery ? 'search-outline' : 'cube-outline'}
                    size={48}
                    color={Colors.textTertiary}
                  />
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? 'Không tìm thấy sản phẩm phù hợp'
                      : 'Không có sản phẩm trong danh mục này'}
                  </Text>
                </View>
              )
            ) : brandProductsLoading ? (
              <View style={styles.productsCenter}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : sortedBrandProducts.length > 0 ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sectionsContainer}
              >
                {activeBrand && (
                  <View style={styles.brandHeader}>
                    <Text style={styles.brandHeaderName}>{activeBrand.name}</Text>
                    <Text style={styles.brandHeaderCount}>{sortedBrandProducts.length} sản phẩm</Text>
                  </View>
                )}
                <View style={styles.brandProductsGrid}>
                  {sortedBrandProducts.map(product => (
                    <View key={product.id} style={styles.brandProductCard}>
                      <ProductCard
                        product={product}
                        onPress={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
                        onAddToCart={handleAddToCart}
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="pricetag-outline" size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyText}>Không có sản phẩm cho thương hiệu này</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* FAB - Open Categories */}
      {userRole === 'AGENCY' && (
        <TouchableOpacity
          ref={fabRef}
          style={styles.fab}
          onPress={() => navigation.navigate('OpenCategories')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-outline" size={24} color={Colors.white} />
          <Ionicons name="layers-outline" size={18} color={Colors.white} style={{ marginLeft: -6 }} />
        </TouchableOpacity>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  productsCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { marginRight: Spacing.xs, color: Colors.textTertiary },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  cartHeaderBtn: { padding: Spacing.xs },
  guideBtn: { padding: Spacing.xs, marginLeft: 4 },
  splitBody: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: '30%',
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
  },
  sidebarTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sidebarTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  sidebarTabActive: {
    borderBottomColor: Colors.primary,
  },
  sidebarTabText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
  },
  sidebarTabTextActive: {
    color: Colors.primary,
  },
  sidebarContent: { paddingVertical: Spacing.sm },
  mainContent: {
    width: '70%',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  sortBtnActive: {
    backgroundColor: Colors.primarySoft,
  },
  sortBtnText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  sortBtnTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  sectionsContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  sectionArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionSeeAll: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  productsRow: {
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },
  productCardWrapper: {
    width: 180,
  },
  brandHeader: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  brandHeaderName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  brandHeaderCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  brandProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xs,
  },
  brandProductCard: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  emptyHintText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
