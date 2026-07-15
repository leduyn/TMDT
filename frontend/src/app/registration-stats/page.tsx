'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import { surveyApi, SurveyAnswerDTO, agencyApi } from '@/lib/api';
import { BarChart, HelpCircle, Layers, X } from 'lucide-react';

interface CategoryStat {
  categoryId: number;
  categoryName: string;
  count: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function RegistrationStatsPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail modal
  const [detailCategory, setDetailCategory] = useState<CategoryStat | null>(null);
  const [agencyDetails, setAgencyDetails] = useState<{ agency: any; answers: SurveyAnswerDTO[] }[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (!isLoading && user && !user.roles.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r))) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || !token) return;
    fetchData();
  }, [user, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const categoryData = await fetch(`${API_BASE}/api/agencies/categories/stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(r => r.json());
      setCategoryStats(categoryData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (stat: CategoryStat) => {
    setDetailCategory(stat);
    setIsLoadingDetail(true);
    try {
      const agencies = await agencyApi.getAgenciesByCategory(stat.categoryId);
      const withAnswers = await Promise.all(
        agencies.map(async (a: any) => {
          try {
            const answers = await surveyApi.getAgencyAnswers(a.id, stat.categoryId);
            return { agency: a, answers };
          } catch {
            return { agency: a, answers: [] as SurveyAnswerDTO[] };
          }
        })
      );
      setAgencyDetails(withAnswers);
    } catch (err) {
      console.error('Error fetching agencies by category:', err);
      setAgencyDetails([]);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    );
  }

  if (!user.roles.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r))) return null;

  return (
    <>
      <Navbar />
      <Main>
        <div className="fade-in-up" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 8px 24px rgba(245,158,11,0.4)',
            }}>
              <BarChart size={24} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>
                Thống kê đăng ký đại lý
              </h1>
              <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Tổng quan câu trả lời khảo sát và danh mục được chọn khi đăng ký
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Category Stats */}
            <GlassCard style={{ padding: 28 }}>
              <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-light)' }}>
                <Layers size={20} /> Danh mục được chọn nhiều nhất
              </h3>
              {categoryStats.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Chưa có dữ liệu</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {categoryStats.map((stat) => {
                    const maxCount = Math.max(...categoryStats.map(s => s.count));
                    const pct = (stat.count / maxCount) * 100;
                    return (
                      <div
                        key={stat.categoryId}
                        onClick={() => handleCategoryClick(stat)}
                        style={{ cursor: 'pointer', padding: '6px 8px', borderRadius: 8, transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.9rem' }}>
                          <span style={{ fontWeight: 500 }}>{stat.categoryName}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{stat.count} đại lý</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 4, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* Detail Modal */}
        {detailCategory && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setDetailCategory(null)}
          >
            <div
              className="glass-card fade-in-up"
              style={{ width: 900, maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700,
                }}>
                  <Layers size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{detailCategory.categoryName}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{detailCategory.count} đại lý đã chọn danh mục này</p>
                </div>
                <button
                  onClick={() => setDetailCategory(null)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {isLoadingDetail ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div className="spinner" style={{ width: 32, height: 32 }} />
                  </div>
                ) : agencyDetails.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Không có dữ liệu</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {agencyDetails.map(({ agency: a, answers }) => (
                      <div key={a.id} style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)',
                        borderRadius: 16, overflow: 'hidden',
                      }}>
                        {/* Agency header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderBottom: answers.length > 0 ? '1px solid var(--border-light)' : 'none' }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: a.active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: a.active ? '#10b981' : '#ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700,
                          }}>
                            {a.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{a.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              Mã: {a.code}{a.phone ? ` • ${a.phone}` : ''}
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.7rem', padding: '3px 10px', borderRadius: 8, fontWeight: 600,
                            background: a.type === 'WHOLESALE' ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
                            color: a.type === 'WHOLESALE' ? '#818cf8' : '#10b981',
                          }}>
                            {a.type === 'WHOLESALE' ? 'Bán sỉ' : a.type === 'RETAIL' ? 'Bán lẻ' : '---'}
                          </span>
                          {answers.length > 0 && (
                            <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 8, background: 'rgba(99,102,241,0.12)', color: '#818cf8', fontWeight: 600 }}>
                              {answers.length} câu trả lời
                            </span>
                          )}
                        </div>

                        {/* Q&A section */}
                        {answers.length > 0 ? (
                          <div style={{ padding: '12px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {answers.map(ans => (
                              <div key={ans.id}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <HelpCircle size={12} />
                                  {ans.question}
                                  <span style={{
                                    padding: '1px 6px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 500,
                                    background: ans.questionType === 'text' ? 'rgba(99,102,241,0.12)' : 'rgba(245,158,11,0.12)',
                                    color: ans.questionType === 'text' ? '#818cf8' : '#f59e0b',
                                  }}>
                                    {ans.questionType}
                                  </span>
                                </div>
                                <div style={{ fontWeight: 500, color: 'var(--text-primary)', paddingLeft: 18, fontSize: '0.9rem' }}>{ans.answer}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '14px 18px', margin: 0 }}>
                            Chưa có câu trả lời
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Main>
    </>
  );
}
