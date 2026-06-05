import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { OrderStatus } from '../types';

const statusColors: Record<OrderStatus, string> = {
  NEW: '#3b82f6',
  PENDING: '#f59e0b',
  PROCESSING: '#8b5cf6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
  PENDING_PAYMENT: '#f97316',
};

const statusLabels: Record<OrderStatus, string> = {
  NEW: 'Mới',
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  PENDING_PAYMENT: 'Chờ thanh toán',
};

interface Props {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: statusColors[status] + '20' }]}>
      <View style={[styles.dot, { backgroundColor: statusColors[status] }]} />
      <Text style={[styles.text, { color: statusColors[status] }]}>
        {statusLabels[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
