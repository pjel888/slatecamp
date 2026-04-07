# Storybook Upgrade Plan: Design System Migration Companion

**Created:** 2026-04-07
**Status:** DRAFT
**Parent Plan:** `design_system_migration_plan.md`
**Companion Plans:** `surface_hierarchy_plan.md`, `wiki_component_upgrade_plan.md`

---

## Overview

SlateCamp runs Storybook 8.6.14 with 63 live stories across three discovery paths:
- `src/components/**/*.stories.@(ts|tsx)`
- `src/features/**/*.stories.@(ts|tsx)`
- `src/storybook/scenes/**/*.stories.@(ts|tsx)`

Addons: `@storybook/addon-essentials`, `@storybook/addon-a11y`, `@storybook/addon-interactions`, `@storybook/addon-themes`

Governance: `bun run check:storybook` runs before `storybook`, `build-storybook`, and `lint`. Every task in this plan must leave that check green.

This plan is a story-level companion to the parent migration plan. It does not describe component implementation — it describes what Storybook coverage must look like after each migration phase merges. Implementers working a migration phase are responsible for the corresponding Storybook tasks listed here.

---

## 1. Infrastructure Updates

### 1.1 Decorator Background Fix (Phase 1 — must land first)

**File:** `src/storybook/decorators/withAppProviders.tsx`

The current decorator wraps all stories in:
```tsx
<div className="min-h-screen bg-background font-sans text-foreground">
```

The surface hierarchy plan introduces `bg-canvas` as the new page-level background token (replaces the role of `bg-background` for page-level containers). After the `--canvas` token is added to `globals.css` in Phase 1, update the decorator to:
```tsx
<div className="min-h-screen bg-canvas font-sans text-foreground">
```

**Why it matters:** Cards and panels in stories use `shadow-card` for separation, which is only visible when they sit on `bg-canvas` (a slightly off-white warm gray). On a pure-white `bg-background`, the L1 shadow is imperceptible and the surface hierarchy collapses visually.

**Timing:** Must land in the same PR as Phase 1 (`design-system/phase-1-tokens`). The token must exist before the decorator references it.

### 1.2 Dark Mode Toggle Verification

`@storybook/addon-themes` is already installed. Verify the globals configuration in `.storybook/preview.ts` (or equivalent) exposes a theme toggle with at minimum `light` and `dark` options that maps to the `next-themes` `setTheme` call in `StorybookThemeSync`.

If the toggle is missing or only partially wired, add it in Phase 1 alongside the decorator fix. All new stories added in Phases 2–5 must be spot-checked in both modes before the phase branch merges.

### 1.3 Vite Alias Maintenance

When new server actions are created in Phases 2–5 that stories might import, add corresponding mock aliases to `viteFinal` in `.storybook/main.ts`. The existing pattern covers `@/lib/actions/wiki*`, `@/lib/actions/ei-prompts`, `@/lib/actions/notes-actions`, and `@/lib/actions/teach-back`. Any new action module imported by a story component must get a mock alias or a `parameters.moduleMock` entry — otherwise `bun run build-storybook` will fail silently at runtime.

---

## 2. Design System Documentation Stories

These are reference stories for the Slatecamp design system itself. They live in `src/storybook/scenes/DesignSystem/` and serve as the living style guide. All five should be created in Phase 1 so they can be used to visually verify token changes throughout Phases 2–5.

### 2.1 ColorPalette.stories.tsx

**Path:** `src/storybook/scenes/DesignSystem/ColorPalette.stories.tsx`

Show every named semantic token with its light and dark value:
- Camp Cobalt (primary-50 → primary-900 scale)
- Camp Orange
- Emerald (success scale)
- Warm Red (destructive scale)
- Amber (warning scale)
- Surface tokens: `bg-background`, `bg-canvas`, `bg-card`, `bg-muted`
- Foreground tokens: `text-foreground`, `text-muted-foreground`, `text-primary`, `text-success`, `text-destructive`, `text-warning`
- Border token: `border-border`

Each swatch should display the token name, Tailwind class, and hex value. Include a `dark` story variant so dark mode values are visible without switching the global toggle.

### 2.2 SpacingScale.stories.tsx

**Path:** `src/storybook/scenes/DesignSystem/SpacingScale.stories.tsx`

Visualize the Flowbite-aligned spacing tokens added in Phase 1:
- `--spacing-section` (24px)
- `--spacing-card` (16px)
- `--spacing-card-lg` (24px)
- `--spacing-form-gap` (16px)
- `--spacing-inline` (8px)

Show each as a colored bar with label, alongside the standard Tailwind 4px grid for reference context.

### 2.3 ShadowElevation.stories.tsx

**Path:** `src/storybook/scenes/DesignSystem/ShadowElevation.stories.tsx`

Show all five elevation levels from the surface hierarchy plan, each on a `bg-canvas` background so the shadow contrast is visible:

| Level | Token | Use case shown |
|-------|-------|---------------|
| L0 — Flat | `shadow-none` | Content section, no card |
| L1 — Resting | `shadow-card` | Card at rest |
| L2 — Hover | `shadow-sm` | Card on hover |
| L3 — Floating | `shadow-md` | Dropdown / popover |
| L4 — Modal | `shadow-lg` | Dialog / sheet |

The story must render all five cards side by side on `bg-canvas` in light mode. Include a dark mode story variant.

### 2.4 RadiusScale.stories.tsx

**Path:** `src/storybook/scenes/DesignSystem/RadiusScale.stories.tsx`

Show the five radius tokens with their pixel values and the component context where each applies:

| Token | Value | Applies to |
|-------|-------|-----------|
| `rounded-xs` | 2px | Badges, micro elements |
| `rounded-sm` | 4px | Buttons, inputs, chips |
| `rounded-md` | 6px | Cards, panels |
| `rounded-lg` | 8px | Modals, dialogs (cap) |
| `rounded-full` | 9999px | Avatars, pills |

Include a visual note that `rounded-xl` and above are prohibited in the SlateCamp system.

### 2.5 Typography.stories.tsx

**Path:** `src/storybook/scenes/DesignSystem/Typography.stories.tsx`

Document all four font families with sample text at each:
- `font-sans` (Atkinson Hyperlegible) — body text, all sizes `text-xs` through `text-2xl`
- `font-display` (Plus Jakarta Sans) — heading hierarchy h1–h4
- `font-syne` (Syne) — accent headings
- `font-mono` (DM Mono) — code, data values

Include a `prose-wiki` story showing the full article typography stack (h2, h3, h4, p, strong, code, blockquote, li, hr) so wiki changes in W1 can be visually validated here.

---

## 3. New Component Stories (Phase 2)

One `.stories.tsx` file per new primitive. All files go in `src/components/ui/` alongside their component file (matching the existing pattern, e.g., `button.stories.tsx` lives next to `button.tsx`).

### 3.1 alert.stories.tsx

**Covers:** `ui/alert.tsx` (task 2.1)

Required stories:
- Default (neutral/informational)
- Destructive
- Success
- Warning
- Info
- Dismissible (with visible close button, interaction test via `@storybook/addon-interactions`)
- Bordered variant (left-accent border style, for wiki callout alignment)
- All variants in dark mode (single dark story showing the full grid)

### 3.2 table.stories.tsx

**Covers:** `ui/table.tsx` (task 2.2)

Required stories:
- Default (3-column, 5-row sample)
- Striped rows
- Hover state
- Sticky header (story must be tall enough for scroll to be visible)
- With Pagination (composing `ui/pagination` — add after 2.3 ships)
- Dark mode variant

### 3.3 pagination.stories.tsx

**Covers:** `ui/pagination.tsx` (task 2.3)

Required stories:
- Default (7-page range, page 3 active)
- Compact/mobile (Previous + Next only)
- First page active (disable Previous)
- Last page active (disable Next)
- Dark mode variant

### 3.4 breadcrumb.stories.tsx

**Covers:** `ui/breadcrumb.tsx` (task 2.4 — promoted from `shared/`)

The existing `src/components/shared/breadcrumb.stories.tsx` must be updated to import from `@/components/ui/breadcrumb` after promotion. No new story file is needed if the existing one is moved and updated.

Required stories:
- Default (3-level: Home > Dashboard > Settings)
- With icons on items
- Collapsed (ellipsis for deep paths)
- Dark mode variant

### 3.5 stepper.stories.tsx

**Covers:** `ui/stepper.tsx` (task 2.5)

Required stories:
- Horizontal (3 steps: upcoming / active / complete states)
- Vertical (same 3 steps)
- All steps complete
- Step with error state
- Dark mode variant

### 3.6 list-group.stories.tsx

**Covers:** `ui/list-group.tsx` (task 2.6)

Required stories:
- Default (plain list, 4 items)
- With icons
- With badges (count indicators)
- Interactive (hover state, active item)
- Dark mode variant

### 3.7 bottom-navigation.stories.tsx

**Covers:** `ui/bottom-navigation.tsx` (task 3.6 — scheduled in Phase 3 but primitively built alongside Phase 2)

Required stories:
- Default (4 items: Home, Drills, Wiki, Profile)
- 5-item variant (add 3D Lab)
- Active state on each item (parameterized story)
- Rendered at 375px viewport width (use `parameters.viewport`)
- Dark mode variant

---

## 4. Existing Story Updates (Phases 3–5)

### Phase 3 — Navigation

#### 4.1 Navbar stories

**File:** find existing story in `src/components/shared/`

Add or update:
- Desktop with sticky behavior note (visual only — no scroll interaction test needed)
- Mobile collapsed state (375px viewport)
- Dark mode variant

#### 4.2 sidebar-nav stories

**File:** find existing story in `src/components/shared/`

Add or update:
- Default with `bg-muted/40` background fill (post surface plan change — was `border-r`)
- Active item (left-accent bar + `bg-primary/10`)
- Hover state
- Dark mode: sidebar slightly lighter than `bg-canvas` (`bg-muted/20`)

#### 4.3 DashboardHeader stories

**File:** find existing story in `src/components/shared/`

Add or update:
- Page title + Breadcrumb + single action button (Flowbite CRUD layout pattern)
- Page title + Breadcrumb + multi-action group
- Mobile layout (375px viewport, actions collapse)

#### 4.4 Omnibar stories

**File:** find existing story in `src/components/shared/`

Add or update:
- Default with placeholder text
- Focused with clear button visible
- With keyboard shortcut badge (`⌘K`)
- Dark mode variant

### Phase 4 — Forms

#### 4.5 FormField stories

**File:** find existing story or create `src/components/ui/form-field.stories.tsx`

Required stories:
- Label + Input (default)
- Label + Input + Helper text
- Label + Input + Error text (invalid state, `aria-invalid`)
- Required field (asterisk indicator)
- Disabled field
- All form elements in the field pattern: Input, Select, Textarea, Checkbox, RadioGroup, Switch

#### 4.6 Select stories

Add or update:
- Default (5 options)
- With search/filter input
- Disabled
- Error state
- Dark mode variant

#### 4.7 Checkbox and RadioGroup stories

Add or update:
- Checkbox: default, checked, indeterminate, disabled, group (3 options)
- RadioGroup: default (3 options), horizontal layout, disabled option
- Both: error state, dark mode

#### 4.8 Switch stories

Add or update:
- Default (off)
- Default (on)
- With label (left and right placement)
- Disabled (both states)
- Size variants if added

#### 4.9 Textarea stories

Add or update:
- Default
- With character count
- Auto-resize behavior
- Error state
- Disabled

### Phase 5 — Feedback and Data Display

#### 4.10 stat-card stories

**File:** find existing story in `src/components/shared/`

Add or update:
- Default KPI card (icon + metric + label)
- With trend indicator (up/down arrow + percentage)
- With comparison text ("vs last month")
- Grid of 4 cards on `bg-canvas` (to verify `shadow-card` separation)
- Dark mode variant

#### 4.11 data-table stories

**File:** find existing story in `src/components/shared/`

Add or update:
- Default (backed by `ui/table` primitive)
- Striped rows
- Hover state on rows
- With Pagination composited
- With column sorting indicator
- Dark mode variant

#### 4.12 Badge stories

Add or update:
- All color variants: default, dark, destructive, success, warning, info, accent
- Sizes if added
- With dot indicator
- Pill shape
- Dark mode variant

#### 4.13 empty-state stories

Add or update:
- Centered illustration + heading + description + CTA button (Flowbite pattern)
- Without illustration (text-only)
- Dark mode variant

#### 4.14 Progress stories

Add or update:
- Default (no label)
- With label (inline and above)
- Size variants (sm, md, lg)
- Color variants (primary, success, warning, destructive)
- Dark mode variant

#### 4.15 Toast stories

Add or update:
- Default (bottom-right, neutral)
- Success, Warning, Destructive variants
- Stacked (2 toasts)
- With action button
- Dark mode variant

### Wiki Changes (W1–W3)

#### 4.16 Callout stories

**File:** find existing story in `src/components/wiki/` or `src/storybook/scenes/`

Add or update (reflecting W2 changes):
- All 12 existing variants (already covered — verify still passing)
- New `bordered` prop (left-accent `border-l-[3px]` style)
- With `action` prop (link + button variants)
- Icon size bump to 18px (verify visual weight is correct in story)
- Dark mode variant for each new prop

#### 4.17 WidgetContainer stories

**File:** `src/components/wiki/widgets/WidgetContainer.stories.tsx` (new)

Required stories (reflecting W3 changes):
- Static display (label eyebrow + placeholder content)
- Interactive variant (hover border, `shadow-sm`)
- Representative widget slot (e.g., a stub table widget inside the container)
- Dark mode variant

#### 4.18 MDX Table stories

**File:** `src/storybook/scenes/Wiki/MDXTable.stories.tsx` (new or add to existing wiki scene)

Show the updated MDX table rendering (W1 changes):
- Default (striped rows, hover, cobalt header)
- Scrollable (overflow-x: auto with gradient indicator)
- Sticky header
- Dark mode variant

### Surface Hierarchy Changes

#### 4.19 Card stories

**File:** find existing story in `src/components/ui/`

Add or update:
- Default border variant (unchanged)
- New `shadow-card` variant on `bg-canvas` parent (L1 elevation)
- Hover → `shadow-sm` (L2 elevation)
- Side-by-side comparison: border card vs shadow card on `bg-canvas`
- Dark mode variant (verify shadow visibility on dark canvas)

#### 4.20 DashboardPageSkeleton stories

**File:** find existing story in `src/components/shared/`

Add or update:
- Skeleton cards using `shadow-card` treatment (not border)
- On `bg-canvas` wrapper to verify correct surface depth
- Dark mode variant

#### 4.21 Skeleton stories

Add or update:
- Card-shaped skeleton with `shadow-card` treatment
- Verify matches updated card shadow treatment from 4.19

---

## 5. Governance and Verification Protocol

Run these checks for every migration phase branch before merge:

```bash
bun run check:storybook     # Must pass — validates story file format and exports
bun run build-storybook     # Must pass — confirms no import/runtime errors
```

Manual checks (no automation):
- [ ] New and modified components render correctly in light mode
- [ ] New and modified components render correctly in dark mode (use theme toggle)
- [ ] Spot-check 5 existing unrelated stories for visual regression (confirm no decorator change broke them)
- [ ] `@storybook/addon-a11y` shows no violations on new component stories (check the A11y panel in dev mode)

If `bun run build-storybook` fails due to a missing Vite alias for a new server action import, add the alias to `.storybook/main.ts` `viteFinal` before the phase merges.

---

## 6. Implementation Schedule

| Migration Phase | Storybook Deliverables | Owner Timing |
|---|---|---|
| **Phase 1** (tokens) | Decorator `bg-canvas` fix (1.1), dark mode toggle verification (1.2), all 5 design system doc stories (2.1–2.5) | Same PR as Phase 1 |
| **Phase 2** (primitives) | 6 new story files: alert, table, pagination, breadcrumb (update), stepper, list-group (3.1–3.6) | Same PR as Phase 2 |
| **Phase 3** (navigation) | 4 story updates: Navbar, sidebar-nav, DashboardHeader, Omnibar + bottom-navigation story (4.1–4.4, 3.7) | Same PR as Phase 3 |
| **Phase 4** (forms) | 5 story updates/additions: FormField, Select, Checkbox+Radio, Switch, Textarea (4.5–4.9) | Same PR as Phase 4 |
| **Phase 5** (feedback/data) | 6 story updates: stat-card, data-table, Badge, empty-state, Progress, Toast (4.10–4.15) | Same PR as Phase 5 |
| **Wiki W1–W3** | 2 new story files (WidgetContainer, MDXTable) + 1 story update (Callout) (4.16–4.18) | Same PR as each wiki phase |
| **Surface** | 3 story updates: Card, DashboardPageSkeleton, Skeleton (4.19–4.21) | Same PR as surface changes |

**Story count target after all phases:** 63 existing + ~30 new or significantly updated = ~93 total stories

---

## 7. Constraints

- All stories must import from `@/` alias paths — no relative imports that would break if a file moves
- No story may import from `src/lib/actions/` directly — use existing Vite mock aliases or create new ones in `main.ts`
- Story files follow the existing naming pattern: `{component-name}.stories.tsx` co-located with the component file for `ui/` and `shared/` primitives; scene files go in `src/storybook/scenes/`
- Do not introduce `autodocs` tags on stories unless the component is a pure presentational primitive — the current `autodocs: 'tag'` config means any tagged story generates a docs page, which may conflict with the design system doc stories in section 2
- Never use `rounded-xl`, hardcoded hex values, `shadow-xl`, or transitions over 300ms in story wrapper divs — apply the same design system rules to story code that apply to production code

---

*This plan tracks Storybook coverage only. Component implementation details live in `design_system_migration_plan.md`, `wiki_component_upgrade_plan.md`, and `surface_hierarchy_plan.md`.*
