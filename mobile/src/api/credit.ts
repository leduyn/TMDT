import { fetchJSON } from './client';
import type { CreditDetailResponse } from '../types';

export const creditApi = {
  getDetail: (agencyId: number) =>
    fetchJSON<CreditDetailResponse>(`/api/credit/agents/${agencyId}/detail`),
  getHmkd: (agencyId: number) =>
    fetchJSON<{ hmkd: number }>(`/api/credit/agents/${agencyId}/hmkd`),
};
