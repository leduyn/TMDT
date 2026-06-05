import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  Animated, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing, Shadow } from '../../theme';

const { width } = Dimensions.get('window');

export function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }
    setLoading(true);
    try {
      await login({ username: username.trim(), password: password.trim() });
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', err.message || 'Sai tên đăng nhập hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
              style={styles.logoBg}
            >
              <Ionicons name="storefront" size={36} color={Colors.white} />
            </LinearGradient>
          </View>
          <Text style={styles.brand}>TMDT</Text>
          <Text style={styles.subtitle}>Hệ thống quản lý bán hàng thông minh</Text>
        </Animated.View>

        <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.formTitle}>Đăng nhập</Text>
          <Text style={styles.formSubtitle}>Chào mừng bạn quay trở lại</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Tên đăng nhập"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mật khẩu"
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.disabledBtn]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Đăng nhập</Text>
                  <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerLabel}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  gradientBg: { ...StyleSheet.absoluteFillObject },
  circle: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.06)' },
  circle1: { width: 300, height: 300, top: -80, right: -60 },
  circle2: { width: 200, height: 200, bottom: 100, left: -80 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl },
  header: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logoContainer: { marginBottom: Spacing.lg },
  logoBg: {
    width: 72, height: 72, borderRadius: BorderRadius.xl,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  brand: {
    fontSize: FontSize.hero, fontWeight: FontWeight.extrabold,
    color: Colors.white, letterSpacing: 3,
  },
  subtitle: {
    fontSize: FontSize.md, color: 'rgba(255,255,255,0.75)',
    marginTop: Spacing.sm, fontWeight: FontWeight.medium,
  },
  formCard: {
    backgroundColor: Colors.glass, borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl, ...Shadow.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  formTitle: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, marginBottom: Spacing.xs,
  },
  formSubtitle: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  inputGroup: { gap: Spacing.lg },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  inputIcon: { marginRight: Spacing.md },
  input: {
    flex: 1, paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    fontSize: FontSize.lg, color: Colors.textPrimary,
  },
  eyeBtn: { padding: Spacing.sm },
  forgotBtn: { alignSelf: 'flex-end', marginTop: Spacing.md, marginBottom: Spacing.xl },
  forgotText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  loginBtn: { borderRadius: BorderRadius.md, overflow: 'hidden', ...Shadow.md },
  disabledBtn: { opacity: 0.6 },
  loginBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: Spacing.sm,
  },
  loginBtnText: {
    color: Colors.white, fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  registerRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: Spacing.xxl,
  },
  registerLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  registerLink: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.bold },
});
