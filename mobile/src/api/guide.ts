import { fetchJSON } from './client';

export interface ApiGuideStepDTO {
  id: number;
  guideId: number;
  targetId: number;
  title: string;
  description?: string;
  placement: string;
  stepOrder: number;
  navigateToScreen?: string;
  navigateToParams?: string;
  createdAt?: string;
  targetKey?: string;
  targetName?: string;
}

export interface ApiGuideDTO {
  id: number;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  conditions?: string;
  createdAt?: string;
  updatedAt?: string;
  steps?: ApiGuideStepDTO[];
}

export const guideApi = {
  getActive: () => fetchJSON<ApiGuideDTO[]>('/api/guides/active'),

  getAll: () => fetchJSON<ApiGuideDTO[]>('/api/guides'),

  getById: (id: number) => fetchJSON<ApiGuideDTO>(`/api/guides/${id}`),
};
