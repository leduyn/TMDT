import { fetchJSON } from "@/lib/fetcher";

export interface SalesPolicyDTO {
  id: number;
  name: string;
  active: boolean;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags?: string;
  maxOrderCount?: number;
  maxApplicationPerAgency?: number;
  targetType?: string;
  maxDiscountValue?: number;
  applyToAllProducts: boolean;
  createdAt: string;

  includedAgencyIds: number[];
  includedAgencyNames: string[];

  excludedAgencyIds: number[];
  excludedAgencyNames: string[];

  targetProductIds: number[];
  targetProductNames: string[];

  targetCategoryIds: number[];
  targetCategoryNames: string[];

  excludedProductIds?: number[];
  excludedProductNames?: string[];

  excludedCategoryIds?: number[];
  excludedCategoryNames?: string[];

  audienceFilters?: Array<{
    id?: number;
    rankLevels?: string;
    provinces?: string;
  }>;

  tiers?: Array<{
    id?: number;
    tierIndex: number;
    operator: string;
    thresholdValue: number;
    adjustmentType: string;
    adjustmentValue: number;
    giftProductId?: number;
    giftProductName?: string;
    giftQuantity?: number;
    giftNote?: string;
  }>;

  productGroups?: ProductGroupResponse[];
}

export interface ProductGroupItemResponse {
  id: number;
  itemType: 'PRODUCT' | 'CATEGORY';
  itemId: number;
  itemName?: string;
  description?: string;
}

export interface ProductGroupResponse {
  id: number;
  groupName: string;
  groupIndex?: number;
  items: ProductGroupItemResponse[];
}

export interface ProductGroupItemRequest {
  itemType: 'PRODUCT' | 'CATEGORY';
  itemId: number;
  description?: string;
}

export interface ProductGroupRequest {
  groupName: string;
  items: ProductGroupItemRequest[];
}

export interface SalesPolicyRequest {
  name: string;
  active: boolean;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags?: string;
  maxOrderCount?: number;
  maxApplicationPerAgency?: number;
  targetType?: string;
  maxDiscountValue?: number;
  applyToAllProducts: boolean;
  includedAgencyIds: number[];
  excludedAgencyIds: number[];
  targetProductIds?: number[];
  targetCategoryIds?: number[];
  excludedProductIds?: number[];
  excludedCategoryIds?: number[];
  productGroups?: ProductGroupRequest[];
  audienceFilters?: Array<{
    rankLevels: string;
    provinces: string;
  }>;
  tiers?: Array<{
    tierIndex: number;
    operator: string;
    thresholdValue: number;
    adjustmentType: string;
    adjustmentValue: number;
    giftProductId?: number;
    giftQuantity?: number;
    giftNote?: string;
  }>;
}

export const salesPolicyApi = {
  getAll: () => fetchJSON<SalesPolicyDTO[]>('/api/sales-policies'),
  getById: (id: number) => fetchJSON<SalesPolicyDTO>(`/api/sales-policies/${id}`),
  create: (data: SalesPolicyRequest) => fetchJSON<SalesPolicyDTO>('/api/sales-policies', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: number, data: SalesPolicyRequest) => fetchJSON<SalesPolicyDTO>(`/api/sales-policies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id: number) => fetchJSON<any>(`/api/sales-policies/${id}`, {
    method: 'DELETE'
  }),
  resolvePrice: (productId: number, agencyId: number, quantity: number) => 
    fetchJSON<number>(`/api/sales-policies/resolve-price?productId=${productId}&agencyId=${agencyId}&quantity=${quantity}`)
};
