import { fetchJSON } from "@/lib/fetcher";

export interface BusinessRegionDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  wardIds: number[];
}

export interface BusinessRegionRequest {
  code: string;
  name: string;
  description?: string;
  active: boolean;
  wardIds: number[];
  provinceIds?: number[];
}

export interface WardDTO {
  id: number;
  code: number;
  name: string;
  codename?: string;
  divisionType?: string;
  shortCodename?: string;
  regionId?: number;
  regionName?: string;
  provinceId?: number;
  provinceName?: string;
}


export interface ProvinceDTO {
  id: number;
  code: number;
  name: string;
  codename?: string;
  divisionType?: string;
  phoneCode?: number;
  wards: WardDTO[];
}

export const regionApi = {
  getAll: () => fetchJSON<BusinessRegionDTO[]>('/api/regions'),
  getById: (id: number) => fetchJSON<BusinessRegionDTO>(`/api/regions/${id}`),
  create: (data: BusinessRegionRequest) => fetchJSON<BusinessRegionDTO>('/api/regions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: number, data: BusinessRegionRequest) => fetchJSON<BusinessRegionDTO>(`/api/regions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id: number) => fetchJSON<void>(`/api/regions/${id}`, {
    method: 'DELETE'
  }),
  getHierarchy: () => fetchJSON<ProvinceDTO[]>('/api/locations/hierarchy'),
  syncProvinces: () => fetchJSON<{message: string}>('/api/admin/regions/sync-provinces', { method: 'POST' }),
  syncWards: () => fetchJSON<{message: string}>('/api/admin/regions/sync-wards', { method: 'POST' }),
};
