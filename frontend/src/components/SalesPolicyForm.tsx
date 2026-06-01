'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { 
  Plus, Trash2, Settings, Eye, HelpCircle, Check, DollarSign, Gift, 
  TrendingUp, TrendingDown, AlertCircle, Calendar, Tag, Info, ArrowLeft, Save,
  Globe, ChevronDown, ChevronUp, Search, Upload, FileSpreadsheet,
  CheckSquare2, Square, X, ListChecks
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
  SalesPolicyRequest,
  retailTrendApi,
  RetailTrendConfig,
  productPreviewApi,
  ProductPolicyPreviewResult,
  PolicyEffect
} from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';

interface GroupItem {
  id: string;
  type: 'PRODUCT' | 'CATEGORY';
  targetId: number;
  description: string;
  operator?: string;
  adjustmentType?: string;
  adjustmentValue?: number;
  giftProductId?: number | null;
  giftQuantity?: number;
  giftNote?: string;
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
  defaultPolicyType?: 'SALES_POLICY' | 'PROMOTION' | 'RETAIL_POLICY';
}

export default function SalesPolicyForm({ initialId = null, defaultPolicyType }: SalesPolicyFormProps) {
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

  // Preview product (sản phẩm thực tế dùng để xem trước)
  const [previewProduct, setPreviewProduct] = useState<ProductDTO | null>(null);

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
  const [conditionType, setConditionType] = useState<'MIN_PRODUCT_QTY' | 'CUSTOM_QTY' | ''>('');
  const [maxDiscountValue, setMaxDiscountValue] = useState<number | ''>('');
  const [applyToAllProducts, setApplyToAllProducts] = useState(true);

  const [policyType, setPolicyType] = useState<'SALES_POLICY' | 'PROMOTION' | 'RETAIL_POLICY'>(defaultPolicyType || 'SALES_POLICY');
  const isPerProductMode = policyType === 'SALES_POLICY' && targetType === 'PRODUCT_QTY' && conditionType === 'MIN_PRODUCT_QTY';
  const isRetailMode = policyType === 'RETAIL_POLICY';
  const isFlatMode = isPerProductMode || isRetailMode;
  const flatProductCount = appliedGroups.reduce((sum, g) => sum + g.items.filter(i => !i.isEditing).length, 0);
  const [minOrderValue, setMinOrderValue] = useState<number | ''>('');
  const [maxDiscountPerOrder, setMaxDiscountPerOrder] = useState<number | ''>('');
  const [maxUsagePerCustomer, setMaxUsagePerCustomer] = useState<number | ''>('');
  const [applicablePaymentMethods, setApplicablePaymentMethods] = useState<string[]>([]);
  const [applicableOrderSources, setApplicableOrderSources] = useState<string[]>([]);

  // Gift picker popup state
  const [giftPickerOpen, setGiftPickerOpen] = useState(false);
  const [giftPickerSearch, setGiftPickerSearch] = useState('');
  type GiftPickerTarget =
    | { mode: 'tier'; tierIdx: number }
    | { mode: 'compact' }
    | { mode: 'item'; groupId: string; itemId: string };
  const [giftPickerTarget, setGiftPickerTarget] = useState<GiftPickerTarget | null>(null);

  // Bulk product picker modal state
  const [bulkPickerOpen, setBulkPickerOpen] = useState(false);
  const [bulkPickerGroupId, setBulkPickerGroupId] = useState<string | null>(null);
  const [bulkPickerSearch, setBulkPickerSearch] = useState('');
  const [bulkPickerSelected, setBulkPickerSelected] = useState<number[]>([]);
  const [bulkPickerCategoryFilter, setBulkPickerCategoryFilter] = useState<number | null>(null);

  // Import CSV modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importModalGroupId, setImportModalGroupId] = useState<string | null>(null);
  const [importDragOver, setImportDragOver] = useState(false);
  const [importResult, setImportResult] = useState<{ matched: number[]; notFound: string[] } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const [trendConfig, setTrendConfig] = useState<RetailTrendConfig | null>(null);
  const [productPreview, setProductPreview] = useState<ProductPolicyPreviewResult | null>(null);
  const [productPreviewLoading, setProductPreviewLoading] = useState(false);

  const getGiftProductName = (id: number | string | null | undefined): string => {
    if (!id) return '';
    return products.find(p => p.id === Number(id))?.name || '';
  };

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
    { tierIndex: 1, operator: 'GTE', thresholdValue: 10000000, adjustmentType: 'PERCENTAGE', adjustmentValue: -2, giftProductId: '', giftQuantity: 1, giftNote: '' }
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
      setConditionType((p.conditionType as any) || '');
      setMaxDiscountValue(p.maxDiscountValue !== null && p.maxDiscountValue !== undefined ? p.maxDiscountValue : '');
      setApplyToAllProducts(p.applyToAllProducts);
      setPolicyType((p.policyType as any) || 'SALES_POLICY');
      setMinOrderValue(p.minOrderValue !== null && p.minOrderValue !== undefined ? p.minOrderValue : '');
      setMaxDiscountPerOrder(p.maxDiscountPerOrder !== null && p.maxDiscountPerOrder !== undefined ? p.maxDiscountPerOrder : '');
      setMaxUsagePerCustomer(p.maxUsagePerCustomer !== null && p.maxUsagePerCustomer !== undefined ? p.maxUsagePerCustomer : '');
      setApplicablePaymentMethods(p.applicablePaymentMethods ? p.applicablePaymentMethods.split(',').filter(Boolean) : []);
      setApplicableOrderSources(p.applicableOrderSources ? p.applicableOrderSources.split(',').filter(Boolean) : []);

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
            operator: item.operator || undefined,
            adjustmentType: item.adjustmentType || undefined,
            adjustmentValue: item.adjustmentValue || undefined,
            giftProductId: item.giftProductId != null ? item.giftProductId as number : null,
            giftQuantity: item.giftQuantity != null ? item.giftQuantity : 1,
            giftNote: item.giftNote || '',
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
        setTiers([{ tierIndex: 1, operator: 'GTE', thresholdValue: 0, adjustmentType: 'PERCENTAGE', adjustmentValue: -1, giftProductId: '', giftQuantity: 1, giftNote: '' }]);
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
  const handleAddFlatProduct = () => {
    setAppliedGroups(prev => {
      if (prev.length === 0) {
        return [{ id: `group-${Date.now()}`, name: 'SẢN PHẨM', items: [{ id: `item-${Date.now()}`, type: 'PRODUCT', targetId: 0, description: '', isEditing: true }], isExpanded: true }];
      }
      return prev.map((g, idx) => {
        if (idx === 0) {
          return { ...g, items: [...g.items, { id: `item-${Date.now()}`, type: 'PRODUCT', targetId: 0, description: '', isEditing: true }] };
        }
        return g;
      });
    });
  };

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

  const handleUpdateItemBenefit = (groupId: string, itemId: string, field: string, value: any) => {
    setAppliedGroups(
      appliedGroups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            items: g.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
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

  // ---- Bulk product picker handlers ----
  const openBulkPicker = (groupId: string) => {
    const group = appliedGroups.find(g => g.id === groupId);
    const alreadyIn = (group?.items || []).filter(i => i.type === 'PRODUCT' && !i.isEditing).map(i => i.targetId);
    setBulkPickerSelected(alreadyIn);
    setBulkPickerGroupId(groupId);
    setBulkPickerSearch('');
    setBulkPickerCategoryFilter(null);
    setBulkPickerOpen(true);
  };

  const handleBulkPickerConfirm = () => {
    if (!bulkPickerGroupId) return;
    setAppliedGroups(prev => prev.map(g => {
      if (g.id !== bulkPickerGroupId) return g;
      // Remove items not selected anymore
      const existingNonProduct = g.items.filter(i => i.type !== 'PRODUCT');
      const newProductItems: GroupItem[] = bulkPickerSelected.map(pid => {
        const existing = g.items.find(i => i.type === 'PRODUCT' && i.targetId === pid);
        if (existing) return existing;
        return {
          id: `item-${Date.now()}-${pid}`,
          type: 'PRODUCT' as const,
          targetId: pid,
          description: '',
          isEditing: false
        };
      });
      return { ...g, items: [...existingNonProduct, ...newProductItems] };
    }));
    setBulkPickerOpen(false);
  };

  const handleSelectAllProductsInGroup = (groupId: string) => {
    const allProductIds = products.map(p => p.id);
    setAppliedGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      const existingNonProduct = g.items.filter(i => i.type !== 'PRODUCT');
      const newProductItems: GroupItem[] = allProductIds.map(pid => {
        const existing = g.items.find(i => i.type === 'PRODUCT' && i.targetId === pid);
        if (existing) return existing;
        return {
          id: `item-${Date.now()}-${pid}`,
          type: 'PRODUCT' as const,
          targetId: pid,
          description: '',
          isEditing: false
        };
      });
      return { ...g, items: [...existingNonProduct, ...newProductItems] };
    }));
  };

  // ---- CSV import handlers ----
  const openImportModal = (groupId: string) => {
    setImportModalGroupId(groupId);
    setImportResult(null);
    setImportModalOpen(true);
  };

  const parseCSVAndImport = (text: string) => {
    setImportLoading(true);
    try {
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      // Support formats: pure ID number, or lines like "123,ProductName"
      const matchedIds: number[] = [];
      const notFound: string[] = [];

      lines.forEach(line => {
        const parts = line.split(',');
        const raw = parts[0].trim();
        // Try numeric ID
        const numId = parseInt(raw, 10);
        if (!isNaN(numId)) {
          const product = products.find(p => p.id === numId);
          if (product) {
            if (!matchedIds.includes(numId)) matchedIds.push(numId);
          } else {
            notFound.push(raw);
          }
        } else {
          // Try by name match
          const byName = products.find(p => p.name.toLowerCase() === raw.toLowerCase());
          if (byName) {
            if (!matchedIds.includes(byName.id)) matchedIds.push(byName.id);
          } else {
            // Try by SKU
            const bySku = products.find(p => p.sku && p.sku.toLowerCase() === raw.toLowerCase());
            if (bySku) {
              if (!matchedIds.includes(bySku.id)) matchedIds.push(bySku.id);
            } else {
              notFound.push(raw);
            }
          }
        }
      });

      setImportResult({ matched: matchedIds, notFound });
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSVAndImport(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImportConfirm = () => {
    if (!importResult || !importModalGroupId) return;
    const { matched } = importResult;
    setAppliedGroups(prev => prev.map(g => {
      if (g.id !== importModalGroupId) return g;
      const existingNonProduct = g.items.filter(i => i.type !== 'PRODUCT');
      const newProductItems: GroupItem[] = matched.map(pid => {
        const existing = g.items.find(i => i.type === 'PRODUCT' && i.targetId === pid);
        if (existing) return existing;
        return {
          id: `item-${Date.now()}-${pid}`,
          type: 'PRODUCT' as const,
          targetId: pid,
          description: '',
          isEditing: false
        };
      });
      return { ...g, items: [...existingNonProduct, ...newProductItems] };
    }));
    setImportModalOpen(false);
    setImportResult(null);
  };

  const downloadSampleCSV = () => {
    const sample = products.slice(0, 5).map(p => `${p.id},${p.name}`).join('\n');
    const header = 'ID,Tên sản phẩm (hoặc tên, SKU)';
    const csv = `${header}\n${sample}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mau_import_san_pham.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tiers management
  const handleAddTier = () => {
    const nextIndex = tiers.length + 1;
    setTiers([...tiers, {
      tierIndex: nextIndex,
      operator: 'GTE',
      thresholdValue: 0,
      adjustmentType: 'PERCENTAGE',
        adjustmentValue: -1,
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
              description: item.description || '',
              operator: item.operator || undefined,
              adjustmentType: item.adjustmentType || undefined,
              adjustmentValue: item.adjustmentValue !== undefined ? Number(item.adjustmentValue) : undefined,
              giftProductId: item.giftProductId == null ? undefined : Number(item.giftProductId),
              giftQuantity: item.giftQuantity || undefined,
              giftNote: item.giftNote || undefined
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
      targetType: isRetailMode ? undefined : targetType,
      conditionType: isRetailMode ? undefined : (targetType === 'PRODUCT_QTY' ? conditionType || undefined : undefined),
      maxDiscountValue: maxDiscountValue === '' ? undefined : Number(maxDiscountValue),
      policyType,
      minOrderValue: minOrderValue === '' ? undefined : Number(minOrderValue),
      maxDiscountPerOrder: maxDiscountPerOrder === '' ? undefined : Number(maxDiscountPerOrder),
      maxUsagePerCustomer: maxUsagePerCustomer === '' ? undefined : Number(maxUsagePerCustomer),
      applicablePaymentMethods: applicablePaymentMethods.join(','),
      applicableOrderSources: applicableOrderSources.join(','),
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

  // Fetch retail trend config
  useEffect(() => {
    retailTrendApi.get().then(setTrendConfig).catch(() => {});
  }, []);

  // Fetch product policy preview when preview product changes
  useEffect(() => {
    if (previewProduct && previewProduct.id) {
      setProductPreviewLoading(true);
      productPreviewApi.get(previewProduct.id, 1)
        .then(setProductPreview)
        .catch(() => setProductPreview(null))
        .finally(() => setProductPreviewLoading(false));
    } else {
      setProductPreview(null);
    }
  }, [previewProduct]);

  // Select a representative product for preview
  useEffect(() => {
    if (products.length === 0) {
      setPreviewProduct(null);
      return;
    }
    let found: ProductDTO | null = null;
    if (!applyToAllProducts) {
      for (const g of appliedGroups) {
        for (const item of g.items) {
          if (item.type === 'PRODUCT' && item.targetId > 0) {
            found = products.find(p => p.id === item.targetId) || null;
            if (found) break;
          }
        }
        if (found) break;
      }
    }
    if (!found) {
      found = products[0] || null;
    }
    setPreviewProduct(found);
  }, [products, appliedGroups, applyToAllProducts]);

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
    <>
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
                <label className="form-label">Loại ưu đãi</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="policyType" value="SALES_POLICY" checked={policyType === 'SALES_POLICY'} onChange={() => setPolicyType('SALES_POLICY')} className="accent-[var(--accent)]" />
                    <span className="text-sm text-[var(--text-primary)]">Chính sách bán hàng</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="policyType" value="RETAIL_POLICY" checked={policyType === 'RETAIL_POLICY'} onChange={() => setPolicyType('RETAIL_POLICY')} className="accent-[var(--accent)]" />
                    <span className="text-sm text-[var(--text-primary)]">Chính sách bán lẻ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="policyType" value="PROMOTION" checked={policyType === 'PROMOTION'} onChange={() => setPolicyType('PROMOTION')} className="accent-[var(--accent)]" />
                    <span className="text-sm text-[var(--text-primary)]">Chương trình khuyến mãi</span>
                  </label>
                </div>
              </div>
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

              {policyType === 'PROMOTION' && (
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
              )}

              {policyType === 'PROMOTION' && (
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
              )}

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

          {/* SECTION 1.5: ĐIỀU KIỆN KHUYẾN MÃI (chỉ hiển thị với PROMOTION) */}
          {policyType === 'PROMOTION' && (
            <GlassCard style={{ padding: 24 }}>
              <div className="flex items-center gap-2.5 mb-6 text-[var(--accent-light)] border-b border-[var(--border)] pb-3">
                <AlertCircle size={18} />
                <h2 className="text-sm font-bold uppercase tracking-wider">Điều kiện khuyến mãi</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Giá trị đơn tối thiểu (minOrderValue)</label>
                  <input type="number" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value === '' ? '' : Number(e.target.value))} className="input-field" placeholder="Không giới hạn" />
                </div>
                <div>
                  <label className="form-label">Giảm tối đa / đơn (maxDiscountPerOrder)</label>
                  <input type="number" value={maxDiscountPerOrder} onChange={e => setMaxDiscountPerOrder(e.target.value === '' ? '' : Number(e.target.value))} className="input-field" placeholder="Không giới hạn" />
                </div>
                <div>
                  <label className="form-label">Số lần dùng / khách (maxUsagePerCustomer)</label>
                  <input type="number" value={maxUsagePerCustomer} onChange={e => setMaxUsagePerCustomer(e.target.value === '' ? '' : Number(e.target.value))} className="input-field" placeholder="Không giới hạn" />
                </div>
                <div>
                  <label className="form-label">Phương thức thanh toán</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['Tiền mặt', 'Chuyển khoản', 'Thẻ tín dụng'].map(pm => (
                      <label key={pm} className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--text-secondary)]">
                        <input type="checkbox" checked={applicablePaymentMethods.includes(pm)} onChange={() => setApplicablePaymentMethods(prev => prev.includes(pm) ? prev.filter(x => x !== pm) : [...prev, pm])} className="accent-[var(--accent)]" />
                        {pm}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Nguồn đơn hàng</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['App', 'Web', 'NVKD'].map(os => (
                      <label key={os} className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--text-secondary)]">
                        <input type="checkbox" checked={applicableOrderSources.includes(os)} onChange={() => setApplicableOrderSources(prev => prev.includes(os) ? prev.filter(x => x !== os) : [...prev, os])} className="accent-[var(--accent)]" />
                        {os}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

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

            {isRetailMode ? (
              <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-4 text-xs text-indigo-300">
                <p className="font-semibold mb-1">Tự động áp dụng khi:</p>
                <p>Số lượng mua <strong>&lt; Số lượng tối thiểu</strong> (minPurchaseQuantity) của sản phẩm</p>
                <p className="mt-1 text-indigo-400/70">Hệ thống tự động xét duyệt dựa trên thông tin sản phẩm, không cần cấu hình thêm.</p>
              </div>
            ) : (
              <>
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

            {targetType === 'PRODUCT_QTY' && (
              <div className="mt-4">
                <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-3">NGUỒN XÁC ĐỊNH SL SẢN PHẨM</span>
                <div className="flex gap-3">
                  <label
                    className={`flex items-center gap-2 px-4 py-3 border rounded-xl cursor-pointer transition-all flex-1 ${conditionType === 'MIN_PRODUCT_QTY' ? 'border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent-light)] shadow-md' : 'bg-slate-900 border-[var(--border)] text-[var(--text-secondary)] hover:text-white'}`}
                  >
                    <input
                      type="radio"
                      name="conditionType"
                      checked={conditionType === 'MIN_PRODUCT_QTY'}
                      onChange={() => setConditionType('MIN_PRODUCT_QTY')}
                      className="accent-[var(--accent)]"
                    />
                    <div>
                      <div className="text-xs font-semibold">Theo SL mua tối thiểu</div>
                      <div className="text-[10px] opacity-70">Lấy từ minPurchaseQuantity trên sản phẩm</div>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-2 px-4 py-3 border rounded-xl cursor-pointer transition-all flex-1 ${conditionType === 'CUSTOM_QTY' ? 'border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent-light)] shadow-md' : 'bg-slate-900 border-[var(--border)] text-[var(--text-secondary)] hover:text-white'}`}
                  >
                    <input
                      type="radio"
                      name="conditionType"
                      checked={conditionType === 'CUSTOM_QTY'}
                      onChange={() => setConditionType('CUSTOM_QTY')}
                      className="accent-[var(--accent)]"
                    />
                    <div>
                      <div className="text-xs font-semibold">Nhập số lượng tùy chỉnh</div>
                      <div className="text-[10px] opacity-70">Dùng số lượng nhập trên đơn hàng</div>
                    </div>
                  </label>
                </div>
              </div>
            )}
            </>
            )}
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
                Sản phẩm áp dụng {isFlatMode ? `(${flatProductCount} sản phẩm)` : `(${appliedGroups.length} nhóm)`}
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

                {/* Products list (show only if applyToAllProducts is false) */}
                {!applyToAllProducts && (
                  <>
                    {isFlatMode ? (
                      /* Flat product list (1 SP = 1 nhóm) */
                      <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-slate-950/10">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
                              <th className="p-3 w-12 text-center">STT</th>
                              <th className="p-3 w-1/3">TÊN SẢN PHẨM</th>
                              <th className="p-3 w-20">SL TỐI THIỂU</th>
                              <th className="p-3" colSpan={2}>GIÁ TRỊ ƯU ĐÃI / QUÀ TẶNG</th>
                              <th className="p-3 w-16 text-center">HÀNH ĐỘNG</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const allRows: Array<{ groupId: string; item: GroupItem; idx: number }> = [];
                              appliedGroups.forEach(g => {
                                g.items.forEach(item => {
                                  allRows.push({ groupId: g.id, item, idx: allRows.length + 1 });
                                });
                              });
                              return allRows.length > 0 ? allRows.map(({ groupId, item, idx }) => (
                                <GroupItemRow
                                  key={item.id}
                                  groupId={groupId}
                                  item={item}
                                  itemIdx={idx - 1}
                                  products={products}
                                  categories={categories}
                                  onSave={handleSaveGroupItem}
                                  onRemove={handleRemoveItemFromGroup}
                                  onUpdateDesc={handleUpdateItemDescription}
                                  showBenefits={true}
                                  showMinQty={true}
                                  onUpdateBenefit={handleUpdateItemBenefit}
                                  onOpenGiftPicker={(gid, iid) => { setGiftPickerTarget({ mode: 'item', groupId: gid, itemId: iid }); setGiftPickerOpen(true); }}
                                  getGiftProductName={getGiftProductName}
                                />
                              )) : (
                                <tr>
                                  <td colSpan={5} className="p-6 text-center text-xs text-[var(--text-muted)]">
                                    Chưa có sản phẩm nào. Hãy bấm "+ Thêm sản phẩm" bên dưới.
                                  </td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* Group-based UI (original) */
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
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleAddItemToGroup(group.id)}
                                  className="px-3 py-1.5 border border-[var(--accent)] rounded-lg text-[10px] font-bold text-[var(--accent-light)] hover:bg-[var(--accent-glow)] transition-all flex items-center gap-1"
                                >
                                  <Plus size={12} />
                                  Thêm 1 SP
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openBulkPicker(group.id)}
                                  className="px-3 py-1.5 border border-emerald-500/40 rounded-lg text-[10px] font-bold text-emerald-400 hover:bg-emerald-950/20 transition-all flex items-center gap-1"
                                  title="Chọn nhiều sản phẩm từ danh sách"
                                >
                                  <ListChecks size={12} />
                                  Chọn nhiều
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openImportModal(group.id)}
                                  className="px-3 py-1.5 border border-amber-500/40 rounded-lg text-[10px] font-bold text-amber-400 hover:bg-amber-950/20 transition-all flex items-center gap-1"
                                  title="Import danh sách sản phẩm từ file CSV"
                                >
                                  <Upload size={12} />
                                  Import CSV
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Thêm TẤT CẢ ${products.length} sản phẩm vào nhóm này?`)) {
                                      handleSelectAllProductsInGroup(group.id);
                                    }
                                  }}
                                  className="px-3 py-1.5 border border-indigo-500/40 rounded-lg text-[10px] font-bold text-indigo-400 hover:bg-indigo-950/20 transition-all flex items-center gap-1"
                                  title="Thêm tất cả sản phẩm trong hệ thống vào nhóm"
                                >
                                  <CheckSquare2 size={12} />
                                  Tất cả SP
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
                                        <th className="pb-2" colSpan={2}>MÔ TẢ</th>
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
                                          getGiftProductName={getGiftProductName}
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

                    {/* Flat mode action buttons */}
                    {isFlatMode && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={handleAddFlatProduct}
                          className="px-4 py-2.5 border border-[var(--accent)] rounded-lg text-xs font-bold text-[var(--accent-light)] hover:bg-[var(--accent-glow)] transition-all flex items-center gap-1.5"
                        >
                          <Plus size={14} />
                          + THÊM SẢN PHẨM
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const gid = appliedGroups[0]?.id;
                            if (gid) openBulkPicker(gid);
                            else handleAddFlatProduct();
                          }}
                          className="px-3 py-2 border border-emerald-500/40 rounded-lg text-[10px] font-bold text-emerald-400 hover:bg-emerald-950/20 transition-all flex items-center gap-1"
                        >
                          <ListChecks size={12} />
                          Chọn nhiều
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const gid = appliedGroups[0]?.id;
                            if (gid) openImportModal(gid);
                          }}
                          className="px-3 py-2 border border-amber-500/40 rounded-lg text-[10px] font-bold text-amber-400 hover:bg-amber-950/20 transition-all flex items-center gap-1"
                        >
                          <Upload size={12} />
                          Import CSV
                        </button>
                      </div>
                    )}
                  </>
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

            {policyType === 'PROMOTION' && (
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
            )}

            {isRetailMode && (
              <div className="bg-slate-950/20 border border-[var(--border)] rounded-xl p-4 mb-6">
                <div className="text-xs font-semibold text-[var(--accent-light)] mb-3">Cấu hình giá bán lẻ</div>
                {applyToAllProducts ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[var(--text-secondary)]">Loại:</span>
                      <select
                        value={tiers[0]?.adjustmentType || 'PERCENTAGE'}
                        onChange={e => handleUpdateTierField(0, 'adjustmentType', e.target.value)}
                        className="bg-slate-900 border border-[var(--border)] rounded-lg text-xs p-2 text-white"
                      >
                        <option value="PERCENTAGE">Phần trăm (%)</option>
                        <option value="FIXED_AMOUNT">Tiền mặt (VND)</option>
                        <option value="SPECIFIC_PRICE">Giá chỉ định trực tiếp (VND)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[var(--text-secondary)]">Giá trị:</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateTierField(0, 'adjustmentValue', -Math.abs(tiers[0]?.adjustmentValue || 0) || -1)}
                          className={`px-1.5 py-1 text-[10px] rounded-l border ${(tiers[0]?.adjustmentValue || 0) < 0 ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-slate-800 border-[var(--border)] text-[var(--text-secondary)]'}`}
                        >−</button>
                        <input
                          type="number"
                          value={Math.abs(tiers[0]?.adjustmentValue || 0)}
                          onChange={e => {
                            const val = Math.abs(Number(e.target.value));
                            handleUpdateTierField(0, 'adjustmentValue', (tiers[0]?.adjustmentValue || 0) < 0 ? -val : val);
                          }}
                          className="bg-slate-900 border-y border-[var(--border)] text-xs p-1.5 text-white w-28 text-center"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateTierField(0, 'adjustmentValue', Math.abs(tiers[0]?.adjustmentValue || 0) || 1)}
                          className={`px-1.5 py-1 text-[10px] border rounded-r ${(tiers[0]?.adjustmentValue || 0) > 0 ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-slate-800 border-[var(--border)] text-[var(--text-secondary)]'}`}
                        >+</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-400 italic">Giá trị ưu đãi được cấu hình riêng cho từng sản phẩm bên trên</div>
                )}
              </div>
            )}

            {!isRetailMode && targetType === 'PRODUCT_QTY' && conditionType === 'MIN_PRODUCT_QTY' && (
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3 mb-4 text-xs text-blue-300">
                <strong>Lưu ý:</strong> Hệ thống sẽ so sánh <strong>số lượng mua</strong> với <code className="bg-blue-900/50 px-1 rounded">minPurchaseQuantity</code> của sản phẩm. Nếu thỏa toán tử thì áp dụng ưu đãi. Chỉ có 1 mức duy nhất.
              </div>
            )}

            {!isRetailMode && targetType === 'PRODUCT_QTY' && conditionType === 'MIN_PRODUCT_QTY' ? (
              /* MIN_PRODUCT_QTY: Cấu hình 1 mức */
              <div className="bg-slate-950/20 border border-[var(--border)] rounded-xl p-4 mb-6">
                <div className="text-xs font-semibold text-[var(--accent-light)] mb-3">Cấu hình ưu đãi (1 mức duy nhất)</div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Toán tử */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[var(--text-secondary)]">Toán tử:</span>
                    <select
                      value={tiers[0]?.operator || 'GTE'}
                      onChange={e => handleUpdateTierField(0, 'operator', e.target.value)}
                      className="bg-slate-900 border border-[var(--border)] rounded-lg text-xs p-2 text-white"
                    >
                      <option value="GTE">&gt;=</option>
                      <option value="GT">&gt;</option>
                      <option value="LTE">&lt;=</option>
                      <option value="LT">&lt;</option>
                      <option value="EQ">=</option>
                    </select>
                  </div>
                  {applyToAllProducts ? (
                    <>
                      {/* Loại ưu đãi */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[var(--text-secondary)]">Loại:</span>
                        <select
                          value={tiers[0]?.adjustmentType || 'PERCENTAGE'}
                          onChange={e => handleUpdateTierField(0, 'adjustmentType', e.target.value)}
                          className="bg-slate-900 border border-[var(--border)] rounded-lg text-xs p-2 text-white"
                        >
                          <option value="PERCENTAGE">Phần trăm (%)</option>
                          <option value="FIXED_AMOUNT">Tiền mặt (VND)</option>
                          <option value="SPECIFIC_PRICE">Giá chỉ định trực tiếp (VND)</option>
                        </select>
                      </div>
                      {/* Giá trị ± */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[var(--text-secondary)]">Giá trị:</span>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateTierField(0, 'adjustmentValue', -Math.abs(tiers[0]?.adjustmentValue || 0) || -1)}
                            className={`px-1.5 py-1 text-[10px] rounded-l border ${(tiers[0]?.adjustmentValue || 0) < 0 ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-slate-800 border-[var(--border)] text-[var(--text-secondary)]'}`}
                          >−</button>
                          <input
                            type="number"
                            value={Math.abs(tiers[0]?.adjustmentValue || 0)}
                            onChange={e => {
                              const val = Math.abs(Number(e.target.value));
                              handleUpdateTierField(0, 'adjustmentValue', (tiers[0]?.adjustmentValue || 0) < 0 ? -val : val);
                            }}
                            className="bg-slate-900 border-y border-[var(--border)] text-xs p-1.5 text-white w-28 text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateTierField(0, 'adjustmentValue', Math.abs(tiers[0]?.adjustmentValue || 0) || 1)}
                            className={`px-1.5 py-1 text-[10px] border rounded-r ${(tiers[0]?.adjustmentValue || 0) > 0 ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-slate-800 border-[var(--border)] text-[var(--text-secondary)]'}`}
                          >+</button>
                        </div>
                      </div>
                      {/* Quà tặng */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[var(--text-secondary)]">Quà:</span>
                        <button
                          type="button"
                          onClick={() => { setGiftPickerTarget({ mode: 'compact' }); setGiftPickerOpen(true); }}
                          className="bg-slate-900 border border-[var(--border)] rounded-lg text-xs px-3 py-1.5 text-white flex-1 text-left hover:border-[var(--accent-light)] transition-colors flex items-center gap-2 min-w-[220px]"
                        >
                          {(() => {
                            const pid = tiers[0]?.giftProductId;
                            if (!pid) return <span className="text-[var(--text-muted)]">-- Chọn quà --</span>;
                            const p = products.find(x => x.id === Number(pid));
                            return (
                              <>
                                {p?.imageUrl ? (
                                  <img src={p.imageUrl} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }} />
                                ) : (
                                  <span style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--accent-light)', flexShrink: 0 }}>
                                    {p?.name?.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase() || 'SP'}
                                  </span>
                                )}
                                <span className="truncate">{p?.name}</span>
                              </>
                            );
                          })()}
                        </button>
                        {tiers[0]?.giftProductId && (
                          <input
                            type="number"
                            value={tiers[0]?.giftQuantity || 1}
                            onChange={e => handleUpdateTierField(0, 'giftQuantity', Number(e.target.value))}
                            min={1}
                            className="bg-slate-900 border border-[var(--border)] rounded-lg text-[10px] p-1.5 text-white w-10 text-center"
                          />
                        )}
                      </div>
                    </>
                  ) : !isFlatMode && (
                    <div className="text-[10px] text-amber-400 italic">Giá trị ưu đãi được cấu hình riêng cho từng sản phẩm bên trên</div>
                  )}
                </div>
              </div>
            ) : !isRetailMode ? (
              <>
              {/* TIERS BẬC THANG TABLE */}
              <div className="border border-[var(--border)] rounded-xl overflow-hidden mb-6 bg-slate-950/10">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-[var(--border)] text-[var(--text-secondary)]">
                      <th className="p-3 w-12 text-center">STT</th>
                      <th className="p-3 w-28">Toán tử</th>
                      <th className="p-3 w-40">Mức giá trị xét</th>
                      <th className="p-3 w-48">Loại ưu đãi</th>
                      <th className="p-3 w-44">Giá trị ưu đãi</th>
                      <th className="p-3 w-20 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.flatMap((t, idx) => [
                        // DÒNG 1: Điều kiện
                        <tr key={`cond-${idx}`} className="border-b border-slate-900 hover:bg-slate-900/20">
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
                              <option value="PERCENTAGE">Phần trăm (%)</option>
                              <option value="FIXED_AMOUNT">Tiền mặt (VND)</option>
                              <option value="SPECIFIC_PRICE">Giá chỉ định trực tiếp (VND)</option>
                            </select>
                          </td>

                          {/* GIÁ TRỊ ƯU ĐÃI */}
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateTierField(idx, 'adjustmentValue', -Math.abs(t.adjustmentValue) || -1)}
                                className={`px-2 py-2.5 text-xs font-bold rounded-l-lg border transition-all ${
                                  t.adjustmentValue < 0
                                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                    : 'bg-slate-800 border-[var(--border)] text-[var(--text-secondary)] hover:text-white'
                                }`}
                                title={t.adjustmentValue < 0 ? 'Đang giảm giá' : 'Nhấn để giảm giá'}
                              >−</button>
                              <button
                                type="button"
                                onClick={() => handleUpdateTierField(idx, 'adjustmentValue', Math.abs(t.adjustmentValue) || 1)}
                                className={`px-2 py-2.5 text-xs font-bold border-y transition-all ${
                                  t.adjustmentValue > 0
                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                    : 'bg-slate-800 border-[var(--border)] text-[var(--text-secondary)] hover:text-white'
                                }`}
                                title={t.adjustmentValue > 0 ? 'Đang tăng giá' : 'Nhấn để tăng giá'}
                              >+</button>
                              <input 
                                type="number"
                                value={Math.abs(t.adjustmentValue)}
                                onChange={e => {
                                  const val = Math.abs(Number(e.target.value));
                                  handleUpdateTierField(idx, 'adjustmentValue', t.adjustmentValue < 0 ? -val : val);
                                }}
                                className="input-field py-2.5 px-3 text-xs bg-slate-900 flex-1 rounded-l-none" 
                                placeholder="Giá trị..."
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
                        </tr>,
                        // DÒNG 2: Quà tặng
                        <tr key={`gift-${idx}`} className="border-b border-slate-900/50 hover:bg-slate-900/10">
                          <td className="p-0"></td>
                          <td className="p-3" colSpan={4}>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-[var(--text-secondary)] font-semibold whitespace-nowrap">QUÀ TẶNG:</span>
                              <button
                                type="button"
                                onClick={() => { setGiftPickerTarget({ mode: 'tier', tierIdx: idx }); setGiftPickerOpen(true); }}
                                className="input-field py-2 px-3 text-xs bg-slate-900 flex-1 text-left hover:border-[var(--accent-light)] transition-colors flex items-center gap-2 min-w-[280px]"
                              >
                                {(() => {
                                  const pid = t.giftProductId;
                                  if (!pid) return <span className="text-[var(--text-muted)]">-- Chọn sản phẩm làm quà tặng --</span>;
                                  const p = products.find(x => x.id === Number(pid));
                                  return (
                                    <>
                                      {p?.imageUrl ? (
                                        <img src={p.imageUrl} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }} />
                                      ) : (
                                        <span style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--accent-light)', flexShrink: 0 }}>
                                          {p?.name?.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase() || 'SP'}
                                        </span>
                                      )}
                                      <span className="truncate">{p?.name}</span>
                                    </>
                                  );
                                })()}
                              </button>
                              {t.giftProductId && (
                                <input 
                                  type="number"
                                  value={t.giftQuantity}
                                  onChange={e => handleUpdateTierField(idx, 'giftQuantity', Number(e.target.value))}
                                  min={1}
                                  title="Số lượng quà tặng"
                                  className="input-field py-2 px-1 text-xs bg-slate-900 w-10 text-center" 
                                />
                              )}
                              <input 
                                type="text"
                                value={t.giftNote}
                                onChange={e => handleUpdateTierField(idx, 'giftNote', e.target.value)}
                                placeholder="Ghi chú..."
                                className="input-field py-2 px-2 text-xs bg-slate-900 w-28" 
                              />
                            </div>
                          </td>
                          <td className="p-0"></td>
                        </tr>
                    ])}
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
              </>
            ) : null}
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

          <div className={`grid grid-cols-1 ${isRetailMode ? 'max-w-md mx-auto' : 'md:grid-cols-2'} gap-8`}>
            
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
                    <h3 className="text-sm font-bold text-white mb-1">{previewProduct?.name || 'Chưa có sản phẩm'}</h3>
                    {previewProduct?.sku && (
                      <div className="text-[9px] text-[var(--text-muted)] mb-0.5 font-mono">SKU: {previewProduct.sku}</div>
                    )}
                    {previewProduct && (
                      <>
                        {previewProduct.minPurchaseQuantity != null && previewProduct.minPurchaseQuantity > 0 && (
                          <div className="text-[9px] text-amber-400 mb-1 font-medium">
                            SL mua tối thiểu: {previewProduct.minPurchaseQuantity} sản phẩm
                          </div>
                        )}
                        {/* Lịch sử thay đổi giá */}
                        <div className="flex items-center gap-1.5 text-[8px] text-[var(--text-muted)] mb-1">
                          <AlertCircle size={8} />
                          <span>Lịch sử thay đổi giá</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                            <span className="text-[8px] bg-slate-800 px-1 rounded">Giá cũ</span>
                            <span className="line-through">{((previewProduct.oldAppliedPrice || previewProduct.price * 1.05)).toLocaleString()}đ</span>
                          </span>
                          <span className="text-base font-extrabold text-[var(--accent-light)] flex items-center gap-1">
                            {(previewProduct.appliedPrice || previewProduct.price).toLocaleString()}đ
                            <span className="text-[8px] bg-[var(--accent)]/20 text-[var(--accent-light)] px-1 rounded font-normal">Giá mới</span>
                          </span>
                        </div>
                        {(previewProduct.oldAppliedPrice || previewProduct.priceChangeRatio != null) && (
                          <div className="text-[8px] text-emerald-400 mt-0.5">
                            {(previewProduct.oldAppliedPrice
                              ? `Tiết kiệm: ${Math.abs(previewProduct.oldAppliedPrice - (previewProduct.appliedPrice || previewProduct.price)).toLocaleString()}đ`
                              : '')}
                            {previewProduct.priceChangeRatio != null && ` (${previewProduct.priceChangeRatio > 0 ? '+' : ''}${previewProduct.priceChangeRatio}% lịch sử giá)`}
                          </div>
                        )}
                        {previewProduct.appliedPriceListName && (
                          <div className="text-[8px] text-[var(--text-muted)] mt-0.5">
                            Bảng giá: {previewProduct.appliedPriceListName}
                          </div>
                        )}
                        {isRetailMode && (() => {
                          const basePrice = previewProduct.appliedPrice || previewProduct.price;
                          const adjType = tiers[0]?.adjustmentType || 'PERCENTAGE';
                          const adjVal = tiers[0]?.adjustmentValue || 0;
                          let retailPrice = basePrice;
                          if (adjType === 'PERCENTAGE') {
                            retailPrice = basePrice + (basePrice * adjVal / 100);
                          } else if (adjType === 'FIXED_AMOUNT') {
                            retailPrice = basePrice + adjVal;
                          } else if (adjType === 'SPECIFIC_PRICE') {
                            retailPrice = adjVal;
                          }
                          retailPrice = Math.max(0, retailPrice);

                          const cfg = trendConfig;
                          let trendLabel = '';
                          let trendIcon = null;
                          let trendColor = '';
                          let valText = '';

                          if (adjType === 'PERCENTAGE') {
                            valText = `(${Math.abs(adjVal)}%)`;
                            if (adjVal >= 0) {
                              trendLabel = cfg?.increaseLabel || 'Tăng thêm';
                              trendIcon = <TrendingUp size={10} />;
                              trendColor = cfg?.increaseColor || '#ef4444';
                            } else {
                              trendLabel = cfg?.decreaseLabel || 'Giảm đi';
                              trendIcon = <TrendingDown size={10} />;
                              trendColor = cfg?.decreaseColor || '#10b981';
                            }
                          } else if (adjType === 'FIXED_AMOUNT') {
                            valText = `(${Math.abs(adjVal).toLocaleString()}đ)`;
                            if (adjVal >= 0) {
                              trendLabel = cfg?.increaseLabel || 'Tăng thêm';
                              trendIcon = <TrendingUp size={10} />;
                              trendColor = cfg?.increaseColor || '#ef4444';
                            } else {
                              trendLabel = cfg?.decreaseLabel || 'Giảm đi';
                              trendIcon = <TrendingDown size={10} />;
                              trendColor = cfg?.decreaseColor || '#10b981';
                            }
                          } else if (adjType === 'SPECIFIC_PRICE') {
                            valText = `(Giá chỉ định)`;
                            if (retailPrice > basePrice) {
                              trendLabel = cfg?.increaseLabel || 'Tăng thêm';
                              trendIcon = <TrendingUp size={10} />;
                              trendColor = cfg?.increaseColor || '#ef4444';
                            } else if (retailPrice < basePrice) {
                              trendLabel = cfg?.decreaseLabel || 'Giảm đi';
                              trendIcon = <TrendingDown size={10} />;
                              trendColor = cfg?.decreaseColor || '#10b981';
                            } else {
                              trendLabel = cfg?.neutralLabel || 'Giữ nguyên';
                              trendColor = cfg?.neutralColor || '#94a3b8';
                            }
                          }

                          return (
                            <div className="text-[10px] text-amber-400 mt-1 font-semibold flex items-center gap-1 flex-wrap">
                              <span>Mua lẻ (SL mua &lt; SLTT SP):</span>
                              {trendLabel && (
                                <span className="flex items-center gap-0.5 font-bold" style={{ color: trendColor }}>
                                  {trendLabel}
                                  {trendIcon}
                                </span>
                              )}
                              <span className="text-[9px] text-[var(--text-secondary)] font-medium">{valText}</span>
                              <span className="text-white font-bold ml-0.5">{Math.round(retailPrice).toLocaleString()}đ</span>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>

                  {/* 🛒 RETAIL POLICY EFFECT FROM API (for non-retail preview) */}
                  {!isRetailMode && productPreview != null && productPreview.retailPolicies.length > 0 && productPreview.retailPolicies.map(rp => (
                    <div key={rp.id} className="text-[10px] text-amber-400 mb-2 font-semibold flex items-center gap-1 flex-wrap">
                      <span>Mua lẻ (SL mua &lt; SLTT SP):</span>
                      {rp.adjustmentType === 'PERCENTAGE' && (
                        <span style={{ color: (rp.adjustmentValue || 0) >= 0 ? '#ef4444' : '#10b981' }} className="flex items-center gap-0.5 font-bold">
                          {(rp.adjustmentValue || 0) >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {Math.abs(rp.adjustmentValue || 0)}%
                        </span>
                      )}
                      {rp.adjustmentType === 'FIXED_AMOUNT' && (
                        <span style={{ color: '#f59e0b' }} className="font-bold">
                          {(rp.adjustmentValue || 0) >= 0 ? '+' : ''}{Math.abs(rp.adjustmentValue || 0).toLocaleString()}đ
                        </span>
                      )}
                      {rp.adjustmentType === 'SPECIFIC_PRICE' && (
                        <span className="font-bold text-white">Giá chỉ định</span>
                      )}
                      <span className="text-white font-bold">{Math.round(rp.adjustedPrice).toLocaleString()}đ</span>
                    </div>
                  ))}

                  {/* 🚨 DYNAMIC BANNER KHUYẾN MÃI CHI TIẾT 🚨 */}
                  {!isRetailMode && (
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

                      {/* Mức khuyến mãi */}
                      <div className="flex flex-col gap-1.5">
                        {(() => {
                          const basePrice = previewProduct ? (previewProduct.appliedPrice || previewProduct.price) : 0;
                          const tiersToShow = targetType === 'PRODUCT_QTY' && conditionType === 'MIN_PRODUCT_QTY' && tiers[0]
                            ? [tiers[0]]
                            : tiers;
                          return tiersToShow.map((t, idx) => {
                            let finalPrice = basePrice;
                            if (t.adjustmentType === 'PERCENTAGE') {
                              finalPrice = basePrice + (basePrice * (t.adjustmentValue || 0) / 100);
                            } else if (t.adjustmentType === 'FIXED_AMOUNT') {
                              finalPrice = basePrice + (t.adjustmentValue || 0);
                            } else if (t.adjustmentType === 'SPECIFIC_PRICE') {
                              finalPrice = t.adjustmentValue || 0;
                            }
                            finalPrice = Math.max(0, finalPrice);
                            const conditionText = targetType === 'PRODUCT_QTY' && conditionType === 'MIN_PRODUCT_QTY'
                              ? `SL mua ${t.operator === 'GTE' ? '>=' : t.operator === 'GT' ? '>' : t.operator === 'LTE' ? '<=' : t.operator === 'LT' ? '<' : '='} SL tối thiểu (${previewProduct?.minPurchaseQuantity || 0} SP)`
                              : targetType === 'PRODUCT_QTY' && conditionType === 'CUSTOM_QTY'
                                ? `SL mua ${t.operator === 'GTE' ? '>=' : t.operator === 'GT' ? '>' : t.operator === 'LTE' ? '<=' : t.operator === 'LT' ? '<' : '='} ${t.thresholdValue} SP`
                                : `Mua đơn ${t.operator === 'GTE' ? '>=' : ''} ${t.thresholdValue.toLocaleString()}đ`;
                            return (
                              <div key={idx} className="flex items-center justify-between text-[8px] bg-slate-950/40 p-1.5 rounded-lg border border-slate-900">
                                <span className="text-[var(--text-secondary)] font-medium">{conditionText}</span>
                                <div className="flex items-center gap-1">
                                  <span className={`font-bold ${t.adjustmentValue < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {t.adjustmentValue < 0 ? `-${Math.abs(t.adjustmentValue)}` : `+${t.adjustmentValue}`}
                                    {t.adjustmentType === 'PERCENTAGE' ? '%' : 'đ'}
                                  </span>
                                  <span className="text-emerald-300 font-bold">→ {Math.round(finalPrice).toLocaleString()}đ</span>
                                  {t.giftProductId && (
                                    <span className="bg-emerald-950/40 text-emerald-300 px-1 rounded-md" style={{ fontSize: '7px' }}>🎁 Tặng quà</span>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

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
            {!isRetailMode && (
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
                      <span className={`text-lg font-black ${(tiers[tiers.length - 1]?.adjustmentValue || 0) < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {(tiers[tiers.length - 1]?.adjustmentValue || 0) < 0 ? 'Giảm tới' : 'Tăng thêm'} {Math.abs(tiers[tiers.length - 1]?.adjustmentValue || 0)}{tiers[tiers.length - 1]?.adjustmentType === 'PERCENTAGE' ? '%' : 'đ'}
                        {previewProduct && ` (${(previewProduct.appliedPrice || previewProduct.price).toLocaleString()}đ → ${(() => {
                          const t = tiers[tiers.length - 1];
                          const base = previewProduct.appliedPrice || previewProduct.price;
                          let f = base;
                          if (t?.adjustmentType === 'PERCENTAGE') f = base + base * (t.adjustmentValue || 0) / 100;
                          else if (t?.adjustmentType === 'FIXED_AMOUNT') f = base + (t.adjustmentValue || 0);
                          else if (t?.adjustmentType === 'SPECIFIC_PRICE') f = t.adjustmentValue || 0;
                          return Math.round(Math.max(0, f)).toLocaleString();
                        })()}đ)`}
                      </span>
                    </div>
                    {!isRetailMode && tiers[tiers.length - 1]?.giftProductId && (
                      <div className="flex flex-col items-end">
                        <span className="badge badge-success text-[8px] py-0.5 px-1.5 font-extrabold uppercase">Tặng quà 🎁</span>
                        <span className="text-[8px] text-[var(--text-secondary)] mt-0.5">{tiers[tiers.length - 1]?.giftNote || 'Nhận quà xịn'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 📋 PRODUCT POLICY PREVIEW: ALL APPLICABLE POLICIES */}
            {previewProduct && productPreview && (
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-5">
                  <ListChecks size={16} className="text-[var(--accent-light)]" />
                  <h3 className="text-sm font-bold text-[var(--accent-light)] uppercase tracking-wider">Các chính sách sản phẩm đang tham gia</h3>
                </div>

                {/* Base price */}
                <div className="glass-card p-3 mb-3 flex items-center justify-between" style={{ borderRadius: 10 }}>
                  <span className="text-[10px] text-[var(--text-secondary)] font-medium">Giá gốc</span>
                  <span className="text-sm font-bold text-white">{Math.round(productPreview.basePrice).toLocaleString()}đ</span>
                </div>

                {/* Phase 0: RETAIL */}
                {productPreview.retailPolicies.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider">Chính sách bán lẻ</span>
                    </div>
                    {productPreview.retailPolicies.map(p => (
                      <PolicyEffectCard key={p.id} effect={p} isCurrent={p.id === initialId} />
                    ))}
                  </div>
                )}

                {/* Phase 1: SALES_POLICY */}
                {productPreview.salesPolicies.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">Chính sách bán hàng</span>
                    </div>
                    {productPreview.salesPolicies.map(p => (
                      <PolicyEffectCard key={p.id} effect={p} isCurrent={p.id === initialId} />
                    ))}
                  </div>
                )}

                {/* Phase 2: PROMOTION */}
                {productPreview.promotions.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider">Chương trình khuyến mãi</span>
                    </div>
                    {productPreview.promotions.map(p => (
                      <PolicyEffectCard key={p.id} effect={p} isCurrent={p.id === initialId} />
                    ))}
                  </div>
                )}

                {/* No policies */}
                {productPreview.retailPolicies.length === 0 && productPreview.salesPolicies.length === 0 && productPreview.promotions.length === 0 && (
                  <div className="glass-card p-4 text-center" style={{ borderRadius: 10, background: 'rgba(255,255,255,0.02)' }}>
                    <span className="text-[10px] text-[var(--text-muted)]">Sản phẩm chưa tham gia chính sách ưu đãi nào</span>
                  </div>
                )}

                {/* Final price */}
                {productPreview.finalPrice !== productPreview.basePrice && (
                  <div className="glass-card p-3 flex items-center justify-between mt-3" style={{ borderRadius: 10, borderColor: 'rgba(99,102,241,0.4)' }}>
                    <span className="text-[10px] text-[var(--accent-light)] font-bold">Giá sau ưu đãi</span>
                    <span className="text-base font-black text-white">{Math.round(productPreview.finalPrice).toLocaleString()}đ</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gift Picker Modal */}
      {giftPickerOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
        }} onClick={() => { setGiftPickerOpen(false); setGiftPickerSearch(''); setGiftPickerTarget(null); }}>
          <div style={{
            background: '#1e293b', borderRadius: 16, border: '1px solid var(--border)',
            width: 720, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Gift size={18} style={{ color: 'var(--accent-light)' }} />
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Chọn sản phẩm quà tặng</span>
              </div>
              <button
                type="button"
                onClick={() => { setGiftPickerOpen(false); setGiftPickerSearch(''); setGiftPickerTarget(null); }}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: '6px 10px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
              >✕</button>
            </div>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={giftPickerSearch}
                  onChange={e => setGiftPickerSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px 10px 36px',
                    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none'
                  }}
                />
              </div>
            </div>
            <div style={{
              flex: 1, overflowY: 'auto', padding: 16,
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12
            }}>
              {products
                .filter(p => p.name.toLowerCase().includes(giftPickerSearch.toLowerCase()))
                .map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      if (!giftPickerTarget) return;
                      if (giftPickerTarget.mode === 'tier')
                        handleUpdateTierField(giftPickerTarget.tierIdx, 'giftProductId', String(product.id));
                      else if (giftPickerTarget.mode === 'compact')
                        handleUpdateTierField(0, 'giftProductId', String(product.id));
                      else if (giftPickerTarget.mode === 'item')
                        handleUpdateItemBenefit(giftPickerTarget.groupId, giftPickerTarget.itemId, 'giftProductId', product.id);
                      setGiftPickerOpen(false);
                      setGiftPickerTarget(null);
                      setGiftPickerSearch('');
                    }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                      borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-light)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  >
                    <div style={{
                      width: 80, height: 80, borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-light)' }}>
                          {(product.name || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'SP'}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-light)' }}>
                      {(product.basePrice || 0).toLocaleString()}đ
                    </div>
                  </button>
                ))}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              {products.filter(p => p.name.toLowerCase().includes(giftPickerSearch.toLowerCase())).length} / {products.length} sản phẩm
            </div>
          </div>
        </div>
      )}

      {/* ===== BULK PRODUCT PICKER MODAL ===== */}
      {bulkPickerOpen && (() => {
        const filtered = products.filter(p => {
          const matchSearch = !bulkPickerSearch || p.name.toLowerCase().includes(bulkPickerSearch.toLowerCase()) || (p.sku || '').toLowerCase().includes(bulkPickerSearch.toLowerCase());
          const matchCat = !bulkPickerCategoryFilter || p.categoryId === bulkPickerCategoryFilter;
          return matchSearch && matchCat;
        });
        const allFilteredSelected = filtered.length > 0 && filtered.every(p => bulkPickerSelected.includes(p.id));
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)'
          }} onClick={() => setBulkPickerOpen(false)}>
            <div style={{
              background: '#0f172a', borderRadius: 18, border: '1px solid var(--border)',
              width: 760, maxHeight: '86vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)'
            }} onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', borderRadius: '18px 18px 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ListChecks size={17} style={{ color: '#818cf8' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Chọn nhiều sản phẩm</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Đã chọn: <span style={{ color: '#818cf8', fontWeight: 700 }}>{bulkPickerSelected.length}</span> / {products.length} sản phẩm</div>
                  </div>
                </div>
                <button type="button" onClick={() => setBulkPickerOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
                  <X size={15} />
                </button>
              </div>

              {/* Search + filter bar */}
              <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Tìm tên sản phẩm hoặc SKU..."
                    value={bulkPickerSearch}
                    onChange={e => setBulkPickerSearch(e.target.value)}
                    autoFocus
                    style={{ width: '100%', padding: '9px 12px 9px 34px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <select
                  value={bulkPickerCategoryFilter ?? ''}
                  onChange={e => setBulkPickerCategoryFilter(e.target.value ? Number(e.target.value) : null)}
                  style={{ background: '#1e293b', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-secondary)', fontSize: 12, padding: '9px 12px', minWidth: 160 }}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (allFilteredSelected) {
                      setBulkPickerSelected(prev => prev.filter(id => !filtered.some(p => p.id === id)));
                    } else {
                      const toAdd = filtered.map(p => p.id);
                      setBulkPickerSelected(prev => Array.from(new Set([...prev, ...toAdd])));
                    }
                  }}
                  style={{ padding: '9px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                    background: allFilteredSelected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                    borderColor: allFilteredSelected ? 'rgba(99,102,241,0.5)' : 'var(--border)',
                    color: allFilteredSelected ? '#818cf8' : 'var(--text-secondary)'
                  }}
                >
                  {allFilteredSelected ? <CheckSquare2 size={13} /> : <Square size={13} />}
                  {allFilteredSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${filtered.length})`}
                </button>
              </div>

              {/* Product list */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>Không tìm thấy sản phẩm nào</div>
                ) : filtered.map(p => {
                  const isSelected = bulkPickerSelected.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => setBulkPickerSelected(prev => isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px', cursor: 'pointer',
                        background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${isSelected ? '#818cf8' : 'rgba(255,255,255,0.2)'}`, background: isSelected ? '#818cf8' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                        {isSelected && <Check size={12} style={{ color: 'white', strokeWidth: 3 }} />}
                      </div>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#818cf8', flexShrink: 0 }}>
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 10, marginTop: 2 }}>
                          {p.sku && <span style={{ color: '#818cf8', fontFamily: 'monospace' }}>{p.sku}</span>}
                          {p.categoryName && <span>{p.categoryName}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>{(p.basePrice || p.price || 0).toLocaleString()}đ</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tồn: {p.stockQuantity ?? p.stock}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '0 0 18px 18px' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {bulkPickerSelected.length > 0 ? (
                    <span>Đã chọn <strong style={{ color: '#818cf8' }}>{bulkPickerSelected.length}</strong> sản phẩm</span>
                  ) : 'Chưa chọn sản phẩm nào'}
                </span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setBulkPickerOpen(false)} style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    Hủy
                  </button>
                  <button type="button" onClick={handleBulkPickerConfirm} disabled={bulkPickerSelected.length === 0} style={{ padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: bulkPickerSelected.length === 0 ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none', color: 'white', opacity: bulkPickerSelected.length === 0 ? 0.5 : 1 }}>
                    Áp dụng {bulkPickerSelected.length > 0 ? `(${bulkPickerSelected.length})` : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== IMPORT CSV MODAL ===== */}
      {importModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9997,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)'
        }} onClick={() => { setImportModalOpen(false); setImportResult(null); }}>
          <div style={{
            background: '#0f172a', borderRadius: 18, border: '1px solid var(--border)',
            width: 600, maxHeight: '82vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)'
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', borderRadius: '18px 18px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileSpreadsheet size={17} style={{ color: '#fbbf24' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Import sản phẩm từ file CSV</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hỗ trợ: ID sản phẩm, tên sản phẩm, hoặc mã SKU</div>
                </div>
              </div>
              <button type="button" onClick={() => { setImportModalOpen(false); setImportResult(null); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: 22 }}>
              {!importResult ? (
                <>
                  {/* Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setImportDragOver(true); }}
                    onDragLeave={() => setImportDragOver(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setImportDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleImportFile(file);
                    }}
                    onClick={() => importFileRef.current?.click()}
                    style={{
                      border: `2px dashed ${importDragOver ? '#fbbf24' : 'rgba(255,255,255,0.15)'}`,
                      borderRadius: 14, padding: '36px 24px', textAlign: 'center', cursor: 'pointer',
                      background: importDragOver ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.2s', marginBottom: 18
                    }}
                  >
                    <Upload size={32} style={{ color: '#fbbf24', marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
                      {importLoading ? 'Đang xử lý...' : 'Kéo thả file CSV vào đây'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>hoặc nhấp để chọn file từ máy tính</div>
                    <input
                      ref={importFileRef}
                      type="file"
                      accept=".csv,.txt"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleImportFile(file);
                        e.target.value = '';
                      }}
                    />
                  </div>

                  {/* Format guide */}
                  <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📋 Định dạng file CSV</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                      • Mỗi dòng là một sản phẩm<br />
                      • Cột đầu tiên: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4, color: '#fbbf24' }}>ID số</code> hoặc <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4, color: '#fbbf24' }}>Tên sản phẩm</code> hoặc <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4, color: '#fbbf24' }}>SKU</code><br />
                      • Có thể có thêm cột sau (bị bỏ qua): <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4 }}>ID,Tên sản phẩm</code>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={downloadSampleCSV}
                    style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <FileSpreadsheet size={14} />
                    Tải file mẫu CSV (5 sản phẩm đầu)
                  </button>
                </>
              ) : (
                <>
                  {/* Import result */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#34d399' }}>{importResult.matched.length}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>✅ Khớp / Thêm được</div>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#f87171' }}>{importResult.notFound.length}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>❌ Không tìm thấy</div>
                    </div>
                  </div>

                  {importResult.matched.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sản phẩm sẽ được thêm vào nhóm:</div>
                      <div style={{ maxHeight: 200, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {importResult.matched.map(pid => {
                          const p = products.find(x => x.id === pid);
                          return (
                            <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                              <Check size={12} style={{ color: '#34d399', flexShrink: 0 }} />
                              <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 10 }}>#{pid}</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p?.name || '?'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {importResult.notFound.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Không tìm thấy trên hệ thống:</div>
                      <div style={{ maxHeight: 120, overflowY: 'auto', background: 'rgba(239,68,68,0.05)', borderRadius: 10, padding: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {importResult.notFound.map((item, i) => (
                          <span key={i} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#f87171', fontFamily: 'monospace' }}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setImportResult(null)}
                    style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', display: 'block', marginBottom: 4 }}
                  >
                    ← Import file khác
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'rgba(0,0,0,0.2)', borderRadius: '0 0 18px 18px' }}>
              <button type="button" onClick={() => { setImportModalOpen(false); setImportResult(null); }} style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                Hủy
              </button>
              {importResult && importResult.matched.length > 0 && (
                <button type="button" onClick={handleImportConfirm} style={{ padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #d97706, #fbbf24)', border: 'none', color: '#1a1a1a' }}>
                  Thêm {importResult.matched.length} sản phẩm vào nhóm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
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
  onUpdateDesc,
  showBenefits,
  showMinQty,
  onUpdateBenefit,
  onOpenGiftPicker,
  getGiftProductName
}: {
  groupId: string;
  item: GroupItem;
  itemIdx: number;
  products: ProductDTO[];
  categories: CategoryDTO[];
  onSave: (groupId: string, itemId: string, type: 'PRODUCT' | 'CATEGORY', targetId: number) => void;
  onRemove: (groupId: string, itemId: string) => void;
  onUpdateDesc: (groupId: string, itemId: string, desc: string) => void;
  showBenefits?: boolean;
  showMinQty?: boolean;
  onUpdateBenefit?: (groupId: string, itemId: string, field: string, value: any) => void;
  onOpenGiftPicker?: (groupId: string, itemId: string) => void;
  getGiftProductName?: (id: number | string | null | undefined) => string;
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
        <td className="p-3" colSpan={showMinQty ? 3 : 2}>
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
      {showMinQty ? (
        <td className="p-3 text-[var(--text-muted)] font-semibold text-center">
          {item.type === 'PRODUCT'
            ? (products.find(p => p.id === item.targetId)?.minPurchaseQuantity ?? '-')
            : '-'}
        </td>
      ) : (
        <td className="p-3 text-[var(--text-muted)] italic">
          {item.type === 'PRODUCT' ? 'Sản phẩm' : 'Danh mục'}
        </td>
      )}
      {showBenefits && onUpdateBenefit ? (
        <td className="p-3" colSpan={2}>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={item.adjustmentType || 'PERCENTAGE'}
              onChange={e => onUpdateBenefit(groupId, item.id, 'adjustmentType', e.target.value)}
              className="bg-slate-900 border border-[var(--border)] rounded-lg text-[10px] p-1.5 text-white"
            >
              <option value="PERCENTAGE">%</option>
              <option value="FIXED_AMOUNT">VND</option>
              <option value="SPECIFIC_PRICE">Giá chỉ định</option>
            </select>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onUpdateBenefit(groupId, item.id, 'adjustmentValue', -(Math.abs(item.adjustmentValue || 0) || 1))}
                className={`px-1.5 py-1 text-[10px] rounded-l border ${(item.adjustmentValue || 0) < 0 ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-slate-800 border-[var(--border)] text-[var(--text-secondary)]'}`}
                title="Giảm giá"
              >−</button>
              <input
                type="number"
                value={Math.abs(item.adjustmentValue || 0)}
                onChange={e => {
                  const val = Math.abs(Number(e.target.value));
                  onUpdateBenefit(groupId, item.id, 'adjustmentValue', (item.adjustmentValue || 0) < 0 ? -val : val);
                }}
                className="bg-slate-900 border-y border-[var(--border)] text-[10px] p-1.5 text-white w-16 text-center"
              />
              <button
                type="button"
                onClick={() => onUpdateBenefit(groupId, item.id, 'adjustmentValue', Math.abs(item.adjustmentValue || 0) || 1)}
                className={`px-1.5 py-1 text-[10px] border rounded-r ${(item.adjustmentValue || 0) > 0 ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-slate-800 border-[var(--border)] text-[var(--text-secondary)]'}`}
                title="Tăng giá"
              >+</button>
            </div>
            <button
              type="button"
              onClick={() => onOpenGiftPicker?.(groupId, item.id)}
              className="bg-slate-900 border border-[var(--border)] rounded-lg text-xs p-1.5 text-white min-w-[200px] text-left hover:border-[var(--accent-light)] transition-colors flex items-center gap-1.5"
            >
              {(() => {
                const pid = item.giftProductId;
                if (!pid) return <span className="text-[var(--text-muted)]">-- Chọn quà --</span>;
                const p = products.find(x => x.id === Number(pid));
                return (
                  <>
                    {p?.imageUrl ? (
                      <img src={p.imageUrl} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }} />
                    ) : (
                      <span style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--accent-light)', flexShrink: 0 }}>
                        {p?.name?.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase() || 'SP'}
                      </span>
                    )}
                    <span className="truncate">{p?.name}</span>
                  </>
                );
              })()}
            </button>
            {item.giftProductId && (
              <input
                type="number"
                value={item.giftQuantity || 1}
                onChange={e => onUpdateBenefit(groupId, item.id, 'giftQuantity', Number(e.target.value))}
                min={1}
                className="bg-slate-900 border border-[var(--border)] rounded-lg text-[10px] p-1.5 text-white w-10 text-center"
                placeholder="SL"
              />
            )}
          </div>
        </td>
      ) : (
        <td className="p-3">
          <input
            type="text"
            value={item.description}
            onChange={e => onUpdateDesc(groupId, item.id, e.target.value)}
            placeholder="Nhập mô tả cho tất cả"
            className="bg-transparent border border-[var(--border)] focus:border-[var(--accent)] rounded-lg text-xs px-3 py-1.5 text-white w-full max-w-sm"
          />
        </td>
      )}
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

function PolicyEffectCard({ effect, isCurrent }: { effect: PolicyEffect; isCurrent: boolean }) {
  const formatPrice = (p: number) => Math.round(p).toLocaleString() + 'đ';
  const diff = effect.adjustedPrice - effect.originalPrice;
  const isPositive = diff > 0;
  const isNegative = diff < 0;
  const getAdjText = () => {
    if (effect.adjustmentType === 'PERCENTAGE') return `${effect.adjustmentValue >= 0 ? '+' : ''}${effect.adjustmentValue}%`;
    if (effect.adjustmentType === 'FIXED_AMOUNT') return `${effect.adjustmentValue >= 0 ? '+' : ''}${effect.adjustmentValue.toLocaleString()}đ`;
    if (effect.adjustmentType === 'SPECIFIC_PRICE') return 'Giá chỉ định';
    return '';
  };
  return (
    <div className="glass-card p-3 mb-2 flex items-center justify-between" style={{
      borderRadius: 10,
      borderColor: isCurrent ? 'rgba(99,102,241,0.5)' : 'var(--border)',
      background: isCurrent ? 'rgba(99,102,241,0.05)' : undefined,
    }}>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-white truncate">{effect.name}</span>
          {isCurrent && <span className="text-[7px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Đang soạn</span>}
        </div>
        <span className="text-[8px] text-[var(--text-muted)]">{effect.conditionText}</span>
      </div>
      <div className="flex items-center gap-2 ml-3 shrink-0">
        <span className="text-[9px] font-bold" style={{ color: isPositive ? '#f87171' : isNegative ? '#34d399' : 'var(--text-muted)' }}>{getAdjText()}</span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-[var(--text-muted)] line-through">{formatPrice(effect.originalPrice)}</span>
          <span className="text-[9px] font-bold text-white">→ {formatPrice(effect.adjustedPrice)}</span>
        </div>
        {effect.giftProductName && (
          <span className="text-[8px] bg-emerald-950/40 text-emerald-300 px-1.5 py-0.5 rounded font-semibold">🎁 {effect.giftProductName}{effect.giftQuantity ? ` x${effect.giftQuantity}` : ''}</span>
        )}
      </div>
    </div>
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
