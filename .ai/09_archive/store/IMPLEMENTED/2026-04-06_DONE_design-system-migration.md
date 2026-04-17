# Design System Migration: SlateCamp x Flowbite Pro

**Created:** 2026-04-07
**Revised:** 2026-04-07 (v3 — MCP-augmented, block-driven, identity-locked)
**Status:** DRAFT — Pending final approval before coding begins
**Figma Source:** Flowbite Design System Pro v3.1

### Companion Plans
- **Wiki Upgrade:** `.ai/plans/wiki_component_upgrade_plan.md` — article typography, MDX tables, callouts, widgets
- **Identity Lock:** `.ai/plans/identity_preservation_lock.md` — immutable SlideToSubmit/SlideToStart protection
- **Surface Hierarchy:** `.ai/plans/surface_hierarchy_plan.md` — border-light architecture, shadow-over-border, canvas/surface tokens
- **Storybook Upgrade:** `.ai/plans/storybook_upgrade_plan.md` — story updates for all migration phases

### Identity Lock — Slide-to-Action Components

**The following components are EXCLUDED from this migration and must not be modified:**
- `src/components/quiz-v2/SlideToSubmit.tsx` — sacrosanct brand interaction
- `src/lib/quiz/haptics.ts` — haptic feedback functions
- `src/components/quiz-v2/GestureCaptureZone.tsx` — gesture capture wrapper

These components use hardcoded hex colors (`#1B3FC4`, `#8896A7`, `#D4DAE3`) and inline CSS transitions (`cubic-bezier(0.34, 1.56, 0.64, 1)`). No global CSS or token change in this migration can affect them. Full analysis in `identity_preservation_lock.md`.

**Pre-phase check (mandatory):** Before each phase merge, run `grep -rn "SlideToSubmit" src/` and confirm zero diffs touch slider files. Also spot-check `RevealBlock.tsx` after each phase — it has zero hardcoded hex fallbacks and is more vulnerable to token changes than SlideToSubmit.

---

## 0. Local Flowbite Reference Assets

SlateCamp has two Flowbite reference packages at `flowbite/` (NOT installed as dependencies — used as copy-adapt sources only):

### flowbite-mcp-pro-1.0.0/data/
**44 component reference files** (Tailwind HTML patterns):
`alerts.md`, `badge.md`, `breadcrumb.md`, `buttons.md`, `card.md`, `drawer.md`, `dropdowns.md`, `forms.md`, `list-group.md`, `modal.md`, `navbar.md`, `pagination.md`, `sidebar.md`, `skeleton.md`, `stepper.md`, `tables.md`, `tabs.md`, `timeline.md`, `toast.md`, `tooltips.md`, etc.

**13 form reference files**: `checkbox.md`, `input-field.md`, `floating-label.md`, `number-input.md`, `phone-input.md`, `radio.md`, `range.md`, `search-input.md`, `select.md`, `textarea.md`, `timepicker.md`, `toggle.md`, `file-input.md`

**22 application block patterns**: `advanced-tables.md`, `application-shells.md`, `crud-layouts.md`, `create-forms.md`, `create-modals.md`, `dashboard-navbars.md`, `dashboard-footers.md`, `sidenav.md`, `table-headers.md`, `table-footer.md`, `dropdown-filters.md`, `faceted-search-modals.md`, etc.

**Also**: `blocks/marketing/`, `blocks/e-commerce/`, `blocks/publisher/` for section patterns.

### flowbite-react-blocks-1.8.0-beta/
**Full Next.js app** with working React component implementations:
- `app/application-ui/` — advanced-tables (8 variants), application-shells (8 layouts), CRUD layouts, create/update/delete drawers/modals, dashboard navbars/footers, side-navigation, dropdown-filters, faceted-search
- `app/marketing-ui/` — landing sections, heroes, CTAs, pricing, FAQs
- `app/ecommerce-ui/` — product pages, carts, checkout flows
- `components/` — block-breadcrumb, block-section, custom-theme, root-navbar

**Usage protocol:** When building a new component in Phases 2–5, the implementer MUST:
1. Read the corresponding `.md` file from `flowbite-mcp-pro-1.0.0/data/components/` for the Tailwind pattern
2. Read the corresponding React block from `flowbite-react-blocks-1.8.0-beta/app/` for structural reference
3. Translate the pattern into SlateCamp's CVA + data-slot + Radix/Base UI architecture
4. Replace all Flowbite tokens (`text-fg-brand-strong`, `bg-brand-softer`, `rounded-base`, etc.) with SlateCamp tokens per the mapping in `.ai/rules/flowbite-alignment.md`

**Flowbite MCP token → SlateCamp token cheatsheet** (derived from `data/components/alerts.md`, `tables.md`, etc.):

| Flowbite MCP Token | SlateCamp Equivalent |
|---------------------|---------------------|
| `text-fg-brand-strong` | `text-primary-700` |
| `text-fg-brand` | `text-primary` |
| `bg-brand-softer` | `bg-primary-50` |
| `border-brand-subtle` | `border-primary-200` |
| `text-fg-danger-strong` | `text-destructive-700` |
| `bg-danger-soft` | `bg-destructive-50` |
| `text-fg-success-strong` | `text-success-700` |
| `bg-success-soft` | `bg-success-50` |
| `text-fg-warning` | `text-warning` |
| `bg-warning-soft` | `bg-warning-50` |
| `text-heading` | `text-foreground` |
| `text-body` | `text-foreground` |
| `bg-neutral-primary` | `bg-card` |
| `bg-neutral-primary-soft` | `bg-background` |
| `bg-neutral-secondary-soft` | `bg-muted` |
| `bg-neutral-secondary-medium` | `bg-muted` |
| `bg-neutral-tertiary` | `bg-muted` |
| `border-default` | `border-border` |
| `rounded-base` | `rounded-sm` (4px) |
| `shadow-xs` | `shadow-sm` |

---

## 1. Brand Identity Preservation

### Colors — LOCKED (No Changes)

SlateCamp's color system is comprehensive and must not be modified. The following tokens in `src/app/globals.css` are the source of truth:

| Token | Light | Dark | Tailwind Class |
|-------|-------|------|---------------|
| Camp Cobalt | `#1B3FC4` | `#5B7FE0` | `bg-primary` / `text-primary` |
| Camp Orange | `#E8853A` | `#F0A060` | `bg-camp-orange` |
| Emerald | `#2D9F6F` | `#4DBF8F` | `text-success` |
| Warm Red | `#D64545` | `#E85C5C` | `text-destructive` |
| Amber | `#D4951A` | `#E8B040` | `text-warning` |
| Surface Light | `#F8F7F5` | `#141B24` | `bg-background` |
| Ink Primary | `#1A2332` | `#E8ECF1` | `text-foreground` |
| Border | `#D4DAE3` | `#2A3444` | `border-border` |

Full 50–900 shade scales exist for primary, success, warning, destructive, and accent. These map directly to Flowbite's `primary`, `green`, `yellow`, `red`, and `orange` roles respectively.

**Flowbite → SlateCamp color mapping:**

| Flowbite Role | SlateCamp Token | Notes |
|---------------|----------------|-------|
| `primary` | `--primary` (Camp Cobalt) | Direct replacement |
| `secondary` | `--secondary` | Neutral gray role |
| `green` / `success` | `--success` (Emerald) | Direct replacement |
| `red` / `danger` | `--destructive` (Warm Red) | Direct replacement |
| `yellow` / `warning` | `--warning` (Amber) | Direct replacement |
| `dark` | `--foreground` (Ink Primary) | Dark text/bg role |
| `gray` | `--muted` / `--muted-foreground` | Neutral tones |
| `blue` | `--primary` | Flowbite blue → Camp Cobalt |

### Typography — LOCKED (No Changes)

| Font | Purpose | CSS Variable |
|------|---------|-------------|
| Atkinson Hyperlegible | Body text (default `font-sans`) | `--font-sans` |
| Plus Jakarta Sans | Display headings | `--font-display` |
| DM Mono | Code, data values | `--font-dm-mono` |
| Syne | Accent headings | `--font-syne` |
| Sora | Logo text | `--font-sora` |

> **Note — font-display vs font-syne discrepancy:** `globals.css` defines `--font-display: 'Plus Jakarta Sans'` (line 199) and `--font-syne: 'Syne'` (line 203) as two separate variables. `CLAUDE.md` previously listed Syne as the display heading font — this was inaccurate. The source of truth is `globals.css`: Plus Jakarta Sans is the primary display heading font (`font-display` class), while Syne is an accent heading font with its own `font-syne` class and `.font-syne` utility. Both fonts coexist; they serve different roles. `CLAUDE.md`'s typography table has been corrected to reflect this (Syne row: "Accent headings"; Plus Jakarta Sans row added as "Display headings").

Flowbite Pro uses Inter as its default. We will **not** adopt Inter — SlateCamp's Atkinson Hyperlegible is an accessibility-focused choice that stays.

### Border Radius — ENFORCED MINIMAL

Current radius tokens in `globals.css` are already minimal and capped:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | `0.125rem` (2px) | Badges, micro elements |
| `--radius-sm` | `0.25rem` (4px) | Buttons, inputs |
| `--radius-md` | `0.375rem` (6px) | Cards |
| `--radius-lg` | `0.5rem` (8px) | Modals, dialogs |
| `--radius-xl` | `0.5rem` (8px) | **Already capped at 8px in globals.css** |

Flowbite Pro defaults to `rounded-lg` (8px) and `rounded-xl` (12px) on many components. All Flowbite components adopted into SlateCamp must use our capped radius scale. No component may exceed `rounded-lg` (8px).

**Override strategy:** Any Flowbite component class using `rounded-xl`, `rounded-2xl`, or `rounded-3xl` will be remapped to `rounded-lg` (8px max).

---

## 2. Structural Audit

### Current Component Inventory

**`src/components/ui/` (36 primitive components — shadcn/ui + CVA):**
- Layout: Card (6 variants, 3 sizes)
- Actions: Button (9 variants, 10 sizes), close-button
- Forms: Input, SearchInput, Textarea, Checkbox, Radio Group, Select, Switch, Slider, Label, FormField, InputGroup
- Feedback: Toast/Toaster, Progress, ProgressBar, Spinner, Badge, Skeleton
- Overlays: Dialog, AlertDialog, Sheet, Popover, DropdownMenu, Tooltip, Command
- Navigation: Tabs, Accordion
- Data: Separator, ScrollArea, Resizable
- Other: Avatar, Eyebrow, Toolbar, UnifiedSlider, Calendar

**`src/components/shared/` (28 application components):**
- Navigation: Navbar, sidebar-nav, breadcrumb, NavigationProgress, Omnibar
- Dashboard: DashboardHeader, DashboardPageSkeleton, stat-card, QuickStatsRow, section-header
- Content: action-card, question-card, data-table, empty-state, CodeBlock, floating-panel
- Quiz: question-dot-navigator, score-display, difficulty-bar
- Misc: ThemeProvider, ThemeToggle, LogoutButton, taxonomy-picker, taxonomy-tree, InfoTooltip, SlatecampLoader, etc.

### Storybook Status — CONFIRMED OPERATIONAL

Storybook 8.6.14 is installed and fully operational:
- **Scripts:** `bun run storybook` (dev), `bun run build-storybook` (build), `bun run check:storybook` (governance)
- **Governance:** `check:storybook` runs before `storybook`, `build-storybook`, and `lint`
- **Story count:** 63 live stories (0 placeholders) as of 2026-04-06
- **Discovery paths:** `src/components/**/*.stories.*`, `src/features/**/*.stories.*`, `src/storybook/scenes/**/*.stories.*`
- **Addons:** a11y, essentials, interactions, themes

Storybook validation criteria in this plan are confirmed feasible. All new components MUST have `.stories.tsx` files that pass `bun run check:storybook`.

### Gap Analysis vs. Flowbite Pro v3.1

#### Missing Components (High Priority — Flowbite Pro has, SlateCamp lacks)

| Component | Flowbite Category | Impact | Priority | Local Reference |
|-----------|------------------|--------|----------|----------------|
| **Alert** | Feedback | No dismissible alert in `ui/` | P1 | `data/components/alerts.md` |
| **Table** (primitive) | Data Display | `data-table` exists in shared but no `ui/table` | P1 | `data/components/tables.md` + `app/application-ui/advanced-tables/` |
| **Pagination** | Navigation | No pagination component | P1 | `data/components/pagination.md` |
| **Breadcrumb** (primitive) | Navigation | Exists in `shared/` but not a `ui/` primitive | P2 | `data/components/breadcrumb.md` |
| **Stepper/Timeline** | Feedback | No step indicator for multi-step flows | P2 | `data/components/stepper.md` + `data/components/timeline.md` |
| **Bottom Navigation** | Navigation | No mobile bottom nav (IN SCOPE — see §3.6) | P2 | `data/components/bottom-navigation.md` |
| **List Group** | Data Display | No styled list group primitive | P2 | `data/components/list-group.md` |
| **Drawer** | Overlays | Using `Sheet` as drawer — may need dedicated component | P3 | `data/components/drawer.md` |
| **Rating** | Data Display | No star/score rating component | P3 | `data/components/rating.md` |
| **Speed Dial** | Actions | No floating action menu | P3 | `data/components/speed-dial.md` |
| **Mega Menu** | Navigation | No multi-column dropdown nav | P3 | `data/components/mega-menu.md` |
| **Indicator/Dot** | Feedback | No notification dot/indicator | P3 | `data/components/indicators.md` |

#### Structural Inconsistencies (Flowbite Pro is more consistent)

| Area | Current SlateCamp | Flowbite Pro Standard | Gap |
|------|------------------|----------------------|-----|
| **Spacing** | Ad-hoc per component (`p-3`, `p-4`, `p-6`) | Systematic 4px grid with `p-4` (16px) base, `p-5` (20px) comfortable, `p-6` (24px) spacious | Inconsistent padding across cards, sections |
| **Elevation** | `shadow-sm` hover only, cards mostly flat | 3-tier system: `shadow-sm` (resting), `shadow` (hover), `shadow-lg` (floating) | Under-utilizing shadow for depth hierarchy |
| **Interactive states** | `hover:bg-muted` and `active:scale-[0.98]` | Full state chain: default → hover → focus → active → disabled with visible transitions | Focus states incomplete on some shared components |
| **Icon sizing** | Per-component SVG sizing | Systematic `w-4 h-4` (sm), `w-5 h-5` (md), `w-6 h-6` (lg) | Icons not size-consistent across shared components |
| **Form field patterns** | `FormField` exists but inconsistently used | Label + Input + Helper text + Error text as atomic group | Many forms skip the FormField wrapper |
| **Dark mode** | Full token support in globals.css | Full token support with design tokens | ✅ Already aligned |

### Form Audit Scope (Pre-computed)

**9 files containing 11 `<form>` elements** (verified 2026-04-07 via `grep -rn '<form[ >]' src/ --include="*.tsx"`):

> **Correction note:** An earlier draft counted 15 files / 18 forms by matching `<Form` as a substring, which incorrectly included `FormulaBlock.tsx`, `ArticlePanel.tsx`, and `FloorTilesForm.tsx`. Those files use React components that happen to contain "Form" in their name but contain no native `<form>` element. The corrected count below matches only files with a literal `<form` tag.

| Portal | Files | Forms |
|--------|-------|-------|
| Auth | `onboarding/OnboardingForm.tsx`, `onboarding/comp-exam/ScoreEntryForm.tsx`, `forgot-password/page.tsx` | 3 |
| Dashboard | `pods/CreatePodModal.tsx`, `pods/JoinPodForm.tsx`, `settings/profile-card.tsx` | 4 |
| Admin | `admin/settings/page.tsx` | 2 |
| CEO | `ceo/FinancialEntryForm.tsx` | 1 |
| Components | `analytics/ExamOutcomeForm.tsx` | 1 |

**Total active forms to audit: 11** (across 9 files). This is a bounded, timeboxable scope.

---

## 3. Tailwind Configuration Strategy

### Approach: Adopt Patterns, Not Package

**We will NOT install `flowbite` or `flowbite-react` as dependencies.**

Rationale:
1. SlateCamp already has shadcn/ui + Radix UI + CVA — adding Flowbite React would create two competing component systems
2. Flowbite's value is in its **design patterns and spacing system**, not its runtime
3. Our existing CVA-based components can absorb Flowbite's structural improvements without a dependency
4. The local `flowbite/` reference folders provide all the patterns and React examples needed for copy-adapt

### What Changes in Tailwind/CSS

#### A. Spacing Standardization (globals.css additions)

```css
@theme inline {
  /* Flowbite-aligned spacing scale */
  --spacing-section: 1.5rem;    /* 24px — section padding */
  --spacing-card: 1rem;         /* 16px — card internal padding */
  --spacing-card-lg: 1.5rem;    /* 24px — large card padding */
  --spacing-form-gap: 1rem;     /* 16px — gap between form fields */
  --spacing-inline: 0.5rem;     /* 8px — inline element gap */
}
```

#### B. Shadow Standardization

Current shadows are adequate. Enforce consistent usage:

| Context | Shadow | Example |
|---------|--------|---------|
| Cards (resting) | `shadow-card` (custom subtle shadow) or `shadow-none` | Default card state on `bg-canvas` |
| Cards (hover) | `shadow-sm` | Interactive card hover |
| Dropdowns/Popovers | `shadow-md` | DropdownMenu, Popover |
| Modals/Dialogs | `shadow-lg` | Dialog, Sheet |

> **Note:** See `surface_hierarchy_plan.md` for the full 5-level elevation system. The `shadow-card` token is defined in Phase 1.

#### C. No Tailwind Config File Needed

SlateCamp uses Tailwind CSS 4 with CSS-first configuration in `globals.css`. There is no `tailwind.config.js` — all customization lives in `@theme inline {}` and `:root {}` blocks. The migration will add tokens to these existing blocks only.

#### D. Component Variant Alignment

Update existing CVA definitions to align spacing/sizing with Flowbite's systematic approach:

| Component | Current | Aligned |
|-----------|---------|---------|
| Card sizes | `sm: p-3`, `md: p-4`, `lg: p-6` | Keep — already close to Flowbite's `p-4`/`p-5`/`p-6` |
| Button sizes | 10 sizes (xs through icon-lg) | Keep — more granular than Flowbite, which is fine |
| Input sizes | `sm: h-8`, `md: h-9`, `lg: h-10` | Keep — matches Flowbite's small/default/large |

---

## 4. Implementation Roadmap

### Git Strategy

**One feature branch per phase:** `design-system/phase-N-description`

- Each phase branch is created from `main`
- Phase merges only after validation criteria pass
- If a phase produces regressions, apply the recovery ladder before discarding: (1) revert the specific regression commit, (2) cherry-pick passing work to a new branch, (3) discard and rebuild only as last resort — no partial merges
- Phases 1–2 are sequential (2 depends on 1). Phases 3–5 can run in parallel after Phase 2 merges.

**Recommended merge order for parallel phases:** Phase 3 (navigation) first → Phase 5 (data display) second → Phase 4 (forms) last. This minimizes visual inconsistency since navigation frames the entire UI.

### Phase 1: Alignment Reference & Token Mapping
**Estimated scope:** 3–4 files changed
**Branch:** `design-system/phase-1-tokens`

- [ ] **1.1** Create `.ai/rules/flowbite-alignment.md` — the Flowbite → SlateCamp token mapping document. This file gates ALL subsequent phases. It must include: color mapping, radius mapping, spacing mapping, shadow mapping, icon sizing rules, and the Flowbite MCP token cheatsheet from §0. Every Phase 2–5 task references this file. Include the card-on-white fallback rule: "Cards on `bg-canvas` use `shadow-card` only. Cards on white parents (`bg-card` or `bg-background`) retain `border border-border/50` as fallback."
- [ ] **1.2** Add spacing utility tokens to `globals.css` `@theme inline {}` block
- [ ] **1.3** Document shadow usage contract in `.ai/rules/flowbite-alignment.md` (card→shadow-card, hover→shadow-sm, dropdown→shadow-md, modal→shadow-lg)
- [ ] **1.4** Document that `--radius-xl` is already capped at `0.5rem` (8px) in the alignment doc — no code change needed, this is already enforced
- [ ] **1.5** Document transition standard in `.ai/rules/flowbite-alignment.md`: all new component transitions use `duration-150 ease-out` (default) or `duration-200 ease-out` (emphasis). Max 300ms. No spring/bounce easing except identity-locked components.

**Validation:** `bun run type-check` passes, `bun run lint` passes, `.ai/rules/flowbite-alignment.md` exists and covers all mapping categories. Dark mode: capture screenshots in dark mode alongside light mode. Verify all new/modified components render correctly with dark tokens.

### Phase 2: Missing Primitive Components
**Estimated scope:** 6–8 new files in `src/components/ui/`, 6–8 new `.stories.tsx` files
**Branch:** `design-system/phase-2-primitives`
**Depends on:** Phase 1 merged

- [ ] **2.1** Create `ui/alert.tsx` — dismissible alert with `variant: default | destructive | success | warning | info` and CVA. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/alerts.md`
- [ ] **2.2** Create `ui/table.tsx` — primitive Table, TableHeader, TableBody, TableRow, TableHead, TableCell with data-slot pattern. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/tables.md` + `flowbite/flowbite-react-blocks-1.8.0-beta/app/application-ui/advanced-tables/`
- [ ] **2.3** Create `ui/pagination.tsx` — Previous/Next + page numbers, responsive (compact on mobile). Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/pagination.md`
- [ ] **2.4** Promote `shared/breadcrumb.tsx` to `ui/breadcrumb.tsx`:
  - Copy the component to `ui/breadcrumb.tsx` and refactor as a proper `ui/` primitive with CVA + data-slot
  - Update the **3 known import points** to point to the new location:
    1. `src/components/developer/Breadcrumbs.tsx` — direct import `from '@/components/shared/breadcrumb'`
    2. `src/components/shared/breadcrumb.stories.tsx` — relative import `from './breadcrumb'`
    3. `src/components/shared/index.ts` — barrel export `export * from './breadcrumb'` (update to re-export from `ui/breadcrumb` or remove after promotion)
  - Add a temporary barrel re-export in `shared/breadcrumb.tsx`: `export { Breadcrumb } from '@/components/ui/breadcrumb'` — this catches any additional imports not captured by the above (to be removed after Phase 2 merge when a full-codebase build confirms no breakage)
  - Run `bun run build` to verify zero broken imports before removing the barrel
- [ ] **2.5** Create `ui/stepper.tsx` — horizontal/vertical step indicator with active/complete/upcoming states. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/stepper.md`
- [ ] **2.6** Create `ui/list-group.tsx` — styled list with optional icons, badges, and interactive variant. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/list-group.md`
- [ ] **2.7** Add Storybook stories for each new primitive (one `.stories.tsx` per component). Run `bun run check:storybook` and `bun run build-storybook` to validate.

**Validation:** `bun run build` passes, `bun run build-storybook` passes, each new component has a `.stories.tsx`. Dark mode: capture screenshots in dark mode alongside light mode. Verify all new/modified components render correctly with dark tokens.

### Phase 3: Layout & Navigation Overhaul
**Estimated scope:** 8–12 files modified
**Branch:** `design-system/phase-3-navigation`
**Depends on:** Phase 2 merged

- [ ] **3.1** Audit `shared/Navbar.tsx` — align spacing, height, and interactive states to Flowbite navbar patterns (sticky, responsive collapse). Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/navbar.md` + `flowbite/flowbite-react-blocks-1.8.0-beta/app/application-ui/dashboard-navbars/`
- [ ] **3.2** Audit `shared/sidebar-nav.tsx` — ensure consistent icon sizing (`w-5 h-5`), active state treatment (left border accent or bg-primary/10), hover transitions. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/sidebar.md` + `flowbite/flowbite-react-blocks-1.8.0-beta/app/application-ui/side-navigation/`
- [ ] **3.3** Standardize `shared/DashboardHeader.tsx` — page title + breadcrumb + actions pattern from Flowbite's CRUD layouts. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/blocks/application/crud-layouts.md`
- [ ] **3.4** Audit `shared/Omnibar.tsx` — align with Flowbite search patterns (icon positioning, clear button, keyboard shortcut badge). Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/forms/search-input.md`
- [ ] **3.5** Create `shared/page-header.tsx` if needed — consistent page title + description + action bar pattern. Note: `SectionHeader` is the canonical page header per memory — evaluate if it needs a Flowbite-aligned enhancement or if a new component is actually warranted.
- [ ] **3.6** **Create `ui/bottom-navigation.tsx`** — mobile bottom nav for dashboard. **Decision: IN SCOPE.** SlateCamp targets mobile-first mid-range Android users. A bottom nav with 4–5 primary dashboard destinations (Home, Drills, Wiki, 3D Lab, Profile) is required, not optional. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/bottom-navigation.md`
- [ ] **3.7** Ensure all navigation components have complete focus-visible states and keyboard accessibility

**Validation:** Manual screenshot comparison of `/dashboard`, `/admin`, `/developer`, `/ceo` portals in both light and dark mode, at desktop (1440px) and mobile (375px) widths. Save before/after screenshots in `.ai/plans/screenshots/phase-3/` for review.
Dark mode: capture screenshots in dark mode alongside light mode. Verify all new/modified components render correctly with dark tokens.

### Phase 4: Form Elements & Interactive Components
**Estimated scope:** 9–14 files modified (11 forms across 9 files — see §2 Form Audit Scope)
**Branch:** `design-system/phase-4-forms`
**Depends on:** Phase 2 merged (can run parallel with Phase 3)

- [ ] **4.1** Enforce `FormField` wrapper usage across the **11 active forms** identified in the Form Audit Scope. For each form: ensure Label + Input + Helper text + Error text uses the `FormField` wrapper from `ui/form-field.tsx`. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/forms/input-field.md` for field layout pattern.
- [ ] **4.2** Audit `ui/select.tsx` — ensure dropdown alignment, max-height, search support matches Flowbite select patterns. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/forms/select.md`
- [ ] **4.3** Audit `ui/checkbox.tsx` and `ui/radio-group.tsx` — verify sizing, label spacing, group layout. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/forms/checkbox.md` + `data/forms/radio.md`
- [ ] **4.4** Audit `ui/switch.tsx` — verify size variants, label placement, disabled state. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/forms/toggle.md`
- [ ] **4.5** Audit `ui/textarea.tsx` — ensure auto-resize, character count, helper text support. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/forms/textarea.md`
- [ ] **4.6** Audit `ui/input-group.tsx` — prefix/suffix icon groups, button addons. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/forms/input-field.md`
- [ ] **4.7** Audit all form components for consistent `aria-invalid` + `aria-describedby` patterns
- [ ] **4.8** Update quiz interaction forms (`SocraticExplorer.tsx`, `FormulaBlock.tsx`) to use consistent form field patterns

**Validation:** All 11 forms render correctly in their portal pages. Form components in Storybook pass `@storybook/addon-a11y` checks. Dark mode: capture screenshots in dark mode alongside light mode. Verify all new/modified components render correctly with dark tokens.

### Phase 5: Feedback & Data Display Components
**Estimated scope:** 8–12 files modified
**Branch:** `design-system/phase-5-feedback`
**Depends on:** Phase 2 merged (can run parallel with Phases 3–4)

- [ ] **5.1** Integrate new `ui/alert.tsx` into existing notification/feedback patterns across portals
- [ ] **5.2** Audit `ui/toast.tsx` — align positioning, animation, and stacking with Flowbite toast patterns. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/toast.md`
- [ ] **5.3** Audit `shared/stat-card.tsx` — align with Flowbite KPI card patterns (icon placement, trend indicator, comparison text)
- [ ] **5.4** Audit `shared/data-table.tsx` — adopt Flowbite table styling (striped rows option, hover state, responsive scroll), backed by the new `ui/table.tsx` primitive. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/tables.md` + `flowbite/flowbite-react-blocks-1.8.0-beta/app/application-ui/advanced-tables/`. Align table header, stripe, and hover patterns with wiki MDX table styling from `wiki_component_upgrade_plan.md` §2 to ensure visual consistency across portals.
- [ ] **5.5** Audit `ui/badge.tsx` — ensure variant coverage matches Flowbite (default, dark, red, green, yellow, indigo, purple, pink). Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/badge.md`
- [ ] **5.6** Audit `shared/empty-state.tsx` — align with Flowbite empty state patterns (centered illustration + text + CTA)
- [ ] **5.7** Audit `ui/progress.tsx` — ensure label support, size variants, color variants. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/progress.md`
- [ ] **5.8** Create `ui/indicator.tsx` if needed — notification dot/badge overlay pattern. Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/components/indicators.md`
- [ ] **5.9** Update `shared/DashboardPageSkeleton.tsx` and `ui/skeleton.tsx` to match new card surface treatment (`shadow-card` instead of `border border-border` where applicable). Loading → loaded visual transition must be seamless.

**Validation:** Manual screenshot comparison of dashboard analytics and quiz result screens in light/dark mode. Save in `.ai/plans/screenshots/phase-5/`. Dark mode: capture screenshots in dark mode alongside light mode. Verify all new/modified components render correctly with dark tokens.

### Phase 6: Marketing & Application Section Patterns
**Estimated scope:** Documentation + templates
**Branch:** `design-system/phase-6-sections`
**Depends on:** Phases 3–5 merged
**Relationship:** This phase directly supports the GTM/launch work. The landing page (`/`), `/about`, `/pricing`, and `/contact` pages are actively being built. Section patterns created here will be consumed by that work.

- [ ] **6.1** Document Flowbite-aligned section templates for: Hero, Feature grid, Pricing, FAQ, CTA, Footer. Use `flowbite/flowbite-mcp-pro-1.0.0/data/blocks/marketing/` and `flowbite/flowbite-react-blocks-1.8.0-beta/app/marketing-ui/` as sources.
- [ ] **6.2** Create marketing page section components for SlateCamp's `/`, `/about`, `/pricing` pages using the documented templates
- [ ] **6.3** Document admin CRUD page pattern (list view + create/edit modal + detail view) following `flowbite/flowbite-mcp-pro-1.0.0/data/blocks/application/crud-layouts.md`

**Validation:** Pattern documentation reviewed and approved. Marketing sections render in Storybook.

---

## 5. AI-Augmented Workflow

### MCP-Driven Component Generation

The Flowbite MCP Server (`flowbite/flowbite-mcp-pro-1.0.0/`) provides two tools that accelerate Phases 2–5:

**Tool 1: Figma to Code** (`figma_to_code`)
- Input: Figma node URL from `https://www.figma.com/design/Mg57xRjiaCCLm7P6JV1sJB/`
- Output: Tailwind HTML for the selected component
- Use for: Extracting precise spacing, padding, and layout values from Flowbite Pro Figma nodes
- Post-processing: All MCP output MUST be filtered through the Refactoring Protocol (§5.2) before use

**Tool 2: Theme File Generator** (`generate_theme`)
- Input: Brand hex color (e.g., `#1B3FC4`)
- Output: Complete Flowbite theme CSS with color scales
- Use for: Validating that our existing shade scales (primary-50 through primary-900) align with Flowbite's generated scales. This is a VERIFICATION tool, not a replacement — we keep our existing tokens.
- The generator can confirm our hand-crafted `--primary-50: #EEF2FC` through `--primary-900: #06154C` scale is perceptually balanced against what Flowbite would auto-generate for Camp Cobalt.

**MCP setup (if needed):**
The MCP server is local at `flowbite/flowbite-mcp-pro-1.0.0/`. Build with `npm run build` in that directory, then run via `node build/index.js` for stdio transport. See its README for Claude Code integration config. This is optional tooling — all component patterns are also available as static `.md` files in `data/`.

### Block-Driven Implementation Protocol

When building any component in Phases 2–5, follow this extraction workflow:

**Step 1: Read Flowbite Reference**
```
flowbite/flowbite-mcp-pro-1.0.0/data/components/{component}.md  → Tailwind HTML pattern
flowbite/flowbite-react-blocks-1.8.0-beta/app/{category}/{block}/ → React implementation
```

**Step 2: Strip Flowbite Imports**
Remove all `flowbite-react` imports (`Button`, `Table`, `Pagination`, `TextInput`, `Dropdown`, `Checkbox`, `Label`, etc.). These are Flowbite's runtime components — we do NOT use them.

**Step 3: Replace with SlateCamp Primitives**
| Flowbite React Import | SlateCamp Replacement |
|-----------------------|----------------------|
| `Button` | `@/components/ui/button` |
| `TextInput` | `@/components/ui/input` |
| `Label` | `@/components/ui/label` |
| `Checkbox` | `@/components/ui/checkbox` |
| `Table` | New `@/components/ui/table` (Phase 2.2) |
| `Pagination` | New `@/components/ui/pagination` (Phase 2.3) |
| `Dropdown` | `@/components/ui/dropdown-menu` |
| `Breadcrumb` | New `@/components/ui/breadcrumb` (Phase 2.4) |
| `Badge` | `@/components/ui/badge` |
| `theme` / `twMerge` | `cn()` from `@/lib/utils` |

**Step 4: Apply Camp Cobalt Color Mapping**
Replace Flowbite color classes per the token cheatsheet in §0.

**Step 5: Enforce Minimal Rounded Corners**
Replace Flowbite's `rounded-lg` (16px in their system) with SlateCamp's `rounded-md` (6px) for most components. Use SlateCamp's `rounded-lg` (8px) only for modals and dialogs per the radius table in §1. Replace all `rounded-xl`+ → `rounded-lg` (8px cap). Replace `sm:rounded-lg` → `sm:rounded-md` for non-modal contexts.

**Step 6: Add data-slot + CVA**
Wrap in CVA variant definition with `data-slot` attributes per SlateCamp's shadcn/ui convention.

### Application UI Block Sources for Missing Components

| Missing Component | MCP Data Reference | React Block Reference |
|-------------------|-------------------|----------------------|
| **Alert** | `data/components/alerts.md` | — (no React block, use MCP pattern) |
| **Table** | `data/components/tables.md` | `app/application-ui/advanced-tables/` (8 variants) |
| **Pagination** | `data/components/pagination.md` | Used within advanced-tables blocks |
| **Breadcrumb** | `data/components/breadcrumb.md` | `components/block-breadcrumb.tsx` |
| **Stepper** | `data/components/stepper.md` | — (use MCP pattern) |
| **Bottom Nav** | `data/components/bottom-navigation.md` | — (use MCP pattern) |
| **List Group** | `data/components/list-group.md` | — (use MCP pattern) |
| **CRUD Layouts** | `data/blocks/application/crud-layouts.md` | `app/application-ui/crud-layouts/` |
| **Dashboard Navbars** | `data/blocks/application/dashboard-navbars.md` | `app/application-ui/dashboard-navbars/` |
| **Side Navigation** | `data/blocks/application/sidenav.md` | `app/application-ui/side-navigation/` |
| **Create Forms** | `data/blocks/application/create-forms.md` | `app/application-ui/create-forms/` |
| **Marketing Sections** | `data/blocks/marketing/` (28 files) | `app/marketing-ui/` |

### Marketing UI → SlateCamp Portal Mapping

| Flowbite Marketing Block | SlateCamp Target |
|-------------------------|-----------------|
| `hero.md` | `/` landing page hero |
| `pricing.md` | `/pricing` page |
| `faq.md` | `/pricing` FAQ section, `/about` FAQ |
| `feature.md` | `/` feature grid |
| `testimonials.md` | `/` social proof |
| `cta.md` | `/` and `/about` call-to-action |
| `footer.md` | Global footer |
| `contact-form.md` | `/contact` page |
| `register.md` | Auth flow reference |
| `login.md` | Auth flow reference |

---

## 6. Dependencies

### Required (None — Zero New Dependencies)

We are adopting **patterns only**, not the Flowbite package. All implementations use:
- Existing: `@radix-ui/react-*`, `@base-ui/react/*`, `class-variance-authority`, `@phosphor-icons/react`
- Existing: shadcn/ui component patterns with `data-slot` convention
- Existing: Tailwind CSS 4 with CSS-first config
- Reference: `flowbite/flowbite-mcp-pro-1.0.0/data/` (Tailwind HTML patterns, read-only)
- Reference: `flowbite/flowbite-react-blocks-1.8.0-beta/` (React examples, read-only copy-adapt)

### Explicitly NOT Installing

| Package | Reason |
|---------|--------|
| `flowbite` | JS runtime conflicts with Radix/Base UI; we only need design patterns |
| `flowbite-react` | Would duplicate our entire shadcn/ui component library |
| `flowbite-icons` | We use Phosphor Icons consistently |

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Spacing changes break existing layouts | Medium | Medium | Phase-by-phase with visual regression screenshots |
| New components diverge from SlateCamp patterns | Low | High | All new components must use CVA + data-slot + existing tokens |
| Migration scope creep | High | Medium | Strict phase boundaries — no Phase N+1 until Phase N validated |
| Dark mode regressions | Low | Medium | All changes tested in both light/dark |
| Phase produces regressions | Medium | Low | Each phase on its own branch — discard and rebuild if needed |
| Breadcrumb promotion breaks imports | Low | Low | Barrel re-export + `bun run build` verification (3 known import points: `Breadcrumbs.tsx`, `breadcrumb.stories.tsx`, `shared/index.ts` barrel) |

### Visual Regression Strategy

**Manual screenshots** — no Chromatic/Percy is set up. For Phases 3 and 5:
1. Before starting the phase, capture baseline screenshots at 1440px and 375px widths for affected pages
2. Save to `.ai/plans/screenshots/phase-N/before/`
3. After the phase, capture the same pages and save to `.ai/plans/screenshots/phase-N/after/`
4. Compare side-by-side before merge

This is manual and acknowledged as such. Automated visual regression is a separate infrastructure project, not a dependency for this migration.

---

## 8. Success Criteria

1. **Zero brand identity changes** — all SlateCamp colors, fonts, and radius values preserved
2. **Component coverage** — Alert, Table, Pagination, Breadcrumb, Stepper, BottomNavigation added to `ui/`
3. **Spacing consistency** — all `shared/` components that previously used ad-hoc padding replaced with documented spacing tokens from `.ai/rules/flowbite-alignment.md`
4. **Interactive state completeness** — all interactive components have hover, focus-visible, active, and disabled states
5. **Form field standardization** — all 11 active forms use the `FormField` wrapper pattern
6. **Storybook coverage** — every new/modified component has a story
7. **Build passes** — `bun run build`, `bun run type-check`, `bun run lint`, `bun run build-storybook` all pass after each phase

---

*This plan adopts Flowbite Pro v3.1's structural excellence while preserving SlateCamp's established brand identity. We take the patterns, not the package. The local `flowbite/` reference folders provide all source material needed — no runtime dependency required.*
