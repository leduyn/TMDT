import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { registerApi } from '../../api/auth';
import type { CategoryDTO, SurveyQuestion } from '../../types';

type Step = 'form' | 'categories' | 'survey' | 'submitting';

export function RegisterScreen({ navigation }: any) {
  const { registerAgency } = useAuth();
  const [form, setForm] = useState({
    customerCode: '', companyName: '', email: '', phone: '',
    representativeName: '', taxCode: '', billingAddress: '',
    shippingAddress: '', referralCode: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  // Multi-step state
  const [step, setStep] = useState<Step>('form');
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, string>>({});
  const [checkboxAnswers, setCheckboxAnswers] = useState<Record<number, string[]>>({});
  const [initLoading, setInitLoading] = useState(false);

  // Fetch categories and survey questions when entering form step
  useEffect(() => {
    if (step === 'form' && categories.length === 0) {
      fetchRegistrationData();
    }
  }, [step]);

  const fetchRegistrationData = async () => {
    setInitLoading(true);
    try {
      const [level, questions] = await Promise.all([
        registerApi.getCategoryLevel(),
        registerApi.getActiveSurveyQuestions(),
      ]);
      setSurveyQuestions(questions || []);
      if (level != null) {
        const cats = await registerApi.getCategoriesByLevel(level);
        setCategories(cats || []);
      }
    } catch (err: any) {
      // Silently fail - backend might not have all data yet
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

  const handleNextToSurvey = () => {
    if (selectedCategoryIds.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một danh mục');
      return;
    }
    setStep('survey');
  };

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (surveyQuestions.length > 0) {
      const unanswered = surveyQuestions.filter(q => {
        if (q.type === 'checkbox') {
          const checked = checkboxAnswers[q.id] || [];
          return checked.length === 0;
        }
        return !surveyAnswers[q.id] || surveyAnswers[q.id].trim() === '';
      });
      if (unanswered.length > 0) {
        Alert.alert('Lỗi', 'Vui lòng trả lời tất cả câu hỏi khảo sát');
        return;
      }
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
        if (surveyQuestions.length > 0) {
          const answers = surveyQuestions.map(q => {
            let answer: string;
            if (q.type === 'checkbox') {
              answer = (checkboxAnswers[q.id] || []).join(', ');
            } else {
              answer = surveyAnswers[q.id] || '';
            }
            return { questionId: q.id, answer };
          });
          promises.push(registerApi.submitSurveyAnswers(res.agencyId, answers));
        }
        await Promise.all(promises);
        await AsyncStorage.multiRemove(['token', 'agencyId']);
      }
      Alert.alert('Thành công', 'Đăng ký đại lý thành công. Vui lòng chờ duyệt.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err.message);
      setStep('survey');
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

  const renderCategories = () => (
    <>
      <Text style={styles.title}>Chọn danh mục quan tâm</Text>
      <Text style={styles.subtitle}>Vui lòng chọn các danh mục bạn muốn kinh doanh</Text>

      {categories.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#9ca3af', marginVertical: 32 }}>
          Không có danh mục nào
        </Text>
      ) : (
        <View style={{ marginVertical: 16 }}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.checkboxRow,
                selectedCategoryIds.includes(cat.id) && styles.checkboxRowSelected,
              ]}
              onPress={() => toggleCategory(cat.id)}
            >
              <View style={[
                styles.checkbox,
                selectedCategoryIds.includes(cat.id) && styles.checkboxChecked,
              ]}>
                {selectedCategoryIds.includes(cat.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleNextToSurvey}>
        <Text style={styles.btnText}>Tiếp theo ({selectedCategoryIds.length} danh mục)</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setStep('form')}>
        <Text style={styles.link}>Quay lại</Text>
      </TouchableOpacity>
    </>
  );

  const renderSurvey = () => (
    <>
      <Text style={styles.title}>Khảo sát</Text>
      <Text style={styles.subtitle}>Vui lòng trả lời các câu hỏi sau</Text>

      {surveyQuestions.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#9ca3af', marginVertical: 32 }}>
          Không có câu hỏi khảo sát
        </Text>
      ) : (
        <View style={{ marginVertical: 16 }}>
          {surveyQuestions.map((q, idx) => (
            <View key={q.id} style={styles.surveyCard}>
              <Text style={styles.surveyQuestion}>
                {idx + 1}. {q.question}
              </Text>
              {q.type === 'text' && (
                <TextInput
                  style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
                  value={surveyAnswers[q.id] || ''}
                  onChangeText={v => setSurveyAnswers(prev => ({ ...prev, [q.id]: v }))}
                  placeholder="Nhập câu trả lời..."
                  multiline
                />
              )}
              {q.type === 'radio' && (
                <View style={{ marginTop: 8 }}>
                  {(q.options || '').split('\n').filter(Boolean).map((opt, oi) => (
                    <TouchableOpacity
                      key={oi}
                      style={[
                        styles.radioRow,
                        surveyAnswers[q.id] === opt && styles.radioRowSelected,
                      ]}
                      onPress={() => setSurveyAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    >
                      <View style={[
                        styles.radio,
                        surveyAnswers[q.id] === opt && styles.radioChecked,
                      ]}>
                        {surveyAnswers[q.id] === opt && (
                          <View style={styles.radioDot} />
                        )}
                      </View>
                      <Text style={styles.radioLabel}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {q.type === 'checkbox' && (
                <View style={{ marginTop: 8 }}>
                  {(q.options || '').split('\n').filter(Boolean).map((opt, oi) => {
                    const checked = (checkboxAnswers[q.id] || []).includes(opt);
                    return (
                      <TouchableOpacity
                        key={oi}
                        style={[
                          styles.checkboxRow,
                          checked && styles.checkboxRowSelected,
                        ]}
                        onPress={() => {
                          setCheckboxAnswers(prev => {
                            const current = prev[q.id] || [];
                            return {
                              ...prev,
                              [q.id]: current.includes(opt)
                                ? current.filter(c => c !== opt)
                                : [...current, opt],
                            };
                          });
                        }}
                      >
                        <View style={[
                          styles.checkbox,
                          checked && styles.checkboxChecked,
                        ]}>
                          {checked && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.btn, loading && styles.disabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Hoàn tất đăng ký</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setStep('categories')}>
        <Text style={styles.link}>Quay lại</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 'form' && renderForm()}
        {step === 'categories' && renderCategories()}
        {step === 'survey' && renderSurvey()}
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

  // Checkbox
  checkboxRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb',
  },
  checkboxRowSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  checkboxChecked: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  checkboxLabel: { fontSize: 16, color: '#374151', flex: 1 },

  // Radio
  radioRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 8, marginBottom: 4,
  },
  radioRowSelected: { backgroundColor: '#eff6ff' },
  radio: {
    width: 22, height: 22, borderRadius: 12, borderWidth: 2, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  radioChecked: { borderColor: '#2563eb' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563eb' },
  radioLabel: { fontSize: 15, color: '#374151', flex: 1 },

  // Survey card
  surveyCard: {
    backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  surveyQuestion: { fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
});
