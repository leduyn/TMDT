import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import type { SurveyQuestion } from '../types';

interface SurveyModalProps {
  visible: boolean;
  categoryName: string;
  questions: SurveyQuestion[];
  initialAnswers: Record<number, string>;
  initialCheckboxAnswers: Record<number, string[]>;
  onSave: (answers: Record<number, string>, checkboxAnswers: Record<number, string[]>) => void;
  onClose: () => void;
}

export function SurveyModal({
  visible, categoryName, questions,
  initialAnswers, initialCheckboxAnswers,
  onSave, onClose,
}: SurveyModalProps) {
  const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers);
  const [checkboxAnswers, setCheckboxAnswers] = useState<Record<number, string[]>>(initialCheckboxAnswers);

  React.useEffect(() => {
    setAnswers(initialAnswers);
    setCheckboxAnswers(initialCheckboxAnswers);
  }, [initialAnswers, initialCheckboxAnswers, visible]);

  const canSave = questions.every(q => {
    if (q.type === 'checkbox') {
      return (checkboxAnswers[q.id] || []).length > 0;
    }
    return (answers[q.id] || '').trim() !== '';
  });

  const handleSave = () => {
    if (!canSave) return;
    onSave(answers, checkboxAnswers);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>{categoryName}</Text>
            <View style={styles.closeBtn} />
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {questions.length === 0 ? (
              <Text style={styles.empty}>Không có câu hỏi khảo sát</Text>
            ) : (
              questions.map((q, idx) => (
                <View key={q.id} style={styles.card}>
                  <Text style={styles.question}>
                    {idx + 1}. {q.question}
                    {q.globalQuestion ? (
                      <Text style={styles.globalBadge}> (Chung)</Text>
                    ) : null}
                  </Text>

                  {q.type === 'text' && (
                    <TextInput
                      style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
                      value={answers[q.id] || ''}
                      onChangeText={v => setAnswers(prev => ({ ...prev, [q.id]: v }))}
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
                            styles.optionRow,
                            answers[q.id] === opt && styles.optionRowSelected,
                          ]}
                          onPress={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        >
                          <View style={[
                            styles.radio,
                            answers[q.id] === opt && styles.radioChecked,
                          ]}>
                            {answers[q.id] === opt && <View style={styles.radioDot} />}
                          </View>
                          <Text style={styles.optionLabel}>{opt}</Text>
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
                              styles.optionRow,
                              checked && styles.optionRowSelected,
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
                            <Text style={styles.optionLabel}>{opt}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Bỏ qua</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Text style={styles.saveText}>Lưu câu trả lời</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
  },
  empty: {
    textAlign: 'center',
    color: '#9ca3af',
    marginVertical: 32,
    fontSize: 15,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  globalBadge: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionRowSelected: {
    backgroundColor: '#eff6ff',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioChecked: {
    borderColor: '#2563eb',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  optionLabel: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
