import { fetchJSON } from "@/lib/fetcher";

export interface GuideStepDTO {
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

export interface GuideDTO {
  id: number;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  conditions?: string;
  createdAt?: string;
  updatedAt?: string;
  steps?: GuideStepDTO[];
}

export interface CreateGuideRequest {
  name: string;
  description?: string;
  version?: number;
  isActive?: boolean;
  conditions?: string;
}

export interface CreateGuideStepRequest {
  targetId: number;
  title: string;
  description?: string;
  placement: string;
  stepOrder: number;
  navigateToScreen?: string;
  navigateToParams?: string;
}

export interface UpdateGuideStepRequest {
  targetId: number;
  title: string;
  description?: string;
  placement: string;
  stepOrder: number;
  navigateToScreen?: string;
  navigateToParams?: string;
}

export const guideApi = {
  getAll: () => fetchJSON<GuideDTO[]>('/api/guides'),

  getActive: () => fetchJSON<GuideDTO[]>('/api/guides/active'),

  getById: (id: number) => fetchJSON<GuideDTO>(`/api/guides/${id}`),

  create: (data: CreateGuideRequest) =>
    fetchJSON<GuideDTO>('/api/guides', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: CreateGuideRequest) =>
    fetchJSON<GuideDTO>(`/api/guides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchJSON<{ message: string }>(`/api/guides/${id}`, {
      method: 'DELETE',
    }),

  toggleActive: (id: number) =>
    fetchJSON<{ message: string }>(`/api/guides/${id}/toggle-active`, {
      method: 'PUT',
    }),

  addStep: (guideId: number, data: CreateGuideStepRequest) =>
    fetchJSON<GuideStepDTO>(`/api/guides/${guideId}/steps`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStep: (guideId: number, stepId: number, data: UpdateGuideStepRequest) =>
    fetchJSON<GuideStepDTO>(`/api/guides/${guideId}/steps/${stepId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteStep: (guideId: number, stepId: number) =>
    fetchJSON<{ message: string }>(`/api/guides/${guideId}/steps/${stepId}`, {
      method: 'DELETE',
    }),
};
