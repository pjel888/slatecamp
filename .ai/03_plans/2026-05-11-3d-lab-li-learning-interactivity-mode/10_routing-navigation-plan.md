# 10 — Routing & Navigation Plan

## Current 3D Lab Routes

| Route | File | Purpose |
|-------|------|---------|
| `/dashboard/3d-lab` | `src/app/dashboard/3d-lab/page.tsx` | Dashboard / module browser |
| `/dashboard/3d-lab` (layout) | `src/app/dashboard/3d-lab/layout.tsx` | ExploreLayout wrapper |
| `/dashboard/3d-lab/[moduleId]` | `src/app/dashboard/3d-lab/[moduleId]/page.tsx` | Individual module viewer |
| `/dashboard/3d-lab/[moduleId]` (loading) | `src/app/dashboard/3d-lab/[moduleId]/loading.tsx` | Module loading state |

### Route Constants
```typescript
// src/lib/routes.ts
lab: {
  root: '/dashboard/3d-lab',
  module: (moduleId: string) => `/dashboard/3d-lab/${moduleId}` as const,
}
```

### Current Route Params
- `[moduleId]`: Direct module ID (e.g., `stairway-configurator`, `bp344-accessible-route-ramp`)
- Query string: `?category=BUILDING_CODE` (category drill-down)
- No mode parameter in route or query string

## Current Dashboard Link Behavior

`ModuleCard` links to `ROUTES.lab.module(module.id)`:
```typescript
<Link href={ROUTES.lab.module(module.id)} className="block h-full">
```

This resolves to `/dashboard/3d-lab/${moduleId}` regardless of mode.

## Recommended Route Structure

### Option A: No Route Change (RECOMMENDED)

Keep `/dashboard/3d-lab/[moduleId]` for both PI and LI. Mode is data-driven.

```
/dashboard/3d-lab                     → Dashboard (both PI + LI cards)
/dashboard/3d-lab/stairway-configurator  → PI module (stairway)
/dashboard/3d-lab/bp344-ramp-layers     → LI module (ramp layers)
```

**Pros**: Zero route changes, all existing links work, simple
**Cons**: URL doesn't indicate mode

### Option B: Mode in Query String

Add `?mode=learning` to LI routes.

```
/dashboard/3d-lab/bp344-ramp-layers?mode=learning
```

**Pros**: Mode visible in URL
**Cons**: Redundant with data, fragile (what if mode doesn't match?), no real benefit

### Option C: Mode in Route Path

```
/dashboard/3d-lab/pi/[moduleId]
/dashboard/3d-lab/li/[moduleId]
```

**Pros**: Clear URL distinction
**Cons**: Breaks all existing links, redirect complexity, two page files

### Recommendation: Option A

Data-driven mode resolution is:
- The simplest approach
- Zero migration cost
- Consistent with how templateType already works (no route difference between parametric/exploded/cutaway)
- Trivially changeable later if needed

## Backward Compatibility

| Concern | Resolution |
|---------|-----------|
| Existing PI module links | Work unmodified — route unchanged |
| Hardcoded PI links anywhere | Work unmodified |
| Bookmarked PI modules | Work unmodified |
| Admin/developer tools linking to modules | Work unmodified |
| E2E test routes | Work unmodified |

## How Deep Links Work

```
User visits: /dashboard/3d-lab/bp344-ramp-layers
  → [moduleId]/page.tsx
    → ModuleViewer({ modelId: 'bp344-ramp-layers' })
      → getModuleById('bp344-ramp-layers') → entry with mode: 'LI'
        → importModuleConfig('bp344-ramp-layers') → LI config
          → useTemplateContent → case 'learning' → LI shell + content
```

No special handling needed. The `moduleId` is the only identifier needed.

## How Mode Is Resolved

1. Module ID from route param
2. `getModuleById(moduleId)` → `ModuleRegistryEntry`
3. `entry.mode ?? 'PI'` → mode
4. `entry.templateType` → template type (must match mode: `'learning'` for LI)
5. Mode + templateType determines `useTemplateContent` path

## Invalid Mode / Content Handling

| Scenario | Behavior |
|----------|----------|
| `mode: 'LI'` but `templateType: 'parametric'` | Dev warning; fall back to templateType-based rendering |
| `mode: 'PI'` but `templateType: 'learning'` | Dev warning; fall back to templateType-based rendering |
| Unknown `moduleId` | `getModuleById` returns undefined → `notFound()` |
| LI config dynamic import fails | ModuleViewer shows error state with retry |

## Metadata / Title / Breadcrumb

- **Page title**: `3D Lab Module` (unchanged from current) or dynamically set to `3D Lab — ${module.title}`
- **Breadcrumb**: `3D Lab > Module Title` (same for PI and LI)
- **No mode indication in metadata** for MVP

## Navigation from Dashboard to PI/LI Item

Both card types navigate identically:
```typescript
// PI card
<Link href={ROUTES.lab.module('stairway-configurator')}>

// LI card
<Link href={ROUTES.lab.module('bp344-ramp-layers')}>
```

The `ModuleCard` component doesn't need to know the mode to create the link.

## Redirects

No redirects needed. Existing redirects preserved:
- `?model=` → `/[moduleId]` (legacy, preserved)
- `wall-configurator` → `unified-wall-configurator` (preserved)

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Route collision between PI and LI modules with same ID | Zero | Module IDs are unique across all types |
| SEO/content duplication concerns | None | Same page, different content |
| Confusion from non-descriptive URL | Low | Module slug is descriptive; mode in URL not needed for MVP |

## Navigation Plan Summary

- **No route changes** for MVP
- **All existing links work** without modification
- **Mode resolved from data**, not from URL
- **Future option**: Add mode indicator to URL if analytics/product need it (trivial migration path)
