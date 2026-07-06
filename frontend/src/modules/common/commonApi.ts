import { fetchJSON } from "@/lib/fetcher";

const API_BASE = '';

export interface PolicyEffect {
  id: number;
  name: string;
  policyType: string;
  conditionText: string;
  adjustmentType: string;
  adjustmentValue: number;
  originalPrice: number;
  adjustedPrice: number;
  giftProductName: string | null;
  giftQuantity: number | null;
}

export interface PriceFlowDetails {
  originalPrice: number;
  policyDiscount: number;
  priceAfterPolicy: number;
  promotionDiscount: number;
  finalPrice: number;
  appliedPolicies: PolicyEffect[];
  appliedPromotions: PolicyEffect[];
}

export interface ProductPolicyPreviewResult {
  basePrice: number;
  minPurchaseQuantity?: number;
  finalPrice: number;
  retailPolicies: PolicyEffect[];
  salesPolicies: PolicyEffect[];
  promotions: PolicyEffect[];
  wholesaleFlow?: PriceFlowDetails;
  retailFlow?: PriceFlowDetails;
}

export const productPreviewApi = {
  get: async (productId: number, quantity?: number, agencyId?: number): Promise<ProductPolicyPreviewResult> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const params = new URLSearchParams({ productId: String(productId) });
    if (quantity != null) params.set('quantity', String(quantity));
    if (agencyId != null) params.set('agencyId', String(agencyId));
    const res = await fetch(`/api/sales-policies/product-preview?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Không thể tải thông tin chính sách cho sản phẩm');
    return res.json();
  },
};

export interface RetailTrendConfig {
  increaseLabel: string;
  increaseColor: string;
  decreaseLabel: string;
  decreaseColor: string;
  neutralLabel: string;
  neutralColor: string;
}

export const retailTrendApi = {
  get: async (): Promise<RetailTrendConfig> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE}/api/config/retail-trend`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Không thể tải cấu hình xu hướng giá');
    return res.json();
  },
  update: async (payload: RetailTrendConfig): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE}/api/config/retail-trend`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Không thể lưu cấu hình xu hướng giá');
  },
};

export const uploadApi = {
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Upload thất bại');
    }
    return res.json();
  },
  uploadBrandLogo: async (file: File): Promise<{ url: string }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload/brand-logo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Upload logo thất bại');
    }
    return res.json();
  },
  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Upload avatar thất bại');
    }
    return res.json();
  },
};
