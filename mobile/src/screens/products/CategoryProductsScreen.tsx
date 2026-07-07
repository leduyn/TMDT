import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryApi, productApi } from '../../api/product';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ProductCard } from '../../components/ProductCard';
import { ProductCardHorizontal } from '../../components/ProductCardHorizontal';
import type { CategoryDTO, ProductDTO } from '../../types';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

export function CategoryProductsScreen({ route, navigation }: any) {
  const { categoryId, categoryName } = route.params || {};
  const { agencyId } = useAuth();
  const { addItem } = useCart();
  const [children, setChildren] = useState<CategoryDTO[]>([]);
  const [productsByChild, setProductsByChild] = useState<Record<number, ProductDTO[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: categoryName || 'Danh mục sản phẩm' });
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const childList = await categoryApi.getChildren(categoryId);
      if (childList && childList.length > 0) {
        setChildren(childList);
        const results = await Promise.all(
          childList.map(child =>
            productApi.getByCategory(child.id, agencyId ?? undefined)
              .then(products => ({ childId: child.id, products }))
              .catch(() => ({ childId: child.id, products: [] as ProductDTO[] }))
          )
        );
        const map: Record<number, ProductDTO[]> = {};
        results.forEach(r => { map[r.childId] = r.products; });
        setProductsByChild(map);
      } else {
        setChildren([]);
        const products = await productApi.getByCategory(categoryId, agencyId ?? undefined);
        setProductsByChild({ [categoryId]: products });
      }
    } catch (err) {
      console.error('Error loading category products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: ProductDTO) => {
    addItem(product, 1);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const hasChildren = children.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {hasChildren ? (
        children.map(child => {
          const products = productsByChild[child.id] || [];
          if (products.length === 0) return null;
          return (
            <View key={child.id} style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => navigation.navigate('ProductList', { categoryId: child.id, categoryName: child.name })}
                activeOpacity={0.6}
              >
                <Text style={styles.sectionTitle}>{child.name}</Text>
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
        })
      ) : (
        <View>
          {(productsByChild[categoryId] || []).length > 0 ? (
            (productsByChild[categoryId] || []).map(product => (
              <ProductCardHorizontal
                key={product.id}
                product={product}
                onPress={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>Không có sản phẩm trong danh mục này</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingVertical: Spacing.sm },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
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
    width: 160,
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
