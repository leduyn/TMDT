# Thiết kế chức năng Quản lý Chính sách Hoa hồng và Giá bán

> Dựa trên file: `VINAGO_Chính sách bán hàng V2.xlsx`

---

## I. Phân tích nghiệp vụ từ file Excel

### 1. Các chính sách hoa hồng/thưởng

| # | Chính sách | Chu kỳ | Công thức | Điều kiện |
|---|-----------|--------|-----------|-----------|
| 1 | **Hoa hồng bán hàng tháng** | Hàng tháng | DTT × tỷ lệ bậc thang (5%-10%) | Đơn đã giao + đã thu tiền |
| 2 | **Chào mừng khách hàng mới** | 1 lần | n% discount, tối đa n triệu, trong n ngày | Kích hoạt tài khoản |
| 3 | **Quyền lợi theo cấp bậc** | Cuối năm | CK thêm 0.5%-3% × DTT | DTT + số người mua hợp lệ |
| 4 | **Thưởng tăng trưởng** | Cuối năm | 1%-3% × DTT tăng thêm | YoY growth > n% |
| 5 | **Tích lũy năm** | Cuối năm | 1%-3% × tổng DTT năm | Từ bậc Vàng trở lên |
| 6 | **Thưởng đồng hành** | Hàng năm | +0.2%/năm duy trì, tối đa 1% | Duy trì DTT ≥ n |

### 2. Khái niệm quan trọng

- **DTT (Doanh thu thuần)**: Tổng giá trị các đơn hàng đã giao thành công và đã thu tiền
- **Người mua hợp lệ**: Người có số điện thoại, địa chỉ giao hàng và thông tin nhận hàng độc lập; đơn hàng không bị hủy/trả lại
- **Cấp bậc Đại lý**: ĐỒNG → BẠC → VÀNG → BẠCH KIM → KIM CƯƠNG (xác định theo DTT lũy kế)
- **Sản phẩm loại trừ**: Một số sản phẩm/danh mục không được hưởng hoa hồng

### 3. Các bậc thang chi tiết

#### Hoa hồng bán hàng tháng
| DTT tháng | Tỷ lệ |
|-----------|-------|
| Dưới 50 tr | 5% |
| 50 tr - 100 tr | 6% |
| 100 tr - 200 tr | 7% |
| 200 tr - 300 tr | 8.5% |
| Trên 300 tr | 10% |

#### Cấp bậc Đại lý (Quyền lợi theo cấp bậc)
| Cấp bậc | Điều kiện DTT | Số người mua hợp lệ | Chiết khấu thêm |
|---------|---------------|--------------------|-----------------|
| ĐỒNG | — | — | — |
| BẠC | ≥ 500 tr | ≥ 3 | +0.5% |
| VÀNG | ≥ 1.2 tỷ | ≥ 5 | +1% |
| BẠCH KIM | ≥ 3 tỷ | ≥ 6 | +2% |
| KIM CƯƠNG | ≥ 5 tỷ | Không yêu cầu | +3% |

#### Chương trình tích lũy năm (từ Vàng trở lên)
| DTT năm | Chiết khấu |
|---------|-----------|
| Trên 2.0 tỷ | 1% / tổng DTT năm |
| Trên 4.0 tỷ | 2% / tổng DTT năm |
| Trên 7 tỷ | 3% / tổng DTT năm |

---

## II. Kiến trúc hệ thống

### A. Module mới: `commission`

Tách riêng module quản lý chính sách hoa hồng, độc lập với `price` (giá bán) và `salespolicy` (chiêu thị).

```
backend/src/main/java/com/anhtin/tmdt/backend/modules/commission/
├── entity/
│   ├── CommissionPolicy.java              — Chính sách hoa hồng
│   ├── CommissionPolicyTier.java          — Bậc thang hoa hồng
│   ├── CommissionPolicyAudience.java      — Đối tượng áp dụng
│   ├── CommissionPolicyExclusion.java     — Sản phẩm/danh mục loại trừ
│   ├── CommissionStatement.java           — Bảng kê hoa hồng kỳ
│   └── CommissionStatementLine.java       — Dòng chi tiết bảng kê
├── dto/
│   ├── CommissionPolicyRequest.java
│   ├── CommissionPolicyDTO.java
│   └── CommissionStatementDTO.java
├── repository/
│   ├── CommissionPolicyRepository.java
│   ├── CommissionStatementRepository.java
│   └── CommissionStatementLineRepository.java
├── service/
│   ├── CommissionPolicyService.java       — CRUD chính sách
│   ├── CommissionCalculationService.java  — Engine tính hoa hồng
│   └── CommissionStatementService.java    — Xuất bảng kê
├── controller/
│   └── CommissionPolicyController.java
└── scheduler/
    └── CommissionScheduler.java           — Job tự động tính hoa hồng
```

### B. Entity Models chi tiết

#### CommissionPolicy

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Long | PK, auto increment |
| name | String | Tên chính sách |
| policyType | Enum(String) | `MONTHLY_REBATE`, `NEW_CUSTOMER_WELCOME`, `TIER_BENEFIT`, `GROWTH_BONUS`, `ANNUAL_ACCUMULATION`, `LOYALTY_BONUS` |
| description | String(Text) | Mô tả chi tiết |
| calculationMethod | Enum(String) | `FLAT_TIER` (bậc thang), `PROGRESSIVE` (lũy tiến từng phần), `HIGHEST_THRESHOLD` (mức cao nhất) |
| applyToAllAgencies | Boolean | Mặc định true |
| startDate | LocalDateTime | Ngày bắt đầu hiệu lực |
| endDate | LocalDateTime | Ngày kết thúc (null = vô thời hạn) |
| active | Boolean | Mặc định true |
| createdBy | String | Người tạo (username) |
| createdAt | LocalDateTime | |

#### CommissionPolicyTier (1-N với CommissionPolicy)

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Long | PK |
| policy | CommissionPolicy | FK → commission_policies.id |
| tierIndex | Integer | Thứ tự ưu tiên (1, 2, 3...) |
| conditionField | Enum(String) | `DTT`, `DTT_GROWTH_RATE`, `DTT_YEARLY`, `LOYALTY_YEARS`, `BUYER_COUNT`, `MIN_ORDER_COUNT` |
| operator | Enum(String) | `GREATER_THAN`, `GREATER_OR_EQUAL`, `RANGE` |
| minValue | Double | Giá trị threshold dưới (VD: 50_000_000) |
| maxValue | Double | Giá trị threshold trên (cho RANGE) |
| adjustmentType | Enum(String) | `PERCENTAGE`, `FIXED_AMOUNT` |
| adjustmentValue | Double | Giá trị điều chỉnh (VD: 0.05 = 5%) |

#### CommissionPolicyAudience (1-N với CommissionPolicy)

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Long | PK |
| policy | CommissionPolicy | FK |
| filterType | Enum(String) | `AGENCY_RANK`, `AGENCY_ID`, `PROVINCE`, `MIN_REVENUE`, `MIN_BUYER_COUNT` |
| filterValue | String | Giá trị lọc (VD: "VÀNG", "1,2,3" cho AGENCY_ID) |

#### CommissionPolicyExclusion (1-N với CommissionPolicy)

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Long | PK |
| policy | CommissionPolicy | FK |
| excludeType | Enum(String) | `PRODUCT`, `CATEGORY`, `PRODUCT_TYPE` |
| excludeId | Long | ID đối tượng bị loại trừ |
| excludeName | String | Tên đối tượng (denormalize cho dễ hiển thị) |

#### CommissionStatement

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Long | PK |
| agencyId | Long | FK → agencies.id |
| agencyName | String | Denormalize |
| policyId | Long | FK → commission_policies.id |
| policyName | String | Denormalize |
| periodType | Enum(String) | `MONTHLY`, `YEARLY`, `ONE_TIME` |
| periodMonth | Integer | Tháng (1-12) |
| periodYear | Integer | Năm |
| totalDTT | Double | Tổng DTT hợp lệ trong kỳ |
| totalCommission | Double | Tổng hoa hồng/tiền thưởng |
| status | Enum(String) | `PENDING`, `APPROVED`, `PAID`, `CANCELLED` |
| paidAt | LocalDateTime | Ngày chi trả |
| paidTransactionRef | String | Mã tham chiếu giao dịch chi trả |
| note | String(Text) | Ghi chú |
| createdAt | LocalDateTime | |
| updatedAt | LocalDateTime | |

#### CommissionStatementLine (1-N với CommissionStatement)

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Long | PK |
| statementId | Long | FK → commission_statements.id |
| orderId | Long | FK → orders.id (đơn hàng đóng góp) |
| orderCode | String | Mã đơn |
| orderAmount | Double | Giá trị đơn hàng |
| commissionRate | Double | Tỷ lệ hoa hồng áp dụng cho đơn này |
| commissionAmount | Double | Hoa hồng = orderAmount × commissionRate |

### C. Database Migration (Flyway)

File: `V20260701__create_commission_module.sql`

```sql
-- Chính sách hoa hồng
CREATE TABLE commission_policies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    policy_type VARCHAR(50) NOT NULL,
    description TEXT,
    calculation_method VARCHAR(50) NOT NULL DEFAULT 'FLAT_TIER',
    apply_to_all_agencies BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bậc thang hoa hồng
CREATE TABLE commission_policy_tiers (
    id BIGSERIAL PRIMARY KEY,
    policy_id BIGINT NOT NULL REFERENCES commission_policies(id) ON DELETE CASCADE,
    tier_index INT NOT NULL,
    condition_field VARCHAR(50) NOT NULL,
    operator VARCHAR(20) NOT NULL,
    min_value DOUBLE PRECISION,
    max_value DOUBLE PRECISION,
    adjustment_type VARCHAR(20) NOT NULL,
    adjustment_value DOUBLE PRECISION NOT NULL
);

-- Đối tượng áp dụng
CREATE TABLE commission_policy_audiences (
    id BIGSERIAL PRIMARY KEY,
    policy_id BIGINT NOT NULL REFERENCES commission_policies(id) ON DELETE CASCADE,
    filter_type VARCHAR(50) NOT NULL,
    filter_value VARCHAR(255) NOT NULL
);

-- Loại trừ sản phẩm/danh mục
CREATE TABLE commission_policy_exclusions (
    id BIGSERIAL PRIMARY KEY,
    policy_id BIGINT NOT NULL REFERENCES commission_policies(id) ON DELETE CASCADE,
    exclude_type VARCHAR(50) NOT NULL,
    exclude_id BIGINT NOT NULL,
    exclude_name VARCHAR(255)
);

-- Bảng kê hoa hồng
CREATE TABLE commission_statements (
    id BIGSERIAL PRIMARY KEY,
    agency_id BIGINT NOT NULL REFERENCES agencies(id),
    agency_name VARCHAR(255),
    policy_id BIGINT NOT NULL REFERENCES commission_policies(id),
    policy_name VARCHAR(255),
    period_type VARCHAR(20) NOT NULL,
    period_month INT,
    period_year INT NOT NULL,
    total_dtt DOUBLE PRECISION DEFAULT 0,
    total_commission DOUBLE PRECISION DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',
    paid_at TIMESTAMP,
    paid_transaction_ref VARCHAR(255),
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chi tiết bảng kê (theo đơn hàng)
CREATE TABLE commission_statement_lines (
    id BIGSERIAL PRIMARY KEY,
    statement_id BIGINT NOT NULL REFERENCES commission_statements(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES orders(id),
    order_code VARCHAR(100),
    order_amount DOUBLE PRECISION DEFAULT 0,
    commission_rate DOUBLE PRECISION DEFAULT 0,
    commission_amount DOUBLE PRECISION DEFAULT 0
);

-- Index
CREATE INDEX idx_cs_agency_period ON commission_statements(agency_id, period_year, period_month);
CREATE INDEX idx_cs_policy ON commission_statements(policy_id);
CREATE INDEX idx_csl_statement ON commission_statement_lines(statement_id);
CREATE INDEX idx_cpt_policy ON commission_policy_tiers(policy_id);
```

---

## III. Luồng tính toán hoa hồng

### A. Sơ đồ xử lý

```
┌───────────────────────────────────────────────────┐
│              CommissionScheduler                   │
│  @Scheduled(cron = "0 0 2 1 * *") — đầu tháng     │
│  @Scheduled(cron = "0 0 2 1 1 *") — đầu năm      │
└──────────┬────────────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────────────────┐
│         CommissionCalculationService              │
│                                                   │
│  1. Lọc CommissionPolicy active + trong hạn       │
│  2. Với mỗi policy, xác định danh sách Agency:   │
│     a. applyToAllAgencies = true → tất cả agency  │
│     b. applyToAllAgencies = false → lọc theo      │
│        CommissionPolicyAudience                    │
│  3. Với mỗi Agency, tính DTT hợp lệ trong kỳ:    │
│     - Order có status = 'DELIVERED'               │
│     - Transaction.paymentStatus = 'COMPLETED'     │
│     - Loại trừ sản phẩm trong Exclusion list      │
│  4. Xác định bậc (từ CommissionPolicyTier)        │
│     dựa trên DTT hoặc điều kiện khác              │
│  5. Tạo CommissionStatement + StatementLines      │
└───────────────────────────────────────────────────┘
```

### B. Chi tiết từng loại chính sách

#### 1. MONTHLY_REBATE — Hoa hồng bán hàng tháng
- **Kỳ**: Hàng tháng (đầu tháng N tính cho tháng N-1)
- **DTT**: Tổng giá trị đơn `DELIVERED` + `COMPLETED` trong tháng
- **Công thức**: Tra bậc theo DTT → `adjustmentValue` × DTT
- **Ghi nhận**: Tạo 1 Statement + N Line (mỗi đơn 1 dòng)

#### 2. NEW_CUSTOMER_WELCOME — Chào mừng khách hàng mới
- **Kỳ**: Một lần, trong vòng N ngày kể từ ngày kích hoạt
- **Công thức**: n% chiết khấu cho đơn hàng, tối đa n triệu
- **Cách hoạt động**: Giảm trực tiếp trên đơn hàng (tích hợp vào Order.discountAmount)
- **Ghi nhận**: Tạo Statement khi kết thúc thời gian ưu đãi

#### 3. TIER_BENEFIT — Quyền lợi theo cấp bậc
- **Kỳ**: Cuối năm (hoặc cuối tháng nếu real-time promotion)
- **DTT**: DTT lũy kế trong năm (hoặc 12 tháng gần nhất)
- **Điều kiện phụ**: Số người mua hợp lệ ≥ threshold
- **Công thức**: `adjustmentValue` × DTT lũy kế
- **Ghi chú**: Cộng dồn vào hoa hồng cuối năm (tháng 12)

#### 4. GROWTH_BONUS — Thưởng tăng trưởng
- **Kỳ**: Cuối năm
- **DTT**: Phần DTT tăng thêm so với năm trước
- **Công thức**:
  - Tăng < n%: 1% × DTT tăng thêm
  - Tăng ≥ n%: 3% × DTT tăng thêm
- **Giới hạn**: Không vượt quá 2% DTT năm xét thưởng

#### 5. ANNUAL_ACCUMULATION — Tích lũy năm
- **Kỳ**: Cuối năm
- **Đối tượng**: Agency từ bậc Vàng trở lên
- **Công thức**: Tùy cấu hình `calculationMethod`:
  - `FLAT_TIER`: Mỗi bậc hưởng tỷ lệ cố định
  - `PROGRESSIVE`: Lũy tiến theo từng phần DTT
  - `HIGHEST_THRESHOLD`: Hưởng mức cao nhất đạt được

#### 6. LOYALTY_BONUS — Thưởng đồng hành
- **Kỳ**: Hàng năm, tính vào đơn hàng đầu tiên của năm mới
- **Công thức**: `min(loyaltyYears × 0.2%, 1%)` × DTT
- **Điều kiện**: Mỗi năm duy trì DTT ≥ n

---

## IV. Tích hợp với module hiện có

| Module hiện có | Vai trò trong thiết kế mới |
|----------------|---------------------------|
| `price/CommissionService` | Giữ nguyên — xử lý per-order commission (Dropship phí sàn). Module `commission` tính periodic rebate/bonus riêng |
| `agency/AgencyRanking` | Đọc `rankLevel` để xét điều kiện áp dụng (VD: TIER_BENEFIT, ANNUAL_ACCUMULATION) |
| `order/Order` + `Transaction` | Nguồn dữ liệu DTT — lọc đơn `DELIVERED` + `COMPLETED` |
| `credit/AgencyDebt` | Có thể dùng để xét điều kiện "DTT + Tiền thu" — nếu còn nợ quá hạn thì không ghi nhận doanh thu |
| `salespolicy/SalesPolicy` | Giữ nguyên — phụ trách pricing adjustment trên đơn hàng |
| `price/PriceList` | Giữ nguyên — định giá sản phẩm theo bảng giá |
| `promotion/Promotion` | Giữ nguyên — voucher/chiêu thị riêng biệt |
| `accumulation_programs` (SQL) | Module `commission` thay thế và mở rộng các bảng này |

---

## V. Scheduler Jobs

| Method | Cron | Mô tả |
|--------|------|-------|
| `monthlyRebateCalculation()` | `0 0 2 1 * *` | Đầu tháng: tính hoa hồng tháng cho MONTHLY_REBATE |
| `tierEvaluation()` | `0 0 2 1 * *` | Đầu tháng: đánh giá lại cấp bậc dựa trên DTT lũy kế |
| `yearlyBonusCalculation()` | `0 0 2 1 1 *` | Đầu năm: tính thưởng cuối năm (growth, accumulation, loyalty) |

---

## VI. Cấu hình hệ thống (SystemConfig / application.yml)

Các tham số có thể cấu hình linh hoạt:

| Config Key | Mặc định | Mô tả |
|------------|---------|-------|
| `commission.growth.bonus.cap` | 0.02 (2%) | Giới hạn thưởng tăng trưởng |
| `commission.growth.threshold` | 0.20 (20%) | Ngưỡng % tăng trưởng (dưới: 1%, trên: 3%) |
| `commission.growth.low.rate` | 0.01 (1%) | Tỷ lệ thưởng khi tăng < threshold |
| `commission.growth.high.rate` | 0.03 (3%) | Tỷ lệ thưởng khi tăng ≥ threshold |
| `commission.loyalty.min-dtt` | 500000000 | DTT tối thiểu/năm để nhận thưởng đồng hành |
| `commission.loyalty.bonus-per-year` | 0.002 (0.2%) | Mỗi năm duy trì được cộng thêm |
| `commission.loyalty.max-bonus` | 0.01 (1%) | Tối đa thưởng đồng hành |
| `commission.new-customer.days` | 10 | Số ngày ưu đãi cho KH mới |
| `commission.new-customer.discount` | 0.05 (5%) | Chiết khấu KH mới |
| `commission.new-customer.max-discount` | 10000000 | Tối đa chiết khấu (VNĐ) |

---

## VII. REST API endpoints

### Nhóm chính sách (Commission Policy)

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `POST` | `/api/commission/policies` | COMPANY | Tạo chính sách mới |
| `GET` | `/api/commission/policies` | COMPANY, AGENCY | Danh sách chính sách |
| `GET` | `/api/commission/policies/{id}` | COMPANY, AGENCY | Chi tiết chính sách |
| `PUT` | `/api/commission/policies/{id}` | COMPANY | Cập nhật chính sách |
| `DELETE` | `/api/commission/policies/{id}` | COMPANY | Xóa chính sách |
| `POST` | `/api/commission/policies/{id}/toggle` | COMPANY | Bật/tắt chính sách |

### Nhóm bảng kê (Commission Statement)

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| `GET` | `/api/commission/statements` | COMPANY, AGENCY | Danh sách bảng kê (theo kỳ, agency) |
| `GET` | `/api/commission/statements/{id}` | COMPANY, AGENCY | Chi tiết bảng kê + dòng |
| `PUT` | `/api/commission/statements/{id}/approve` | COMPANY | Duyệt bảng kê |
| `PUT` | `/api/commission/statements/{id}/pay` | COMPANY | Xác nhận đã chi trả |
| `POST` | `/api/commission/statements/calculate` | COMPANY | Chạy tính toán thủ công cho kỳ |

---

## VIII. Mobile App Screens

| Màn hình | Mô tả |
|----------|-------|
| **CommissionPolicyListScreen** | Danh sách chính sách (dạng thẻ) — chỉ COMPANY mới thấy nút thêm/sửa |
| **CommissionPolicyDetailScreen** | Chi tiết: tên, loại, bậc thang, đối tượng, loại trừ |
| **CommissionPolicyFormScreen** | Form tạo/sửa (động theo policyType) |
| **CommissionStatementListScreen** | Bảng kê hoa hồng — AGENCY xem của mình, COMPANY xem tất cả |
| **CommissionStatementDetailScreen** | Chi tiết bảng kê: danh sách đơn hàng đóng góp, tỷ lệ, thành tiền |

---

## IX. Thứ tự ưu tiên triển khai

### Phase 1 — Nền tảng (Core)
1. Flyway migration: tạo các bảng `commission_*`
2. Java entities + repositories
3. `CommissionPolicyService` — CRUD chính sách
4. `CommissionPolicyController` — REST API

### Phase 2 — Tính toán cơ bản
5. `CommissionCalculationService` — Engine tính hoa hồng tháng (MONTHLY_REBATE)
6. `CommissionScheduler.monthlyRebateCalculation()` — Job đầu tháng
7. Bổ sung/chuẩn hóa `Order.status` để xác định "đã giao và đã thu" (DELIVERED, PAID, etc.)

### Phase 3 — Thưởng cuối năm
8. `CommissionScheduler.yearlyBonusCalculation()` — Job đầu năm
9. Xử lý TIER_BENEFIT, GROWTH_BONUS, ANNUAL_ACCUMULATION, LOYALTY_BONUS

### Phase 4 — Mobile & Báo cáo
10. Màn hình quản lý chính sách (Company)
11. Màn hình bảng kê hoa hồng (Agency + Company)
12. Chi tiết bảng kê + lịch sử chi trả

### Phase 5 — Nâng cao
13. Tích hợp với Debt module: chỉ ghi nhận DTT khi không có nợ quá hạn
14. Hỗ trợ cấu hình linh hoạt qua SystemConfig UI
15. Export bảng kê ra Excel/PDF
