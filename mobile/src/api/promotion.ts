import { fetchJSON } from './client';
import type { PromotionDTO } from '../types';

export const promotionApi = {
  getAll: () => fetchJSON<PromotionDTO[]>('/api/promotions'),
  getPlatform: () => fetchJSON<PromotionDTO[]>('/api/promotions/platform'),
  getByAgency: (agencyId: number) =>
    fetchJSON<PromotionDTO[]>(`/api/promotions/agency/${agencyId}`),
  validate: (code: string) =>
    fetchJSON<PromotionDTO>(`/api/promotions/validate?code=${encodeURIComponent(code)}`),
};
