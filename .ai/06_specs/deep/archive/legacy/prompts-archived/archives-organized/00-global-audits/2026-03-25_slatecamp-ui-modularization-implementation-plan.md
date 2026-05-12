# SlateCamp — UI Modularization Implementation Plan

> **Source:** `UI-AUDIT-AND-CONSOLIDATION-STRATEGY.md` (2026-03-25, 397 files audited)
> **Purpose:** Step-by-step instructions to consolidate SlateCamp's UI into a clean, modular component system.
> **Executor:** Claude Code, Cursor, or any AI coding agent with filesystem access.
> **Estimated effort:** 50–70 developer-hours across 7 phases.

---

## ROLE & CONSTRAINTS

You are SlateCamp's Codebase Steward executing a UI consolidation. You follow the **Rams Standard** — every element earns its place. You follow the **Zero-Behavior-Change Rule** — refactors do not change logic.

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
  primary (Cobalt Blue):  #1B3FC4
  signal-gold:            #F5A623  — positive deltas ONLY
  signal-green:           #1B7A3C  — passing scores ≥70% ONLY
  signal-red:             #E63329  — functional errors ONLY (NEVER for low scores)
  camp-orange:            #E8853A  — single primary CTA accent
  trail-purple:           #534AB7  — Camp Trail system
  cream:                  #F2F0EB  — page backgrounds
  warm-white:             #F8F7F5  — card backgrounds

Score Color Logic (NON-NEGOTIABLE):
  ≥ 70%  → signal-green text
  40–69% → neutral (text-foreground, no color signal)
  < 40%  → neutral with "Needs review" label — NEVER RED

Typography:
  Syne 800         → section headings, card titles
  Inter 400/500    → body, UI text
  DM Mono 500      → labels, eyebrows, numbers, codes
  GeistSans 700    → hero names, large numerics

  Eyebrow pattern: DM Mono, 11px MINIMUM, uppercase, tracking-widest, text-muted-foreground
  Card title:      Inter medium, 14px
  Subtitle:        Inter regular, 12px, muted

Border radius:     rounded-md (8px) for cards — NOT rounded-lg or rounded-xl
Shadows:           shadow-sm (cards), shadow-md (dropdowns), shadow-lg (modals ONLY)
Animation max:     duration-300 (300ms) — exceptions only for score ring reveal
Min font size:     11px — NOTHING below this
```

---

## PHASE 0: FOUNDATION FIXES (Day 1)

**Objective:** Fix the shared components themselves before migrating anything to them. A broken foundation makes every migration inherit bugs.

### 0.1 — Fix SectionHeader Font Sizes

**File:** `src/components/shared/section-header.tsx`

**Problem:** Uses `text-[9px]` and `text-[10px]` for eyebrows — below the 11px minimum.

**Action:**
1. Open `src/components/shared/section-header.tsx`
2. Find the eyebrow className for each level variant
3. Replace:
   - `text-[10px]` → `text-[11px]` (page level)
   - `text-[9px]` → `text-[11px]` (section level)
   - `text-[9px]` → `text-[11px]` (card level)
4. Verify: The `Eyebrow` component at `src/components/ui/eyebrow.tsx` already uses `text-[11px]` — confirm this.

**Bonus:** Make `SectionHeader` compose with `Eyebrow` internally. Open `section-header.tsx`, import `Eyebrow` from `@/components/ui/eyebrow`, and replace the raw `<span>` eyebrow with `<Eyebrow>{eyebrow}</Eyebrow>`. This ensures the 11px minimum is enforced from one source.

```tsx
// BEFORE
<span className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
  {eyebrow}
</span>

// AFTER
import { Eyebrow } from '@/components/ui/eyebrow'
// ...
<Eyebrow>{eyebrow}</Eyebrow>
```

**Verify:** `bun run build` → zero errors. Open any page that imports SectionHeader → eyebrow text should be 11px.

---

### 0.2 — Fix StatCard Border Radius

**File:** `src/components/shared/stat-card.tsx`

**Problem:** Uses `rounded-lg` — design system specifies `rounded-md` for cards.

**Action:**
1. Open `src/components/shared/stat-card.tsx`
2. Find line ~83 (or wherever the container className is)
3. Replace `rounded-lg` with `rounded-md`

**Verify:** `bun run build` → zero errors.

---

### 0.3 — Verify ScoreDisplay Color Logic

**File:** `src/components/shared/score-display.tsx`

**Action:**
1. Open `src/components/shared/score-display.tsx`
2. Find the `getScoreColor` function
3. Confirm it matches this logic EXACTLY:
   ```
   ≥ 70  → green text/fill/bg classes (signal-green)
   40–69 → neutral (text-foreground, no color)
   < 40  → neutral (text-foreground, no color) — NEVER red/destructive
   ```
4. If any threshold uses red, destructive, or danger classes for low scores — FIX IT.
5. Confirm `getScoreColor` is exported and can be imported independently:
   ```tsx
   import { getScoreColor } from '@/components/shared/score-display'
   ```

---

### 0.4 — Delete Dead Code

**Files to delete:**
1. `src/components/ui/AppleCloseButton.tsx` — 0 imports. Dead code.

**Action:**
1. Confirm zero imports: `grep -r "AppleCloseButton" src/ --include="*.tsx" --include="*.ts"`
2. If zero results: delete the file
3. Check if `@phosphor-icons/react` is still used elsewhere: `grep -r "phosphor-icons" src/ --include="*.tsx" --include="*.ts"`
4. If zero results: `bun remove @phosphor-icons/react`

**Verify:** `bun run build` → zero errors.

---

### 0.5 — Check DataTable Internal Checkboxes

**File:** `src/components/shared/data-table.tsx`

**Problem:** The shared DataTable itself uses raw HTML checkboxes for row selection — the canonical shared component should use Shadcn Checkbox.

**Action:**
1. Open `src/components/shared/data-table.tsx`
2. Search for `<input type="checkbox"`
3. If found, replace with Shadcn Checkbox:
   ```tsx
   import { Checkbox } from '@/components/ui/checkbox'
   // Replace:
   <input type="checkbox" checked={...} onChange={...} />
   // With:
   <Checkbox checked={...} onCheckedChange={...} />
   ```

**Verify:** `bun run build` → zero errors. DataTable selection still works.

---

**PHASE 0 GATE:** Run `bun run build`. Run `bunx tsc --noEmit`. Both must pass with zero errors before proceeding.

---

## PHASE 1: CRITICAL DATA DISPLAY FIXES (Days 2–3)

**Objective:** Fix every place a student sees score/mastery data rendered inconsistently. This is the highest-impact work because data misinterpretation erodes student trust.

### 1.1 — Kill All Red-for-Score Violations

These are the confirmed violations where red/destructive is used for low scores (FORBIDDEN by design system):

**File 1:** `src/components/analytics/ReadinessTrajectory.tsx`
- Line ~37: Uses `text-destructive` for scores <50
- **Fix:** Replace with neutral color (`text-foreground`) or import `getScoreColor` from `@/components/shared/score-display`

**File 2:** `src/components/assessment/ScoreReveal.tsx`
- Lines ~19-24: Uses red zone color for scores <40
- **Fix:** Replace red zone with neutral. Scores below 40 get `text-foreground` + "Needs review" label. NEVER red.

**File 3:** `src/components/dashboard/TaxonomyHeatmap.tsx`
- Lines ~33-37: Uses red for "danger" state
- **EXCEPTION CHECK:** The heatmap may legitimately use red to indicate a node state (not a score display). If the red represents "critical gap" on the heatmap visualization (not a percentage), this may be acceptable. READ THE CONTEXT before changing.
  - If it's coloring a heatmap node → acceptable (heatmap uses its own node state colors)
  - If it's rendering a percentage/score as red → FORBIDDEN, fix it

**File 4:** `src/components/dashboard/SubjectMasteryCard.tsx`
- Lines ~34-39: Custom mastery colors not using `getScoreColor`
- **Fix:** Import `getScoreColor` and use it for all percentage-based coloring

**Verification protocol for each file:**
1. Open the file
2. Search for `red`, `destructive`, `danger`, `rose`, `#E63329`
3. Determine if the red is being used for a SCORE/PERCENTAGE or for a FUNCTIONAL ERROR
4. If score → replace with `getScoreColor()` logic
5. If functional error (form validation, system alert) → leave it
6. `bun run build` after each file

---

### 1.2 — Consolidate getScoreColor Into Single Export

**Problem:** 3 separate implementations exist with incompatible signatures.

**Action:**
1. The canonical source is `src/components/shared/score-display.tsx` → `getScoreColor()`
2. Open `src/components/dashboard/results/ScoreHero.tsx` — find its local score color logic. Replace with:
   ```tsx
   import { getScoreColor } from '@/components/shared/score-display'
   ```
3. Open `src/components/graphics/tokens.ts` — this provides hex values for Canvas/SVG contexts. Create a companion export in `score-display.tsx`:
   ```tsx
   export function getScoreColorHex(value: number): { main: string; grad: string; glow: string } {
     if (value >= 70) return { main: '#1B7A3C', grad: '#22c55e', glow: 'rgba(27,122,60,0.2)' }
     return { main: 'currentColor', grad: '#94a3b8', glow: 'rgba(0,0,0,0.05)' }
     // NEVER red for low scores
   }
   ```
4. Update `tokens.ts` to import from `score-display.tsx` instead of reimplementing.

**Verify:** `grep -rn "getScoreColor\|scoreColor\|score.*color\|color.*score" src/ --include="*.tsx" --include="*.ts"` — confirm all usages point to the single source in `score-display.tsx`.

---

### 1.3 — Adopt ScoreDisplay in Student-Facing Surfaces

**Problem:** `ScoreDisplay` has 0 real-world usage. All scores are rendered ad-hoc.

**Search command:**
```bash
grep -rn "font-mono.*tabular-nums\|font-bold.*text-2xl.*%\|score.*%\|\.toFixed.*%\|readiness.*score" src/components/dashboard/ src/components/testing/ src/components/trails/ src/components/analytics/ src/components/assessment/ --include="*.tsx"
```

**For each result:**
1. Open the file
2. Identify the score display pattern (usually `<span className="font-mono tabular-nums ...">{score}%</span>`)
3. Replace with the appropriate `ScoreDisplay` variant:
   - Large hero number → `<ScoreDisplay value={score} variant="number" size="xl" />`
   - Progress ring → `<ScoreDisplay value={score} variant="ring" size="lg" />`
   - Inline pill → `<ScoreDisplay value={score} variant="pill" size="sm" />`
   - Progress bar → `<ScoreDisplay value={score} variant="bar" size="md" />`
4. Verify the import: `import { ScoreDisplay } from '@/components/shared/score-display'`

**Priority order:**
1. Dashboard readiness score display
2. Quiz debrief / score reveal
3. Analytics page charts and stats
4. Camp Trail progress indicators
5. Testing session progress

**Verify after each file:** `bun run build` → zero errors. Visual check: score should render identically (or better) than before.

---

### 1.4 — Replace Browser Dialogs

**Problem:** 4 files use native `confirm()` instead of the existing `ConfirmDialog` component.

**File 1:** `src/components/sidebar/Sidebar.tsx`
- Find: `window.confirm('You have an active session...')`
- Replace with a state-driven `ConfirmDialog`:
  ```tsx
  import { ConfirmDialog } from '@/components/ui/dialog' // or wherever it lives

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

**File 2:** `src/components/sidebar/MobileDrawer.tsx` (line ~154-156) — same pattern as above.

**File 3:** `src/components/ceo/FinancialLedger.tsx` (line ~101)
- Find: `confirm('Delete this entry? This cannot be undone.')`
- Replace with `ConfirmDialog` with destructive variant.

**File 4:** `src/components/notes/NotesShell.tsx` (line ~76)
- Find: `confirm('Delete this note?')`
- Replace with `ConfirmDialog`.

**Before making changes:** Open `src/components/ui/dialog.tsx` (or wherever `ConfirmDialog` lives) and read its API. Confirm it exists and accepts `open`, `onOpenChange`, `title`, `description`, `onConfirm` props. If it doesn't exist, check for `AlertDialog` from Shadcn and use that instead.

**Verify:** `grep -rn "window.confirm\|window.alert\|window.prompt\| confirm(" src/ --include="*.tsx" --include="*.ts"` → zero results.

---

**PHASE 1 GATE:** `bun run build` + `bunx tsc --noEmit` → zero errors. Manually spot-check: Dashboard readiness score, quiz score reveal, analytics page. No red should appear for low scores anywhere.

---

## PHASE 2: TYPOGRAPHY CONSOLIDATION (Days 4–6)

**Objective:** Replace 180 ad-hoc eyebrow/header patterns across 86 files with `SectionHeader` and `Eyebrow` components.

### 2.0 — Triage: Classify Every Instance

**Search command:**
```bash
grep -rn "tracking-widest.*uppercase\|uppercase.*tracking-widest" src/ --include="*.tsx" -l
```

This gives you ~86 files. For EACH file, classify the pattern as:

| Pattern Type | Replacement | Example |
|---|---|---|
| Full header (eyebrow + title + subtitle) | `<SectionHeader eyebrow="..." title="..." subtitle="..." level="card\|section\|page" />` | A card with DM Mono label above an Inter title |
| Standalone label (no title below it) | `<Eyebrow>Label Text</Eyebrow>` | A category tag, a metadata label |
| Inside a table header or very custom layout | Keep inline but fix font size to 11px minimum | Table column headers, inline form labels |

### 2.1 — Student-Facing Pages First

Migrate in this exact order (student-facing surfaces = highest UX impact):

**Batch 1 — Dashboard** (~35 files in `src/components/dashboard/`)
```bash
grep -rn "tracking-widest.*uppercase\|uppercase.*tracking-widest" src/components/dashboard/ --include="*.tsx" -l
```
For each file: open it, identify the pattern, replace with `SectionHeader` or `Eyebrow`.

**Batch 2 — Testing** (~38 files in `src/components/testing/`)
Key offenders from audit:
- `SessionShell.tsx` — 6 instances
- `ChillSessionBehavior.tsx` — 5 instances
- `CampSessionBehavior.tsx` — 5 instances

**Batch 3 — Trails** (~21 files in `src/components/trails/`)

**Batch 4 — Wiki** (~64 files in `src/components/wiki/`)

**Batch 5 — Analytics** (~17 files in `src/components/analytics/`)

### 2.2 — Admin & Portal Pages

**Batch 6 — Admin** (~29 files in `src/components/admin/`)
Key offender: `unified-editor/ArticlePanel.tsx` — 8 instances

**Batch 7 — CEO** (~17 files in `src/components/ceo/`)
Key offenders: `FinancialEntryForm.tsx` — 5 instances, both CEO page.tsx files — 5 instances each

**Batch 8 — Developer** (~8 files in `src/components/developer/` + `src/components/dev/`)

### 2.3 — Fix All Remaining text-[9px] Violations

After the SectionHeader/Eyebrow migration, run:
```bash
grep -rn 'text-\[9px\]\|text-\[10px\]' src/ --include="*.tsx" --include="*.ts"
```

For each remaining result:
- If it's an eyebrow/label → should have been caught in 2.1/2.2. Fix it.
- If it's something else (badge, tooltip) → replace with `text-[11px]` minimum.

**Verify:** `grep -rn 'text-\[9px\]\|text-\[10px\]' src/ --include="*.tsx"` → zero results.

---

**PHASE 2 GATE:** `bun run build` → zero errors. `grep -c "tracking-widest" src/components/**/*.tsx` should show dramatically fewer results (only the `Eyebrow` and `SectionHeader` components themselves).

---

## PHASE 3: FORM ELEMENT STANDARDIZATION (Days 7–8)

**Objective:** Replace all raw HTML form elements with Shadcn primitives.

### 3.1 — Raw `<select>` → Shadcn Select

**Search:**
```bash
grep -rn '<select\b' src/ --include="*.tsx" -l
```

**Known offenders (from audit):**
- `src/app/admin/settings/page.tsx`
- `src/app/dashboard/3d-lab/_components/GenericControlPanel.tsx` (line ~193)
- `src/components/admin/ArticlePropertiesPanel.tsx` (lines ~123, ~136)
- `src/components/admin/AssetUploader.tsx` (lines ~162, ~176, ~191)
- `src/components/admin/AuditLogViewer.tsx` (lines ~59, ~70)
- `src/components/admin/SMEReviewQueue.tsx` (line ~108)
- `src/components/admin/unified-editor/ContentBar.tsx` (lines ~102, ~115)

**For each file:**
1. Open the file
2. Read the raw `<select>` and understand its options, onChange handler, value binding
3. Replace with Shadcn Select:
   ```tsx
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

   <Select value={value} onValueChange={setValue}>
     <SelectTrigger>
       <SelectValue placeholder="Select..." />
     </SelectTrigger>
     <SelectContent>
       <SelectItem value="option1">Option 1</SelectItem>
       <SelectItem value="option2">Option 2</SelectItem>
     </SelectContent>
   </Select>
   ```

### 3.2 — Raw `<input type="checkbox">` → Shadcn Checkbox

**Search:**
```bash
grep -rn 'type="checkbox"\|type=.checkbox.' src/ --include="*.tsx" -l
```

**Known offenders:**
- `src/components/admin/unified-editor/QuestionsPanel.tsx` — 2 raw checkboxes
- `src/components/ceo/FinancialEntryForm.tsx` — raw checkbox
- `src/components/testing/setup/CustomSetup.tsx` — raw checkbox

**Replace with:**
```tsx
import { Checkbox } from '@/components/ui/checkbox'

<Checkbox
  checked={isChecked}
  onCheckedChange={(checked) => setIsChecked(checked as boolean)}
  id="unique-id"
/>
<label htmlFor="unique-id">Label text</label>
```

### 3.3 — Custom Radio Buttons → Shadcn RadioGroup

**Known offender:**
- `src/app/(auth)/onboarding/_components/OnboardingForm.tsx` (lines ~103-151) — custom peer-checked Tailwind pattern

**Replace with:**
```tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

<RadioGroup value={selected} onValueChange={setSelected}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="r1" />
    <label htmlFor="r1">Option 1</label>
  </div>
</RadioGroup>
```

### 3.4 — Notes Module Raw Buttons → Shadcn Button

**File:** `src/components/notes/NotesEditor.tsx` — 15 raw `<button>` elements
**File:** `src/components/notes/NotesNavigator.tsx` — 4 raw `<button>` elements

**Action:**
1. Open each file
2. For each raw `<button>`:
   - Determine its visual role: primary action, secondary, ghost, icon-only
   - Replace with the appropriate Shadcn Button variant:
     ```tsx
     import { Button } from '@/components/ui/button'

     // Icon-only button:
     <Button variant="ghost" size="icon"><SomeIcon className="h-4 w-4" /></Button>

     // Text button:
     <Button variant="secondary" size="sm">Save</Button>
     ```

**Verify:** `grep -rn '<button\b' src/components/notes/ --include="*.tsx"` → zero raw buttons. `bun run build` → zero errors.

---

**PHASE 3 GATE:** `bun run build` → zero errors. `grep -rn '<select\b\|type="checkbox"\|type=.checkbox.' src/ --include="*.tsx"` → zero raw form elements (except inside Shadcn component source files in `src/components/ui/`).

---

## PHASE 4: TABLE STANDARDIZATION (Day 9)

**Objective:** Migrate raw `<table>` implementations to the shared `DataTable` component.

### 4.1 — Identify Candidates

**Search:**
```bash
grep -rn '<table\b' src/ --include="*.tsx" -l
```

**From the audit: 23 files have raw tables. Classify each:**

| Classification | Action | Example |
|---|---|---|
| Data management table (sort, filter, paginate) | Migrate to `DataTable` | CEO tables, admin tables, dev tool tables |
| Content display table (inside wiki articles) | KEEP AS-IS | Wiki article content tables rendered from MDX |
| Simple key-value display | Evaluate — may not need DataTable | Settings panels with label:value pairs |

### 4.2 — CEO Dashboard Tables

**Files:**
- `src/components/ceo/FinancialLedger.tsx` → `DataTable`
- `src/components/ceo/CohortRetentionTable.tsx` → `DataTable`
- `src/components/ceo/TeamTable.tsx` → `DataTable`

**For each:** Open the file. Read the column definitions and data shape. Define a `columns` array that matches the `DataTable` API. Replace the custom table JSX.

**Before replacing:** Open `src/components/shared/data-table.tsx` and read its full API. Understand what props are available (searchable, selectable, sortable, pageSize, emptyMessage, etc.).

### 4.3 — Admin Tables

- `src/components/admin/AuditLogViewer.tsx` → `DataTable` (already has sort/filter — these should map to DataTable props)
- Any other admin components with custom table markup

### 4.4 — Developer Tool Tables

The audit found 6 developer pages with raw tables. These are lower priority but should use DataTable for consistency:
- `api-reference` page
- `architecture` page
- `status/database` page
- Other dev tool pages

---

**PHASE 4 GATE:** `bun run build` → zero errors.

---

## PHASE 5: LOADING PATTERN CLEANUP (Day 10)

**Objective:** Replace forbidden loading spinners with skeleton loaders.

### 5.1 — Classify Each Spinner

**Search:**
```bash
grep -rn 'animate-spin' src/ --include="*.tsx" -l
```

**The audit identified 14 files. For each, classify:**

| Context | Action |
|---|---|
| Full-area loading (replacing content) | Replace with `<Skeleton>` matching the content layout |
| Inline button loading state | ACCEPTABLE — keep if inside Shadcn `<Button>` loading prop |
| WebGL/3D loading | ACCEPTABLE — 3D contexts may use spinners |
| Search/command palette typing indicator | Evaluate — may be acceptable as inline micro-state |
| Form submission indicator | Replace with button loading state |

### 5.2 — Replace Full-Area Spinners

**Priority replacements (from audit):**
- `src/components/quiz/AITutorDrawer.tsx:133` — Replace with skeleton that matches drawer content
- `src/components/dashboard/SubjectDrillSelector.tsx:196` — Replace with content skeleton
- `src/components/assessment/AssessmentQuiz.tsx:167,198,345` — 3 spinners, replace with question card skeletons
- `src/components/wiki/TeachBackPrompt.tsx:132` — Replace with content skeleton

**Pattern:**
```tsx
// BEFORE (forbidden)
<div className="flex items-center justify-center p-8">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
</div>

// AFTER (correct)
import { Skeleton } from '@/components/ui/skeleton'

<div className="space-y-3 p-4">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-20 w-full" />
</div>
```

### 5.3 — Keep Acceptable Spinners (Document Why)

Add a comment to each kept spinner explaining why it's acceptable:
```tsx
{/* Spinner acceptable: inline button loading state within Shadcn Button */}
{/* Spinner acceptable: WebGL scene loading — skeleton not appropriate for 3D canvas */}
```

---

**PHASE 5 GATE:** `bun run build` → zero errors. `grep -rn 'animate-spin' src/ --include="*.tsx"` → only acceptable instances with justification comments.

---

## PHASE 6: MODULE-SPECIFIC ISLAND MIGRATIONS (Days 11–13)

**Objective:** Bring the isolated "UI islands" (CEO, Notes, Assessment) into the design system.

### 6.1 — CEO Dashboard Migration

**Problem:** 17 files, 1 Shadcn import. Complete island.

**Action plan:**
1. `MetricCard.tsx` → Replace with `StatCard` from `@/components/shared/stat-card`
   - Open both files. Map MetricCard props to StatCard props.
   - If StatCard is missing a prop MetricCard needs, EXTEND StatCard (don't fork it).
2. All CEO tables → Already migrated in Phase 4
3. `FinancialEntryForm.tsx` → Adopt Shadcn Input, Select, Checkbox, Button
4. Chart components → These may stay custom (Recharts wrappers), but their container cards should use `<Card>` from Shadcn and `<SectionHeader>` for titles
5. `CeoShell` wrapper → Evaluate if it can use `PortalLayout` from `@/components/portal/`. If the admin and developer portals use PortalLayout, the CEO portal should too.

### 6.2 — Notes Module Migration

**Problem:** 8 files, 0 Shadcn components.

**Action:**
1. `NotesEditor.tsx` — 15 raw buttons → migrated in Phase 3.4
2. `NotesNavigator.tsx` — 4 raw buttons → migrated in Phase 3.4
3. `NotesShell.tsx` — `confirm()` → migrated in Phase 1.4
4. Remaining files: adopt Shadcn `Input`, `Sheet`, `ScrollArea`, `Tooltip` where applicable
5. Search for any ad-hoc card or container markup → replace with Shadcn `Card`

### 6.3 — Assessment Module Migration

**Problem:** 4 files, 0 Shadcn components.

**Action:**
1. `ScoreReveal.tsx` — red-for-score already fixed in Phase 1.1
2. `AssessmentQuiz.tsx` — spinners fixed in Phase 5, but also needs Shadcn Button/Card adoption
3. Other assessment files: review and adopt shared components where applicable

### 6.4 — TaxonomyPicker Adoption

**Problem:** 838-line component with 3 variants, 0 real usage.

**Action:**
1. Search for ALL taxonomy selection UI in the codebase:
   ```bash
   grep -rn "taxonomy\|topic.*select\|subject.*pick\|node.*select" src/ --include="*.tsx" -l
   ```
2. Also check: `src/components/shared/taxonomy-tree.tsx` — is this a duplicate? If so, evaluate which is more complete and delete the other.
3. For each custom taxonomy selection UI found:
   - Read the component to understand its specific needs (single vs multi select, which variant)
   - Replace with `TaxonomyPicker` using the appropriate props:
     ```tsx
     import { TaxonomyPicker } from '@/components/shared/taxonomy-picker'

     <TaxonomyPicker
       variant="dropdown"  // or "sidebar" or "inline"
       mode="single"       // or "multi"
       nodes={taxonomyNodes}
       value={selectedId}
       onChange={setSelectedId}
     />
     ```

### 6.5 — QuestionCard Adoption

**Problem:** 450-line component with 4 variants, ~2 real imports.

**Action:**
1. Search for question rendering patterns:
   ```bash
   grep -rn "question.*stem\|question.*card\|option.*select\|answer.*choice" src/components/testing/ src/components/quiz/ src/components/assessment/ --include="*.tsx" -l
   ```
2. For each custom question rendering, evaluate migration to `QuestionCard`:
   ```tsx
   import { QuestionCard } from '@/components/shared/question-card'

   <QuestionCard
     variant="quiz"
     stem={question.stem}
     options={question.options}
     selectedOptionId={selectedId}
     onSelectOption={handleSelect}
     submitted={isSubmitted}
     correctAnswerId={question.correctId}
   />
   ```

---

**PHASE 6 GATE:** `bun run build` → zero errors. CEO dashboard should now look visually consistent with the rest of the app.

---

## PHASE 7: CLEANUP & ENFORCEMENT (Day 14–15)

### 7.1 — Fix 'use client' on Page Components

**Problem:** 3 page.tsx files have `'use client'`.

**Files:**
- `src/app/dashboard/wiki/page.tsx`
- `src/app/dashboard/developer/design-system/page.tsx`
- `src/app/admin/search/page.tsx`

**Action for each:**
1. Open the file
2. Identify what requires client-side execution (hooks, event handlers, browser APIs)
3. Extract that logic into a child component in the appropriate `src/components/` directory
4. Remove `'use client'` from the page.tsx
5. Import the extracted client component and render it within the Server Component page

### 7.2 — Fix Shadow Violations

**Files:**
- `src/components/quiz/QuestionStem.tsx` — `shadow-xl` → `shadow-sm`
- `src/components/dev/dev-toolbar.tsx` — `shadow-2xl` → `shadow-md`
- `src/components/dev/demo-shell.tsx` — `shadow-xl` → `shadow-sm`

### 7.3 — Close Button Standardization

**Search:**
```bash
grep -rn "lucide-react.*X \|lucide-react.*XIcon\|from.*lucide.*import.*\bX\b" src/ --include="*.tsx" -l
```

For each file that imports `X` from Lucide for a close/dismiss action:
1. Check if the X icon is used as a close button
2. If yes: replace with `<CloseButton>` from `@/components/ui/close-button`
3. If no (X used for something else): leave it

### 7.4 — Update Design System Gallery

**File:** The design system page at `/developer/design-system` (check exact path: `src/app/developer/design-system/page.tsx` or `src/app/dashboard/developer/design-system/page.tsx`)

**Action:** Ensure every shared component is showcased with ALL its variants:
- `ScoreDisplay` — ring, bar, pill, number × sm/md/lg/xl
- `SectionHeader` — page, section, card levels
- `StatCard` — with/without trend, with/without href
- `DataTable` — searchable, selectable, sortable examples
- `QuestionCard` — quiz, review, preview, compact
- `TaxonomyPicker` — dropdown, sidebar, inline
- `EmptyState` — multiple context examples
- `CloseButton` — ghost, subtle, destructive × sm/md/lg
- `Eyebrow` — standalone usage

### 7.5 — Add ESLint Rule to Ban Browser Dialogs

If ESLint is configured, add to `.eslintrc`:
```json
{
  "rules": {
    "no-restricted-globals": ["error", "alert", "confirm", "prompt"]
  }
}
```

### 7.6 — Final Verification Sweep

Run these commands and confirm all pass:

```bash
# Build check
bun run build

# TypeScript check
bunx tsc --noEmit

# Zero browser dialogs
grep -rn "window.confirm\|window.alert\|window.prompt\| confirm(" src/ --include="*.tsx" --include="*.ts"
# Expected: 0 results

# Zero forbidden font sizes
grep -rn 'text-\[9px\]\|text-\[10px\]\|text-\[8px\]' src/ --include="*.tsx"
# Expected: 0 results

# Zero dead code
grep -rn "AppleCloseButton" src/ --include="*.tsx" --include="*.ts"
# Expected: 0 results

# Score color audit — no red for scores
grep -rn "text-destructive\|text-red\|border-red\|bg-red" src/components/dashboard/ src/components/testing/ src/components/analytics/ src/components/assessment/ src/components/trails/ --include="*.tsx"
# Expected: 0 results in score display contexts (functional error contexts OK)
```

---

**PHASE 7 GATE:** All verification commands pass. `bun run build` → zero errors. The codebase is clean.

---

## DEPENDENCY GRAPH (Build Order)

```
Phase 0: Fix foundations (SectionHeader, StatCard, ScoreDisplay, dead code)
    ↓
Phase 1: Score display + browser dialogs (depends on Phase 0 fixes)
    ↓
Phase 2: Typography consolidation (depends on Phase 0 SectionHeader fix)
    ↓
Phase 3: Form elements (independent — can run parallel to Phase 2)
    ↓
Phase 4: Tables (independent — can run parallel to Phase 2/3)
    ↓
Phase 5: Loading patterns (independent — can run parallel)
    ↓
Phase 6: Module islands (depends on Phases 0–5 for shared components to be ready)
    ↓
Phase 7: Cleanup + enforcement (depends on all above)
```

---

## SUCCESS METRICS

After completing all phases, the codebase should show:

| Metric | Before | After |
|---|---|---|
| `ScoreDisplay` real imports | 0 | 15+ |
| `SectionHeader` real imports | 7 | 50+ |
| `Eyebrow` real imports | 1 | 20+ |
| `DataTable` real imports | 3 | 10+ |
| Ad-hoc `tracking-widest uppercase` patterns | 180 | <10 |
| Raw `<table>` data management tables | 23 | <5 (wiki content tables only) |
| Browser `confirm()` / `alert()` calls | 4 | 0 |
| `animate-spin` spinners | 16 | <5 (justified exceptions only) |
| `text-[9px]` / `text-[10px]` violations | 18 | 0 |
| Raw `<select>` elements | 12+ | 0 |
| Raw `<input type="checkbox">` | 5+ | 0 |
| Notes module Shadcn imports | 0 | 5+ |
| CEO module Shadcn imports | 1 | 10+ |
| Dead code files | 1 (AppleCloseButton) | 0 |

---

*SlateCamp UI Modularization Implementation Plan v1.0 — March 2026*
*Execute with Claude Code. One phase at a time. `bun run build` at every gate.*
