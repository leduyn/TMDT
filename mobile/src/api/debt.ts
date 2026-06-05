import { fetchJSON } from './client';
import type { AgencyDebtDTO } from '../types';

export const debtApi = {
  getByAgency: (agencyId: number) =>
    fetchJSON<AgencyDebtDTO[]>(`/api/agency-debts/agency/${agencyId}`),
  getAll: () => fetchJSON<AgencyDebtDTO[]>('/api/agency-debts'),
  pay: (debtId: number) =>
    fetchJSON<{ message: string }>(`/api/agency-debts/${debtId}/pay`, {
      method: 'POST',
    }),
};
