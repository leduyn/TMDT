import { fetchJSON } from "@/lib/fetcher";

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

export const priceListApi = {
  getAll: () => fetchJSON<PriceListDTO[]>('/api/price-lists'),
  getById: (id: number) => fetchJSON<PriceListDTO>(`/api/price-lists/${id}`),
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
  })
};
