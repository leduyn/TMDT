# Phương án B: Nâng cấp toàn diện Product Groups (Database + Backend + Frontend)

## Tổng quan
Tạo bảng mới trong database để lưu trữ cấu trúc **nhóm sản phẩm áp dụng** (product groups) với mô tả riêng cho từng item. Cập nhật Backend entity, DTO, Service và Frontend form để đồng bộ toàn bộ.

---

## Proposed Changes

### 1. Database Migration (Flyway)

#### [NEW] V20260603__create_product_groups.sql
- Tạo bảng `sales_policy_product_groups`: `id`, `sales_policy_id`, `group_name`, `group_index`
- Tạo bảng `sales_policy_product_group_items`: `id`, `group_id`, `item_type` (PRODUCT/CATEGORY), `item_id`, `description`
- Giữ nguyên các bảng join cũ (`sales_policy_target_products`, `sales_policy_target_categories`) để backward-compatible với logic tính giá hiện tại

---

### 2. Backend Entities

#### [NEW] SalesPolicyProductGroup.java
- Entity mới cho bảng `sales_policy_product_groups`
- Fields: `id`, `salesPolicyId`, `groupName`, `groupIndex`
- OneToMany relationship đến `SalesPolicyProductGroupItem`

#### [NEW] SalesPolicyProductGroupItem.java
- Entity mới cho bảng `sales_policy_product_group_items`
- Fields: `id`, `groupId`, `itemType`, `itemId`, `description`

#### [MODIFY] SalesPolicy.java
- Thêm `@OneToMany` relationship đến `SalesPolicyProductGroup`
- Giữ nguyên các ManyToMany cũ (targetProducts, targetCategories) để backward-compatible

---

### 3. Backend DTOs

#### [MODIFY] SalesPolicyRequest.java
- Thêm inner class `ProductGroupRequest` chứa `groupName`, `List<ProductGroupItemRequest>`
- Thêm inner class `ProductGroupItemRequest` chứa `itemType`, `itemId`, `description`
- Thêm field `List<ProductGroupRequest> productGroups`

#### [MODIFY] SalesPolicyDTO.java
- Thêm inner class `ProductGroupResponse` chứa `id`, `groupName`, `groupIndex`, `List<ProductGroupItemResponse>`
- Thêm inner class `ProductGroupItemResponse` chứa `id`, `itemType`, `itemId`, `itemName`, `description`
- Thêm field `List<ProductGroupResponse> productGroups`

---

### 4. Backend Service

#### [MODIFY] SalesPolicyService.java
- Trong `updateEntityFromRequest`: xử lý lưu product groups (cascade save) + đồng thời sync ngược sang `targetProducts`/`targetCategories` để logic tính giá vẫn hoạt động
- Trong constructor DTO: populate product groups response từ entity

---

### 5. Frontend

#### [MODIFY] SalesPolicyForm.tsx
- Cập nhật `handleSave` để gửi `productGroups` array thay vì chỉ flat `targetProductIds`/`targetCategoryIds`
- Cập nhật `loadExistingPolicy` để đọc `productGroups` từ API response và reconstruct UI groups

#### [MODIFY] api.ts
- Thêm types cho `ProductGroupRequest`, `ProductGroupItemRequest`, `ProductGroupResponse`, `ProductGroupItemResponse`
- Thêm fields `productGroups` vào `SalesPolicyRequest` và `SalesPolicyDTO`

---

## Verification Plan
1. Tạo mới policy với 2 nhóm sản phẩm, mỗi nhóm có items khác nhau với mô tả
2. Lưu thành công, reload trang, kiểm tra data nhóm được phục hồi đúng
3. Kiểm tra logic tính giá vẫn hoạt động bình thường
