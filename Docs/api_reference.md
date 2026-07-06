# 📡 API Reference — TMDT Backend

> **Base URL**: `http://localhost:8080`  
> **Auth**: Bearer Token (`Authorization: Bearer <token>`) — trừ các endpoint public  
> **Frontend API modules**: `frontend/src/modules/*/`

---

## 1. 🔐 Authentication — `/api/auth`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/api/auth/signin` | Đăng nhập (Customer/Admin), trả về JWT token | Public |
| `POST` | `/api/auth/agency/signin` | Đăng nhập dành riêng cho Agency | Public |
| `POST` | `/api/auth/signup` | Đăng ký tài khoản mới | Public |

**Frontend**: [`userApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/user/userApi.ts)

---

## 2. 👤 User — `/api/users`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/users/me` | Lấy thông tin user hiện tại | ✅ |
| `PUT` | `/api/users/profile` | Cập nhật profile | ✅ |
| `GET` | `/api/users/all` | Danh sách tất cả users | Admin |
| `GET` | `/api/users/{id}` | Chi tiết user theo ID | Admin |
| `DELETE` | `/api/users/{id}` | Xóa user | Admin |

> **Lưu ý**: Các endpoint `/api/users/customers`, `/api/users/agencies-unassigned` đã chuyển sang module `/api/customers` và `/api/agencies`.

**Frontend**: [`userApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/user/userApi.ts)

---

## 3. 🏢 Agency (Đại lý) — `/api/agencies`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/agencies` | Danh sách đại lý | ✅ |
| `GET` | `/api/agencies/{id}` | Chi tiết đại lý | ✅ |
| `POST` | `/api/agencies` | Tạo đại lý (Admin tạo) | Admin |
| `POST` | `/api/agencies/register` | Đăng ký trở thành đại lý | ✅ |
| `PUT` | `/api/agencies/{id}/approve` | Duyệt đại lý | Admin |
| `PUT` | `/api/agencies/{id}` | Cập nhật đại lý | ✅ |
| `GET` | `/api/agencies/{id}/customers` | Khách hàng của đại lý | ✅ |
| `GET` | `/api/agencies/{id}/prices` | Bảng giá của đại lý | ✅ |
| `GET` | `/api/agencies/me` | Thông tin đại lý hiện tại | Agency |

**Frontend**: [`agencyApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/agency/agencyApi.ts)

---

## 4. 🧑 Customer — `/api/customers`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/customers` | Danh sách khách hàng (filter by agencyId) | Admin/Agency |
| `GET` | `/api/customers/{id}` | Chi tiết khách hàng | Admin/Agency |
| `GET` | `/api/customers/check` | Kiểm tra khách hàng theo phone/taxCode | Admin/Agency |
| `GET` | `/api/customers/search` | Tìm kiếm theo mã số thuế | Admin/Agency |
| `POST` | `/api/customers` | Tạo khách hàng mới | Admin/Agency |
| `PUT` | `/api/customers/{id}` | Cập nhật khách hàng | Admin/Agency |
| `DELETE` | `/api/customers/{id}` | Xóa khách hàng | Admin |

---

## 5. 📦 Product (Sản phẩm) — `/api/products`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/products` | Danh sách sản phẩm (hỗ trợ filter) | Public |
| `GET` | `/api/products/page` | Danh sách sản phẩm có phân trang | Public |
| `GET` | `/api/products/{id}` | Chi tiết sản phẩm | Public |
| `POST` | `/api/products` | Tạo sản phẩm | Admin |
| `PUT` | `/api/products/{id}` | Cập nhật sản phẩm | Admin |
| `DELETE` | `/api/products/{id}` | Xóa sản phẩm | Admin |
| `GET` | `/api/products/import` | Xem form import Excel | Admin |
| `POST` | `/api/products/import` | Import sản phẩm từ Excel | Admin |
| `GET` | `/api/products/import-json` | Xem form import JSON | Admin |
| `POST` | `/api/products/import-json` | Import sản phẩm từ JSON | Admin |
| `GET` | `/api/products/import/template` | Tải file template import | Admin |

**Frontend**: [`productApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/product/productApi.ts)

---

## 6. 🏷️ Product Type (Loại sản phẩm) — `/api/product-types`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/product-types` | Danh sách loại sản phẩm | Public |
| `GET` | `/api/product-types/{id}` | Chi tiết loại sản phẩm | Public |
| `POST` | `/api/product-types` | Tạo loại sản phẩm | Admin |
| `PUT` | `/api/product-types/{id}` | Cập nhật loại sản phẩm | Admin |
| `DELETE` | `/api/product-types/{id}` | Xóa loại sản phẩm | Admin |

---

## 7. 🏷️ Attribute (Thuộc tính) — `/api/attributes`, `/api/products/{id}/attributes`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/attributes` | Danh sách thuộc tính | Public |
| `GET` | `/api/attributes/{id}` | Chi tiết thuộc tính | Public |
| `POST` | `/api/attributes` | Tạo thuộc tính | Admin |
| `PUT` | `/api/attributes/{id}` | Cập nhật thuộc tính | Admin |
| `DELETE` | `/api/attributes/{id}` | Xóa thuộc tính | Admin |
| `GET` | `/api/attributes/{id}/values` | Giá trị của thuộc tính | Public |
| `POST` | `/api/attributes/{id}/values` | Thêm giá trị | Admin |
| `DELETE` | `/api/attributes/values/{valueId}` | Xóa giá trị | Admin |
| `POST` | `/api/products/{id}/attributes` | Gán thuộc tính cho sản phẩm | Admin |
| `GET` | `/api/products/{id}/attributes` | Lấy thuộc tính sản phẩm | Public |
| `POST` | `/api/products/search/faceted` | Tìm kiếm faceted (filter nâng cao) | Public |

**Frontend**: [`productApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/product/productApi.ts)

---

## 8. 📂 Category (Danh mục) — `/api/categories`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/categories` | Danh sách danh mục | Public |
| `GET` | `/api/categories/{id}` | Chi tiết danh mục | Public |
| `POST` | `/api/categories` | Tạo danh mục | Admin |
| `PUT` | `/api/categories/{id}` | Cập nhật danh mục | Admin |
| `DELETE` | `/api/categories/{id}` | Xóa danh mục | Admin |

---

## 9. 🏭 Brand (Thương hiệu) — `/api/brands`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/brands` | Danh sách thương hiệu | Public |
| `GET` | `/api/brands/{id}` | Chi tiết thương hiệu | Public |
| `POST` | `/api/brands` | Tạo thương hiệu | Admin |
| `PUT` | `/api/brands/{id}` | Cập nhật thương hiệu | Admin |
| `DELETE` | `/api/brands/{id}` | Xóa thương hiệu | Admin |

---

## 10. 🛒 Order (Đơn hàng) — `/api/orders`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/api/orders` | Tạo đơn hàng | ✅ |
| `POST` | `/api/orders/by-employee` | Tạo đơn hàng bởi nhân viên | Employee |
| `POST` | `/api/orders/by-agency` | Tạo đơn hàng bởi đại lý | Agency |
| `GET` | `/api/orders` | Danh sách đơn hàng | Admin |
| `GET` | `/api/orders/my-orders` | Đơn hàng của tôi | ✅ |
| `GET` | `/api/orders/customer/{customerId}` | Đơn hàng của khách | Admin |
| `GET` | `/api/orders/agency/{agencyId}` | Đơn hàng của đại lý | ✅ |
| `GET` | `/api/orders/{id}` | Chi tiết đơn hàng | ✅ |
| `PUT` | `/api/orders/{id}/status` | Cập nhật trạng thái | Admin |
| `POST` | `/api/orders/{id}/confirm-payment` | Xác nhận thanh toán | Admin |

**Frontend**: [`orderApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/order/orderApi.ts)

---

## 11. 💰 Price List (Bảng giá) — `/api/price-lists`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/price-lists` | Danh sách bảng giá | Admin |
| `GET` | `/api/price-lists/page` | Danh sách bảng giá có phân trang | Admin |
| `GET` | `/api/price-lists/{id}` | Chi tiết bảng giá | Admin |
| `POST` | `/api/price-lists` | Tạo bảng giá | Admin |
| `PUT` | `/api/price-lists/{id}` | Cập nhật bảng giá | Admin |
| `DELETE` | `/api/price-lists/{id}` | Xóa bảng giá | Admin |
| `PUT` | `/api/price-lists/{id}/set-default` | Đặt làm bảng giá mặc định | Admin |
| `GET` | `/api/price-lists/{id}/items` | Sản phẩm trong bảng giá | Admin |
| `PUT` | `/api/price-lists/{id}/items` | Cập nhật items bảng giá | Admin |
| `POST` | `/api/price-lists/assign-agency` | Gán bảng giá cho đại lý | Admin |
| `POST` | `/api/price-lists/my-store/{priceListId}` | Áp dụng cho cửa hàng của tôi | Agency |
| `GET` | `/api/price-lists/resolve/agency/{agencyId}` | Giải quyết bảng giá cho đại lý | ✅ |
| `GET` | `/api/price-lists/resolve/customer/{agencyId}` | Giải quyết bảng giá khách hàng | ✅ |
| `DELETE` | `/api/price-lists/unassign-agency/{agencyId}` | Gỡ bảng giá khỏi đại lý | Admin |
| `GET` | `/api/price-lists/{id}/assigned-agencies` | Đại lý đang dùng bảng giá | Admin |
| `GET` | `/api/price-lists/resolved-price` | Giá đã resolve theo context | ✅ |

**Frontend**: [`priceApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/price/priceApi.ts)

---

## 12. 📋 Price Update Voucher (Phiếu điều chỉnh giá) — `/api/price-vouchers`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/price-vouchers` | Danh sách phiếu điều chỉnh giá (phân trang) | Admin |
| `GET` | `/api/price-vouchers/{id}` | Chi tiết phiếu | Admin |
| `GET` | `/api/price-vouchers/{id}/items` | Danh sách items của phiếu (phân trang) | Admin |
| `POST` | `/api/price-vouchers` | Tạo phiếu điều chỉnh | Admin |
| `POST` | `/api/price-vouchers/{id}/cancel` | Hủy phiếu | Admin |
| `POST` | `/api/price-vouchers/{id}/apply` | Áp dụng phiếu | Admin |
| `GET` | `/api/price-vouchers/active-history/agency/{agencyId}` | Lịch sử phiếu đã áp dụng theo đại lý | ✅ |
| `GET` | `/api/price-vouchers/active-history/price-list/{priceListId}` | Lịch sử theo bảng giá | Admin |

---

## 13. 🔁 Price Override Voucher (Phiếu ghi đè giá) — `/api/price-override-vouchers`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/price-override-vouchers` | Danh sách phiếu ghi đè giá | Admin |
| `GET` | `/api/price-override-vouchers/page` | Danh sách có phân trang | Admin |
| `GET` | `/api/price-override-vouchers/{id}` | Chi tiết phiếu ghi đè | Admin |
| `POST` | `/api/price-override-vouchers` | Tạo phiếu ghi đè giá | Admin |
| `POST` | `/api/price-override-vouchers/{id}/cancel` | Hủy phiếu ghi đè | Admin |
| `POST` | `/api/price-override-vouchers/{id}/apply` | Áp dụng phiếu ghi đè | Admin |

---

## 14. 📄 Price Assignment Voucher — `/api/price-assignment-vouchers`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/price-assignment-vouchers` | Danh sách phiếu gán giá | Admin |
| `POST` | `/api/price-assignment-vouchers` | Tạo phiếu gán giá | Admin |
| `POST` | `/api/price-assignment-vouchers/{id}/cancel` | Hủy | Admin |
| `POST` | `/api/price-assignment-vouchers/{id}/stop` | Dừng | Admin |
| `POST` | `/api/price-assignment-vouchers/{id}/reactivate` | Kích hoạt lại | Admin |
| `GET` | `/api/price-assignment-vouchers/fix-db` | Sửa dữ liệu DB (tool nội bộ) | Admin |

---

## 15. 💲 Customer Prices (Giá riêng khách hàng) — `/api/customer-prices`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/customer-prices` | Danh sách giá theo đại lý (phân trang, filter) | Admin |
| `GET` | `/api/customer-prices/history` | Lịch sử điều chỉnh giá theo sản phẩm | Admin |
| `POST` | `/api/customer-prices/override` | Ghi đè giá sản phẩm | Admin |
| `POST` | `/api/customer-prices/remove-override` | Xóa ghi đè | Admin |
| `POST` | `/api/customer-prices/rollback/{historyId}` | Rollback về giá trước | Admin |
| `POST` | `/api/customer-prices/sync/{agencyId}` | Đồng bộ giá cho đại lý | Admin |
| `GET` | `/api/customer-prices/export/{agencyId}` | Xuất bảng giá (Excel) | Admin |
| `POST` | `/api/customer-prices/import/{agencyId}` | Nhập bảng giá (Excel) | Admin |

**Frontend**: [`customerPriceApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/agency/customerPriceApi.ts)

---

## 16. 🏷️ Sales Policy (Chính sách bán hàng) — `/api/sales-policies`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/sales-policies` | Danh sách chính sách | ✅ |
| `GET` | `/api/sales-policies/{id}` | Chi tiết chính sách | ✅ |
| `POST` | `/api/sales-policies` | Tạo chính sách | Admin |
| `PUT` | `/api/sales-policies/{id}` | Cập nhật chính sách | Admin |
| `DELETE` | `/api/sales-policies/{id}` | Xóa chính sách | Admin |
| `GET` | `/api/sales-policies/resolve-price` | Tính giá theo chính sách | ✅ |
| `GET` | `/api/sales-policies/product-preview` | Preview giá sản phẩm theo CSBH | ✅ |

**Frontend**: [`salesPolicyApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/salespolicy/salesPolicyApi.ts)

---

## 17. 🏆 Accumulation (Tích lũy / BXH) — `/api/accumulation-programs`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/accumulation-programs` | Danh sách chương trình | Admin |
| `GET` | `/api/accumulation-programs/{id}` | Chi tiết chương trình | Admin |
| `POST` | `/api/accumulation-programs` | Tạo chương trình | Admin |
| `PUT` | `/api/accumulation-programs/{id}` | Cập nhật chương trình | Admin |
| `DELETE` | `/api/accumulation-programs/{id}` | Xóa chương trình | Admin |
| `GET` | `/api/accumulation-programs/{programId}/summaries` | Tổng hợp tất cả đại lý | Admin |
| `GET` | `/api/accumulation-programs/{programId}/agencies/{agencyId}/summary` | Tổng hợp 1 đại lý | ✅ |
| `POST` | `/api/accumulation-programs/{programId}/stage1/calculate` | Tính toán giai đoạn 1 | Admin |
| `POST` | `/api/accumulation-programs/{programId}/stage1/approve-all` | Duyệt tất cả giai đoạn 1 | Admin |
| `POST` | `/api/accumulation-programs/{programId}/agencies/{agencyId}/stage1/approve` | Duyệt 1 đại lý | Admin |
| `POST` | `/api/accumulation-programs/{programId}/agencies/{agencyId}/stage1/reject` | Từ chối 1 đại lý | Admin |
| `POST` | `/api/accumulation-programs/{programId}/agencies/{agencyId}/stage2/calculate` | Tính giai đoạn 2 | Admin |
| `POST` | `/api/accumulation-programs/{id}/activate` | Kích hoạt chương trình | Admin |
| `GET` | `/api/accumulation-programs/{programId}/debts` | Công nợ tích lũy | Admin |
| `GET` | `/api/accumulation-programs/{programId}/debts/stats` | Thống kê công nợ | Admin |
| `GET` | `/api/accumulation-programs/{programId}/agencies/{agencyId}/debts` | Công nợ của 1 đại lý | ✅ |

**Frontend**: [`accumulationApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/accumulation/accumulationApi.ts)

---

## 18. 💳 Credit (Hạn mức tín dụng) — `/api/credit`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/credit/admin/summaries` | Tổng hợp credit tất cả đại lý | Admin |
| `PUT` | `/api/credit/agents/{agencyId}/terms` | Cập nhật điều khoản | Admin |
| `GET` | `/api/credit/agents/{agencyId}/hmkd` | Hạn mức kinh doanh | Admin |
| `GET` | `/api/credit/agents/{agencyId}/detail` | Chi tiết credit đại lý | ✅ |
| `PUT` | `/api/credit/agents/{agencyId}/limit` | Cập nhật hạn mức | Admin |
| `POST` | `/api/credit/agents/{agencyId}/deposit` | Nạp tiền ký quỹ | Admin |
| `GET` | `/api/credit/deposit-contracts/agency/{agencyId}` | Hợp đồng ký quỹ của đại lý | Admin |
| `GET` | `/api/credit/deposit-contracts/{id}` | Chi tiết hợp đồng ký quỹ | Admin |
| `POST` | `/api/credit/orders` | Tạo giao dịch credit cho đơn hàng | ✅ |
| `POST` | `/api/credit/payments` | Thanh toán credit | ✅ |
| `POST` | `/api/credit/admin/recalculate/{agencyId}` | Tính lại credit | Admin |
| `POST` | `/api/credit/admin/trigger-interest` | Kích hoạt tính lãi | Admin |
| `POST` | `/api/credit/admin/trigger-overdue` | Kích hoạt xử lý quá hạn | Admin |

**Frontend**: [`creditApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/credit/creditApi.ts)

---

## 19. 📜 Agency Debt (Công nợ đại lý) — `/api/agency-debts`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/agency-debts` | Danh sách công nợ | Admin |
| `GET` | `/api/agency-debts/agency/{agencyId}` | Công nợ theo đại lý | ✅ |
| `GET` | `/api/agency-debts/order/{orderId}` | Công nợ theo đơn hàng | ✅ |
| `POST` | `/api/agency-debts/{debtId}/pay` | Thanh toán công nợ | Admin |

---

## 20. 🎁 Loyalty (Điểm thưởng) — `/api/loyalty`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/loyalty/balance` | Số dư điểm hiện tại | ✅ |
| `GET` | `/api/loyalty/history` | Lịch sử điểm | ✅ |

---

## 21. 🎮 Gamification — `/api/gamification`

### Public / User endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/gamification/rules` | Danh sách luật thi đua (active) | ✅ |
| `GET` | `/api/gamification/rules/evaluated/{customerId}` | Luật đã được evaluate cho customer | ✅ |
| `GET` | `/api/gamification/profile/{customerId}` | Hồ sơ gamification của customer | ✅ |
| `GET` | `/api/gamification/leaderboard` | Bảng xếp hạng | ✅ |
| `GET` | `/api/gamification/badges` | Danh sách huy hiệu | ✅ |
| `GET` | `/api/gamification/certificates/{customerId}` | Bằng khen danh dự | ✅ |
| `GET` | `/api/gamification/points/{customerId}` | Số dư và lịch sử điểm | ✅ |

### Admin endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/gamification/admin/rules` | Tất cả luật (kể cả inactive) | Admin |
| `POST` | `/api/gamification/admin/rules` | Thêm/cập nhật luật thi đua | Admin |
| `PATCH` | `/api/gamification/admin/rules/{id}/toggle` | Bật/tắt luật | Admin |
| `DELETE` | `/api/gamification/admin/rules/{id}` | Xóa luật | Admin |
| `GET` | `/api/gamification/admin/badges` | Tất cả huy hiệu (kể cả inactive) | Admin |
| `POST` | `/api/gamification/admin/badges` | Thêm/cập nhật huy hiệu | Admin |
| `DELETE` | `/api/gamification/admin/badges/{id}` | Xóa huy hiệu | Admin |
| `GET` | `/api/gamification/admin/levels` | Cấu hình cấp bậc thành viên | Admin |
| `POST` | `/api/gamification/admin/levels` | Thêm/cập nhật cấp bậc | Admin |
| `DELETE` | `/api/gamification/admin/levels/{id}` | Xóa cấp bậc | Admin |
| `GET` | `/api/gamification/admin/points-formula` | Lấy công thức tính điểm | Admin |
| `PUT` | `/api/gamification/admin/points-formula` | Cập nhật công thức tính điểm | Admin |
| `GET` | `/api/gamification/admin/spel-variables` | Danh sách biến SpEL | Admin |
| `POST` | `/api/gamification/admin/spel-variables` | Lưu biến SpEL | Admin |
| `DELETE` | `/api/gamification/admin/spel-variables/{id}` | Xóa biến SpEL | Admin |
| `GET` | `/api/gamification/admin/spel-metadata` | Metadata SpEL (bảng, cột, hàm) | Admin |
| `POST` | `/api/gamification/admin/spel-variables/test` | Test query SpEL | Admin |

---

## 22. 🎫 Promotion (Khuyến mãi / CTKM) — `/api/promotions`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/api/promotions` | Tạo chương trình KM | Admin |
| `GET` | `/api/promotions` | Danh sách tất cả KM | ✅ |
| `GET` | `/api/promotions/platform` | KM cấp platform | Public |
| `GET` | `/api/promotions/agency/{agencyId}` | KM của đại lý | ✅ |
| `GET` | `/api/promotions/validate` | Validate mã KM | ✅ |
| `PUT` | `/api/promotions/{id}/disable` | Tắt chương trình KM | Admin |

---

## 23. 🌟 Review (Đánh giá) — `/api/reviews`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/api/reviews/products/{productId}` | Đánh giá sản phẩm | ✅ |
| `GET` | `/api/reviews/products/{productId}` | Danh sách đánh giá SP | Public |
| `GET` | `/api/reviews/products/{productId}/average` | Điểm TB sản phẩm | Public |
| `POST` | `/api/reviews/agencies/{agencyId}` | Đánh giá đại lý | ✅ |
| `GET` | `/api/reviews/agencies/{agencyId}` | Danh sách đánh giá đại lý | Public |
| `GET` | `/api/reviews/agencies/{agencyId}/average` | Điểm TB đại lý | Public |

---

## 24. 💬 Chat — `/api/chat`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/api/chat/rooms` | Tạo phòng chat | ✅ |
| `GET` | `/api/chat/rooms` | Danh sách phòng chat | ✅ |
| `POST` | `/api/chat/messages` | Gửi tin nhắn | ✅ |
| `GET` | `/api/chat/rooms/{roomId}/messages` | Lịch sử tin nhắn | ✅ |
| `PUT` | `/api/chat/rooms/{roomId}/read` | Đánh dấu đã đọc | ✅ |

**WebSocket**: `ws://localhost:8080/ws` (STOMP protocol)  
**Frontend**: [`chatApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/chat/chatApi.ts)

---

## 25. 📤 Upload — `/api/upload`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/api/upload/image` | Upload ảnh sản phẩm | Admin |
| `POST` | `/api/upload/brand-logo` | Upload logo thương hiệu | Admin |
| `POST` | `/api/upload/avatar` | Upload ảnh đại diện (avatar) | ✅ |

---

## 26. ⚙️ Config — `/api/config`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/config/discount-max-days` | Lấy cấu hình số ngày giảm giá tối đa | Admin |
| `PUT` | `/api/config/discount-max-days` | Cập nhật cấu hình | Admin |
| `GET` | `/api/config/retail-trend` | Lấy cấu hình xu hướng bán lẻ | Admin |
| `PUT` | `/api/config/retail-trend` | Cập nhật cấu hình | Admin |

---

## 27. 🗺️ Region / Location — `/api/regions`, `/api/locations`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/regions` | Danh sách vùng kinh doanh | Admin |
| `GET` | `/api/regions/{id}` | Chi tiết vùng | Admin |
| `POST` | `/api/regions` | Tạo vùng | Admin |
| `PUT` | `/api/regions/{id}` | Cập nhật vùng | Admin |
| `DELETE` | `/api/regions/{id}` | Xóa vùng | Admin |
| `GET` | `/api/locations/hierarchy` | Cây địa lý (tỉnh/huyện/xã) | Public |
| `POST` | `/api/admin/regions/sync-provinces` | Sync tỉnh thành từ API | Admin |
| `POST` | `/api/admin/regions/sync-wards` | Sync xã phường | Admin |

**Frontend**: [`regionApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/region/regionApi.ts)

---

## 28. 👥 Customer Group — `/api/customer-groups`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/customer-groups` | Danh sách nhóm khách hàng | Admin |
| `GET` | `/api/customer-groups/{id}` | Chi tiết nhóm | Admin |
| `POST` | `/api/customer-groups` | Tạo nhóm | Admin |
| `PUT` | `/api/customer-groups/{id}` | Cập nhật nhóm | Admin |
| `DELETE` | `/api/customer-groups/{id}` | Xóa nhóm | Admin |

> **Lưu ý**: Endpoint `assign/{userId}` và `remove-user/{userId}` không còn trong controller hiện tại.

**Frontend**: [`customerApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/customer/customerApi.ts)

---

## 29. 💼 Commission — `/api/commissions`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/api/commissions` | Tạo hoa hồng | Admin |
| `GET` | `/api/commissions/agency/{agencyId}` | Hoa hồng của đại lý | ✅ |
| `PUT` | `/api/commissions/{id}/disable` | Vô hiệu hóa hoa hồng | Admin |

---

## 30. 📊 Dashboard — `/api/dashboard`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/dashboard` | Tổng hợp dữ liệu dashboard | Admin |

**Frontend**: [`dashboardApi.ts`](file:///d:/Java%20lean/TMDT/frontend/src/modules/dashboard/dashboardApi.ts)

---

## Tóm tắt thống kê

| Module | Số endpoints |
|--------|-------------|
| Auth | 3 |
| User | 5 |
| Agency | 9 |
| Customer | 7 |
| Product | 11 |
| Product Type | 5 |
| Attribute | 11 |
| Category | 5 |
| Brand | 5 |
| Order | 10 |
| Price List | 16 |
| Price Update Voucher | 8 |
| Price Override Voucher | 6 |
| Price Assignment | 6 |
| Customer Price | 8 |
| Sales Policy | 7 |
| Accumulation | 17 |
| Credit | 13 |
| Agency Debt | 4 |
| Loyalty | 2 |
| Gamification | 24 |
| Promotion | 6 |
| Review | 6 |
| Chat | 5 |
| Upload | 3 |
| Config | 4 |
| Region/Location | 8 |
| Customer Group | 5 |
| Commission | 3 |
| Dashboard | 1 |
| **Tổng** | **~233** |


> **Legend**: ✅ = Cần đăng nhập | Admin = Role ADMIN/COMPANY | Agency = Role AGENCY | Public = Không cần token
