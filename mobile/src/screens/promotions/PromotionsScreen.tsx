import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { promotionApi } from '../../api/promotion';
import type { PromotionDTO } from '../../types';

export function PromotionsScreen() {
  const [promotions, setPromotions] = useState<PromotionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadPromotions(); }, []);

  const loadPromotions = async () => {
    try {
      const data = await promotionApi.getAll();
      setPromotions(data);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const discountLabel = (p: PromotionDTO) => {
    if (p.discountType === 'PERCENTAGE') return `Giảm ${p.discountValue}%`;
    return `Giảm ${p.discountValue.toLocaleString('vi-VN')}đ`;
  };

  const isActive = (p: PromotionDTO) => {
    const now = new Date();
    return new Date(p.startDate) <= now && new Date(p.endDate) >= now;
  };

  const renderItem = ({ item }: { item: PromotionDTO }) => (
    <View style={[styles.card, !isActive(item) && styles.inactiveCard]}>
      <View style={styles.cardHeader}>
        <View style={[styles.discountBadge, { backgroundColor: isActive(item) ? '#dc2626' : '#9ca3af' }]}>
          <Text style={styles.discountText}>{discountLabel(item)}</Text>
        </View>
        {!isActive(item) && <Text style={styles.expiredLabel}>Hết hạn</Text>}
      </View>
      <Text style={styles.name}>{item.name}</Text>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
      {item.code && (
        <View style={styles.codeRow}>
          <Text style={styles.codeLabel}>Mã: </Text>
          <Text style={styles.codeValue}>{item.code}</Text>
        </View>
      )}
      {item.minOrderValue != null && item.minOrderValue > 0 && (
        <Text style={styles.minOrder}>Đơn tối thiểu: {item.minOrderValue.toLocaleString('vi-VN')}đ</Text>
      )}
      <View style={styles.dateRow}>
        <Text style={styles.date}>
          {new Date(item.startDate).toLocaleDateString('vi-VN')} - {new Date(item.endDate).toLocaleDateString('vi-VN')}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={promotions}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPromotions(); }} />}
        ListEmptyComponent={<Text style={styles.empty}>Không có chương trình khuyến mãi</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  inactiveCard: { opacity: 0.7 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  discountBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  discountText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  expiredLabel: { fontSize: 12, color: '#9ca3af', fontWeight: '600' },
  name: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  description: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  codeRow: { flexDirection: 'row', marginTop: 8 },
  codeLabel: { fontSize: 13, color: '#6b7280' },
  codeValue: { fontSize: 13, fontWeight: '700', color: '#2563eb' },
  minOrder: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  dateRow: { marginTop: 8 },
  date: { fontSize: 12, color: '#9ca3af' },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15, color: '#9ca3af' },
});
