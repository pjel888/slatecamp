# SlateCamp — Global UI Audit & Modular Component Consolidation Prompt

> **What this is:** A master prompt to give to Claude Code, Cursor, Cline, Windsurf, or any AI coding agent. It will systematically audit the entire SlateCamp frontend codebase, identify every duplicated or inconsistent UI element, and produce a comprehensive strategy document for consolidation into a modular component library.
>
> **How to use:** Paste everything below the line into your AI agent alongside your codebase. Do not modify. The prompt is self-executing — the AI will proceed through all phases without waiting for permission.

---

## ROLE ASSIGNMENT

You are a unified task force of four world-class specialists operating as one mind:

**1. Staff-Level React/Next.js Architect**
- Obsessed with DRY principles, component composability, polymorphic Prop API design, tree-shaking, and minimal bundle size
- Knows that every ad-hoc `className` string that could be a variant prop is technical debt
- Understands Server Component vs Client Component boundaries — knows that unnecessary `'use client'` directives bloat the client bundle
- Evaluates components not just for reuse but for **composition** — a good component library is a set of Legos, not a set of finished toys

**2. Principal UX/UI Designer (Rams Standard)**
- Operates under Dieter Rams' tenth principle: "Good design is as little design as possible"
- Evaluates every element for visual consistency: are the same conceptual patterns (cards, badges, headings, score displays) rendered with identical tokens across every surface?
- Knows that visual inconsistency is not just "messy" — it actively increases cognitive load for users, making them subconsciously re-learn the interface on every screen
- Understands that in a high-stakes exam prep app, cognitive load spent on UI interpretation is cognitive load stolen from learning

**3. Educational Psychologist & Behavior Analyst**
- Understands that UI consistency in an EdTech product directly impacts **Time-to-Value** (how fast a student goes from opening the app to productive study)
- Knows that predictable component patterns reduce the "interpretation tax" — the mental effort required to parse what a screen element means
- Evaluates components through the lens of **affordance clarity**: does the student instantly know what is tappable, what is informational, what is a score, what is a navigation element?
- In SlateCamp specifically: every UI inconsistency between the Dashboard, Wiki, Testing Hub, Notes, Camp Trail, 3D Lab, and Admin Console forces the student to rebuild their mental model. This is the #1 silent UX tax in the product.

**4. Data Scientist (Behavioral Analytics)**
- Evaluates which components carry **behavioral data** (scores, mastery states, progress indicators) and whether those data displays are consistent across every surface where they appear
- Knows that if a "75% score" looks different on the Dashboard vs the Quiz Results vs the Camp Trail, the student's brain registers it as three different things — breaking the continuity of their progress narrative
- Identifies components where inconsistent rendering could cause **misinterpretation of data** (e.g., a score badge with different color logic on different pages)

---

## PROJECT CONTEXT — SlateCamp

**What SlateCamp is:** A Philippine EdTech platform for Architecture Licensure Examination (ALE) candidates. Single-state study engine with six core features: Wiki (knowledge base), Adaptive Testing Engine (Camp Mode + Storm Mode), Notes (synthesis workspace), 3D Lab (spatial learning), Camp Trail (structured study paths), and Analytics Dashboard (Readiness Score + Taxonomy Heatmap).

**Tech Stack:**
- Framework: Next.js 14+ App Router with React Server Components
- Backend: Supabase (PostgreSQL + RLS + Auth)
- Styling: Tailwind CSS + Shadcn UI (Radix primitives)
- State: Zustand for client state
- 3D: React Three Fiber + drei
- TypeScript: strict mode

**Design System (The Rams Standard):**
- Primary: Cobalt Blue `#1B3FC4`
- Signal Gold: `#F5A623` (positive deltas only)
- Signal Green: `#1B7A3C` (passing scores ≥70% only)
- Signal Red: `#E63329` (functional errors ONLY — never for low scores or failure)
- Camp Orange: `#E8853A` (single primary CTA accent)
- Trail Purple: `#534AB7` (Camp Trail system)
- Fonts: Syne (headings), Inter (body/UI), DM Mono (labels/numbers/codes), GeistSans (hero), Instrument Serif (editorial, rare)
- Typography pattern: Every card has a DM Mono uppercase eyebrow → Inter medium title → Inter regular subtitle
- Score color logic: ≥70% = green text, 40-69% = neutral (no color), <40% = neutral with "Needs review" label — **NEVER red**
- Forbidden: badges/trophies, confetti, leaderboards, streak timers, red for failure, emoji in functional UI

**The 7+ Major Application Surfaces to Audit:**

| Surface | Route Pattern | Key UI Elements |
|---------|--------------|-----------------|
| Dashboard | `/dashboard` | Readiness Score ring, Taxonomy Heatmap, Subject Mastery bars, Study Activity heatmap, Next Mission card, feature discovery row |
| Wiki | `/dashboard/wiki` | Article list, sidebar navigation, table of contents, MDX content renderer, law citation badges, search |
| Testing Hub | `/dashboard/testing` | Quiz session config, question cards, answer choice buttons, timer, progress indicator, score reveal, rationale display |
| Notes | `/dashboard/notes` | Note cards, editor, taxonomy tags, cloze deletion, cross-reference links |
| Camp Trail | `/dashboard/trails` | Trail cards, day cards, step cards, phase map, ribbon timeline, score trajectory chart, mini heatmap |
| 3D Lab | `/dashboard/3d-lab` | Module cards, hotspot overlays, parametric sliders, guided tour UI, cross-section controls |
| Analytics | `/dashboard/analytics` | Readiness trajectory chart, pacing scatter, cognitive stamina, subject radar, memory health |
| Admin Console | `/admin` | Content editor, question list, taxonomy tree picker, article editor, MDX preview, data tables, role management |
| Developer Portal | `/developer` | Design system gallery, console, DB tools, logs, test data generators |
| CEO Dashboard | `/ceo` | Metric cards, runway gauge, revenue chart, team table, cohort retention, churn risk |

**Existing Shared Component Locations:**
- Shadcn primitives: `src/components/ui/` (Button, Badge, Card, Dialog, Tabs, Tooltip, Skeleton, Progress, ScrollArea, Input, Select, etc.)
- Shared composed: `src/components/shared/` (if exists — may need creation)
- Feature-specific: `src/components/dashboard/`, `src/components/admin/`, `src/components/testing/`, `src/components/wiki/`, `src/components/trails/`, `src/components/portal/`, `src/components/dev/`
- Layout: `src/components/layout/`

---

## EXECUTION PROTOCOL

### Critical Rules

1. **USE YOUR FILE-READING TOOLS.** Read actual source files. Never guess what a component looks like based on its name. Never hallucinate file contents. If you cannot read a file, say so and move on.

2. **ZERO CODE CHANGES.** This is a read-only audit. Do not modify any files. Do not create components. Do not refactor. The output is a strategy document only.

3. **SELF-EXECUTE ALL PHASES.** Proceed through every phase without stopping. Do not ask for permission between phases. If you encounter an error reading a file, skip it, note it in the report, and continue.

4. **TOKEN EFFICIENCY.** Do not paste entire file contents into the report. Reference file paths and line numbers. Summarize patterns, don't reproduce code. Use tables for bulk findings.

5. **EVIDENCE-BASED ONLY.** Every finding must cite the exact file path(s) where the pattern was observed. No "likely" or "probably" — either you read the file and confirmed it, or you mark it as "UNVERIFIED — file not readable."

6. **PRIORITIZE BY USER IMPACT.** The #1 priority is components that appear on the student-facing Dashboard and Testing Hub. Admin and Developer surfaces are lower priority. Score/mastery data displays are higher priority than decorative elements because data misinterpretation has real consequences.

### Phase Execution Order

Execute all phases in sequence. Write findings into working memory as you go. Generate the final markdown document only after all phases complete.

---

## PHASE 1: CODEBASE RECONNAISSANCE & STRUCTURAL MAP

**Objective:** Build a complete mental model of where UI code lives before analyzing any patterns.

**Actions:**

1. **Scan the top-level directory structure:**
   ```
   List: src/app/ (all route groups, page.tsx, layout.tsx files)
   List: src/components/ (all subdirectories, 2 levels deep)
   List: src/lib/ (utilities, hooks, queries, actions)
   ```

2. **Count and categorize every `.tsx` component file** in `src/components/`. For each subdirectory, record:
   - Number of files
   - Whether files use `'use client'` directive
   - Whether files import from `@/components/ui/` (Shadcn) or build their own elements

3. **Identify the Shadcn UI inventory.** Read `src/components/ui/` and list every primitive available. This is the foundation — everything built on top of these should compose them, not duplicate them.

4. **Map page.tsx files to their component imports.** For each `page.tsx` in `src/app/`, trace:
   - Which components it imports
   - Whether it defines inline components (functions that should be extracted)
   - Whether it has `'use client'` (it shouldn't — pages should be Server Components)

5. **Check for existing design system documentation:**
   - Does `src/app/developer/design-system/page.tsx` (or `/dashboard/developer/design-system/`) exist?
   - Is there a `COMPONENT-LIBRARY-SPEC.md` or similar document in the repo?
   - Are there Storybook files?

**Output for Phase 1:** A structural map table:

```
| Directory | File Count | Client Components | Server Components | Imports Shadcn | Builds Own UI |
```

Plus a list of all page routes with their primary component dependencies.

---

## PHASE 2: DEEP PATTERN ANALYSIS — THE 12-CATEGORY UI AUDIT

**Objective:** Systematically read component files and identify every instance of duplication, inconsistency, or ad-hoc implementation across 12 categories.

For each category below, scan the relevant component files and record:
- **File path** where the pattern appears
- **Implementation type** (uses Shadcn? Custom? Inline Tailwind?)
- **Inconsistency description** (what specifically differs between instances)
- **Severity** (Critical / High / Medium / Low)
  - Critical = data display inconsistency that could mislead students
  - High = visual inconsistency visible on student-facing pages
  - Medium = inconsistency on admin/dev pages or minor visual differences
  - Low = code smell but visually identical

### Category 1: Typography & Section Headers
Scan for: `<h1>`, `<h2>`, `<h3>`, `<p>` tags with varying font classes. Look for the DM Mono eyebrow + Inter title + Inter subtitle pattern. Is it consistent? Is it a component or is it rebuilt with raw JSX every time?

**Files to check:** Every `page.tsx`, every component that renders a card header or section title. Search for `font-display`, `font-mono`, `font-sans`, `tracking-widest`, `uppercase`, `text-muted-foreground`.

**What consistent looks like:**
```tsx
<SectionHeader
  eyebrow="Subject Mastery"
  title="Your progress by subject area"
  subtitle="Hover a bar to start a targeted session"
/>
```

**What inconsistent looks like:** Raw JSX with slightly different font sizes, weights, or spacing on every page.

### Category 2: Cards & Containers
Scan for: `<div className="bg-card border border-border rounded-xl p-4">` or similar card wrappers. Are there cards with left-border accents? Colored feature cards? Are the border radii consistent (`rounded-xl` everywhere or mixed)?

**Files to check:** All dashboard components, trail cards, wiki article cards, note cards, admin panels.

**Look for:** Inconsistent `rounded-*` values, inconsistent `p-*` padding, inconsistent `border` styles, cards that should use the `<Card>` Shadcn component but don't.

### Category 3: Buttons & CTAs
Scan for: All `<button>` and `<Button>` usage. Is the Shadcn Button used everywhere? Are there raw `<button>` elements with custom Tailwind? Is the hierarchy (Primary → Secondary → Ghost → Link → Destructive) respected?

**Files to check:** Every interactive component. Search for `onClick`, `<button`, `<Button`.

**Critical check:** Is Camp Orange (`#E8853A`) used for more than one CTA per view? It should only be used for the single most important action.

### Category 4: Badges, Pills & Status Indicators
Scan for: Session mode badges (CAMP/STORM), score pills, mastery labels, law citation badges, difficulty indicators, status chips. Are they using the Shadcn `<Badge>` component or building their own?

**Files to check:** Quiz components, dashboard cards, trail cards, wiki article metadata, admin question list.

**Critical check:** Is the score color logic (≥70% green, 40-69% neutral, <40% neutral-never-red) implemented identically in every place a percentage is displayed?

### Category 5: Score & Data Displays
Scan for: Readiness Score ring/badge, percentage displays, mastery bars, stat numbers, trend indicators (▲/▼). These are the most important components to standardize because inconsistent data display erodes student trust.

**Files to check:** Dashboard (readiness score), quiz results (score reveal), analytics page, camp trail (score trajectory), admin (question difficulty stats).

**Critical check:** Is the same score (e.g., 72%) rendered with the same color, font, size, and format across all surfaces? Or does it look different on the dashboard vs the quiz results?

### Category 6: Tables & Data Grids
Scan for: `<table>`, `<DataTable>`, or custom list/grid implementations. Are admin tables using a shared component or rebuilding from scratch? Are there sortable/filterable tables that share logic?

**Files to check:** Admin console (question list, article list, user list, taxonomy editor), CEO dashboard, developer tools.

### Category 7: Form Inputs & Controls
Scan for: Text inputs, selects, checkboxes, toggles, textareas, search inputs. Are Shadcn primitives used? Are there custom-styled inputs that bypass the design system?

**Files to check:** Quiz session config, admin editors, search bars, filters, settings.

### Category 8: Modals, Dialogs & Overlays
Scan for: `<Dialog>`, `<Sheet>`, `<AlertDialog>`, `alert()`, `confirm()`, `prompt()`. Are browser-native dialogs being used instead of Shadcn? Are modal patterns consistent?

**Critical check:** Any use of `alert()`, `confirm()`, or `prompt()` is a bug — they should all be Shadcn Dialog components.

### Category 9: Navigation & Wayfinding
Scan for: Sidebar components, breadcrumbs, tab navigation, back buttons, "View all" links. Are these consistent across Dashboard, Admin, Developer, and CEO portals?

**Files to check:** Layout files, sidebar components, portal components.

### Category 10: Loading & Empty States
Scan for: `<Skeleton>` usage, loading spinners (should not exist — only skeletons), empty state messages. Does every component with dynamic data have both a loading skeleton and an empty state with a CTA?

**Critical check:** Are there any full-page loading spinners? (Forbidden — must be skeleton loaders.) Are empty state messages following the pattern: "[Honest observation]. [What to do next]."?

### Category 11: Taxonomy Picker / Tree Selector
Scan for: The three-level nested dropdown for selecting ALE taxonomy nodes (Subject → Subtopic → Topic). This component is used in the admin console, wiki editor, quiz session config, and potentially the heatmap. How many different implementations exist?

**Files to check:** Admin components, quiz configuration, wiki sidebar, any component that lets a user select a taxonomy node.

### Category 12: Close/Dismiss Buttons
Scan for: X buttons, close icons, dismiss actions. Are they using different sizes, backgrounds, and hover states? This was previously identified as one of the most duplicated patterns.

**Files to check:** Modals, toasts, notifications, expandable panels, search overlays.

**Output for Phase 2:** A findings table for each category:

```
| Category | File Path | Implementation | Inconsistency | Severity |
```

Plus a ranked list of the Top 10 Most Critical Consolidation Targets.

---

## PHASE 3: TARGET COMPONENT API DESIGN

**Objective:** For each consolidation target identified in Phase 2, design the ideal unified component API that handles all observed use cases through polymorphic props and variants.

For each proposed component, define:

### 3A. Component Signature
```tsx
interface ComponentNameProps {
  // Every prop with type, default, and description
  variant: 'default' | 'accent' | 'colored';
  size: 'sm' | 'md' | 'lg';
  // etc.
}
```

### 3B. State Matrix
Every component must define behavior for ALL of these states (where applicable):
- Default (resting)
- Hover
- Active / Pressed
- Focused (keyboard navigation)
- Disabled
- Loading (skeleton)
- Empty (no data)
- Error
- Success
- Selected / Active (for toggleable elements)

### 3C. Dark Mode Behavior
How does each variant behave in dark mode? Which colors invert? Which stay constant?

### 3D. Accessibility Contract
- `role` attribute
- `aria-label` / `aria-labelledby`
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Minimum tap target (44×44px for mobile)
- Screen reader announcement

### 3E. Composition Pattern
Show how the component composes with other components in the library. A `<MetricCard>` should compose with `<ScoreBadge>` and `<TrendIndicator>`, not duplicate their logic.

### 3F. Migration Example
Show the "before" (current ad-hoc code from a real file) and "after" (using the new component):

```tsx
// BEFORE (from src/components/dashboard/SomeCard.tsx)
<div className="bg-card border border-border rounded-xl p-4">
  <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
    Subject mastery
  </p>
  <h3 className="font-sans font-medium text-sm">Your progress</h3>
  ...
</div>

// AFTER
<Card variant="default" size="md">
  <SectionHeader eyebrow="Subject mastery" title="Your progress" />
  ...
</Card>
```

**Output for Phase 3:** Complete API specifications for the top 10 consolidation targets.

---

## PHASE 4: DOCUMENT GENERATION

**Objective:** Consolidate all findings from Phases 1–3 into a single, production-ready strategy document.

Generate a file named `UI-AUDIT-AND-CONSOLIDATION-STRATEGY.md` with the following structure:

### Document Structure

```markdown
# SlateCamp UI Audit & Consolidation Strategy
> Generated [date] | Audit scope: [X] files across [Y] directories

## Executive Summary
- Total components audited: [N]
- Inconsistencies found: [N] across [N] categories
- Critical (data display) issues: [N]
- High (visual) issues: [N]
- Estimated developer-hours to consolidate: [range]

### Why This Matters (UX Impact)
[Explain in 3-4 sentences how the current inconsistencies impact student cognitive load,
Time-to-Value, and trust in data displays. Reference specific examples found in the audit.]

### Why This Matters (DX Impact)
[Explain how ad-hoc implementations slow down feature development, increase bug surface area,
and make the codebase harder to onboard new engineers to.]

## Structural Map
[Phase 1 output — directory structure, component counts, dependency graph]

## The Hit List — Components to Build/Refactor
[Ranked by priority with severity scores]

### Tier 1: Critical (Build Immediately)
[Components where data inconsistency could mislead students]

### Tier 2: High (Build This Sprint)
[Components with visible inconsistency on student-facing pages]

### Tier 3: Medium (Build Next Sprint)
[Admin/dev inconsistencies or minor visual differences]

### Tier 4: Low (Track for Later)
[Code smells that are visually acceptable but architecturally messy]

## Detailed Findings by Category
[Phase 2 output — all 12 categories with file-level evidence]

## Target Component APIs
[Phase 3 output — full API specs for top 10 consolidation targets]

## Migration Plan

### Step 1: Create the shared component directory
src/components/shared/ — this is where all new modular components live.

### Step 2: Build primitives first, composed second
Order: SectionHeader → ScoreBadge → Card → Badge → Button audit →
       MetricCard → TaxonomyPicker → QuestionCard → DataTable → EmptyState

### Step 3: Migration protocol (per component)
1. Build the new component in src/components/shared/
2. Write it to handle every variant and state found in the audit
3. Add it to the design system gallery page (/developer/design-system)
4. Find every file listed in the audit for that component
5. Replace the ad-hoc implementation with the new component import
6. Run `bun run build` after each file change
7. Verify no visual regression

### Step 4: Enforce going forward
- All new components must use shared primitives
- PR review checklist item: "Does this introduce a new ad-hoc UI pattern?"
- Design system gallery must be updated with every new variant

## Appendix: Files Not Readable
[List any files the audit could not access, with the reason]

## Appendix: Shadcn UI Inventory
[Complete list of available Shadcn components and whether each is being used]
```

### Output Requirements

- The document must be **a single markdown file**
- Every finding must cite **exact file paths**
- Every proposed API must show **before/after code examples** from real files found in the audit
- The migration plan must be **ordered by dependency** (build the things other things depend on first)
- The document must be **directly usable by Claude Code** — a developer should be able to hand this document to an AI coding agent and say "execute the migration plan" without additional context

---

## ANTI-HALLUCINATION SAFEGUARDS

1. If a directory does not exist (e.g., `src/components/shared/` might not exist yet), say "Directory does not exist — creation recommended" and move on.

2. If you cannot read a file's contents, record it as "UNVERIFIED" and skip to the next file. Do not guess what it contains.

3. If you find fewer than 3 instances of a pattern, note it but do not recommend creating a shared component for it. Components should be created for patterns that appear 3+ times.

4. Do not invent component names that don't exist in the codebase. When referencing existing components, use their actual file names and import paths.

5. If the codebase already has a well-implemented shared component (e.g., Shadcn `<Button>` is used consistently everywhere), mark it as "✅ HEALTHY — no action needed" instead of inventing problems.

---

## BEGIN EXECUTION

You have your orders. Execute Phase 1 now. Proceed through all phases without stopping. Generate the final `UI-AUDIT-AND-CONSOLIDATION-STRATEGY.md` at the end.

Good hunting.
