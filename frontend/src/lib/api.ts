const API_BASE = '';

// ─── Auth ──────────────────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface JwtResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface MessageResponse {
  message: string;
}

// ─── Category ──────────────────────────────────────────────────────────────
export interface CategoryDTO {
  id: number;
  name: string;
  imageUrl?: string;
  parentId?: number;
  parentName?: string;
}

export interface CategoryRequest {
  name: string;
  imageUrl?: string;
  parentId?: number;
}

// ─── Brand ─────────────────────────────────────────────────────────────────
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


// ─── Product ───────────────────────────────────────────────────────────────
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
}


// ─── Helpers ───────────────────────────────────────────────────────────────
async function fetchJSON<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Lỗi kết nối API');
  }
  return res.json();
}

// ─── Auth API ──────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginRequest) =>
    fetchJSON<JwtResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: RegisterRequest) =>
    fetchJSON<MessageResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Upload API ─────────────────────────────────────────────────────────────
export const uploadApi = {
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Upload thất bại');
    }
    return res.json();
  },
  uploadBrandLogo: async (file: File): Promise<{ url: string }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload/brand-logo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Upload logo thất bại');
    }
    return res.json();
  },
};

// ─── Category API ──────────────────────────────────────────────────────────
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
};

// ─── Product API ───────────────────────────────────────────────────────────
export const productApi = {
  getAll: () => fetchJSON<ProductDTO[]>('/api/products'),
  getById: (id: number) => fetchJSON<ProductDTO>(`/api/products/${id}`),
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

// ─── Brand API ─────────────────────────────────────────────────────────────
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

