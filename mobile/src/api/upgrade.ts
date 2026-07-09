import { fetchJSON } from './client';

export interface UpgradeTerms {
  content: string;
  version: string;
}

export interface UpgradeRequestDTO {
  id: number;
  agencyId: number;
  agencyName?: string;
  agencyCode?: string;
  oldType: string;
  newType: string;
  changedByName?: string;
  reason?: string;
  termsVersion?: string;
  createdAt: string;
}

export interface UpgradeStatusResponse {
  type: string;
  history: UpgradeRequestDTO[];
  upgradeStatus: string;
}

export const upgradeApi = {
  getTerms: () => fetchJSON<UpgradeTerms>('/api/terms/customer-upgrade'),

  requestUpgrade: (agreedToTerms: boolean, termsVersion: string) =>
    fetchJSON<{ message: string }>('/api/agencies/me/request-upgrade', {
      method: 'POST',
      body: JSON.stringify({ agreedToTerms, termsVersion }),
    }),

  getUpgradeStatus: () =>
    fetchJSON<UpgradeStatusResponse>('/api/agencies/me/upgrade-status'),
};
