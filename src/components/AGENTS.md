<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# components

## Purpose

This directory contains all React components organized by feature domain. Components follow the Campfire design system (warm, inviting, clean) using shadcn/ui + Tailwind CSS v4 CSS variables, with strict constraints on styling (shadow depth, border radius, transition duration) and no generic gamification (confetti, badges, virtual currency).

All components are server-first (default `'use client'` only where interactivity is required) and leverage the Next.js App Router pattern.

## Subdirectories

| Directory | Purpose | Key Components |
|-----------|---------|---|
| `3d/` | Base 3D components | Three.js/R3F primitives, scene setup |
| `3d-lab/` | 3D Lab workspace (26 files) | Spatial learning: LabViewer, LabCanvas, hotspots, exploded views, cross-sections, violation visualizers |
| `admin/` | Admin panel UI (21 files + 3 subdirs) | MDX editor, question editors, asset management, SME review, unified content editor, preview modes, settings |
| `analytics/` | Analytics dashboard (18 files) | Recharts-based: readiness trajectory, memory health, pacing quadrant, stamina curves, timeline heatmaps |
| `assessment/` | Assessment/exam UI (4 files) | Exam state, progress tracking, result rendering |
| `auth/` | Authentication UI (3 files) | Login/register forms, credential input |
| `ceo/` | CEO dashboard (13 files + skeletons/) | Revenue charts, runway gauge, team table, churn risk, cohort retention, financial ledger |
| `dashboard/` | Main dashboard (28 files + heatmap/, results/) | ReadinessScore, TaxonomyHeatmap, session builders, mode cards, activity feeds, quiz renderer |
| `dev/` | Developer tools (8 files) | Dev toolbar, demo shell, feature flag board, impersonation panel, system info |
| `developer/` | Developer portal UI (8 files) | Component page layout, status banner, status KPI, uptime bar, breadcrumbs |
| `graphics/` | Graphic system (4 files + icons/, ui/) | Design tokens, SCIcon wrapper, icon map, gradients, patterns, noise filter |
| `interactive-illustrations/` | Interactive 2D learning (2D/ subdir) | SVG-based teaching illustrations, animations |
| `landing/` | Landing page (2 files) | Marketing hero, CTAs |
| `layouts/` | Layout wrappers (1 file) | Page layout structure |
| `marketing/` | Marketing pages (20 files) | Pricing, features, testimonials, value props |
| `motion/` | Framer-motion animations (2 files) | Reusable animation components |
| `notes/` | Note-taking (9 files) | TipTap editor, note shell, navigator, quick capture, templates |
| `portal/` | Portal shell (9 files) | Shared layout for admin/CEO/developer portals: topbar, sidebar, command palette, code blocks |
| `quiz/` | Quiz primitives (17 files) | Question rendering, answer input, rationale drawers, timer, confidence toggle, save indicator |
| `settings/` | User settings (1 file) | Account/preference configuration |
| `shared/` | Reusable utilities (31 files) | ThemeProvider, data-table, section-header, stat-card, taxonomy-picker, breadcrumb, empty-state, score-display |
| `sidebar/` | Sidebar navigation (13 files) | Unified v2 sidebar (52px/216px), mobile drawer, provider, constants |
| `testing/` | Testing engine (42 files, 4 subdirs) | Full testing lifecycle: setup, session, debrief, hub. Mode-specific behaviors, score bands |
| `tools/` | Standalone tools (3 subdirs) | Calculator UI, physics tools |
| `trails/` | Camp Trails (22 files) | Trail library, daily views, phase maps, catch-up, score trajectory, recommendations |
| `ui/` | shadcn/ui primitives (43 files) | button, dialog, card, tooltip, input, checkbox, badge, tabs, sheet, command, etc. |
| `wiki/` | Wiki/knowledge base (54 files + widgets/) | Article viewer, MDX rendering, sidebar, TOC, callouts, learning aids, bp344/dsgn013 widgets |

## For AI Agents

### Working In This Directory

1. **Read the feature domain first.** Before editing a component, check the sibling components in its subdirectory to understand established patterns and reused utilities.

2. **Match Campfire design rules.** All components must follow:
   - Cards: `shadow-none` at rest, `shadow-sm` on hover (never `shadow-xl`, `shadow-2xl`)
   - Border radii: `rounded-md` (8px) on cards, `rounded-sm` (6px) on buttons/inputs, `rounded-lg` (12px) on modals
   - Transitions: max 300ms, default `duration-150 ease-out` (never `duration-500+` or `bounce`/`spring`)
   - Minimum text size: 11px (`text-[11px]`). NEVER use `text-[8px]`, `text-[9px]`, `text-[10px]`.
   - Monospace: ONLY on code snippets, data values, and Readiness Score number. NEVER on labels/categories/metadata.

3. **No generic gamification.** Absolutely no confetti, badges, virtual currency, or empty streaks. Progression maps ONLY to Readiness Score, Taxonomy Heatmap, or Pacing Gauge.

4. **Server components by default.** Mark components `'use client'` ONLY if they use hooks (useState, useContext, etc.), event handlers, or client-only libraries. Most components should be server-rendereable.

5. **Import from shadcn/ui for base primitives.** Use `@/components/ui/*` for button, card, dialog, tooltip, input, etc. Do NOT create custom implementations of these.

6. **Use shared utilities.** Check `shared/` for ThemeProvider, NavigationProgress, modals, headers before creating duplicates.

7. **Arrow functions only.** All component declarations and handlers use arrow functions (`const Component = (...) => ...`), never `function` declarations.

### Common Patterns

**Type-safe props:**
```tsx
interface ComponentProps {
  label: string
  onClick?: () => void
  disabled?: boolean
}

const Component = ({ label, onClick, disabled }: ComponentProps) => {
  // Implementation
}
```

**Conditional classes with cn():**
```tsx
import { cn } from '@/lib/utils'

<div className={cn('base-class', isActive && 'active-class', disabled && 'opacity-50')}>
```

**Readiness Score coloring:**
```tsx
const getReadinessColorClass = (value: number): string => {
  if (value < 40) return 'text-[#D64545]'      // Warm Red
  if (value < 70) return 'text-[#E8853A]'      // Camp Orange
  return 'text-[#2D9F6F]'                       // Emerald
}
```

**Card styling:**
```tsx
<Card className={cn('border-border bg-white shadow-none')}>
  {/* shadow-none at rest; shadow-sm on hover applies via :hover pseudo-class */}
</Card>
```

**Quiz/dashboard components:**
- Import from `@/stores/useLabStore`, `useQuizStore`, or similar Zustand stores for state.
- Fetch session data via server actions (`'use server'`) in parent pages, pass as props.
- Never fetch inside client components; use props or context.

**3D Lab components (R3F):**
- Use `useLabStore` for camera, hotspot, and panel state.
- Import `ModuleConfig` type from `@/types/3d-lab`.
- Canvas components must be lazy-loaded with `Suspense` boundary.
- Keep geometries and materials in separate files for reusability.

## Dependencies

### Internal

| Category | Modules |
|----------|---------|
| **Stores** | `@/stores/useLabStore`, `useQuizStore`, `useDashboardStore`, `dev-store` (Zustand) |
| **Types** | `@/types/3d-lab`, `@/types/quiz`, `@/types/dashboard`, `@/types/testing`, `@/types/ceo`, `@/types/developer`, `@/types/app` |
| **Utils** | `@/lib/utils` (cn), `@/lib/color-utils`, `@/lib/format-utils` |
| **Server Actions** | `@/app/actions/*`, `@/lib/actions/*` (auth, quiz, dashboard, testing, ceo fetchers) |
| **UI Primitives** | `@/components/ui/*` (shadcn/ui base) |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | UI framework | ^19.2.4 |
| **next** | App Router, Server Components, Images | 16.1.6 |
| **@react-three/fiber** | 3D canvas abstraction | ^9.5.0 |
| **@react-three/drei** | R3F utilities (OrbitControls, Text, Html, etc.) | ^10.7.7 |
| **three** | 3D graphics engine | ^0.183.2 |
| **framer-motion** | Animations (respect prefers-reduced-motion) | ^12.35.2 |
| **recharts** | Analytics charts | ^3.8.0 |
| **@tiptap/react** | Rich text editor (notes) | ^3.20.1 |
| **@shadergradient/react** | Shader backgrounds | ^2.4.20 |
| **@supabase/supabase-js** | Database client (via Server Actions only) | ^2.98.0 |
| **zustand** | State management | ^5.0.12 |
| **tailwindcss** | CSS framework (v4 with CSS variables) | ^4.2.1 |
| **@base-ui/react** | Unstyled UI headless components | ^1.2.0 |
| **lucide-react** | Icon library (portals) | ^0.577.0 |
| **@phosphor-icons/react** | Icon library (main app, via SCIcon) | ^1.4.14 |
| **next-themes** | Theme provider (light/dark) | ^0.4.6 |
| **@radix-ui/react-toast** | Toast notifications | ^1.2.15 |
| **@anthropic-ai/sdk** | Claude AI integration (AI Tutor) | ^0.78.0 |
| **marked** | Markdown parsing | ^17.0.4 |
| **katex** | LaTeX math rendering | ^0.16.37 |
| **dompurify** | HTML sanitization | ^3.3.3 |
| **papaparse** | CSV parsing | ^5.5.3 |
| **fuse.js** | Fuzzy search (CommandPalette) | latest |

### Styling Rules (Enforced)

- **Color palette:** Use design tokens from Tailwind config (e.g., `text-[#1B3FC4]` for Camp Cobalt). NEVER use generic Tailwind colors (`text-blue-500`).
- **Shadows:** `shadow-sm` (cards hover), `shadow-md` (dropdowns), `shadow-lg` (modals). FORBIDDEN: `shadow-xl`, `shadow-2xl` on non-modal elements.
- **Typography:** Use `text-[11px]` minimum. Monospace ONLY on code/numbers.
- **Transitions:** Max 300ms, default `duration-150 ease-out`.
- **Respect motion:** All decorative animations must respect `prefers-reduced-motion: reduce`.

<!-- MANUAL: -->
