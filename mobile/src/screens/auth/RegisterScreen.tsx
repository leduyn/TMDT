import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export function RegisterScreen({ navigation }: any) {
  const { registerAgency } = useAuth();
  const [form, setForm] = useState({
    customerCode: '', companyName: '', email: '', phone: '',
    representativeName: '', taxCode: '', billingAddress: '',
    shippingAddress: '', referralCode: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleRegister = async () => {
    if (!form.customerCode || !form.companyName || !form.email || !form.phone || !form.password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await registerAgency({
        code: form.customerCode.trim(),
        name: form.companyName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        representativeName: form.representativeName.trim() || undefined,
        taxCode: form.taxCode.trim() || undefined,
        billingAddress: form.billingAddress.trim() || undefined,
        shippingAddress: form.shippingAddress.trim() || undefined,
        referralCode: form.referralCode.trim() || undefined,
      });
      Alert.alert('Thành công', 'Đăng ký đại lý thành công. Vui lòng chờ duyệt.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Đăng ký đại lý</Text>

        <Text style={styles.label}>Mã khách hàng *</Text>
        <TextInput style={styles.input} value={form.customerCode} onChangeText={v => update('customerCode', v)} placeholder="Nhập mã khách hàng" autoCapitalize="characters" />

        <Text style={styles.label}>Tên đơn vị *</Text>
        <TextInput style={styles.input} value={form.companyName} onChangeText={v => update('companyName', v)} placeholder="Nhập tên đơn vị" />

        <Text style={styles.label}>Email *</Text>
        <TextInput style={styles.input} value={form.email} onChangeText={v => update('email', v)} placeholder="Nhập email" keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Số điện thoại *</Text>
        <TextInput style={styles.input} value={form.phone} onChangeText={v => update('phone', v)} placeholder="Nhập số điện thoại" keyboardType="phone-pad" />

        <Text style={styles.label}>Người đại diện</Text>
        <TextInput style={styles.input} value={form.representativeName} onChangeText={v => update('representativeName', v)} placeholder="Nhập người đại diện" />

        <Text style={styles.label}>Mã số thuế</Text>
        <TextInput style={styles.input} value={form.taxCode} onChangeText={v => update('taxCode', v)} placeholder="Nhập mã số thuế" />

        <Text style={styles.label}>Địa chỉ hóa đơn</Text>
        <TextInput style={styles.input} value={form.billingAddress} onChangeText={v => update('billingAddress', v)} placeholder="Nhập địa chỉ hóa đơn" />

        <Text style={styles.label}>Địa chỉ giao hàng</Text>
        <TextInput style={styles.input} value={form.shippingAddress} onChangeText={v => update('shippingAddress', v)} placeholder="Nhập địa chỉ giao hàng" />

        <Text style={styles.label}>Mã giới thiệu</Text>
        <TextInput style={styles.input} value={form.referralCode} onChangeText={v => update('referralCode', v)} placeholder="Nhập mã giới thiệu" />

        <Text style={styles.label}>Mật khẩu *</Text>
        <TextInput style={styles.input} value={form.password} onChangeText={v => update('password', v)} placeholder="Nhập mật khẩu" secureTextEntry />

        <Text style={styles.label}>Xác nhận mật khẩu *</Text>
        <TextInput style={styles.input} value={form.confirmPassword} onChangeText={v => update('confirmPassword', v)} placeholder="Xác nhận mật khẩu" secureTextEntry />

        <TouchableOpacity style={[styles.btn, loading && styles.disabled]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Đăng ký</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 32, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10,
    padding: 14, fontSize: 16, backgroundColor: '#f9fafb',
  },
  btn: { backgroundColor: '#2563eb', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24 },
  disabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { textAlign: 'center', marginTop: 16, color: '#2563eb', fontSize: 14 },
});
