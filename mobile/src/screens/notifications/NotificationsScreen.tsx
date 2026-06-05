import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { notificationApi } from '../../api/notification';
import type { NotificationDTO } from '../../types';

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationApi.getAll();
      setNotifications(data);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n),
      );
    } catch {}
  };

  const renderItem = ({ item }: { item: NotificationDTO }) => (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.unreadCard]}
      onPress={() => !item.read && handleMarkRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardRow}>
        <View style={[styles.dot, !item.read && styles.unreadDot]} />
        <View style={styles.content}>
          <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>{unreadCount} thông báo chưa đọc</Text>
        </View>
      )}
      <FlatList
        data={notifications}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotifications(); }} />}
        ListEmptyComponent={<Text style={styles.empty}>Không có thông báo</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  unreadBanner: {
    backgroundColor: '#2563eb', padding: 12, paddingHorizontal: 20,
  },
  unreadBannerText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  unreadCard: { backgroundColor: '#eff6ff', borderLeftWidth: 3, borderLeftColor: '#2563eb' },
  cardRow: { flexDirection: 'row', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d1d5db', marginTop: 6 },
  unreadDot: { backgroundColor: '#2563eb' },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: '#374151' },
  unreadTitle: { color: '#1e3a5f' },
  body: { fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 18 },
  time: { fontSize: 11, color: '#9ca3af', marginTop: 6 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15, color: '#9ca3af' },
});
