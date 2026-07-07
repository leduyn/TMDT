import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { productApi } from '../../api/product';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ProductCardHorizontal } from '../../components/ProductCardHorizontal';
import type { ProductDTO } from '../../types';

export function ProductListScreen({ route, navigation }: any) {
  const { categoryId, categoryName, brandId, brandName } = route.params || {};
  const { agencyId } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: categoryName || brandName || 'Sản phẩm' });
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      let data;
      if (categoryId) {
        data = await productApi.getByParentCategory(categoryId, agencyId ?? undefined);
      } else if (brandId) {
        const res = await productApi.getByBrandPaged(brandId, agencyId ?? undefined, 0, 100);
        data = res.content;
      } else {
        data = await productApi.getAll(agencyId ?? undefined);
      }
      setProducts(data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: ProductDTO) => {
    addItem(product);
    Alert.alert('Đã thêm', `${product.name} đã thêm vào giỏ hàng`);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <ProductCardHorizontal
            product={item}
            onPress={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
            onAddToCart={handleAddToCart}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Không có sản phẩm nào</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 8 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#9ca3af' },
});
