# Tài liệu Đề xuất Hệ thống Sàn Thương mại Điện tử (B2B2C / Dropshipping & Marketplace)

Hệ thống được thiết kế theo mô hình kết hợp (Hybrid) giữa B2B2C, Dropshipping và Marketplace, cho phép Công ty, Đại lý và Khách hàng tương tác liên mạch trong cùng một hệ sinh thái.

---

## 1. Phân quyền và Vai trò (Roles)

### 1.1. Công ty (Chủ Sàn / Platform Owner)
- **Quản lý Nguồn hàng Tổng:** Đăng tải và quản lý danh mục sản phẩm của công ty để phân phối xuống cho các nhà bán lẻ / đại lý.
- **Vận hành Đơn hàng Dropship:** Nhận trực tiếp đơn hàng do Đại lý đặt thay cho Khách hàng. Công ty sẽ đảm nhận toàn bộ khâu hậu cần: xuất kho, đóng gói, và giao hàng thẳng tới tay Khách hàng của Đại lý.
- **Quản lý Mạng lưới Đại lý:** Phê duyệt đơn đăng ký Đại lý, phân cấp Đại lý và định cấu hình các mức chiết khấu linh hoạt.
- **Quản lý Hệ thống Sàn (Marketplace):** Kiểm duyệt sản phẩm do Đại lý tự đăng bán lên sàn chung để đảm bảo chất lượng và quy chuẩn.
- **Mô hình Doanh thu & Đối soát:** Quản lý chia sẻ chiết khấu cho đơn Dropship và **tự động cắt/thu phí giao dịch (Platform Fee)** trên các đơn hàng Đại lý tự bán.

### 1.2. Đại lý (Nhà cung cấp / Seller / Agency)
- **Kinh doanh không cần vốn (Mô hình Dropship):** Khai thác toàn bộ kho hàng của Công ty. Tư vấn cho Khách hàng và đặt hàng trên hệ thống với địa chỉ giao nhận của Khách. Đại lý hưởng phần trăm chiết khấu trực tiếp trên đơn hàng mà không cần vận hành hàng hóa.
- **Kinh doanh tự chủ (Mô hình Marketplace):** Được cung cấp 1 "Gian hàng" riêng. Đại lý có thể tự đăng bán các sản phẩm riêng nhập từ nguồn khác.
- **Vận hành:** Tự xử lý vòng đời đóng gói/giao hàng (đối với hàng tự bán).
- **Quản lý Dòng tiền:** Theo dõi hoa hồng thu được từ Dropship và trả phí hoa hồng cho Sàn khi tự bán sản phẩm thành công.

### 1.3. Khách hàng (End Consumer / Buyer)
- **Hiển thị định tuyến thông minh:** Mặc định hệ thống sẽ ưu tiên hiển thị gian hàng và sản phẩm của các **Đại lý ở gần Khách hàng nhất**. Có thể tuỳ chỉnh hiển thị theo khoảng cách, tìm kiếm hoặc sắp xếp theo giá.
- **Giỏ hàng đa dạng:** Giỏ hàng có thể chứa hỗn hợp nhiều sản phẩm (cả hàng Dropship và Marketplace) từ các Đại lý khác nhau.
- **Trải nghiệm tập trung:** Theo dõi trạng thái đơn hàng, vận chuyển trực quan trên cùng một nền tảng.

---

## 2. Các Luồng Nghiệp Vụ Kinh Doanh Cốt Lõi (Core Business Flows)

### 2.1. Luồng 1: Bán hàng của Công ty theo dạng Dropshipping
1. Bảng giá & Chiết khấu: Công ty niêm yết Sản phẩm X với *Giá bán lẻ gốc* và *Giá chiết khấu cho Đại lý*.
2. Tạo đơn: Đại lý lên đơn Sản phẩm X điền thông tin Khách Hàng. (Hoặc Khách tự chọn mua Sản phẩm X từ gian hàng được ủy quyền của Đại lý).
3. Vận hành: Hệ thống tự động tách luồng, chuyển "Đóng gói & Vận chuyển" về cho kho của Công ty.
4. Giao nhận: Công ty giao thành công tới tay Khách hàng bằng danh nghĩa của Đại lý.
5. Kế toán: Doanh thu = Giá lẻ (hoặc giá đã giảm). Hệ thống ghi nhận **Hoa hồng chiết khấu** chuyển vào số dư ví của Đại lý.

### 2.2. Luồng 2: Đại lý tự bán hàng trên hệ sinh thái chung
1. Phê duyệt hàng: Đại lý đăng tải Sản phẩm Y. (Công ty có thể duyệt hoặc auto-duyệt).
2. Khám phá & Mua hàng: Khách truy cập sàn. Hệ thống tự động ưu tiên hiển thị Sản phẩm Y dựa trên **vị trí địa lý gần nhất**, ngoài ra khách có thể tự tìm kiếm hoặc lọc theo giá bán. Khách đặt mua.
3. Vận hành: Thông báo đẩy về tài khoản Đại lý. Đại lý tự xác nhận, tự đóng gói và giao đơn.
4. Thanh toán & Đối soát: Khách thực hiện thanh toán online **bắn tiền trực tiếp vào Tài khoản Ngân hàng của Công ty**. Sau khi đơn hoàn thành, hệ thống tự động đối soát: cắt lại phần **Phí Sàn** (tỷ lệ phí cài đặt linh hoạt dựa theo hợp đồng của từng Đại lý), phần tiền lợi nhuận còn lại đẩy vào Ví Đại lý.

---

## 3. Bản đồ Thiết kế Chức năng Modules (Feature Map)

| Module | Dành cho Công ty | Dành cho Đại lý | Dành cho Khách hàng |
| :--- | :--- | :--- | :--- |
| **Sản phẩm** | Quản lý Master Catalog, Phê duyệt hàng Đại lý tự đăng | Quản lý kho riêng, Sync hàng của Công ty | Tìm kiếm, Lọc, So sánh |
| **Đơn hàng** | Tiền xử lý đơn Dropship, Theo dõi Vận chuyển | Quản lý Đơn self-fulfillment (Tự giao) và Dropship | Theo dõi trạng thái kiện hàng |
| **Tài chính** | Đối soát dòng tiền, Rút/Nạp ví tiền Đại lý, Quản lý phí giao dịch | Ví điện tử, Yêu cầu Rút tiền đối soát, Báo cáo lãi lỗ | Cổng thanh toán (Wallet, VNPay..) |
| **Marketing** | Voucher chung toàn sàn, Banner | Voucher riêng của gian hàng Đại lý | Tích điểm thành viên |

---

## 4. Quyết định Kiến trúc & Kỹ thuật (Technical Decisions)

> [!NOTE]  
> Dựa trên nghiệp vụ yêu cầu của bạn, kiến trúc hệ thống đã được chốt với các nguyên tắc sau:
> - **Location-based Routing:** Hệ thống bắt buộc phải truy xuất GPS / Tọa độ của Khách hàng, so sánh với tọa độ Đại lý để ưu tiên gợi ý kết quả hiển thị (Gần nhất -> Xa nhất).
> - **Centralized Payment Flow:** Dòng tiền đi theo mô hình tập trung. Công ty đóng vai trò Cổng thu tiền (Merchant), toàn bộ các giao dịch qua thẻ/ví điện tử đều đổ về tài khoản Công ty để xử lý rủi ro và quản lý dòng vốn tổng.
> - **Dynamic Commission Engine:** Bảng phí Sàn không fix cứng, cần thiết kế Schema cho phép gán bảng phí/hợp đồng linh hoạt tới cấp Đại lý hoặc cụ thể từng Đại lý.

---

## 5. Đề xuất Mảng Công Nghệ (Tech Stack) - [ĐÃ CHỐT]

- **Backend:** Java Spring Boot (RESTful API, Spring Security, Spring Data JPA).
- **Frontend / Client:** ReactJS hoặc Next.js (Dùng TailwindCSS hoặc Ant Design để xây dựng UI hiện đại, mượt mà).
- **Database:** PostgreSQL (Hỗ trợ extension `PostGIS` giúp truy vấn nhanh các bài toán tọa độ Không gian - tìm Đại lý gần Khách hàng nhất).
- **Caching:** Redis (Cache danh mục sản phẩm, phiên người dùng, xếp hạng doanh thu).

---

## 6. Thiết kế Cơ sở dữ liệu Định hướng (Database Schema)

### 6.1. Users & Authority
- `users`: id, username, password, email, role (COMPANY, AGENCY, CUSTOMER), status
- `agencies`: id, user_id, name, phone, address, latitude, longitude, commission_rate, status

### 6.2. Catalog & Products
- `categories`: id, name, parent_id
- `products`: id, name, description, category_id, base_price, dropship_price, stock_quantity, is_dropship 
- `agency_products`: id, agency_id, product_id, stock_quantity, custom_price, status

### 6.3. Orders & Transactions
- `orders`: id, customer_id, agency_id, total_amount, shipping_address, order_type (DROPSHIP, MARKETPLACE), status
- `order_items`: id, order_id, product_id, quantity, unit_price
- `transactions`: id, order_id, agency_id, total_amount, platform_fee, agency_net_income, type, payment_status, created_at

### 6.4. Khuyến mãi & Tích lũy điểm (Promotions & Loyalty)
- `promotions`: id, code, description, discount_type, discount_value, min_order_value, start_date, end_date, agency_id (nếu null là mã của sàn), status
- `loyalty_points`: id, customer_id, points_balance, total_earned
- `point_transactions`: id, customer_id, points, transaction_type (EARN, REDEEM), order_id, created_at

### 6.5. Đánh giá & Xếp hạng (Reviews & Rankings)
- `product_reviews`: id, product_id, customer_id, rating, comment, created_at
- `agency_reviews`: id, agency_id, customer_id, rating, comment, created_at
- `agency_rankings`: id, agency_id, total_revenue, rank_level, month, year

### 6.6. Hệ thống Nhắn tin (Chat)
- `chat_rooms`: id, agency_id, customer_id, created_at
- `chat_messages`: id, room_id, sender_id, sender_type (CUSTOMER, AGENCY), content, is_read, created_at

---

## Trạng thái Kế hoạch
> [!IMPORTANT]
> Toàn bộ kiến trúc, Core Flow, Tech Stack, và các Module Database mở rộng (Khuyến mãi, Điểm, Đánh giá, Phân hạng, Chat) đã được **XÁC NHẬN CHỐT (APPROVED)**.
> Đã hoàn thành Giai đoạn Khởi tạo (Phase 1-3) và Giai đoạn Backend Cơ bản (Phase 5-6).

---

## 7. Kế Hoạch Triển Khai Mở Rộng Backend (Advanced APIs)

Giai đoạn này tập trung vào việc hiện thực hoá các tính năng tương tác khách hàng và Retention (giữ chân khách hàng).

### 7.1. Hệ thống Khuyến Mãi (Promotions) & Tích Điểm (Loyalty Points)
- **Entities:** Tạo `Promotion`, `PointTransaction` (Bảng `LoyaltyPoint` đã tồn tại).
- **APIs:** 
  - Quản lý mã giảm giá (`PromotionController`).
  - Lịch sử tích lũy/sử dụng điểm (`LoyaltyController`).
- **Nghiệp vụ:** Bổ sung logic vào `OrderService` cho phép khách hàng áp dụng `PromotionCode` hoặc đối trừ `LoyaltyPoint` trước khi chốt tổng tiền đơn hàng.

### 7.2. Tương tác: Đánh giá & Xếp hạng (Reviews & Rankings)
- **Entities:** Tạo `ProductReview`, `AgencyReview`, `AgencyRanking`.
- **APIs:** 
  - Khách hàng đánh giá Sản phẩm / Đại lý (`ReviewController`).
  - Lấy danh sách đánh giá công khai (có phân trang/lọc số sao).
- **Nghiệp vụ:** CronJob / Spring Scheduler định kỳ tính toán tổng doanh thu của Đại lý và cập nhật xếp hạng vào `AgencyRanking`.

### 7.3. Giao tiếp: Hệ thống Nhắn tin (Chat System)
- **Entities:** Tạo `ChatRoom`, `ChatMessage`.
- **APIs:** 
  - API cơ bản để khởi tạo phòng Chat giữa Customer và Agency.
  - API gửi / nhận tin nhắn RESTful (`ChatController`).
- **Nghiệp vụ:** Tối ưu truy vấn tin nhắn với phân trang (Cursor-based Pagination hoặc Page/Limit). *(Ghi chú: Việc áp dụng WebSocket/STOMP có thể thêm vào sau để tin nhắn real-time thực sự).*

## Ý kiến phản hồi cần thiết
> [!WARNING]
> Bạn có muốn sử dụng **WebSocket** (qua thư viện `spring-boot-starter-websocket`) ngay lập tức cho module Chat không, hay tạm thời cứ dùng REST API gửi nhận tin (Polling) cho đơn giản và nhanh chóng? - websocket
> Ngoài ra, phần thanh toán và tính phí hoa hồng, bạn muốn tích hợp logic cứng (giảm % cố định) hay có cấu hình riêng từng chiết khấu? - Cấu hình riêng

