'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { accumulationApi } from '@/modules/accumulation/accumulationApi';
import { agencyApi, AgencyDTO } from '@/modules/agency/agencyApi';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import { Plus, Trash2, Save } from 'lucide-react';

interface TierForm {
  tierIndex: number;
  thresholdValue: number;
  rebateRate: number;
}

export default function NewAccumulationProgramPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [agencies, setAgencies] = useState<AgencyDTO[]>([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    rebateCalculationType: 'HIGHEST_THRESHOLD',
    active: true,
    unlimited: false,
  });
  const [tiers, setTiers] = useState<TierForm[]>([
    { tierIndex: 0, thresholdValue: 100000000, rebateRate: 0.02 },
  ]);
  const [selectedAgencyIds, setSelectedAgencyIds] = useState<number[]>([]);

  useEffect(() => {
    agencyApi.getAll().then(setAgencies).catch(() => {});
  }, []);

  const addTier = () => {
    const last = tiers[tiers.length - 1];
    setTiers([...tiers, {
      tierIndex: tiers.length,
      thresholdValue: (last?.thresholdValue || 0) + 100000000,
      rebateRate: (last?.rebateRate || 0) + 0.01,
    }]);
  };

  const removeTier = (idx: number) => {
    setTiers(tiers.filter((_, i) => i !== idx).map((t, i) => ({ ...t, tierIndex: i })));
  };

  const toggleAgency = (id: number) => {
    setSelectedAgencyIds(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (tiers.length === 0) {
      alert('Vui lòng thêm ít nhất 1 mốc hạn mức');
      return;
    }
    if (selectedAgencyIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 đại lý tham gia');
      return;
    }

    setSaving(true);
    try {
      const result = await accumulationApi.create({
        name: form.name,
        description: form.description,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        rebateCalculationType: form.rebateCalculationType,
        active: form.active,
        unlimited: form.unlimited,
        tiers: tiers.map(t => ({
          tierIndex: t.tierIndex,
          thresholdValue: t.thresholdValue,
          rebateRate: t.rebateRate,
        })),
        agencyIds: selectedAgencyIds,
      });
      router.push(`/accumulation-programs/${result.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = user?.roles?.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));
  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-[80vh] text-[var(--text-secondary)] text-sm">Truy cập bị từ chối</div>;
  }

  return (
    <main className="main-content bg-grid">
      <PageHeader title="Tạo chương trình tích lũy" subtitle="Thiết lập chương trình tích lũy mới" icon="ShieldCheck" />

      <div style={{ display: 'grid', gap: 24, maxWidth: 900 }}>
        <GlassCard style={{ padding: 24 }}>
          <h3 className="text-lg font-semibold mb-4">Thông tin chương trình</h3>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="form-label">Tên chương trình *</label>
              <input className="form-input" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Tích lũy Q3/2026" />
            </div>
            <div>
              <label className="form-label">Mô tả</label>
              <textarea className="form-input" rows={3} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Ngày bắt đầu *</label>
                <input className="form-input" type="datetime-local" value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Ngày kết thúc *</label>
                <input className="form-input" type="datetime-local" value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="form-label">Hình thức tính hoa hồng</label>
              <select className="form-input" value={form.rebateCalculationType}
                onChange={e => setForm({ ...form, rebateCalculationType: e.target.value })}>
                <option value="HIGHEST_THRESHOLD">Mốc cao nhất (HIGHEST_THRESHOLD)</option>
                <option value="TIERED_PROGRESSIVE">Lũy tiến bậc thang (TIERED_PROGRESSIVE)</option>
              </select>
            </div>
            {form.rebateCalculationType === 'TIERED_PROGRESSIVE' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.unlimited}
                  onChange={e => setForm({ ...form, unlimited: e.target.checked })} />
                <span className="text-sm">Không giới hạn (bậc cuối không có trần, phần dư tính tại rate bậc cuối)</span>
              </label>
            )}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="text-lg font-semibold">Mốc hạn mức (Tiers)</h3>
            <button className="btn-outline" onClick={addTier} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Thêm mốc
            </button>
          </div>
          {tiers.map((tier, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <span className="text-sm text-[var(--text-muted)] w-6">{idx + 1}</span>
              <div style={{ flex: 1 }}>
                <label className="form-label text-xs">Mốc doanh số (VNĐ)</label>
                <input className="form-input" type="number" value={tier.thresholdValue}
                  onChange={e => {
                    const newTiers = [...tiers];
                    newTiers[idx].thresholdValue = Number(e.target.value);
                    setTiers(newTiers);
                  }} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label text-xs">Tỷ lệ hoa hồng (%)</label>
                <input className="form-input" type="number" step="0.001" value={tier.rebateRate * 100}
                  onChange={e => {
                    const newTiers = [...tiers];
                    newTiers[idx].rebateRate = Number(e.target.value) / 100;
                    setTiers(newTiers);
                  }} />
              </div>
              {tiers.length > 1 && (
                <button className="btn-outline p-2 text-red-400" style={{ borderRadius: 8, marginTop: 20 }}
                  onClick={() => removeTier(idx)}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </GlassCard>

        <GlassCard style={{ padding: 24 }}>
          <h3 className="text-lg font-semibold mb-4">Đại lý tham gia</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {agencies.map(a => (
              <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 8px', borderRadius: 6, background: selectedAgencyIds.includes(a.id) ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
                <input type="checkbox" checked={selectedAgencyIds.includes(a.id)}
                  onChange={() => toggleAgency(a.id)} />
                <span className="text-sm">{a.name}</span>
              </label>
            ))}
          </div>
        </GlassCard>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn-outline" onClick={() => router.back()}>Hủy</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={16} /> {saving ? 'Đang lưu...' : 'Tạo chương trình'}
          </button>
        </div>
      </div>
    </main>
  );
}
