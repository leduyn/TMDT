'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { retailTrendApi, RetailTrendConfig } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function SettingsPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  const [discountDays, setDiscountDays] = useState<number>(7);
  const [inputDays, setInputDays] = useState<string>('7');
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Retail trend config state
  const [trendConfig, setTrendConfig] = useState<RetailTrendConfig>({
    increaseLabel: 'Tăng thêm',
    increaseColor: '#ef4444',
    decreaseLabel: 'Giảm đi',
    decreaseColor: '#10b981',
    neutralLabel: 'Giữ nguyên',
    neutralColor: '#94a3b8',
  });
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendSaving, setTrendSaving] = useState(false);
  const [trendMessage, setTrendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not COMPANY role
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (!isLoading && user && !user.roles.includes('ROLE_COMPANY')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Load current config
  const loadConfig = useCallback(async () => {
    try {
      setLoadingConfig(true);
      const res = await fetch(`${API_BASE}/api/config/discount-max-days`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const days: number = await res.json();
        setDiscountDays(days);
        setInputDays(String(days));
      }
    } catch {
      // silently fail - backend might be starting
    } finally {
      setLoadingConfig(false);
    }
  }, [token]);

  // Load retail trend config
  const loadTrendConfig = useCallback(async () => {
    try {
      setTrendLoading(true);
      const cfg = await retailTrendApi.get();
      setTrendConfig(cfg);
    } catch {
      // use defaults
    } finally {
      setTrendLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && token) loadConfig();
  }, [user, token, loadConfig]);

  useEffect(() => {
    if (user && token) loadTrendConfig();
  }, [user, token, loadTrendConfig]);

  const handleSave = async () => {
    const days = parseInt(inputDays, 10);
    if (isNaN(days) || days < 1 || days > 365) {
      setMessage({ type: 'error', text: 'Số ngày phải nằm trong khoảng từ 1 đến 365.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/config/discount-max-days`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ days }),
      });

      if (res.ok) {
        setDiscountDays(days);
        setMessage({ type: 'success', text: `✅ Đã cập nhật: hiển thị giá cũ trong ${days} ngày gần nhất.` });
      } else {
        const err = await res.text();
        setMessage({ type: 'error', text: `❌ Lỗi: ${err || res.statusText}` });
      }
    } catch (e) {
      setMessage({ type: 'error', text: '❌ Không thể kết nối đến máy chủ.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTrend = async () => {
    setTrendSaving(true);
    setTrendMessage(null);
    try {
      await retailTrendApi.update(trendConfig);
      setTrendMessage({ type: 'success', text: '✅ Đã cập nhật cấu hình xu hướng giá bán lẻ.' });
    } catch (e: any) {
      setTrendMessage({ type: 'error', text: `❌ Lỗi: ${e.message || 'Không thể lưu'}` });
    } finally {
      setTrendSaving(false);
    }
  };

  const presets = [3, 7, 14, 30, 60, 90];

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 48, height: 48,
          border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!user.roles.includes('ROLE_COMPANY')) return null;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div className="fade-in-up" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            }}>⚙️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>
                Cài đặt hệ thống
              </h1>
              <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Cấu hình hiển thị giá và các tham số hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Discount Days Card */}
        <div className="glass-card fade-in-up" style={{ padding: 32, marginBottom: 24, animationDelay: '0.05s' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, border: '1px solid rgba(245,158,11,0.3)', flexShrink: 0,
            }}>🏷️</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Thời gian hiển thị giá cũ / giá mới
              </h2>
              <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Khi giá sản phẩm thay đổi, hệ thống sẽ hiển thị <strong>giá cũ gạch ngang</strong> kèm theo{' '}
                <strong>phần trăm thay đổi</strong> trong vòng <strong style={{ color: 'var(--accent)' }}>N ngày</strong> kể từ lúc thay đổi.
                Sau khoảng thời gian này, giá cũ sẽ không còn hiển thị nữa.
              </p>
            </div>
          </div>

          {/* Current value display */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
            padding: '16px 20px',
            background: 'rgba(99,102,241,0.08)', borderRadius: 10,
            border: '1px solid rgba(99,102,241,0.2)',
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Giá trị hiện tại:</span>
            {loadingConfig ? (
              <div style={{
                width: 20, height: 20,
                border: '2px solid var(--border)', borderTopColor: 'var(--accent)',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
            ) : (
              <span style={{
                fontSize: '1.4rem', fontWeight: 700, color: '#6366f1',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {discountDays}
                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>ngày</span>
              </span>
            )}
          </div>

          {/* Preset buttons */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Chọn nhanh
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setInputDays(String(p))}
                  style={{
                    padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
                    border: inputDays === String(p)
                      ? '1.5px solid var(--accent)'
                      : '1.5px solid var(--border)',
                    background: inputDays === String(p)
                      ? 'rgba(99,102,241,0.15)'
                      : 'var(--surface)',
                    color: inputDays === String(p) ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: inputDays === String(p) ? 600 : 400,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p} ngày
                </button>
              ))}
            </div>
          </div>

          {/* Input + Save */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block', marginBottom: 8,
                fontSize: '0.82rem', fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Nhập số ngày tùy chỉnh
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <input
                  id="discount-days-input"
                  type="number"
                  min={1}
                  max={365}
                  value={inputDays}
                  onChange={e => setInputDays(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px 0 0 8px',
                    border: '1.5px solid var(--border)',
                    borderRight: 'none',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
                <span style={{
                  padding: '10px 14px',
                  border: '1.5px solid var(--border)',
                  borderLeft: 'none', borderRadius: '0 8px 8px 0',
                  background: 'rgba(0,0,0,0.15)',
                  color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap',
                }}>
                  ngày
                </span>
              </div>
            </div>
            <button
              id="save-discount-days-btn"
              onClick={handleSave}
              disabled={saving || loadingConfig}
              style={{
                padding: '10px 28px', borderRadius: 8, cursor: 'pointer',
                border: 'none',
                background: saving
                  ? 'rgba(99,102,241,0.5)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontWeight: 600, fontSize: '0.95rem',
                boxShadow: saving ? 'none' : '0 4px 14px rgba(99,102,241,0.4)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {saving ? '⏳ Đang lưu...' : '💾 Lưu cài đặt'}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 8,
              background: message.type === 'success'
                ? 'rgba(16,185,129,0.12)'
                : 'rgba(239,68,68,0.12)',
              border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: message.type === 'success' ? '#10b981' : '#ef4444',
              fontSize: '0.9rem', fontWeight: 500,
              animation: 'fadeIn 0.3s ease',
            }}>
              {message.text}
            </div>
          )}
        </div>

        {/* Retail Trend Config Card */}
        <div className="glass-card fade-in-up" style={{ padding: 32, marginBottom: 24, animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, border: '1px solid rgba(99,102,241,0.3)', flexShrink: 0,
            }}>📈</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Hiển thị xu hướng giá bán lẻ
              </h2>
              <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Cấu hình nhãn và màu sắc hiển thị xu hướng giá khi áp dụng chính sách bán lẻ.
                Hiển thị trong phần <strong>Xem trước</strong> của form tạo chính sách bán lẻ.
              </p>
            </div>
          </div>

          {trendLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <div style={{
                width: 24, height: 24,
                border: '2px solid var(--border)', borderTopColor: 'var(--accent)',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : (
            <>
              {/* Increase */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Khi giá tăng
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: trendConfig.increaseColor, flexShrink: 0 }} />
                  <input
                    type="text"
                    value={trendConfig.increaseLabel}
                    onChange={e => setTrendConfig({ ...trendConfig, increaseLabel: e.target.value })}
                    placeholder="Tăng thêm"
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 8,
                      border: '1.5px solid var(--border)', background: 'var(--surface)',
                      color: 'var(--text)', fontSize: '0.95rem', outline: 'none',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                  <input
                    type="color"
                    value={trendConfig.increaseColor}
                    onChange={e => setTrendConfig({ ...trendConfig, increaseColor: e.target.value })}
                    style={{ width: 44, height: 44, borderRadius: 8, cursor: 'pointer', border: '1.5px solid var(--border)', background: 'none', padding: 2 }}
                  />
                  <span style={{
                    padding: '8px 14px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600,
                    color: trendConfig.increaseColor, background: `${trendConfig.increaseColor}15`,
                    border: `1px solid ${trendConfig.increaseColor}40`, whiteSpace: 'nowrap',
                  }}>
                    {trendConfig.increaseLabel || 'Tăng thêm'}
                  </span>
                </div>
              </div>

              {/* Decrease */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Khi giá giảm
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: trendConfig.decreaseColor, flexShrink: 0 }} />
                  <input
                    type="text"
                    value={trendConfig.decreaseLabel}
                    onChange={e => setTrendConfig({ ...trendConfig, decreaseLabel: e.target.value })}
                    placeholder="Giảm đi"
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 8,
                      border: '1.5px solid var(--border)', background: 'var(--surface)',
                      color: 'var(--text)', fontSize: '0.95rem', outline: 'none',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                  <input
                    type="color"
                    value={trendConfig.decreaseColor}
                    onChange={e => setTrendConfig({ ...trendConfig, decreaseColor: e.target.value })}
                    style={{ width: 44, height: 44, borderRadius: 8, cursor: 'pointer', border: '1.5px solid var(--border)', background: 'none', padding: 2 }}
                  />
                  <span style={{
                    padding: '8px 14px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600,
                    color: trendConfig.decreaseColor, background: `${trendConfig.decreaseColor}15`,
                    border: `1px solid ${trendConfig.decreaseColor}40`, whiteSpace: 'nowrap',
                  }}>
                    {trendConfig.decreaseLabel || 'Giảm đi'}
                  </span>
                </div>
              </div>

              {/* Neutral */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Khi giá không đổi
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: trendConfig.neutralColor, flexShrink: 0 }} />
                  <input
                    type="text"
                    value={trendConfig.neutralLabel}
                    onChange={e => setTrendConfig({ ...trendConfig, neutralLabel: e.target.value })}
                    placeholder="Giữ nguyên"
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 8,
                      border: '1.5px solid var(--border)', background: 'var(--surface)',
                      color: 'var(--text)', fontSize: '0.95rem', outline: 'none',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                  <input
                    type="color"
                    value={trendConfig.neutralColor}
                    onChange={e => setTrendConfig({ ...trendConfig, neutralColor: e.target.value })}
                    style={{ width: 44, height: 44, borderRadius: 8, cursor: 'pointer', border: '1.5px solid var(--border)', background: 'none', padding: 2 }}
                  />
                  <span style={{
                    padding: '8px 14px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600,
                    color: trendConfig.neutralColor, background: `${trendConfig.neutralColor}15`,
                    border: `1px solid ${trendConfig.neutralColor}40`, whiteSpace: 'nowrap',
                  }}>
                    {trendConfig.neutralLabel || 'Giữ nguyên'}
                  </span>
                </div>
              </div>

              {/* Save button */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  onClick={handleSaveTrend}
                  disabled={trendSaving}
                  style={{
                    padding: '10px 28px', borderRadius: 8, cursor: 'pointer',
                    border: 'none',
                    background: trendSaving
                      ? 'rgba(99,102,241,0.5)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white', fontWeight: 600, fontSize: '0.95rem',
                    boxShadow: trendSaving ? 'none' : '0 4px 14px rgba(99,102,241,0.4)',
                    transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                  }}
                >
                  {trendSaving ? '⏳ Đang lưu...' : '💾 Lưu cài đặt'}
                </button>
              </div>

              {/* Message */}
              {trendMessage && (
                <div style={{
                  marginTop: 16, padding: '12px 16px', borderRadius: 8,
                  background: trendMessage.type === 'success'
                    ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                  border: `1px solid ${trendMessage.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: trendMessage.type === 'success' ? '#10b981' : '#ef4444',
                  fontSize: '0.9rem', fontWeight: 500,
                  animation: 'fadeIn 0.3s ease',
                }}>
                  {trendMessage.text}
                </div>
              )}
            </>
          )}
        </div>

        {/* Info card */}
        <div className="glass-card fade-in-up" style={{
          padding: 24, animationDelay: '0.1s',
          background: 'rgba(10,15,30,0.5)',
          borderLeft: '3px solid rgba(99,102,241,0.5)',
        }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            💡 <strong style={{ color: 'var(--text-secondary)' }}>Cách hoạt động:</strong>{' '}
            Khi bạn cập nhật giá sản phẩm, hệ thống lưu lại lịch sử thay đổi.
            Trên giao diện mua hàng, sản phẩm có giá thay đổi trong vòng <strong>N ngày</strong> qua
            sẽ hiển thị <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>giá cũ</span>{' '}
            và <span style={{ color: '#10b981', fontWeight: 600 }}>giá mới</span> kèm phần trăm thay đổi.
            Mặc định là <strong>7 ngày</strong>.
          </p>
        </div>
      </main>
    </>
  );
}
