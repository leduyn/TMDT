import { fetchJSON } from "@/lib/fetcher";

export interface GuideTargetDTO {
  id: number;
  key: string;
  name: string;
  description?: string;
  screenName: string;
  createdAt?: string;
}

export interface CreateGuideTargetRequest {
  key: string;
  name: string;
  description?: string;
  screenName: string;
}

export const guideTargetApi = {
  getAll: () => fetchJSON<GuideTargetDTO[]>('/api/guide-targets'),

  getById: (id: number) => fetchJSON<GuideTargetDTO>(`/api/guide-targets/${id}`),

  create: (data: CreateGuideTargetRequest) =>
    fetchJSON<GuideTargetDTO>('/api/guide-targets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: CreateGuideTargetRequest) =>
    fetchJSON<GuideTargetDTO>(`/api/guide-targets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchJSON<{ message: string }>(`/api/guide-targets/${id}`, {
      method: 'DELETE',
    }),
};
