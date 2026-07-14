import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, BorderRadius, Shadow } from '../theme';

const fmt = (n: number) => (n ?? 0).toLocaleString('vi-VN') + 'đ';

interface CartCreditBarProps {
  cartValue: number;
  hmkd: number;
  expanded: boolean;
}

export function CartCreditBar({ cartValue, hmkd, expanded }: CartCreditBarProps) {
  if (hmkd <= 0) return null;

  const remaining = Math.max(0, hmkd - cartValue);
  const isOverLimit = cartValue > hmkd;
  const usedPercent = hmkd > 0 ? Math.min((cartValue / hmkd) * 100, 100) : 0;
  const remainingPercent = 100 - usedPercent;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.column}>
          <Text style={styles.label}>Giá trị giỏ hàng</Text>
          <Text style={[styles.value, { color: Colors.accent }]}>{fmt(cartValue)}</Text>
        </View>
        <View style={styles.colDivider} />
        <View style={styles.column}>
          <Text style={styles.label}>HMKD còn lại</Text>
          <Text style={[styles.value, { color: isOverLimit ? Colors.error : '#0D9488' }]}>
            {isOverLimit ? '0đ' : fmt(remaining)}
          </Text>
        </View>
      </View>

      {expanded && (
      <View style={styles.barSection}>
        <Text style={styles.totalLabel}>Tổng Hạn mức khả dụng: {fmt(hmkd)}</Text>
        <View style={styles.barBg}>
          {isOverLimit ? (
            <View style={styles.barOverLimit} />
          ) : (
            <>
              <View style={[styles.barSegmentOrange, { width: `${usedPercent}%` }]} />
              <View style={[styles.barSegmentGreen, { width: `${remainingPercent}%` }]} />
            </>
          )}
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.legendText}>Giỏ hàng ({usedPercent.toFixed(0)}%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: isOverLimit ? Colors.error : '#0D9488' }]} />
            <Text style={[styles.legendText, isOverLimit && { color: Colors.error }]}>
              {isOverLimit ? 'Vượt hạn mức!' : `Còn lại (${remainingPercent.toFixed(0)}%)`}
            </Text>
          </View>
        </View>
        {isOverLimit && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>
              Giá trị giỏ hàng đang vượt quá hạn mức khả dụng!
            </Text>
          </View>
        )}
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginTop: 16,
    ...Shadow.sm,
  },
  topRow: {
    flexDirection: 'row',
    padding: 18,
    paddingBottom: 14,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  colDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  value: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
  },
  barSection: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  totalLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  barBg: {
    height: 14,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barSegmentOrange: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
  },
  barSegmentGreen: {
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
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },
  warningBadge: {
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  warningText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
});
