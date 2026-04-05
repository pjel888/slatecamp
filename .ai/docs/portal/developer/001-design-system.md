# Design System Catalog

**Analysis Date:** 2026-04-06

## Overview

Live design system catalog at `/developer/design-system/` with component previews organized by domain. Each category has a dynamic `[component]` route for individual component documentation.

**Source:** `src/app/developer/design-system/`, `src/app/developer/_components/`

## Categories

| Category | Route Pattern | Contents |
|----------|-------------|----------|
| content-blocks | `/developer/design-system/content-blocks/[component]` | Article layouts, callouts, tables, figures |
| questions | `/developer/design-system/questions/[component]` | Quiz question stem, options, rationale |
| shared | `/developer/design-system/shared/[component]` | Button, Card, Badge, Input, Dialog, etc. |
| testing-path | `/developer/design-system/testing-path/[component]` | Mode cards, session setup, debrief |
| widgets | `/developer/design-system/widgets/[component]` | Calculators, 3D controls, special widgets |
| wiki | `/developer/design-system/wiki/[component]` | Article viewer, TOC, search, callouts |

**Source:** `src/app/developer/design-system/`

## Preview Data

Preview configurations exported from `_previews.tsx` or `_widget-previews.tsx` files in each category directory. Each preview defines:
- Component name
- Prop variants to showcase
- Code example
- Usage guidelines

**Source:** `src/app/developer/design-system/*/_previews.tsx`

## Component Showcase

`ComponentShowcase.tsx` (84K) renders the full component library:
- Search across all components
- Filter by category
- Live preview panel
- Code snippet with copy button
- Prop documentation

**Source:** `src/app/developer/_components/ComponentShowcase.tsx`

## Component Registry

`@/lib/developer/componentRegistry.ts`:
```typescript
getAllComponents() // Returns full catalog with counts and metadata
getComponentsByCategory(category) // Filtered list
getComponentMeta(name) // Individual component details
```

**Source:** `src/lib/developer/componentRegistry.ts`

## Campfire Design Tokens

Referenced from `src/app/globals.css` (Tailwind CSS 4 CSS variables):

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#1B3FC4` | Primary actions, nav, links |
| `--color-success` | `#2D9F6F` | Success, mastery, correct |
| `--color-destructive` | `#D64545` | Error, critical |
| `--color-warning` | `#D4951A` | Warning, developing skill |
| `--color-orange` | `#E8853A` | Progress celebration |
| `--color-background` | `#F8F7F5` | Page background |
| `--color-foreground` | `#1A2332` | Main text |

**Source:** `src/app/globals.css` (lines 1–200)

---

*Design system catalog: 2026-04-06*
