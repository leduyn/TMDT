import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/auth';
import { ConfirmModal } from '../../components/ConfirmModal';
import type { UserDTO } from '../../types';

export function ProfileScreen() {
  const { user, logout, userRole } = useAuth();
  const [profile, setProfile] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const data = await userApi.getMe(user.id);
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
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  return (
    <>
    <ScrollView style={styles.container}>
      <View style={styles.header}>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    alignItems: 'center', paddingTop: 60, paddingBottom: 24, backgroundColor: '#2563eb',
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: '700', color: '#fff' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  role: { fontSize: 13, color: '#bfdbfe', marginTop: 4 },
  section: {
    backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 12, padding: 16,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  infoLabel: { fontSize: 14, color: '#6b7280' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1f2937', maxWidth: '55%', textAlign: 'right' },
  agencyName: { fontSize: 14, color: '#374151', marginBottom: 4 },
  noData: { fontSize: 13, color: '#9ca3af' },
  logoutBtn: {
    marginHorizontal: 16, marginTop: 24, backgroundColor: '#fee2e2',
    borderRadius: 12, padding: 16, alignItems: 'center',
  },
  logoutBtnText: { color: '#dc2626', fontSize: 16, fontWeight: '700' },
});
