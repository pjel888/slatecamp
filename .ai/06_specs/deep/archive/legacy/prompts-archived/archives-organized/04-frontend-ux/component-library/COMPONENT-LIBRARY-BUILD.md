# SlateCamp Component Library Refactor — Complete Build Instructions

> Give this file to Claude Code alongside these reference files:
> - `CODEBASE-AUDIT-2026-03-24.md` — Full codebase audit
> - `COMPONENT-LIBRARY-SPEC.md` — Component specifications with states, variants, sizes, accessibility
> - `SLATECAMP-COMPONENT-LIBRARY.html` — Visual reference showing exactly what each component looks like
>
> Read ALL reference files before writing any code.

---

## Context

You are refactoring SlateCamp's UI into a consistent, canonical component library. SlateCamp is a Next.js 16 App Router application with React 19, Tailwind CSS v4, shadcn/ui with @base-ui/react primitives, and Zustand. The codebase has 776 files, 247 components, and ~26K lines of code.

The problem: components are implemented ad-hoc across the codebase. The same pattern (close buttons, status badges, cards, taxonomy selectors) exists in multiple inconsistent versions with different hover states, sizes, colors, and accessibility. This refactor creates one canonical version of each component and replaces every ad-hoc instance.

---

## Design Constraints (Reconcile Before Building)

The codebase audit found conflicts between CLAUDE.md rules and actual usage. Apply these decisions:

### Decision 1: Eyebrow Labels
CLAUDE.md says min text is 11px and font-mono is forbidden on labels. But the design system and 80+ components use `text-[9px] font-mono uppercase tracking-widest` for eyebrow labels. **KEEP the eyebrow pattern as-is.** Update CLAUDE.md to add an explicit exception: "Exception: DM Mono at 9px is permitted for the eyebrow/micro-label pattern only (`font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground`)."

### Decision 2: Card Border Radius
CLAUDE.md says cards use `rounded-md` (8px). But most components use `rounded-xl` (12px). **Standardize on `rounded-lg` (8px) for all cards.** Update CLAUDE.md and update all card components during the refactor.

### Decision 3: Hardcoded Colors
159 files use hardcoded hex colors instead of CSS variables/design tokens. **During this refactor, replace every hardcoded hex with the corresponding Campfire design token.** Map them:
- `#1B3FC4` → `var(--color-primary)` / `text-primary` / `bg-primary`
- `#1B7A3C` or `#2D9F6F` → success token
- `#E63329` or `#D64545` → danger token
- `#F5A623` or `#D4951A` → warning token
- `#E8853A` → camp-orange token
- `#534AB7` → trail-purple token
- `#0F1F5C` → navy token
- `#F8F7F5` → background token
- `#F2F0EB` → muted token
- `#E0DED8` → border token
- All text grays → text-primary / text-secondary / text-muted / text-quaternary tokens

If a token doesn't exist in globals.css, create it.

### Decision 4: TypeScript Strict Mode
Enable `strict: true` in tsconfig.json. Fix all resulting type errors. This will surface the 103 `any` instances. Fix them as you encounter them during the refactor — don't do a separate pass.

### Decision 5: Accessibility Baseline
Every interactive component you build or touch must have:
- `focus-visible` ring (not `focus` — ring should only show on keyboard navigation)
- `aria-label` on icon-only buttons
- Minimum 44×44px touch target
- `cursor-not-allowed` + `pointer-events-none` + `opacity-50` on disabled state
- No `maximumScale: 1` — find and remove this from `app/layout.tsx` viewport config

---

## Build Order

Work through components in this exact order. For EACH component:

1. **Search** — Find every ad-hoc implementation across the entire codebase. List the files.
2. **Build** — Create the canonical component following COMPONENT-LIBRARY-SPEC.md for props/variants/states and SLATECAMP-COMPONENT-LIBRARY.html for visual appearance.
3. **Replace** — Swap every ad-hoc instance with the new shared component. Ensure no visual regression.
4. **Verify** — Run `bun run build` and confirm zero errors before moving to the next component.

---

### Component 1: Button

**Location:** `src/components/ui/button.tsx` (likely already exists from shadcn — extend it)

**What to search for:** Every `<button>` element with inline styles or one-off className patterns. Also search for any wrapper components like `PrimaryButton`, `ActionButton`, etc.

**Build:** 6 variants (primary, secondary, ghost, destructive, success, link) × 5 sizes (xs, sm, md, lg, xl). Support: `leftIcon`, `rightIcon`, `loading` (spinner replaces icon, text stays), `disabled`, `fullWidth`. All states from the spec: default, hover, focus-visible, active (scale 0.98), disabled, loading.

**Replace:** Every ad-hoc button across admin, dashboard, wiki, marketing, quiz, auth pages.

---

### Component 2: Badge / Pill

**Location:** `src/components/ui/badge.tsx` (extend or replace existing)

**What to search for:** Every `<span>` with status-colored backgrounds — look for patterns like `bg-emerald-50 text-emerald-700`, `bg-amber-50 text-amber-700`, `bg-red-50 text-red-700`. Also search for: "Published", "Draft", "CAMP", "STORM", "BLINDSPOT", "PROOF", "Foundational", "Intermediate", "Advanced", "clean", "has_issues", "unverified".

**Build:** 9 color variants (default, primary, success, warning, danger, info, purple, orange, outline) × 4 sizes (xs, sm, md, lg). Support: `pill` shape (rounded-full), `dot` indicator, `dismissible` (with CloseButton xs). Plus semantic preset wrappers:
- `StatusBadge` — maps published/draft/archived to success/warning/default
- `VerificationBadge` — maps clean/has_issues/unverified with icons
- `DifficultyBadge` — maps Foundational/Intermediate/Advanced
- `SessionModeBadge` — maps camp/storm/blindspot/proof
- `MasteryBadge` — maps building/proficient/etc

**Replace:** Every hardcoded status/difficulty/mode badge across all pages.

---

### Component 3: CloseButton

**Location:** `src/components/ui/close-button.tsx` (new)

**What to search for:** Every X button, dismiss button, close icon. Search for SVG X icons (line x1="18" y1="6" x2="6" y2="18"), `aria-label="Close"`, `aria-label="Dismiss"`, lucide `X` icon imports.

**Build:** 3 variants (ghost, subtle, destructive) × 3 sizes (sm, md, lg). All states: default, hover, focus-visible. Always requires `aria-label`.

**Replace:** Every ad-hoc close/dismiss button in modals, dialogs, panels, cards, toasts, banners.

---

### Component 4: Card

**Location:** `src/components/ui/card.tsx` (extend existing)

**What to search for:** Every `<div>` with `bg-card border border-border rounded-xl p-4` or similar card patterns. Also search for accent-border cards (`border-l-[3px]`), feature cards with colored backgrounds, and any `card-interactive` hover patterns.

**Build:** 6 variants (default, interactive, selected, accent-left, feature, ghost) × 3 sizes (sm, md, lg). Interactive variant has: hover (border-primary/30 + shadow-sm), focus-visible (ring), selected (border-primary + bg-primary/5). Include `CardHeader` sub-component with the eyebrow + title + subtitle pattern.

**Important:** Change all card border-radius from `rounded-xl` to `rounded-lg` per Decision 2.

**Replace:** Every card pattern across the entire codebase.

---

### Component 5: SectionHeader

**Location:** `src/components/shared/section-header.tsx` (new)

**What to search for:** Every instance of the eyebrow + title + subtitle pattern. Search for `font-mono text-[9px]` or `text-[10px]` combined with `uppercase tracking-widest` near a heading.

**Build:** 3 levels (page, section, card) with the exact typography from the spec:
- Page: Syne 800 17px heading
- Section: Inter 500 14px heading
- Card: Inter 500 13px heading
All have DM Mono eyebrow and optional subtitle + right-aligned action slot.

**Replace:** Every ad-hoc section header pattern.

---

### Component 6: ScoreDisplay

**Location:** `src/components/shared/score-display.tsx` (new)

**What to search for:** Readiness score rings, quiz score displays, mastery percentages, progress bars with percentage values. Search for SVG circles with `stroke-dashoffset`, percentage formatting, and the color logic (green for ≥70%, neutral otherwise).

**Build:** 4 variants (ring, bar, pill, number) × 4 sizes (sm, md, lg, xl). Color logic is non-negotiable: ≥70% green, 40-69% neutral, <40% neutral + muted. NEVER red for low scores. Ring animates on mount. Bar transitions on value change.

**Replace:** Every score/percentage display across dashboard, quiz results, analytics, mastery bars, admin stats.

---

### Component 7: TaxonomyPicker

**Location:** `src/components/shared/taxonomy-picker.tsx` (new)

**What to search for:** Every taxonomy tree/selector implementation. Check: admin taxonomy editor, admin question editor (topic selector), admin article editor (taxonomy linking), wiki sidebar, quiz topic picker, heatmap drill-down. Search for `taxonomy_tree`, `getWikiTaxonomyTree`, `getTaxonomyTree`, `getTaxonomyNodes`.

**Build:** 3 variants (dropdown, sidebar, inline). Supports: search/filter, expand/collapse, single or multi select, optional counts (articles/questions per node), optional ale_id labels, keyboard navigation (arrows, enter, escape). Full state matrix from the spec.

**Replace:** Every taxonomy tree/selector across admin and student-facing pages. This is the most complex shared component — take your time.

---

### Component 8: QuestionCard

**Location:** `src/components/shared/question-card.tsx` (new)

**What to search for:** Question display in quiz engine (`QuizRenderer.tsx`), inline quizzes in wiki articles (`InlineQuiz.tsx`), admin question preview, assessment quiz. Search for answer choice rendering with A/B/C/D letters.

**Build:** 4 variants (quiz, review, preview, compact). Quiz variant has full choice state matrix: unanswered, hovering, selected (blue), submitted-correct (green + others dimmed), submitted-incorrect (red + correct highlighted green). Choice letters in circles that change color with state.

**Replace:** Every question/choice display. Be careful with QuizRenderer.tsx — it's 859 lines and handles more than just rendering. Extract only the display logic into the shared component, don't break the quiz state machine.

---

### Component 9: DataTable

**Location:** `src/components/shared/data-table.tsx` (new)

**What to search for:** Tables in admin (question list, article list, audit log), any data grid patterns. Search for `<table>` elements with sortable headers or pagination.

**Build:** Sortable columns (click header), searchable, selectable rows (checkbox + bulk actions), pagination, row hover, empty state, loading skeleton rows. Column types: text, badge, date (relative), number (right-aligned mono), action (icon buttons).

**Replace:** Every admin data table. QuestionList.tsx (584 lines) and WikiArticleList.tsx are prime candidates.

---

### Component 10: FormInput

**Location:** `src/components/ui/input.tsx` (extend existing)

**What to search for:** Every `<input>` and `<textarea>` with inline state styling. Search for error borders, focus rings, disabled states.

**Build:** 3 sizes (sm, md, lg). 7 states: default, hover, focus, filled, disabled, error, success. Error state shows red border + ring + error message below. Include: `SearchInput` variant (search icon left, clear button right, optional ⌘K hint, debounced onChange).

**Replace:** Every form input across admin, settings, auth, quiz config.

---

### Component 11: Toast / Notification

**Location:** `src/components/ui/toast.tsx` (new or extend existing)

**What to search for:** Any notification/feedback pattern — success confirmations, error messages, save indicators. Search for "Saved", flash messages, or any temporary UI feedback.

**Build:** 4 variants (success, error, warning, info). Left accent border, icon, title, description, optional action button, auto-dismiss (5s for success/info, manual for errors). Stackable (max 3). Appears bottom-right.

**Replace:** Every ad-hoc feedback pattern.

---

### Component 12: EmptyState

**Location:** `src/components/shared/empty-state.tsx` (new)

**What to search for:** "No data", "Nothing here", "Empty", any fallback UI when a list/table has no results. Also check for missing empty states where they should exist.

**Build:** Icon (geometric, not illustrative) + message (honest brand voice) + optional description + optional action button. Message pattern: "[Honest observation]. [What to do next]." Never: "No data found", "Empty", "Nothing here yet!"

**Replace:** Every empty/fallback state, and add them where they're missing.

---

### Component 13: Skeleton Loaders

**Location:** `src/components/ui/skeleton.tsx` (extend existing)

**What to search for:** Existing skeleton components. Also identify the 52 pages missing `loading.tsx` files (listed in the codebase audit).

**Build:** Primitive `Skeleton` with shimmer animation. Plus composed skeletons: `CardSkeleton`, `TableRowSkeleton`, `StatCardSkeleton`, `ArticleListSkeleton`, `QuestionCardSkeleton`, `ScoreRingSkeleton`.

**Replace/Add:** Update existing skeletons to match, and create `loading.tsx` files for the 52 pages that are missing them. Priority pages: `wiki/[slug]`, `admin/dashboard`, `admin/questions`, `admin/articles`, `dashboard`, `dashboard/analytics`.

---

### Component 14: Tabs

**Location:** `src/components/ui/tabs.tsx` (extend existing)

**What to search for:** Tab patterns across admin (underline tabs for navigation), filter toggles (pill tabs for All/Flagged/Clean), segmented controls.

**Build:** 3 variants (underline, pill, segmented). States: inactive, active, hover, focus-visible, disabled.

**Replace:** Every tab/toggle pattern.

---

### Component 15: Tooltip

**Location:** `src/components/ui/tooltip.tsx` (extend existing)

**What to search for:** Existing tooltips plus icon-only buttons that are MISSING tooltips. The audit found only 91 `aria-label` instances across 56 files — many icon buttons lack both tooltip and aria-label.

**Build:** Dark bg, white text, 300ms delay, sm/md sizes, arrow pointer.

**Replace/Add:** Add tooltips to every icon-only button that lacks one.

---

### Component 16: Modal / Dialog

**Location:** `src/components/ui/dialog.tsx` (extend existing)

**What to search for:** Every modal, dialog, confirmation prompt. Search for shadcn Dialog usage.

**Build:** 5 sizes (sm, md, lg, xl, full). Anatomy: overlay + container + header + body + footer. Include `ConfirmDialog` preset (title, description, confirm/cancel buttons, destructive variant). Fade-in + scale-up animation.

**Replace:** Every dialog pattern. Ensure all modals have Escape key handling.

---

### Component 17: Breadcrumb

**Location:** `src/components/shared/breadcrumb.tsx` (new or extend)

**What to search for:** Breadcrumb patterns in wiki, admin, trails. Search for `BreadcrumbContext`.

**Build:** Items separated by `/` chevron. Last item is current (not clickable, font-medium). Previous items are links (muted, hover to foreground). Truncate middle on overflow.

**Replace:** Every breadcrumb instance.

---

### Component 18: LegalCitationBadge

**Location:** `src/components/shared/legal-citation-badge.tsx` (new)

**What to search for:** References to PD 1096, RA 9514, BP 344, RA 9266, NSCP, BP 220, PD 957 rendered as inline badges in articles, questions, rationales.

**Build:** Color-coded by law (blue for NBCP, red for RA 9514, purple for BP 344, green for RA 9266, amber for NSCP, cyan for BP 220, orange for PD 957). DM Mono 10px. Optionally clickable → navigates to Laws & Codes wiki section.

**Replace:** Every inline legal reference that should be a badge.

---

### Component 19: StatCard

**Location:** `src/components/shared/stat-card.tsx` (new)

**What to search for:** Dashboard stat displays — total questions, total articles, readiness score, quiz counts. Search for large DM Mono numbers with eyebrow labels.

**Build:** Eyebrow (DM Mono 9px) + large number (DM Mono, tabular-nums, optional accent color) + optional trend indicator (up/down/flat with arrow and label) + optional click-to-navigate.

**Replace:** Every stat display on dashboards (student and admin).

---

### Component 20: Consolidate Duplicates

The audit identified specific duplicates. Consolidate them:

1. **WikiCallout.tsx + WikiCalloutBox.tsx + AlertBox.tsx** → Merge into a single `Callout` component with variant prop (note, warn, tip, example, info, danger, requirement, most-tested, ale-watch, version-alert). Keep the MDX tag names as aliases so existing articles don't break.

2. **Accordion.tsx + WikiAccordion.tsx** → Merge into a single `Accordion` component. Keep both MDX tag names as aliases.

3. **Remove unused packages** identified in the audit: katex, remark-math, rehype-katex, tw-animate-css, camera-controls, three-stdlib, legacy shadcn-ui. Also remove duplicate `dompurify` (keep `isomorphic-dompurify` only).

---

## After All Components Are Built

### Update Design System Gallery

Update the page at `/dashboard/developer/design-system` to showcase every new component with every variant and state. This page serves as the living Storybook — it should demonstrate:
- Every button variant × size
- Every badge variant × size × shape
- All close button variants
- All card variants with hover states
- Section header levels
- Score display variants
- Form input states
- Toasts
- Empty states
- Skeleton loaders
- Question card states
- Data table
- Taxonomy picker
- Legal citation badges
- Stat cards

### Remove Debug Console Logs

Remove the ~15 `console.log` statements identified in the audit (wiki-actions.ts, WikiLayoutContent.tsx, lab-analytics.ts). Keep `console.error` and `console.warn`.

### Final Build Check

Run `bun run build` one final time. Confirm zero errors, zero warnings related to the refactor. If TypeScript strict mode surfaces errors in files you didn't touch during this refactor, fix them anyway — we're cleaning the whole house.

---

## Critical Rules

1. **Never break existing functionality.** Every replacement must be visually identical or better than what it replaces. If you're unsure about a replacement, leave the original and add a `// TODO: migrate to shared component` comment.

2. **Follow the visual reference exactly.** `SLATECAMP-COMPONENT-LIBRARY.html` shows the precise appearance. `COMPONENT-LIBRARY-SPEC.md` defines the props and behavior. Both must be honored.

3. **Dark mode must work.** Use semantic Tailwind tokens (`text-foreground`, `bg-background`, `bg-card`, `border-border`, `text-muted-foreground`). Never hardcode colors that won't invert in dark mode.

4. **Every interactive element needs focus-visible.** Use `:focus-visible` (not `:focus`) for keyboard-only focus rings. Pattern: `focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2`.

5. **Don't break MDX articles.** When consolidating callout/accordion components, keep all existing MDX tag names working as aliases. Students' articles must render identically.

6. **Run `bun run build` after every component.** Do not proceed if the build fails.

7. **Commit after each component.** One component per commit with a clear message like `refactor: canonical Button component with 6 variants × 5 sizes`.

8. **Preserve all existing imports.** If a file imports from `@/components/ui/button`, the new component must be exported from the same path. Don't break import paths without updating every consumer.

9. **Server Components by default.** Only add `'use client'` when the component genuinely needs client interactivity (useState, onClick, etc.). Many display components (Badge, Card, SectionHeader, Skeleton) should be Server Components.

10. **The taxonomy picker will take the longest.** It's used in 6+ different contexts with different configurations. Build it carefully, test each context after integration.

