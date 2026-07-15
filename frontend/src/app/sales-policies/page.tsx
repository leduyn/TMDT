'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  salesPolicyApi, 
  SalesPolicyDTO
} from '@/lib/api';

// UI Components
import PageHeader from '@/components/ui/PageHeader';
import SearchActionHeader from '@/components/ui/SearchActionHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

export default function SalesPoliciesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [policies, setPolicies] = useState<SalesPolicyDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'SALES_POLICY' | 'PROMOTION' | 'RETAIL_POLICY'>('SALES_POLICY');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const isAdmin = user?.roles?.some(r => ['ROLE_COMPANY', 'ROLE_ADMIN'].includes(r));

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const policiesData = await salesPolicyApi.getAll();
      const sorted = (policiesData || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPolicies(sorted);
    } catch (err) {
      console.error('Failed to load Sales Policies data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    router.push(`/sales-policies/new?type=${activeTab}`);
  };

  const handleOpenEdit = (id: number) => {
    router.push(`/sales-policies/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chính sách này?')) return;
    try {
      await salesPolicyApi.delete(id);
      loadAllData();
    } catch (err: any) {
      alert('Không thể xóa chính sách này');
    }
  };

  const formatOperator = (op: string) => {
    if (op === 'LT' || op === '<') return '<';
    if (op === 'GT' || op === '>') return '>';
    if (op === 'LTE' || op === '<=') return '<=';
    if (op === 'GTE' || op === '>=') return '>=';
    if (op === 'EQ' || op === '=') return '=';
    return op;
  };

  const formatCondition = (p: SalesPolicyDTO) => {
    if (p.policyType === 'RETAIL_POLICY') {
      return `SL mua < SL tối thiểu SP`;
    }
    if (p.targetType === 'ORDER_VALUE') {
      return `Đơn hàng theo bậc điều kiện`;
    }
    if (p.targetType === 'PRODUCT_QTY') {
      return `Tổng số lượng sản phẩm áp dụng`;
    }
    if (p.targetType === 'PRODUCT_REVENUE') {
      return `Tổng doanh thu sản phẩm áp dụng`;
    }
    return p.targetType || '';
  };

  const formatFormula = (p: SalesPolicyDTO) => {
    if (p.policyType === 'RETAIL_POLICY' && p.tiers && p.tiers.length > 0) {
      const t = p.tiers[0];
      if (t.adjustmentType === 'PERCENTAGE') {
        return `${t.adjustmentValue > 0 ? '+' : ''}${t.adjustmentValue}%`;
      } else if (t.adjustmentType === 'FIXED_AMOUNT') {
        return `${t.adjustmentValue > 0 ? '+' : ''}${t.adjustmentValue?.toLocaleString()}đ`;
      } else if (t.adjustmentType === 'SPECIFIC_PRICE') {
        return `Giá chỉ định ${t.adjustmentValue?.toLocaleString()}đ`;
      }
      return '';
    }
    if (p.tiers && p.tiers.length > 0) {
      const topTier = p.tiers[p.tiers.length - 1];
      const op = formatOperator(topTier.operator || '');
      
      let adjustStr = '';
      if (topTier.adjustmentType === 'PERCENTAGE') {
        adjustStr = `-${topTier.adjustmentValue}%`;
      } else if (topTier.adjustmentType === 'FIXED_AMOUNT') {
        adjustStr = `-${topTier.adjustmentValue?.toLocaleString()}đ`;
      } else if (topTier.adjustmentType === 'SPECIFIC_PRICE') {
        adjustStr = `Giá chỉ định ${topTier.adjustmentValue?.toLocaleString()}đ`;
      }

      let giftStr = '';
      if (topTier.giftProductName) {
        giftStr = ` + Tặng ${topTier.giftQuantity}x ${topTier.giftProductName}`;
      } else if (topTier.giftNote) {
        giftStr = ` + ${topTier.giftNote}`;
      }

      return `Đơn ${op} ${topTier.thresholdValue?.toLocaleString()}đ: ${adjustStr}${giftStr}`;
    }
    return 'Chưa cấu hình mức điều kiện';
  };

  const tabPolicies = policies.filter(p => (p.policyType || 'SALES_POLICY') === activeTab);
  const filteredPolicies = tabPolicies.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPolicies.length / pageSize) || 1;
  const paginatedPolicies = filteredPolicies.slice(page * pageSize, (page + 1) * pageSize);

  const columns: Column<SalesPolicyDTO>[] = [
    {
      header: 'Tên ưu đãi',
      key: 'name',
      width: '30%',
      render: (p) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-white">{p.name}</span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {p.tags && p.tags.split(',').filter(Boolean).map(tag => (
              <span key={tag} className="badge badge-primary px-1.5 py-0.5 text-[10px]" style={{ borderRadius: 4 }}>
                {tag}
              </span>
            ))}
            <span className="text-[10px] text-[var(--text-secondary)]">
              Tạo lúc: {new Date(p.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Cơ sở xét duyệt',
      key: 'targetType',
      width: '20%',
      render: (p) => (
        <Badge label={formatCondition(p)} type="info" icon="TrendingUp" />
      )
    },
    {
      header: 'Mức ưu đãi cao nhất',
      key: 'tiers',
      width: '25%',
      render: (p) => (
        <div className="font-semibold text-[var(--accent-light)] text-xs leading-normal">
          {formatFormula(p)}
        </div>
      )
    },
    {
      header: 'Trạng thái',
      key: 'active',
      align: 'center',
      width: '12%',
      render: (p) => (
        <Badge 
          label={p.active ? 'Đang hoạt động' : 'Tạm ngưng'} 
          type={p.active ? 'success' : 'error'} 
          icon={p.active ? 'CheckCircle' : 'PauseCircle'}
        />
      )
    },
    {
      header: 'Thao tác',
      key: 'actions',
      align: 'right',
      width: '13%',
      render: (p) => (
        <div className="flex justify-end gap-2">
          <button 
            className="btn-outline p-2" 
            style={{ borderRadius: 8 }} 
            onClick={() => handleOpenEdit(p.id)}
          >
            <Edit2 size={14} />
          </button>
          {isAdmin && (
            <button 
              className="btn-outline p-2 text-red-400 hover:text-red-300 border-red-950/20" 
              style={{ borderRadius: 8 }} 
              onClick={() => handleDelete(p.id)}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )
    }
  ];

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] text-[var(--text-secondary)] text-sm">
          Bạn không có quyền truy cập module này.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="main-content bg-grid">
        <PageHeader 
          title="Chương trình ưu đãi (CSBH)" 
          subtitle="Thiết lập các kịch bản chiết khấu và quà tặng hấp dẫn theo bậc thang thỏa mãn điều kiện mua hàng"
          icon="Settings"
        />

        {/* TABS */}
        <div className="flex border-b border-[var(--border)] mb-6 gap-0">
          <button
            onClick={() => setActiveTab('SALES_POLICY')}
            className={`px-6 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'SALES_POLICY' ? 'text-[var(--accent-light)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            Chính sách bán hàng
            {activeTab === 'SALES_POLICY' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)]" />}
          </button>
          <button
            onClick={() => setActiveTab('RETAIL_POLICY')}
            className={`px-6 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'RETAIL_POLICY' ? 'text-[var(--accent-light)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            Chính sách bán lẻ
            {activeTab === 'RETAIL_POLICY' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)]" />}
          </button>
          <button
            onClick={() => setActiveTab('PROMOTION')}
            className={`px-6 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'PROMOTION' ? 'text-[var(--accent-light)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            Chương trình khuyến mãi
            {activeTab === 'PROMOTION' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)]" />}
          </button>
        </div>

        <SearchActionHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder={`Tìm kiếm ${activeTab === 'SALES_POLICY' ? 'chính sách bán hàng' : activeTab === 'RETAIL_POLICY' ? 'chính sách bán lẻ' : 'khuyến mãi'} theo tên...`}
          actions={
            <button className="btn-primary" onClick={handleOpenCreate}>
              <Plus size={16} />
              {activeTab === 'SALES_POLICY' ? 'Tạo CSBH mới' : activeTab === 'RETAIL_POLICY' ? 'Tạo CSBL mới' : 'Tạo KM mới'}
            </button>
          }
        />

        <DataTable 
          data={paginatedPolicies}
          columns={columns}
          loading={isLoading}
          emptyMessage={searchQuery ? 'Không tìm thấy chương trình ưu đãi nào phù hợp' : 'Chưa có chương trình ưu đãi nào'}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </main>
    </>
  );
}
