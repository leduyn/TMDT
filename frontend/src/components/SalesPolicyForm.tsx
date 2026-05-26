'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Trash2, Settings, Eye, HelpCircle, Check, DollarSign, Gift, 
  TrendingUp, AlertCircle, Calendar, Tag, Info, ArrowLeft, Save,
  Globe, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { 
  salesPolicyApi, 
  agencyApi, 
  productApi, 
  categoryApi, 
  AgencyDTO, 
  ProductDTO, 
  CategoryDTO,
  SalesPolicyDTO,
  SalesPolicyRequest
} from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';

interface GroupItem {
  id: string;
  type: 'PRODUCT' | 'CATEGORY';
  targetId: number;
  description: string;
  isEditing?: boolean;
}

interface ProductGroup {
  id: string;
  name: string;
  items: GroupItem[];
  isExpanded: boolean;
}

interface ExcludedItem {
  id: string;
  type: 'PRODUCT' | 'CATEGORY';
  targetId: number;
  isEditing?: boolean;
}

interface SalesPolicyFormProps {
  initialId?: number | null;
}

export default function SalesPolicyForm({ initialId = null }: SalesPolicyFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  const [activeAudienceTab, setActiveAudienceTab] = useState<'filters' | 'included' | 'excluded'>('filters');
  const [activeProductTab, setActiveProductTab] = useState<'applied' | 'excluded'>('applied');
  
  const [appliedGroups, setAppliedGroups] = useState<ProductGroup[]>([
    { id: 'group-1', name: 'NHÓM 1', items: [], isExpanded: true }
  ]);
  const [tempExcludedItems, setTempExcludedItems] = useState<ExcludedItem[]>([]);
  
  // Data lists from backend
  const [agencies, setAgencies] = useState<AgencyDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Main Form State
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagText, setNewTagText] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const [maxOrderCount, setMaxOrderCount] = useState<number | ''>('');
  const [maxApplicationPerAgency, setMaxApplicationPerAgency] = useState<number | ''>('');
  
  const [targetType, setTargetType] = useState<'ORDER_VALUE' | 'PRODUCT_QTY' | 'PRODUCT_REVENUE'>('ORDER_VALUE');
  const [maxDiscountValue, setMaxDiscountValue] = useState<number | ''>('');
  const [applyToAllProducts, setApplyToAllProducts] = useState(true);

  // Relationships Selection
  const [includedAgencyIds, setIncludedAgencyIds] = useState<number[]>([]);
  const [excludedAgencyIds, setExcludedAgencyIds] = useState<number[]>([]);
  const [targetProductIds, setTargetProductIds] = useState<number[]>([]);
  const [targetCategoryIds, setTargetCategoryIds] = useState<number[]>([]);
  const [excludedProductIds, setExcludedProductIds] = useState<number[]>([]);
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<number[]>([]);

  // Audience Filters (Multiple filters connected by OR)
  const [audienceFilters, setAudienceFilters] = useState<Array<{
    rankLevels: string[]; // ['MEMBER', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']
    provinces: string[];
  }>>([
    { rankLevels: [], provinces: [] }
  ]);

  // Tiers (Multiple thresholds connected by AND/OR tier progression)
  const [tiers, setTiers] = useState<Array<{
    tierIndex: number;
    operator: string;
    thresholdValue: number;
    adjustmentType: string;
    adjustmentValue: number;
    giftProductId: number | '';
    giftQuantity: number;
    giftNote: string;
  }>>([
    { tierIndex: 1, operator: 'GTE', thresholdValue: 10000000, adjustmentType: 'PERCENTAGE', adjustmentValue: 2, giftProductId: '', giftQuantity: 1, giftNote: '' }
  ]);

  const RANKS = ['Thành Viên', 'Bạc', 'Titan', 'Vàng', 'Bạch Kim'];
  const PROVINCES = ['Miền Bắc', 'Miền Trung', 'Miền Nam'];

  useEffect(() => {
    loadMetaData();
  }, []);

  const loadMetaData = async () => {
    setIsLoading(true);
    try {
      const [agenciesData, productsData, categoriesData] = await Promise.all([
        agencyApi.getAll(),
        productApi.getAll(),
        categoryApi.getAll()
      ]);
      setAgencies(agenciesData || []);
      setProducts(productsData || []);
      setCategories(categoriesData || []);

      if (initialId) {
        await loadExistingPolicy(initialId, productsData);
      }
    } catch (err) {
      console.error('Failed to load metadata', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingPolicy = async (id: number, loadedProducts: ProductDTO[]) => {
    try {
      const p: SalesPolicyDTO = await salesPolicyApi.getById(id);
      setName(p.name);
      setActive(p.active);
      setDescription(p.description || '');
      setStartDate(p.startDate ? p.startDate.split('T')[0] : '');
      setEndDate(p.endDate ? p.endDate.split('T')[0] : '');
      setTags(p.tags ? p.tags.split(',').filter(Boolean) : []);
      
      setMaxOrderCount(p.maxOrderCount !== null && p.maxOrderCount !== undefined ? p.maxOrderCount : '');
      setMaxApplicationPerAgency(p.maxApplicationPerAgency !== null && p.maxApplicationPerAgency !== undefined ? p.maxApplicationPerAgency : '');
      setTargetType((p.targetType as any) || 'ORDER_VALUE');
      setMaxDiscountValue(p.maxDiscountValue !== null && p.maxDiscountValue !== undefined ? p.maxDiscountValue : '');
      setApplyToAllProducts(p.applyToAllProducts);

      setIncludedAgencyIds(p.includedAgencyIds || []);
      setExcludedAgencyIds(p.excludedAgencyIds || []);
      setTargetProductIds(p.targetProductIds || []);
      setTargetCategoryIds(p.targetCategoryIds || []);
      setExcludedProductIds(p.excludedProductIds || []);
      setExcludedCategoryIds(p.excludedCategoryIds || []);

      // Load product groups or fallback to target products & categories
      if (p.productGroups && p.productGroups.length > 0) {
        const mappedGroups = p.productGroups.map((g, idx) => ({
          id: `group-${g.id || idx}`,
          name: g.groupName,
          isExpanded: idx === 0,
          items: (g.items || []).map(item => ({
            id: `item-${item.id}`,
            type: item.itemType,
            targetId: item.itemId,
            description: item.description || '',
            isEditing: false
          }))
        }));
        setAppliedGroups(mappedGroups);
      } else {
        const loadedGroupItems: GroupItem[] = [];
        (p.targetProductIds || []).forEach(pid => {
          loadedGroupItems.push({ id: `prod-${pid}`, type: 'PRODUCT', targetId: pid, description: '' });
        });
        (p.targetCategoryIds || []).forEach(cid => {
          loadedGroupItems.push({ id: `cat-${cid}`, type: 'CATEGORY', targetId: cid, description: '' });
        });

        if (loadedGroupItems.length > 0) {
          setAppliedGroups([
            { id: 'group-1', name: 'NHÓM 1', items: loadedGroupItems, isExpanded: true }
          ]);
        } else {
          setAppliedGroups([
            { id: 'group-1', name: 'NHÓM 1', items: [], isExpanded: true }
          ]);
        }
      }

      // Load excluded products & categories
      const loadedExcludedItems: ExcludedItem[] = [];
      (p.excludedProductIds || []).forEach(pid => {
        loadedExcludedItems.push({ id: `excl-prod-${pid}`, type: 'PRODUCT', targetId: pid });
      });
      (p.excludedCategoryIds || []).forEach(cid => {
        loadedExcludedItems.push({ id: `excl-cat-${cid}`, type: 'CATEGORY', targetId: cid });
      });
      setTempExcludedItems(loadedExcludedItems);

      if (p.audienceFilters && p.audienceFilters.length > 0) {
        setAudienceFilters(p.audienceFilters.map(f => ({
          rankLevels: f.rankLevels ? f.rankLevels.split(',') : [],
          provinces: f.provinces ? f.provinces.split(',') : []
        })));
      } else {
        setAudienceFilters([{ rankLevels: [], provinces: [] }]);
      }

      if (p.tiers && p.tiers.length > 0) {
        setTiers(p.tiers.map(t => ({
          tierIndex: t.tierIndex,
          operator: t.operator || 'GTE',
          thresholdValue: t.thresholdValue || 0,
          adjustmentType: t.adjustmentType || 'PERCENTAGE',
          adjustmentValue: t.adjustmentValue || 0,
          giftProductId: t.giftProductId || '',
          giftQuantity: t.giftQuantity || 1,
          giftNote: t.giftNote || ''
        })));
      } else {
        setTiers([{ tierIndex: 1, operator: 'GTE', thresholdValue: 0, adjustmentType: 'PERCENTAGE', adjustmentValue: 0, giftProductId: '', giftQuantity: 1, giftNote: '' }]);
      }
    } catch (err) {
      console.error('Failed to load existing sales policy', err);
      alert('Không thể tải dữ liệu chương trình ưu đãi.');
    }
  };

  const handleAddTag = () => {
    if (newTagText.trim() && !tags.includes(newTagText.trim())) {
      setTags([...tags, newTagText.trim()]);
      setNewTagText('');
    }
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Audience filters management
  const handleToggleRankInFilter = (filterIdx: number, rank: string) => {
    const updated = [...audienceFilters];
    const currentRanks = updated[filterIdx].rankLevels;
    if (currentRanks.includes(rank)) {
      updated[filterIdx].rankLevels = currentRanks.filter(r => r !== rank);
    } else {
      updated[filterIdx].rankLevels = [...currentRanks, rank];
    }
    setAudienceFilters(updated);
  };

  const handleToggleProvinceInFilter = (filterIdx: number, province: string) => {
    const updated = [...audienceFilters];
    const currentProvinces = updated[filterIdx].provinces;
    if (currentProvinces.includes(province)) {
      updated[filterIdx].provinces = currentProvinces.filter(p => p !== province);
    } else {
      updated[filterIdx].provinces = [...currentProvinces, province];
    }
    setAudienceFilters(updated);
  };

  const handleAddAudienceFilter = () => {
    setAudienceFilters([...audienceFilters, { rankLevels: [], provinces: [] }]);
  };

  const handleRemoveAudienceFilter = (idx: number) => {
    if (audienceFilters.length === 1) {
      setAudienceFilters([{ rankLevels: [], provinces: [] }]);
    } else {
      setAudienceFilters(audienceFilters.filter((_, i) => i !== idx));
    }
  };

  // Product scope groups & excluded items management helpers
  const handleAddGroup = () => {
    const newIdx = appliedGroups.length + 1;
    setAppliedGroups([
      ...appliedGroups,
      { id: `group-${Date.now()}`, name: `NHÓM ${newIdx}`, items: [], isExpanded: true }
    ]);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (appliedGroups.length === 1) {
      alert('Phải có nhất một nhóm sản phẩm!');
      return;
    }
    const filtered = appliedGroups.filter(g => g.id !== groupId);
    const reindexed = filtered.map((g, i) => ({
      ...g,
      name: `NHÓM ${i + 1}`
    }));
    setAppliedGroups(reindexed);
  };

  const handleToggleGroupExpansion = (groupId: string) => {
    setAppliedGroups(
      appliedGroups.map(g => g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g)
    );
  };

  const handleAddItemToGroup = (groupId: string) => {
    setAppliedGroups(
      appliedGroups.map(g => {
        if (g.id === groupId) {
          const newItem: GroupItem = {
            id: `item-${Date.now()}`,
            type: 'PRODUCT',
            targetId: 0,
            description: '',
            isEditing: true
          };
          return { ...g, items: [...g.items, newItem] };
        }
        return g;
      })
    );
  };

  const handleSaveGroupItem = (groupId: string, itemId: string, type: 'PRODUCT' | 'CATEGORY', targetId: number) => {
    if (!targetId) {
      alert('Vui lòng chọn sản phẩm hoặc danh mục!');
      return;
    }
    let hasDuplicate = false;
    setAppliedGroups(prev => {
      return prev.map(g => {
        if (g.id === groupId) {
          const duplicate = g.items.some(item => item.id !== itemId && item.type === type && item.targetId === targetId);
          if (duplicate) {
            hasDuplicate = true;
            return g;
          }
          return {
            ...g,
            items: g.items.map(item => item.id === itemId ? { ...item, type, targetId, isEditing: false } : item)
          };
        }
        return g;
      });
    });
    if (hasDuplicate) {
      alert('Sản phẩm hoặc danh mục này đã tồn tại trong nhóm!');
    }
  };

  const handleRemoveItemFromGroup = (groupId: string, itemId: string) => {
    setAppliedGroups(
      appliedGroups.map(g => {
        if (g.id === groupId) {
          return { ...g, items: g.items.filter(item => item.id !== itemId) };
        }
        return g;
      })
    );
  };

  const handleUpdateItemDescription = (groupId: string, itemId: string, desc: string) => {
    setAppliedGroups(
      appliedGroups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            items: g.items.map(item => item.id === itemId ? { ...item, description: desc } : item)
          };
        }
        return g;
      })
    );
  };

  const handleAddExcludedItem = () => {
    const newItem: ExcludedItem = {
      id: `excl-${Date.now()}`,
      type: 'PRODUCT',
      targetId: 0,
      isEditing: true
    };
    setTempExcludedItems([...tempExcludedItems, newItem]);
  };

  const handleSaveExcludedItem = (itemId: string, type: 'PRODUCT' | 'CATEGORY', targetId: number) => {
    if (!targetId) {
      alert('Vui lòng chọn sản phẩm hoặc danh mục!');
      return;
    }
    const duplicate = tempExcludedItems.some(item => item.id !== itemId && item.type === type && item.targetId === targetId);
    if (duplicate) {
      alert('Sản phẩm hoặc danh mục loại trừ này đã tồn tại!');
      return;
    }
    setTempExcludedItems(
      tempExcludedItems.map(item => item.id === itemId ? { ...item, type, targetId, isEditing: false } : item)
    );
  };

  const handleRemoveExcludedItem = (itemId: string) => {
    setTempExcludedItems(tempExcludedItems.filter(item => item.id !== itemId));
  };

  // Tiers management
  const handleAddTier = () => {
    const nextIndex = tiers.length + 1;
    setTiers([...tiers, {
      tierIndex: nextIndex,
      operator: 'GTE',
      thresholdValue: 0,
      adjustmentType: 'PERCENTAGE',
      adjustmentValue: 0,
      giftProductId: '',
      giftQuantity: 1,
      giftNote: ''
    }]);
  };

  const handleRemoveTier = (idx: number) => {
    if (tiers.length === 1) {
      alert('Chương trình ưu đãi phải có ít nhất một mức điều kiện!');
      return;
    }
    const updated = tiers.filter((_, i) => i !== idx).map((t, i) => ({
      ...t,
      tierIndex: i + 1
    }));
    setTiers(updated);
  };

  const handleUpdateTierField = (idx: number, field: string, value: any) => {
    const updated = [...tiers];
    updated[idx] = { ...updated[idx], [field]: value };
    setTiers(updated);
  };

  // Toggle selection lists
  const toggleItemInList = (list: number[], setList: (l: number[]) => void, id: number) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên chương trình ưu đãi!');
      return;
    }

    // Map applied groups to payload structure and extract flat lists for backward compatibility
    const finalTargetProductIds: number[] = [];
    const finalTargetCategoryIds: number[] = [];
    const finalProductGroups: any[] = [];

    if (!applyToAllProducts) {
      appliedGroups.forEach(g => {
        const groupItems = g.items
          .filter(item => !item.isEditing && item.targetId > 0)
          .map(item => {
            if (item.type === 'PRODUCT') {
              finalTargetProductIds.push(item.targetId);
            } else {
              finalTargetCategoryIds.push(item.targetId);
            }
            return {
              itemType: item.type,
              itemId: item.targetId,
              description: item.description || ''
            };
          });

        finalProductGroups.push({
          groupName: g.name,
          items: groupItems
        });
      });
    }

    // Map temp excluded items back to flat arrays
    const finalExcludedProductIds: number[] = [];
    const finalExcludedCategoryIds: number[] = [];
    tempExcludedItems.forEach(item => {
      if (!item.isEditing) {
        if (item.type === 'PRODUCT') {
          finalExcludedProductIds.push(item.targetId);
        } else {
          finalExcludedCategoryIds.push(item.targetId);
        }
      }
    });

    const requestPayload: SalesPolicyRequest = {
      name,
      active,
      description,
      startDate: startDate ? startDate + 'T00:00:00' : undefined,
      endDate: endDate ? endDate + 'T23:59:59' : undefined,
      tags: tags.join(','),
      maxOrderCount: maxOrderCount === '' ? undefined : Number(maxOrderCount),
      maxApplicationPerAgency: maxApplicationPerAgency === '' ? undefined : Number(maxApplicationPerAgency),
      targetType,
      maxDiscountValue: maxDiscountValue === '' ? undefined : Number(maxDiscountValue),
      applyToAllProducts,
      includedAgencyIds,
      excludedAgencyIds,
      targetProductIds: finalTargetProductIds,
      targetCategoryIds: finalTargetCategoryIds,
      productGroups: finalProductGroups,
      excludedProductIds: finalExcludedProductIds,
      excludedCategoryIds: finalExcludedCategoryIds,
      audienceFilters: audienceFilters.map(f => ({
        rankLevels: f.rankLevels.join(','),
        provinces: f.provinces.join(',')
      })),
      tiers: tiers.map(t => ({
        tierIndex: t.tierIndex,
        operator: t.operator,
        thresholdValue: Number(t.thresholdValue),
        adjustmentType: t.adjustmentType,
        adjustmentValue: Number(t.adjustmentValue),
        giftProductId: t.giftProductId === '' ? undefined : Number(t.giftProductId),
        giftQuantity: Number(t.giftQuantity),
        giftNote: t.giftNote
      }))
    };

    setIsLoading(true);
    try {
      if (initialId) {
        await salesPolicyApi.update(initialId, requestPayload);
        alert('Cập nhật chương trình ưu đãi thành công!');
      } else {
        await salesPolicyApi.create(requestPayload);
        alert('Tạo chương trình ưu đãi mới thành công!');
      }
      router.push('/sales-policies');
    } catch (err: any) {
      console.error('Failed to save policy', err);
      alert(err.message || 'Lỗi khi lưu chương trình ưu đãi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialId) return;
    if (!confirm('Bạn có chắc chắn muốn xóa chương trình ưu đãi này? Hành động này không thể hoàn tác.')) return;

    setIsLoading(true);
    try {
      await salesPolicyApi.delete(initialId);
      alert('Đã xóa chương trình ưu đãi thành công!');
      router.push('/sales-policies');
    } catch (err) {
      console.error('Failed to delete policy', err);
      alert('Không thể xóa chương trình ưu đãi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6" style={{ minHeight: '90vh' }}>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/sales-policies')}
            className="btn-outline" 
            style={{ padding: '8px 12px', borderRadius: 8 }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-primary px-2.5 py-0.5" style={{ fontSize: '0.75rem', borderRadius: 6 }}>
                KVMD-{initialId ? String(initialId).padStart(3, '0') : 'NEW'}
              </span>
              <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                {initialId ? 'Chi tiết chương trình ưu đãi' : 'Tạo mới chương trình ưu đãi'}
              </h1>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Cấu hình các mức điều kiện và cơ cấu tặng quà cho đại lý</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {initialId && (
            <button 
              onClick={handleDelete}
              className="btn-outline flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/20"
              style={{ padding: '10px 18px', borderRadius: 10, borderColor: 'rgba(239, 68, 68, 0.3)' }}
              disabled={isLoading}
            >
              <Trash2 size={16} />
              Xóa chương trình
            </button>
          )}
          <button 
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
            disabled={isLoading}
          >
            <Save size={16} />
            {isLoading ? 'Đang xử lý...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* TABS SELECTOR (Config & Preview) */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-slate-900/60 p-1 border border-[var(--border)] rounded-xl" style={{ backdropFilter: 'blur(10px)' }}>
          <button 
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'config' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            <Settings size={16} />
            Cấu hình ưu đãi
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            <Eye size={16} />
            Preview hiển thị
          </button>
        </div>
      </div>

      {activeTab === 'config' ? (
        <div className="flex flex-col gap-6">
          
          {/* SECTION 1: THÔNG TIN ƯU ĐÃI */}
          <GlassCard style={{ padding: 24 }}>
            <div className="flex items-center gap-2.5 mb-6 text-[var(--accent-light)] border-b border-[var(--border)] pb-3">
              <Calendar size={18} />
              <h2 className="text-sm font-bold uppercase tracking-wider">Thông tin ưu đãi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <label className="form-label">Tên ưu đãi *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="input-field" 
                  placeholder="Ví dụ: Chương trình khuyến mãi hè 2026 - Nhận quà lớn"
                />
              </div>

              <div>
                <label className="form-label">Ngày bắt đầu *</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                    className="input-field pl-10" 
                  />
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                </div>
              </div>

              <div>
                <label className="form-label">Ngày kết thúc</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                    className="input-field pl-10" 
                  />
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                </div>
              </div>

              <div>
                <label className="form-label">Trạng thái ưu đãi</label>
                <div className="flex items-center h-12">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={active} 
                      onChange={e => setActive(e.target.checked)} 
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--success)]"></div>
                    <span className="ml-3 text-sm font-medium text-[var(--text-primary)]">
                      {active ? 'Đang hoạt động' : 'Tạm ngưng'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label">Số lượng đơn tối đa</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={maxOrderCount} 
                    onChange={e => setMaxOrderCount(e.target.value === '' ? '' : Number(e.target.value))} 
                    className="input-field" 
                    placeholder="Không giới hạn"
                  />
                  {maxOrderCount === '' && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">Không giới hạn</span>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Lượt áp dụng / Đại lý</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={maxApplicationPerAgency} 
                    onChange={e => setMaxApplicationPerAgency(e.target.value === '' ? '' : Number(e.target.value))} 
                    className="input-field" 
                    placeholder="Không giới hạn"
                  />
                  {maxApplicationPerAgency === '' && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">Không giới hạn</span>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Tag hiển thị (Hỗ trợ bán hàng)</label>
                <div className="flex flex-wrap gap-2 items-center p-1.5 bg-slate-950/20 border border-[var(--border)] rounded-xl min-h-[46px]">
                  {tags.map(t => (
                    <span key={t} className="badge badge-primary flex items-center gap-1.5 pr-1.5 py-1">
                      {t}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-400 font-bold text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {showTagInput ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="text" 
                        value={newTagText} 
                        onChange={e => setNewTagText(e.target.value)}
                        onBlur={handleAddTag}
                        onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                        className="bg-transparent text-sm text-[var(--text-primary)] border-none outline-none w-20 px-1"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setShowTagInput(true)}
                      className="text-xs text-[var(--accent-light)] hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--accent-glow)] border border-dashed border-[var(--border)]"
                    >
                      <Plus size={12} />
                      Thêm Tag
                    </button>
                  )}
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="form-label">Mô tả ưu đãi</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="input-field min-h-[80px]" 
                  placeholder="Mô tả chi tiết thể lệ chương trình ưu đãi..."
                />
              </div>
            </div>
          </GlassCard>

          {/* SECTION 2: ĐỐI TƯỢNG ÁP DỤNG */}
          <GlassCard style={{ padding: 24 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--border)] pb-3 mb-6 gap-3">
              <div className="flex items-center gap-2.5 text-[var(--accent-light)]">
                <Settings size={18} />
                <h2 className="text-sm font-bold uppercase tracking-wider">Đối tượng áp dụng</h2>
              </div>
              <div className="text-[10px] text-amber-300 bg-amber-950/20 border border-amber-800/30 px-3 py-1 rounded-lg flex items-center gap-1.5">
                <Info size={12} />
                <span>Đối tượng = Bộ lọc + Chỉ định - Loại trừ</span>
              </div>
            </div>

            {/* TAB SELECTOR FOR AUDIENCE PANEL */}
            <div className="flex border-b border-[var(--border)] mb-6 gap-4">
              <button 
                type="button"
                onClick={() => setActiveAudienceTab('filters')}
                className={`pb-2.5 text-sm font-semibold border-b-2 transition-all ${activeAudienceTab === 'filters' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Bộ lọc điều kiện
              </button>
              <button 
                type="button"
                onClick={() => setActiveAudienceTab('included')}
                className={`pb-2.5 text-sm font-semibold border-b-2 transition-all ${activeAudienceTab === 'included' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Danh sách chỉ định ({includedAgencyIds.length})
              </button>
              <button 
                type="button"
                onClick={() => setActiveAudienceTab('excluded')}
                className={`pb-2.5 text-sm font-semibold border-b-2 transition-all ${activeAudienceTab === 'excluded' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Danh sách loại trừ ({excludedAgencyIds.length})
              </button>
            </div>

            {/* TAB 1: BỘ LỌC ĐIỀU KIỆN (OR) */}
            {activeAudienceTab === 'filters' && (
              <div className="flex flex-col gap-5">
                {audienceFilters.map((filter, filterIdx) => (
                  <div 
                    key={filterIdx}
                    className="p-5 bg-slate-950/20 border border-[var(--border)] rounded-xl relative"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--border)] px-3 py-1 rounded-md">
                        BỘ ĐIỀU KIỆN {String(filterIdx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          className="text-xs text-[var(--text-muted)] hover:text-white"
                        >
                          Tiêu chí
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveAudienceFilter(filterIdx)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          XÓA BỘ LỌC
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Hạng khách hàng */}
                      <div>
                        <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">HẠNG KHÁCH HÀNG</span>
                        <div className="flex flex-wrap gap-2">
                          {RANKS.map(rank => {
                            const mapRankCode = rank === 'Thành Viên' ? 'MEMBER' : rank === 'Bạc' ? 'SILVER' : rank === 'Titan' ? 'TITAN' : rank === 'Vàng' ? 'GOLD' : 'PLATINUM';
                            const isSelected = filter.rankLevels.includes(mapRankCode);
                            return (
                              <button
                                key={rank}
                                type="button"
                                onClick={() => handleToggleRankInFilter(filterIdx, mapRankCode)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${isSelected ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-md' : 'bg-slate-900 border-[var(--border)] text-[var(--text-secondary)] hover:text-white'}`}
                              >
                                {rank}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Khu vực / Tỉnh thành */}
                      <div>
                        <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">KHU VỰC / TỈNH THÀNH</span>
                        <div className="flex flex-wrap gap-2">
                          {PROVINCES.map(province => {
                            const isSelected = filter.provinces.includes(province);
                            return (
                              <button
                                key={province}
                                type="button"
                                onClick={() => handleToggleProvinceInFilter(filterIdx, province)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${isSelected ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-md' : 'bg-slate-900 border-[var(--border)] text-[var(--text-secondary)] hover:text-white'}`}
                              >
                                {province}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...audienceFilters];
                              updated[filterIdx].provinces = [...PROVINCES];
                              setAudienceFilters(updated);
                            }}
                            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-dashed border-[var(--border)] text-[var(--accent-light)] hover:text-white"
                          >
                            + Tất cả các tỉnh
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  type="button" 
                  onClick={handleAddAudienceFilter}
                  className="w-full py-3.5 border border-dashed border-[var(--border)] bg-slate-950/5 hover:bg-slate-950/20 text-[var(--accent-light)] hover:text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  + THÊM BỘ ĐIỀU KIỆN (HOẶC)
                </button>
              </div>
            )}

            {/* TAB 2: DANH SÁCH CHỈ ĐỊNH */}
            {activeAudienceTab === 'included' && (
              <div>
                <span className="block text-xs text-[var(--text-secondary)] mb-3">Tích chọn các đại lý bắt buộc được áp dụng chính sách này:</span>
                <div className="border border-[var(--border)] rounded-xl max-h-[300px] overflow-y-auto bg-slate-950/10">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-[var(--border)] text-[var(--text-secondary)]">
                        <th className="p-3 w-10">Chọn</th>
                        <th className="p-3">Tên Đại lý</th>
                        <th className="p-3">Số điện thoại</th>
                        <th className="p-3">Địa chỉ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agencies.map(a => {
                        const isChecked = includedAgencyIds.includes(a.id);
                        return (
                          <tr 
                            key={a.id} 
                            onClick={() => toggleItemInList(includedAgencyIds, setIncludedAgencyIds, a.id)}
                            className="border-b border-slate-900 hover:bg-slate-900/50 cursor-pointer"
                          >
                            <td className="p-3">
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                readOnly
                                className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" 
                              />
                            </td>
                            <td className="p-3 font-semibold">{a.name}</td>
                            <td className="p-3">{a.phone}</td>
                            <td className="p-3 text-[var(--text-secondary)]">{a.address}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: DANH SÁCH LOẠI TRỪ */}
            {activeAudienceTab === 'excluded' && (
              <div>
                <span className="block text-xs text-[var(--text-secondary)] mb-3">Tích chọn các đại lý KHÔNG được áp dụng chính sách này (Bị loại trừ):</span>
                <div className="border border-[var(--border)] rounded-xl max-h-[300px] overflow-y-auto bg-slate-950/10">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-[var(--border)] text-[var(--text-secondary)]">
                        <th className="p-3 w-10">Chọn</th>
                        <th className="p-3">Tên Đại lý</th>
                        <th className="p-3">Số điện thoại</th>
                        <th className="p-3">Địa chỉ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agencies.map(a => {
                        const isChecked = excludedAgencyIds.includes(a.id);
                        return (
                          <tr 
                            key={a.id} 
                            onClick={() => toggleItemInList(excludedAgencyIds, setExcludedAgencyIds, a.id)}
                            className="border-b border-slate-900 hover:bg-slate-900/50 cursor-pointer"
                          >
                            <td className="p-3">
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                readOnly
                                className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" 
                              />
                            </td>
                            <td className="p-3 font-semibold">{a.name}</td>
                            <td className="p-3">{a.phone}</td>
                            <td className="p-3 text-[var(--text-secondary)]">{a.address}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </GlassCard>

          {/* SECTION 3: ĐIỀU KIỆN ÁP DỤNG */}
          <GlassCard style={{ padding: 24 }} className="mb-6">
            <div className="flex items-center gap-2.5 mb-6 text-[var(--accent-light)] border-b border-[var(--border)] pb-3">
              <TrendingUp size={18} />
              <h2 className="text-sm font-bold uppercase tracking-wider">Điều kiện áp dụng</h2>
            </div>

            <div>
              <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-4">CĂN CỨ XÉT DUYỆT ƯU ĐÃI</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  key="ORDER_VALUE"
                  type="button"
                  onClick={() => setTargetType('ORDER_VALUE')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all ${targetType === 'ORDER_VALUE' ? 'border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent-light)] shadow-md scale-105' : 'bg-slate-900 border-[var(--border)] text-[var(--text-secondary)] hover:text-white'}`}
                >
                  <DollarSign size={20} />
                  <span className="text-[10px] font-bold tracking-wider">GT ĐƠN HÀNG</span>
                </button>

                <button
                  key="PRODUCT_QTY"
                  type="button"
                  onClick={() => setTargetType('PRODUCT_QTY')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all ${targetType === 'PRODUCT_QTY' ? 'border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent-light)] shadow-md scale-105' : 'bg-slate-900 border-[var(--border)] text-[var(--text-secondary)] hover:text-white'}`}
                >
                  <Gift size={20} />
                  <span className="text-[10px] font-bold tracking-wider">SL SẢN PHẨM</span>
                </button>

                <button
                  key="PRODUCT_REVENUE"
                  type="button"
                  onClick={() => setTargetType('PRODUCT_REVENUE')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all ${targetType === 'PRODUCT_REVENUE' ? 'border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent-light)] shadow-md scale-105' : 'bg-slate-900 border-[var(--border)] text-[var(--text-secondary)] hover:text-white'}`}
                >
                  <TrendingUp size={20} />
                  <span className="text-[10px] font-bold tracking-wider">DS SẢN PHẨM</span>
                </button>
              </div>
            </div>
          </GlassCard>

          {/* SECTION 4: PHẠM VI SẢN PHẨM */}
          <GlassCard style={{ padding: 24 }} className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--border)] pb-3 mb-6 gap-3">
              <div className="flex items-center gap-2.5 text-[var(--accent-light)]">
                <Gift size={18} />
                <h2 className="text-sm font-bold uppercase tracking-wider">Phạm vi sản phẩm</h2>
              </div>
            </div>

            {/* TAB SELECTOR FOR PRODUCT SCOPE */}
            <div className="flex border-b border-[var(--border)] mb-6 gap-4">
              <button 
                type="button"
                onClick={() => setActiveProductTab('applied')}
                className={`pb-2.5 text-sm font-semibold border-b-2 transition-all ${activeProductTab === 'applied' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Sản phẩm áp dụng ({appliedGroups.length} nhóm)
              </button>
              <button 
                type="button"
                onClick={() => setActiveProductTab('excluded')}
                className={`pb-2.5 text-sm font-semibold border-b-2 transition-all ${activeProductTab === 'excluded' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Sản phẩm loại trừ ({tempExcludedItems.length})
              </button>
            </div>

            {/* TAB 1: SẢN PHẨM ÁP DỤNG */}
            {activeProductTab === 'applied' && (
              <div className="flex flex-col gap-6">
                {/* TOGGLE switch for apply to all */}
                <div className="p-4 bg-slate-950/20 border border-[var(--border)] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-[var(--border)] flex items-center justify-center text-[var(--accent-light)]">
                      <Globe size={18} />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[var(--text-primary)]">ÁP DỤNG CHO TẤT CẢ SẢN PHẨM</span>
                      <span className="block text-[10px] text-[var(--text-muted)]">Bao gồm toàn bộ danh mục hàng hóa hiện có</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={applyToAllProducts} 
                      onChange={e => setApplyToAllProducts(e.target.checked)} 
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                  </label>
                </div>

                {/* Groups list (show only if applyToAllProducts is false) */}
                {!applyToAllProducts && (
                  <div className="flex flex-col gap-4">
                    {appliedGroups.map((group, groupIdx) => (
                      <div key={group.id} className="border border-[var(--border)] rounded-xl overflow-hidden bg-slate-950/10">
                        {/* Group Header */}
                        <div className="flex items-center justify-between p-4 bg-slate-900/60 border-b border-[var(--border)]">
                          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleToggleGroupExpansion(group.id)}>
                            {group.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            <span className="text-xs font-bold text-white tracking-wide">{group.name}</span>
                            <span className="badge badge-primary text-[10px] px-2 py-0.5">{group.items.length} sản phẩm</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleAddItemToGroup(group.id)}
                              className="px-3 py-1.5 border border-[var(--accent)] rounded-lg text-[10px] font-bold text-[var(--accent-light)] hover:bg-[var(--accent-glow)] transition-all flex items-center gap-1"
                            >
                              <Plus size={12} />
                              Thêm sản phẩm
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGroup(group.id)}
                              className="px-3 py-1.5 border border-red-500/30 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-950/20 transition-all flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              Xóa nhóm
                            </button>
                          </div>
                        </div>

                        {/* Group Content (Expanded) */}
                        {group.isExpanded && (
                          <div className="p-4 overflow-x-auto">
                            {group.items.length === 0 ? (
                              <div className="text-center py-6 text-xs text-[var(--text-muted)]">
                                Chưa có sản phẩm nào trong nhóm này. Hãy bấm "+ Thêm sản phẩm" ở trên.
                              </div>
                            ) : (
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
                                    <th className="pb-2 w-12 text-center">STT</th>
                                    <th className="pb-2 w-1/3">TÊN</th>
                                    <th className="pb-2 w-28">LOẠI</th>
                                    <th className="pb-2">MÔ TẢ</th>
                                    <th className="pb-2 w-16 text-center">HÀNH ĐỘNG</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.items.map((item, itemIdx) => (
                                    <GroupItemRow 
                                      key={item.id}
                                      groupId={group.id}
                                      item={item}
                                      itemIdx={itemIdx}
                                      products={products}
                                      categories={categories}
                                      onSave={handleSaveGroupItem}
                                      onRemove={handleRemoveItemFromGroup}
                                      onUpdateDesc={handleUpdateItemDescription}
                                    />
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    <button 
                      type="button" 
                      onClick={handleAddGroup}
                      className="w-full py-3.5 border border-dashed border-[var(--border)] bg-slate-950/5 hover:bg-slate-950/20 text-[var(--accent-light)] hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      + THÊM NHÓM SẢN PHẨM MỚI
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SẢN PHẨM LOẠI TRỪ */}
            {activeProductTab === 'excluded' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Danh sách các danh mục hoặc sản phẩm cụ thể bị loại trừ khỏi ưu đãi này:</span>
                  <button
                    type="button"
                    onClick={handleAddExcludedItem}
                    className="px-3 py-1.5 border border-[var(--accent)] rounded-lg text-[10px] font-bold text-[var(--accent-light)] hover:bg-[var(--accent-glow)] transition-all flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Thêm loại trừ
                  </button>
                </div>

                <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-slate-950/10 p-4">
                  {tempExcludedItems.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[var(--text-muted)]">
                      Chưa cấu hình sản phẩm loại trừ nào.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
                          <th className="pb-2 w-12 text-center">STT</th>
                          <th className="pb-2 w-1/2">TÊN</th>
                          <th className="pb-2 w-32">LOẠI</th>
                          <th className="pb-2 w-16 text-center">HÀNH ĐỘNG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tempExcludedItems.map((item, itemIdx) => (
                          <ExcludedItemRow 
                            key={item.id}
                            item={item}
                            itemIdx={itemIdx}
                            products={products}
                            categories={categories}
                            onSave={handleSaveExcludedItem}
                            onRemove={handleRemoveExcludedItem}
                          />
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </GlassCard>

          {/* SECTION 4: CƠ CẤU ĐIỀU KIỆN & ƯU ĐÃI */}
          <GlassCard style={{ padding: 24 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--border)] pb-3 mb-6 gap-3">
              <div className="flex items-center gap-2.5 text-[var(--accent-light)]">
                <Settings size={18} />
                <h2 className="text-sm font-bold uppercase tracking-wider">Cơ cấu điều kiện & ưu đãi</h2>
              </div>
              <div className="text-[10px] text-indigo-300 bg-indigo-950/20 border border-indigo-800/30 px-3 py-1 rounded-lg flex items-center gap-1.5">
                <Info size={12} />
                <span>HỆ THỐNG SẼ ÁP DỤNG MỨC THƯỞNG CAO NHẤT THỎA MÃN</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="form-label">Giá trị xét tối đa trên mỗi đơn</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={maxDiscountValue} 
                    onChange={e => setMaxDiscountValue(e.target.value === '' ? '' : Number(e.target.value))} 
                    className="input-field" 
                    placeholder="Không giới hạn"
                  />
                  {maxDiscountValue === '' && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">Không giới hạn</span>
                  )}
                </div>
              </div>
            </div>

            {/* TIERS BẬC THANG TABLE */}
            <div className="border border-[var(--border)] rounded-xl overflow-hidden mb-6 bg-slate-950/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-[var(--border)] text-[var(--text-secondary)]">
                    <th className="p-3 w-12 text-center">STT</th>
                    <th className="p-3 w-28">Toán tử</th>
                    <th className="p-3 w-40">Mức giá trị xét</th>
                    <th className="p-3 w-48">Loại ưu đãi</th>
                    <th className="p-3 w-32">Giá trị ưu đãi</th>
                    <th className="p-3">Quà tặng sản phẩm</th>
                    <th className="p-3 w-20 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t, idx) => (
                    <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/20">
                      {/* STT */}
                      <td className="p-3 text-center font-bold text-[var(--text-secondary)]">{t.tierIndex}</td>
                      
                      {/* TOÁN TỬ */}
                      <td className="p-3">
                        <select 
                          value={t.operator}
                          onChange={e => handleUpdateTierField(idx, 'operator', e.target.value)}
                          className="input-field py-2.5 px-3 text-xs bg-slate-900"
                        >
                          <option value="GTE">&gt;=</option>
                          <option value="GT">&gt;</option>
                          <option value="LTE">&lt;=</option>
                          <option value="LT">&lt;</option>
                          <option value="EQ">=</option>
                        </select>
                      </td>

                      {/* MỨC GIÁ TRỊ XÉT */}
                      <td className="p-3">
                        <input 
                          type="number"
                          value={t.thresholdValue}
                          onChange={e => handleUpdateTierField(idx, 'thresholdValue', Number(e.target.value))}
                          className="input-field py-2.5 px-3 text-xs bg-slate-900" 
                          placeholder="Mức xét..."
                        />
                      </td>

                      {/* LOẠI ƯU ĐÃI */}
                      <td className="p-3">
                        <select 
                          value={t.adjustmentType}
                          onChange={e => handleUpdateTierField(idx, 'adjustmentType', e.target.value)}
                          className="input-field py-2.5 px-3 text-xs bg-slate-900"
                        >
                          <option value="PERCENTAGE">Chiết khấu %</option>
                          <option value="FIXED_AMOUNT">Chiết khấu tiền mặt (VND)</option>
                          <option value="SPECIFIC_PRICE">Giá chỉ định trực tiếp (VND)</option>
                        </select>
                      </td>

                      {/* GIÁ TRỊ ƯU ĐÃI */}
                      <td className="p-3">
                        <input 
                          type="number"
                          value={t.adjustmentValue}
                          onChange={e => handleUpdateTierField(idx, 'adjustmentValue', Number(e.target.value))}
                          className="input-field py-2.5 px-3 text-xs bg-slate-900" 
                          placeholder="Giá trị..."
                        />
                      </td>

                      {/* SẢN PHẨM QUÀ TẶNG */}
                      <td className="p-3">
                        <div className="flex gap-2">
                          <select 
                            value={t.giftProductId}
                            onChange={e => handleUpdateTierField(idx, 'giftProductId', e.target.value)}
                            className="input-field py-2.5 px-3 text-xs bg-slate-900 flex-1"
                          >
                            <option value="">-- Chọn sản phẩm làm quà tặng --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          {t.giftProductId && (
                            <input 
                              type="number"
                              value={t.giftQuantity}
                              onChange={e => handleUpdateTierField(idx, 'giftQuantity', Number(e.target.value))}
                              min={1}
                              title="Số lượng quà tặng"
                              className="input-field py-2.5 px-2 text-xs bg-slate-900 w-16 text-center" 
                            />
                          )}
                          <input 
                            type="text"
                            value={t.giftNote}
                            onChange={e => handleUpdateTierField(idx, 'giftNote', e.target.value)}
                            placeholder="Ghi chú quà..."
                            className="input-field py-2.5 px-2 text-xs bg-slate-900 w-32" 
                          />
                        </div>
                      </td>

                      {/* HÀNH ĐỘNG XÓA */}
                      <td className="p-3 text-center">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTier(idx)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              type="button" 
              onClick={handleAddTier}
              className="w-full py-3 border border-dashed border-[var(--border)] bg-slate-950/5 hover:bg-slate-950/20 text-[var(--accent-light)] hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              + THÊM MỨC ĐIỀU KIỆN MỚI
            </button>
          </GlassCard>
        </div>
      ) : (
        /* TAB PREVIEW HIỂN THỊ (Mockup design cho người dùng "WOW") */
        <div className="w-full max-w-4xl mx-auto px-4 py-8 fade-in-up">
          <div className="text-center mb-8">
            <span className="badge badge-primary px-3 py-1 mb-2 font-bold uppercase tracking-wider text-xs">Phác thảo thiết kế trải nghiệm</span>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Đại lý sẽ nhìn thấy ưu đãi như thế nào?</h2>
            <p className="text-sm text-[var(--text-secondary)]">Mô phỏng trải nghiệm giao diện người dùng trên web bán lẻ và ứng dụng đặt đơn của Đại lý</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. MÀN HÌNH MÔ PHỎNG MOBILE / APP BÁN LẺ */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Trang sản phẩm chi tiết (Đại lý App)</span>
              
              {/* Điện thoại Mockup */}
              <div 
                className="w-[320px] h-[600px] border-[6px] border-slate-800 rounded-[36px] bg-[#090d16] shadow-2xl relative overflow-hidden flex flex-col"
                style={{ boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)' }}
              >
                {/* Loa thoại / Cam trước */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-800 rounded-b-xl z-20"></div>

                {/* Nội dung Mockup */}
                <div className="flex-1 flex flex-col p-4 pt-8 text-[var(--text-primary)]">
                  {/* Top Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-3">
                    <span className="text-xs font-bold text-[var(--accent-light)]">Chi tiết sản phẩm</span>
                    <span className="text-[10px] text-[var(--text-muted)]">3G / WiFi</span>
                  </div>

                  {/* Ảnh sản phẩm */}
                  <div className="w-full h-36 bg-slate-950 border border-[var(--border)] rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
                    <div className="absolute top-2 left-2 bg-[var(--accent)] text-white px-2 py-0.5 rounded text-[8px] font-bold">HÈ 2026</div>
                    <Gift size={40} className="text-[var(--accent-light)]" />
                  </div>

                  {/* Tên & Giá gốc */}
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-white mb-1">Máy bơm NAI VÀNG thế hệ mới</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-[var(--text-muted)] line-through">12,500,000đ</span>
                      <span className="text-base font-extrabold text-[var(--accent-light)]">11,900,000đ</span>
                    </div>
                  </div>

                  {/* 🚨 DYNAMIC BANNER KHUYẾN MÃI CHI TIẾT 🚨 */}
                  <div 
                    className="p-3 border rounded-xl mb-4 relative overflow-hidden" 
                    style={{ 
                      background: 'radial-gradient(circle at 100% 0%, var(--accent-glow) 0%, rgba(26, 34, 53, 0.4) 80%)',
                      borderColor: 'rgba(99, 102, 241, 0.4)'
                    }}
                  >
                    {/* Ripple decor */}
                    <div className="absolute -top-6 -right-6 w-16 h-16 bg-[var(--accent)] opacity-10 rounded-full blur-xl"></div>
                    
                    <div className="flex items-center gap-1.5 text-yellow-300 font-bold mb-1" style={{ fontSize: '9px' }}>
                      <AlertCircle size={10} />
                      <span>{name || 'Khuyến mãi đặc biệt'}</span>
                    </div>

                    <p className="text-[8px] text-[var(--text-secondary)] leading-normal mb-2">
                      {description || 'Chương trình tri ân dịp hè. Chiết khấu sâu khi mua số lượng và nhận hàng loạt quà tặng cực phẩm.'}
                    </p>

                    {/* Mức tiers khuyến mãi sinh động */}
                    <div className="flex flex-col gap-1.5">
                      {tiers.map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[8px] bg-slate-950/40 p-1.5 rounded-lg border border-slate-900">
                          <span className="text-[var(--text-secondary)] font-medium">Mua đơn {t.operator === 'GTE' ? '>=' : ''} {t.thresholdValue.toLocaleString()}đ</span>
                          <div className="flex items-center gap-1">
                            <span className="text-emerald-400 font-bold">-{t.adjustmentValue}%</span>
                            {t.giftProductId && (
                              <span className="bg-emerald-950/40 text-emerald-300 px-1 rounded-md" style={{ fontSize: '7px' }}>🎁 Tặng quà</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Button đặt hàng */}
                  <div className="mt-auto pt-3 border-t border-slate-900 flex gap-2">
                    <button className="flex-1 py-2 bg-gradient-to-r from-[var(--accent)] to-[#8b5cf6] text-white font-bold rounded-xl text-[10px] tracking-wider uppercase shadow-md shadow-indigo-950/40">
                      Mua ngay (Lên đơn hàng)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MÀN HÌNH BÁO CÁO CÔNG NGHỆ / BANNER WEB */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Banner truyền thông ưu đãi (Web Đại lý)</span>
              
              <div 
                className="w-[340px] h-[340px] glass-card p-6 flex flex-col justify-between overflow-hidden relative"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(10,15,30,0.9) 100%)',
                  borderColor: 'rgba(99,102,241,0.3)',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)'
                }}
              >
                {/* Glow décor */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex justify-between items-start z-10">
                  <span className="badge badge-primary font-bold text-[10px]" style={{ borderRadius: 6 }}>HOT SUMMER 2026</span>
                  <Tag size={18} className="text-[var(--accent-light)]" />
                </div>

                <div className="z-10">
                  <h3 className="text-xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                    {name || 'Chương Trình Khuyến Mãi Hè 2026'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                    {description || 'Chương trình tri ân khách hàng dịp hè. Áp dụng ưu đãi chiết khấu trực tiếp trên giá trị đơn hàng và tặng đầu bơm cao cấp.'}
                  </p>
                </div>

                {/* Highlight box */}
                <div className="bg-[var(--accent-glow)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between z-10">
                  <div>
                    <span className="block text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ưu đãi bậc cao nhất</span>
                    <span className="text-lg font-black text-emerald-400">Giảm tới {tiers[tiers.length - 1]?.adjustmentValue || 0}%</span>
                  </div>
                  {tiers[tiers.length - 1]?.giftProductId && (
                    <div className="flex flex-col items-end">
                      <span className="badge badge-success text-[8px] py-0.5 px-1.5 font-extrabold uppercase">Tặng quà 🎁</span>
                      <span className="text-[8px] text-[var(--text-secondary)] mt-0.5">{tiers[tiers.length - 1]?.giftNote || 'Nhận quà xịn'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupItemRow({ 
  groupId, 
  item, 
  itemIdx, 
  products, 
  categories, 
  onSave, 
  onRemove, 
  onUpdateDesc 
}: {
  groupId: string;
  item: GroupItem;
  itemIdx: number;
  products: ProductDTO[];
  categories: CategoryDTO[];
  onSave: (groupId: string, itemId: string, type: 'PRODUCT' | 'CATEGORY', targetId: number) => void;
  onRemove: (groupId: string, itemId: string) => void;
  onUpdateDesc: (groupId: string, itemId: string, desc: string) => void;
}) {
  const [localType, setLocalType] = useState<'PRODUCT' | 'CATEGORY'>(item.type || 'PRODUCT');
  const [localTargetId, setLocalTargetId] = useState<number>(item.targetId || 0);

  useEffect(() => {
    setLocalType(item.type);
    setLocalTargetId(item.targetId);
  }, [item.type, item.targetId]);

  if (item.isEditing) {
    return (
      <tr className="border-b border-slate-900/60 hover:bg-slate-900/10">
        <td className="p-3 text-center text-[var(--text-muted)] font-semibold">{itemIdx + 1}</td>
        <td className="p-3" colSpan={2}>
          <div className="flex gap-2">
            <select
              value={localType}
              onChange={e => {
                setLocalType(e.target.value as any);
                setLocalTargetId(0);
              }}
              className="bg-slate-900 border border-[var(--border)] rounded-lg text-xs p-2 text-white font-sans"
            >
              <option value="PRODUCT">Sản phẩm</option>
              <option value="CATEGORY">Danh mục</option>
            </select>
            <select
              value={localTargetId}
              onChange={e => setLocalTargetId(Number(e.target.value))}
              className="bg-slate-900 border border-[var(--border)] rounded-lg text-xs p-2 text-white flex-1 max-w-xs font-sans"
            >
              <option value={0}>-- Chọn {localType === 'PRODUCT' ? 'sản phẩm' : 'danh mục'} --</option>
              {localType === 'PRODUCT' ? (
                products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku ? `[${p.sku}] ` : ''}{p.name}</option>
                ))
              ) : (
                categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              )}
            </select>
            <button
              type="button"
              onClick={() => onSave(groupId, item.id, localType, localTargetId)}
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all"
            >
              Xác nhận
            </button>
          </div>
        </td>
        <td className="p-3"></td>
        <td className="p-3 text-center">
          <button
            type="button"
            onClick={() => onRemove(groupId, item.id)}
            className="text-red-400 hover:text-red-300 p-1.5"
          >
            <Trash2 size={14} />
          </button>
        </td>
      </tr>
    );
  }

  let code = '';
  let name = '';
  if (item.type === 'PRODUCT') {
    const prod = products.find(p => p.id === item.targetId);
    code = prod?.sku || `PROD-${item.targetId}`;
    name = prod?.name || 'Sản phẩm không xác định';
  } else {
    const cat = categories.find(c => c.id === item.targetId);
    code = `CAT-${item.targetId}`;
    name = cat?.name || 'Danh mục không xác định';
  }

  return (
    <tr className="border-b border-slate-900/60 hover:bg-slate-900/10">
      <td className="p-3 text-center text-[var(--text-muted)] font-semibold">{itemIdx + 1}</td>
      <td className="p-3">
        <div className="flex flex-col">
          <span className="font-bold text-[var(--accent-light)] text-xs uppercase tracking-wide">{code}</span>
          <span className="text-[var(--text-secondary)] text-[10px] mt-0.5">{name}</span>
        </div>
      </td>
      <td className="p-3 text-[var(--text-muted)] italic">
        {item.type === 'PRODUCT' ? 'Sản phẩm' : 'Danh mục'}
      </td>
      <td className="p-3">
        <input
          type="text"
          value={item.description}
          onChange={e => onUpdateDesc(groupId, item.id, e.target.value)}
          placeholder="Nhập mô tả cho tất cả"
          className="bg-transparent border border-[var(--border)] focus:border-[var(--accent)] rounded-lg text-xs px-3 py-1.5 text-white w-full max-w-sm"
        />
      </td>
      <td className="p-3 text-center">
        <button
          type="button"
          onClick={() => onRemove(groupId, item.id)}
          className="text-red-400 hover:text-red-300 p-1.5"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

function ExcludedItemRow({ 
  item, 
  itemIdx, 
  products, 
  categories, 
  onSave, 
  onRemove 
}: {
  item: ExcludedItem;
  itemIdx: number;
  products: ProductDTO[];
  categories: CategoryDTO[];
  onSave: (itemId: string, type: 'PRODUCT' | 'CATEGORY', targetId: number) => void;
  onRemove: (itemId: string) => void;
}) {
  const [localType, setLocalType] = useState<'PRODUCT' | 'CATEGORY'>(item.type || 'PRODUCT');
  const [localTargetId, setLocalTargetId] = useState<number>(item.targetId || 0);

  useEffect(() => {
    setLocalType(item.type);
    setLocalTargetId(item.targetId);
  }, [item.type, item.targetId]);

  if (item.isEditing) {
    return (
      <tr className="border-b border-slate-900/60 hover:bg-slate-900/10">
        <td className="p-3 text-center text-[var(--text-muted)] font-semibold">{itemIdx + 1}</td>
        <td className="p-3" colSpan={2}>
          <div className="flex gap-2">
            <select
              value={localType}
              onChange={e => {
                setLocalType(e.target.value as any);
                setLocalTargetId(0);
              }}
              className="bg-slate-900 border border-[var(--border)] rounded-lg text-xs p-2 text-white font-sans"
            >
              <option value="PRODUCT">Sản phẩm</option>
              <option value="CATEGORY">Danh mục</option>
            </select>
            <select
              value={localTargetId}
              onChange={e => setLocalTargetId(Number(e.target.value))}
              className="bg-slate-900 border border-[var(--border)] rounded-lg text-xs p-2 text-white flex-1 max-w-xs font-sans"
            >
              <option value={0}>-- Chọn {localType === 'PRODUCT' ? 'sản phẩm' : 'danh mục'} --</option>
              {localType === 'PRODUCT' ? (
                products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku ? `[${p.sku}] ` : ''}{p.name}</option>
                ))
              ) : (
                categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              )}
            </select>
            <button
              type="button"
              onClick={() => onSave(item.id, localType, localTargetId)}
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all"
            >
              Xác nhận
            </button>
          </div>
        </td>
        <td className="p-3 text-center">
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-red-400 hover:text-red-300 p-1.5"
          >
            <Trash2 size={14} />
          </button>
        </td>
      </tr>
    );
  }

  let code = '';
  let name = '';
  if (item.type === 'PRODUCT') {
    const prod = products.find(p => p.id === item.targetId);
    code = prod?.sku || `PROD-${item.targetId}`;
    name = prod?.name || 'Sản phẩm không xác định';
  } else {
    const cat = categories.find(c => c.id === item.targetId);
    code = `CAT-${item.targetId}`;
    name = cat?.name || 'Danh mục không xác định';
  }

  return (
    <tr className="border-b border-slate-900/60 hover:bg-slate-900/10">
      <td className="p-3 text-center text-[var(--text-muted)] font-semibold">{itemIdx + 1}</td>
      <td className="p-3">
        <div className="flex flex-col">
          <span className="font-bold text-[var(--accent-light)] text-xs uppercase tracking-wide">{code}</span>
          <span className="text-[var(--text-secondary)] text-[10px] mt-0.5">{name}</span>
        </div>
      </td>
      <td className="p-3 text-[var(--text-muted)] italic">
        {item.type === 'PRODUCT' ? 'Sản phẩm' : 'Danh mục'}
      </td>
      <td className="p-3 text-center">
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="text-red-400 hover:text-red-300 p-1.5"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}
