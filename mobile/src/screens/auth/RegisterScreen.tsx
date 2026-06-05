import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '', phone: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công. Vui lòng đăng nhập.', [
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
        <Text style={styles.title}>Đăng ký tài khoản</Text>

        <Text style={styles.label}>Tên đăng nhập *</Text>
        <TextInput style={styles.input} value={form.username} onChangeText={v => update('username', v)} placeholder="Nhập tên đăng nhập" autoCapitalize="none" />

        <Text style={styles.label}>Email *</Text>
        <TextInput style={styles.input} value={form.email} onChangeText={v => update('email', v)} placeholder="Nhập email" keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput style={styles.input} value={form.phone} onChangeText={v => update('phone', v)} placeholder="Nhập số điện thoại" keyboardType="phone-pad" />

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
