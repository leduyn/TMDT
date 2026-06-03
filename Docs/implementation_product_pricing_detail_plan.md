# Plan: Hiển thị Giá, Chính sách bán hàng & Chương trình khuyến mãi tại Trang Chi tiết Sản phẩm

## Mục tiêu
Tại trang Chi tiết Sản phẩm, hệ thống cần tính toán và hiển thị đầy đủ các mức giá, ưu đãi Chính sách bán hàng (CSBH) và Chương trình khuyến mãi (CTKM) dành cho đại lý dựa trên đối tượng đăng nhập và điều kiện áp dụng.

## Thứ tự xử lý bắt buộc
1. Kiểm tra quyền áp dụng Giá bán lẻ
2. Xác định Giá bán và Giá bán lẻ cần hiển thị
3. Kiểm tra và tính Chính sách bán hàng
4. Tính giá sau Chính sách bán hàng
5. Kiểm tra và tính Chương trình khuyến mãi
6. Tính giá sau Chương trình khuyến mãi
7. Hiển thị toàn bộ thông tin giá và ưu đãi

## Phân tích hiện trạng

### Đã có sẵn
- `SalesPolicyService.calculateProductPolicyFlows()` - Engine đầy đủ tính toán 2 luồng:
  - **Wholesale flow**: basePrice → SALES_POLICY(CSBH) → PROMOTION(CTKM) → finalPrice
  - **Retail flow**: retailPrice → SALES_POLICY(CSBH) → PROMOTION(CTKM) → finalPrice
- `GET /api/sales-policies/product-preview` - Endpoint trả về `ProductPolicyPreviewDTO` với `PolicyEffectDTO`, `PriceFlowDetailsDTO`
- `PriceListService.getResolvedPriceInfo()` - Xác định giá từ bảng giá
- `ProductService.getProductById()` - Trả về `ProductDTO` với `appliedPrice`

### Cần thay đổi
| File | Thay đổi |
|---|---|
| `backend/.../dto/ProductDTO.java` | Thêm `retailPriceEligible`, `policyPreview` (embed `ProductPolicyPreviewDTO`) |
| `backend/.../service/SalesPolicyService.java` | Thêm method `isAgencyEligibleForRetailPrice()` |
| `backend/.../service/ProductService.java` | Tích hợp policy preview + retail eligibility check vào `getProductById()` |
| `backend/.../controller/ProductController.java` | Thêm `quantity` param optional |
| `frontend/.../product/productApi.ts` | Cập nhật `ProductDTO` interface |
| `frontend/.../salespolicy/salesPolicyApi.ts` | Thêm `ProductPricingDetailDTO` interface + API function |
| `frontend/.../products/[id]/page.tsx` | Fetch pricing detail, hiển thị breakdown UI |

## Chi tiết thay đổi

### Bước 1: Backend - Xác định đối tượng được áp dụng Giá bán lẻ

**File:** `SalesPolicyService.java` - Thêm method:
```
isAgencyEligibleForRetailPrice(Agency agency):
  - Lấy active RETAIL_POLICY policies
  - Kiểm tra agency có nằm trong included/excluded/filters không
  - Return true nếu có ít nhất 1 policy applicable
```

### Bước 2: Backend - Mở rộng ProductDTO

**File:** `ProductDTO.java` - Thêm fields:
- `retailPriceEligible` (Boolean)
- `policyPreview` (ProductPolicyPreviewDTO)

### Bước 3: Backend - Tích hợp vào ProductService

**File:** `ProductService.java` + `ProductController.java`
- `getProductById(id, agencyId, customerId, quantity)`:
  1. Resolve price list → `appliedPrice`
  2. Gọi `salesPolicyService.previewProductPolicies(product, quantity, agency, appliedPrice)`
  3. Gọi `salesPolicyService.isAgencyEligibleForRetailPrice(agency)`
  4. Set `policyPreview` và `retailPriceEligible` vào DTO

### Bước 4: Frontend - Cập nhật API interfaces + Pricing UI

**Files:**
- `productApi.ts` - Update ProductDTO interface
- `salesPolicyApi.ts` - Add pricing API + DTO interfaces
- `products/[id]/page.tsx` - Fetch pricing detail và render pricing breakdown card

## UI hiển thị cuối cùng

```
┌──────────────────────────────────────────────┐
│  CHI TIẾT GIÁ & ƯU ĐÃI                        │
│                                                │
│  GIÁ BÁN (Bán buôn)                            │
│  Giá bán:                     xxx đ            │
│  → Ưu đãi CSBH:              -xxx đ  [tên]    │
│  → Giá sau CSBH:              xxx đ            │
│  → Khuyến mãi:                -xxx đ  [tên]    │
│  → Giá sau CTKM:              xxx đ            │
│                                                │
│  GIÁ BÁN LẺ (Bán lẻ) [nếu eligible]           │
│  Giá bán lẻ:                  xxx đ            │
│  → Ưu đãi CSBH:              -xxx đ           │
│  → Giá bán lẻ sau CSBH:       xxx đ            │
│  → Khuyến mãi:                -xxx đ           │
│  → Giá bán lẻ sau CTKM:       xxx đ            │
└──────────────────────────────────────────────┘
```
