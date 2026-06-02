# Tài liệu Walkthrough: Nâng cấp Module CSBH Phiên bản V2

Tài liệu này tổng hợp toàn bộ các thay đổi kỹ thuật và nghiệp vụ nâng cấp toàn diện module **Chính sách bán hàng (Sales Policy - CSBH) V2** nhằm đáp ứng 100% hình ảnh yêu cầu thiết lập Chương trình ưu đãi B2B.

---

## 1. Tóm tắt các Thay đổi Kỹ thuật (Technical Highlights)

### 1.1. Java Spring Boot Backend Engine
Chúng tôi đã tái cấu trúc và bổ sung các thực thể để chuyển đổi từ cấu hình đơn cấp sang **Đa bậc điều kiện (Tiered Rewards)** và **Đa bộ lọc đối tượng OR (Audience Filter Rules)**:

- **[SalesPolicy.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/salespolicy/entity/SalesPolicy.java)**:
  - Thêm các trường metadata: `startDate`, `endDate`, `tags`, `maxOrderCount`, `maxApplicationPerAgency`, `description`, `targetType` (ORDER_VALUE, PRODUCT_QTY, PRODUCT_REVENUE), `maxDiscountValue`.
  - Mở rộng quan hệ One-to-Many với `SalesPolicyTier` và `SalesPolicyAudienceFilter` với cascade ALL giúp tự động đồng bộ khi lưu.
  - Mở rộng quan hệ Many-to-Many để loại trừ sản phẩm/danh mục cụ thể: `excludedProducts` và `excludedCategories`.
- **[SalesPolicyAudienceFilter.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/salespolicy/entity/SalesPolicyAudienceFilter.java)**:
  - Quản lý các bộ lọc đối tượng (hạng đại lý, tỉnh thành/khu vực) hỗ trợ ghép nhiều bộ lọc kết hợp OR.
- **[SalesPolicyTier.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/salespolicy/entity/SalesPolicyTier.java)**:
  - Quản lý các bậc điều kiện. Đặc biệt hỗ trợ liên kết `giftProduct` kiểu `Product` và `giftQuantity` để quản lý quà tặng sản phẩm thực tế theo yêu cầu.
- **[SalesPolicyRequest.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/salespolicy/dto/SalesPolicyRequest.java) & [SalesPolicyDTO.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/salespolicy/dto/SalesPolicyDTO.java)**:
  - Cập nhật DTOs lồng nhau giúp truyền/nhận toàn bộ cấu hình phức tạp qua một request duy nhất.
- **[SalesPolicyService.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/salespolicy/service/SalesPolicyService.java)**:
  - Nâng cấp thuật toán `applySalesPolicy` để duyệt qua toàn bộ các bậc điều kiện của các chính sách đang hoạt động, tìm mức ưu đãi cao nhất thỏa mãn và áp dụng chiết khấu.
  - Bổ sung hàm `getMatchedTierForOrder` để trả về tier ưu đãi được áp dụng phục vụ việc trích xuất quà tặng.
- **[OrderService.java](file:///d:/Java%20lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/order/service/OrderService.java)**:
  - **Tích hợp quà tặng thông minh**: Khi chốt đặt đơn hàng ở cả 3 luồng (Đại lý, Nhân viên, Sàn), hệ thống tự động kiểm tra xem sản phẩm có thỏa mãn bậc ưu đãi quà tặng thực tế hay không.
  - Nếu có, **tự động chèn dòng sản phẩm quà tặng** vào danh sách `order_items` với **đơn giá = 0.0 (giảm 100% giá trị sản phẩm)** và **tự động trừ tồn kho** của sản phẩm quà tặng đó.

---

### 1.2. Next.js Frontend Dashboard
Chúng tôi đã thay thế Modal 4 bước cũ bằng một trang thiết lập toàn màn hình sang trọng, sắc sảo và cực kỳ premium:

- **[SalesPolicyForm.tsx](file:///d:/Java%20lean/TMDT/frontend/src/components/SalesPolicyForm.tsx)**:
  - Component Form trung tâm quản lý toàn bộ các phân vùng cấu hình ưu đãi: Thông tin ưu đãi, Đối tượng áp dụng (Tag toggles chọn hạng đại lý, tỉnh thành/khu vực), Phạm vi sản phẩm áp dụng và loại trừ, Cơ cấu tiers bảng bậc thang.
  - **Tab "Preview hiển thị"**: Mô phỏng sống động banner và ứng dụng di động đại lý xem trước khuyến mãi thời gian thực cực kỳ lộng lẫy và bắt mắt.
- **[page.tsx](file:///d:/Java%20lean/TMDT/frontend/src/app/sales-policies/new/page.tsx)**:
  - Trang thêm mới chương trình ưu đãi.
- **[page.tsx](file:///d:/Java%20lean/TMDT/frontend/src/app/sales-policies/%5Bid%5D/page.tsx)**:
  - Trang chi tiết và chỉnh sửa chương trình ưu đãi theo dynamic routing.
- **[page.tsx](file:///d:/Java%20lean/TMDT/frontend/src/app/sales-policies/page.tsx)**:
  - Cập nhật trang danh sách chính sách bán hàng. Tối giản hóa code, loại bỏ modal cũ, liên kết nút "Sửa" và "Thêm mới" chuyển hướng sang trang tương ứng mượt mà.

---

## 2. Xác minh và Hướng dẫn Trải nghiệm

### 2.1. Khởi chạy Ứng dụng
Bạn có thể khởi động đồng thời cả frontend và backend bằng cách nhấp đúp vào file `start-all.bat` ở thư mục gốc của dự án hoặc chạy các lệnh sau:
- Backend: `mvn spring-boot:run` tại `/backend`
- Frontend: `npm run dev` tại `/frontend`

### 2.2. Trải nghiệm Chương trình ưu đãi mới
1. Truy cập `http://localhost:3000/sales-policies` (Trang danh sách chương trình ưu đãi).
2. Click **Tạo ưu đãi mới** để chuyển hướng sang `/sales-policies/new`.
3. Trải nghiệm giao diện thiết lập Chương trình ưu đãi 4 khối cực đẹp mắt:
   - Điền Tên ưu đãi, Ngày hiệu lực, các Tag hiển thị, số lượng giới hạn.
   - Thêm các Bộ điều kiện đối tượng (OR), bật/tắt các hạng đại lý và miền tỉnh thành.
   - Chọn sản phẩm, danh mục cần áp dụng hoặc loại trừ.
   - Ở khối Cơ cấu điều kiện, thêm các dòng bậc thang, chọn sản phẩm quà tặng thực tế từ danh sách.
4. Chuyển sang tab **Preview hiển thị** ở đầu trang để xem trước giao diện banner và app di động mô phỏng khuyến mãi thời gian thực cho đại lý.
5. Click **Lưu thay đổi** để lưu dữ liệu.
6. Thử tạo một đơn hàng từ dashboard cho Đại lý thuộc đối tượng áp dụng để xác thực:
   - Tổng tiền và đơn giá sản phẩm tự động chiết khấu theo bậc thỏa mãn.
   - Sản phẩm quà tặng tương ứng tự động xuất hiện trong giỏ hàng với giá 0đ và tự động trừ số lượng trong kho.
