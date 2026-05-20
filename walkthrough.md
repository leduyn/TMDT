# Kết quả triển khai: Hiển thị Giá cũ, Giá mới, Cấu hình ẩn/hiện giá giảm & Lịch sử cập nhật giá

Tôi đã hoàn tất việc tích hợp tính năng quản lý lịch sử giá trước khi cập nhật cùng cờ hiển thị cấp độ sản phẩm và **Nút Lịch sử cập nhật giá của khách hàng** đúng theo các yêu cầu chi tiết của bạn.

## Các thay đổi đã được thực hiện

### 1. Database & Backend Entity
- **[Product.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/product/entity/Product.java)**: Bổ sung trường `showDiscount` (mặc định là `false`) để cấu hình cho phép hay không cho phép hiển thị giá cũ và tỷ lệ giảm giá cho từng sản phẩm cụ thể.
- **[PriceListItem.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/price/entity/PriceListItem.java)**: Bổ sung trường `oldPrice` để lưu trữ mức giá cũ trước khi bảng giá bị cập nhật.

### 2. Logic Backend & DTOs
- **[PriceUpdateVoucherService.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/price/service/PriceUpdateVoucherService.java)**:
  - Tích hợp logic tự động lưu trữ giá cũ. Khi phiếu cập nhật giá được áp dụng, hệ thống tự động gán `item.setOldPrice(item.getPrice())` trước khi cập nhật sang giá mới.
  - Xây dựng phương thức `getAppliedVouchersForAgency(agencyId)` để tự động tìm kiếm bảng giá đang hoạt động của khách hàng này và trả về toàn bộ lịch sử các đợt phiếu cập nhật giá (`PriceUpdateVoucher`) đã áp dụng thành công lên bảng giá đó.
- **[PriceUpdateVoucherController.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/price/controller/PriceUpdateVoucherController.java)**: Bổ sung endpoint GET `/api/price-vouchers/active-history/agency/{agencyId}` phục vụ truy xuất dữ liệu lịch sử từ frontend.
- **[PriceListService.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/price/service/PriceListService.java)**: Bổ sung trường `oldPrice` vào `ResolvedPriceInfo` và ánh xạ giá trị trực tiếp từ bảng giá thắng cuộc (winning price list).
- **[ProductService.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/product/service/ProductService.java)**:
  - Cập nhật hàm `getAllProducts` và `getProductById` để lấy `oldPrice` đã được resolve, gán vào `oldAppliedPrice` trong `ProductDTO`.
  - Tự động tính toán tỷ lệ chênh lệch `%` tăng/giảm giá: `priceChangeRatio = ((appliedPrice - oldAppliedPrice) / oldAppliedPrice) * 100` để chuyển tiếp cho frontend.
  - Ánh xạ cờ `showDiscount` từ Request vào Entity khi Tạo (`addProduct`) / Cập nhật (`updateProduct`) sản phẩm.

### 3. Frontend APIs & UI
- **[priceApi.ts](file:///d:/Java%20lean/TMDT/frontend/src/modules/price/priceApi.ts)**: Khai báo phương thức `getActiveHistoryForAgency(agencyId)` trong đối tượng API `priceUpdateVoucherApi`.
- **[productApi.ts](file:///d:/Java%20lean/TMDT/frontend/src/modules/product/productApi.ts)**: Cập nhật các interface `ProductDTO` và `ProductRequest` với các trường mới (`showDiscount`, `oldAppliedPrice`, `priceChangeRatio`).
- **Checkbox ShowDiscount trên giao diện quản trị**:
  - **[Create Product Page](file:///d:/Java%20lean/TMDT/frontend/src/app/products/create/page.tsx)**: Bổ sung checkbox **"Hiển thị giá giảm / Giá trước thay đổi"** dưới phần **Cấu hình hiển thị** khi tạo mới sản phẩm.
  - **[Edit Product Page](file:///d:/Java%20lean/TMDT/frontend/src/app/products/%5Bid%5D/edit/page.tsx)**: Bổ sung checkbox tương tự khi chỉnh sửa thông tin sản phẩm, giúp đồng bộ hóa dữ liệu trực tiếp với Backend.
- **Nút "Lịch sử cập nhật giá" & Modal hiển thị Timeline trên UI chi tiết đại lý**:
  - **[Agency Detail Page](file:///d:/Java%20lean/TMDT/frontend/src/app/agencies/%5Bid%5D/page.tsx)**:
    - Bổ sung nút **"Lịch sử cập nhật giá"** với màu xanh dịu sky-blue và biểu tượng `History` tinh tế cạnh tên Bảng giá đang áp dụng.
    - Xây dựng Modal Timeline hiển thị toàn bộ lịch sử cập nhật giá của khách hàng cực kỳ mượt mà sử dụng glassmorphic background.
    - Trong Timeline hiển thị chi tiết tên đợt cập nhật giá (Voucher name), ghi chú (description), ngày-giờ áp dụng thành công và danh sách chi tiết các sản phẩm được cập nhật kèm giá mới tương ứng.
    - Tại cột **Giá bán đại lý** của tab **Bảng giá áp dụng**:
      - Khi `showDiscount === true` và có tồn tại `oldAppliedPrice`:
        - Hiển thị giá cũ bị gạch ngang (Màu xám).
        - Hiển thị giá mới đậm (Màu sắc nổi bật).
        - Hiển thị Badge báo tỷ lệ `%` tăng/giảm (Xanh lá khi giảm, đỏ khi tăng).
      - Khi `showDiscount === false`, ẩn hoàn toàn giá cũ và tỷ lệ phần trăm, chỉ hiển thị giá mới như bình thường để bảo mật thông tin.

## Kết quả Kiểm tra & Biên dịch
- **Backend**: Biên dịch Maven thành công (`mvn compile`).
- **Frontend**: Build thành công với Next.js Turbopack (`npm run build`) và không có bất kỳ lỗi TypeScript nào.

---
> [!NOTE]
> Tính năng hiện tại đã hoàn tất cả logic đầu-cuối (End-to-End) và giao diện điều khiển. Bạn có thể mở trình duyệt và trải nghiệm ngay!
