export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  taxCode?: string;
  role?: string;
}

export interface JwtResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
  agencyId?: number;
  shippingAddress?: string;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  role: string;
  customerGroupId?: number;
  customerGroupName?: string;
  agencyIds?: number[];
  agencyNames?: string[];
  active?: boolean;
  agencyId?: number;
  organizationName?: string;
  shippingAddress?: string;
  billingAddress?: string;
  taxCode?: string;
  phone?: string;
  approved?: boolean;
  displayName?: string;
  customName?: string;
  customShippingAddress?: string;
  customPhone?: string;
  totalDebt?: number;
}

export interface CategoryDTO {
  id: number;
  name: string;
  imageUrl?: string;
  parentId?: number;
  parentName?: string;
}

export interface BrandDTO {
  id: number;
  code: string;
  name: string;
  logoUrl?: string;
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
  isAppVisible?: boolean;
  tags?: string;
  unit?: string;
  minPurchaseQuantity?: number;
  quantityStep?: number;
  appliedPrice?: number;
  appliedPriceListName?: string;
  oldAppliedPrice?: number;
  priceChangeRatio?: number;
  sku?: string;
}

export interface OrderDTO {
  id: number;
  customerId: number;
  customerName: string;
  agencyId?: number;
  agencyName?: string;
  totalAmount: number;
  discountAmount: number;
  deliveryFee: number;
  status: OrderStatus;
  orderType?: string;
  shippingAddress?: string;
  promotionCode?: string;
  pointsRedeemed?: number;
  orderDate: string;
  items: OrderItemDTO[];
  priceListId?: number;
  paymentMethod?: string;
  orderSource?: string;
  createdByName?: string;
  updatedDate?: string;
}

export type OrderStatus = 'NEW' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'PENDING_PAYMENT';

export interface OrderItemDTO {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  price: number;
}

export interface OrderRequest {
  agencyId?: number;
  customerId?: number;
  shippingAddress?: string;
  items: { productId: number; quantity: number }[];
  orderType?: 'DROPSHIP' | 'MARKETPLACE';
  promotionCode?: string;
  pointsToRedeem?: number;
  deliveryFee?: number;
  paymentMethod?: string;
  orderSource?: string;
}

export interface PromotionDTO {
  id: number;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  code?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount?: number;
}

export interface AgencyDebtDTO {
  id: number;
  agencyId: number;
  agencyName?: string;
  orderId?: number;
  debtCode: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate?: string;
  status: string;
  createdAt: string;
}

export interface DashboardDTO {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalAgencies: number;
  pendingOrders: number;
  recentOrders: OrderDTO[];
}

export interface NotificationDTO {
  id: number;
  title: string;
  body: string;
  type: string;
  referenceId?: number;
  read: boolean;
  createdAt: string;
}

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}
