export interface LoginRequest {
  username: string;
  password: string;
}

export interface AgencyLoginRequest {
  phone: string;
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
  phone?: string;
  name?: string;
  code?: string;
  agencyStatus?: string;
  agencyType?: string;
  avatarUrl?: string;
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
  avatarUrl?: string;
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
  userManual?: string;
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
  invoiceName?: string;
  invoiceTaxCode?: string;
  invoiceAddress?: string;
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
  invoiceName?: string;
  invoiceTaxCode?: string;
  invoiceAddress?: string;
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
  orderId?: number;
  agencyCode?: string;
  agencyName?: string;
  customerCode?: string;
  customerName?: string;
  customerLevel?: string;
  debtCode: string;
  debtType?: string;
  jobCategory?: string;
  debtTermDays?: number;
  value: number;
  paidValue: number;
  paymentDate?: string;
  recordingDate?: string;
  dueDate?: string;
  remainingToCollect: number;
  aCoin?: number;
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

export interface CreditDetailResponse {
  agencyId: number;
  creditLimit: number;
  totalDebt: number;
  guaranteeDebt: number;
  vtcAvailable: number;
  vtcHold: number;
  hmkd: number;
  debtTermDays: number;
  updatedAt?: string;
  overdueDebts: OverdueDebtInfo[];
  ledgerHistory: LedgerEntry[];
  customerDebts: CustomerDebtInfo[];
}

export interface OverdueDebtInfo {
  id: number;
  orderId?: number;
  customerId?: number;
  customerName?: string;
  principalAmount: number;
  interestAccrued: number;
  status: string;
  startDate?: string;
  lastCalculatedAt?: string;
}

export interface LedgerEntry {
  id: number;
  type: string;
  amount: number;
  referenceId?: string;
  receiverType?: string;
  createdAt: string;
}

export interface CustomerDebtInfo {
  customerId: number;
  customerName: string;
  totalDebt: number;
}

export interface PageDTO<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}
