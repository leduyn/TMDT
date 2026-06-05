import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity, Image, StyleSheet,
  ActivityIndicator, Dimensions, Alert, TextInput, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryApi, productApi } from '../../api/product';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing, Shadow } from '../../theme';
import type { CategoryDTO, ProductDTO } from '../../types';

const { width } = Dimensions.get('window');

export function CategoryListScreen({ navigation }: any) {
  const { agencyId } = useAuth();
  const { addItem } = useCart();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryDTO | null>(null);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeCategory) {
      loadProducts(activeCategory.id);
    }
  }, [activeCategory]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      const parents = data.filter(c => !c.parentId);
      setCategories(parents);
      if (parents.length > 0) {
        setActiveCategory(parents[0]);
      }
    } catch (err) {
      console.log('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (catId: number) => {
    setProductsLoading(true);
    try {
      const data = await productApi.getByCategory(catId, agencyId ?? undefined);
      setProducts(data);
    } catch (err) {
      console.log('Error loading category products:', err);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleAddToCart = (product: ProductDTO) => {
    addItem(product, 1);
    Alert.alert('Thành công', `Đã thêm ${product.name} vào giỏ hàng`);
  };

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
    );
  }

  const renderProductItem = ({ item }: { item: ProductDTO }) => {
    const displayPrice = item.appliedPrice ?? item.price;
    const isOutOfStock = item.stockQuantity === 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/120' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          {item.sku && <Text style={styles.productSku}>SKU: {item.sku}</Text>}
          <Text style={styles.productPrice}>{displayPrice?.toLocaleString('vi-VN')}đ</Text>
          
          <View style={styles.productCardFooter}>
            <Text style={[styles.stockText, isOutOfStock && styles.outOfStockText]}>
              {isOutOfStock ? 'Hết hàng' : `Còn ${item.stockQuantity ?? 10}`}
            </Text>
            <TouchableOpacity 
              style={styles.addCartBtn} 
              onPress={() => handleAddToCart(item)}
              disabled={isOutOfStock}
            >
              <Ionicons name="cart-outline" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
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
        <TouchableOpacity style={styles.cartHeaderBtn} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.splitBody}>
        {/* Left Sidebar (Categories) - 30% width */}
        <ScrollView 
          style={styles.sidebar} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sidebarContent}
        >
          {categories.map((cat) => {
            const isActive = activeCategory?.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <View style={[styles.activeIndicator, isActive && styles.activeIndicatorVisible]} />
                <Image 
                  source={{ uri: cat.imageUrl || 'https://via.placeholder.com/40' }} 
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
          })}
        </ScrollView>

        {/* Right Main Panel (Products List) - 70% width */}
        <View style={styles.mainContent}>
          {productsLoading ? (
            <View style={styles.productsCenter}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <FlatList
              data={products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))}
              keyExtractor={item => String(item.id)}
              renderItem={renderProductItem}
              contentContainerStyle={styles.productList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="cube-outline" size={48} color={Colors.textTertiary} />
                  <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
                </View>
              }
            />
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
  cartHeaderBtn: {
    padding: Spacing.xs,
  },
  splitBody: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '30%',
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
  },
  sidebarContent: {
    paddingVertical: Spacing.sm,
  },
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
  categoryTabActive: {
    backgroundColor: Colors.primarySoft,
  },
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
  activeIndicatorVisible: {
    backgroundColor: Colors.primary,
  },
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
  productList: {
    padding: Spacing.md,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.background,
  },
  productInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  productSku: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  productPrice: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginTop: 4,
  },
  productCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  stockText: {
    fontSize: 10,
    color: '#0D9488',
    fontWeight: FontWeight.semibold,
  },
  outOfStockText: {
    color: Colors.error,
  },
  addCartBtn: {
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});
