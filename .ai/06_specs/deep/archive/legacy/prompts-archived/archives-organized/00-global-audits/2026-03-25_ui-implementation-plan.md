# SlateCamp — UI Consolidation Master Implementation Plan

> **Source:** `UI-AUDIT-AND-CONSOLIDATION-STRATEGY.md` (2026-03-25, 397 files audited)
> **Merged from:** `SLATECAMP-UI-MODULARIZATION-IMPLEMENTATION-PLAN.md` (Plan A, 8 phases) + `UI-CONSOLIDATION-IMPLEMENTATION-PLAN.md` (Plan B, 3 phases)
> **Executor:** Claude Code, Cursor, or any AI coding agent with filesystem access.
> **Estimated effort:** 50–70 developer-hours across 5 phases.
> **Principle:** Adoption, not creation. Every shared component already exists — this plan is about using them.

---

## ROLE & CONSTRAINTS

You are SlateCamp's Codebase Steward executing a UI consolidation. You follow the **Slatecamp design system** — every element earns its place. You follow the **Zero-Behavior-Change Rule** — refactors do not change logic.

### Hard Rules

1. **Read before writing.** Open every file fully before modifying it. Never edit from memory.
2. **One phase at a time.** Complete a phase, run `bun run build`, confirm zero errors, then proceed.
3. **No logic changes.** This is a visual/structural refactor only. If you are tempted to refactor business logic — STOP. Split into a separate task.
4. **Preserve all states.** Every component migration must handle: default, hover, active, focused, disabled, loading, empty, error. If the ad-hoc version handles a state the shared component doesn't, extend the shared component first.
5. **Absolute imports only.** All imports use `@/components/...` — never relative paths.
6. **Commit after each sub-task.** Message format: `refactor(<surface>): migrate <pattern> to <SharedComponent>`

### Design System Tokens (Source of Truth)

```
Colors:
  Camp Cobalt (primary):  #1B3FC4  — nav, links, active states
  Camp Cobalt 50:         #EEF2FC  — active backgrounds, tints
  Camp Cobalt 700:        #1535A8  — hover/pressed states
  Camp Orange:            #E8853A  — progress celebration, warm CTAs (use SPARINGLY)
  Emerald:                #2D9F6F  — success, mastery, correct answers
  Emerald 50:             #EDFAF4  — success backgrounds
  Warm Red:               #D64545  — functional errors ONLY (NEVER for low scores)
  Warm Red 50:            #FDF0F0  — error backgrounds
  Amber:                  #D4951A  — warning, developing skill
  Amber 50:               #FEF8ED  — warning backgrounds
  Surface Light:          #F8F7F5  — page background
  Surface Card:           #FFFFFF  — card backgrounds
  Ink Primary:            #1A2332  — main text
  Ink Secondary:          #4A5568  — supporting text
  Ink Tertiary:           #8896A7  — muted text

Score Color Logic (NON-NEGOTIABLE):
  ≥ 70%  → emerald text (signal-green)
  40–69% → neutral (text-foreground, no color signal)
  < 40%  → neutral with "Needs review" label — NEVER RED

Typography:
  Font family:    Inter, system fallbacks
  DM Mono 500:    labels, eyebrows, numbers, codes
  Eyebrow:        DM Mono, 11px MINIMUM, uppercase, tracking-widest, text-muted-foreground
  Min font size:  11px — NOTHING below this

Border radius:    rounded-md (8px) for cards, rounded-sm (6px) for buttons/inputs, rounded-lg (12px) for modals ONLY
Shadows:          shadow-none (cards rest), shadow-sm (cards hover), shadow-md (dropdowns), shadow-lg (modals ONLY)
                  FORBIDDEN: shadow-xl, shadow-2xl on non-modal elements
Animation max:    duration-300 (300ms) — FORBIDDEN: duration-500, duration-700, duration-1000
                  Exception: score ring reveal may use up to 300ms ease-out
```

---

## PHASE 0: FOUNDATION FIXES (Prerequisite — 2-3 hours)

**Objective:** Fix the shared components themselves before migrating anything to them. A broken foundation makes every migration inherit bugs.

### 0.1 — Fix SectionHeader Font Sizes

**File:** `src/components/shared/section-header.tsx`

**Problem:** Uses `text-[9px]` and `text-[10px]` for eyebrows — below the 11px minimum.

**Action:**
1. Open `src/components/shared/section-header.tsx`
2. Replace eyebrow font sizes across all three levels:
   - `text-[10px]` → `text-[11px]` (page level, line ~17)
   - `text-[9px]` → `text-[11px]` (section level, line ~24)
   - `text-[9px]` → `text-[11px]` (card level, line ~29)

```tsx
// BEFORE (lines 17, 24, 29)
page:    "font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
section: "font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-widest text-muted-foreground"
card:    "font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5"

// AFTER
page:    "font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
section: "font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
card:    "font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5"
```

**Bonus — Compose with Eyebrow internally:**

The `Eyebrow` component at `src/components/ui/eyebrow.tsx` already uses `text-[11px]`. Make `SectionHeader` use it:

```tsx
import { Eyebrow } from '@/components/ui/eyebrow'

// Replace the raw <span> eyebrow with:
{eyebrow && <Eyebrow className={levelClassNameOverrides[level]}>{eyebrow}</Eyebrow>}
```

This ensures 11px minimum is enforced from one canonical location.

**Verify:** `bun run build` → zero errors.

---

### 0.2 — Fix StatCard Border Radius

**File:** `src/components/shared/stat-card.tsx` (line ~83)

**Problem:** Uses `rounded-lg` — design system specifies `rounded-md` for cards.

```tsx
// BEFORE
'rounded-lg border border-border bg-card p-4 flex flex-col',

// AFTER
'rounded-md border border-border bg-card p-4 flex flex-col',
```

**Verify:** `bun run build` → zero errors.

---

### 0.3 — Consolidate getScoreColor Into Single Export

**Problem:** 3 separate implementations exist with incompatible signatures.

**Files to touch:**
1. `src/components/shared/score-display.tsx` — canonical source (KEEP + EXTEND)
2. `src/components/dashboard/results/ScoreHero.tsx` — local reimplementation (DELETE local, IMPORT from shared)
3. `src/components/graphics/tokens.ts` — hex variant reimplementation (DELETE local, IMPORT from shared)

**Action:**
1. Open `src/components/shared/score-display.tsx`
2. Verify `getScoreColor` matches the NON-NEGOTIABLE logic (≥70 green, 40-69 neutral, <40 neutral-never-red)
3. Add hex variant for Canvas/SVG contexts:
   ```tsx
   const getScoreColorHex = (value: number) => {
     if (value >= 70) return { main: '#2D9F6F', grad: '#34D399', glow: 'rgba(45,159,111,0.2)' }
     if (value >= 40) return { main: '#4A5568', grad: '#718096', glow: 'rgba(74,85,104,0.1)' }
     return { main: '#8896A7', grad: '#A0AEC0', glow: 'rgba(136,150,167,0.1)' }
     // NEVER red for low scores
   }

   export { ScoreDisplay, getScoreColor, getScoreColorHex }
   ```
4. Open `ScoreHero.tsx` — delete local score color logic, import `getScoreColor` from shared
5. Open `tokens.ts` — delete local score color function, import `getScoreColorHex` from shared

**Verify:** `grep -rn "getScoreColor" src/` → only `score-display.tsx` as definition, all others as importers.

---

### 0.4 — Install Shadcn Checkbox + Fix DataTable Internal Checkboxes

**File:** `src/components/shared/data-table.tsx`

**Problem:** The shared DataTable uses raw HTML `<input type="checkbox">` for row selection. Shadcn Checkbox does **not yet exist** in the project.

**Action:**
1. **Install Shadcn Checkbox first:**
   ```bash
   bunx --bun shadcn@latest add checkbox
   ```
2. Verify `src/components/ui/checkbox.tsx` was created
3. Open `src/components/shared/data-table.tsx`
4. Replace raw checkboxes with `<Checkbox>`:

```tsx
// BEFORE
<input type="checkbox" checked={...} onChange={...} className="rounded" aria-label="..." />

// AFTER
import { Checkbox } from '@/components/ui/checkbox'
<Checkbox checked={...} onCheckedChange={(checked) => ...} aria-label="..." />
```

**Note:** `onCheckedChange` returns `boolean | 'indeterminate'`, not an event. Adjust handlers accordingly. The DataTable header checkbox uses `indeterminate` state — Shadcn Checkbox supports this natively.

**Verify:** `bun run build` → zero errors. DataTable selection still works (test select-all + individual row selection).

---

### 0.5 — Delete Dead Code

**File to delete:** `src/components/ui/AppleCloseButton.tsx` (0 imports, dead code)

**Action:**
1. Confirm zero imports: `grep -r "AppleCloseButton" src/ --include="*.tsx" --include="*.ts"`
2. If zero: delete the file
3. **Do NOT remove `@phosphor-icons/react`** — it is used by other files (confirmed in `package.json` and grep shows multiple consumers including wiki widgets, sidebar, and trails components)

**Verify:** `bun run build` → zero errors.

---

### 0.6 — Fix Transition Duration Violations

**Files:**
- `src/components/shared/score-display.tsx:100` — `transition: 'stroke-dashoffset 1s ease-out'`
  - Change to `transition: 'stroke-dashoffset 300ms ease-out'`
- `src/components/testing/session/StormTimerBar.tsx` — find `duration-500`
  - Change to `duration-300`

**Verify:** `grep -rn "duration-500\|duration-700\|duration-1000" src/components/ --include="*.tsx"` → 0 results.

---

**PHASE 0 GATE:**
```bash
bun run build          # zero errors
bunx tsc --noEmit      # zero type errors (if configured)
```

---

## PHASE 1: CRITICAL STUDENT-FACING FIXES (8-12 hours)

**Objective:** Fix every issue that could mislead students about their scores or break their flow. Highest ROI phase.

### 1.1 — Kill All Red-for-Score Violations

**File 1:** `src/components/analytics/ReadinessTrajectory.tsx`
- Line ~37: Uses `text-destructive` for scores <50
- **Fix:** Import `getScoreColor` from `@/components/shared/score-display`, use its return value

**File 2:** `src/components/assessment/ScoreReveal.tsx`
- Lines ~19-24: Red zone color for scores <40
- **Fix:** Replace red zone with neutral. Scores below 40 get `text-foreground` + "Needs review" label. NEVER red.

**File 3:** `src/components/dashboard/TaxonomyHeatmap.tsx`
- Lines ~33-37: Red for "danger" state
- **EXCEPTION CHECK:** READ THE CONTEXT. If the red represents a heatmap node visualization state (not a percentage), this may be acceptable. If it's coloring a score → FORBIDDEN, fix it.

**File 4:** `src/components/dashboard/SubjectMasteryCard.tsx`
- Lines ~34-39: Custom mastery colors not using `getScoreColor`
- **Fix:** Import `getScoreColor` and use it for percentage-based coloring

**Verification protocol for each file:**
1. Open the file
2. Search for `red`, `destructive`, `danger`, `rose`, `#E63329`, `#D64545`
3. Determine if the red is for a SCORE/PERCENTAGE or FUNCTIONAL ERROR
4. If score → replace with `getScoreColor()` logic
5. If functional error → leave it
6. `bun run build` after each file

---

### 1.2 — ScoreDisplay Adoption on Student-Facing Pages

**Problem:** ScoreDisplay has 0 real-world usage.

**Discovery command:**
```bash
grep -rn "font-mono.*tabular-nums\|font-bold.*text-2xl.*%\|score.*%\|readiness.*score" src/components/dashboard/ src/components/testing/ src/components/trails/ src/components/analytics/ src/components/assessment/ --include="*.tsx"
```

**For each result:**
1. Open the file, identify the score display pattern
2. Replace with appropriate `ScoreDisplay` variant:
   - Large hero number → `<ScoreDisplay value={score} variant="number" size="xl" />`
   - Progress ring → `<ScoreDisplay value={score} variant="ring" size="lg" />`
   - Inline pill → `<ScoreDisplay value={score} variant="pill" />`
   - Progress bar → `<ScoreDisplay value={score} variant="bar" size="md" />`

**Priority order:**
1. `src/components/dashboard/results/ScoreHero.tsx` — replace ad-hoc ring
2. `src/components/testing/debrief/ScoreHero.tsx` — same pattern
3. `src/components/dashboard/results/StatCards.tsx` — stat numbers
4. `src/components/trails/TrailRibbon.tsx` — score coloring
5. `src/components/analytics/*` — chart components

**Verify:** ScoreDisplay import count reaches 10+ (up from 0).

---

### 1.3 — Replace Browser Dialogs

**Problem:** 4 files use native `confirm()` instead of the existing `ConfirmDialog`.

**Before changing:** Open `src/components/ui/dialog.tsx` and confirm `ConfirmDialog` exists and read its API. If it doesn't exist, use Shadcn `AlertDialog` instead.

| File | Location | Native Call | Replacement |
|------|----------|-------------|-------------|
| `src/components/sidebar/Sidebar.tsx` | — | `window.confirm('You have an active session...')` | State-driven ConfirmDialog |
| `src/components/sidebar/MobileDrawer.tsx` | ~154 | `window.confirm('You have an active session...')` | State-driven ConfirmDialog |
| `src/components/ceo/FinancialLedger.tsx` | ~101 | `confirm('Delete this entry?...')` | ConfirmDialog (destructive variant) |
| `src/components/notes/NotesShell.tsx` | ~76 | `confirm('Delete this note?')` | ConfirmDialog |

**Pattern for each replacement:**
```tsx
const [showConfirm, setShowConfirm] = useState(false)

// Where confirm() was called:
setShowConfirm(true)

// In JSX:
<ConfirmDialog
  open={showConfirm}
  onOpenChange={setShowConfirm}
  title="Active Session"
  description="You have an active session. Are you sure you want to leave?"
  onConfirm={() => { /* original confirm action */ }}
/>
```

**Verify:** `grep -rn "window\.confirm\|window\.alert\|window\.prompt\| confirm(" src/ --include="*.tsx"` → 0 results.

---

### 1.4 — Fix Font-Size Violations on Student-Facing Components

**Discovery:**
```bash
grep -rn 'text-\[9px\]\|text-\[10px\]\|text-\[8px\]' src/ --include="*.tsx"
```

**For each hit:** Change to minimum `text-[11px]` or replace with `Eyebrow` / `SectionHeader`.

**Key student-facing files:**
- `src/components/shared/taxonomy-picker.tsx:302` — `text-[9px]` ALE ID suffix
- `src/components/wiki/WikiPartHeader.tsx:6` — ad-hoc eyebrow
- `src/components/wiki/WikiSourcesPopover.tsx:69,81`
- `src/components/wiki/WikiRelatedPopover.tsx:77,89`
- `src/components/wiki/WikiExamTable.tsx:21,37`
- `src/components/wiki/WikiArticleHero.tsx:17,21,26,43`
- `src/components/sidebar/SidebarFooter.tsx`, `SidebarNavItem.tsx`, `Sidebar.tsx`

**Verify:** `grep -rn 'text-\[8px\]\|text-\[9px\]\|text-\[10px\]' src/ --include="*.tsx"` → 0 results (or only documented exceptions with `// INTENTIONAL:` comment).

---

**PHASE 1 GATE:**
```bash
bun run build
# Spot-check: Dashboard readiness score, quiz score reveal, analytics page — no red for low scores
```

---

## PHASE 2: STRUCTURAL CLEANUP (20-30 hours — sub-tasks are parallelizable)

**Objective:** Consolidate typography, form elements, and tables. These three workstreams are independent and can run in parallel.

### 2.1 — Typography: SectionHeader + Eyebrow Adoption

**Target:** Replace 180 ad-hoc `tracking-widest uppercase` patterns across 86 files.

**Triage command:**
```bash
grep -rn "tracking-widest.*uppercase\|uppercase.*tracking-widest" src/ --include="*.tsx" -l
```

**Classification for each file:**

| Pattern Type | Replacement |
|---|---|
| Full header (eyebrow + title + subtitle) | `<SectionHeader eyebrow="..." title="..." level="card\|section\|page" />` |
| Standalone label | `<Eyebrow>Label Text</Eyebrow>` |
| Inside table header or custom layout | Keep inline but fix font size to 11px minimum |

**Migration order (student-facing first):**

1. **Dashboard** (`src/components/dashboard/`) — `StatCards.tsx` (5), `ModeIntroScreen.tsx` (3), `SubjectDrillSelector.tsx` (3), `CustomSessionBuilder.tsx` (2), `results/ResultsActions.tsx` (2), others
2. **Testing** (`src/components/testing/`) — `SessionShell.tsx` (6), `ChillSessionBehavior.tsx` (5), `CampSessionBehavior.tsx` (5), `StormSessionBehavior.tsx` (1), others
3. **Quiz** (`src/components/quiz/`) — `QuizHeader.tsx` (4), `RationaleDrawer.tsx` (4), `AITutorDrawer.tsx` (4), `ConfirmSubmitSheet.tsx` (4), others
4. **Trails** (`src/components/trails/`) — `ActiveTrailBanner.tsx` (1), `RecommendedTrailCard.tsx` (1)
5. **Wiki** (`src/components/wiki/`) — `WikiArticleHero.tsx` (4), `WikiSidebar.tsx` (2), `WikiExamTable.tsx` (2), `WikiPartHeader.tsx` (1)
6. **Analytics** (`src/components/analytics/`)
7. **Admin** (`src/components/admin/`) — `unified-editor/ArticlePanel.tsx` (8), `ArticlePropertiesPanel.tsx` (2), `ComponentToolbar.tsx` (1)
8. **CEO** (`src/components/ceo/`) — `FinancialEntryForm.tsx` (5), `CohortRetentionTable.tsx` (3), `TeamTable.tsx` (3), `RunwayGauge.tsx` (3), `RevenueChart.tsx` (3), `RevenueExpenseChart.tsx` (1), `MetricCard.tsx` (1)

**After migration, verify remaining instances:**
```bash
grep -rn 'text-\[9px\]\|text-\[10px\]' src/ --include="*.tsx"  # Target: 0
```

**Acceptance:** SectionHeader imports: 8 → 50+. Eyebrow imports: 1 → 20+.

---

### 2.2 — Form Elements: Shadcn Select + Checkbox + RadioGroup

**Pre-check — Component availability (verified 2026-03-25):**
- `select.tsx` — EXISTS in `src/components/ui/`
- `checkbox.tsx` — **INSTALLED IN PHASE 0.4** (did not exist prior to this plan)
- `radio-group.tsx` — EXISTS in `src/components/ui/`

**2.2a — Raw `<select>` → Shadcn Select:**

| File | Lines | Context |
|------|-------|---------|
| `src/app/admin/settings/page.tsx` | ~162 | Role select |
| `src/components/admin/ArticlePropertiesPanel.tsx` | ~123, ~136 | Article metadata |
| `src/components/admin/AssetUploader.tsx` | ~162, ~176, ~191 | Asset management |
| `src/components/admin/AuditLogViewer.tsx` | ~59, ~70 | Log filtering |
| `src/components/admin/SMEReviewQueue.tsx` | ~108 | Review status |
| `src/components/admin/unified-editor/ContentBar.tsx` | ~102, ~115 | Editor controls |
| `src/app/dashboard/3d-lab/_components/GenericControlPanel.tsx` | ~193 | 3D controls |

**Pattern:**
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

**2.2b — Raw `type="checkbox"` → Shadcn Checkbox:**

| File | Context |
|------|---------|
| `src/components/admin/unified-editor/QuestionsPanel.tsx` | 2 checkboxes |
| `src/components/ceo/FinancialEntryForm.tsx` | 1 checkbox |
| `src/components/testing/setup/CustomSetup.tsx` | 1 checkbox |

**2.2c — Custom Radio Buttons → Shadcn RadioGroup:**

| File | Context |
|------|---------|
| `src/app/(auth)/onboarding/_components/OnboardingForm.tsx` | Lines ~103-151, peer-checked pattern |

**2.2d — Notes Module Raw Buttons → Shadcn Button:**

| File | Raw buttons |
|------|-------------|
| `src/components/notes/NotesEditor.tsx` | 15 raw `<button>` |
| `src/components/notes/NotesNavigator.tsx` | 4 raw `<button>` |

**Verify:** `grep -rn '<select\b' src/ --include="*.tsx" | grep -v node_modules | grep -v ui/select` → 0 raw selects.

---

### 2.3 — Tables: DataTable Adoption

**Pre-check:** Open `src/components/shared/data-table.tsx` and read its full API (columns, searchable, selectable, sortable, pageSize, etc.).

**Migrate (data management tables):**

| File | Current | Notes |
|------|---------|-------|
| `src/components/ceo/FinancialLedger.tsx` | Custom table + sort/filter/pagination | Full DataTable migration |
| `src/components/ceo/CohortRetentionTable.tsx` | Custom table | DataTable with custom cell renderers |
| `src/components/ceo/TeamTable.tsx` | Custom table | DataTable migration |
| `src/components/admin/AuditLogViewer.tsx` | Custom table | DataTable migration |
| `src/components/admin/QuestionImporter.tsx` | Preview table | DataTable migration |
| `src/app/admin/settings/page.tsx` | Inline user role table | DataTable migration |
| `src/app/developer/status/database/page.tsx` | Custom table | DataTable migration |
| `src/components/dashboard/ResultsSummary.tsx` | Results table | DataTable migration |

**Keep as-is (content display tables):**
- `src/components/wiki/WikiExamTable.tsx` — content table in article
- `src/components/wiki/WikiArticle.tsx` — MDX content rendering
- `src/components/wiki/widgets/bp344/ComparisonTable.tsx` — educational widget
- Developer pages (`api-reference`, `architecture`) — documentation tables (evaluate case-by-case)

**Acceptance:** DataTable imports: 4 → 12+.

---

**PHASE 2 GATE:**
```bash
bun run build
grep -rn '<select\b' src/ --include="*.tsx" | grep -v ui/   # Target: 0
grep -rn 'type="checkbox"' src/ --include="*.tsx" | grep -v ui/  # Target: 0
```

---

## PHASE 3: MODULE REMEDIATION + LOADING (15-20 hours — parallelizable)

**Objective:** Bring isolated "UI islands" (CEO, Notes, Assessment) into the design system. Replace forbidden spinners.

### 3.1 — CEO Dashboard Full Migration

**Problem:** 17 files, 1 Shadcn import. Complete island.

1. `MetricCard.tsx` → Replace with `StatCard` from `@/components/shared/stat-card`
   - Open both files. Map MetricCard props to StatCard props.
   - If StatCard is missing a prop MetricCard needs → EXTEND StatCard, don't fork it.
2. All CEO tables → already migrated in Phase 2.3
3. `FinancialEntryForm.tsx` → Adopt Shadcn Input, Select, Checkbox, Button
4. Chart components → Keep custom (Recharts wrappers), but their container cards should use `<Card>` from Shadcn and `<SectionHeader>` for titles
5. `CeoShell` wrapper → Evaluate if it can use `PortalLayout` from `@/components/portal/`. Admin and Developer use PortalLayout — CEO should too for consistency.

**Acceptance:** CEO components import 10+ shared/Shadcn components (up from 1).

---

### 3.2 — Notes Module Migration

1. Raw buttons → already migrated in Phase 2.2d
2. `NotesShell.tsx` `confirm()` → already migrated in Phase 1.3
3. Remaining files: adopt Shadcn `Input`, `Sheet`, `ScrollArea`, `Tooltip` where applicable
4. Search for ad-hoc card markup → replace with Shadcn `Card`

**Acceptance:** Notes components import 5+ Shadcn primitives (up from 0).

---

### 3.3 — Assessment Module Migration

1. `ScoreReveal.tsx` — red-for-score fixed in Phase 1.1
2. `AssessmentQuiz.tsx` — spinners fixed in 3.4, needs Shadcn Button/Card adoption
3. Other assessment files: review and adopt shared components

---

### 3.4 — Spinners → Skeletons

**Discovery:**
```bash
grep -rn 'animate-spin' src/ --include="*.tsx"
```

**Classify each spinner:**

| Context | Action |
|---|---|
| Full-area loading (replacing content) | Replace with `<Skeleton>` matching content layout |
| Inline button loading state | ACCEPTABLE — keep if inside Shadcn Button |
| WebGL/3D loading | ACCEPTABLE — 3D contexts may use spinners |
| Search/typing indicator | Evaluate — may be acceptable |
| Form submission | Replace with button loading state |

**Replace with Skeleton:**
- `src/components/wiki/TeachBackPrompt.tsx:132`
- `src/components/dashboard/SubjectDrillSelector.tsx:196`
- `src/components/admin/unified-editor/ContentBar.tsx:162`
- `src/components/assessment/AssessmentQuiz.tsx:167,198,345` — 3 instances

**Replace with inline loading pattern:**
- `src/components/quiz/SaveIndicator.tsx:48` — subtle opacity pulse
- `src/components/shared/TransitionLink.tsx:95` — progress bar or NavigationProgress

**Keep with justification comment:**
- `src/components/ui/button.tsx:76` — `{/* Spinner: inline button loading state */}`
- `src/components/ui/input.tsx:143` — `{/* Spinner: search input loading */}`
- `src/components/3d/Workspace.tsx:285` — `{/* Spinner: WebGL scene loading */}`
- `src/app/dashboard/3d-lab/_components/CanvasWrapper.tsx:52` — WebGL
- `src/app/dashboard/3d-lab/_components/LabViewport.tsx:78` — WebGL
- `src/components/quiz/AITutorDrawer.tsx:133` — evaluate (AI response throbber)
- `src/components/shared/Omnibar.tsx:160,177` — evaluate (search loading)

**Acceptance:** `animate-spin` count drops from 16+ to <5 (only justified exceptions with comments).

---

### 3.5 — TaxonomyPicker Adoption

**Problem:** 838-line component, 3 variants, 0 real usage.

**Action:**
1. Search for taxonomy selection UI: `grep -rn "taxonomy\|topic.*select\|subject.*pick" src/ --include="*.tsx" -l`
2. Check `src/components/shared/taxonomy-tree.tsx` — if it's a duplicate of TaxonomyPicker, evaluate which is more complete and consolidate.
3. For each custom taxonomy UI, replace with:
   ```tsx
   <TaxonomyPicker variant="dropdown" mode="single" nodes={nodes} value={id} onChange={setId} />
   ```

---

### 3.6 — QuestionCard Adoption

**Problem:** 450-line component, 4 variants, ~2 real imports.

**Action:**
1. Search: `grep -rn "question.*stem\|option.*select\|answer.*choice" src/components/testing/ src/components/quiz/ --include="*.tsx" -l`
2. For each custom question rendering, evaluate migration to `QuestionCard`

---

**PHASE 3 GATE:**
```bash
bun run build
grep -rn 'animate-spin' src/ --include="*.tsx" | wc -l  # Target: <5
```

---

## PHASE 4: ENFORCEMENT & POLISH (4-6 hours)

**Objective:** Clean up remaining violations, update documentation, add guardrails.

### 4.1 — Fix 'use client' on Page Components

| File | Action |
|------|--------|
| `src/app/dashboard/wiki/page.tsx` | Extract client logic to child component, remove directive |
| `src/app/dashboard/developer/design-system/page.tsx` | Same pattern |
| `src/app/admin/search/page.tsx` | Same pattern |

---

### 4.2 — Fix Shadow Violations

| File | Current | Target |
|------|---------|--------|
| `src/components/quiz/QuestionStem.tsx` | `shadow-xl` | `shadow-sm` |
| `src/components/dev/dev-toolbar.tsx` | `shadow-2xl` | `shadow-md` |
| `src/components/dev/demo-shell.tsx` | `shadow-xl` | `shadow-sm` |

---

### 4.3 — Close Button Standardization

1. Replace ad-hoc close buttons with `<CloseButton>`:
   - `src/components/wiki/Callout.tsx:179-189,219-230` — 2 instances
   - `src/components/ceo/FinancialEntryForm.tsx` — 1 instance
2. For files importing raw `X` icon for close functionality — evaluate migration to `CloseButton`

---

### 4.4 — Update Design System Gallery

**File:** `src/app/developer/design-system/page.tsx` (and/or `src/app/dashboard/developer/design-system/page.tsx`)

Ensure every shared component is showcased with ALL its variants:
- `ScoreDisplay` — ring, bar, pill, number × sm/md/lg/xl
- `SectionHeader` — page, section, card levels
- `StatCard` — with/without trend, with/without href
- `DataTable` — searchable, selectable, sortable
- `QuestionCard` — quiz, review, preview, compact
- `TaxonomyPicker` — dropdown, sidebar, inline
- `EmptyState` — multiple contexts
- `CloseButton` — ghost, subtle, destructive × sm/md/lg
- `Eyebrow` — standalone usage

---

### 4.5 — Add ESLint Guard (Optional)

If ESLint is configured, add to prevent regression:
```json
{
  "rules": {
    "no-restricted-globals": ["error", "alert", "confirm", "prompt"]
  }
}
```

---

### 4.6 — Final Verification Sweep

```bash
# Build
bun run build                           # MUST pass

# Zero browser dialogs
grep -rn "window\.confirm\|window\.alert\|window\.prompt\| confirm(" src/ --include="*.tsx"
# Expected: 0

# Zero forbidden font sizes
grep -rn 'text-\[9px\]\|text-\[10px\]\|text-\[8px\]' src/ --include="*.tsx"
# Expected: 0

# Zero dead code
grep -rn "AppleCloseButton" src/ --include="*.tsx"
# Expected: 0

# Score color audit
grep -rn "text-destructive\|text-red\|border-red\|bg-red" src/components/dashboard/ src/components/testing/ src/components/analytics/ src/components/assessment/ src/components/trails/ --include="*.tsx"
# Expected: 0 in score display contexts

# Forbidden transitions
grep -rn "duration-500\|duration-700\|duration-1000" src/components/ --include="*.tsx"
# Expected: 0

# Spinner count
grep -rn "animate-spin" src/ --include="*.tsx" | wc -l
# Expected: <5

# Adoption metrics
grep -rn "import.*SectionHeader" src/ --include="*.tsx" | wc -l    # Target: 50+
grep -rn "import.*ScoreDisplay\|import.*getScoreColor" src/ --include="*.tsx" | wc -l  # Target: 10+
grep -rn "import.*DataTable" src/ --include="*.tsx" | wc -l        # Target: 12+
grep -rn "import.*EmptyState" src/ --include="*.tsx" | wc -l       # Target: 15+
grep -rn "import.*Eyebrow" src/ --include="*.tsx" | wc -l          # Target: 20+
```

---

**PHASE 4 GATE:** All verification commands pass. Codebase is clean.

---

## DEPENDENCY GRAPH

```
Phase 0: Fix foundations ← PREREQUISITE for all
    ↓
Phase 1: Critical student-facing fixes (depends on Phase 0)
    ↓
Phase 2: Structural cleanup (depends on Phase 0)
    ├── 2.1 Typography (independent)
    ├── 2.2 Form elements (independent)
    └── 2.3 Tables (independent)
    ↓
Phase 3: Module remediation + loading (depends on Phases 0-1)
    ├── 3.1 CEO migration (independent)
    ├── 3.2 Notes migration (independent)
    ├── 3.3 Assessment migration (independent)
    ├── 3.4 Spinners (independent)
    ├── 3.5 TaxonomyPicker (independent)
    └── 3.6 QuestionCard (independent)
    ↓
Phase 4: Enforcement & polish (depends on all above)
```

**Parallelization:** Phase 2 sub-tasks (2.1, 2.2, 2.3) can run simultaneously. Phase 3 sub-tasks (3.1–3.6) can ALL run simultaneously. Maximum theoretical parallelism: 6 agents on Phase 3.

---

## SUCCESS METRICS

| Metric | Before | After |
|---|---|---|
| `ScoreDisplay` real imports | 0 | 15+ |
| `SectionHeader` real imports | 7 | 50+ |
| `Eyebrow` real imports | 1 | 20+ |
| `DataTable` real imports | 3 | 12+ |
| `EmptyState` real imports | 9 | 15+ |
| Ad-hoc `tracking-widest uppercase` | 180 across 86 files | <10 |
| Raw `<table>` (data management) | 23 | <5 (wiki content only) |
| Browser `confirm()`/`alert()` | 4 | 0 |
| `animate-spin` spinners | 16+ | <5 (justified only) |
| `text-[9px]`/`text-[10px]` violations | 18 | 0 |
| Raw `<select>` elements | 12+ | 0 |
| Raw `type="checkbox"` | 5+ | 0 |
| Notes module Shadcn imports | 0 | 5+ |
| CEO module Shadcn imports | 1 | 10+ |
| Dead code files | 1 | 0 |

---

## EXECUTION NOTES

- **Phase 0 is a hard prerequisite.** Do not adopt shared components until their bugs are fixed.
- **Phase 1 and Phase 2 can overlap** — Phase 1 tasks are independent of Phase 2 tasks, but both depend on Phase 0.
- **Phase 2 and Phase 3 sub-tasks are independently parallelizable** — ideal for multi-agent execution.
- **Commit after each sub-task.** Format: `refactor(<surface>): migrate <pattern> to <SharedComponent>`
- **Visual regression check** after each commit — screenshot key pages before/after.
- **If a shared component is missing a feature** needed by the ad-hoc version: EXTEND the shared component first, then migrate. Never leave the shared component less capable than the ad-hoc version it replaces.

---

*SlateCamp UI Consolidation Master Plan v2.0 — March 2026*
*Execute with Claude Code. One phase at a time. `bun run build` at every gate.*

