import { fetchJSON } from "@/lib/fetcher";
import type { PageResponse } from "@/modules/product/productApi";

export interface PriceListDTO {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
  active: boolean;
  itemCount: number;
}

export interface PriceAssignmentVoucher {
  id?: number;
  name: string;
  priceListId: number;
  priceListName?: string;
  assignmentType: string;
  rankLevel?: string;
  agencyId?: number;
  agencyName?: string;
  customerGroupId?: number;
  customerGroupName?: string;
  customerId?: number;
  customerName?: string;
  scheduledAt: string;
  status?: string;
  createdAt?: string;
  appliedAt?: string;
}

export interface PriceUpdateVoucherDTO {
  id: number;
  name: string;
  description?: string;
  scheduledAt: string;
  status: string;
  createdAt: string;
  appliedAt?: string;
  priceListIds: number[];
  items: PriceUpdateVoucherItemDTO[];
}

export interface PriceUpdateVoucherItemDTO {
  productId: number;
  productName: string;
  newPrice: number;
  isVisible: boolean;
}

export interface PriceUpdateVoucherRequest {
  name: string;
  description?: string;
  scheduledAt: string;
  priceListIds: number[];
  items: { productId: number; newPrice: number; isVisible: boolean }[];
}

export interface PriceListItemDTO {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  price: number;
  isVisible: boolean;
  oldPrice?: number;
}

export const priceListApi = {
  getAll: () => fetchJSON<PriceListDTO[]>('/api/price-lists'),
  getById: (id: number) => fetchJSON<PriceListDTO>(`/api/price-lists/${id}`),
  resolveForAgency: (agencyId: number) => fetchJSON<PriceListDTO>(`/api/price-lists/resolve/agency/${agencyId}`),
  getItems: (id: number, page?: number, size?: number, search?: string) => {
    const params = new URLSearchParams();
    if (page !== undefined) params.set('page', page.toString());
    if (size !== undefined) params.set('size', size.toString());
    if (search) params.set('search', search);
    const qs = params.toString();
    return fetchJSON<PageResponse<PriceListItemDTO>>(`/api/price-lists/${id}/items${qs ? '?' + qs : ''}`);
  },
};

export const priceAssignmentVoucherApi = {
  getAll: () => fetchJSON<PriceAssignmentVoucher[]>('/api/price-assignment-vouchers'),
  create: (data: PriceAssignmentVoucher) => fetchJSON<PriceAssignmentVoucher>('/api/price-assignment-vouchers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  cancel: (id: number) => fetchJSON<void>(`/api/price-assignment-vouchers/${id}/cancel`, {
    method: 'POST'
  }),
  stop: (id: number) => fetchJSON<void>(`/api/price-assignment-vouchers/${id}/stop`, {
    method: 'POST'
  }),
  reactivate: (id: number, scheduledAt?: string) => fetchJSON<void>(`/api/price-assignment-vouchers/${id}/reactivate`, {
    method: 'POST',
    body: scheduledAt ? JSON.stringify({ scheduledAt }) : undefined
  })
};

export const priceUpdateVoucherApi = {
  getAll: () => fetchJSON<PriceUpdateVoucherDTO[]>('/api/price-vouchers'),
  getById: (id: number) => fetchJSON<PriceUpdateVoucherDTO>(`/api/price-vouchers/${id}`),
  create: (data: PriceUpdateVoucherRequest) => fetchJSON<PriceUpdateVoucherDTO>('/api/price-vouchers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  cancel: (id: number) => fetchJSON<any>(`/api/price-vouchers/${id}/cancel`, {
    method: 'POST'
  }),
  apply: (id: number) => fetchJSON<any>(`/api/price-vouchers/${id}/apply`, {
    method: 'POST'
  }),
  getActiveHistoryForAgency: (agencyId: number) => fetchJSON<PriceUpdateVoucherDTO[]>(`/api/price-vouchers/active-history/agency/${agencyId}`)
};
