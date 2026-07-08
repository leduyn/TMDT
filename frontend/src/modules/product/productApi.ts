import { fetchJSON } from "@/lib/fetcher";

async function fetchFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { method: 'POST', headers, body: formData });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('agencyId');
      window.location.href = '/login';
    }
    let err: any = {};
    try { err = await res.json(); } catch (e) { /* ignore */ }
    throw new Error(err.message || err.error || `Lỗi kết nối API (Status: ${res.status})`);
  }

  const text = await res.text();
  if (!text) return null as unknown as T;
  try { return JSON.parse(text) as T; } catch { return null as unknown as T; }
}

export interface CategoryDTO {
  id: number;
  name: string;
  imageUrl?: string;
  parentId?: number;
  parentName?: string;
  level?: number;
  levelName?: string;
}

export interface CategoryRequest {
  name: string;
  imageUrl?: string;
  parentId?: number;
}

export interface BrandDTO {
  id: number;
  code: string;
  name: string;
  logoUrl?: string;
}

export interface BrandRequest {
  code: string;
  name: string;
  logoUrl?: string;
}

export interface PolicyEffectDTO {
  id: number;
  name: string;
  policyType: string;
  conditionText: string;
  adjustmentType: string;
  adjustmentValue: number;
  originalPrice: number;
  adjustedPrice: number;
  giftProductName?: string;
  giftQuantity?: number;
  conditionMet?: boolean | null;
  conditionNote?: string;
}

export interface PriceFlowDetailsDTO {
  originalPrice: number;
  policyDiscount: number;
  priceAfterPolicy: number;
  promotionDiscount: number;
  finalPrice: number;
  appliedPolicies: PolicyEffectDTO[];
  appliedPromotions: PolicyEffectDTO[];
}

export interface ProductPolicyPreviewDTO {
  basePrice: number;
  minPurchaseQuantity: number;
  finalPrice: number;
  retailPolicies: PolicyEffectDTO[];
  salesPolicies: PolicyEffectDTO[];
  promotions: PolicyEffectDTO[];
  wholesaleFlow: PriceFlowDetailsDTO;
  retailFlow: PriceFlowDetailsDTO;
}

export interface ProductTypeDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface ProductTypeRequest {
  code: string;
  name: string;
  description?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ProductDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId?: number;
  categoryName?: string;
  basePrice?: number;
  dropshipPrice?: number;
  stockQuantity?: number;
  isDropship?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  brand?: BrandDTO;
  productType?: ProductTypeDTO;
  isAppVisible?: boolean;
  isWebVisible?: boolean;
  tags?: string;
  bravoOrder?: number;
  unit?: string;
  innerPackaging?: string;
  outerPackaging?: string;
  minPurchaseQuantity?: number;
  quantityStep?: number;
  userManual?: string;
  appliedPrice?: number;
  appliedPriceListName?: string;
  appliedPriceListId?: number;
  showDiscount?: boolean;
  oldAppliedPrice?: number;
  priceChangeRatio?: number;
  sku?: string;
  retailPriceEligible?: boolean;
  policyPreview?: ProductPolicyPreviewDTO;
  productCode?: string;
  retailWarrantyPeriod?: string;
  wholesaleWarrantyPeriod?: string;
  status?: string;
  otherName?: string;
  shortName?: string;
  specification?: string;
  feature1?: string;
  feature2?: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  categoryId: number;
  basePrice: number;
  dropshipPrice?: number;
  stockQuantity: number;
  isDropship?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  brandId?: number;
  productTypeId?: number;
  attributeValueIds?: number[];
  isAppVisible?: boolean;
  isWebVisible?: boolean;
  tags?: string;
  bravoOrder?: number;
  unit?: string;
  innerPackaging?: string;
  outerPackaging?: string;
  minPurchaseQuantity?: number;
  quantityStep?: number;
  userManual?: string;
  showDiscount?: boolean;
  productCode?: string;
  retailWarrantyPeriod?: string;
  wholesaleWarrantyPeriod?: string;
  status?: string;
  otherName?: string;
  shortName?: string;
  specification?: string;
  feature1?: string;
  feature2?: string;
}

export interface AttributeValueDTO {
  id: number;
  value: string;
  attributeId: number;
}

export interface AttributeDTO {
  id: number;
  name: string;
  displayName: string;
  categoryId?: number;
  categoryName?: string;
  isVariant?: boolean;
  values: AttributeValueDTO[];
}

export interface FacetValueDTO {
  valueId: number;
  value: string;
  count: number;
}

export interface FacetGroupDTO {
  attributeId: number;
  attributeName: string;
  displayName: string;
  values: FacetValueDTO[];
}

export interface FacetedSearchRequest {
  categoryId?: number;
  selectedValueIds?: number[];
  page?: number;
  size?: number;
  agencyId?: number;
  customerId?: number;
}

export interface FacetedSearchResponse {
  products: ProductDTO[];
  facets: FacetGroupDTO[];
  totalCount: number;
  page: number;
  size: number;
}

export const categoryApi = {
  getAll: () => fetchJSON<CategoryDTO[]>('/api/categories'),
  getById: (id: number) => fetchJSON<CategoryDTO>(`/api/categories/${id}`),
  create: (data: CategoryRequest) =>
    fetchJSON<CategoryDTO>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: CategoryRequest) =>
    fetchJSON<CategoryDTO>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchJSON<any>(`/api/categories/${id}`, {
      method: 'DELETE',
    }),
  getLevelNames: () => fetchJSON<Record<number, string>>('/api/categories/levels'),
  updateLevelNames: (data: Record<number, string>) =>
    fetchJSON<void>('/api/categories/levels', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getByLevel: (level: number) => fetchJSON<CategoryDTO[]>(`/api/categories/level/${level}`),
  getChildren: (id: number) => fetchJSON<CategoryDTO[]>(`/api/categories/${id}/children`),
  getForAgency: (agencyId: number) => fetchJSON<CategoryDTO[]>(`/api/categories/for-agency/${agencyId}`),
  exportUrl: '/api/categories/export',
};

export const productApi = {
  getAll: (agencyId?: number, customerId?: number) => {
    let params = '';
    if (agencyId) params += `?agencyId=${agencyId}`;
    if (customerId) params += `${params ? '&' : '?'}customerId=${customerId}`;
    return fetchJSON<ProductDTO[]>(`/api/products${params}`);
  },
  getPage: (params: { page?: number; size?: number; sort?: string; search?: string; agencyId?: number; customerId?: number; categoryId?: number }) => {
    const sp = new URLSearchParams();
    if (params.page !== undefined) sp.set('page', String(params.page));
    if (params.size !== undefined) sp.set('size', String(params.size));
    if (params.sort) sp.set('sort', params.sort);
    if (params.search) sp.set('search', params.search);
    if (params.agencyId) sp.set('agencyId', String(params.agencyId));
    if (params.customerId) sp.set('customerId', String(params.customerId));
    if (params.categoryId !== undefined) sp.set('categoryId', String(params.categoryId));
    const qs = sp.toString();
    return fetchJSON<PageResponse<ProductDTO>>(`/api/products/page${qs ? '?' + qs : ''}`);
  },
  getById: (id: number, agencyId?: number, customerId?: number) => {
    let params = '';
    if (agencyId) params += `?agencyId=${agencyId}`;
    if (customerId) params += `${params ? '&' : '?'}customerId=${customerId}`;
    return fetchJSON<ProductDTO>(`/api/products/${id}${params}`);
  },
  create: (data: ProductRequest) =>
    fetchJSON<ProductDTO>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ProductRequest) =>
    fetchJSON<ProductDTO>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchJSON<any>(`/api/products/${id}`, {
      method: 'DELETE',
    }),
};

export const brandApi = {
  getAll: () => fetchJSON<BrandDTO[]>('/api/brands'),
  getById: (id: number) => fetchJSON<BrandDTO>(`/api/brands/${id}`),
  create: (data: BrandRequest) =>
    fetchJSON<BrandDTO>('/api/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: BrandRequest) =>
    fetchJSON<BrandDTO>(`/api/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchJSON<any>(`/api/brands/${id}`, {
      method: 'DELETE',
    }),
};

export const attributeApi = {
  getAll: (categoryId?: number) => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    return fetchJSON<AttributeDTO[]>(`/api/attributes${params}`);
  },
  getById: (id: number) => fetchJSON<AttributeDTO>(`/api/attributes/${id}`),
  create: (data: { name: string; displayName: string; categoryId?: number; isVariant?: boolean }) =>
    fetchJSON<AttributeDTO>('/api/attributes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name: string; displayName: string; categoryId?: number; isVariant?: boolean }) =>
    fetchJSON<AttributeDTO>(`/api/attributes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchJSON<any>(`/api/attributes/${id}`, {
      method: 'DELETE',
    }),
  getValues: (attributeId: number) =>
    fetchJSON<AttributeValueDTO[]>(`/api/attributes/${attributeId}/values`),
  addValue: (attributeId: number, value: string) =>
    fetchJSON<AttributeValueDTO>(`/api/attributes/${attributeId}/values`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    }),
  deleteValue: (valueId: number) =>
    fetchJSON<any>(`/api/attributes/values/${valueId}`, {
      method: 'DELETE',
    }),
};

export interface ProductImportAttributeConfig {
  specColumn: string;
  specDelimiter: string;
  variantColumns: string[];
}

export interface ProductImportRequest {
  columnMappings: Record<string, string>;
  hasHeaderRow: boolean;
  sheetIndex: number;
  attributeConfig?: ProductImportAttributeConfig;
}

export interface ProductImportRowResult {
  rowIndex: number;
  success: boolean;
  message: string;
  productId?: number;
  productName?: string;
  action?: string;
}

export interface ProductImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  rowResults: ProductImportRowResult[];
}

export const productTypeApi = {
  getAll: () => fetchJSON<ProductTypeDTO[]>('/api/product-types'),
  getById: (id: number) => fetchJSON<ProductTypeDTO>(`/api/product-types/${id}`),
  create: (data: ProductTypeRequest) =>
    fetchJSON<ProductTypeDTO>('/api/product-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ProductTypeRequest) =>
    fetchJSON<ProductTypeDTO>(`/api/product-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchJSON<any>(`/api/product-types/${id}`, {
      method: 'DELETE',
    }),
};

export interface CategoryImportRequest {
  columnMappings: Record<string, string>;
  hasHeaderRow: boolean;
  sheetIndex: number;
}

export interface CategoryImportRowResult {
  rowIndex: number;
  success: boolean;
  message: string;
  categoryId?: number;
  categoryName?: string;
}

export interface CategoryImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  rowResults: CategoryImportRowResult[];
}

export const categoryImportApi = {
  importCategories: (file: File, mapping: CategoryImportRequest) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    return fetchFormData<CategoryImportResult>('/api/categories/import', formData);
  },
  downloadTemplateUrl: '/api/categories/import/template',
};

export interface BrandImportRequest {
  columnMappings: Record<string, string>;
  hasHeaderRow: boolean;
  sheetIndex: number;
}

export interface BrandImportRowResult {
  rowIndex: number;
  success: boolean;
  message: string;
  brandId?: number;
  brandName?: string;
}

export interface BrandImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  rowResults: BrandImportRowResult[];
}

export const brandImportApi = {
  importBrands: (file: File, mapping: BrandImportRequest) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    return fetchFormData<BrandImportResult>('/api/brands/import', formData);
  },
  downloadTemplateUrl: '/api/brands/import/template',
  exportBrandsUrl: '/api/brands/export',
};

export interface JsonImportRequest {
  fileName: string;
  fileContent: string;
  mapping: ProductImportRequest;
}

export const productImportApi = {
  importProducts: async (file: File, mapping: ProductImportRequest) => {
    const fileContent = await fileToBase64(file);
    const body: JsonImportRequest = {
      fileName: file.name,
      fileContent,
      mapping,
    };

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${backendUrl}/api/products/import-json`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let err: any = {};
      try { err = await res.json(); } catch (e) { /* ignore */ }
      throw new Error(err.message || err.error || `Lỗi kết nối API (Status: ${res.status})`);
    }

    return res.json();
  },
  downloadTemplateUrl: '/api/products/import/template',
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const facetedSearchApi = {
  search: (request: FacetedSearchRequest) =>
    fetchJSON<FacetedSearchResponse>('/api/products/search/faceted', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  getProductAttributes: (productId: number) =>
    fetchJSON<AttributeValueDTO[]>(`/api/products/${productId}/attributes`),
  assignProductAttributes: (productId: number, attributeValueIds: number[]) =>
    fetchJSON<AttributeValueDTO[]>(`/api/products/${productId}/attributes`, {
      method: 'POST',
      body: JSON.stringify({ attributeValueIds }),
    }),
};
