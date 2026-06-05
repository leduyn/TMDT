import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { debtApi } from '../../api/debt';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../theme';
import type { AgencyDebtDTO } from '../../types';

export function DebtScreen() {
  const { agencyId } = useAuth();
  const [debts, setDebts] = useState<AgencyDebtDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadDebts(); }, []);

  const loadDebts = async () => {
    try {
      const data = agencyId
        ? await debtApi.getByAgency(agencyId)
        : await debtApi.getAll();
      setDebts(data);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ thanh toán';
      case 'PAID': return 'Đã thanh toán';
      case 'OVERDUE': return 'Quá hạn';
      default: return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'PAID': return '#10b981';
      case 'OVERDUE': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const totalRemaining = debts.reduce((s, d) => s + d.remainingAmount, 0);

  const renderItem = ({ item }: { item: AgencyDebtDTO }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.debtCode}>{item.debtCode}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
            {statusLabel(item.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Tổng:</Text>
        <Text style={styles.amount}>{item.totalAmount.toLocaleString('vi-VN')}đ</Text>
      </View>
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Còn lại:</Text>
        <Text style={[styles.remaining, { color: item.remainingAmount > 0 ? '#dc2626' : '#10b981' }]}>
          {item.remainingAmount.toLocaleString('vi-VN')}đ
        </Text>
      </View>
      {item.dueDate && (
        <Text style={styles.dueDate}>Hạn TT: {new Date(item.dueDate).toLocaleDateString('vi-VN')}</Text>
      )}
    </View>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Tổng công nợ còn lại</Text>
        <Text style={styles.summaryAmount}>{totalRemaining.toLocaleString('vi-VN')}đ</Text>
      </View>
      <FlatList
        data={debts}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDebts(); }} />}
        ListEmptyComponent={<Text style={styles.empty}>Không có công nợ</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summary: {
    backgroundColor: Colors.primary, padding: 20, paddingTop: 60,
  },
  summaryLabel: { fontSize: 14, color: '#bfdbfe' },
  summaryAmount: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 4 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  debtCode: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  description: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  amountLabel: { fontSize: 13, color: '#6b7280' },
  amount: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  remaining: { fontSize: 14, fontWeight: '700' },
  dueDate: { fontSize: 12, color: '#9ca3af', marginTop: 6 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15, color: '#9ca3af' },
});
