import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/auth';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing, Shadow } from '../../theme';
import type { UserDTO } from '../../types';

export function ProfileScreen({ navigation }: any) {
  const { user, logout, userRole } = useAuth();
  const [profile, setProfile] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const data = await userApi.getMe();
      setProfile(data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout().catch(console.error);
  };

  const infoItems = [
    { label: 'Tên đăng nhập', value: profile?.username || user?.username },
    { label: 'Email', value: profile?.email || user?.email },
    { label: 'Số điện thoại', value: profile?.phone },
    { label: 'Vai trò', value: userRole === 'ADMIN' ? 'Quản trị viên' : userRole === 'AGENCY' ? 'Đại lý' : 'Khách hàng' },
    { label: 'Tên hiển thị', value: profile?.displayName },
    { label: 'Tên tổ chức', value: profile?.organizationName },
    { label: 'Mã số thuế', value: profile?.taxCode },
    { label: 'Địa chỉ', value: profile?.shippingAddress },
    { label: 'Địa chỉ thanh toán', value: profile?.billingAddress },
    { label: 'Tổng công nợ', value: profile?.totalDebt != null ? `${profile.totalDebt.toLocaleString('vi-VN')}đ` : undefined },
  ];

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerBarTitle}>Hồ sơ</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.username || user?.username || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.username || user?.username}</Text>
          <Text style={styles.role}>
            {userRole === 'ADMIN' ? 'Quản trị viên' : userRole === 'AGENCY' ? 'Đại lý' : 'Khách hàng'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
          {infoItems.map((item, idx) =>
            item.value ? (
              <View key={idx} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ) : null
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản đại lý</Text>
          {profile?.agencyNames?.length ? (
            profile.agencyNames.map((name, idx) => (
              <Text key={idx} style={styles.agencyName}>{name}</Text>
            ))
          ) : (
            <Text style={styles.noData}>Chưa liên kết đại lý</Text>
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutBtnText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ConfirmModal
        visible={showLogoutModal}
        title="Đăng xuất"
        message="Bạn có chắc muốn đăng xuất?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBarTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  role: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  infoLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, maxWidth: '55%', textAlign: 'right' },
  agencyName: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: Spacing.xs },
  noData: { fontSize: FontSize.sm, color: Colors.textTertiary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  logoutBtnText: { color: Colors.error, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
