import { fetchJSON } from "@/lib/fetcher";

export interface CustomerDTO {
  id: number;
  agencyId?: number;
  organizationName?: string;
  taxCode?: string;
  shippingAddress?: string;
  billingAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  note?: string;
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
  getAll: () => fetchJSON<CustomerDTO[]>('/api/customers'),
  getById: (id: number) => fetchJSON<CustomerDTO>(`/api/customers/${id}`),
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
