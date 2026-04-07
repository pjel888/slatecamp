# Design System Migration Tracker

**Last Updated:** 2026-04-07
**Status:** NOT STARTED

---

## Completion Criteria

The migration is complete when ALL of these are true:
- [ ] All 6 master plan phases merged to main
- [ ] All 3 wiki upgrade phases merged
- [ ] All 4 portals (Dashboard, Admin, CEO, Developer) use new design patterns
- [ ] Marketing pages (/, /pricing, /about, /contact) use Flowbite-aligned sections
- [ ] Storybook has 90+ stories with zero placeholder scaffolds
- [ ] Zero hardcoded hex colors in `src/components/shared/` and `src/components/ui/`
- [ ] Zero `border-r` layout separators (replaced by surface contrast)
- [ ] All wiki widgets use `rounded-md` (no `rounded-lg` or `rounded-[10px]`)
- [ ] SlideToSubmit visual verification passed after final phase
- [ ] `bun run build`, `bun run type-check`, `bun run lint`, `bun run build-storybook` all pass
- [ ] Dark mode screenshots captured and verified for all portals

---

## Phase 1: Alignment Reference & Token Mapping
**Branch:** `design-system/phase-1-tokens`
**Status:** NOT STARTED
**Scope:** 3–4 files changed

| # | Task | Plan Source | Status |
|---|------|------------|--------|
| 1.1 | Create `.ai/rules/flowbite-alignment.md` — full token mapping (color, radius, spacing, shadow, icon sizing, Flowbite MCP cheatsheet, card-on-white fallback rule) | Migration §4 | [ ] |
| 1.2 | Add spacing utility tokens to `globals.css` `@theme inline {}`: `--spacing-section`, `--spacing-card`, `--spacing-card-lg`, `--spacing-form-gap`, `--spacing-inline` | Migration §4 | [ ] |
| 1.3 | Document shadow usage contract in `.ai/rules/flowbite-alignment.md` (`shadow-card` → resting card, `shadow-sm` → hover, `shadow-md` → dropdown, `shadow-lg` → modal) | Migration §4 + Surface §3 | [ ] |
| 1.4 | Document that `--radius-xl` is already capped at 8px — no code change needed, document in alignment file | Migration §4 | [ ] |
| 1.5 | Document transition standard in `.ai/rules/flowbite-alignment.md`: `duration-150 ease-out` default, `duration-200 ease-out` emphasis, max 300ms, no spring/bounce except identity-locked | Migration §4 | [ ] |
| 1.SU1 | Add `--canvas` token to `:root` and `.dark` in `globals.css` (`#F5F5F5` light / `#0F1318` dark) | Surface §2 | [ ] |
| 1.SU2 | Add `--shadow-card` custom shadow to `@theme inline`: `0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)` | Surface §3 | [ ] |
| 1.SU3 | Add `--color-canvas: var(--canvas, var(--bg-secondary))` to `@theme inline` (enables `bg-canvas` utility) | Surface §2 | [ ] |
| 1.S1 | Update Storybook decorator in `src/storybook/decorators/withAppProviders.tsx`: `bg-background` → `bg-canvas` | Storybook §1.1 | [ ] |
| 1.S2 | Verify dark mode toggle wired in `.storybook/preview.ts` (light/dark `setTheme` via `addon-themes`) | Storybook §1.2 | [ ] |
| 1.S3 | Create `src/storybook/scenes/DesignSystem/ColorPalette.stories.tsx` — all semantic tokens with light/dark values | Storybook §2.1 | [ ] |
| 1.S4 | Create `src/storybook/scenes/DesignSystem/SpacingScale.stories.tsx` — 5 spacing tokens as labeled bars | Storybook §2.2 | [ ] |
| 1.S5 | Create `src/storybook/scenes/DesignSystem/ShadowElevation.stories.tsx` — all 5 elevation levels on `bg-canvas` | Storybook §2.3 | [ ] |
| 1.S6 | Create `src/storybook/scenes/DesignSystem/RadiusScale.stories.tsx` — 5 radius tokens with component context | Storybook §2.4 | [ ] |
| 1.S7 | Create `src/storybook/scenes/DesignSystem/Typography.stories.tsx` — all 4 font families + `prose-wiki` stack | Storybook §2.5 | [ ] |
| | **Phase 1 Gates** | | |
| | `bun run type-check` passes | Migration §4 | [ ] |
| | `bun run lint` passes | Migration §4 | [ ] |
| | `bun run build-storybook` passes | Storybook §5 | [ ] |
| | `.ai/rules/flowbite-alignment.md` exists and covers all mapping categories | Migration §4 | [ ] |
| | Dark mode screenshots captured for new token stories | Migration §4 | [ ] |
| | SlideToSubmit pre-phase grep: `grep -rn "SlideToSubmit" src/` confirms zero diffs | Identity Lock §3 | [ ] |
| | RevealBlock spot-check — no visual regression from token additions | Identity Lock §2.5 | [ ] |

---

## Phase 2: Missing Primitive Components
**Branch:** `design-system/phase-2-primitives`
**Status:** NOT STARTED
**Scope:** 6–8 new files in `src/components/ui/`, 6–8 new `.stories.tsx` files
**Depends on:** Phase 1 merged

| # | Task | Plan Source | Status |
|---|------|------------|--------|
| 2.1 | Create `ui/alert.tsx` — dismissible alert, CVA variants: `default \| destructive \| success \| warning \| info`. Ref: `flowbite/flowbite-mcp-pro-1.0.0/data/components/alerts.md` | Migration §4 | [ ] |
| 2.2 | Create `ui/table.tsx` — Table, TableHeader, TableBody, TableRow, TableHead, TableCell with `data-slot` pattern. Ref: `flowbite/flowbite-mcp-pro-1.0.0/data/components/tables.md` + `flowbite-react-blocks/app/application-ui/advanced-tables/` | Migration §4 | [ ] |
| 2.3 | Create `ui/pagination.tsx` — Previous/Next + page numbers, responsive compact on mobile. Ref: `flowbite/flowbite-mcp-pro-1.0.0/data/components/pagination.md` | Migration §4 | [ ] |
| 2.4 | Promote `shared/breadcrumb.tsx` → `ui/breadcrumb.tsx`: refactor as CVA + `data-slot` primitive, update 3 known import points (`developer/Breadcrumbs.tsx`, `shared/breadcrumb.stories.tsx`, `shared/index.ts`), add temporary barrel re-export in `shared/breadcrumb.tsx`, run `bun run build` to verify | Migration §4 | [ ] |
| 2.5 | Create `ui/stepper.tsx` — horizontal/vertical step indicator, states: active/complete/upcoming/error. Ref: `flowbite/flowbite-mcp-pro-1.0.0/data/components/stepper.md` | Migration §4 | [ ] |
| 2.6 | Create `ui/list-group.tsx` — styled list with optional icons, badges, interactive variant. Ref: `flowbite/flowbite-mcp-pro-1.0.0/data/components/list-group.md` | Migration §4 | [ ] |
| 2.S1 | Create `src/components/ui/alert.stories.tsx` — 8 stories: default, destructive, success, warning, info, dismissible (interaction test), bordered, dark mode grid | Storybook §3.1 | [ ] |
| 2.S2 | Create `src/components/ui/table.stories.tsx` — 6 stories: default, striped, hover, sticky header, with pagination, dark mode | Storybook §3.2 | [ ] |
| 2.S3 | Create `src/components/ui/pagination.stories.tsx` — 5 stories: default 7-page, compact, first-page active, last-page active, dark mode | Storybook §3.3 | [ ] |
| 2.S4 | Update `src/components/shared/breadcrumb.stories.tsx` → import from `@/components/ui/breadcrumb`. Stories: default (3-level), with icons, collapsed (ellipsis), dark mode | Storybook §3.4 | [ ] |
| 2.S5 | Create `src/components/ui/stepper.stories.tsx` — 5 stories: horizontal 3-step, vertical 3-step, all complete, error state, dark mode | Storybook §3.5 | [ ] |
| 2.S6 | Create `src/components/ui/list-group.stories.tsx` — 5 stories: default, with icons, with badges, interactive, dark mode | Storybook §3.6 | [ ] |
| 2.SB1 | Check `viteFinal` in `.storybook/main.ts` — add Vite alias mocks for any new server action imports from Phase 2 components | Storybook §1.3 | [ ] |
| | **Phase 2 Gates** | | |
| | `bun run build` passes | Migration §4 | [ ] |
| | `bun run build-storybook` passes | Storybook §5 | [ ] |
| | `bun run check:storybook` passes | Storybook §5 | [ ] |
| | Each new component has a `.stories.tsx` | Migration §4 | [ ] |
| | Dark mode screenshots captured for all new primitives | Migration §4 | [ ] |
| | SlideToSubmit pre-phase grep confirms zero diffs | Identity Lock §3 | [ ] |
| | RevealBlock spot-check — no regression | Identity Lock §2.5 | [ ] |

---

## Phase 3: Layout & Navigation Overhaul
**Branch:** `design-system/phase-3-navigation`
**Status:** NOT STARTED
**Scope:** 8–12 files modified
**Depends on:** Phase 2 merged

| # | Task | Plan Source | Status |
|---|------|------------|--------|
| 3.1 | Audit `shared/Navbar.tsx` — align spacing, height, interactive states (sticky, responsive collapse). Ref: `data/components/navbar.md` + `flowbite-react-blocks/app/application-ui/dashboard-navbars/` | Migration §4 | [ ] |
| 3.2 | Audit `shared/sidebar-nav.tsx` — consistent icon sizing (`w-5 h-5`), active state (left accent bar or `bg-primary/10`), hover transitions. Ref: `data/components/sidebar.md` + `flowbite-react-blocks/app/application-ui/side-navigation/` | Migration §4 | [ ] |
| 3.3 | Standardize `shared/DashboardHeader.tsx` — page title + breadcrumb + actions pattern from Flowbite CRUD layouts. Ref: `data/blocks/application/crud-layouts.md` | Migration §4 | [ ] |
| 3.4 | Audit `shared/Omnibar.tsx` — icon positioning, clear button, keyboard shortcut badge alignment. Ref: `data/forms/search-input.md` | Migration §4 | [ ] |
| 3.5 | Evaluate `shared/section-header.tsx` (canonical page header per memory) — Flowbite-aligned enhancement vs new `shared/page-header.tsx`. Create only if warranted. | Migration §4 | [ ] |
| 3.6 | Create `ui/bottom-navigation.tsx` — mobile bottom nav, 4–5 primary dashboard destinations (Home, Drills, Wiki, 3D Lab, Profile). Ref: `data/components/bottom-navigation.md` | Migration §4 | [ ] |
| 3.7 | Audit all navigation components for complete `focus-visible` states and keyboard accessibility | Migration §4 | [ ] |
| 3.SU1 | Replace `border-r border-border` → `bg-muted/40` fill in `app/developer/_components/DevPortalSidebar.tsx` | Surface §3 + §6 | [ ] |
| 3.SU2 | Replace `border-r border-zinc-200` → `bg-muted/30` fill in `app/dashboard/wiki/loading.tsx` | Surface §3 + §6 | [ ] |
| 3.SU3 | Replace `border-r` on input panel in `features/3d-lab/templates/CalculatorTemplate.tsx` → `bg-card` panel on `bg-background` canvas | Surface §3 + §6 | [ ] |
| 3.SU4 | Replace `border-r border-border` in `features/3d-lab/DevControlsModule/dashboard/DevControlsLabV2.tsx` → `bg-card` panel | Surface §3 + §6 | [ ] |
| 3.SU5 | Fix `border-[#D4DAE3]` (hardcoded hex!) in `app/admin/3d-models/_components/ModelRegistryPage.tsx` → `bg-card` panel, drop border | Surface §3 + §6 | [ ] |
| 3.SU6 | Update Card component default variant — add `shadow-card` option alongside existing `border` default | Surface §6 | [ ] |
| 3.SU7 | Add `bg-canvas` to dashboard layout wrappers where cards should float | Surface §6 | [ ] |
| 3.S1 | Update/add Navbar stories — desktop sticky note, mobile collapsed (375px), dark mode | Storybook §4.1 | [ ] |
| 3.S2 | Update/add sidebar-nav stories — `bg-muted/40` fill, active item, hover, dark mode (`bg-muted/20`) | Storybook §4.2 | [ ] |
| 3.S3 | Update/add DashboardHeader stories — title+breadcrumb+single action, multi-action, mobile 375px | Storybook §4.3 | [ ] |
| 3.S4 | Update/add Omnibar stories — default, focused+clear, with `⌘K` badge, dark mode | Storybook §4.4 | [ ] |
| 3.S5 | Create `src/components/ui/bottom-navigation.stories.tsx` — 4-item default, 5-item, active state parameterized, 375px viewport, dark mode | Storybook §3.7 | [ ] |
| 3.S6 | Update Card stories — border variant (unchanged), `shadow-card` on `bg-canvas` (L1), hover `shadow-sm` (L2), side-by-side comparison, dark mode | Storybook §4.19 | [ ] |
| 3.S7 | Update DashboardPageSkeleton stories — skeleton cards with `shadow-card`, on `bg-canvas` wrapper, dark mode | Storybook §4.20 | [ ] |
| 3.S8 | Update Skeleton stories — card-shaped with `shadow-card`, verify matches card treatment | Storybook §4.21 | [ ] |
| | **Phase 3 Gates** | | |
| | Manual screenshot comparison of `/dashboard`, `/admin`, `/developer`, `/ceo` — desktop (1440px) and mobile (375px) light + dark | Migration §4 | [ ] |
| | Screenshots saved in `.ai/plans/screenshots/phase-3/` | Migration §4 | [ ] |
| | `bun run build` passes | Migration §4 | [ ] |
| | `bun run build-storybook` passes | Storybook §5 | [ ] |
| | `bun run check:storybook` passes | Storybook §5 | [ ] |
| | Zero `border-r` layout separators remaining in the 5 target files | Surface §3 | [ ] |
| | Hardcoded `#D4DAE3` removed from `ModelRegistryPage.tsx` | Surface §1 | [ ] |
| | SlideToSubmit pre-phase grep confirms zero diffs | Identity Lock §3 | [ ] |
| | RevealBlock spot-check — no regression | Identity Lock §2.5 | [ ] |

---

## Phase 4: Form Elements & Interactive Components
**Branch:** `design-system/phase-4-forms`
**Status:** NOT STARTED
**Scope:** 9–14 files modified (11 forms across 9 files)
**Depends on:** Phase 2 merged (can run parallel with Phase 3)

| # | Task | Plan Source | Status |
|---|------|------------|--------|
| 4.1 | Enforce `FormField` wrapper across all 11 active forms — Label + Input + Helper text + Error text as atomic group. Ref: `data/forms/input-field.md`. Files: `onboarding/OnboardingForm.tsx`, `onboarding/comp-exam/ScoreEntryForm.tsx`, `forgot-password/page.tsx`, `pods/CreatePodModal.tsx`, `pods/JoinPodForm.tsx`, `settings/profile-card.tsx`, `admin/settings/page.tsx` (2 forms), `ceo/FinancialEntryForm.tsx`, `analytics/ExamOutcomeForm.tsx` | Migration §4 | [ ] |
| 4.2 | Audit `ui/select.tsx` — dropdown alignment, max-height, search support. Ref: `data/forms/select.md` | Migration §4 | [ ] |
| 4.3 | Audit `ui/checkbox.tsx` — sizing, label spacing, group layout. Ref: `data/forms/checkbox.md` | Migration §4 | [ ] |
| 4.4 | Audit `ui/radio-group.tsx` — sizing, label spacing, horizontal layout option. Ref: `data/forms/radio.md` | Migration §4 | [ ] |
| 4.5 | Audit `ui/switch.tsx` — size variants, label placement, disabled state. Ref: `data/forms/toggle.md` | Migration §4 | [ ] |
| 4.6 | Audit `ui/textarea.tsx` — auto-resize, character count, helper text support. Ref: `data/forms/textarea.md` | Migration §4 | [ ] |
| 4.7 | Audit `ui/input-group.tsx` — prefix/suffix icon groups, button addons. Ref: `data/forms/input-field.md` | Migration §4 | [ ] |
| 4.8 | Audit all form components for consistent `aria-invalid` + `aria-describedby` patterns | Migration §4 | [ ] |
| 4.9 | Update quiz interaction forms (`SocraticExplorer.tsx`, `FormulaBlock.tsx`) to use consistent form field patterns | Migration §4 | [ ] |
| 4.S1 | Create/update `src/components/ui/form-field.stories.tsx` — 7 stories: label+input, +helper, +error (aria-invalid), required, disabled, all element types | Storybook §4.5 | [ ] |
| 4.S2 | Update Select stories — default, with search, disabled, error state, dark mode | Storybook §4.6 | [ ] |
| 4.S3 | Update Checkbox stories — default, checked, indeterminate, disabled, group, error, dark mode | Storybook §4.7 | [ ] |
| 4.S4 | Update RadioGroup stories — default 3-option, horizontal layout, disabled option, error, dark mode | Storybook §4.7 | [ ] |
| 4.S5 | Update Switch stories — off, on, label left/right, disabled both states, size variants | Storybook §4.8 | [ ] |
| 4.S6 | Update Textarea stories — default, character count, auto-resize, error, disabled | Storybook §4.9 | [ ] |
| | **Phase 4 Gates** | | |
| | All 11 forms render correctly in their portal pages | Migration §4 | [ ] |
| | `bun run build` passes | Migration §4 | [ ] |
| | `bun run build-storybook` passes | Storybook §5 | [ ] |
| | `bun run check:storybook` passes | Storybook §5 | [ ] |
| | `@storybook/addon-a11y` shows no violations on new form stories | Storybook §5 | [ ] |
| | Dark mode screenshots captured for all form components | Migration §4 | [ ] |
| | SlideToSubmit pre-phase grep confirms zero diffs | Identity Lock §3 | [ ] |

---

## Phase 5: Feedback & Data Display Components
**Branch:** `design-system/phase-5-feedback`
**Status:** NOT STARTED
**Scope:** 8–12 files modified
**Depends on:** Phase 2 merged (can run parallel with Phases 3–4)

| # | Task | Plan Source | Status |
|---|------|------------|--------|
| 5.1 | Integrate `ui/alert.tsx` (from Phase 2) into existing notification/feedback patterns across portals | Migration §4 | [ ] |
| 5.2 | Audit `ui/toast.tsx` — align positioning, animation, and stacking with Flowbite toast patterns. Ref: `data/components/toast.md` | Migration §4 | [ ] |
| 5.3 | Audit `shared/stat-card.tsx` — icon placement, trend indicator, comparison text per Flowbite KPI card pattern | Migration §4 | [ ] |
| 5.4 | Audit `shared/data-table.tsx` — striped rows option, hover state, responsive scroll, backed by `ui/table.tsx` primitive. Ref: `data/components/tables.md` + `flowbite-react-blocks/app/application-ui/advanced-tables/`. Align with wiki MDX table styling from wiki plan §2 | Migration §4 | [ ] |
| 5.5 | Audit `ui/badge.tsx` — ensure all Flowbite variant coverage: default, dark, destructive, success, warning, info, accent. Ref: `data/components/badge.md` | Migration §4 | [ ] |
| 5.6 | Audit `shared/empty-state.tsx` — centered illustration + text + CTA pattern per Flowbite. | Migration §4 | [ ] |
| 5.7 | Audit `ui/progress.tsx` — label support, size variants (sm/md/lg), color variants (primary, success, warning, destructive). Ref: `data/components/progress.md` | Migration §4 | [ ] |
| 5.8 | Create `ui/indicator.tsx` if needed — notification dot/badge overlay. Ref: `data/components/indicators.md` | Migration §4 | [ ] |
| 5.9 | Update `shared/DashboardPageSkeleton.tsx` and `ui/skeleton.tsx` — `shadow-card` instead of `border border-border` where applicable. Ensure loading → loaded visual transition is seamless. | Migration §4 + Surface §6 | [ ] |
| 5.SU1 | Audit `shared/stat-card.tsx`, `shared/data-table.tsx`, `shared/action-card.tsx` for border→shadow-card migration candidates (cards on `bg-canvas` parent only) | Surface §6 | [ ] |
| 5.SU2 | Preserve borders on table internals — row dividers (`border-b`), header bottoms | Surface §6 | [ ] |
| 5.S1 | Update stat-card stories — default KPI, with trend indicator, with comparison text, grid of 4 on `bg-canvas` (verify `shadow-card`), dark mode | Storybook §4.10 | [ ] |
| 5.S2 | Update data-table stories — default (backed by `ui/table`), striped, hover, with pagination, column sort indicator, dark mode | Storybook §4.11 | [ ] |
| 5.S3 | Update Badge stories — all color variants, sizes, with dot indicator, pill shape, dark mode | Storybook §4.12 | [ ] |
| 5.S4 | Update empty-state stories — centered illustration+heading+description+CTA, text-only, dark mode | Storybook §4.13 | [ ] |
| 5.S5 | Update Progress stories — no label, with inline/above label, size variants, color variants, dark mode | Storybook §4.14 | [ ] |
| 5.S6 | Update Toast stories — default, success/warning/destructive, stacked (2), with action button, dark mode | Storybook §4.15 | [ ] |
| | **Phase 5 Gates** | | |
| | Manual screenshot comparison of dashboard analytics and quiz result screens in light + dark mode | Migration §4 | [ ] |
| | Screenshots saved in `.ai/plans/screenshots/phase-5/` | Migration §4 | [ ] |
| | `bun run build` passes | Migration §4 | [ ] |
| | `bun run build-storybook` passes | Storybook §5 | [ ] |
| | `bun run check:storybook` passes | Storybook §5 | [ ] |
| | Dark mode screenshots captured for all feedback/data components | Migration §4 | [ ] |
| | SlideToSubmit post-phase visual verification: drag → spring-back → cobalt fill → haptic | Identity Lock §3 | [ ] |
| | RevealBlock spot-check — no regression | Identity Lock §2.5 | [ ] |

---

## Phase 6: Marketing & Application Section Patterns
**Branch:** `design-system/phase-6-sections`
**Status:** NOT STARTED
**Scope:** Documentation + templates + marketing page components
**Depends on:** Phases 3–5 merged

| # | Task | Plan Source | Status |
|---|------|------------|--------|
| 6.1 | Document Flowbite-aligned section templates for: Hero, Feature grid, Pricing, FAQ, CTA, Footer. Sources: `data/blocks/marketing/` + `flowbite-react-blocks/app/marketing-ui/` | Migration §4 | [ ] |
| 6.2 | Create marketing page section components for `/`, `/about`, `/pricing` pages using documented templates | Migration §4 | [ ] |
| 6.3 | Document admin CRUD page pattern (list view + create/edit modal + detail view). Ref: `data/blocks/application/crud-layouts.md` | Migration §4 | [ ] |
| | **Phase 6 Gates** | | |
| | Pattern documentation reviewed and approved | Migration §4 | [ ] |
| | Marketing sections render in Storybook | Migration §4 | [ ] |
| | `bun run build` passes | Migration §4 | [ ] |
| | `bun run lint` passes | Migration §4 | [ ] |

---

## Wiki Phase W1: Typography & Tables
**Branch:** `design-system/wiki-w1-typography`
**Status:** NOT STARTED
**Scope:** 2 files changed (`globals.css`, `mdx-components-shared.ts`)
**Depends on:** Migration Phase 1 merged (token mapping)

| # | Task | Plan Source | Status |
|---|------|------------|--------|
| W1.1 | Update `prose-wiki` h2 styles in `globals.css`: add `first:mt-0 mt-10 tracking-tight` | Wiki §1 | [ ] |
| W1.2 | Update `prose-wiki` h3 styles: `text-base font-semibold mt-7` → `text-lg font-semibold mt-8 mb-3` | Wiki §1 | [ ] |
| W1.3 | Add `prose-wiki` h4 styles (new): `text-[15px] font-semibold mt-6 mb-2 text-foreground/80` | Wiki §1 | [ ] |
| W1.4 | Add blockquote styling to `prose-wiki`: `border-l-[3px] border-primary/20 pl-4 italic text-foreground/70` | Wiki §1 | [ ] |
| W1.5 | Refine list item spacing in `prose-wiki`: `[&_li]:mb-1.5 [&_li]:leading-relaxed` | Wiki §1 | [ ] |
| W1.6 | Update HR in `prose-wiki`: `my-10` → `my-12 border-wiki-divider` | Wiki §1 | [ ] |
| W1.7 | Replace table element mappings in `mdx-components-shared.ts` — table wrapper with `rounded-md border`, cobalt-tinted `thead` (`bg-primary-50 sticky top-0 z-10`), `th` with DM Mono uppercase Camp Cobalt accent, `td` with refined padding | Wiki §2 | [ ] |
| W1.8 | Add `tr` mapping to `mdx-components-shared.ts`: `even:bg-muted/30 hover:bg-primary-50/50 transition-colors duration-100` | Wiki §2 | [ ] |
| W1.9 | Test table rendering with 5+ representative wiki articles containing tables | Wiki §2 | [ ] |
| W1.S1 | Create `src/storybook/scenes/Wiki/MDXTable.stories.tsx` — default (striped/hover/cobalt header), scrollable, sticky header, dark mode | Storybook §4.18 | [ ] |
| | **Wiki W1 Gates** | | |
| | Visual comparison of 3 table-heavy articles before/after | Wiki §5 | [ ] |
| | `bun run build` passes | Wiki §5 | [ ] |
| | `bun run build-storybook` passes | Wiki §5 | [ ] |
| | Atkinson Hyperlegible preserved — no font changes | Wiki §constraints | [ ] |
| | TOC anchor links still function with updated heading margins | Wiki §5 W3.5 note | [ ] |

---

## Wiki Phase W2: Callout Refinement
**Branch:** `design-system/wiki-w2-callout`
**Status:** NOT STARTED
**Scope:** 1 file changed (`Callout.tsx`)
**Depends on:** W1 merged (recommended) or can run standalone

| # | Task | Plan Source | Status |
|---|------|------------|--------|
| W2.1 | Add `bordered` prop to `Callout.tsx` — when true, uses `border-l-[3px]` accent instead of full border | Wiki §3 | [ ] |
| W2.2 | Increase icon size in `Callout.tsx` from 16px → 18px | Wiki §3 | [ ] |
| W2.3 | Add `action` prop to `Callout.tsx`: `action?: { label: string; href?: string; onClick?: () => void }` | Wiki §3 | [ ] |
| W2.4 | Adjust outer margin in `Callout.tsx`: `my-6` → `my-7` | Wiki §3 | [ ] |
| W2.S1 | Update Callout Storybook stories — add `bordered` prop, `action` prop, icon at 18px visual check, dark mode for each new prop | Wiki §5 + Storybook §4.16 | [ ] |
| W2.S2 | Verify all 12 existing Callout variant stories still pass `bun run check:storybook` | Storybook §4.16 | [ ] |
| | **Wiki W2 Gates** | | |
| | `bun run build-storybook` passes | Wiki §5 | [ ] |
| | Callout stories render correctly in Storybook for all new props | Wiki §5 | [ ] |
| | Colors unchanged — no variant color mapping modified | Wiki §3 | [ ] |

---

## Wiki Phase W3: Widget Containers
**Branch:** `design-system/wiki-w3-widgets`
**Status:** NOT STARTED
**Scope:** 2 new files, ~20 modified files (registry.ts + all widget files for container extraction)
**Depends on:** W1 merged

| # | Task | Plan Source | Status |
|---|------|------------|--------|
| W3.0 | Strip outermost container markup (border, padding, border-radius) from ALL widgets listed below before integrating WidgetContainer. 14 occurrences of `rounded-lg`/`rounded-[10px]` must be normalized to `rounded-md`. This must precede W3.1 to avoid double borders/double padding. | Wiki §5 | [ ] |
| W3.1 | Create `src/components/wiki/widgets/WidgetContainer.tsx` — props: `label: string`, `children: ReactNode`, `interactive?: boolean`. Pattern: `rounded-md border border-border bg-card not-prose p-4`, eyebrow label (DM Mono 10px uppercase muted), optional `shadow-sm` on hover for interactive | Wiki §4 | [ ] |
| W3.2 | Integrate `WidgetContainer` into `resolveWidgets()` in `registry.ts` — applied automatically at resolver level | Wiki §4 | [ ] |
| W3.3 | Create `src/components/wiki/widgets/WidgetContainer.stories.tsx` — static display, interactive hover, stub widget slot, dark mode | Wiki §5 + Storybook §4.17 | [ ] |
| W3.4 | Test with 3 widget-heavy articles — verify container consistency, no layout regressions | Wiki §5 | [ ] |
| W3.5 | Verify TOC anchor links still work with updated heading margins from W1 | Wiki §5 | [ ] |
| | **Wiki W3 Gates** | | |
| | All 18 registered widgets render consistently with `WidgetContainer` | Wiki §5 | [ ] |
| | No widget has its own outer border/padding after W3.0 strip | Wiki §5 | [ ] |
| | All wiki widgets use `rounded-md` — zero `rounded-lg` or `rounded-[10px]` | Wiki constraints | [ ] |
| | `bun run build` passes | Wiki §5 | [ ] |
| | `bun run build-storybook` passes | Wiki §5 | [ ] |

---

## Component Migration Matrix

### Primitives (`src/components/ui/`) — 37 existing + 3 new = 40 total

| Component File | Current State | Target Phase | Story Exists | Status |
|----------------|--------------|-------------|-------------|--------|
| `accordion.tsx` | Existing | No change needed | ? | [ ] |
| `alert-dialog.tsx` | Existing | No change needed | ? | [ ] |
| `avatar.tsx` | Existing | No change needed | ? | [ ] |
| `badge.tsx` | Existing — audit variants | Phase 5.5 | ? | [ ] |
| `button.tsx` | Existing (9 variants, 10 sizes) | No change | Yes | ✅ |
| `calendar.tsx` | Existing | No change needed | ? | [ ] |
| `card.tsx` | Existing (6 variants, 3 sizes) | Phase 3 (shadow-card option) | Yes | [ ] |
| `checkbox.tsx` | Existing — audit | Phase 4.3 | ? | [ ] |
| `close-button.tsx` | Existing | No change needed | ? | [ ] |
| `command.tsx` | Existing | No change needed | ? | [ ] |
| `dialog.tsx` | Existing | No change needed | ? | [ ] |
| `dropdown-menu.tsx` | Existing | No change needed | ? | [ ] |
| `eyebrow.tsx` | Existing | No change needed | ? | [ ] |
| `form-field.tsx` | Existing — audit | Phase 4.1 | No → Yes | [ ] |
| `input.tsx` | Existing | No change needed | ? | [ ] |
| `input-group.tsx` | Existing — audit | Phase 4.7 | ? | [ ] |
| `label.tsx` | Existing | No change needed | ? | [ ] |
| `popover.tsx` | Existing | No change needed | ? | [ ] |
| `progress.tsx` | Existing — audit | Phase 5.7 | ? | [ ] |
| `progress-bar.tsx` | Existing | No change needed | ? | [ ] |
| `radio-group.tsx` | Existing — audit | Phase 4.4 | ? | [ ] |
| `resizable.tsx` | Existing | No change needed | ? | [ ] |
| `scroll-area.tsx` | Existing | No change needed | ? | [ ] |
| `select.tsx` | Existing — audit | Phase 4.2 | ? | [ ] |
| `separator.tsx` | Existing | No change needed | ? | [ ] |
| `sheet.tsx` | Existing | No change needed | ? | [ ] |
| `skeleton.tsx` | Existing — shadow-card update | Phase 5.9 | ? | [ ] |
| `slider.tsx` | Existing | No change needed | ? | [ ] |
| `spinner.tsx` | Existing | No change needed | ? | [ ] |
| `switch.tsx` | Existing — audit | Phase 4.5 | ? | [ ] |
| `tabs.tsx` | Existing | No change needed | ? | [ ] |
| `textarea.tsx` | Existing — audit | Phase 4.6 | ? | [ ] |
| `toast.tsx` | Existing — audit | Phase 5.2 | ? | [ ] |
| `toaster.tsx` | Existing | Phase 5.2 (companion) | ? | [ ] |
| `toolbar.tsx` | Existing | No change needed | ? | [ ] |
| `tooltip.tsx` | Existing | No change needed | ? | [ ] |
| `unified-slider.tsx` | Existing | No change needed | ? | [ ] |
| **`alert.tsx`** | **NEW** | **Phase 2.1** | No → Yes | [ ] |
| **`breadcrumb.tsx`** | **NEW (promoted from shared/)** | **Phase 2.4** | Existing → Updated | [ ] |
| **`bottom-navigation.tsx`** | **NEW** | **Phase 3.6** | No → Yes | [ ] |
| **`indicator.tsx`** | **NEW (if needed)** | **Phase 5.8** | No → Yes | [ ] |
| **`list-group.tsx`** | **NEW** | **Phase 2.6** | No → Yes | [ ] |
| **`pagination.tsx`** | **NEW** | **Phase 2.3** | No → Yes | [ ] |
| **`stepper.tsx`** | **NEW** | **Phase 2.5** | No → Yes | [ ] |
| **`table.tsx`** | **NEW** | **Phase 2.2** | No → Yes | [ ] |

---

### Shared (`src/components/shared/`) — 35 components

| Component File | Current State | Target Phase | Story Exists | Status |
|----------------|--------------|-------------|-------------|--------|
| `action-card.tsx` | Existing — border→shadow-card candidate | Phase 5.SU1 | ? | [ ] |
| `app-drawer.tsx` | Existing | No change needed | ? | [ ] |
| `breadcrumb.tsx` | Existing → **promoted to `ui/`** | Phase 2.4 (add barrel re-export) | Yes → Updated | [ ] |
| `CodeBlock.tsx` | Existing | No change needed | ? | [ ] |
| `content-sidebar.tsx` | Existing — `border-r` + `border-b` items | Phase 3.SU1 (via sidebar strategy) | ? | [ ] |
| `DashboardHeader.tsx` | Existing — standardize | Phase 3.3 | ? | [ ] |
| `DashboardPageSkeleton.tsx` | Existing — shadow-card update | Phase 5.9 | ? | [ ] |
| `data-table.tsx` | Existing — audit, back by `ui/table` | Phase 5.4 | ? | [ ] |
| `difficulty-bar.tsx` | Existing | No change needed | ? | [ ] |
| `empty-state.tsx` | Existing — audit | Phase 5.6 | ? | [ ] |
| `event-badge.tsx` | Existing | No change needed | ? | [ ] |
| `floating-panel.tsx` | Existing | No change needed | ? | [ ] |
| `InfoTooltip.tsx` | Existing | No change needed | ? | [ ] |
| `legal-citation-badge.tsx` | Existing | No change needed | ? | [ ] |
| `LogoutButton.tsx` | Existing | No change needed | ? | [ ] |
| `mode-button.tsx` | Existing | No change needed | ? | [ ] |
| `Navbar.tsx` | Existing — spacing/height/interactive states | Phase 3.1 | ? | [ ] |
| `NavigationProgress.tsx` | Existing | No change needed | ? | [ ] |
| `Omnibar.tsx` | Existing — align icon, clear button, kbd badge | Phase 3.4 | ? | [ ] |
| `PanelCollapseHandle.tsx` | Existing | No change needed | ? | [ ] |
| `question-card.tsx` | Existing | No change needed | ? | [ ] |
| `question-dot-navigator.tsx` | Existing | No change needed | ? | [ ] |
| `QuickStatsRow.tsx` | Existing | No change needed | ? | [ ] |
| `score-display.tsx` | Existing | No change needed | ? | [ ] |
| `section-header.tsx` | Existing — evaluate vs new page-header | Phase 3.5 | ? | [ ] |
| `sidebar-nav.tsx` | Existing — icon sizing, active state, hover | Phase 3.2 + Surface 3.SU1 | ? | [ ] |
| `SlatecampLoader.tsx` | Existing | No change needed | ? | [ ] |
| `SourceBadge.tsx` | Existing | No change needed | ? | [ ] |
| `stat-card.tsx` | Existing — KPI pattern, border→shadow-card | Phase 5.3 + 5.SU1 | ? | [ ] |
| `student-view-watermark.tsx` | Existing | No change needed | ? | [ ] |
| `taxonomy-picker.tsx` | Existing | No change needed | ? | [ ] |
| `taxonomy-tree.tsx` | Existing | No change needed | ? | [ ] |
| `ThemeProvider.tsx` | Existing | No change needed | ? | [ ] |
| `ThemeToggle.tsx` | Existing | No change needed | ? | [ ] |
| `WikiSidePanel.tsx` | Existing | No change needed | ? | [ ] |

---

### Wiki Blocks (`src/components/wiki/blocks/`) — 30 files

| Component | Migration Relevance | Target Phase | Status |
|-----------|-------------------|-------------|--------|
| `Accordion.tsx` | No change needed | — | ✅ |
| `AlertBox.tsx` | No change needed | — | ✅ |
| `AuthorityContent.tsx` | No change needed | — | ✅ |
| `Callout.tsx` | `bordered` prop, icon 16→18px, `action` prop, `my-6`→`my-7` | Wiki W2 | [ ] |
| `ComparisonTable.tsx` | No change — renders via `React.createElement`, bypasses MDX `tr` mapping | — | ✅ |
| `ElaborativeInterrogation.tsx` | No change needed | — | ✅ |
| `ExamTip.tsx` | No change needed | — | ✅ |
| `FormulaBlock.tsx` | Consistent form field pattern | Phase 4.9 | [ ] |
| `GenericBlock.tsx` | No change needed | — | ✅ |
| `InlineQuiz.tsx` | No change needed | — | ✅ |
| `KeyValues.tsx` | No change needed | — | ✅ |
| `LawCallout.tsx` | No change needed | — | ✅ |
| `Mermaid.tsx` | No change needed | — | ✅ |
| `PrequestionGate.tsx` | No change needed | — | ✅ |
| `ProcessFlow.tsx` | No change needed | — | ✅ |
| `RevealBlock.tsx` | WATCH ITEM — `@use-gesture/react`, zero hardcoded hex fallbacks, token-vulnerable | All phases (spot-check) | [ ] |
| `SubjectSnapshot.tsx` | No change needed | — | ✅ |
| `TeachBackPrompt.tsx` | No change needed | — | ✅ |
| `WikiAccordion.tsx` | No change needed | — | ✅ |
| `WikiCallout.tsx` | No change needed | — | ✅ |
| `WikiCalloutBox.tsx` | No change needed | — | ✅ |
| `WikiChangedPill.tsx` | No change needed | — | ✅ |
| `WikiExamTable.tsx` | No change — renders via `React.createElement`, bypasses MDX `tr` mapping | — | ✅ |
| `WikiMistakeCard.tsx` | No change needed | — | ✅ |
| `WikiMistakeList.tsx` | No change needed | — | ✅ |
| `WikiPartHeader.tsx` | No change needed | — | ✅ |
| `WikiPre.tsx` | No change needed | — | ✅ |
| `WikiTabs.tsx` | No change needed | — | ✅ |
| `WrongAnswerBanner.tsx` | No change needed | — | ✅ |

---

### Wiki Widgets (`src/components/wiki/widgets/`) — All registered widgets

> **W3.0 prerequisite:** Strip outermost container (border, padding, border-radius) from each widget before WidgetContainer integration. 14 occurrences of `rounded-lg`/`rounded-[10px]` must be normalized to `rounded-md` as part of W3.0.

#### BP 344 — Accessibility Widgets (`widgets/bp344/`)

| Widget File | W3.0 Container Stripped | `rounded-md` Applied | WidgetContainer Integrated | Status |
|-------------|------------------------|---------------------|--------------------------|--------|
| `ComparisonTable.tsx` | [ ] | [ ] | [ ] | [ ] |
| `CorridorVisualizer.tsx` | [ ] | [ ] | [ ] | [ ] |
| `CubicleChecker.tsx` | [ ] | [ ] | [ ] | [ ] |
| `DoorConfigurator.tsx` | [ ] | [ ] | [ ] | [ ] |
| `GrabBarExplainer.tsx` | [ ] | [ ] | [ ] | [ ] |
| `RecallDrill.tsx` | [ ] | [ ] | [ ] | [ ] |
| `RecallPractice.tsx` | [ ] | [ ] | [ ] | [ ] |

#### DSGN-013 — Furniture & Body Dimension Widgets (`widgets/dsgn013/`)

| Widget File | W3.0 Container Stripped | `rounded-md` Applied | WidgetContainer Integrated | Status |
|-------------|------------------------|---------------------|--------------------------|--------|
| `BedroomPlanView.tsx` | [ ] | [ ] | [ ] | [ ] |
| `BedSizeComparator.tsx` | [ ] | [ ] | [ ] | [ ] |
| `BodyDimensionDrill.tsx` | [ ] | [ ] | [ ] | [ ] |
| `BodyDimensionExplorer.tsx` | [ ] | [ ] | [ ] | [ ] |
| `BodyDimensionPractice.tsx` | [ ] | [ ] | [ ] | [ ] |
| `DHRatioExplorer.tsx` | [ ] | [ ] | [ ] | [ ] |
| `DimensionDrill.tsx` | [ ] | [ ] | [ ] | [ ] |
| `DimensionPractice.tsx` | [ ] | [ ] | [ ] | [ ] |
| `ProportionComparator.tsx` | [ ] | [ ] | [ ] | [ ] |
| `ReachEnvelopeDiagram.tsx` | [ ] | [ ] | [ ] | [ ] |
| `SpatialQualityDrill.tsx` | [ ] | [ ] | [ ] | [ ] |
| `SpatialQualityPractice.tsx` | [ ] | [ ] | [ ] | [ ] |
| `WorkstationCalculator.tsx` | [ ] | [ ] | [ ] | [ ] |

#### Special Widgets

| Widget File | Notes | W3.0 Container Stripped | WidgetContainer Integrated | Status |
|-------------|-------|------------------------|--------------------------|--------|
| `Lab3DWidget.tsx` | Custom 3D container — evaluate for WidgetContainer compatibility | [ ] | [ ] | [ ] |

---

### Identity-Locked Components (NEVER MODIFY during migration)

| File | Lock Reason | Verification Each Phase |
|------|------------|------------------------|
| `src/components/quiz-v2/SlideToSubmit.tsx` | Sacrosanct brand interaction — hardcoded hex, spring easing, haptic feedback | Pre-phase grep + post-phase visual check |
| `src/lib/quiz/haptics.ts` | Haptic feedback functions for SlideToSubmit | Pre-phase grep |
| `src/components/quiz-v2/GestureCaptureZone.tsx` | Gesture capture wrapper for SlideToSubmit | Pre-phase grep |

---

## Merge Order & Parallelism

```
Phase 1 (tokens) ──────────────────────────────────────────────────► Phase 2 (primitives)
                                                                              │
                                                             ┌────────────────┼────────────────┐
                                                             │                │                │
                                                       Phase 3          Phase 4          Phase 5
                                                    (navigation)        (forms)       (feedback)
                                                             │                │                │
                                                             └────────────────┼────────────────┘
                                                                              │
                                                                        Phase 6 (marketing)

Wiki W1 ──► Wiki W2
Wiki W1 ──────────────────────────────────────────────────────────────► Wiki W3

Note: Recommended merge order for parallel phases: Phase 3 first → Phase 5 second → Phase 4 last.
Wiki phases can run independently of main phases after Phase 1 tokens land.
```

---

## Storybook Story Count Tracker

| Milestone | Target | Notes |
|-----------|--------|-------|
| Baseline (2026-04-06) | 63 | Confirmed operational |
| After Phase 1 | ~68 | +5 design system doc stories |
| After Phase 2 | ~75 | +6 new primitive stories (alert, table, pagination, breadcrumb update, stepper, list-group) |
| After Phase 3 | ~83 | +5 nav stories (Navbar, sidebar-nav, DashboardHeader, Omnibar, bottom-navigation) + 3 surface stories (Card, DashboardPageSkeleton, Skeleton) |
| After Phase 4 | ~89 | +6 form stories |
| After Phase 5 | ~96 | +6 feedback/data stories |
| After Wiki W1–W3 | ~99 | +3 wiki stories (MDXTable, WidgetContainer, Callout updates) |
| **Target** | **90+** | Tracker projects ~99. Target exceeded if all phases land. |

---

## Quick Reference: Key File Paths

| Category | Path |
|----------|------|
| Migration master plan | `.ai/plans/design_system_migration_plan.md` |
| Wiki upgrade plan | `.ai/plans/wiki_component_upgrade_plan.md` |
| Storybook upgrade plan | `.ai/plans/storybook_upgrade_plan.md` |
| Surface hierarchy plan | `.ai/plans/surface_hierarchy_plan.md` |
| Identity preservation lock | `.ai/plans/identity_preservation_lock.md` |
| Token alignment rules (to be created) | `.ai/rules/flowbite-alignment.md` |
| Phase screenshots | `.ai/plans/screenshots/phase-N/` |
| Flowbite component patterns | `flowbite/flowbite-mcp-pro-1.0.0/data/components/` |
| Flowbite React blocks | `flowbite/flowbite-react-blocks-1.8.0-beta/app/` |
| UI primitives | `src/components/ui/` |
| Shared application components | `src/components/shared/` |
| Wiki blocks | `src/components/wiki/blocks/` |
| Wiki widgets — BP344 | `src/components/wiki/widgets/bp344/` |
| Wiki widgets — DSGN013 | `src/components/wiki/widgets/dsgn013/` |
| Widget registry | `src/components/wiki/widgets/registry.ts` |
| Identity-locked: SlideToSubmit | `src/components/quiz-v2/SlideToSubmit.tsx` |
| Identity-locked: Haptics | `src/lib/quiz/haptics.ts` |
| Identity-locked: GestureCaptureZone | `src/components/quiz-v2/GestureCaptureZone.tsx` |
| Global CSS / token source | `src/app/globals.css` |
| Storybook decorator | `src/storybook/decorators/withAppProviders.tsx` |
| Storybook main config | `.storybook/main.ts` |
| Storybook preview | `.storybook/preview.ts` |
| Design system doc stories | `src/storybook/scenes/DesignSystem/` |

---

*Status key: `[ ]` not started — `[~]` in progress — `[x]` done*
*This tracker is the single source of truth. Update it as tasks complete — do not modify the source plan files.*
