'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
  guideApi,
  guideTargetApi,
  GuideDTO,
  GuideStepDTO,
  GuideTargetDTO,
  CreateGuideRequest,
  CreateGuideStepRequest,
} from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function GuideDetailPage({ params }: PageProps) {
  const resolvedParams = 'then' in params ? use(params as Promise<{ id: string }>) : params as { id: string };
  const guideId = resolvedParams.id;
  const isNew = guideId === 'new';
  const router = useRouter();
  const { user } = useAuth();

  const [guide, setGuide] = useState<GuideDTO | null>(null);
  const [targets, setTargets] = useState<GuideTargetDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CreateGuideRequest>({
    name: '', description: '', version: 1, isActive: true, conditions: '',
  });

  const [steps, setSteps] = useState<GuideStepDTO[]>([]);
  const [showStepForm, setShowStepForm] = useState(false);
  const [stepForm, setStepForm] = useState<CreateGuideStepRequest>({
    targetId: 0, title: '', description: '', placement: 'bottom', stepOrder: 0,
  });
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  const isAdmin = user?.roles?.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [targetsData] = await Promise.all([
        guideTargetApi.getAll(),
      ]);
      setTargets(targetsData || []);

      if (!isNew) {
        const guideData = await guideApi.getById(Number(guideId));
        setGuide(guideData);
        setForm({
          name: guideData.name,
          description: guideData.description || '',
          version: guideData.version,
          isActive: guideData.isActive,
          conditions: guideData.conditions || '',
        });
        setSteps(guideData.steps || []);
      }
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGuide = async () => {
    setSaving(true);
    try {
      if (isNew) {
        await guideApi.create(form);
        router.push('/admin/guides');
      } else {
        await guideApi.update(Number(guideId), form);
        alert('Đã lưu guide');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu guide');
    } finally {
      setSaving(false);
    }
  };

  const resetStepForm = () => {
    setStepForm({ targetId: 0, title: '', description: '', placement: 'bottom', stepOrder: steps.length + 1 });
    setEditingStepIndex(null);
    setShowStepForm(false);
  };

  const openAddStepForm = () => {
    setStepForm({ targetId: 0, title: '', description: '', placement: 'bottom', stepOrder: steps.length + 1 });
    setEditingStepIndex(null);
    setShowStepForm(true);
  };

  const openEditStep = (index: number) => {
    const s = steps[index];
    setStepForm({
      targetId: s.targetId,
      title: s.title,
      description: s.description || '',
      placement: s.placement,
      stepOrder: s.stepOrder,
      navigateToScreen: s.navigateToScreen,
      navigateToParams: s.navigateToParams,
    });
    setEditingStepIndex(index);
    setShowStepForm(true);
  };

  const handleSaveStep = async () => {
    if (!guide && !isNew) return;
    setSaving(true);
    try {
      let savedStep: GuideStepDTO;
      const id = Number(guideId);
      if (editingStepIndex !== null && guide) {
        const existingStep = steps[editingStepIndex];
        savedStep = await guideApi.updateStep(id, existingStep.id, stepForm);
        const newSteps = [...steps];
        newSteps[editingStepIndex] = savedStep;
        setSteps(newSteps);
      } else {
        savedStep = await guideApi.addStep(id, stepForm);
        setSteps([...steps, savedStep]);
      }
      resetStepForm();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu step');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = async (index: number) => {
    if (!confirm('Xóa bước này?')) return;
    if (guide) {
      try {
        await guideApi.deleteStep(guide.id, steps[index].id);
      } catch {
        alert('Không thể xóa step');
        return;
      }
    }
    setSteps(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const newSteps = [...steps];
    const target = index + direction;
    if (target < 0 || target >= newSteps.length) return;
    [newSteps[index], newSteps[target]] = [newSteps[target], newSteps[index]];
    setSteps(newSteps);
  };

  const getTargetName = (targetId: number) => {
    return targets.find(t => t.id === targetId)?.name || `Target #${targetId}`;
  };

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] text-[var(--text-secondary)] text-sm">Bạn không có quyền truy cập module này.</div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="main-content bg-grid">
          <div className="flex items-center justify-center min-h-[40vh] text-[var(--text-secondary)]">Đang tải...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="main-content bg-grid">
        <PageHeader
          title={isNew ? 'Tạo Guide mới' : `Chỉnh sửa Guide: ${guide?.name}`}
          subtitle="Thiết lập thông tin guide và các bước hướng dẫn"
          icon="BookOpen"
        />

        {/* Guide info form */}
        <div className="card p-6 mb-6" style={{ borderRadius: 12 }}>
          <h3 className="text-base font-bold mb-4">Thông tin Guide</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">Tên guide *</label>
              <input className="input w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Hướng dẫn danh mục sản phẩm" />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">Version</label>
              <input className="input w-full" type="number" value={form.version} onChange={e => setForm({ ...form, version: Number(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">Mô tả</label>
              <textarea className="input w-full" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả guide này dùng để làm gì..." />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">Conditions (JSON)</label>
              <input className="input w-full" value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })} placeholder='{"role": "AGENCY"}' />
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                <span className="text-sm">Kích hoạt</span>
              </label>
            </div>
          </div>
          <button className="btn-primary mt-4" onClick={handleSaveGuide} disabled={saving}>
            <Save size={16} /> {isNew ? 'Tạo guide' : 'Lưu guide'}
          </button>
        </div>

        {/* Steps section */}
        <div className="card p-6" style={{ borderRadius: 12 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">Các bước hướng dẫn</h3>
            {!isNew && (
              <button className="btn-primary" onClick={openAddStepForm}>
                <Plus size={16} /> Thêm bước
              </button>
            )}
          </div>

          {isNew && (
            <p className="text-sm text-[var(--text-secondary)]">Lưu guide trước để có thể thêm các bước hướng dẫn.</p>
          )}

          {steps.length === 0 && !isNew && (
            <p className="text-sm text-[var(--text-secondary)]">Chưa có bước hướng dẫn nào.</p>
          )}

          {steps.map((step, index) => (
            <div key={step.id || index} className="flex items-center gap-3 p-3 mb-2" style={{ background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div className="flex flex-col gap-1">
                <button className="btn-outline p-1" style={{ borderRadius: 4, lineHeight: 1 }} onClick={() => moveStep(index, -1)} disabled={index === 0}>
                  <ArrowUp size={12} />
                </button>
                <button className="btn-outline p-1" style={{ borderRadius: 4, lineHeight: 1 }} onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1}>
                  <ArrowDown size={12} />
                </button>
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs" style={{ background: 'var(--accent)', color: 'white', minWidth: 32 }}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{step.title}</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Target: {getTargetName(step.targetId)} | Placement: {step.placement}
                  {step.navigateToScreen && ` | Điều hướng: ${step.navigateToScreen}`}
                </div>
              </div>
              <button className="btn-outline p-2" style={{ borderRadius: 8 }} onClick={() => openEditStep(index)}>
                <Save size={14} />
              </button>
              <button className="btn-outline p-2 text-red-400 border-red-950/20" style={{ borderRadius: 8 }} onClick={() => handleDeleteStep(index)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Step form */}
          {showStepForm && (
            <div className="p-4 mt-4" style={{ background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--accent)' }}>
              <h4 className="text-sm font-bold mb-3">{editingStepIndex !== null ? 'Sửa bước' : 'Thêm bước mới'}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Target *</label>
                  <select className="input w-full" value={stepForm.targetId} onChange={e => setStepForm({ ...stepForm, targetId: Number(e.target.value) })}>
                    <option value={0}>-- Chọn target --</option>
                    {targets.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.key})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Placement *</label>
                  <select className="input w-full" value={stepForm.placement} onChange={e => setStepForm({ ...stepForm, placement: e.target.value })}>
                    <option value="bottom">Bottom</option>
                    <option value="top">Top</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Tiêu đề *</label>
                  <input className="input w-full" value={stepForm.title} onChange={e => setStepForm({ ...stepForm, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Thứ tự *</label>
                  <input className="input w-full" type="number" value={stepForm.stepOrder} onChange={e => setStepForm({ ...stepForm, stepOrder: Number(e.target.value) })} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Mô tả</label>
                  <textarea className="input w-full" rows={2} value={stepForm.description} onChange={e => setStepForm({ ...stepForm, description: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Điều hướng đến màn hình</label>
                  <input className="input w-full" value={stepForm.navigateToScreen || ''} onChange={e => setStepForm({ ...stepForm, navigateToScreen: e.target.value })} placeholder="Ví dụ: CategoryList" />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Params (JSON)</label>
                  <input className="input w-full" value={stepForm.navigateToParams || ''} onChange={e => setStepForm({ ...stepForm, navigateToParams: e.target.value })} placeholder='{"categoryId": 1}' />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn-primary" onClick={handleSaveStep} disabled={saving}>
                  {editingStepIndex !== null ? 'Cập nhật' : 'Thêm'}
                </button>
                <button className="btn-outline" onClick={resetStepForm}>Hủy</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
