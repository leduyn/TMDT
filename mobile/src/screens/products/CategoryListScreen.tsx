import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
  ActivityIndicator, Alert, TextInput, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryApi, productApi, brandApi } from '../../api/product';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../../theme';
import type { CategoryDTO, ProductDTO, BrandDTO } from '../../types';
import { resolveImageUrl } from '../../utils';
import { ProductCard } from '../../components/ProductCard';

export function CategoryListScreen({ navigation }: any) {
  const { agencyId } = useAuth();
  const { addItem } = useCart();
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

  useEffect(() => {
    loadCategories();
    loadBrands();
  }, []);

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

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      const level2 = data.filter(c => c.level === 2);
      setCategories(level2);
      if (level2.length > 0) {
        setActiveCategory(level2[0]);
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

  const filteredProductsMap = useMemo(() => {
    if (!searchQuery.trim()) return subCategoryProducts;
    const q = searchQuery.toLowerCase().trim();
    const result: Record<number, ProductDTO[]> = {};
    Object.entries(subCategoryProducts).forEach(([catIdStr, products]) => {
      const filtered = products.filter(p => p.name.toLowerCase().includes(q));
      if (filtered.length > 0) {
        result[Number(catIdStr)] = filtered;
      }
    });
    return result;
  }, [searchQuery, subCategoryProducts]);

  const visibleSubCategories = useMemo(
    () => subCategories.filter(c => filteredProductsMap[c.id]),
    [subCategories, filteredProductsMap]
  );

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="layers-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.emptyText}>Không có danh mục</Text>
      </View>
    );
  }

  const renderSection = (subCat: CategoryDTO) => {
    const products = filteredProductsMap[subCat.id] || [];
    if (products.length === 0) return null;

    return (
      <View key={subCat.id} style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => navigation.navigate('ProductList', { categoryId: subCat.id, categoryName: subCat.name })}
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
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchWrapper}>
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
      </View>

      <View style={styles.splitBody}>
        {/* Sidebar Tabs + List */}
        <View style={styles.sidebar}>
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
              ? categories.map((cat) => {
                  const isActive = activeCategory?.id === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                      onPress={() => setActiveCategory(cat)}
                    >
                      <View style={[styles.activeIndicator, isActive && styles.activeIndicatorVisible]} />
                      <Image
                        source={{ uri: resolveImageUrl(cat.imageUrl) || 'https://via.placeholder.com/40' }}
                        style={styles.categoryIcon}
                      />
                      <Text
                        style={[styles.categoryName, isActive && styles.categoryNameActive]}
                        numberOfLines={2}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              : brands.map((b) => {
                  const isActive = activeBrand?.id === b.id;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                      onPress={() => setActiveBrand(b)}
                    >
                      <View style={[styles.activeIndicator, isActive && styles.activeIndicatorVisible]} />
                      <View style={styles.brandIconWrapper}>
                        <Ionicons name="pricetag-outline" size={18} color={isActive ? Colors.primary : Colors.textSecondary} />
                      </View>
                      <Text
                        style={[styles.categoryName, isActive && styles.categoryNameActive]}
                        numberOfLines={2}
                      >
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
          </ScrollView>
        </View>

        <View style={styles.mainContent}>
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
          ) : brandProducts.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sectionsContainer}
            >
              {activeBrand && (
                <View style={styles.brandHeader}>
                  <Text style={styles.brandHeaderName}>{activeBrand.name}</Text>
                  <Text style={styles.brandHeaderCount}>{brandProducts.length} sản phẩm</Text>
                </View>
              )}
              <View style={styles.brandProductsGrid}>
                {brandProducts.map(product => (
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
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
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
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    position: 'relative',
    gap: Spacing.sm,
  },
  categoryTabActive: { backgroundColor: Colors.primarySoft },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '30%',
    bottom: '30%',
    width: 4,
    backgroundColor: 'transparent',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  activeIndicatorVisible: { backgroundColor: Colors.primary },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.background,
  },
  categoryName: {
    flex: 1,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  categoryNameActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  mainContent: {
    width: '70%',
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
    width: 150,
  },
  brandIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
});
