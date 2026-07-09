import { fetchJSON } from "@/lib/fetcher";

export interface UpgradeTerms {
  content: string;
  version: string;
}

export interface RetailAgencyDTO {
  id: number;
  code: string;
  name: string;
  phone?: string;
  type: string;
}

export const upgradeApi = {
  getTerms: () => fetchJSON<UpgradeTerms>('/api/terms/customer-upgrade'),

  updateTerms: (content: string) =>
    fetchJSON<{ message: string; version: number }>('/api/admin/terms/customer-upgrade', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  getRequests: () =>
    fetchJSON<any[]>('/api/admin/agencies/upgrade-requests'),

  approveUpgrade: (historyId: number, approved: boolean, rejectReason?: string) =>
    fetchJSON<any>(`/api/admin/agencies/${historyId}/approve-upgrade`, {
      method: 'PUT',
      body: JSON.stringify({ approved, rejectReason }),
    }),

  requestUpgrade: () =>
    fetchJSON<any>('/api/agencies/me/request-upgrade', {
      method: 'POST',
    }),

  getUpgradeStatus: () =>
    fetchJSON<{ type: string; history: any[]; upgradeStatus: string }>(
      '/api/agencies/me/upgrade-status'
    ),

  getRetailAgencies: () =>
    fetchJSON<RetailAgencyDTO[]>('/api/admin/agencies/retail'),

  directUpgrade: (agencyId: number) =>
    fetchJSON<{ message: string }>(`/api/admin/agencies/${agencyId}/direct-upgrade`, {
      method: 'POST',
    }),

  getWholesaleAgencies: () =>
    fetchJSON<RetailAgencyDTO[]>('/api/admin/agencies/wholesale'),

  directDowngrade: (agencyId: number) =>
    fetchJSON<{ message: string }>(`/api/admin/agencies/${agencyId}/direct-downgrade`, {
      method: 'POST',
    }),
};