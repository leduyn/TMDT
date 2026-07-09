# Hướng dẫn sử dụng hệ thống Guide (Guided Tour)

## Giới thiệu

Hệ thống Guide cho phép tạo các luồng hướng dẫn từng bước (spotlight + tooltip) trên ứng dụng mobile, quản lý hoàn toàn từ web admin.

## Kiến trúc

```
Web Admin                    Backend                    Mobile App
  ├─ Quản lý Target          ├─ GuideTarget              ├─ GuideProvider
  ├─ Quản lý Guide           ├─ Guide                    ├─ GuideOverlay
  └─ Quản lý Step            ├─ GuideStep                ├─ GuideTarget
                                                         └─ GuideRegistry
```

## I. Quản lý trên Web Admin

### 1. Guide Targets (`/admin/guide-targets`)

**Mục đích:** Định nghĩa các vị trí (component) trên màn hình mobile có thể được highlight.

**Các trường dữ liệu:**

| Trường | Bắt buộc | Mô tả | Ví dụ |
|---|---|---|---|
| `key` | ✓ | Định danh duy nhất của target | `category-fab` |
| `name` | ✓ | Tên hiển thị | "FAB Thêm danh mục" |
| `screenName` | ✓ | Tên màn hình chứa target | `CategoryList` |
| `description` | | Mô tả ngắn về vị trí này | "Nút floating action button" |

**Cách tạo:**
1. Vào menu **Guide Targets** (sidebar)
2. Bấm **"Thêm target"**
3. Điền key, name, screenName, description
4. Bấm **"Tạo mới"**

> **Quy tắc đặt key:** Viết thường, dùng dấu gạch ngang, phản ánh đúng vị trí. VD: `product-item`, `cart-fab`, `order-submit`.

### 2. Guides (`/admin/guides`)

**Mục đích:** Tạo một luồng hướng dẫn gồm nhiều bước.

**Danh sách Guide hiển thị:**
- Tên + version
- Mô tả
- Số bước (steps)
- Trạng thái (Đang hoạt động / Tạm ẩn)
- Thao tác: Sửa, Bật/tắt, Xóa

### 3. Chi tiết Guide (`/admin/guides/[id]`)

#### 3.1. Thông tin Guide

| Trường | Bắt buộc | Mô tả |
|---|---|---|
| `name` | ✓ | Tên guide, hiển thị trên mobile |
| `version` | | Version guide (dùng để check đã xem hay chưa) |
| `description` | | Mô tả guide |
| `conditions` | | JSON điều kiện hiển thị (VD: `{"role": ["AGENCY"]}`) |
| `isActive` | | Bật/tắt guide |

**Conditions (JSON) hỗ trợ:**

```json
// Chỉ hiển thị cho role AGENCY
{"role": ["AGENCY"]}

// Chỉ hiển thị cho COMPANY
{"role": ["COMPANY"]}

// Hiển thị cho cả AGENCY và COMPANY
{"role": ["AGENCY", "COMPANY"]}
```

#### 3.2. Quản lý Steps

**Các trường của Step:**

| Trường | Bắt buộc | Mô tả |
|---|---|---|
| `target` | ✓ | Chọn Guide Target đã tạo |
| `title` | ✓ | Tiêu đề bước (hiển thị trong tooltip) |
| `description` | | Mô tả chi tiết (hiển thị trong tooltip) |
| `placement` | ✓ | Vị trí tooltip: `top`, `bottom`, `left`, `right`, `center` |
| `stepOrder` | ✓ | Thứ tự bước |
| `navigateToScreen` | | Chuyển sang màn hình khác khi đến bước này |
| `navigateToParams` | | Tham số JSON khi chuyển màn hình |

**Thao tác:**
- **Thêm bước:** Bấm "Thêm bước" → điền form → bấm "Thêm"
- **Sửa bước:** Bấm icon Sửa (cạnh bước) → sửa → bấm "Cập nhật"
- **Xóa bước:** Bấm icon Xóa
- **Sắp xếp:** Dùng nút mũi tên lên/xuống để đổi thứ tự

## II. Tích hợp trên Mobile

### 1. Sử dụng GuideTarget wrapper (khuyên dùng)

Wrap component cần highlight bằng `<GuideTarget>`:

```tsx
import { GuideTarget } from '../../guide/GuideTarget';

function ProductListScreen() {
  return (
    <>
      {/* Single component */}
      <GuideTarget id="cart-fab">
        <TouchableOpacity onPress={goToCart}>
          <Ionicons name="cart" size={24} color="white" />
        </TouchableOpacity>
      </GuideTarget>

      {/* Repeated component (FlatList) */}
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <GuideTarget id="product-item">
            <ProductCard product={item} />
          </GuideTarget>
        )}
      />
    </>
  );
}
```

> `GuideTarget` tự động thêm `collapsable={false}` — **không cần** nhớ thêm thủ công.

### 2. Sử dụng useGuideTarget hook (khi cần kiểm soát ref)

Dùng khi component đã có sẵn ref và không thể wrap:

```tsx
import { useGuideTarget } from '../../guide/useGuideTarget';

function MyScreen() {
  const myRef = useGuideTarget('category-fab');

  return <TouchableOpacity ref={myRef} collapsable={false}>...</TouchableOpacity>;
}
```

> **Bắt buộc** thêm `collapsable={false}` khi dùng hook — nếu không Android sẽ không đo được vị trí.

### 3. Kích hoạt Guide

```tsx
import { useGuide } from '../../guide/useGuide';

function MyScreen() {
  const { startGuide } = useGuide();

  // Gọi khi nhấn nút "?" hoặc auto-start
  const handleHelp = () => {
    startGuide('1');  // ID của guide trong DB
  };
}
```

Guide chỉ chạy nếu:
- User có role phù hợp (kiểm tra `conditions.role`)
- Guide đang active (`isActive = true`)
- User chưa hoàn thành guide này (kiểm tra AsyncStorage)

## III. Luồng hoạt động

```
1. Web Admin tạo Target + Guide + Step
       │
2. Mobile gọi GET /api/guides/active → nhận danh sách guide
       │
3. GuideRegistry convert API DTO → GuideDefinition
       │
4. User bấm "?" hoặc auto-start → startGuide(id)
       │
5. GuideProvider tìm guide trong registry, kiểm tra điều kiện
       │
6. GuideOverlay render: dim background + spotlight + tooltip
       │
7. User tương tác: Next / Previous / Skip / Finish
       │
8. Khi hoàn thành → lưu CompletedGuide vào AsyncStorage
```

## IV. Xử lý các trường hợp đặc biệt

### Component được render nhiều lần (VD: danh sách sản phẩm)

Hệ thống tự động hỗ trợ — dùng cùng key cho tất cả instance:

```tsx
{products.map(p => (
  <GuideTarget id="product-item" key={p.id}>
    <ProductCard product={p} />
  </GuideTarget>
))}
```

Khi đo, hệ thống duyệt qua tất cả instance và spotlight cái đầu tiên visible.

### Chuyển màn hình giữa các bước

Step có thể cấu hình `navigateToScreen` + `navigateToParams`. Khi user bấm Next, app tự động điều hướng sang màn hình đích, đợi render xong rồi đo target.

### Guide hoàn thành

Khi user hoàn thành guide (bước cuối → Finish) hoặc bấm Skip, thông tin được lưu vào AsyncStorage với key `guide.completed.{guideId}`. Lần sau guide sẽ không tự động chạy nếu version không thay đổi.

## V. Troubleshooting

| Vấn đề | Nguyên nhân | Cách fix |
|---|---|---|
| Spotlight không hiện | Thiếu `collapsable={false}` | Thêm vào component ref |
| Guide không start | Role không khớp / Chưa active | Kiểm tra conditions + isActive |
| Button "Thêm bước" không phản hồi | Bug cũ `openAddStepForm` | Dùng phiên bản mới nhất |
| Tooltip sai vị trí | Placement không phù hợp | Thử `top`, `bottom`, `left`, `right` |
| API trả lỗi 404 | Backend chưa chạy / Sai endpoint | Kiểm tra backend log |

## VI. File cấu trúc

### Backend
```
backend/.../guide/
  entity/Guide.java, GuideTarget.java, GuideStep.java
  repository/GuideRepository.java, GuideTargetRepository.java, GuideStepRepository.java
  dto/GuideDTO.java, GuideTargetDTO.java, GuideStepDTO.java, CreateGuideRequest.java, ...
  service/GuideService.java, GuideTargetService.java, GuideSeeder.java
  controller/GuideController.java, GuideTargetController.java
```

### Frontend (Web Admin)
```
frontend/src/modules/guide/
  guideApi.ts, guideTargetApi.ts

frontend/src/app/admin/
  guide-targets/page.tsx
  guides/page.tsx
  guides/[id]/page.tsx
```

### Mobile
```
mobile/src/
  guide/
    types.ts — Định nghĩa kiểu dữ liệu
    GuideRegistry.ts — Đăng ký + chuyển đổi guide từ API
    GuideProvider.tsx — Context provider, quản lý trạng thái
    GuideOverlay.tsx — Overlay dim + spotlight + tooltip
    GuideTooltip.tsx — Card tooltip với nút điều khiển
    GuideHighlight.tsx — Hiệu ứng pulse quanh target
    GuideTarget.tsx — Wrapper component gắn target
    useGuide.ts — Hook public (startGuide, next, prev, skip, finish)
    useGuideTarget.ts — Hook gắn target vào component
  api/
    guide.ts — API client gọi backend
```
