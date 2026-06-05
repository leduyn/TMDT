import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
  ActivityIndicator, Alert, Animated, Platform, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { debtApi } from '../../api/debt';
import { creditApi } from '../../api/credit';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing, Shadow } from '../../theme';
import type { AgencyDebtDTO, CreditDetailResponse } from '../../types';

const { width } = Dimensions.get('window');

// ─── Helpers ───────────────────────────────────────────────
const fmt = (n: number | null | undefined) => (n ?? 0).toLocaleString('vi-VN') + 'đ';

const statusLabel = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Chờ thanh toán';
    case 'PAID': return 'Đã thanh toán';
    case 'OVERDUE': return 'Quá hạn';
    default: return status;
  }
};

const daysOverdue = (dueDate?: string) => {
  if (!dueDate) return 0;
  const diff = Date.now() - new Date(dueDate).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

const isOverdueDate = (dueDate?: string, remaining?: number) => {
  if (!dueDate || !remaining || remaining <= 0) return false;
  return new Date(dueDate) < new Date();
};

const debtTypeBadge: Record<string, { label: string; color: string; bg: string }> = {
  ORDER_VALUE:   { label: 'Đơn hàng',     color: '#2563eb', bg: '#dbeafe' },
  DELIVERY_FEE:  { label: 'Phí giao hàng', color: '#d97706', bg: '#fef3c7' },
  INCREASE:      { label: 'Tăng công nợ',  color: '#dc2626', bg: '#fee2e2' },
  DECREASE:      { label: 'Giảm công nợ',  color: '#059669', bg: '#d1fae5' },
  PAYMENT:       { label: 'Thanh toán',    color: '#059669', bg: '#d1fae5' },
  DEPOSIT:       { label: 'Nạp ký quỹ',    color: '#059669', bg: '#d1fae5' },
  REFUND:        { label: 'Hoàn tiền',     color: '#059669', bg: '#d1fae5' },
  HOLD:          { label: 'Giữ quỹ',       color: '#d97706', bg: '#fef3c7' },
  INTEREST:      { label: 'Lãi quá hạn',   color: '#dc2626', bg: '#fee2e2' },
};

const ledgerTypeLabel: Record<string, { label: string; color: string }> = {
  DEBT:     { label: 'Ghi nợ',     color: '#ef4444' },
  PAYMENT:  { label: 'Thanh toán', color: '#22c55e' },
  INTEREST: { label: 'Lãi',        color: '#f59e0b' },
  HOLD:     { label: 'Giữ quỹ',    color: '#a78bfa' },
  REFUND:   { label: 'Hoàn tiền',  color: '#38bdf8' },
};

// ─── Animated Counter Hook ────────────────────────────────
function useAnimatedCounter(target: number, duration = 1500) {
  const animRef = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0đ');

  useEffect(() => {
    animRef.setValue(0);
    const listener = animRef.addListener(({ value }) => {
      setDisplay(fmt(Math.floor(value)));
    });
    Animated.timing(animRef, {
      toValue: target,
      duration,
      useNativeDriver: false,
    }).start();
    return () => animRef.removeListener(listener);
  }, [target]);

  return display;
}

// ═══════════════════════════════════════════════════════════
// ─── Main Component ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════
export function DebtScreen({ navigation }: any) {
  const { user, agencyId } = useAuth();
  const [debts, setDebts] = useState<AgencyDebtDTO[]>([]);
  const [credit, setCredit] = useState<CreditDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setError(null);
    try {
      const [debtData, creditData] = await Promise.all([
        agencyId ? debtApi.getByAgency(agencyId) : debtApi.getAll(),
        agencyId ? creditApi.getDetail(agencyId) : Promise.resolve(null),
      ]);
      setDebts(debtData);
      setCredit(creditData);
    } catch (e: any) {
      setError(e.message || 'Không thể tải dữ liệu công nợ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  // ── Computed values ──
  const totalDebt = debts.reduce((s, d) => s + d.remainingToCollect, 0);
  const creditLimit = credit?.creditLimit ?? 0;
  const guaranteeDebt = credit?.guaranteeDebt ?? 0;
  const hmkd = credit?.hmkd ?? (creditLimit - totalDebt);
  const available = Math.max(0, hmkd);
  const usedPercent = creditLimit > 0 ? (totalDebt / creditLimit) * 100 : 0;
  const isOverLimit = usedPercent > 100;

  const unpaidDebts = debts.filter(d => d.remainingToCollect > 0);
  const payments = credit?.ledgerHistory ?? [];
  const animatedDebt = useAnimatedCounter(totalDebt);

  // ── Loading State ──
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); loadData(); }}>
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePayNow = () => {
    if (!agencyId) { Alert.alert('Lỗi', 'Không tìm thấy thông tin đại lý'); return; }
    Alert.alert(
      'Thanh toán công nợ',
      `Bạn có ${totalDebt > 0 ? `dư nợ ${fmt(totalDebt)}` : 'không có dư nợ'}. Tính năng thanh toán đang được phát triển.`,
    );
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN') + ' • ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* ═══ Header ═══ */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Công nợ & Tín dụng</Text>
        </View>
        <TouchableOpacity style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'MP'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* ═══ Section Label ═══ */}
        <View style={styles.sectionLabelRow}>
          <View>
            <Text style={styles.sectionLabel}>QUẢN LÝ TÀI CHÍNH</Text>
            <Text style={styles.sectionHeadline}>Công nợ & Tín dụng</Text>
          </View>
          <TouchableOpacity style={styles.payNowBtn} activeOpacity={0.8} onPress={handlePayNow}>
            <Ionicons name="card-outline" size={18} color={Colors.white} />
            <Text style={styles.payNowText}>Thanh toán ngay</Text>
          </TouchableOpacity>
        </View>

        {/* ═══ Summary Cards ═══ */}
        <View style={styles.cardsRow}>
          {/* Card 1: Total Debt - Gradient */}
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.debtCard}
          >
            <View>
              <Text style={styles.debtCardLabel}>TỔNG DƯ NỢ HIỆN TẠI</Text>
              <Text style={styles.debtCardAmount}>{animatedDebt}</Text>
            </View>
            {isOverLimit && (
              <View style={styles.warningRow}>
                <Ionicons name="warning" size={14} color="#ffdad6" />
                <Text style={styles.warningText}>
                  Vượt định mức {Math.round(usedPercent - 100)}%
                </Text>
              </View>
            )}
            {/* Background icon watermark */}
            <View style={styles.watermark}>
              <Ionicons name="wallet-outline" size={120} color="rgba(255,255,255,0.08)" />
            </View>
          </LinearGradient>

          {/* Card 2: Credit Limit */}
          <View style={styles.creditCard}>
            <View style={styles.creditHeader}>
              <Text style={styles.creditLabel}>HẠN MỨC TÍN DỤNG</Text>
              <View style={styles.platinumBadge}>
                <Text style={styles.platinumText}>PLATINUM</Text>
              </View>
            </View>
            <Text style={styles.creditAmount}>{fmt(creditLimit)}</Text>
            <View style={styles.creditFooter}>
              <View style={styles.creditUsageRow}>
                <Text style={styles.creditUsageLabel}>Khả dụng (HMKD)</Text>
                <Text style={styles.creditUsageValue}>{fmt(available)}</Text>
              </View>
              {guaranteeDebt > 0 && (
                <View style={styles.creditUsageRow}>
                  <Text style={styles.creditUsageLabel}>Nợ bảo lãnh</Text>
                  <Text style={[styles.creditUsageValue, { color: '#be123c' }]}>{fmt(guaranteeDebt)}</Text>
                </View>
              )}
              <View style={styles.progressBarBg}>
                <View style={[
                  styles.progressBarFill,
                  { width: `${Math.min(usedPercent, 100)}%` },
                  usedPercent > 80 && { backgroundColor: Colors.error },
                ]} />
              </View>
            </View>
          </View>
        </View>

        {/* ═══ Agency Info Card ═══ */}
        <View style={styles.agencyCard}>
          <Text style={styles.agencyLabel}>THÔNG TIN ĐẠI LÝ</Text>
          <View style={styles.agencyRow}>
            <View style={styles.agencyAvatar}>
              <Text style={styles.agencyAvatarText}>
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'MP'}
              </Text>
            </View>
            <View style={styles.agencyInfo}>
              <Text style={styles.agencyName}>
                {user?.displayName || user?.organizationName || 'Minh Phát Tier 1'}
              </Text>
              <Text style={styles.agencyId}>
                ID: AG-{user?.id || '8829'} • {user?.customerGroupName || 'Platinum Partner'}
              </Text>
            </View>
          </View>
          <View style={styles.agencyDivider} />
          <View style={styles.agencyStatsRow}>
            <View style={styles.agencyStatItem}>
              <Text style={styles.agencyStatLabel}>Hạn thanh toán</Text>
              <Text style={styles.agencyStatValue}>{credit?.debtTermDays ?? 30} ngày</Text>
            </View>
            <View style={styles.agencyStatItem}>
              <Text style={styles.agencyStatLabel}>VTC khả dụng</Text>
              <Text style={[styles.agencyStatValue, { color: '#0D9488' }]}>
                {fmt(credit?.vtcAvailable ?? 0)}
              </Text>
            </View>
          </View>
          {!!credit?.vtcHold && credit.vtcHold > 0 && (
            <View style={styles.agencyStatsRow}>
              <View style={styles.agencyStatItem}>
                <Text style={styles.agencyStatLabel}>VTC đang giữ</Text>
                <Text style={[styles.agencyStatValue, { color: '#dc2626' }]}>
                  {fmt(credit.vtcHold)}
                </Text>
              </View>
              <View style={styles.agencyStatItem} />
            </View>
          )}
        </View>

        {/* ═══ Unpaid Invoices ═══ */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hóa đơn chưa thanh toán</Text>
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {unpaidDebts.length > 0 ? (
          unpaidDebts.map((debt) => {
            const overdue = isOverdueDate(debt.dueDate, debt.remainingToCollect);
            const overdueDays = daysOverdue(debt.dueDate);
            const badge = debt.debtType ? debtTypeBadge[debt.debtType] : null;
            return (
              <TouchableOpacity key={debt.id} style={styles.invoiceCard} activeOpacity={0.7}>
                <View style={styles.invoiceLeft}>
                  <View style={[
                    styles.invoiceIcon,
                    overdue ? styles.invoiceIconOverdue : styles.invoiceIconNormal,
                  ]}>
                    <Ionicons
                      name="document-text-outline"
                      size={22}
                      color={overdue ? Colors.error : Colors.primary}
                    />
                  </View>
                  <View style={styles.invoiceInfo}>
                    <Text style={styles.invoiceCode}>{debt.debtCode}</Text>
                    <View style={styles.invoiceMetaRow}>
                      {badge && (
                        <View style={[styles.debtTypeBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.debtTypeBadgeText, { color: badge.color }]}>{badge.label}</Text>
                        </View>
                      )}
                      {debt.jobCategory ? (
                        <Text style={styles.invoiceDesc} numberOfLines={1}>{debt.jobCategory}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
                <View style={styles.invoiceRight}>
                  {overdue ? (
                    <Text style={styles.overdueLabel}>Quá hạn {overdueDays} ngày</Text>
                  ) : debt.dueDate ? (
                    <Text style={styles.dueLabel}>
                      Đến hạn: {new Date(debt.dueDate).toLocaleDateString('vi-VN')}
                    </Text>
                  ) : null}
                  <Text style={styles.invoiceAmount}>{fmt(debt.remainingToCollect)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={40} color="#0D9488" />
            <Text style={styles.emptyText}>Không có hóa đơn chưa thanh toán</Text>
          </View>
        )}

        {/* ═══ Overdue Debts (from credit detail) ═══ */}
        {credit?.overdueDebts && credit.overdueDebts.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="alert-circle" size={18} color="#dc2626" />
                <Text style={[styles.sectionTitle, { color: '#dc2626' }]}>
                  Nợ quá hạn ({credit.overdueDebts.length})
                </Text>
              </View>
            </View>
            {credit.overdueDebts.map((od) => (
              <TouchableOpacity key={od.id} style={styles.overdueCard} activeOpacity={0.7}>
                <View style={styles.overdueRow}>
                  <Text style={styles.overdueOrderId}>Đơn hàng #{od.orderId}</Text>
                  <Text style={styles.overdueTotal}>
                    {fmt(od.principalAmount + od.interestAccrued)}
                  </Text>
                </View>
                <View style={styles.overdueDetailRow}>
                  <Text style={styles.overdueDetailItem}>Gốc: {fmt(od.principalAmount)}</Text>
                  <Text style={styles.overdueDetailItem}>Lãi: {fmt(od.interestAccrued)}</Text>
                  {od.startDate && (
                    <Text style={styles.overdueDetailItem}>
                      Từ: {new Date(od.startDate).toLocaleDateString('vi-VN')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ═══ Customer Debts ═══ */}
        {credit?.customerDebts && credit.customerDebts.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
              <Text style={styles.sectionTitle}>Công nợ khách hàng</Text>
            </View>
            {credit.customerDebts.map((cd) => (
              <View key={cd.customerId} style={styles.customerDebtRow}>
                <Text style={styles.customerDebtName} numberOfLines={1}>{cd.customerName}</Text>
                <Text style={styles.customerDebtValue}>{fmt(cd.totalDebt)}</Text>
              </View>
            ))}
          </>
        )}

        {/* ═══ Payment History (Ledger) ═══ */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xxl }]}>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
          <TouchableOpacity>
            <Ionicons name="filter-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.paymentHistoryCard}>
          {payments.length > 0 ? (
            payments.map((entry, index) => {
              const meta = ledgerTypeLabel[entry.type] ?? { label: entry.type, color: Colors.textSecondary };
              const isDebit = ['DEBT', 'HOLD', 'INTEREST'].includes(entry.type);
              const isCustomer = entry.receiverType === 'CUSTOMER';
              return (
                <View key={entry.id}>
                  <View style={styles.paymentRow}>
                    <View style={styles.paymentLeft}>
                      <View style={[styles.paymentIcon, { backgroundColor: meta.color + '20' }]}>
                        <Ionicons name="ellipse" size={10} color={meta.color} />
                      </View>
                      <View>
                        <View style={styles.paymentMethodRow}>
                          <Text style={styles.paymentMethod}>{meta.label}</Text>
                          {isCustomer && (
                            <View style={styles.receiverBadge}>
                              <Text style={styles.receiverBadgeText}>Bảo lãnh</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.paymentDate}>
                          {formatDateTime(entry.createdAt)}
                          {entry.referenceId ? ` • #${entry.referenceId}` : ''}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.paymentAmount,
                      { color: isDebit ? '#dc2626' : '#0D9488' },
                    ]}>
                      {isDebit ? '−' : '+'}{fmt(Math.abs(entry.amount))}
                    </Text>
                  </View>
                  {index < payments.length - 1 && <View style={styles.paymentDivider} />}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyLedger}>
              <Ionicons name="receipt-outline" size={32} color={Colors.textTertiary} />
              <Text style={styles.emptyLedgerText}>Chưa có giao dịch nào</Text>
            </View>
          )}

          {/* Download report button */}
          <View style={styles.paymentDivider} />
          <TouchableOpacity style={styles.downloadRow} activeOpacity={0.7}>
            <Ionicons name="download-outline" size={16} color={Colors.primary} />
            <Text style={styles.downloadText}>Tải báo cáo sao kê (.pdf)</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// ─── Styles ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  iconBtn: {
    padding: Spacing.xs,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },

  // ── Section Label + Pay Now ──
  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionHeadline: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  payNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#904d00',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadow.md,
  },
  payNowText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },

  // ── Summary Cards ──
  cardsRow: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  // Debt Card (Gradient)
  debtCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    minHeight: 160,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...Shadow.lg,
  },
  debtCardLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  debtCardAmount: {
    fontSize: 36,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  warningText: {
    fontSize: FontSize.sm,
    color: '#ffdad6',
  },
  watermark: {
    position: 'absolute',
    right: -15,
    bottom: -15,
  },

  // Credit Limit Card
  creditCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  creditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  creditLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  retryBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryBtnText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
  platinumBadge: {
    backgroundColor: '#7efba4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  platinumText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#00210c',
    letterSpacing: 0.5,
  },
  emptyLedger: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyLedgerText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  creditAmount: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  creditFooter: {
    gap: Spacing.sm,
  },
  creditUsageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creditUsageLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  creditUsageValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: BorderRadius.full,
  },

  // ── Agency Info Card ──
  agencyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xxl,
    ...Shadow.sm,
  },
  agencyLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  agencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  agencyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primarySoft,
    borderWidth: 2,
    borderColor: '#adc7f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agencyAvatarText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  agencyInfo: {
    flex: 1,
  },
  agencyName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  agencyId: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  agencyDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  agencyStatsRow: {
    flexDirection: 'row',
  },
  agencyStatItem: {
    flex: 1,
  },
  agencyStatLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  agencyStatValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },

  // ── Section Headers ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },

  // ── Invoice Cards ──
  invoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  invoiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  invoiceIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  invoiceIconOverdue: {
    backgroundColor: '#ffdad6',
  },
  invoiceIconNormal: {
    backgroundColor: Colors.borderLight,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  debtTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  debtTypeBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  invoiceCode: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  invoiceDesc: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  invoiceRight: {
    alignItems: 'flex-end',
    marginRight: Spacing.xs,
  },
  overdueLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.error,
    marginBottom: 2,
  },
  dueLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  invoiceAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
  },

  // ── Overdue Debts ──
  overdueCard: {
    backgroundColor: '#fef2f2',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  overdueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  overdueOrderId: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#991b1b',
  },
  overdueTotal: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#dc2626',
  },
  overdueDetailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overdueDetailItem: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // ── Customer Debts ──
  customerDebtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customerDebtName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.md,
  },
  customerDebtValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#dc2626',
  },

  // ── Receiver Badge ──
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  receiverBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  receiverBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#d97706',
  },

  // ── Payment History ──
  paymentHistoryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6faf0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethod: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  paymentDate: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  paymentAmount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#0D9488',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.lg,
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.lg,
  },
  downloadText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
});
