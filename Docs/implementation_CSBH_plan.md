# Kế hoạch Triển khai Module Chính Sách Bán Hàng (CSBH) - Phiên bản V2

Tài liệu này đề xuất thiết kế chi tiết và kế hoạch triển khai nâng cấp toàn diện module **Chính sách bán hàng (Sales Policy - CSBH)** để đáp ứng 100% giao diện thiết lập Chương trình ưu đãi B2B cao cấp theo hình ảnh yêu cầu.

Hệ thống sẽ chuyển đổi từ cấu hình đơn lẻ (flat) sang cấu hình **ưu đãi đa cấp bậc (Tiers)**, hỗ trợ nhiều **bộ lọc đối tượng kết hợp OR/AND**, **căn cứ xét duyệt linh hoạt** (Giá trị đơn hàng, Số lượng sản phẩm, Doanh số sản phẩm) và **quà tặng đính kèm**, đồng bộ từ Database, Java Backend APIs cho đến giao diện Next.js Dashboard.

---

## 1. Phân tích Yêu cầu Nghiệp vụ & Giao diện mới

Dựa trên hình ảnh giao diện thiết lập Chương trình ưu đãi, module CSBH cần nâng cấp các nghiệp vụ sau:

1. **Thông tin ưu đãi mở rộng**:
   - Quản lý thời gian hiệu lực rõ ràng: `Ngày bắt đầu` và `Ngày kết thúc` (chọn lịch).
   - `Tag hiển thị (Hỗ trợ bán hàng)`: Gắn các tag để hỗ trợ bộ phận sales/marketing.
   - Giới hạn quy mô: `Số lượng đơn tối đa` và `Lượt áp dụng/Đại lý` (có tuỳ chọn nhập số hoặc *Không giới hạn*).
   - Mô tả chương trình chi tiết.
   
2. **Cơ chế Đối tượng áp dụng đa cấp (Audience Filtering)**:
   - Thay vì 1 bộ lọc Rank/Province đơn lẻ, hệ thống hỗ trợ **Nhiều bộ lọc kết hợp bằng toán tử OR** (`Bộ điều kiện 01`, `Bộ điều kiện 02`...).
   - Trong mỗi bộ lọc, áp dụng toán tử AND:
     - **Hạng khách hàng (Rank Levels)**: Cho phép chọn nhiều hạng cùng lúc (Thành viên, Bạc, Titan, Vàng, Bạch Kim...) dưới dạng tag toggle.
     - **Khu vực / Tỉnh thành**: Cho phép chọn nhiều khu vực/tỉnh thành hoặc *Tất cả các tỉnh*.
   - Giữ nguyên cơ chế ưu tiên: `Đối tượng áp dụng = (Bộ lọc OR) + Danh sách chỉ định - Danh sách loại trừ`.

3. **Căn cứ xét duyệt ưu đãi (Target Evaluation Type)**:
   - **GT ĐƠN HÀNG (ORDER_VALUE)**: Áp dụng chiết khấu/quà tặng dựa trên tổng giá trị các sản phẩm áp dụng trong đơn hàng.
   - **SL SẢN PHẨM (PRODUCT_QTY)**: Áp dụng dựa trên tổng số lượng các sản phẩm áp dụng.
   - **DS SẢN PHẨM (PRODUCT_REVENUE)**: Áp dụng dựa trên tổng doanh thu của các sản phẩm áp dụng.

4. **Phạm vi sản phẩm áp dụng & loại trừ**:
   - `Nhóm sản phẩm áp dụng`: Các danh mục (Category) hoặc sản phẩm (Product) được áp dụng.
   - `Nhóm sản phẩm loại trừ`: Các danh mục hoặc sản phẩm cụ thể bị loại trừ khỏi ưu đãi.

5. **Cơ cấu điều kiện & ưu đãi theo bậc (Tiered Rewards)**:
   - Hỗ trợ nhập giới hạn: `Giá trị xét tối đa trên mỗi đơn` (Tránh lạm dụng ưu đãi quá mức).
   - Danh sách bậc (Tiers) tăng dần:
     - Toán tử so sánh: `>=`, `<=`, `>`, `<`, `=`.
     - Ngưỡng giá trị xét duyệt (Ví dụ: `>= 10,000,000` hoặc `>= 50`).
     - Loại ưu đãi: `Chiết khấu %`, `Chiết khấu tiền mặt (VND)`, `Giá chỉ định (VND)`.
     - Quà tặng đi kèm: Cho phép ghi chú tên quà tặng (Ví dụ: *2 Lưỡi cắt cỏ hợp kim cao cấp*).
     - Quy tắc tính toán: **Hệ thống sẽ tự động áp dụng mức thưởng cao nhất thỏa mãn** trong các bậc.

---

## 2. Thiết kế Database Schema & Entity Model (Backend)

Vì JPA `ddl-auto` được cấu hình là `update` trong `application.yml`, Hibernate sẽ tự động cập nhật schema database khi ta thay đổi/thêm các Entity Java. Ta sẽ tái cấu trúc `SalesPolicy` và tạo thêm các bảng phụ để lưu Tiers và Audience Filters.

### 2.1. SalesPolicy Entity nâng cấp (`com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicy`)
- Bổ sung các trường thông tin: `startDate`, `endDate`, `tags`, `maxOrderCount`, `maxApplicationPerAgency`, `description`, `targetType`, `maxDiscountValue`.
- Thêm các mối quan hệ One-to-Many với `SalesPolicyAudienceFilter` và `SalesPolicyTier`.
- Thêm các mối quan hệ Many-to-Many với `excludedProducts` và `excludedCategories`.

### 2.2. Thực thể Bộ lọc Đối tượng áp dụng (`SalesPolicyAudienceFilter.java`)
Lưu trữ các bộ lọc đối tượng áp dụng (hạng đại lý, tỉnh thành/khu vực) hỗ trợ kịch bản ghép nhiều bộ lọc bằng toán tử OR.

### 2.3. Thực thể Ưu đãi bậc thang (`SalesPolicyTier.java`)
Lưu trữ cấu hình bậc thang của ưu đãi (STT, toán tử, mức giá trị xét duyệt, loại ưu đãi, giá trị ưu đãi, quà tặng kèm).

---

## 3. Kiến trúc Backend APIs & Thuật toán tính giá nâng cấp

### 3.1. DTOs cập nhật
Chúng ta sẽ tạo các DTO lồng nhau để xử lý lưu/nhận cấu hình phức tạp:

- `SalesPolicyRequest`: Gửi từ Frontend chứa thông tin chi tiết, danh sách lồng nhau của bộ lọc đối tượng và các tiers ưu đãi.
- `SalesPolicyDTO`: Trả về từ Backend map đầy đủ dữ liệu từ Entity phức hợp.

### 3.2. Thuật toán Tính toán & Áp dụng ưu đãi bậc thang (`applySalesPolicy`)
Nâng cấp hàm `applySalesPolicy` trong `SalesPolicyService` để đánh giá toàn diện các sản phẩm hợp lệ, lọc đối tượng theo cơ chế OR đa bộ lọc, tìm bậc ưu đãi cao nhất thỏa mãn và trả về đơn giá sau chiết khấu.

---

## 4. Thiết kế Giao diện Frontend (Next.js Dashboard)

Chúng ta sẽ tạo màn hình chỉnh sửa chi tiết và thêm mới toàn diện tại `frontend/src/app/sales-policies/[id]/page.tsx` và `frontend/src/app/sales-policies/new/page.tsx`, sử dụng thiết kế cực kỳ hiện đại giống 100% hình ảnh đính kèm.

### 4.1. Cấu trúc Component & State Management
Form sẽ quản lý các trạng thái đầy đủ bao gồm thông tin chung, bộ lọc đối tượng (chọn hạng, tỉnh thành/khu vực), danh mục và sản phẩm (áp dụng và loại trừ), các tiers ưu đãi kèm quà tặng.

### 4.2. Phong cách Thiết kế & Mỹ thuật (Premium UI CSS)
- **Hệ màu chủ đạo**: Tone màu Indigo, Deep Violet (`#4f46e5`, `#6366f1`) và Slate cho cảm giác công nghệ cao cấp.
- **Glassmorphism**: Các Panel có nền mờ nhẹ, border mỏng sáng, đổ bóng sâu mịn tạo cảm giác vô cùng hiện đại.
- **Interactive Toggles & Tabs**:
  - `Hạng khách hàng` & `Tỉnh thành`: Hiển thị dưới dạng các Badge nút bấm bo tròn, kích hoạt/hủy kích hoạt mượt mà.
  - `Căn cứ xét duyệt`: 3 thẻ lớn nằm ngang với icon và chữ rõ ràng.
  - `Tiers list`: Bảng nhập liệu cao cấp, tự động thêm/xóa dòng tức thì.

---

## 5. Kế hoạch Kiểm thử & Xác minh (Verification Plan)

### 5.1. Kiểm thử Tự động (Backend Unit & Integration Tests)
- Tạo kịch bản kiểm thử tích hợp (Integration Tests) trong Spring Boot:
  - Tạo ưu đãi đa cấp bậc và gọi API `/api/sales-policies/resolve-price` để kiểm tra đơn giá được giảm trừ chính xác theo từng mức số lượng/giá trị đơn hàng.
  
### 5.2. Kiểm thử Thủ công (Frontend & Order Flow)
- Thiết lập Chương trình ưu đãi hè 2026 trên giao diện mới.
- Lưu lại và kiểm tra xem dữ liệu trong Postgres và giao diện hiển thị đồng bộ chính xác.
- Tạo một đơn hàng thử nghiệm để kiểm tra đơn giá và quà tặng được áp dụng chuẩn xác.
