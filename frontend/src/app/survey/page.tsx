'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, Check, X, GripVertical } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface SurveyQuestion {
  id?: number;
  question: string;
  type: string;
  options: string;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
}

const emptyQuestion = (): SurveyQuestion => ({
  question: '',
  type: 'text',
  options: '',
  active: true,
  sortOrder: 0,
});

export default function SurveyPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SurveyQuestion | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (!isLoading && user && !user.roles.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r))) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/survey/questions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) fetchQuestions();
  }, [user, token, fetchQuestions]);

  const handleSave = async () => {
    if (!editing || !editing.question.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const body = { ...editing };
      const isUpdate = !!body.id;
      const url = isUpdate
        ? `${API_BASE}/api/survey/questions/${body.id}`
        : `${API_BASE}/api/survey/questions`;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setEditing(null);
        await fetchQuestions();
      } else {
        const err = await res.text();
        setError(err || 'Lỗi khi lưu câu hỏi');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa câu hỏi này?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/survey/questions/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        await fetchQuestions();
      }
    } catch {
      setError('Không thể xóa câu hỏi');
    }
  };

  const toggleActive = async (q: SurveyQuestion) => {
    try {
      const body = { ...q, active: !q.active };
      const res = await fetch(`${API_BASE}/api/survey/questions/${q.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchQuestions();
      }
    } catch {
      setError('Không thể cập nhật trạng thái');
    }
  };

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!user.roles.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r))) return null;

  return (
    <>
      <Navbar />
      <Main>
        <div className="fade-in-up" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, boxShadow: '0 8px 24px rgba(6,182,212,0.4)',
              }}>📋</div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>
                  Quản lý câu hỏi khảo sát
                </h1>
                <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Tạo và quản lý các câu hỏi khảo sát dành cho đại lý
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditing(emptyQuestion())}
              style={{
                padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontWeight: 600, fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
              }}
            >
              <Plus size={18} /> Thêm câu hỏi
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            marginBottom: 16, padding: '12px 16px', borderRadius: 8,
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', fontSize: '0.9rem', fontWeight: 500,
          }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>✕</button>
          </div>
        )}

        {/* Edit/Create Form */}
        {editing && (
          <div className="glass-card fade-in-up" style={{ padding: 28, marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem', fontWeight: 600 }}>
              {editing.id ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
            </h3>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Nội dung câu hỏi
              </label>
              <textarea
                value={editing.question}
                onChange={e => setEditing({ ...editing, question: e.target.value })}
                rows={3}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1.5px solid var(--border)', background: 'var(--surface)',
                  color: 'var(--text)', fontSize: '0.95rem', outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 150 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Loại câu trả lời
                </label>
                <select
                  value={editing.type}
                  onChange={e => setEditing({ ...editing, type: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1.5px solid var(--border)', background: 'var(--surface)',
                    color: 'var(--text)', fontSize: '0.95rem', outline: 'none',
                  }}
                >
                  <option value="text">Text (nhập tự do)</option>
                  <option value="radio">Radio (chọn 1)</option>
                  <option value="checkbox">Checkbox (chọn nhiều)</option>
                </select>
              </div>

              <div style={{ flex: 1, minWidth: 100 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Thứ tự
                </label>
                <input
                  type="number"
                  min={0}
                  value={editing.sortOrder}
                  onChange={e => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1.5px solid var(--border)', background: 'var(--surface)',
                    color: 'var(--text)', fontSize: '0.95rem', outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editing.active}
                    onChange={e => setEditing({ ...editing, active: e.target.checked })}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Kích hoạt</span>
                </label>
              </div>
            </div>

            {(editing.type === 'radio' || editing.type === 'checkbox') && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Danh sách lựa chọn (mỗi dòng một lựa chọn)
                </label>
                <textarea
                  value={editing.options}
                  onChange={e => setEditing({ ...editing, options: e.target.value })}
                  rows={4}
                  placeholder="Lựa chọn 1&#10;Lựa chọn 2&#10;Lựa chọn 3"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1.5px solid var(--border)', background: 'var(--surface)',
                    color: 'var(--text)', fontSize: '0.95rem', outline: 'none', resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '10px 24px', borderRadius: 8, cursor: 'pointer',
                  border: 'none',
                  background: saving ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', fontWeight: 600, fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: saving ? 'none' : '0 4px 14px rgba(99,102,241,0.4)',
                }}
              >
                {saving ? '⏳ Đang lưu...' : '💾 Lưu'}
              </button>
              <button
                onClick={() => { setEditing(null); setError(null); }}
                style={{
                  padding: '10px 24px', borderRadius: 8, cursor: 'pointer',
                  border: '1.5px solid var(--border)', background: 'var(--surface)',
                  color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem',
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="glass-card fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : questions.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p>Chưa có câu hỏi khảo sát nào.</p>
              <p style={{ fontSize: '0.85rem' }}>Nhấn "Thêm câu hỏi" để tạo câu hỏi đầu tiên.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: 50 }}>TT</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Câu hỏi</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: 100 }}>Loại</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: 90 }}>Kích hoạt</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: 120 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {questions
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    .map((q, idx) => (
                      <tr key={q.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{idx + 1}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 500, marginBottom: 2 }}>{q.question}</div>
                          {(q.type === 'radio' || q.type === 'checkbox') && q.options && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                              Options: {q.options.split('\n').join(', ')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 500,
                            background: q.type === 'text' ? 'rgba(99,102,241,0.12)' : q.type === 'radio' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                            color: q.type === 'text' ? '#818cf8' : q.type === 'radio' ? '#f59e0b' : '#10b981',
                          }}>
                            {q.type === 'text' ? 'Text' : q.type === 'radio' ? 'Radio' : 'Checkbox'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => toggleActive(q)}
                            style={{
                              padding: '4px 12px', borderRadius: 12, cursor: 'pointer',
                              border: 'none', fontSize: '0.78rem', fontWeight: 500,
                              background: q.active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                              color: q.active ? '#10b981' : '#ef4444',
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}
                          >
                            {q.active ? <Check size={14} /> : <X size={14} />}
                            {q.active ? 'Bật' : 'Tắt'}
                          </button>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <button
                              onClick={() => setEditing({ ...q })}
                              title="Sửa"
                              style={{
                                padding: 6, borderRadius: 6, cursor: 'pointer',
                                border: '1px solid var(--border)', background: 'var(--surface)',
                                color: 'var(--text-secondary)', display: 'flex',
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => q.id && handleDelete(q.id)}
                              title="Xóa"
                              style={{
                                padding: 6, borderRadius: 6, cursor: 'pointer',
                                border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
                                color: '#ef4444', display: 'flex',
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Main>
    </>
  );
}
