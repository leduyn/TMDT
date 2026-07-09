# Guide Web System — Implementation Plan

## Problem
Guide overlay engine chỉ được xây cho mobile (React Native). Web frontend chỉ có admin CRUD để quản lý guides/targets, không có runtime để hiển thị guide cho người dùng web.

## Required Components (port from mobile)

| Component | Description |
|---|---|
| `GuideProvider` | Context quản lý `isRunning`, `currentStep`, `activeGuide`, target measurements |
| `GuideOverlay` | Overlay fullscreen với hiệu ứng dim + spotlight (CSS `clip-path` hoặc 4 divs) |
| `GuideTooltip` | Card nổi chứa title, mô tả, step progress, nút điều hướng |
| `GuideHighlight` | Vòng sáng pulse CSS animation quanh target |
| `GuideTarget` | Component wrapper đăng ký target element bằng ID, dùng `getBoundingClientRect()` |
| `useGuideTarget` | Hook trả về ref, đo vị trí target, lắng nghe scroll/resize |
| `GuideRegistry` | Map lưu guide definitions + converter từ API DTO |
| `useGuide` | Hook public: `startGuide(id)`, `next()`, `prev()`, `skip()`, `finish()` |

## Implementation Steps

### Step 1: Create directory structure
```
frontend/src/guide/
  GuideProvider.tsx
  GuideOverlay.tsx
  GuideTooltip.tsx
  GuideHighlight.tsx
  GuideTarget.tsx
  GuideRegistry.ts
  useGuide.ts
  useGuideTarget.ts
  types.ts
  index.ts
```

### Step 2: Types (`types.ts`)
Port từ `mobile/src/guide/types.ts`:
- `GuideDefinition`, `GuideStep`, `TargetDefinition`
- `GuideContextValue` (state + methods)
- `GuideTargetHandle` (register/unregister)

### Step 3: GuideRegistry (`GuideRegistry.ts`)
- `Map<string, GuideDefinition>`
- `register(id, definition)`, `get(id)`, `getAll()`
- `convertApiGuide(apiDTO)` — transform API response → `GuideDefinition`

### Step 4: useGuideTarget (`useGuideTarget.ts`)
- Nhận `targetId: string`
- Trả về `ref: RefObject<HTMLElement>`
- `useEffect` đo `getBoundingClientRect()` trên mount + scroll + resize
- Đăng ký target vào GuideProvider context

### Step 5: GuideTarget (`GuideTarget.tsx`)
- Wrapper component
- Render children + gán ref
- Gọi `useGuideTarget(targetId)` internally

### Step 6: GuideHighlight (`GuideHighlight.tsx`)
- Div absolute-positioned quanh target rect
- CSS animation: `@keyframes pulse-ring` (scale + opacity)

### Step 7: GuideTooltip (`GuideTooltip.tsx`)
- Floating card absolute-positioned
- Hiển thị: title, description, step `{current}/{total}`
- Nút: Previous, Next/Finish, Skip (×)
- Style: glass card, shadow, border

### Step 8: GuideOverlay (`GuideOverlay.tsx`)
- Render khi `isRunning === true`
- Dim background: 4 divs xung quanh target (top, bottom, left, right)
- Hoặc dùng CSS `clip-path: inset()` với `border-radius` để tạo lỗ spotlight
- Render `GuideHighlight` + `GuideTooltip` tại vị trí target

### Step 9: GuideProvider (`GuideProvider.tsx`)
- React Context
- State: `isRunning`, `currentStepIndex`, `activeGuideId`, `targetRects: Map<string, DOMRect>`
- Methods: `startGuide(id)`, `nextStep(navigate?)`, `previousStep()`, `skip()`, `finish()`
- `registerTarget(id, rect)`, `unregisterTarget(id)`
- Auto-đo target rect với `ResizeObserver` / `IntersectionObserver`

### Step 10: useGuide (`useGuide.ts`)
- `useContext(GuideContext)`
- Trả về public API: `startGuide`, `next`, `previous`, `skip`, `finish`, `isRunning`, `currentStep`

### Step 11: Integrate vào app
- Wrap `<GuideProvider>` trong `layout.tsx` (hoặc `DashboardLayout.tsx`)
- Render `<GuideOverlay />` trong layout
- Thêm `<GuideTarget targetId="...">` vào các page cần guide
- Gọi `startGuide(id)` từ page component (auto-start hoặc button)

## Key Technical Differences from Mobile

| Mobile (React Native) | Web (Next.js) |
|---|---|
| `measureInWindow()` | `getBoundingClientRect()` |
| `Animated.View` (native driver) | CSS `@keyframes` + `transition` |
| `Dimensions.addEventListener('change')` | `window.addEventListener('resize')` |
| 4 absolute views for dim effect | CSS `clip-path: inset()` or `box-shadow` |
| `useWindowDimensions()` | `window.innerWidth/Height` |
| `ScrollView` + `onScroll` | `window.addEventListener('scroll')` + `ResizeObserver` |

## Priority
- **High**: GuideProvider, GuideOverlay, GuideTooltip, GuideRegistry, useGuide
- **Medium**: GuideTarget, useGuideTarget, GuideHighlight
- **Low**: Integration into existing pages

## Status
⏳ Pending — chưa triển khai
