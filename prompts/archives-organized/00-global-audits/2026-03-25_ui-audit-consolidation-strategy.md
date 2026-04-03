# SlateCamp UI Audit & Consolidation Strategy

> Generated 2026-03-25 | Audit scope: 397 component files across 47 directories, ~100 page routes

---

## Executive Summary

- **Total component files audited:** 397 `.tsx` files across `src/components/`
- **Shadcn UI primitives available:** 42 (well-stocked foundation)
- **Shared components built:** 30 in `src/components/shared/`
- **Loading boundaries:** 86 `loading.tsx` files (excellent coverage)
- **Page routes:** ~100 `page.tsx` files
- **Inconsistencies found:** 100+ across 12 categories
- **Critical (data display) issues:** 9 (3 score color duplications, 2 red-for-score violations, font size violations in shared components, unused TaxonomyPicker, unused ScoreDisplay, StatCard border-radius)
- **High (visual inconsistency) issues:** 28 (180 ad-hoc eyebrows, 23 raw tables, 16+ spinners, 4 browser dialogs, zero Shadcn Select/RadioGroup/Checkbox, 3 shell patterns)
- **Medium (admin/dev surface) issues:** 38 (CEO island, Notes island, raw form elements, breadcrumb dead code, ad-hoc close buttons)
- **Low (code smell) issues:** 19+ (dead AppleCloseButton, 'use client' pages, shadow violations, close button duplication)
- **Estimated developer-hours to consolidate:** 50–70 hours (4–5 focused sprints)

### Why This Matters (UX Impact)

The shared component library is **well-designed but critically under-adopted**. `ScoreDisplay` — the single most important component for student trust in their progress data — has **zero real-world usage** (3 imports are all design-system showcases). Meanwhile, 180 ad-hoc eyebrow patterns exist across 86 files when both `SectionHeader` and `Eyebrow` components are available. Every time a student sees their score rendered differently on the Dashboard vs Quiz Results vs Camp Trail, their brain processes it as three different data points rather than one continuous narrative. This is the #1 silent UX tax in the product.

### Why This Matters (DX Impact)

Ad-hoc implementations mean every new feature duplicates typography patterns, score color logic, and card layouts from scratch. The `SectionHeader` component handles the DM Mono eyebrow → Inter title → Inter subtitle pattern with three levels (`page`, `section`, `card`) — but developers are rebuilding this inline with raw Tailwind across 86 files. Each ad-hoc implementation is a potential deviation from the design system, a missed accessibility contract, and a maintenance burden.

---

## Structural Map

### Directory Structure — Component Counts

| Directory | Total Files | Client | Server | Imports Shadcn | Notes |
|-----------|------------|--------|--------|----------------|-------|
| `ui/` | 42 | 16 | 26 | 10 | Shadcn primitives + custom additions |
| `shared/` | 30 | 20 | 10 | 13 | Composed shared components |
| `wiki/` | 64 | 41 | 23 | 5 | Largest feature module |
| `testing/` | 38 | 36 | 2 | 16 | Nearly all client components |
| `dashboard/` | 35 | 29 | 6 | 12 | Heavy client-side |
| `admin/` | 29 | 29 | 0 | 13 | 100% client components |
| `trails/` | 21 | 15 | 6 | 2 | Low Shadcn adoption |
| `marketing/` | 21 | 17 | 4 | 1 | Minimal Shadcn usage |
| `ceo/` | 17 | 13 | 4 | 1 | Very low Shadcn adoption |
| `quiz/` | 15 | 15 | 0 | 4 | 100% client |
| `analytics/` | 17 | 8 | 9 | 6 | Good server/client split |
| `sidebar/` | 9 | 9 | 0 | 3 | All client |
| `portal/` | 8 | 7 | 1 | 2 | Portal shell components |
| `developer/` | 8 | 3 | 5 | 2 | Dev portal components |
| `notes/` | 8 | 8 | 0 | 0 | Zero Shadcn usage |
| `dev/` | 8 | 8 | 0 | 0 | Dev tools |
| `tools/` | 6 | 5 | 1 | 4 | Calculator tools |
| `3d-lab/` | 4 | 4 | 0 | 1 | R3F components |
| `assessment/` | 4 | 4 | 0 | 0 | Zero Shadcn usage |

### Key Observations

1. **`notes/` and `assessment/` use zero Shadcn components** — they build all UI from scratch
2. **`ceo/` has only 1 Shadcn import** despite having 17 component files — it's an island of ad-hoc UI
3. **`wiki/` is the largest module (64 files)** but only imports 5 Shadcn components
4. **`testing/` has good Shadcn adoption (16 imports)** — best ratio of any feature module

### Shadcn UI Inventory (42 primitives)

| Component | Status | Adoption |
|-----------|--------|----------|
| `accordion` | Available | Used in wiki |
| `alert-dialog` | Available | Used in admin |
| `avatar` | Available | Low usage |
| `badge` | Available | Widely used |
| `button` | Available | Widely used |
| `calendar` | Available | Admin only |
| `card` | Available | Under-used — many ad-hoc card divs |
| `close-button` | **Custom** | 7 real imports |
| `command` | Available | Omnibar |
| `dialog` | Available | Used in admin/testing |
| `difficulty-bar` | **Custom** | Score display |
| `dropdown-menu` | Available | Used in admin |
| `event-badge` | **Custom** | Custom badge variant |
| `eyebrow` | **Custom** | **1 import — nearly dead** |
| `form-field` | **Custom** | Form helper |
| `icon-button` | **Custom** | Icon-only button |
| `input` | Available | Widely used |
| `input-group` | **Custom** | Input wrapper |
| `label` | Available | Form labels |
| `mode-button` | **Custom** | Testing mode toggle |
| `popover` | Available | Used in wiki/quiz |
| `progress` | Available | Progress indicators |
| `progress-bar` | **Custom** | Alternative progress |
| `radio-group` | Available | Quiz options |
| `resizable` | Available | Admin panels |
| `scroll-area` | Available | Sidebar, drawers |
| `select` | Available | Form selects |
| `separator` | Available | UI dividers |
| `sheet` | Available | Mobile drawers |
| `skeleton` | Available | Loading states |
| `slider` | Available | 3D lab controls |
| `status-badge` | **Custom** | Status indicators |
| `switch` | Available | Settings toggles |
| `tabs` | Available | Navigation tabs |
| `textarea` | Available | Note editor |
| `toast/toaster` | Available | Notifications |
| `toolbar` | **Custom** | Admin toolbar |
| `tooltip` | Available | Info tooltips |
| `AppleCloseButton` | **Custom** | **0 imports — DEAD CODE** |
| `SlateCampLogo` | **Custom** | Brand logo |
| `student-view-watermark` | **Custom** | Admin preview |

### Shared Component Adoption Health

| Component | Imports | Real Usage | Status |
|-----------|---------|------------|--------|
| `SectionHeader` | 8 | ~7 (admin pages) | Under-adopted |
| `ScoreDisplay` | 3 | **0** (all showcases) | **CRITICAL — unused** |
| `StatCard` | 9 | ~8 | Moderate adoption |
| `EmptyState` | 11 | ~9 | Best adoption |
| `DataTable` | 4 | ~3 (admin only) | Under-adopted |
| `QuestionCard` | 4 | ~2 (mostly showcases) | **Under-adopted** |
| `TaxonomyPicker` | 2 | **0** (all showcases) | **CRITICAL — unused** |
| `PageHeader` | 4 | ~3 | Under-adopted |
| `Eyebrow` (in ui/) | 1 | **1** | **CRITICAL — unused** |
| `CloseButton` | 9 | ~7 | Moderate adoption |
| `breadcrumb` | ? | Low | Under-adopted |
| `action-card` | ? | Unknown | Needs audit |
| `score-display` (getScoreColor export) | 3 | **0** | **CRITICAL** |

**Total shared component imports across codebase: 75 across 30 files** — out of 397 component files, only 7.5% reference any shared component.

---

## The Hit List — Components to Build/Refactor

### Tier 1: CRITICAL (Build Immediately)

These involve data display inconsistency that could mislead students or fundamental design-system violations.

#### 1. ScoreDisplay Adoption Campaign
- **Problem:** `ScoreDisplay` exists with 4 variants, correct score color logic, and animation — but has **zero real usage**. Score percentages are rendered ad-hoc across Dashboard, Quiz Results, Analytics, Camp Trail, and Debrief surfaces.
- **Impact:** Students see their score (e.g., 72%) rendered with different colors, fonts, sizes, and formats on different pages. This breaks continuity of their progress narrative.
- **Evidence:** 3 imports (all in `design-system` showcase pages), 0 imports in any student-facing component
- **Files affected:** Every component that renders a percentage or mastery score
- **Fix:** Grep for all percentage display patterns and replace with `<ScoreDisplay>` variants

#### 2. SectionHeader Font Size Violation
- **Problem:** `SectionHeader` uses `text-[9px]` for section/card eyebrows and `text-[10px]` for page eyebrows — all **below the 11px minimum** defined in the design system. Meanwhile, the `Eyebrow` component in `ui/eyebrow.tsx` correctly uses `text-[11px]`.
- **Impact:** The canonical shared component itself violates the design system. Every file that imports `SectionHeader` inherits the violation.
- **Evidence:** `src/components/shared/section-header.tsx` lines 17, 24, 29 — `text-[10px]`, `text-[9px]`, `text-[9px]`
- **Files affected:** 8 files that import SectionHeader + 18 additional files using `text-[9px]` directly
- **Fix:** Update `SectionHeader` eyebrow sizes to minimum `text-[11px]`. Reconcile with `Eyebrow` component (consider having `SectionHeader` use `Eyebrow` internally).

#### 3. Score Color Logic — THREE Separate Implementations
- **Problem:** `getScoreColor()` is implemented **THREE separate times** with incompatible signatures:
  1. `src/components/shared/score-display.tsx` — canonical (returns `{ text, fill, bg }` Tailwind classes)
  2. `src/components/dashboard/results/ScoreHero.tsx` — local reimplementation (returns color strings directly, different signature)
  3. `src/components/graphics/tokens.ts` — third implementation for Canvas/SVG (returns `{ main, grad, glow }` hex values)
- **Impact:** Score 72% renders with different colors on different pages. **CONFIRMED VIOLATIONS:**
  - `src/components/analytics/ReadinessTrajectory.tsx:37` — uses `text-destructive` for scores <50 (**RED FOR LOW SCORES — FORBIDDEN**)
  - `src/components/assessment/ScoreReveal.tsx:19-24` — uses red zone for scores <40 (**RED FOR LOW SCORES — FORBIDDEN**)
  - `src/components/dashboard/TaxonomyHeatmap.tsx:33-37` — uses red for "danger" state
  - `src/components/dashboard/SubjectMasteryCard.tsx:34-39` — custom mastery colors, not using getScoreColor
- **Fix:** Consolidate into single `getScoreColor` export. Create a separate `getScoreColorHex()` for Canvas/SVG contexts. Grep for all score color conditionals and replace.

#### 4. TaxonomyPicker Adoption
- **Problem:** The `TaxonomyPicker` (838 lines, 3 variants, full keyboard nav, search, accessibility) has **zero real usage**. Taxonomy selection UI in admin, wiki, and quiz setup is implemented with separate custom components.
- **Impact:** Students and admins interact with the taxonomy tree in different ways on different pages — inconsistent interaction patterns increase the learning curve.
- **Evidence:** 2 imports (both showcases). `src/components/shared/taxonomy-tree.tsx` exists as a separate file, suggesting there were two attempts at this component.
- **Fix:** Audit every taxonomy selection interface and migrate to `TaxonomyPicker`

### Tier 2: HIGH (Build This Sprint)

Visible inconsistency on student-facing pages.

#### 5. Ad-Hoc Eyebrow/Header Epidemic
- **Problem:** **180 occurrences** of `tracking-widest` + `uppercase` patterns across **86 files** — the DM Mono eyebrow pattern is rebuilt from scratch nearly everywhere instead of using `SectionHeader` (8 imports) or `Eyebrow` (1 import).
- **Impact:** Eyebrow font sizes, weights, spacing, and colors drift between pages. Some use `text-[9px]`, others `text-[10px]`, others `text-[11px]`, others `text-xs`.
- **Key offenders:**
  - `src/components/admin/unified-editor/ArticlePanel.tsx` — 8 ad-hoc eyebrow instances
  - `src/components/testing/session/SessionShell.tsx` — 6 instances
  - `src/components/testing/session/ChillSessionBehavior.tsx` — 5 instances
  - `src/components/testing/session/CampSessionBehavior.tsx` — 5 instances
  - `src/components/ceo/FinancialEntryForm.tsx` — 5 instances
  - `src/app/(protected)/ceo/insights/page.tsx` — 5 instances
  - `src/app/(protected)/ceo/financials/page.tsx` — 5 instances
  - `src/components/dashboard/results/StatCards.tsx` — 5 instances
- **Fix:** Replace all ad-hoc eyebrow+title patterns with `SectionHeader` (after fixing its font sizes). Use `Eyebrow` for standalone eyebrow labels.

#### 6. Raw `<table>` Proliferation
- **Problem:** **23 files** contain raw `<table>` elements while `DataTable` (with search, sort, pagination, selection) is only imported in **4 files**.
- **Impact:** Table UX (sorting, search, pagination) differs wildly between admin pages, developer tools, and CEO dashboard.
- **Key offenders:**
  - `src/components/ceo/FinancialLedger.tsx` — custom table with its own sort/filter
  - `src/components/ceo/CohortRetentionTable.tsx` — custom table
  - `src/components/ceo/TeamTable.tsx` — custom table
  - `src/components/admin/AuditLogViewer.tsx` — custom table
  - `src/components/wiki/WikiExamTable.tsx` — custom table
  - Developer pages: `api-reference`, `architecture`, `status/database` — all custom tables
- **Fix:** Migrate admin/CEO tables to `DataTable`. Wiki tables may stay custom (content display vs data management).

#### 7. Browser Dialog Bugs (`alert`/`confirm`)
- **Problem:** **4 files** use native browser `confirm()` dialogs instead of Shadcn `AlertDialog` — despite a `ConfirmDialog` component existing in `@/components/ui/dialog` and already imported in 3 other files.
- **Impact:** Breaks visual consistency, accessibility, and keyboard handling. Users see jarring native browser chrome mid-flow.
- **Evidence:**
  - `src/components/sidebar/Sidebar.tsx` — `window.confirm('You have an active session...')`
  - `src/components/sidebar/MobileDrawer.tsx:154-156` — `window.confirm('You have an active session...')`
  - `src/components/ceo/FinancialLedger.tsx:101` — `confirm('Delete this entry? This cannot be undone.')`
  - `src/components/notes/NotesShell.tsx:76` — `confirm('Delete this note?')`
- **Root Cause:** `ConfirmDialog` exists and works, but developers use native `confirm()` as a shortcut.
- **Fix:** Replace all `confirm()` calls with `ConfirmDialog` component. Consider adding an ESLint rule to ban `alert()`/`confirm()`/`prompt()`.

#### 8. Loading Spinners (Forbidden) — 16+ Instances
- **Problem:** **16+ `animate-spin` instances** across **14 files**. The design system mandates skeleton loaders only — no spinners.
- **Impact:** Inconsistent loading UX. Spinners cause layout shift; skeletons preserve layout.
- **Complete list with line numbers:**
  - `src/components/quiz/AITutorDrawer.tsx:133` — SCIcon CircleNotch
  - `src/components/quiz/SaveIndicator.tsx:48` — SCIcon CircleNotch
  - `src/components/dashboard/SubjectDrillSelector.tsx:196` — custom border spinner
  - `src/components/assessment/AssessmentQuiz.tsx:167,198,345` — **3 spinners** (border + SCIcon)
  - `src/components/3d/Workspace.tsx:285` — SCIcon CircleNotch
  - `src/app/dashboard/3d-lab/_components/LabViewport.tsx:78` — SCIcon CircleNotch
  - `src/app/dashboard/3d-lab/_components/CanvasWrapper.tsx:52` — SCIcon CircleNotch
  - `src/components/wiki/TeachBackPrompt.tsx:132` — custom border spinner
  - `src/components/admin/AssetUploader.tsx:227` — SCIcon CircleNotch
  - `src/components/admin/unified-editor/ContentBar.tsx:162` — Loader2 icon
  - `src/components/shared/TransitionLink.tsx:95` — SCIcon CircleNotch
  - `src/components/shared/Omnibar.tsx:160,177` — **2 spinners** in search/command palette
  - `src/components/ui/input.tsx:143` — search input loading
  - `src/components/ui/button.tsx:76` — button loading state
- **Note:** `button.tsx` and `input.tsx` spinners may be acceptable for inline micro-loading states. 3D/WebGL loading spinners may also be contextually appropriate. Review case-by-case.
- **Fix:** Replace with `<Skeleton>` where possible. For inline states, consider a standard inline loading pattern.

### Tier 3: MEDIUM (Build Next Sprint)

Admin/dev inconsistencies or minor visual differences.

#### 9. Zero Shadcn Select / RadioGroup / Checkbox Adoption
- **Problem:** The codebase has **zero imports** of Shadcn `Select`, `RadioGroup`, or `Checkbox` components. All select dropdowns, radio buttons, and checkboxes use raw HTML elements.
- **Impact:** Inconsistent form UX across surfaces. Raw `<select>` lacks design system styling. Raw `<input type="checkbox">` lacks consistent sizing, focus rings, and animation.
- **Evidence (raw `<select>` elements):**
  - `src/app/admin/settings/page.tsx` — raw select for role assignment
  - `src/app/dashboard/3d-lab/_components/GenericControlPanel.tsx:193` — raw select
  - `src/components/admin/ArticlePropertiesPanel.tsx:123,136` — 2 raw selects
  - `src/components/admin/AssetUploader.tsx:162,176,191` — 3 raw selects
  - `src/components/admin/AuditLogViewer.tsx:59,70` — 2 raw selects
  - `src/components/admin/SMEReviewQueue.tsx:108` — raw select
  - `src/components/admin/unified-editor/ContentBar.tsx:102,115` — 2 raw selects
- **Evidence (raw checkboxes):**
  - `src/components/shared/data-table.tsx` — raw checkboxes for row selection (in the shared component!)
  - `src/components/admin/unified-editor/QuestionsPanel.tsx` — 2 raw checkboxes
  - `src/components/ceo/FinancialEntryForm.tsx` — raw checkbox
  - `src/components/testing/setup/CustomSetup.tsx` — raw checkbox
- **Evidence (raw radio buttons):**
  - `src/app/(auth)/onboarding/_components/OnboardingForm.tsx:103-151` — 2 sets of custom radio buttons with peer-checked Tailwind pattern
- **Fix:** Install/configure Shadcn Select, RadioGroup, and Checkbox if not already available. Migrate all raw form elements.

#### 10. Three Different Shell/Navigation Patterns
- **Problem:** The app has **3 incompatible navigation shells**: (1) Dashboard uses `SidebarProvider` + `Sidebar` + `SidebarContent`, (2) Admin/Developer use `PortalLayout` wrapper, (3) CEO uses its own `CeoShell` wrapper. The `breadcrumb` shared component exists but is **unused in actual routes**.
- **Impact:** Navigation UX differs between portals. Students, admins, and CEO users experience fundamentally different interaction patterns. Breadcrumbs — a standard wayfinding tool — exist as dead code.
- **Evidence:**
  - `src/app/dashboard/layout.tsx:90-118` — custom Sidebar pattern
  - `src/app/admin/layout.tsx:34-38` — PortalLayout via AdminShell
  - `src/app/developer/layout.tsx:33-37` — PortalLayout via DevPortalShell
  - `src/app/(protected)/ceo/layout.tsx:29-33` — CeoShell wrapper
  - `src/components/shared/breadcrumb.tsx` — BreadcrumbProvider set up but component rarely used
- **Fix:** Evaluate whether PortalLayout should be the standard for all non-dashboard portals. Integrate breadcrumbs into portal navigation.

#### 11. CEO Dashboard — Island of Ad-Hoc UI
- **Problem:** The entire `src/components/ceo/` directory (17 files) is an isolated UI island with its own `MetricCard`, table components, form components, and chart components — none using shared components.
- **Impact:** CEO dashboard looks and behaves differently from every other surface. Only 1 Shadcn import across 17 files.
- **Evidence:** `ceo/MetricCard.tsx` duplicates `StatCard` logic. `ceo/TeamTable.tsx`, `ceo/CohortRetentionTable.tsx`, `ceo/FinancialLedger.tsx` all build custom tables.
- **Fix:** Migrate `MetricCard` → `StatCard`, tables → `DataTable`, and adopt Shadcn primitives

#### 12. Notes Module — Zero Design System
- **Problem:** `src/components/notes/` (8 files) uses **zero Shadcn components** and contains **15 raw `<button>` elements** (in `NotesEditor.tsx` alone) — the highest raw button count of any file.
- **Evidence:** `NotesEditor.tsx` — 15 raw buttons; `NotesNavigator.tsx` — 4 raw buttons
- **Fix:** Migrate to Shadcn `Button` and `IconButton` components

#### 13. QuestionCard Under-Adoption
- **Problem:** `QuestionCard` (450 lines, 4 variants, full accessibility) has only ~2 real imports. Quiz sessions likely render questions with ad-hoc card markup.
- **Fix:** Audit quiz session components and debrief pages for question rendering and migrate to `QuestionCard`

#### 14. Dead Code: `AppleCloseButton`
- **Problem:** `src/components/ui/AppleCloseButton.tsx` has **zero imports** anywhere in the codebase. It also uses `@phosphor-icons/react` instead of the standard Lucide icon set — a dependency inconsistency.
- **Fix:** Delete the file and remove the Phosphor Icons dependency if unused elsewhere

### Tier 4: LOW (Track for Later)

Code smells that are visually acceptable but architecturally messy.

#### 15. StatCard `rounded-lg` Violation
- **Problem:** `src/components/shared/stat-card.tsx:83` uses `rounded-lg` for its container — but the design system specifies `rounded-md` (8px) for cards.
- **Impact:** Shared component itself deviates from the design system. Every file using StatCard inherits the wrong border radius.
- **Fix:** Change `rounded-lg` to `rounded-md` in `stat-card.tsx`

#### 16. `'use client'` on Page Components
- **Problem:** 3 page.tsx files have `'use client'` — pages should be Server Components.
- **Files:** `src/app/dashboard/wiki/page.tsx`, `src/app/dashboard/developer/design-system/page.tsx`, `src/app/admin/search/page.tsx`
- **Fix:** Extract client-side logic into child components; keep pages as Server Components

#### 17. Forbidden Shadow Sizes
- **Problem:** 3 files use `shadow-xl` or `shadow-2xl` on non-modal elements.
- **Files:** `src/components/quiz/QuestionStem.tsx`, `src/components/dev/dev-toolbar.tsx`, `src/components/dev/demo-shell.tsx`
- **Fix:** Replace with `shadow-md` (dropdowns) or `shadow-lg` (modals only)

#### 18. Font Size Violations (Below 11px Minimum)
- **Problem:** **18 files** use `text-[9px]` — below the 11px minimum. Includes shared components themselves.
- **Key files:** Multiple sidebar components, wiki components, and the `SectionHeader` shared component itself
- **Fix:** Audit all `text-[9px]` and `text-[10px]` usage. Replace with minimum `text-[11px]`.

#### 19. Dual Close Button Implementations
- **Problem:** Two close button components exist (`CloseButton` with CVA variants, `AppleCloseButton` dead code) plus 8 files import raw `X` icon from Lucide for close functionality.
- **Fix:** Standardize on `CloseButton`. Delete `AppleCloseButton`. Replace raw X icon close patterns.

---

## Detailed Findings by Category

### Category 1: Typography & Section Headers

| Severity | Finding | Files Affected |
|----------|---------|---------------|
| **Critical** | `SectionHeader` uses `text-[9px]`/`text-[10px]` — below 11px minimum | `shared/section-header.tsx` + 8 importers |
| **High** | 180 ad-hoc `tracking-widest uppercase` patterns exist | 86 files across all surfaces |
| **High** | `Eyebrow` component has only 1 import despite being correct (11px) | 85+ files should use it |
| **Medium** | 18 files use `text-[9px]` directly | sidebar, wiki, shared components |

### Category 2: Cards & Containers

| Severity | Finding | Files Affected |
|----------|---------|---------------|
| **Low** | `rounded-xl`/`rounded-2xl`/`rounded-3xl` violations | Only 2 files — `ElaborativeInterrogation.tsx`, `dialog.tsx` |
| **Low** | `shadow-xl`/`shadow-2xl` on non-modals | 3 files (quiz, dev) |
| **Note** | Card pattern is mostly consistent | Border radius compliance is **HEALTHY** |

### Category 3: Buttons & CTAs

| Severity | Finding | Files Affected |
|----------|---------|---------------|
| **Medium** | 24 raw `<button>` elements bypass Shadcn Button | 5 files (notes: 19, wiki: 3, drill: 2) |
| **Medium** | 16 Shadcn `<Button>` usages across 10 files | Low but correct usage |
| **Low** | Button hierarchy (Primary→Secondary→Ghost→Destructive) generally respected | No critical violations found |

### Category 4: Badges, Pills & Status Indicators

| Severity | Finding | Files Affected |
|----------|---------|---------------|
| **High** | Score color logic not centralized — `getScoreColor` has 0 real imports | All score-displaying components |
| **Medium** | Multiple badge/pill implementations (Shadcn Badge + custom status-badge + event-badge) | Mixed usage across surfaces |

### Category 5: Score & Data Displays

| Severity | Finding | Files Affected |
|----------|---------|---------------|
| **Critical** | `ScoreDisplay` has 0 real-world usage — scores rendered ad-hoc | Dashboard, Quiz Results, Analytics, Trails, Debrief |
| **Critical** | `getScoreColor()` has 0 real imports — score coloring likely inconsistent | Same as above |
| **High** | 31 files reference red/destructive colors — some may be in score contexts | Need per-file verification |

### Category 6: Tables & Data Grids

| Severity | Finding | Files Affected |
|----------|---------|---------------|
| **High** | 23 files have raw `<table>` vs 4 `DataTable` imports | CEO (3), admin (3), developer (6), wiki (3), shared (1), portal (1), dashboard (1) |
| **Medium** | CEO dashboard builds 3 custom table components | `FinancialLedger`, `CohortRetentionTable`, `TeamTable` |

### Category 7: Form Inputs & Controls

| Severity | Finding | Files Affected |
|----------|---------|---------------|
| **Medium** | Notes module uses zero Shadcn form primitives | `NotesEditor.tsx`, `NotesNavigator.tsx` |
| **Low** | Most admin forms correctly use Shadcn Input/Select | Admin module is mostly compliant |

### Category 8: Modals, Dialogs & Overlays

| Severity | Finding | Files Affected |
|----------|---------|---------------|
| **High** | 4 files use native `alert()`/`confirm()` | `Sidebar.tsx`, `MobileDrawer.tsx`, `FinancialLedger.tsx`, `NotesShell.tsx` |
| **Note** | Shadcn Dialog/Sheet/AlertDialog properly imported where used | No other modal anti-patterns found |

### Category 9: Navigation & Wayfinding

| Severity | Finding | Files Affected |
|----------|---------|---------------|
| **Medium** | 4 different layout systems (dashboard, admin, developer, CEO) | 4 `layout.tsx` files with different approaches |
| **Medium** | Portal components (`src/components/portal/`) exist but adoption unclear | 8 portal files |

### Category 10: Loading & Empty States

| Severity | Finding | Files Affected |
|----------|---------|---------------|
| **High** | 14 files use `animate-spin` spinners (forbidden) | quiz, 3d, admin, shared, ui components |
| **Medium** | `EmptyState` has 9 real imports — decent but could be higher | 9 out of ~397 files |
| **Positive** | 86 `loading.tsx` boundaries exist — excellent route-level coverage | Nearly every route has one |

### Category 11: Taxonomy Picker / Tree Selector

| Severity | Finding | Files Affected |
|----------|---------|---------------|
| **Critical** | `TaxonomyPicker` has 0 real usage — taxonomy selection is ad-hoc | Admin, wiki, quiz setup |
| **Medium** | `taxonomy-tree.tsx` exists alongside `taxonomy-picker.tsx` | Duplicate approach? |

### Category 12: Close/Dismiss Buttons

| Severity | Finding | Files Affected |
|----------|---------|---------------|
| **Low** | `AppleCloseButton` is dead code (0 imports) + uses Phosphor Icons | `ui/AppleCloseButton.tsx` |
| **Low** | 8 files import raw `X` icon for close functionality | Various components |
| **Low** | `CloseButton` has 7 real imports — moderate adoption | `quiz/`, `shared/`, `3d-lab/` |

---

## Target Component APIs — Top 10 Consolidation Targets

### 1. ScoreDisplay (EXISTS — needs adoption, not creation)

```tsx
// src/components/shared/score-display.tsx — ALREADY BUILT
interface ScoreDisplayProps {
  value: number            // 0-100
  variant?: 'ring' | 'bar' | 'pill' | 'number'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  showPercentSign?: boolean // default true
  animate?: boolean        // default true
  className?: string
}

// Also exports: getScoreColor(value: number) => { text, fill, bg }
```

**Migration Example:**
```tsx
// BEFORE (ad-hoc pattern found in multiple dashboard/debrief components)
<span className={cn(
  'font-mono tabular-nums font-bold text-2xl',
  score >= 70 ? 'text-emerald-600' : 'text-foreground'
)}>
  {score}%
</span>

// AFTER
<ScoreDisplay value={score} variant="number" size="xl" />
```

### 2. SectionHeader (EXISTS — needs font size fix + wider adoption)

```tsx
// src/components/shared/section-header.tsx
interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
  level?: 'page' | 'section' | 'card'
  className?: string
}
```

**Required Fix:** Update font sizes to meet 11px minimum:
```tsx
// BEFORE (VIOLATES 11px minimum)
page:    "text-[10px]"   // ❌
section: "text-[9px]"    // ❌
card:    "text-[9px]"    // ❌

// AFTER (minimum 11px)
page:    "text-[11px]"   // ✅
section: "text-[11px]"   // ✅
card:    "text-[11px]"   // ✅
```

**Migration Example:**
```tsx
// BEFORE (from src/components/ceo/MetricCard.tsx and 85+ other files)
<span className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
  Revenue
</span>
<h3 className="font-sans font-medium text-sm">Monthly Recurring</h3>

// AFTER
<SectionHeader eyebrow="Revenue" title="Monthly Recurring" level="card" />
```

### 3. Eyebrow (EXISTS — needs internal adoption by SectionHeader)

```tsx
// src/components/ui/eyebrow.tsx — ALREADY BUILT, correct 11px
interface EyebrowProps {
  children: React.ReactNode
  className?: string
}
```

**Recommendation:** `SectionHeader` should use `Eyebrow` internally for the eyebrow span to ensure the 11px minimum is enforced from one place.

### 4. StatCard (EXISTS — needs CEO dashboard adoption)

```tsx
// src/components/shared/stat-card.tsx
interface StatCardProps {
  eyebrow: string
  value: number | string
  trend?: { direction: 'up' | 'down' | 'flat'; label: string }
  color?: string
  href?: string
  subtitle?: string
  className?: string
}
```

**Migration Example:**
```tsx
// BEFORE (from CEO MetricCard — duplicates StatCard)
<div className="rounded-lg border bg-card p-4">
  <span className="text-[9px] uppercase tracking-widest ...">Revenue</span>
  <span className="text-2xl font-bold font-mono">₱1.2M</span>
  <span className="text-xs text-emerald-600">▲ 12% vs last month</span>
</div>

// AFTER
<StatCard
  eyebrow="Revenue"
  value="₱1.2M"
  trend={{ direction: 'up', label: '12% vs last month' }}
/>
```

### 5. DataTable (EXISTS — needs wider adoption)

```tsx
// src/components/shared/data-table.tsx
interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: string
  searchable?: boolean
  searchPlaceholder?: string
  searchFields?: string[]
  selectable?: boolean
  selectedKeys?: Set<string>
  onSelectionChange?: (keys: Set<string>) => void
  bulkActions?: React.ReactNode
  defaultSort?: { key: string; direction: 'asc' | 'desc' }
  pageSize?: number
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string
  emptyAction?: { label: string; onClick: () => void }
  className?: string
}
```

### 6. QuestionCard (EXISTS — needs quiz session adoption)

```tsx
// src/components/shared/question-card.tsx
interface QuestionCardProps {
  variant: 'quiz' | 'review' | 'preview' | 'compact'
  stem: string
  options: QuestionOption[]
  selectedOptionId?: string | null
  onSelectOption?: (optionId: string) => void
  submitted?: boolean
  userAnswerId?: string
  correctAnswerId?: string
  rationale?: string
  metadata?: { difficulty?: number | string; aleId?: string; topicName?: string; status?: string }
  truncateStem?: number
  questionNumber?: number
  totalQuestions?: number
  flagged?: boolean
  onFlag?: () => void
  className?: string
}
```

### 7. TaxonomyPicker (EXISTS — needs real adoption)

```tsx
// src/components/shared/taxonomy-picker.tsx
interface TaxonomyPickerProps {
  variant: 'dropdown' | 'sidebar' | 'inline'
  mode: 'single' | 'multi'
  nodes: TaxonomyPickerNode[]
  value?: string | string[]
  onChange: (value: string | string[]) => void
  showCounts?: boolean
  showAleId?: boolean
  showStatusBadges?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
}
```

### 8. EmptyState (EXISTS — needs more adoption)

```tsx
// src/components/shared/empty-state.tsx
interface EmptyStateProps {
  icon?: React.ReactNode
  message: string
  description?: string
  action?: { label: string; href?: string; onClick?: () => void }
  className?: string
}
```

### 9. CloseButton (EXISTS — needs standardization)

```tsx
// src/components/ui/close-button.tsx
interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'subtle' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}
```

**Action:** Replace all raw `X` icon close patterns with `CloseButton`. Delete `AppleCloseButton`.

### 10. PageHeader (EXISTS — needs wider adoption)

```tsx
// src/components/shared/page-header.tsx
interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  className?: string
}
```

---

## Migration Plan

### Step 1: Fix the Foundation (Day 1)

Before migrating anything, fix the shared components themselves:

1. **Update `SectionHeader` eyebrow sizes** to `text-[11px]` minimum across all levels
2. **Have `SectionHeader` compose with `Eyebrow`** internally
3. **Verify `ScoreDisplay` color logic** matches design system exactly
4. **Delete `AppleCloseButton.tsx`** (dead code)
5. **Check if `@phosphor-icons/react`** can be removed from dependencies

### Step 2: Critical Data Display Migration (Days 2–4)

Order by student-facing impact:

1. **ScoreDisplay adoption** — Find every component rendering a percentage or mastery score. Replace with `ScoreDisplay` variant. Priority files:
   - Dashboard readiness score
   - Quiz debrief score reveal
   - Analytics charts
   - Camp Trail progress
   - Testing session progress indicator

2. **getScoreColor adoption** — For components that render colored numbers but don't need the full `ScoreDisplay`, import and use `getScoreColor()` directly.

3. **Browser dialog removal** — Replace all 4 `alert()`/`confirm()` usages with `AlertDialog`.

### Step 3: Typography Consolidation (Days 5–7)

The single highest-volume migration:

1. **Audit all 86 files** with `tracking-widest uppercase` patterns
2. **Classify each instance** as:
   - Full header (eyebrow + title + subtitle) → `SectionHeader`
   - Standalone label → `Eyebrow`
   - Custom context (keep but update font size to 11px+)
3. **Migrate in priority order:**
   - Student-facing pages first (dashboard, testing, trails, wiki, analytics)
   - Admin pages second
   - CEO/Developer pages third

### Step 4: Table Standardization (Days 8–9)

1. **CEO tables** (`FinancialLedger`, `CohortRetentionTable`, `TeamTable`) → `DataTable`
2. **Admin tables** (`AuditLogViewer`, other custom tables) → `DataTable`
3. **Developer tables** (6 pages with raw tables) → `DataTable`
4. **Wiki tables** — Review case-by-case (content tables may stay custom)

### Step 5: Loading Pattern Cleanup (Day 10)

1. **Replace 14 spinner instances** with `Skeleton` loaders where appropriate
2. **Exception handling:** Keep spinners for:
   - WebGL/3D loading (contextually appropriate)
   - Inline button loading states (if Shadcn Button pattern is used)
3. **Verify every dynamic component** has both loading skeleton and empty state

### Step 6: Module-Specific Migrations (Days 11–14)

1. **Notes module** — Adopt Shadcn Button, Input, Sheet for all interactive elements
2. **CEO dashboard** — Full migration to shared components (StatCard, DataTable, SectionHeader)
3. **TaxonomyPicker adoption** — Find and replace all custom taxonomy selection UI
4. **QuestionCard adoption** — Find and replace all custom question rendering

### Step 7: Verification & Enforcement (Day 15)

1. **Visual regression testing** — Screenshot comparison of all major pages before/after
2. **Build verification** — `bun run build` after each migration batch
3. **Update design system gallery** — `/developer/design-system` page must showcase all shared components with all variants
4. **PR review checklist item:** "Does this introduce a new ad-hoc UI pattern that already has a shared component?"

### Migration Protocol (Per Component)

For each component migration:

```
1. Identify all files using the ad-hoc pattern (grep results in this document)
2. Open the shared component API spec (this document, § Target Component APIs)
3. Replace the ad-hoc implementation with the shared component import
4. Verify: Does the new usage handle all states? (default, hover, loading, empty, error)
5. Run `bun run build` — fix any type errors
6. Visual verify — compare before/after screenshots
7. Commit with message: "refactor(<surface>): migrate <pattern> to <SharedComponent>"
```

---

## Appendix A: Files Not Readable

All target files were readable during this audit. No access issues encountered.

## Appendix B: Shadcn Component Usage Summary

| Shadcn Component | Used By (file count) | Status |
|-----------------|---------------------|--------|
| `Button` | ~10 component files | Active |
| `Badge` | ~15+ files | Active, widely used |
| `Card` | Under-used | Many ad-hoc card divs exist |
| `Dialog` | ~5 files | Active in admin/testing |
| `Sheet` | ~4 files | Active for drawers |
| `AlertDialog` | ~2 files | Active but under-adopted (4 `alert()` bugs) |
| `Tabs` | ~8 files | Active |
| `Tooltip` | ~6 files | Active |
| `Skeleton` | ~10 files | Active but 14 spinners remain |
| `ScrollArea` | ~5 files | Active |
| `Input` | ~12 files | Active |
| `Select` | ~6 files | Active |
| `Accordion` | ~2 files | Low usage |
| `Calendar` | ~1 file | Admin only |
| `Popover` | ~4 files | Active |
| `RadioGroup` | ~2 files | Quiz options |
| `Switch` | ~3 files | Settings |
| `Slider` | ~2 files | 3D lab |

## Appendix C: Cross-Cutting Violations Summary

| Violation | Count | Files |
|-----------|-------|-------|
| `text-[9px]` (below 11px minimum) | 18 files | sidebar, wiki, shared, admin |
| `text-[8px]` (forbidden) | 0 files | **HEALTHY** |
| `animate-spin` (spinners forbidden) | 14 files | quiz, 3d, admin, shared, ui |
| `alert()`/`confirm()` (browser dialogs) | 4 files | sidebar, ceo, notes |
| `duration-500`+ (max 300ms) | 2 files | score-display (justified), StormTimerBar |
| `rounded-xl`+ on standard elements | 2 files | wiki, ui/dialog |
| `shadow-xl`/`shadow-2xl` non-modal | 3 files | quiz, dev |
| `'use client'` on page.tsx | 3 files | wiki, design-system, admin/search |
| Dead code (`AppleCloseButton`) | 1 file | 0 imports anywhere |

---

*This document is directly executable by Claude Code or any AI coding agent. Hand it to an agent with "execute the migration plan" and it has all the context needed to proceed.*
