import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, BorderRadius } from '../theme';

const fmt = (n: number) => (n ?? 0).toLocaleString('vi-VN') + 'đ';

interface CompactCreditBarProps {
  cartValue: number;
  hmkd: number;
}

export function CompactCreditBar({ cartValue, hmkd }: CompactCreditBarProps) {
  if (hmkd <= 0) return null;

  const isOverLimit = cartValue > hmkd;
  const usedPercent = hmkd > 0 ? Math.min((cartValue / hmkd) * 100, 100) : 0;
  const remainingPercent = 100 - usedPercent;

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          HMKD: <Text style={styles.amount}>{fmt(hmkd)}</Text>
        </Text>
        <Text style={[styles.percentText, { color: isOverLimit ? Colors.error : Colors.textSecondary }]}>
          {isOverLimit ? 'Vượt hạn mức' : `Đã dùng ${usedPercent.toFixed(0)}%`}
        </Text>
      </View>
      <View style={styles.barBg}>
        {isOverLimit ? (
          <View style={styles.barOverLimit} />
        ) : (
          <>
            <View style={[styles.barOrange, { width: `${usedPercent}%` }]} />
            <View style={[styles.barGreen, { width: `${remainingPercent}%` }]} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  amount: {
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  percentText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  barBg: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barOrange: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderTopLeftRadius: BorderRadius.full,
    borderBottomLeftRadius: BorderRadius.full,
  },
  barGreen: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderTopRightRadius: BorderRadius.full,
    borderBottomRightRadius: BorderRadius.full,
  },
  barOverLimit: {
    height: '100%',
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    width: '100%',
  },
});
