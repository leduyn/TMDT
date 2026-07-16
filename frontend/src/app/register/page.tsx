'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { agencyApi, surveyApi, SurveyQuestionDTO } from '@/lib/api';
import NotificationModal from '@/components/NotificationModal';
import { HelpCircle, Layers, Check, ChevronRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface AnswerEntry {
  questionId: number;
  answer: string;
  categoryId?: number;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [agencyId, setAgencyId] = useState<number | null>(null);

  // Step 0: registration form
  const [form, setForm] = useState({
    code: '', name: '', phone: '', password: '', confirm: '',
    representativeName: '', taxCode: '', billingAddress: '', shippingAddress: '',
    receiverName: '', receiverPhone: '', nickname: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  // Step 1: categories
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  // Steps 2-3: survey
  const [categoryQuestions, setCategoryQuestions] = useState<{ categoryId: number; categoryName: string; questions: SurveyQuestionDTO[] }[]>([]);
  const [globalQuestions, setGlobalQuestions] = useState<SurveyQuestionDTO[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'info' as any
  });

  const steps = [
    { label: 'Thông tin', icon: '1' },
    { label: 'Danh mục', icon: '2' },
    { label: 'Khảo sát DM', icon: '3' },
    { label: 'Hoàn tất', icon: '4' },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.phone || !form.password) {
      setModal({ isOpen: true, title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin bắt buộc.', type: 'error' });
      return;
    }
    if (form.password !== form.confirm) {
      setModal({ isOpen: true, title: 'Lỗi mật khẩu', message: 'Mật khẩu xác nhận không khớp.', type: 'error' });
      return;
    }
    if (form.password.length < 6) {
      setModal({ isOpen: true, title: 'Lỗi bảo mật', message: 'Mật khẩu phải có ít nhất 6 ký tự.', type: 'error' });
      return;
    }
    setRegisterLoading(true);
    try {
      const result = await agencyApi.register({
        code: form.code, name: form.name, phone: form.phone, password: form.password,
        representativeName: form.representativeName || undefined,
        taxCode: form.taxCode || undefined,
        billingAddress: form.billingAddress || undefined,
        shippingAddress: form.shippingAddress || undefined,
        receiverName: form.receiverName || undefined,
        receiverPhone: form.receiverPhone || undefined,
        nickname: form.nickname || undefined
      });
      if (result && result.id) {
        setAgencyId(result.id);
        setStep(1);
        loadCategories();
      } else {
        setModal({ isOpen: true, title: 'Lỗi', message: 'Không nhận được ID đại lý.', type: 'error' });
      }
    } catch (err: unknown) {
      setModal({ isOpen: true, title: 'Lỗi đăng ký', message: err instanceof Error ? err.message : 'Đăng ký thất bại.', type: 'error' });
    } finally {
      setRegisterLoading(false);
    }
  };

  const loadCategories = async () => {
    setCatLoading(true);
    try {
      const levelRes = await fetch(`${API_BASE}/api/config/registration-category-level`);
      if (levelRes.ok) {
        const level = await levelRes.json();
        const catRes = await fetch(`${API_BASE}/api/categories/level/${level}`);
        if (catRes.ok) {
          setCategories(await catRes.json());
        }
      }
    } catch {
      // ignore
    } finally {
      setCatLoading(false);
    }
  };

  const handleCatToggle = (id: number) => {
    setSelectedCatIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleContinueStep1 = async () => {
    if (selectedCatIds.length === 0) {
      setModal({ isOpen: true, title: 'Chọn danh mục', message: 'Vui lòng chọn ít nhất một danh mục.', type: 'error' });
      return;
    }
    if (!agencyId) return;
    setCatLoading(true);
    try {
      await agencyApi.saveCategories(agencyId, selectedCatIds, 'REGISTRATION');
      setStep(2);
      loadSurveyQuestions();
    } catch {
      setModal({ isOpen: true, title: 'Lỗi', message: 'Không thể lưu danh mục.', type: 'error' });
    } finally {
      setCatLoading(false);
    }
  };

  const loadSurveyQuestions = async () => {
    setSurveyLoading(true);
    try {
      // Load category-specific questions for each selected category
      const catQs = await Promise.all(
        selectedCatIds.map(async (cid) => {
          const qs = await surveyApi.getActiveQuestions('OK', cid);
          const cat = categories.find(c => c.id === cid);
          return { categoryId: cid, categoryName: cat?.name || `#${cid}`, questions: qs.filter(q => !q.globalQuestion) };
        })
      );
      setCategoryQuestions(catQs.filter(cq => cq.questions.length > 0));

      // Load global questions
      const allActive = await surveyApi.getActiveQuestions('OK');
      setGlobalQuestions(allActive.filter(q => q.globalQuestion));
    } catch {
      // ignore
    } finally {
      setSurveyLoading(false);
    }
  };

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitSurvey = async () => {
    if (!agencyId) return;
    setSubmitting(true);
    try {
      const allAnswers: AnswerEntry[] = [];
      for (const cq of categoryQuestions) {
        for (const q of cq.questions) {
          const key = `${cq.categoryId}_${q.id}`;
          if (answers[key]?.trim()) {
            allAnswers.push({ questionId: q.id, answer: answers[key], categoryId: cq.categoryId });
          }
        }
      }
      for (const q of globalQuestions) {
        const key = `global_${q.id}`;
        if (answers[key]?.trim()) {
          allAnswers.push({ questionId: q.id, answer: answers[key] });
        }
      }
      if (allAnswers.length > 0) {
        await surveyApi.submitAnswers(agencyId, allAnswers);
      }
      setModal({
        isOpen: true, title: 'Thành công',
        message: 'Đăng ký hoàn tất! Vui lòng chờ Admin duyệt. Đang chuyển hướng...',
        type: 'success'
      });
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setModal({ isOpen: true, title: 'Lỗi', message: 'Không thể gửi câu trả lời khảo sát.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24,
      background: 'radial-gradient(ellipse at bottom right, #1a1a3e 0%, var(--bg-primary) 60%)',
    }} className="bg-grid">
      <div style={{
        position: 'fixed', top: '10%', right: '15%',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="glass-card fade-in-up" style={{ width: '100%', maxWidth: 640, padding: 40 }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700,
                background: i <= step ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.08)',
                color: i <= step ? 'white' : 'var(--text-muted)',
                border: i <= step ? 'none' : '1.5px solid var(--border)',
                transition: 'all 0.3s',
              }}>
                {i < step ? <Check size={16} /> : s.icon}
              </div>
              <span style={{ fontSize: '0.78rem', color: i <= step ? 'var(--text)' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400 }}>
                {s.label}
              </span>
              {i < steps.length - 1 && <ChevronRight size={14} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />}
            </div>
          ))}
        </div>

        {/* Step 0: Register Form */}
        {step === 0 && (
          <form onSubmit={handleRegister}>
            <h3 style={{ fontSize: '1rem', margin: '0 0 12px 0', color: 'var(--accent)' }}>Thông tin tài khoản</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-code">Mã Đại lý</label>
                <input id="reg-code" className="input-field" type="text" placeholder="VD: DL001" value={form.code} onChange={update('code')} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Tên Đại lý</label>
                <input id="reg-name" className="input-field" type="text" placeholder="Tên cửa hàng" value={form.name} onChange={update('name')} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Số điện thoại (tên đăng nhập)</label>
              <input id="reg-phone" className="input-field" type="text" placeholder="Số điện thoại" value={form.phone} onChange={update('phone')} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Mật khẩu</label>
                <input id="reg-password" className="input-field" type="password" placeholder="Ít nhất 6 ký tự" value={form.password} onChange={update('password')} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Xác nhận</label>
                <input id="reg-confirm" className="input-field" type="password" placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={update('confirm')} required />
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', margin: '20px 0 12px 0', color: 'var(--accent)' }}>Thông tin chi tiết</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-rep">Người đại diện</label>
                <input id="reg-rep" className="input-field" type="text" placeholder="Tên người đại diện" value={form.representativeName} onChange={update('representativeName')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-tax">Mã số thuế</label>
                <input id="reg-tax" className="input-field" type="text" placeholder="MST doanh nghiệp" value={form.taxCode} onChange={update('taxCode')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-ship">Địa chỉ nhận hàng</label>
              <input id="reg-ship" className="input-field" type="text" placeholder="Địa chỉ giao hàng" value={form.shippingAddress} onChange={update('shippingAddress')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-bill">Địa chỉ xuất hóa đơn</label>
              <input id="reg-bill" className="input-field" type="text" placeholder="Địa chỉ trên hóa đơn" value={form.billingAddress} onChange={update('billingAddress')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-rec-name">Người nhận hàng</label>
                <input id="reg-rec-name" className="input-field" type="text" placeholder="Tên người nhận" value={form.receiverName} onChange={update('receiverName')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-rec-phone">SĐT người nhận</label>
                <input id="reg-rec-phone" className="input-field" type="text" placeholder="SĐT người nhận" value={form.receiverPhone} onChange={update('receiverPhone')} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={registerLoading} style={{ marginTop: 24, width: '100%' }}>
              {registerLoading ? <span className="spinner" /> : null}
              {registerLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>
        )}

        {/* Step 1: Select Categories */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1rem', margin: '0 0 6px', color: 'var(--accent-light)' }}>
              <Layers size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Mở danh mục
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 16px' }}>
              Chọn danh mục sản phẩm bạn muốn kinh doanh
            </p>
            {catLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            ) : categories.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Không có danh mục nào</p>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label
                    onClick={() => {
                      const all = selectedCatIds.length === categories.length;
                      setSelectedCatIds(all ? [] : categories.map(c => c.id));
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                      padding: '6px 14px', borderRadius: 8, fontSize: '0.85rem',
                      background: selectedCatIds.length === categories.length ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                      border: selectedCatIds.length === categories.length ? '2px solid #6366f1' : '1.5px solid var(--border)',
                      fontWeight: selectedCatIds.length === categories.length ? 600 : 400,
                    }}
                  >
                    <input type="checkbox" checked={selectedCatIds.length === categories.length} readOnly style={{ width: 16, height: 16, cursor: 'pointer' }} />
                    Tất cả danh mục
                  </label>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {categories.map(cat => {
                    const sel = selectedCatIds.includes(cat.id);
                    return (
                      <label key={cat.id} onClick={() => handleCatToggle(cat.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                        padding: '8px 16px', borderRadius: 10, fontSize: '0.9rem',
                        background: sel ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                        border: sel ? '2px solid #6366f1' : '1.5px solid var(--border)',
                        fontWeight: sel ? 600 : 400, transition: 'all 0.15s',
                      }}>
                        <input type="checkbox" checked={sel} readOnly style={{ width: 16, height: 16, cursor: 'pointer' }} />
                        {cat.name}
                      </label>
                    );
                  })}
                </div>
                <button onClick={handleContinueStep1} className="btn-primary" disabled={catLoading || selectedCatIds.length === 0} style={{ width: '100%' }}>
                  {catLoading ? <span className="spinner" /> : null}
                  {catLoading ? 'Đang lưu...' : `Tiếp tục (${selectedCatIds.length} danh mục)`}
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 2: Category-specific Survey */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1rem', margin: '0 0 6px', color: '#f59e0b' }}>
              <HelpCircle size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Khảo sát danh mục
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 16px' }}>
              Trả lời câu hỏi cho từng danh mục đã chọn
            </p>
            {surveyLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                {categoryQuestions.map(cq => (
                  <div key={cq.categoryId} style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600, color: 'var(--accent-light)' }}>
                      <Layers size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />{cq.categoryName}
                    </h4>
                    {cq.questions.map(q => {
                      const key = `${cq.categoryId}_${q.id}`;
                      return (
                        <div key={q.id} style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', fontWeight: 500 }}>
                            {q.question}
                            <span style={{
                              marginLeft: 8, padding: '1px 6px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 500,
                              background: q.type === 'text' ? 'rgba(99,102,241,0.12)' : 'rgba(245,158,11,0.12)',
                              color: q.type === 'text' ? '#818cf8' : '#f59e0b',
                            }}>{q.type}</span>
                          </label>
                          {q.type === 'text' ? (
                            <textarea
                              value={answers[key] || ''}
                              onChange={e => handleAnswerChange(key, e.target.value)}
                              rows={2} placeholder="Nhập câu trả lời..."
                              style={{
                                width: '100%', padding: '8px 12px', borderRadius: 8,
                                border: '1.5px solid var(--border)', background: 'var(--surface)',
                                color: 'var(--text)', fontSize: '0.9rem', outline: 'none', resize: 'vertical',
                                fontFamily: 'inherit',
                              }}
                              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                            />
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 4 }}>
                              {(q.options || '').split('\n').filter(Boolean).map(opt => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
                                  <input
                                    type={q.type === 'radio' ? 'radio' : 'checkbox'}
                                    name={`q_${key}`}
                                    value={opt}
                                    checked={q.type === 'radio'
                                      ? answers[key] === opt
                                      : (answers[key] || '').split(',').includes(opt)}
                                    onChange={() => {
                                      if (q.type === 'radio') {
                                        handleAnswerChange(key, opt);
                                      } else {
                                        const current = (answers[key] || '').split(',').filter(Boolean);
                                        const next = current.includes(opt)
                                          ? current.filter(x => x !== opt)
                                          : [...current, opt];
                                        handleAnswerChange(key, next.join(','));
                                      }
                                    }}
                                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                {categoryQuestions.length === 0 && !surveyLoading && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                    Không có câu hỏi khảo sát cho danh mục này
                  </p>
                )}
              </div>
            )}
            <button
              onClick={() => setStep(3)}
              className="btn-primary"
              disabled={surveyLoading}
              style={{ width: '100%' }}
            >
              Tiếp tục
            </button>
          </div>
        )}

        {/* Step 3: Global Survey Questions */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1rem', margin: '0 0 6px', color: '#f59e0b' }}>
              <HelpCircle size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Trả lời câu hỏi khảo sát
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 16px' }}>
              Hoàn tất các câu hỏi chung để kết thúc đăng ký
            </p>
            {surveyLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                {globalQuestions.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Không có câu hỏi chung</p>
                ) : (
                  globalQuestions.map(q => {
                    const key = `global_${q.id}`;
                    return (
                      <div key={q.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500 }}>
                          {q.question}
                          <span style={{
                            marginLeft: 8, padding: '1px 6px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 500,
                            background: q.type === 'text' ? 'rgba(99,102,241,0.12)' : 'rgba(245,158,11,0.12)',
                            color: q.type === 'text' ? '#818cf8' : '#f59e0b',
                          }}>{q.type}</span>
                        </label>
                        {q.type === 'text' ? (
                          <textarea
                            value={answers[key] || ''}
                            onChange={e => handleAnswerChange(key, e.target.value)}
                            rows={2} placeholder="Nhập câu trả lời..."
                            style={{
                              width: '100%', padding: '8px 12px', borderRadius: 8,
                              border: '1.5px solid var(--border)', background: 'var(--surface)',
                              color: 'var(--text)', fontSize: '0.9rem', outline: 'none', resize: 'vertical',
                              fontFamily: 'inherit',
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                          />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 4 }}>
                            {(q.options || '').split('\n').filter(Boolean).map(opt => (
                              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                  type={q.type === 'radio' ? 'radio' : 'checkbox'}
                                  name={`q_${key}`}
                                  value={opt}
                                  checked={q.type === 'radio'
                                    ? answers[key] === opt
                                    : (answers[key] || '').split(',').includes(opt)}
                                  onChange={() => {
                                    if (q.type === 'radio') {
                                      handleAnswerChange(key, opt);
                                    } else {
                                      const current = (answers[key] || '').split(',').filter(Boolean);
                                      const next = current.includes(opt)
                                        ? current.filter(x => x !== opt)
                                        : [...current, opt];
                                      handleAnswerChange(key, next.join(','));
                                    }
                                  }}
                                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
            <button
              onClick={handleSubmitSurvey}
              className="btn-primary"
              disabled={submitting || surveyLoading}
              style={{ width: '100%' }}
            >
              {submitting ? <span className="spinner" /> : null}
              {submitting ? 'Đang hoàn tất...' : 'Hoàn tất đăng ký'}
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: 'var(--accent-light)', fontWeight: 600, textDecoration: 'none' }}>
            Đăng nhập
          </Link>
        </p>
      </div>

      <NotificationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </main>
  );
}
