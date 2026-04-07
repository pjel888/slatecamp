# Developer Hub UX/UI Overhaul Plan

**Date:** 2026-03-25
**Status:** Ready for Execution
**Source Docs:** DeveloperHub UX.md, DEVELOPER-HUB-IMPLEMENTATION-PLAN.md, developer-hub-master-prompt.md, SLATECAMP-DEVELOPER-HUB-v2.html

---

## Objective

Overhaul the `/developer` portal to match the high-fidelity HTML prototype and UX research blueprint. Enforce the Slatecamp design system with 11px minimum text size. Verify all navigation routes map to real pages.

---

## Constraints

- **11px minimum text** — CLAUDE.md mandates `text-[11px]` as floor. All `text-[8px]`, `text-[9px]`, `text-[10px]` must become `text-[11px]`.
- **Slatecamp design system** — Colors, shadows, radii, transitions per CLAUDE.md Section 5.
- **No emoji in functional UI** — Use Lucide SVG icons only.
- **Arrow functions** — Per user feedback memory.
- **Monospace only on data** — Never on labels, categories, or metadata text.

---

## Phase 1: Portal Sidebar & Navigation (CRITICAL)

### 1A. PortalSidebar text sizes
**File:** `src/components/portal/PortalSidebar.tsx`
- Group labels: enforce `text-[11px]` (currently may use 9px)
- Nav items: enforce `text-[11px]` minimum for sub-items, `text-xs` (12px) for primary items
- Badge text: enforce `text-[11px]` minimum
- Search input: enforce `text-[11px]` minimum
- Scrollbar: 3px width, subtle thumb

### 1B. DevPortalShell nav items & route verification
**File:** `src/app/developer/_components/DevPortalShell.tsx`
- Verify every `href` maps to an existing `page.tsx` under `src/app/developer/`
- Cross-reference with componentRegistry.ts slugs
- Ensure domain group labels match: "Wiki Article", "Question & Q&A", "Review & Testing Path", "System / Shared", "Status", "Tools"

### 1C. Global text size audit
- Grep entire `src/app/developer/` and `src/components/developer/` and `src/components/portal/` for `text-[8px]`, `text-[9px]`, `text-[10px]`
- Replace all with `text-[11px]`
- Also check for `font-size: 8px`, `font-size: 9px`, `font-size: 10px` in inline styles

---

## Phase 2: Design System Token Alignment

### 2A. Color tokens
**Files:** `src/app/globals.css`, relevant component files
- Verify these CSS custom properties exist and are correct:
  - `--primary: #1B3FC4` (Camp Cobalt)
  - `--primary-light / --camp-cobalt-50: #EEF2FC`
  - `--signal-green: #1B7A3C` (or map to `--emerald`)
  - `--signal-gold: #F5A623` (or map to `--amber`)
  - `--signal-red: #E63329` (or map to `--warm-red`)
  - `--navy: #0F1F5C` (topbar)
  - `--cream / --surface-light: #F8F7F5`
  - `--warm-white: #FFFFFF` (cards)

### 2B. Typography token audit
- `font-display` → Syne 800 (headings)
- `font-sans` → Inter (body)
- `font-mono` → DM Mono (stats, code refs ONLY)
- Enforce: monospace ONLY on code snippets, data values, readiness score numbers
- Remove monospace from labels, categories, metadata text

### 2C. Shadow, radius, transition enforcement
- Cards at rest: `shadow-none`
- Cards on hover: `shadow-sm`
- Dropdowns: `shadow-md`
- Modals: `shadow-lg`
- Card radius: `rounded-md` (8px)
- Button/input radius: `rounded-sm` (6px)
- Max transition: 300ms, default 150ms ease-out

---

## Phase 3: Component Page Polish

### 3A. ComponentShowcase refinement
**File:** `src/app/developer/_components/ComponentShowcase.tsx`
- 3-tab layout: Preview | Props | Code
- Header: eyebrow (domain label) → title + status badge → description → import path (copyable)
- Tab styling: active = primary border-bottom + primary text; inactive = muted
- Match HTML prototype's visual density exactly

### 3B. PreviewArea
**File:** `src/components/developer/PreviewArea.tsx`
- Dot-grid background: `radial-gradient(circle, #e0ded8 1px, transparent 1px)` at 20px spacing
- Light/dark toggle (preview area only, not whole page)
- Centered layout, min-height 180px
- Toolbar top-right

### 3C. PropsTable
**File:** `src/app/developer/_components/PropTable.tsx`
- Name: mono, primary color, 11px
- Type: mono, muted, 11px
- Default: mono, 11px — show "—" for null
- Required: green dot + text (never color alone)
- Description: sans, secondary, 11px
- Header: 11px uppercase tracking-wide muted

### 3D. CodeBlock
**File:** `src/app/developer/_components/CodeBlock.tsx`
- Dark background (#18181B) always
- DM Mono 12px, line-height 1.6
- Line numbers in left gutter
- Copy button: top-right, "Copy" → "Copied!" for 2s
- Language badge in header

---

## Phase 4: Status Dashboard Polish

### 4A. StatusBanner
**File:** `src/components/developer/StatusBanner.tsx`
- Full-width, rounded-lg
- Green/amber/red backgrounds with text
- "All Systems Operational" with checkmark + dot + text

### 4B. StatusBadge
**File:** `src/components/developer/StatusBadge.tsx`
- 3-signal pattern: colored dot + icon + text label
- Never color alone
- Operational=green+check, Degraded=amber+warning, Outage=red+X

### 4C. KPI Cards & Service Rows
**File:** `src/components/developer/StatusKPICard.tsx`
- 4-column grid: Database, API, Auth, Storage
- DM Mono for values (tabular-nums)
- Status badge below value
- Service rows with uptime bars

### 4D. Database & Infrastructure pages
**Files:** `src/app/developer/status/database/page.tsx`, `src/app/developer/status/infrastructure/page.tsx`
- Connection pool card with progress bar
- Sortable table row counts
- Migration list with status badges
- API latency with p50/p95/p99
- Edge functions list
- Deployment card

---

## Phase 5: Route Verification & Final Polish

- Build the project (`npm run build`) to catch errors
- Navigate every sidebar link and verify it renders
- Check breadcrumbs on every page
- Verify loading.tsx skeletons exist
- Check responsive behavior (sidebar hidden on mobile)
- Final text-size audit: zero instances of sub-11px text

---

## Acceptance Criteria

- [ ] Zero instances of `text-[8px]`, `text-[9px]`, `text-[10px]` in developer portal code
- [ ] All sidebar nav links resolve to real pages
- [ ] Campfire color tokens applied consistently
- [ ] Monospace font only on code/data, never on labels
- [ ] Status indicators always use color + text + icon (never color alone)
- [ ] Cards follow shadow/radius/transition rules from CLAUDE.md
- [ ] `npm run build` passes with zero errors
- [ ] All 21 component pages accessible via sidebar navigation

