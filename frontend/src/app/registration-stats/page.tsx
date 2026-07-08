'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import { surveyApi, SurveyAnswerStats } from '@/lib/api';
import { BarChart, PieChart, HelpCircle, Layers } from 'lucide-react';

interface CategoryStat {
  categoryId: number;
  categoryName: string;
  count: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function RegistrationStatsPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  const [surveyStats, setSurveyStats] = useState<SurveyAnswerStats[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [surveyData, categoryData] = await Promise.all([
        surveyApi.getAnswerStats(),
        fetch(`${API_BASE}/api/agencies/categories/stats`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).then(r => r.json()),
      ]);
      setSurveyStats(surveyData);
      setCategoryStats(categoryData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
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
                      <div key={stat.categoryId}>
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

            {/* Survey Stats */}
            <GlassCard style={{ padding: 28 }}>
              <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10, color: '#f59e0b' }}>
                <HelpCircle size={20} /> Kết quả khảo sát đăng ký
              </h3>
              {surveyStats.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Chưa có câu trả lời khảo sát nào</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {surveyStats.map((stat) => (
                    <div key={stat.questionId} style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 16, padding: 20
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>
                            {stat.question}
                          </h4>
                          <span style={{
                            display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 8,
                            fontSize: '0.75rem', fontWeight: 500,
                            background: stat.questionType === 'text' ? 'rgba(99,102,241,0.12)' :
                              stat.questionType === 'radio' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                            color: stat.questionType === 'text' ? '#818cf8' :
                              stat.questionType === 'radio' ? '#f59e0b' : '#10b981',
                          }}>
                            {stat.questionType === 'text' ? 'Text' : stat.questionType === 'radio' ? 'Radio' : 'Checkbox'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {stat.totalAnswers} câu trả lời
                        </span>
                      </div>

                      {stat.questionType === 'text' ? (
                        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                          {stat.rawAnswers && stat.rawAnswers.length > 0 ? (
                            stat.rawAnswers.map((answer, idx) => (
                              <div key={idx} style={{
                                padding: '8px 12px', marginBottom: 4,
                                background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                                fontSize: '0.9rem'
                              }}>
                                {answer}
                              </div>
                            ))
                          ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chưa có câu trả lời</p>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {stat.optionCounts && Object.entries(stat.optionCounts).map(([option, count]) => {
                            const total = Object.values(stat.optionCounts!).reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? (count / total) * 100 : 0;
                            return (
                              <div key={option}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 2 }}>
                                  <span>{option}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>{count} ({pct.toFixed(1)}%)</span>
                                </div>
                                <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{
                                    height: '100%', width: `${pct}%`,
                                    background: stat.questionType === 'radio'
                                      ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                      : 'linear-gradient(90deg, #10b981, #06b6d4)',
                                    borderRadius: 3, transition: 'width 0.6s ease'
                                  }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </Main>
    </>
  );
}
