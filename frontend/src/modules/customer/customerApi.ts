import { fetchJSON } from "@/lib/fetcher";

export interface CustomerDTO {
  id: number;
  agencyId?: number;
  userId?: number;
  organizationName?: string;
  taxCode?: string;
  shippingAddress?: string;
  billingAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  note?: string;
  assigned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerRequest {
  agencyId?: number;
  organizationName?: string;
  taxCode?: string;
  shippingAddress?: string;
  billingAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  note?: string;
}

export const customerApi = {
  getAll: (agencyId?: number) => {
    const params = agencyId ? `?agencyId=${agencyId}` : '';
    return fetchJSON<CustomerDTO[]>(`/api/customers${params}`);
  },
  getById: (id: number) => fetchJSON<CustomerDTO>(`/api/customers/${id}`),
  check: (params: { phone?: string; taxCode?: string; agencyId?: number }) => {
    const qs = new URLSearchParams();
    if (params.phone) qs.set('phone', params.phone);
    if (params.taxCode) qs.set('taxCode', params.taxCode);
    if (params.agencyId) qs.set('agencyId', String(params.agencyId));
    const str = qs.toString();
    return fetchJSON<CustomerDTO | null>(`/api/customers/check${str ? '?' + str : ''}`).catch(() => null);
  },
  searchByTaxCode: (taxCode: string) => fetchJSON<CustomerDTO>(`/api/customers/search?taxCode=${encodeURIComponent(taxCode)}`),
  create: (data: CustomerRequest) =>
    fetchJSON<CustomerDTO>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: CustomerRequest) =>
    fetchJSON<CustomerDTO>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => fetchJSON<void>(`/api/customers/${id}`, { method: 'DELETE' }),
};

export const customerGroupApi = {
  getAll: () => fetchJSON<{ id: number; name: string }[]>('/api/customer-groups'),
};
