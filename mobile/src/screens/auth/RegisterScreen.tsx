import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerApi } from '../../api/auth';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../../theme';
import { CategoryItem } from '../../components/CategoryItem';
import { SurveyModal } from '../../components/SurveyModal';
import type { CategoryDTO, SurveyQuestion } from '../../types';

type Step = 'form' | 'categories' | 'submitting';

export function RegisterScreen({ navigation }: any) {
  const [form, setForm] = useState({
    customerCode: '', companyName: '', email: '', phone: '',
    representativeName: '', taxCode: '', billingAddress: '',
    shippingAddress: '', referralCode: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<Step>('form');
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const [initLoading, setInitLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalCategory, setModalCategory] = useState<CategoryDTO | null>(null);
  const [modalQuestions, setModalQuestions] = useState<SurveyQuestion[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [categoryAnswersCache, setCategoryAnswersCache] =
    useState<Record<number, { answers: Record<number, string>; checkbox: Record<number, string[]> }>>({});

  useEffect(() => {
    if (step === 'form' && categories.length === 0) {
      fetchCategories();
    }
  }, [step]);

  const fetchCategories = async () => {
    setInitLoading(true);
    try {
      const level = await registerApi.getCategoryLevel();
      if (level != null) {
        const cats = await registerApi.getCategoriesByLevel(level);
        setCategories(cats || []);
      }
    } catch {
      // Silently fail
    } finally {
      setInitLoading(false);
    }
  };

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const validateForm = () => {
    if (!form.customerCode || !form.companyName || !form.email || !form.phone || !form.password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }
    if (form.password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  const handleNextToCategories = () => {
    if (!validateForm()) return;
    setStep('categories');
  };

  const handleCategoryPress = async (category: CategoryDTO) => {
    const alreadySelected = selectedCategoryIds.includes(category.id);

    if (alreadySelected) {
      setSelectedCategoryIds(prev => prev.filter(c => c !== category.id));
      setCategoryAnswersCache(prev => {
        const next = { ...prev };
        delete next[category.id];
        return next;
      });
      return;
    }

    setModalCategory(category);
    setModalVisible(true);
    setModalLoading(true);
    try {
      const questions = await registerApi.getSurveyQuestionsByCategory(category.id);
      setModalQuestions(questions || []);
    } catch {
      setModalQuestions([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalSave = (answers: Record<number, string>, checkbox: Record<number, string[]>) => {
    if (modalCategory) {
      setCategoryAnswersCache(prev => ({
        ...prev,
        [modalCategory.id]: { answers, checkbox },
      }));
      setSelectedCategoryIds(prev =>
        prev.includes(modalCategory.id) ? prev : [...prev, modalCategory.id]
      );
    }
    setModalVisible(false);
    setModalCategory(null);
    setModalQuestions([]);
  };

  const handleSubmit = async () => {
    if (selectedCategoryIds.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một danh mục');
      return;
    }

    setStep('submitting');
    setLoading(true);
    try {
      const res = await registerApi.registerAgency({
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
      if (res.token) {
        await AsyncStorage.setItem('token', res.token);
      }
      if (res.agencyId) {
        await AsyncStorage.setItem('agencyId', String(res.agencyId));
        const promises: Promise<any>[] = [];
        if (selectedCategoryIds.length > 0) {
          promises.push(registerApi.saveAgencyCategories(res.agencyId, selectedCategoryIds));
        }
        const allAnswers: { questionId: number; answer: string; categoryId: number }[] = [];
        for (const catId of selectedCategoryIds) {
          const cached = categoryAnswersCache[catId];
          if (!cached) continue;
          for (const [qId, answer] of Object.entries(cached.answers)) {
            allAnswers.push({ questionId: Number(qId), answer, categoryId: catId });
          }
          for (const [qId, checkedItems] of Object.entries(cached.checkbox)) {
            allAnswers.push({ questionId: Number(qId), answer: checkedItems.join(', '), categoryId: catId });
          }
        }
        if (allAnswers.length > 0) {
          promises.push(registerApi.submitSurveyAnswers(res.agencyId, allAnswers));
        }
        await Promise.all(promises);
        await AsyncStorage.multiRemove(['token', 'agencyId']);
      }
      Alert.alert('Thành công', 'Đăng ký đại lý thành công. Vui lòng chờ duyệt.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err.message);
      setStep('categories');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <>
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

      <TouchableOpacity style={styles.btn} onPress={handleNextToCategories} disabled={initLoading}>
        {initLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Tiếp theo</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </>
  );

  const renderCategories = () => {
    const cached = modalCategory ? categoryAnswersCache[modalCategory.id] : undefined;

    return (
      <>
        <Text style={styles.title}>Chọn danh mục quan tâm</Text>
        <Text style={styles.subtitle}>
          Chạm vào danh mục để trả lời khảo sát ({selectedCategoryIds.length}/{categories.length})
        </Text>

        {categories.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="layers-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>Không có danh mục nào</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={({ item }) => {
              const isSelected = selectedCategoryIds.includes(item.id);
              return (
                <View style={styles.gridItem}>
                  <View style={[styles.itemWrapper, isSelected && styles.itemWrapperOpened]}>
                    <CategoryItem
                      name={item.name}
                      imageUrl={item.imageUrl}
                      isActive={isSelected}
                      onPress={() => handleCategoryPress(item)}
                    />
                    {isSelected && (
                      <View style={styles.checkmarkBadge}>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
            keyExtractor={item => String(item.id)}
            numColumns={4}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}

        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>Hoàn tất đăng ký ({selectedCategoryIds.length} danh mục)</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setStep('form')}>
          <Text style={styles.link}>Quay lại</Text>
        </TouchableOpacity>

        <SurveyModal
          visible={modalVisible}
          categoryName={modalCategory?.name || ''}
          questions={modalQuestions}
          initialAnswers={cached?.answers || {}}
          initialCheckboxAnswers={cached?.checkbox || {}}
          onSave={handleModalSave}
          onClose={() => {
            setModalVisible(false);
            setModalCategory(null);
            setModalQuestions([]);
          }}
        />

        {modalLoading && (
          <View style={styles.modalLoading}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={{ marginTop: 12, color: '#6b7280', fontSize: 15 }}>
              Đang tải câu hỏi khảo sát...
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 'form' && renderForm()}
        {step === 'categories' && renderCategories()}
        {step === 'submitting' && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 15 }}>
              Đang xử lý đăng ký...
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 32, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 24, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: -16, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10,
    padding: 14, fontSize: 16, backgroundColor: '#f9fafb',
  },
  btn: { backgroundColor: '#2563eb', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24 },
  disabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { textAlign: 'center', marginTop: 16, color: '#2563eb', fontSize: 14 },

  // Categories grid
  center: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.md,
  },
  grid: {
    paddingVertical: Spacing.sm,
  },
  gridRow: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  gridItem: {
    flex: 1,
    maxWidth: '25%',
  },
  itemWrapper: {
    position: 'relative',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  itemWrapperOpened: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  modalLoading: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
