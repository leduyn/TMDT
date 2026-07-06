export interface CategoryDTO {
  id: number
  name: string
  imageUrl?: string
  parentId?: number
  level?: number
}

export interface ProductDTO {
  id: number
  name: string
  description: string
  basePrice: number
  stockQuantity: number
  categoryId?: number
  categoryName?: string
  imageUrl?: string
  imageUrls?: string[]
  unit?: string
  specification?: string
  productCode?: string
  appliedPrice?: number
  brand?: BrandDTO
  productType?: ProductTypeDTO
}

export interface BrandDTO {
  id: number
  code: string
  name: string
  logoUrl?: string
}

export interface ProductTypeDTO {
  id: number
  code: string
  name: string
  description?: string
}

export interface ShelfData {
  category: CategoryDTO
  products: ProductDTO[]
  position: [number, number, number]
}

export type CameraTarget = 'overview' | { categoryId: number }
