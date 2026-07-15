import { fetchJSON } from "@/lib/fetcher";

export interface AgencyDTO {
  id: number;
  code: string;
  name: string;
  representativeName?: string;
  taxCode?: string;
  shippingAddress?: string;
  billingAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  nickname?: string;
  phone?: string;
  active: boolean;
  status?: string;
  type?: string;
  hasHmn?: boolean;
  hmnAmount?: number;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AgencyRegisterRequest {
  code: string;
  name: string;
  representativeName?: string;
  taxCode?: string;
  billingAddress?: string;
  shippingAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  nickname?: string;
  phone: string;
  password: string;
}

export interface AgencyRequest {
  code?: string;
  name?: string;
  representativeName?: string;
  taxCode?: string;
  billingAddress?: string;
  shippingAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  nickname?: string;
  phone?: string;
  password?: string;
  active?: boolean;
  type?: string;
}

export interface AgencyApproveRequest {
  type: string;
  depositAmount?: number;
  debtTermDays?: number;
  initialVtc?: number;
  contractTerms?: string;
}

export const agencyApi = {
  getAll: () => fetchJSON<AgencyDTO[]>('/api/agencies'),
  getById: (id: number) => fetchJSON<AgencyDTO>(`/api/agencies/${id}`),
  getMe: () => fetchJSON<AgencyDTO>('/api/agencies/me'),
  register: (data: AgencyRegisterRequest) =>
    fetchJSON<AgencyDTO>('/api/agencies/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approve: (id: number, data: AgencyApproveRequest) =>
    fetchJSON<AgencyDTO>(`/api/agencies/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getPrices: (id: number) =>
    fetchJSON<{ id: number; name: string; agencyId: number }>(`/api/agencies/${id}/prices`),
  update: (id: number, data: AgencyRequest) =>
    fetchJSON<AgencyDTO>(`/api/agencies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  suspend: (id: number) =>
    fetchJSON<AgencyDTO>(`/api/agencies/${id}/status?action=suspend`, {
      method: 'PUT',
    }),
  activate: (id: number) =>
    fetchJSON<AgencyDTO>(`/api/agencies/${id}/status?action=activate`, {
      method: 'PUT',
    }),
  reject: (id: number) =>
    fetchJSON<AgencyDTO>(`/api/agencies/${id}/status?action=reject`, {
      method: 'PUT',
    }),
  getCategoriesDetail: (id: number) =>
    fetchJSON<{ id: number; name: string }[]>(`/api/agencies/${id}/categories`),
  getAgenciesByCategory: (categoryId: number) =>
    fetchJSON<{ id: number; name: string; code: string; phone?: string; active: boolean; status?: string; type?: string }[]>(`/api/agencies/by-category/${categoryId}`),
};
