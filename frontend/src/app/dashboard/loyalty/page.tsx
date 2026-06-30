'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  gamificationApi,
  gamificationAdminApi,
  GamificationProfile,
  LeaderboardEntry,
  BadgeInfo,
  CertificateInfo,
  GamificationRule,
  EvaluatedRule,
  MembershipLevel,
  SpelVariable,
} from '@/modules/loyalty/loyaltyApi';

// ============================================================
// COMPONENTS INLINE
// ============================================================

/** Thanh tiến trình tới cấp bậc tiếp theo */
function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 100;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
        <span>{label}</span>
        <span>{value.toLocaleString('vi-VN')} / {max.toLocaleString('vi-VN')}</span>
      </div>
      <div style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #a78bfa)', height: '100%', borderRadius: 8, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

/** Card huy hiệu */
function BadgeCard({ badge }: { badge: BadgeInfo }) {
  return (
    <div title={badge.description} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 12,
      background: badge.earned ? 'rgba(99,102,241,0.12)' : 'rgba(30,35,50,0.5)',
      border: badge.earned ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(99,102,241,0.1)',
      opacity: badge.earned ? 1 : 0.4,
      transition: 'all 0.2s ease',
      cursor: 'default',
    }}>
      <span style={{ fontSize: 26 }}>{badge.icon}</span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{badge.name}</div>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{badge.description}</div>
      </div>
      {badge.earned && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#a78bfa', background: 'rgba(167,139,250,0.15)', padding: '2px 8px', borderRadius: 20 }}>✓ Đã đạt</span>}
    </div>
  );
}

/** Modal bằng khen */
function CertificateModal({ cert, onClose }: { cert: CertificateInfo; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div id="certificate-printable" style={{
        background: 'linear-gradient(135deg, #1a1230, #0a0f1e)',
        border: '2px solid rgba(245,158,11,0.6)',
        borderRadius: 20, padding: 40, maxWidth: 520, width: '100%',
        position: 'relative', textAlign: 'center',
        boxShadow: '0 0 60px rgba(245,158,11,0.15)',
      }}>
        {/* Icon đỉnh vàng */}
        <div style={{
          position: 'absolute', top: -36, left: '50%', transform: 'translateX(-50%)',
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          border: '4px solid #0a0f1e',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32
        }}>🎗️</div>

        <div style={{ marginTop: 28, border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: 28 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 3, color: '#f59e0b', fontWeight: 700, marginBottom: 8 }}>
            Hệ Thống Vinh Danh Thành Viên
          </div>
          <h2 style={{ fontSize: 24, fontStyle: 'italic', color: '#fcd34d', margin: '0 0 16px' }}>BẰNG KHEN DANH DỰ</h2>
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)', marginBottom: 16 }} />
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px' }}>Trân trọng chứng nhận và vinh danh hội viên cao quý:</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>{cert.customerName}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px' }}>Đã xuất sắc đạt danh hiệu:</p>
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '8px 16px', display: 'inline-block', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>🏆 {cert.title}</span>
          </div>
          <p style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 16px', padding: '0 8px' }}>"{cert.reason}"</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', paddingTop: 12, borderTop: '1px solid rgba(99,102,241,0.1)' }}>
            <div>
              <div>Ngày trao thưởng</div>
              <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{new Date(cert.earnedAt).toLocaleDateString('vi-VN')}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>Hệ thống Gamification</div>
              <div style={{ fontWeight: 700, color: '#10b981' }}>ĐÃ XÁC THỰC</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => window.print()} style={{
            padding: '8px 20px', background: '#f59e0b', color: '#0a0f1e',
            border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer'
          }}>🖨️ In PDF</button>
          <button onClick={onClose} style={{
            padding: '8px 20px', background: 'transparent', color: 'var(--text-secondary)',
            border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer'
          }}>Đóng lại</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, background: 'var(--bg-secondary)',
  border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 12, width: '100%',
  boxSizing: 'border-box',
};

const TABS = ['🏅 Huy hiệu & Tiến trình', '🏆 Bảng Xếp Hạng', '📜 Bằng Khen', '⚙️ Quản trị (Admin)'];

const SPEL_FIELDS = [
  { value: '#totalOrders',          label: 'Tổng đơn hàng' },
  { value: '#totalRevenue',         label: 'Tổng doanh thu' },
  { value: '#pointsBalance',        label: 'Số dư điểm' },
  { value: '#totalEarned',          label: 'Tổng điểm tích lũy' },
  { value: '#levelNumber',          label: 'Cấp bậc hiện tại' },
  { value: '#referralBuyers',       label: 'Người mua qua đại lý' },
  { value: '#activeReferralBuyers', label: 'Người mua active (đại lý)' },
  { value: '#proxyOrders',          label: 'Đơn hàng mua hộ' },
];

const OPERATORS = ['>=', '<=', '==', '!=', '>', '<'];

interface ConditionRow {
  type: 'structured' | 'raw';
  field?: string;
  operator?: string;
  value?: string;
  rawSpel?: string;
}

const buildSpelExpression = (conds: ConditionRow[], logic: string): string => {
  const parts = conds.map(c => {
    if (c.type === 'raw') return c.rawSpel?.trim() || '';
    if (!c.field || !c.operator || c.value === '' || c.value === undefined) return '';
    return `${c.field} ${c.operator} ${c.value}`;
  }).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return parts.join(` ${logic.toLowerCase()} `);
};

export default function LoyaltyPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [allBadges, setAllBadges] = useState<BadgeInfo[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCert, setSelectedCert] = useState<CertificateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluatedRules, setEvaluatedRules] = useState<EvaluatedRule[]>([]);

  // Admin states
  const [rules, setRules] = useState<GamificationRule[]>([]);
  const [levels, setLevels] = useState<MembershipLevel[]>([]);
  const [formula, setFormula] = useState('');
  const [formulaInput, setFormulaInput] = useState('');
  const [formulaMsg, setFormulaMsg] = useState('');

  // Badge admin states
  const [adminBadges, setAdminBadges] = useState<BadgeInfo[]>([]);
  const [newBadge, setNewBadge] = useState({
    id: '', name: '', description: '', icon: '', colorGradient: '', active: true,
  });
  const [badgeMsg, setBadgeMsg] = useState('');

  // New Rule form state
  const [newRule, setNewRule] = useState<GamificationRule>({
    id: '', name: '', eventTrigger: 'COMPLETED', conditionExpression: '',
    rewardPoints: 0, rewardBadgeId: null, rewardTitle: null, active: true,
  });
  const [ruleMsg, setRuleMsg] = useState('');

  // Condition builder state
  const [conditions, setConditions] = useState<ConditionRow[]>([
    { type: 'structured', field: '#totalOrders', operator: '>=', value: '' }
  ]);
  const [conditionLogic, setConditionLogic] = useState<'AND' | 'OR'>('AND');

  // Spel Variable builder state
  const [spelVars, setSpelVars] = useState<SpelVariable[]>([]);
  const [spelMeta, setSpelMeta] = useState<Record<string, any> | null>(null);
  const [svAgg, setSvAgg] = useState('COUNT');
  const [svTable, setSvTable] = useState('orders');
  const [svColumn, setSvColumn] = useState('id');
  const [svJoinTable, setSvJoinTable] = useState('');
  const [svJoinOn, setSvJoinOn] = useState('');
  const [svJoinType, setSvJoinType] = useState('INNER');
  const [svWhere, setSvWhere] = useState<{ column: string; operator: string; value: string; logic: string }[]>([]);
  const [svName, setSvName] = useState('');
  const [svDesc, setSvDesc] = useState('');
  const [svMsg, setSvMsg] = useState('');
  const [spelPreview, setSpelPreview] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; sql?: string; result?: number; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [testCustomerId, setTestCustomerId] = useState(3);
  const [testAgencyId, setTestAgencyId] = useState(1);

  // New Level form state
  const [newLevel, setNewLevel] = useState({ levelNumber: 1, name: '', minPoints: 0, minOrders: 0, minRevenue: 0 });
  const [levelMsg, setLevelMsg] = useState('');

  const customerId = user?.id;

  const loadData = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const [prof, badges, lb, evRules] = await Promise.all([
        gamificationApi.getProfile(customerId),
        gamificationApi.getAllBadges(customerId),
        gamificationApi.getLeaderboard(50),
        gamificationApi.getEvaluatedRules(customerId),
      ]);
      setProfile(prof);
      setAllBadges(badges);
      setLeaderboard(lb);
      setEvaluatedRules(evRules);
    } catch (e: any) {
      setError(e.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const loadAdminData = useCallback(async () => {
    try {
      const [r, l, f, b, sv, meta] = await Promise.all([
        gamificationAdminApi.getRules(),
        gamificationAdminApi.getLevels(),
        gamificationAdminApi.getPointsFormula(),
        gamificationAdminApi.getAllBadgesAdmin(),
        gamificationAdminApi.getSpelVariables(),
        gamificationAdminApi.getSpelMetadata(),
      ]);
      setRules(r);
      setLevels(l);
      setFormula(f.formula);
      setFormulaInput(f.formula);
      setAdminBadges(b);
      setSpelVars(sv);
      setSpelMeta(meta);
    } catch {}
  }, []);

  // ===== Spel Variable Builder (must be before useEffect that calls it) =====
  const buildPreviewSql = () => {
    const aliasMap: Record<string, string> = { orders: 'o', users: 'u', agency_customer_assignments: 'a', loyalty_points: 'lp', point_transactions: 'pt', order_items: 'oi', brands: 'b', categories: 'c', products: 'p', agency_products: 'ap' };
    const a = aliasMap[svTable] || 't';
    const aggExpr = svAgg === 'COUNT' ? `COUNT(${a}.${svColumn})` : `${svAgg}(${a}.${svColumn})`;
    let sql = `SELECT ${aggExpr}\nFROM ${svTable} ${a}`;
    if (svJoinTable && svJoinOn) {
      const ja = aliasMap[svJoinTable] || 'j';
      sql += `\n${svJoinType} JOIN ${svJoinTable} ${ja} ON ${a}.${svJoinOn} = ${ja}.id`;
    }
    const whereParts = svWhere.filter(w => w.column).map(w => {
      if (w.operator === 'IS NULL' || w.operator === 'IS NOT NULL') return `${a}.${w.column} ${w.operator}`;
      if (w.operator === 'LIKE') return `${a}.${w.column} LIKE '%${w.value}%'`;
      return `${a}.${w.column} ${w.operator} '${w.value}'`;
    });
    if (whereParts.length > 0) {
      sql += '\nWHERE ' + whereParts.join('\n  AND ');
    }
    setSpelPreview(sql);
    return sql;
  };

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (activeTab === 3) loadAdminData(); }, [activeTab, loadAdminData]);
  useEffect(() => { buildPreviewSql(); }, [svAgg, svTable, svColumn, svJoinTable, svJoinOn, svJoinType, svWhere]);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: 40, marginBottom: 12, animation: 'spin 1s linear infinite' }}>⚙️</div>
        <div>Đang tải hệ thống thi đua...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--danger)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div>{error}</div>
      </div>
    </div>
  );

  const LEVEL_ICONS: Record<number, string> = { 1: '🥉', 2: '🥈', 3: '🥇', 4: '💎' };
  const levelIcon = LEVEL_ICONS[profile?.levelNumber ?? 1] ?? '🎖️';

  const EVENT_LABELS: Record<string, string> = {
    ORDER_CREATED: 'Tạo đơn hàng',
    COMPLETED: 'Hoàn thành',
    PAID: 'Thanh toán',
    ORDER_ENROLLED: 'Tham gia chương trình',
    LEVEL_CHANGED: 'Đổi cấp bậc',
    RANKING_CHANGED: 'Đổi thứ hạng',
  };

  const handleSaveRule = async () => {
    const spelExpr = buildSpelExpression(conditions, conditionLogic);
    if (!newRule.id || !newRule.name) {
      setRuleMsg('❌ Vui lòng điền đầy đủ ID và Tên luật.');
      return;
    }
    try {
      const ruleToSave = { ...newRule, conditionExpression: spelExpr };
      const saved = await gamificationAdminApi.saveRule(ruleToSave);
      setRules(prev => {
        const exists = prev.find(r => r.id === saved.id);
        return exists ? prev.map(r => r.id === saved.id ? saved : r) : [...prev, saved];
      });
      setNewRule({ id: '', name: '', eventTrigger: 'COMPLETED', conditionExpression: '', rewardPoints: 0, rewardBadgeId: null, rewardTitle: null, active: true });
      setConditions([{ type: 'structured', field: '#totalOrders', operator: '>=', value: '' }]);
      setConditionLogic('AND');
      setRuleMsg('✅ Đã lưu luật thành công!');
    } catch (e: any) { setRuleMsg('❌ ' + e.message); }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm(`Xác nhận xóa luật "${id}"?`)) return;
    try {
      await gamificationAdminApi.deleteRule(id);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (e: any) { alert('❌ ' + e.message); }
  };

  const handleSaveLevel = async () => {
    if (!newLevel.name || newLevel.levelNumber < 1) {
      setLevelMsg('❌ Vui lòng điền Số cấp và Tên cấp bậc.');
      return;
    }
    try {
      const saved = await gamificationAdminApi.saveLevel({ ...newLevel, active: true });
      setLevels(prev => {
        const exists = prev.find(l => l.id === saved.id);
        return exists ? prev.map(l => l.id === saved.id ? saved : l) : [...prev, saved].sort((a, b) => a.levelNumber - b.levelNumber);
      });
      setNewLevel({ levelNumber: levels.length + 2, name: '', minPoints: 0, minOrders: 0, minRevenue: 0 });
      setLevelMsg('✅ Đã lưu cấp bậc thành công!');
    } catch (e: any) { setLevelMsg('❌ ' + e.message); }
  };

  const handleDeleteLevel = async (id: number) => {
    if (!confirm('Xác nhận xóa cấp bậc này?')) return;
    try {
      await gamificationAdminApi.deleteLevel(id);
      setLevels(prev => prev.filter(l => l.id !== id));
    } catch (e: any) { alert('❌ ' + e.message); }
  };

  const handleSaveBadge = async () => {
    if (!newBadge.id || !newBadge.name) {
      setBadgeMsg('❌ Vui lòng điền ID và Tên huy hiệu.');
      return;
    }
    try {
      const saved = await gamificationAdminApi.saveBadge(newBadge);
      setAdminBadges(prev => {
        const exists = prev.find(b => b.id === saved.id);
        return exists ? prev.map(b => b.id === saved.id ? saved : b) : [...prev, saved];
      });
      setNewBadge({ id: '', name: '', description: '', icon: '', colorGradient: '', active: true });
      setBadgeMsg('✅ Đã lưu huy hiệu thành công!');
    } catch (e: any) { setBadgeMsg('❌ ' + e.message); }
  };

  const handleDeleteBadge = async (id: string) => {
    if (!confirm(`Xác nhận xóa huy hiệu "${id}"?`)) return;
    try {
      await gamificationAdminApi.deleteBadge(id);
      setAdminBadges(prev => prev.filter(b => b.id !== id));
    } catch (e: any) { alert('❌ ' + e.message); }
  };

  const handleSaveSpelVar = async () => {
    if (!svName) { setSvMsg('❌ Vui lòng nhập tên biến.'); return; }
    const sql = buildPreviewSql();
    try {
      const saved = await gamificationAdminApi.saveSpelVariable({
        name: svName.startsWith('#') ? svName : '#' + svName,
        description: svDesc,
        aggFunction: svAgg,
        tableName: svTable,
        tableAlias: { orders: 'o', users: 'u', agency_customer_assignments: 'a', loyalty_points: 'lp', point_transactions: 'pt', order_items: 'oi', brands: 'b', categories: 'c', products: 'p', agency_products: 'ap' }[svTable] || 't',
        columnName: svColumn,
        joinTable: svJoinTable || null,
        joinAlias: svJoinTable ? ({ orders: 'o', users: 'u', agency_customer_assignments: 'a', loyalty_points: 'lp', point_transactions: 'pt', order_items: 'oi', brands: 'b', categories: 'c', products: 'p', agency_products: 'ap' }[svJoinTable] || 'j') : null,
        joinOnColumn: svJoinOn || null,
        joinType: svJoinType,
        whereJson: svWhere.length > 0 ? JSON.stringify(svWhere) : null,
        active: true,
      });
      setSpelVars(prev => [...prev, saved]);
      setSvName(''); setSvDesc(''); setSvWhere([]); setSvJoinTable(''); setSvJoinOn('');
      setSvMsg('✅ Đã lưu biến SpEL!');
    } catch (e: any) { setSvMsg('❌ ' + e.message); }
  };

  const handleDeleteSpelVar = async (id: number) => {
    if (!confirm('Xác nhận xóa biến này?')) return;
    try {
      await gamificationAdminApi.deleteSpelVariable(id);
      setSpelVars(prev => prev.filter(v => v.id !== id));
    } catch (e: any) { alert('❌ ' + e.message); }
  };

  const handleTestSpelVar = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await gamificationAdminApi.testSpelVariable({
        name: svName || '#test',
        description: svDesc,
        aggFunction: svAgg,
        tableName: svTable,
        tableAlias: { orders: 'o', users: 'u', agency_customer_assignments: 'a', loyalty_points: 'lp', point_transactions: 'pt', order_items: 'oi', brands: 'b', categories: 'c', products: 'p', agency_products: 'ap' }[svTable] || 't',
        columnName: svColumn,
        joinTable: svJoinTable || null,
        joinAlias: svJoinTable ? ({ orders: 'o', users: 'u', agency_customer_assignments: 'a', loyalty_points: 'lp', point_transactions: 'pt', order_items: 'oi', brands: 'b', categories: 'c', products: 'p', agency_products: 'ap' }[svJoinTable] || 'j') : null,
        joinOnColumn: svJoinOn || null,
        joinType: svJoinType,
        whereJson: svWhere.length > 0 ? JSON.stringify(svWhere) : null,
        active: true,
      }, testCustomerId, testAgencyId);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, error: e.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.10))',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 56 }}>{levelIcon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Hệ Thống Tích Điểm & Thi Đua</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>{profile?.customerName}</h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
            <span style={{ fontSize: 12, padding: '4px 12px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 20, color: '#818cf8' }}>
              {levelIcon} {profile?.levelName ?? `Cấp ${profile?.levelNumber}`}
            </span>
            <span style={{ fontSize: 12, padding: '4px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, color: '#fbbf24' }}>
              ✨ {profile?.pointsBalance?.toLocaleString('vi-VN')} điểm
            </span>
            <span style={{ fontSize: 12, padding: '4px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, color: '#34d399' }}>
              📦 {profile?.totalOrders} đơn hàng
            </span>
          </div>
        </div>
        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'Tổng điểm tích lũy', value: profile?.totalEarned?.toLocaleString('vi-VN') + ' PTS', color: '#a78bfa' },
            { label: 'Huy hiệu đã đạt', value: profile?.earnedBadges?.length + ' chiếc', color: '#f59e0b' },
            { label: 'Danh hiệu', value: profile?.titles?.length + ' danh hiệu', color: '#34d399' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, minWidth: 90 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tiến trình lên cấp tiếp theo */}
      {profile?.nextLevelName && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            🚀 Tiến trình lên cấp: <span style={{ color: '#a78bfa' }}>{profile.nextLevelName}</span>
          </div>
          {profile.nextLevelMinPoints != null && <ProgressBar value={profile.totalEarned} max={profile.nextLevelMinPoints} label="Điểm tích lũy" />}
          {profile.nextLevelMinOrders != null && <ProgressBar value={profile.totalOrders} max={profile.nextLevelMinOrders} label="Đơn hàng hoàn thành" />}
          {profile.nextLevelMinRevenue != null && <ProgressBar value={profile.totalRevenue} max={profile.nextLevelMinRevenue} label="Doanh thu tích lũy (đ)" />}
        </div>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, marginBottom: 24, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            flex: '1 1 auto', padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: activeTab === i ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
            color: activeTab === i ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}>{t}</button>
        ))}
      </div>

      {/* ===== TAB 0: HUY HIỆU & TIẾN TRÌNH ===== */}
      {activeTab === 0 && (
        <div>
          {/* Rules Section */}
          {evaluatedRules.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                📋 Luật Thi Đua ({evaluatedRules.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                {evaluatedRules.map(rule => (
                  <div key={rule.id} style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: rule.conditionMet ? 'rgba(34,197,94,0.06)' : 'rgba(156,163,175,0.06)',
                    border: rule.conditionMet ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
                    position: 'relative',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{rule.name}</span>
                      {rule.alreadyRewarded ? (
                        <span style={{ fontSize: 10, background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '2px 8px', borderRadius: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          ✅ Đã nhận
                        </span>
                      ) : rule.conditionMet ? (
                        <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          ⚡ Đủ điều kiện
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, background: 'rgba(156,163,175,0.15)', color: '#9ca3af', padding: '2px 8px', borderRadius: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          ⏳ Chưa đủ
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      {rule.rewardPoints > 0 && (
                        <span>+{rule.rewardPoints.toLocaleString()} điểm</span>
                      )}
                      {rule.rewardBadgeId && (
                        <span>🏅 Huy hiệu</span>
                      )}
                      {rule.rewardTitle && (
                        <span>🎖️ {rule.rewardTitle}</span>
                      )}
                    </div>
                    {rule.conditionExpression && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontFamily: 'monospace', opacity: 0.7 }}>
                        {rule.conditionExpression}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges + Titles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                🏆 Huy hiệu đã đạt được ({profile?.earnedBadges?.length ?? 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {allBadges.map(b => <BadgeCard key={b.id} badge={b} />)}
                {allBadges.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 16 }}>Chưa có huy hiệu nào</div>}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                🎖️ Danh hiệu vinh danh
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {profile?.titles?.map((t, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>
                    🎗️ {t}
                  </div>
                ))}
                {(profile?.titles?.length ?? 0) === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 16 }}>Chưa có danh hiệu</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB 1: BẢNG XẾP HẠNG ===== */}
      {activeTab === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>👑 Bảng Xếp Hạng Thi Đua</h2>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
              {leaderboard.length} thành viên
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leaderboard.map((entry, idx) => {
              const isTop1 = idx === 0, isTop2 = idx === 1, isTop3 = idx === 2;
              const isSelf = entry.customerId === customerId;
              return (
                <div key={entry.customerId} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 20px', borderRadius: 14,
                  background: isTop1 ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(99,102,241,0.05))' :
                              isSelf ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)',
                  border: isTop1 ? '1px solid rgba(245,158,11,0.4)' : isSelf ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border)',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{ width: 36, textAlign: 'center', fontSize: isTop1 || isTop2 || isTop3 ? 28 : 14, fontWeight: 700, color: 'var(--text-muted)' }}>
                    {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${idx + 1}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{entry.customerName}</span>
                      {isSelf && <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '1px 8px', borderRadius: 10 }}>Bạn</span>}
                      <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.1)', color: 'var(--text-secondary)', padding: '1px 8px', borderRadius: 10 }}>{entry.levelName || `Cấp ${entry.levelNumber}`}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {entry.badges.slice(0, 3).join('  ')}
                      {entry.titles.length > 0 && <span style={{ color: '#f59e0b', marginLeft: 6 }}>🎗️ {entry.titles[0]}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>{entry.totalEarned.toLocaleString('vi-VN')}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Points</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== TAB 2: BẰNG KHEN ===== */}
      {activeTab === 2 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px' }}>📜 Bằng Khen Danh Dự</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {profile?.certificates?.map(cert => (
              <div key={cert.id} onClick={() => setSelectedCert(cert)} style={{
                padding: 20, borderRadius: 16, cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(99,102,241,0.05))',
                border: '1px solid rgba(245,158,11,0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🎗️</div>
                <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: 14, marginBottom: 6 }}>{cert.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{cert.reason}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{new Date(cert.earnedAt).toLocaleDateString('vi-VN')}</span>
                  <span style={{ color: '#6366f1', fontWeight: 700 }}>Xem bằng khen →</span>
                </div>
              </div>
            ))}
            {(profile?.certificates?.length ?? 0) === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div>Chưa có bằng khen. Tiếp tục giao dịch để đạt danh hiệu!</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB 3: ADMIN CONFIG ===== */}
      {activeTab === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Công thức tích điểm */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
              ⚡ Công Thức Tích Điểm (SpEL)
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Biến có thể dùng: <code style={{ color: '#a78bfa' }}>#amount</code> (giá trị đơn hàng bằng VNĐ).
              Ví dụ: <code style={{ color: '#34d399' }}>#amount * 0.001</code> = 1 điểm / 1000đ
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={formulaInput} onChange={e => setFormulaInput(e.target.value)}
                style={{ flex: 1, ...inputStyle, fontFamily: 'monospace' }}
                placeholder="#amount * 0.001"
              />
              <button onClick={async () => {
                try {
                  const r = await gamificationAdminApi.updatePointsFormula(formulaInput);
                  setFormula(r.formula);
                  setFormulaMsg(`✅ Đã lưu! Test 1,000,000đ → ${r.testResult1M}`);
                } catch (e: any) { setFormulaMsg('❌ ' + e.message); }
              }} style={{ padding: '8px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>
                Lưu công thức
              </button>
            </div>
            {formulaMsg && <div style={{ marginTop: 10, fontSize: 12, color: formulaMsg.startsWith('✅') ? '#34d399' : '#ef4444' }}>{formulaMsg}</div>}
          </div>

          {/* ===== HUY HIỆU THƯỞNG ===== */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
              🏅 Quản Lý Huy Hiệu Thưởng
            </h3>

            {/* Form tạo mới huy hiệu */}
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 12 }}>➕ Thêm huy hiệu mới</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>ID huy hiệu (duy nhất) *</div>
                  <input value={newBadge.id} onChange={e => setNewBadge(p => ({ ...p, id: e.target.value }))}
                    style={inputStyle} placeholder="vd: badge_loyal" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Tên huy hiệu *</div>
                  <input value={newBadge.name} onChange={e => setNewBadge(p => ({ ...p, name: e.target.value }))}
                    style={inputStyle} placeholder="vd: Khách hàng thân thiết" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Icon (emoji)</div>
                  <input value={newBadge.icon} onChange={e => setNewBadge(p => ({ ...p, icon: e.target.value }))}
                    style={inputStyle} placeholder="vd: 🏅" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Màu gradient (mã hex)</div>
                  <input value={newBadge.colorGradient} onChange={e => setNewBadge(p => ({ ...p, colorGradient: e.target.value }))}
                    style={inputStyle} placeholder="vd: #6366f1,#a78bfa" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Mô tả</div>
                  <input value={newBadge.description} onChange={e => setNewBadge(p => ({ ...p, description: e.target.value }))}
                    style={inputStyle} placeholder="vd: Đạt được khi tích lũy 1000 điểm" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={handleSaveBadge} style={{ padding: '8px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                  💾 Lưu Huy Hiệu
                </button>
                {badgeMsg && <span style={{ fontSize: 12, color: badgeMsg.startsWith('✅') ? '#34d399' : '#ef4444' }}>{badgeMsg}</span>}
              </div>
            </div>

            {/* Danh sách huy hiệu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {adminBadges.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: 12, textAlign: 'center' }}>Chưa có huy hiệu nào. Tạo huy hiệu đầu tiên ở trên.</div>}
              {adminBadges.map(badge => (
                <div key={badge.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10,
                  background: badge.active ? 'rgba(99,102,241,0.06)' : 'rgba(30,35,50,0.4)',
                  border: badge.active ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.1)',
                }}>
                  <span style={{ fontSize: 28 }}>{badge.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{badge.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      <span style={{ color: '#a78bfa' }}>#{badge.id}</span>
                      {badge.description && <span> — {badge.description}</span>}
                    </div>
                  </div>
                  {badge.colorGradient && (
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: `linear-gradient(135deg, ${badge.colorGradient.split(',').join(', ')})`,
                    }} />
                  )}
                  <button onClick={() => handleDeleteBadge(badge.id)} style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                  }}>🗑️</button>
                </div>
              ))}
            </div>
          </div>

          {/* ===== LUẬT THI ĐUA ===== */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>⚙️ Luật Thi Đua Gamification</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
              Biến: <code style={{ color: '#a78bfa' }}>#totalOrders</code>, <code style={{ color: '#a78bfa' }}>#totalRevenue</code>, <code style={{ color: '#a78bfa' }}>#pointsBalance</code>, <code style={{ color: '#a78bfa' }}>#totalEarned</code>, <code style={{ color: '#a78bfa' }}>#levelNumber</code>,
              <code style={{ color: '#a78bfa' }}>#referralBuyers</code>, <code style={{ color: '#a78bfa' }}>#activeReferralBuyers</code>, <code style={{ color: '#a78bfa' }}>#proxyOrders</code>
            </p>

            {/* Form tạo mới */}
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 12 }}>➕ Tạo luật mới</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>ID luật (duy nhất) *</div>
                  <input value={newRule.id} onChange={e => setNewRule(p => ({ ...p, id: e.target.value }))}
                    style={inputStyle} placeholder="vd: rule_10_orders" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Tên luật *</div>
                  <input value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))}
                    style={inputStyle} placeholder="vd: Đặt 10 đơn đầu tiên" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Sự kiện kích hoạt *</div>
                    <select value={newRule.eventTrigger} onChange={e => setNewRule(p => ({ ...p, eventTrigger: e.target.value }))}
                      style={inputStyle}>
                      <option value="ORDER_CREATED">Tạo đơn hàng thành công</option>
                      <option value="COMPLETED">Đơn hàng hoàn thành</option>
                      <option value="PAID">Thanh toán xong</option>
                      <option value="ORDER_ENROLLED">Đơn hàng tham gia chương trình</option>
                      <option value="LEVEL_CHANGED">Thay đổi cấp bậc (Level)</option>
                      <option value="RANKING_CHANGED">Thay đổi thứ hạng (Ranking)</option>
                    </select>
                </div>
              </div>

              {/* ===== CONDITION BUILDER ===== */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>ĐIỀU KIỆN:</span>
                  <button onClick={() => setConditions(prev => [...prev, { type: 'structured', field: '#totalOrders', operator: '>=', value: '' }])}
                    style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                    + Điều kiện
                  </button>
                  <button onClick={() => setConditions(prev => [...prev, { type: 'raw', rawSpel: '' }])}
                    style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', color: '#fbbf24' }}>
                    + SpEL thủ công
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {conditions.map((row, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && conditions.length >= 2 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
                          <select
                            value={conditionLogic}
                            onChange={e => setConditionLogic(e.target.value as 'AND' | 'OR')}
                            style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', cursor: 'pointer' }}
                          >
                            <option value="AND">Và (AND)</option>
                            <option value="OR">Hoặc (OR)</option>
                          </select>
                          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {row.type === 'structured' ? (
                          <>
                            <select
                              value={row.field || '#totalOrders'}
                              onChange={e => setConditions(prev => prev.map((c, i) => i === idx ? { ...c, field: e.target.value } : c))}
                              style={{ ...inputStyle, width: 160, flexShrink: 0 }}
                            >
                              {SPEL_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                            <select
                              value={row.operator || '>='}
                              onChange={e => setConditions(prev => prev.map((c, i) => i === idx ? { ...c, operator: e.target.value } : c))}
                              style={{ ...inputStyle, width: 60, flexShrink: 0, textAlign: 'center' }}
                            >
                              {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                            <input
                              type="number"
                              value={row.value || ''}
                              onChange={e => setConditions(prev => prev.map((c, i) => i === idx ? { ...c, value: e.target.value } : c))}
                              style={{ ...inputStyle, flex: 1 }}
                              placeholder="Giá trị..."
                            />
                          </>
                        ) : (
                          <input
                            value={row.rawSpel || ''}
                            onChange={e => setConditions(prev => prev.map((c, i) => i === idx ? { ...c, rawSpel: e.target.value } : c))}
                            style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', borderColor: 'rgba(245,158,11,0.3)' }}
                            placeholder="SpEL: #totalRevenue >= 500000000"
                          />
                        )}
                        <button onClick={() => setConditions(prev => prev.filter((_, i) => i !== idx))}
                          style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          ✕
                        </button>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                {/* SpEL preview */}
                <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', fontFamily: 'monospace', fontSize: 11, color: '#a78bfa' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 10 }}>→ </span>
                  {buildSpelExpression(conditions, conditionLogic) || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Luôn đúng (không có điều kiện)</span>}
                </div>
              </div>

              {/* Phần thưởng */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Thưởng điểm</div>
                  <input type="number" min={0} value={newRule.rewardPoints} onChange={e => setNewRule(p => ({ ...p, rewardPoints: Number(e.target.value) }))}
                    style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Huy hiệu thưởng (tùy chọn)</div>
                  <select value={newRule.rewardBadgeId ?? ''} onChange={e => setNewRule(p => ({ ...p, rewardBadgeId: e.target.value || null }))}
                    style={inputStyle}>
                    <option value="">— Không —</option>
                    {adminBadges.map(b => (
                      <option key={b.id} value={b.id}>{b.icon} {b.name} ({b.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Danh hiệu thưởng (tùy chọn)</div>
                  <input value={newRule.rewardTitle ?? ''} onChange={e => setNewRule(p => ({ ...p, rewardTitle: e.target.value || null }))}
                    style={inputStyle} placeholder="vd: VIP" />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={handleSaveRule} style={{ padding: '8px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                  💾 Lưu Luật
                </button>
                {ruleMsg && <span style={{ fontSize: 12, color: ruleMsg.startsWith('✅') ? '#34d399' : '#ef4444' }}>{ruleMsg}</span>}
              </div>
            </div>

            {/* Danh sách luật hiện tại */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rules.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: 12, textAlign: 'center' }}>Chưa có luật nào. Tạo luật đầu tiên ở trên.</div>}
              {rules.map(rule => (
                <div key={rule.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10,
                  background: rule.active ? 'rgba(16,185,129,0.06)' : 'rgba(30,35,50,0.4)',
                  border: rule.active ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(99,102,241,0.1)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{rule.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      <span style={{ color: '#a78bfa' }}>[{EVENT_LABELS[rule.eventTrigger] ?? rule.eventTrigger}]</span> {rule.conditionExpression}
                      {' → '}{rule.rewardPoints > 0 && `+${rule.rewardPoints} điểm`}
                      {rule.rewardBadgeId && ` + Huy hiệu ${rule.rewardBadgeId}`}
                      {rule.rewardTitle && ` + Danh hiệu "${rule.rewardTitle}"`}
                    </div>
                  </div>
                  <button onClick={async () => {
                    const updated = await gamificationAdminApi.toggleRule(rule.id);
                    setRules(prev => prev.map(r => r.id === rule.id ? updated : r));
                  }} style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                    background: rule.active ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                    color: rule.active ? '#34d399' : '#818cf8',
                  }}>
                    {rule.active ? '✓ Chạy' : '✗ Tắt'}
                  </button>
                  <button onClick={() => handleDeleteRule(rule.id)} style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                  }}>🗑️</button>
                </div>
              ))}
            </div>
          </div>

          {/* ===== CẤP BẬC THÀNH VIÊN ===== */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>🎖️ Cấu Hình Cấp Bậc Thành Viên</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Hệ thống tự động nâng/hạ cấp khi khách hàng đạt đủ cả 3 điều kiện.</p>

            {/* Form tạo mới cấp bậc */}
            <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px dashed rgba(245,158,11,0.3)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 12 }}>➕ Thêm cấp bậc mới</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Số thứ tự cấp *</div>
                  <input type="number" min={1} value={newLevel.levelNumber} onChange={e => setNewLevel(p => ({ ...p, levelNumber: Number(e.target.value) }))}
                    style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Tên cấp bậc *</div>
                  <input value={newLevel.name} onChange={e => setNewLevel(p => ({ ...p, name: e.target.value }))}
                    style={inputStyle} placeholder="vd: Đồng" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Điểm tối thiểu</div>
                  <input type="number" min={0} value={newLevel.minPoints} onChange={e => setNewLevel(p => ({ ...p, minPoints: Number(e.target.value) }))}
                    style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Đơn hàng tối thiểu</div>
                  <input type="number" min={0} value={newLevel.minOrders} onChange={e => setNewLevel(p => ({ ...p, minOrders: Number(e.target.value) }))}
                    style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Doanh thu tối thiểu (đ)</div>
                  <input type="number" min={0} value={newLevel.minRevenue} onChange={e => setNewLevel(p => ({ ...p, minRevenue: Number(e.target.value) }))}
                    style={inputStyle} placeholder="0" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={handleSaveLevel} style={{ padding: '8px 20px', background: '#f59e0b', color: '#0a0f1e', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                  💾 Thêm Cấp Bậc
                </button>
                {levelMsg && <span style={{ fontSize: 12, color: levelMsg.startsWith('✅') ? '#34d399' : '#ef4444' }}>{levelMsg}</span>}
              </div>
            </div>

            {/* Bảng danh sách cấp bậc */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 10 }}>
                  {['Số cấp', 'Tên cấp bậc', 'Điểm tối thiểu', 'Đơn hàng', 'Doanh thu (đ)', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {levels.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Chưa có cấp bậc nào. Thêm cấp bậc đầu tiên ở trên.</td></tr>
                )}
                {levels.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.05)' }}>
                    <td style={{ padding: '8px 10px', color: '#818cf8', fontWeight: 700 }}>Cấp {l.levelNumber}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-primary)', fontWeight: 700 }}>{l.name}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{l.minPoints.toLocaleString('vi-VN')}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{l.minOrders}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{l.minRevenue.toLocaleString('vi-VN')}</td>
                    <td style={{ padding: '4px 10px' }}>
                      <button onClick={() => handleDeleteLevel(l.id)} style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                      }}>🗑️ Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== BIẾN SPHEL TÙY CHỈNH ===== */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>🔬 Biến SpEL Tùy Chỉnh (SQL Builder)</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
              Tạo biến mới bằng cách chọn hàm tổng hợp, bảng, cột, JOIN và WHERE. Biến mới dùng được ngay trong rules.
            </p>

            {/* Query Builder Form */}
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 12 }}>🔧 Tạo biến mới</div>

              {/* Row 1: Agg + Table + Column */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Hàm tổng hợp</div>
                  <select value={svAgg} onChange={e => setSvAgg(e.target.value)} style={inputStyle}>
                    {['COUNT', 'SUM', 'MAX', 'MIN', 'AVG'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Bảng</div>
                  <select value={svTable} onChange={e => { setSvTable(e.target.value); setSvColumn(svAgg === 'COUNT' ? 'id' : (spelMeta?.numericColumns?.[e.target.value]?.[0] || 'id')); }} style={inputStyle}>
                    {spelMeta?.tables && Object.keys(spelMeta.tables as Record<string, string[]>).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Cột</div>
                  <select value={svColumn} onChange={e => setSvColumn(e.target.value)} style={inputStyle}>
                    {svAgg === 'COUNT' && <option value="id">Tất cả (id)</option>}
                    {spelMeta?.numericColumns?.[svTable]?.filter((c: string) => svAgg === 'COUNT' || c !== 'id').map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: JOIN */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>JOIN bảng (tùy chọn)</div>
                  <select value={svJoinTable} onChange={e => {
                    setSvJoinTable(e.target.value);
                    const suggestions = spelMeta?.joinSuggestions?.[svTable]?.[e.target.value];
                    setSvJoinOn(suggestions?.[0] || '');
                  }} style={inputStyle}>
                    <option value="">— Không JOIN —</option>
                    {spelMeta?.tables && Object.keys(spelMeta.tables as Record<string, string[]>).filter(t => t !== svTable).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>JOIN type</div>
                  <select value={svJoinType} onChange={e => setSvJoinType(e.target.value)} style={inputStyle} disabled={!svJoinTable}>
                    {['INNER', 'LEFT', 'RIGHT'].map(jt => <option key={jt} value={jt}>{jt}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>ON column (từ bảng chính)</div>
                  <select value={svJoinOn} onChange={e => setSvJoinOn(e.target.value)} style={inputStyle} disabled={!svJoinTable}>
                    <option value="">— Chọn cột —</option>
                    {spelMeta?.tables?.[svTable]?.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div />
              </div>

              {/* Row 3: WHERE builder */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>WHERE:</span>
                  <button onClick={() => setSvWhere(prev => [...prev, { column: spelMeta?.tables?.[svTable]?.[0] || 'id', operator: '=', value: '', logic: 'AND' }])}
                    style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                    + Điều kiện
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {svWhere.map((w, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
                          <select value={w.logic} onChange={e => setSvWhere(prev => prev.map((x, i) => i === idx ? { ...x, logic: e.target.value } : x))}
                            style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', cursor: 'pointer' }}>
                            <option value="AND">Và (AND)</option>
                            <option value="OR">Hoặc (OR)</option>
                          </select>
                          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <select value={w.column} onChange={e => setSvWhere(prev => prev.map((x, i) => i === idx ? { ...x, column: e.target.value } : x))}
                          style={{ ...inputStyle, width: 160, flexShrink: 0 }}>
                          {spelMeta?.tables?.[svTable]?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={w.operator} onChange={e => setSvWhere(prev => prev.map((x, i) => i === idx ? { ...x, operator: e.target.value } : x))}
                          style={{ ...inputStyle, width: 70, flexShrink: 0, textAlign: 'center' }}>
                          {['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IS NULL', 'IS NOT NULL'].map(op => <option key={op} value={op}>{op}</option>)}
                        </select>
                        {w.operator !== 'IS NULL' && w.operator !== 'IS NOT NULL' && (
                          <input value={w.value} onChange={e => setSvWhere(prev => prev.map((x, i) => i === idx ? { ...x, value: e.target.value } : x))}
                            style={{ ...inputStyle, flex: 1 }} placeholder="Giá trị..." />
                        )}
                        <button onClick={() => setSvWhere(prev => prev.filter((_, i) => i !== idx))}
                          style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* SQL Preview */}
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', fontFamily: 'monospace', fontSize: 11, color: '#34d399', marginBottom: 12, whiteSpace: 'pre-wrap' }}>
                {spelPreview || '— Chọn các tham số để tạo SQL —'}
              </div>

              {/* Test button + Result */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>customer_id:</span>
                  <input type="number" min={1} value={testCustomerId} onChange={e => setTestCustomerId(Number(e.target.value))}
                    style={{ ...inputStyle, width: 60, textAlign: 'center', padding: '4px 6px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>agency_id:</span>
                  <input type="number" min={1} value={testAgencyId} onChange={e => setTestAgencyId(Number(e.target.value))}
                    style={{ ...inputStyle, width: 60, textAlign: 'center', padding: '4px 6px' }} />
                </div>
                <button onClick={handleTestSpelVar} disabled={testing || !spelPreview}
                  style={{ padding: '6px 16px', background: testing ? '#6b7280' : 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, fontWeight: 700, cursor: testing ? 'wait' : 'pointer', fontSize: 11 }}>
                  {testing ? '⏳ Đang chạy...' : '▶ Test Query'}
                </button>
                {testResult && (
                  <div style={{ flex: 1, padding: '8px 14px', borderRadius: 8, fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                    background: testResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    border: testResult.success ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                    color: testResult.success ? '#34d399' : '#ef4444' }}>
                    {testResult.success
                      ? <>✅ Kết quả: <span style={{ fontSize: 16, fontFamily: 'monospace' }}>{Number(testResult.result).toLocaleString('vi-VN')}</span></>
                      : <>❌ {testResult.error}</>}
                  </div>
                )}
              </div>

              {/* Name + Description + Save */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, alignItems: 'end' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Tên biến (VD: donHangThanhCong)</div>
                  <input value={svName} onChange={e => setSvName(e.target.value)} style={inputStyle} placeholder="#tenBien" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Mô tả</div>
                  <input value={svDesc} onChange={e => setSvDesc(e.target.value)} style={inputStyle} placeholder="Mô tả biến..." />
                </div>
                <button onClick={handleSaveSpelVar} style={{ padding: '8px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12, height: 36 }}>
                  💾 Lưu Biến
                </button>
              </div>
              {svMsg && <div style={{ fontSize: 12, marginTop: 8, color: svMsg.startsWith('✅') ? '#34d399' : '#ef4444' }}>{svMsg}</div>}
            </div>

            {/* Danh sách biến đã tạo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {spelVars.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: 12, textAlign: 'center' }}>Chưa có biến tùy chỉnh nào.</div>}
              {spelVars.map(sv => (
                <div key={sv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <span style={{ fontSize: 16 }}>📊</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#34d399', fontFamily: 'monospace' }}>{sv.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sv.description || '—'}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: 2, opacity: 0.7 }}>{sv.generatedSql}</div>
                  </div>
                  <button onClick={() => handleDeleteSpelVar(sv.id)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>🗑️</button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && <CertificateModal cert={selectedCert} onClose={() => setSelectedCert(null)} />}
    </div>
  );
}
