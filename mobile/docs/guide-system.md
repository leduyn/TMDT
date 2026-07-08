# Guided Tour / Feature Discovery System

## Architecture

```
src/guide/
├── types.ts              — Type definitions
├── GuideRegistry.ts      — Static guide definition registry
├── GuideContext.tsx       — React context + state management
├── GuideProvider.tsx      — Provider + overlay orchestrator
├── GuideOverlay.tsx       — Dim + transparent hole spotlight
├── GuideHighlight.tsx     — Animated glow ring around target
├── GuideTooltip.tsx       — Tooltip card (title, desc, progress, buttons)
├── useGuide.ts            — Public hook API
├── useGuideTarget.ts      — Target registration hook
├── GuideTarget.tsx        — Target registration component
└── guides/
    ├── categoryGuide.ts   — Example: CategoryListScreen guide
    └── index.ts           — Barrel export
```

## Key Types

- **GuideDefinition**: id, version, title, steps[], condition?
- **GuideStep**: id, screen, target, title, description, placement, order, navigateTo?
- **Placement**: 'top' | 'bottom' | 'left' | 'right' | 'auto'
- **GuideCondition**: role[], minAppVersion?, predicate?

## Data Flow

```
GuideProvider wraps app
  └─ GuideContext stores: isRunning, currentStep, activeGuide, targetRefs, completedGuides
      ├─ Components register targets via useGuideTarget() or <GuideTarget>
      ├─ Screens call useGuide().start('guideId')
      └─ GuideOverlay renders: dim views → hole → highlight → tooltip
```

## Target Registration

Two approaches:
1. Hook: `const ref = useGuideTarget('categoryFab')` — assign to target's `ref`
2. Component: `<GuideTarget id="categoryFab"><FAB /></GuideTarget>` — wraps element

## Overlay (Spotlight Effect)

4 semi-transparent views positioned around the measured target create a "hole":

```
┌─────────────────────────┐
│      TOP DIM            │
├──────┬──────────┬───────┤
│ LEFT │  HOLE    │ RIGHT │
│ DIM  │ (target) │  DIM  │
├──────┴──────────┴───────┤
│     BOTTOM DIM          │
├─────────────────────────┤
│        Tooltip          │
└─────────────────────────┘
```

## Persistence

- Key: `guide.completed.{guideId}` → `{"version":N,"completedAt":timestamp}`
- If stored version < guide version → show again
- Loaded on mount; checked before starting a guide

## Navigation

Steps can define `navigateTo: { screen, params }`. When `next()` is called, if navigateTo exists, the app navigates before advancing to the next step.

## Animations

Uses React Native `Animated` API for:
- Fade in/out overlay
- Scale pulse on highlight
- Fade + slide tooltip entrance

## Reanimated Note

`react-native-reanimated` (~4.1.7) is installed but disabled in babel.config.js
due to "runtime not ready" native module issue on iOS.
Swith to RN Animated as fallback.

## Conditions

Guides can specify conditions:
- `role`: only show to specific roles (e.g. ['AGENCY'])
- `minAppVersion`: min app version
- `predicate`: custom async function

## Implementation Checklist

- [x] Plan saved to docs/
- [x] react-native-reanimated installed
- [x] src/guide/types.ts
- [x] src/guide/GuideRegistry.ts
- [x] src/guide/GuideContext.tsx
- [x] src/guide/useGuide.ts
- [x] src/guide/useGuideTarget.ts
- [x] src/guide/GuideTarget.tsx
- [x] src/guide/GuideHighlight.tsx
- [x] src/guide/GuideTooltip.tsx
- [x] src/guide/GuideOverlay.tsx
- [x] src/guide/GuideProvider.tsx
- [x] src/guide/guides/categoryGuide.ts
- [x] src/guide/guides/index.ts
- [x] App.tsx — wrap with GuideProvider
- [x] CategoryListScreen.tsx — register targets + auto-start

---

## Phase 2: Full CRUD Guide Management (Frontend)

### Backend — New Entities

| Entity | Fields |
|---|---|
| `Guide` | id, name, description, version, isActive, conditions (JSON), createdAt, updatedAt |
| `GuideTarget` | id, key, name, description, screenName, createdAt |
| `GuideStep` | id, guideId, targetId (FK), title, description, placement, order, navigateToScreen, navigateToParams (JSON) |

### Endpoints
- `GET/POST/PUT/DELETE /api/guide-targets`
- `GET/POST /api/guides`
- `GET/PUT/DELETE /api/guides/{id}`
- `POST /api/guides/{id}/steps`
- `PUT/DELETE /api/guides/{guideId}/steps/{stepId}`
- `GET /api/guides/active` (for mobile: isActive=true + full steps + targets)

### Frontend Pages
1. `/admin/guide-targets` — CRUD target keys
2. `/admin/guides` — List + toggle active
3. `/admin/guides/{id}` — Detail + step list editor
   - Step form: target dropdown, title, desc, placement, navigateTo

### Mobile Changes
- `src/api/guide.ts` — fetch from API
- GuideRegistry loads from API + AsyncStorage cache
- GuideProvider fetches on mount
- testID convention: every element with useGuideTarget should have matching testID prop
