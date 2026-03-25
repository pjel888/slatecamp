# SlateCamp UI Consolidation — Implementation Plan

> **Source:** `UI-AUDIT-AND-CONSOLIDATION-STRATEGY.md` (2026-03-25 audit)
> **Principle:** Adoption, not creation. Every shared component already exists — this plan is about using them.
> **Phases:** 3 (per coarse-phase preference)

---

## Phase 1: Fix the Foundation

**Goal:** Make shared components correct before pushing adoption. Fix every design-system violation that lives inside `src/components/shared/` and `src/components/ui/` so migration targets are trustworthy.

**Estimated effort:** 2–3 hours

### Task 1.1 — Fix SectionHeader font sizes

**File:** `src/components/shared/section-header.tsx`

| Level | Current (VIOLATION) | Target |
|-------|-------------------|--------|
| `page` eyebrow | `text-[10px]` | `text-[11px]` |
| `section` eyebrow | `text-[9px]` | `text-[11px]` |
| `card` eyebrow | `text-[9px]` | `text-[11px]` |

**Before:**
```tsx
// line 17-18
page: {
  eyebrow: "font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-widest text-muted-foreground",
// line 24-25
section: {
  eyebrow: "font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-widest text-muted-foreground",
// line 29-30
card: {
  eyebrow: "font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5",
```

**After:**
```tsx
page: {
  eyebrow: "font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground",
section: {
  eyebrow: "font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground",
card: {
  eyebrow: "font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5",
```

**Acceptance:** All three levels render at 11px minimum. No visual regression on the 8 pages importing SectionHeader.

### Task 1.2 — Fix StatCard border radius

**File:** `src/components/shared/stat-card.tsx:83`

**Before:**
```tsx
const containerClasses = cn(
  'rounded-lg border border-border bg-card p-4 flex flex-col',
```

**After:**
```tsx
const containerClasses = cn(
  'rounded-md border border-border bg-card p-4 flex flex-col',
```

**Acceptance:** StatCard renders with `rounded-md` (8px). Check admin dashboard, developer hub, questions analytics.

### Task 1.3 — Compose SectionHeader with Eyebrow internally

**Files:** `src/components/shared/section-header.tsx`, `src/components/ui/eyebrow.tsx`

Refactor `SectionHeader` to use the `Eyebrow` component for the eyebrow span, ensuring font size is enforced from one canonical location.

**After:**
```tsx
import { Eyebrow } from '@/components/ui/eyebrow'

// In render:
{eyebrow && <Eyebrow className={levelOverrides[level]}>{eyebrow}</Eyebrow>}
```

**Acceptance:** `SectionHeader` eyebrow output is identical to standalone `<Eyebrow>`. Single source of truth for eyebrow typography.

### Task 1.4 — Consolidate getScoreColor into one export with hex variant

**Files:**
- `src/components/shared/score-display.tsx` (canonical — keep)
- `src/components/dashboard/results/ScoreHero.tsx` (delete local reimplementation)
- `src/components/graphics/tokens.ts` (delete local reimplementation, add hex variant to canonical)

Add a `getScoreColorHex()` export alongside `getScoreColor()` for Canvas/SVG use cases:

```tsx
// In score-display.tsx — add below existing getScoreColor
const getScoreColorHex = (value: number) => {
  if (value >= 70) return { main: '#2D9F6F', grad: '#34D399', glow: 'rgba(45,159,111,0.3)' }
  if (value >= 40) return { main: '#4A5568', grad: '#718096', glow: 'rgba(74,85,104,0.2)' }
  return { main: '#8896A7', grad: '#A0AEC0', glow: 'rgba(136,150,167,0.15)' }
}

export { ScoreDisplay, getScoreColor, getScoreColorHex }
```

Then update `ScoreHero.tsx` and `tokens.ts` to import from `@/components/shared/score-display`.

**Acceptance:** `grep -r "getScoreColor" src/` returns only `score-display.tsx` as the definition and importers as consumers. Zero local reimplementations.

### Task 1.5 — Delete dead code

**Files to delete:**
- `src/components/ui/AppleCloseButton.tsx` (0 imports, uses non-standard Phosphor Icons)

**Check:** Verify `@phosphor-icons/react` is still needed elsewhere. If only used by AppleCloseButton and a few other files, note for future cleanup.

**Acceptance:** File deleted. Build passes. No broken imports.

### Task 1.6 — Fix duration-500 violations

**Files:**
- `src/components/shared/score-display.tsx:100` — `transition: 'stroke-dashoffset 1s ease-out'`
  - Change to `transition: 'stroke-dashoffset 300ms ease-out'`
- `src/components/testing/session/StormTimerBar.tsx` — find and fix `duration-500`
  - Change to `duration-300`

**Acceptance:** `grep -r "duration-500\|duration-700\|duration-1000" src/components/` returns 0 results (excluding comments).

---

## Phase 2: Critical Student-Facing Fixes

**Goal:** Fix every issue that could mislead students about their scores or break their flow. This is the highest-ROI phase.

**Estimated effort:** 8–12 hours

### Task 2.1 — Fix red-for-scores violations (CRITICAL)

These files use red/destructive colors for low scores — forbidden by the design system. Red is reserved for functional errors only.

| File | Line | Current | Fix |
|------|------|---------|-----|
| `src/components/analytics/ReadinessTrajectory.tsx` | 37 | `text-destructive` for scores <50 | Import `getScoreColor` and use its return value |
| `src/components/assessment/ScoreReveal.tsx` | 19-24 | Red zone for scores <40 | Replace with amber/muted per getScoreColor logic |
| `src/components/dashboard/TaxonomyHeatmap.tsx` | 33-37 | Red for "danger" state | Replace with amber or muted-foreground |

**Acceptance:** `grep -rn "text-destructive\|text-red\|bg-red" src/components/analytics/ReadinessTrajectory.tsx src/components/assessment/ScoreReveal.tsx src/components/dashboard/TaxonomyHeatmap.tsx` returns 0 score-context results.

### Task 2.2 — ScoreDisplay adoption on student-facing pages

Find every component rendering a percentage or mastery score and replace with `<ScoreDisplay>`.

**Discovery command:**
```bash
grep -rn "font-mono.*tabular-nums\|tabular-nums.*font-mono" src/components/dashboard/ src/components/testing/ src/components/analytics/ src/components/trails/ src/components/assessment/ --include="*.tsx"
```

**Priority files (student-facing):**
1. `src/components/dashboard/results/ScoreHero.tsx` — replace ad-hoc score ring with `<ScoreDisplay variant="ring" size="xl">`
2. `src/components/testing/debrief/ScoreHero.tsx` — same pattern
3. `src/components/dashboard/SubjectMasteryCard.tsx` — replace ad-hoc mastery colors with `getScoreColor`
4. `src/components/dashboard/results/StatCards.tsx` — replace ad-hoc stat numbers with `<ScoreDisplay variant="number">`
5. `src/components/trails/TrailRibbon.tsx` — replace ad-hoc score coloring
6. `src/components/analytics/*` — audit all chart components for score color consistency

**Acceptance:** Import count for `ScoreDisplay` or `getScoreColor` from `@/components/shared/score-display` is 10+ (up from 0 real usage).

### Task 2.3 — Replace browser dialogs with ConfirmDialog

| File | Line | Current | Replacement |
|------|------|---------|-------------|
| `src/components/sidebar/Sidebar.tsx` | — | `window.confirm(...)` | `ConfirmDialog` from `@/components/ui/dialog` |
| `src/components/sidebar/MobileDrawer.tsx` | 154-156 | `window.confirm(...)` | `ConfirmDialog` |
| `src/components/ceo/FinancialLedger.tsx` | 101 | `confirm(...)` | `ConfirmDialog` |
| `src/components/notes/NotesShell.tsx` | 76 | `confirm(...)` | `ConfirmDialog` |

Each requires: add state for dialog open/close, wrap the confirmation action in the dialog's `onConfirm` callback.

**Acceptance:** `grep -rn "window\.confirm\|[^.]confirm(" src/ --include="*.tsx"` returns 0 results.

### Task 2.4 — Fix font-size violations across student-facing components

**Discovery command:**
```bash
grep -rn 'text-\[9px\]\|text-\[10px\]\|text-\[8px\]' src/components/ --include="*.tsx"
```

For each hit: change to minimum `text-[11px]` or use the `Eyebrow` / `SectionHeader` component.

**Key files:**
- `src/components/shared/taxonomy-picker.tsx:302` — `text-[9px]` ALE ID suffix
- `src/components/wiki/WikiPartHeader.tsx:6` — ad-hoc eyebrow
- `src/components/wiki/WikiSourcesPopover.tsx:69,81` — ad-hoc eyebrows
- `src/components/wiki/WikiRelatedPopover.tsx:77,89` — ad-hoc eyebrows
- `src/components/wiki/WikiExamTable.tsx:21,37` — table headers
- `src/components/wiki/WikiArticleHero.tsx:17,21,26,43` — badge headers
- `src/components/sidebar/SidebarFooter.tsx`, `SidebarNavItem.tsx`, `Sidebar.tsx` — sidebar text
- `src/components/ui/badge.tsx:39` — xs size variant (may be intentional — review)

**Acceptance:** `grep -rn 'text-\[8px\]\|text-\[9px\]\|text-\[10px\]' src/ --include="*.tsx"` returns 0 results (or only intentionally exempted cases documented with a `// INTENTIONAL: below 11px for [reason]` comment).

---

## Phase 3: Mass Adoption Campaign

**Goal:** Drive shared component adoption across admin, CEO, developer, and remaining surfaces. Clean up spinners, raw form elements, and ad-hoc tables.

**Estimated effort:** 30–40 hours (can be parallelized across files)

### Task 3.1 — Typography: SectionHeader + Eyebrow adoption

**Target:** Replace 180 ad-hoc `tracking-widest uppercase` patterns across 86 files.

**Strategy:** For each file containing `tracking-widest.*uppercase`:
- If it's an eyebrow + title + subtitle group → replace with `<SectionHeader>`
- If it's a standalone label → replace with `<Eyebrow>`
- If it's deeply embedded in custom layout → update font size to 11px minimum, add comment

**Priority order:**
1. Student-facing: `src/components/dashboard/`, `src/components/testing/`, `src/components/trails/`, `src/components/wiki/`, `src/components/analytics/`
2. Admin: `src/components/admin/`, `src/app/admin/`
3. CEO: `src/components/ceo/`, `src/app/(protected)/ceo/`
4. Developer: `src/components/developer/`, `src/app/developer/`

**Acceptance:** `SectionHeader` imports increase from 8 to 30+. `Eyebrow` imports increase from 1 to 15+.

### Task 3.2 — Tables: DataTable adoption

**Target:** Replace 23 raw `<table>` implementations with `DataTable` where the table is a data management interface (not content display).

**Migrate (data management tables):**
| File | Current | Migration Notes |
|------|---------|----------------|
| `src/components/ceo/FinancialLedger.tsx` | Custom table + sort + filter + pagination | Full DataTable migration |
| `src/components/ceo/CohortRetentionTable.tsx` | Custom table | DataTable with custom cell renderers |
| `src/components/ceo/TeamTable.tsx` | Custom table | DataTable migration |
| `src/components/admin/AuditLogViewer.tsx` | Custom table | DataTable migration |
| `src/components/admin/QuestionImporter.tsx` | Preview table | DataTable migration |
| `src/app/admin/settings/page.tsx:60-162` | Inline user role table | DataTable migration |
| `src/app/developer/status/database/page.tsx` | Custom table | DataTable migration |

**Keep as-is (content display tables):**
- `src/components/wiki/WikiExamTable.tsx` — content table in article
- `src/components/wiki/WikiArticle.tsx` — MDX content rendering
- `src/components/wiki/widgets/bp344/ComparisonTable.tsx` — educational widget

**Acceptance:** DataTable imports increase from 4 to 12+.

### Task 3.3 — Form elements: Shadcn Select + Checkbox migration

**Raw `<select>` → Shadcn `Select`:**
- `src/app/admin/settings/page.tsx` — role select
- `src/components/admin/ArticlePropertiesPanel.tsx:123,136`
- `src/components/admin/AssetUploader.tsx:162,176,191`
- `src/components/admin/AuditLogViewer.tsx:59,70`
- `src/components/admin/SMEReviewQueue.tsx:108`
- `src/components/admin/unified-editor/ContentBar.tsx:102,115`
- `src/app/dashboard/3d-lab/_components/GenericControlPanel.tsx:193`

**Raw `<input type="checkbox">` → Shadcn Checkbox:**
- `src/components/shared/data-table.tsx` — row selection checkboxes
- `src/components/admin/unified-editor/QuestionsPanel.tsx`
- `src/components/ceo/FinancialEntryForm.tsx`
- `src/components/testing/setup/CustomSetup.tsx`

**Raw radio buttons → Shadcn RadioGroup:**
- `src/app/(auth)/onboarding/_components/OnboardingForm.tsx:103-151`

**Acceptance:** `grep -rn '<select' src/ --include="*.tsx" | grep -v node_modules` returns only intentional cases. `grep -rn 'type="checkbox"' src/ --include="*.tsx"` returns 0 outside of `ui/` primitives.

### Task 3.4 — Spinners → Skeletons

Replace `animate-spin` with contextually appropriate skeleton or loading patterns.

**Replace with Skeleton:**
- `src/components/wiki/TeachBackPrompt.tsx:132`
- `src/components/dashboard/SubjectDrillSelector.tsx:196`
- `src/components/admin/unified-editor/ContentBar.tsx:162`

**Replace with inline loading pattern (small indicator):**
- `src/components/quiz/SaveIndicator.tsx:48` — use subtle opacity pulse instead of spinner
- `src/components/shared/TransitionLink.tsx:95` — use progress bar or NavigationProgress

**Review case-by-case (may be acceptable):**
- `src/components/ui/button.tsx:76` — inline button loading (common pattern, may keep)
- `src/components/ui/input.tsx:143` — search loading (common pattern, may keep)
- `src/components/3d/Workspace.tsx:285` — WebGL loading (contextually appropriate)
- `src/app/dashboard/3d-lab/_components/*.tsx` — WebGL loading
- `src/components/quiz/AITutorDrawer.tsx:133` — AI response loading (may keep as throbber)
- `src/components/shared/Omnibar.tsx:160,177` — search loading
- `src/components/assessment/AssessmentQuiz.tsx:167,198,345` — 3 instances, assess individually

**Acceptance:** `animate-spin` count drops from 16+ to <5 (only intentionally exempted cases).

### Task 3.5 — Module remediation: CEO + Notes + Wiki

**CEO dashboard (17 files):**
- Migrate `MetricCard` → `StatCard`
- Migrate 3 tables → `DataTable`
- Adopt `SectionHeader` for all eyebrow patterns
- Replace `confirm()` in `FinancialLedger`
- Adopt Shadcn form primitives

**Notes module (8 files):**
- Replace 15 raw `<button>` in `NotesEditor.tsx` with Shadcn `Button` / `IconButton`
- Replace 4 raw `<button>` in `NotesNavigator.tsx`
- Replace `confirm()` in `NotesShell.tsx`

**Wiki page (placeholder):**
- `src/app/dashboard/wiki/page.tsx` — remove `'use client'`, extract hardcoded colors to design tokens, replace placeholder with proper Server Component rendering

**Acceptance:** CEO components import 5+ shared components (up from 1). Notes components import 3+ Shadcn primitives (up from 0).

### Task 3.6 — Close button standardization

- Replace 2 ad-hoc close buttons in `src/components/wiki/Callout.tsx:179-189,219-230` with `<CloseButton>`
- Replace ad-hoc close button in `src/components/ceo/FinancialEntryForm.tsx` with `<CloseButton>`
- Migrate 8 raw `X` icon close patterns to `<CloseButton>` where appropriate

**Acceptance:** `CloseButton` imports increase from 7 to 12+.

---

## Verification Checklist (Run After Each Phase)

```bash
# 1. Build passes
bun run build

# 2. No forbidden patterns
grep -rn 'text-\[8px\]\|text-\[9px\]\|text-\[10px\]' src/ --include="*.tsx" | wc -l  # Target: 0
grep -rn 'window\.confirm\|[^.]confirm(' src/ --include="*.tsx" | wc -l              # Target: 0
grep -rn 'animate-spin' src/ --include="*.tsx" | wc -l                                # Target: <5
grep -rn 'duration-500\|duration-700\|duration-1000' src/components/ --include="*.tsx" | wc -l  # Target: 0

# 3. Shared component adoption metrics
grep -rn 'import.*SectionHeader' src/ --include="*.tsx" | wc -l    # Target: 30+
grep -rn 'import.*ScoreDisplay\|import.*getScoreColor' src/ --include="*.tsx" | wc -l  # Target: 10+
grep -rn 'import.*DataTable' src/ --include="*.tsx" | wc -l        # Target: 12+
grep -rn 'import.*EmptyState' src/ --include="*.tsx" | wc -l       # Target: 15+
grep -rn 'import.*Eyebrow' src/ --include="*.tsx" | wc -l          # Target: 15+
```

---

## Execution Notes

- **Phase 1 is a prerequisite** for Phases 2 and 3. Do not adopt shared components until their bugs are fixed.
- **Phase 2 tasks are independent** — Task 2.1 through 2.4 can run in parallel.
- **Phase 3 tasks are independent** — all 6 sub-tasks can be parallelized across developers or agents.
- **Each task should be a separate commit** with message format: `refactor(<surface>): migrate <pattern> to <SharedComponent>`
- **Visual regression check** after each commit — screenshot key pages before/after.
