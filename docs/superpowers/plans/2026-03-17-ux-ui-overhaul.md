# SlateCamp UX/UI Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align every non-landing-page surface of SlateCamp to the Rams Standard design system — eliminating AI-slop aesthetics, enforcing cognitive load principles from the UX research paper, and producing a Linear/GitHub-grade professional interface.

**Architecture:** Bottom-up: fix design tokens first (Chunk 1), then UI primitives (Chunk 2), then app shell (Chunk 3), then each feature domain in parallel (Chunks 4–12). Each chunk produces a commit. Chunks 4–12 are independent and can run in parallel after Chunks 1–3 complete.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, @base-ui/react, CVA, Lucide icons, Recharts, React Three Fiber, Supabase

**Governing Documents:**
- `prompts/SLATECAMP-ULTIMATE-CLAUDE-MD.md` — The Rams Standard (PRIMARY source of truth)
- `prompts/UX_UI Strategies for Online Education Testing.md` — Academic research basis
- `CLAUDE.md` — Project constraints and absolute rules

---

## Dependency Graph

```
Chunk 1 (Tokens) ──→ Chunk 2 (Primitives) ──→ Chunk 3 (Shell)
                                                    │
                    ┌───────────────────────────────┤
                    ▼           ▼         ▼         ▼         ▼         ▼         ▼         ▼         ▼
                 Chunk 4    Chunk 5   Chunk 6   Chunk 7   Chunk 8   Chunk 9   Chunk 10  Chunk 11  Chunk 12
                Dashboard   Testing    Wiki     Notes   Analytics  3D Lab    Settings   Admin      Auth
```

**Chunks 4–12 are parallelizable** — they only depend on Chunks 1–3 being complete.

---

## Audit Summary: Current State vs. Rams Standard

| Area | Current State | Rams Standard Violation | Fix Required |
|------|--------------|------------------------|--------------|
| `--primary` | `#1f3055` (dark navy) | Must be `blue-600 (#2563eb)` | Remap CSS var |
| `--ring` | `#1f3055` | Must follow primary = `blue-600` | Remap CSS var |
| Font stack | Geist Sans/Mono (Google) | System fonts: `-apple-system, BlinkMacSystemFont, 'Segoe UI'` | Change font config |
| Token bloat | ~80+ SlateCamp brand colors | Max: white, gray-50, blue-600, + 3 semantic | Prune unused tokens |
| Radius tokens | Up to `--radius-4xl: 24px` | FORBIDDEN: `rounded-xl` (12px)+ on standard elements | Remove 2xl/3xl/4xl |
| `confetti-pop` animation | Exists in globals.css | CLAUDE.md: "NEVER generic gamification" | Delete keyframe |
| `--card-radius` | `12px` | Cards use `rounded-md` (6px) per Rams | Fix to 6px |
| Insurance tier color | `text-indigo-600` in Sidebar | FORBIDDEN: indigo in UI palette | Change to blue-600 |
| QuickActionsBar | Floating FAB bottom-right | "No FABs, no floating toolbars" | Dock into header or remove |
| SharedPageLayout | Dotted grid background | Not in Rams Standard, adds visual noise | Remove decorative bg |
| DashboardHeader | Grey background bar | Minimal — review for necessity | Simplify or merge with breadcrumbs |
| Card shadows | `shadow-[0_1px_0_rgba(31,35,40,0.04)]` | Correct per Rams (ultra-subtle) | Keep |
| Sidebar active state | `bg-blue-50 text-blue-600` | Correct per Rams | Keep |
| Button component | CVA-based, proper variants | Mostly aligned | Minor tweaks |

---

## Chunk 1: Design Token Foundation

**Goal:** Align `globals.css` and font configuration with the Rams Standard. This is the foundation — everything downstream depends on these tokens being correct.

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `tailwind.config.ts` (if exists and relevant)

### Task 1.1: Fix Primary Color Token

The Rams Standard mandates `blue-600 (#2563eb)` as the primary accent. Currently `--primary: #1f3055` (dark navy).

- [ ] **Step 1:** In `src/app/globals.css`, in the `:root` block, change:
  ```css
  --primary: #1f3055;
  ```
  to:
  ```css
  --primary: #2563eb; /* blue-600 — Rams Standard primary */
  ```

- [ ] **Step 2:** In the same `:root` block, change:
  ```css
  --ring: #1f3055;
  ```
  to:
  ```css
  --ring: #2563eb; /* blue-600 — matches primary */
  ```

- [ ] **Step 3:** Update sidebar tokens in `:root`:
  ```css
  --sidebar-primary: #2563eb;
  --sidebar-ring: #2563eb;
  ```

- [ ] **Step 4:** In the `.dark` block, update:
  ```css
  --primary: #3b82f6; /* blue-500 for dark mode — brighter for contrast */
  --ring: #3b82f6;
  --sidebar-primary: #3b82f6;
  --sidebar-ring: #3b82f6;
  ```

- [ ] **Step 5:** Update chart tokens in `:root`:
  ```css
  --chart-1: #2563eb; /* blue-600 — primary chart color per Rams */
  ```
  And in `.dark`:
  ```css
  --chart-1: #3b82f6;
  ```

- [ ] **Step 6:** Run `bun run build` to verify no build errors from token changes.

- [ ] **Step 7:** Commit:
  ```bash
  git add src/app/globals.css
  git commit -m "fix: align primary color token to blue-600 per Rams Standard"
  ```

### Task 1.2: Fix Card Radius Token

Rams Standard: cards use `rounded-md` (6px). Current `--card-radius: 12px` violates this.

- [ ] **Step 1:** In `src/app/globals.css` `:root`, change:
  ```css
  --card-radius: 12px;
  ```
  to:
  ```css
  --card-radius: 6px; /* rounded-md — Rams Standard */
  ```

- [ ] **Step 2:** Remove forbidden radius tokens from `@theme inline`. Delete:
  ```css
  --radius-2xl: 1rem;     /* 16px — FORBIDDEN */
  --radius-3xl: 1.25rem;  /* 20px — FORBIDDEN */
  --radius-4xl: 1.5rem;   /* 24px — FORBIDDEN */
  ```

- [ ] **Step 3:** Commit:
  ```bash
  git add src/app/globals.css
  git commit -m "fix: remove forbidden radius tokens, fix card-radius to 6px"
  ```

### Task 1.3: Remove Gamification Animation

CLAUDE.md: "NEVER Implement Generic Gamification." The `confetti-pop` keyframe violates this.

- [ ] **Step 1:** In `src/app/globals.css`, delete the entire `@keyframes confetti-pop` block and `.confetti-pop` class (lines ~456–472).

- [ ] **Step 2:** Search codebase for any usage of `confetti-pop`:
  ```bash
  grep -r "confetti-pop" src/
  ```
  Remove any references found.

- [ ] **Step 3:** Commit:
  ```bash
  git add -A
  git commit -m "fix: remove confetti-pop animation — violates no-gamification rule"
  ```

### Task 1.4: Prune Unused Brand Color Tokens

The Rams Standard palette is: white, gray-50, blue-600, green-600 (semantic), amber-500 (semantic), red-500 (semantic). The ~80+ SlateCamp brand tokens (paper-warm, paper-peach-bone, ink-espresso, ink-mauve-charcoal, amber-terracotta, crimson-brick, sage-olive, cobalt-steel-blue, earth-camel, stone-mid-grey, etc.) create maintenance burden and encourage palette sprawl.

- [ ] **Step 1:** Search for actual usage of each `--color-slatecamp-*` token:
  ```bash
  grep -r "slatecamp-paper-warm\|slatecamp-paper-peach\|slatecamp-paper-putty\|slatecamp-paper-light-beige\|slatecamp-paper-minty\|slatecamp-paper-warm-grey\|slatecamp-paper-taupe\|slatecamp-paper-greige" src/ --include="*.tsx" --include="*.ts" --include="*.css" -l
  ```
  Repeat for each category (ink-*, amber-*, crimson-*, sage-*, cobalt-*, earth-*, stone-*).

- [ ] **Step 2:** For tokens with ZERO usage in TSX/TS files, remove them from `globals.css` `@theme inline` block. Keep only tokens that are actively referenced.

- [ ] **Step 3:** Preserve these core SlateCamp tokens regardless (used in sidebar, layout, or theming):
  - `--color-slatecamp-paper` (base background)
  - `--color-slatecamp-paper-snow` (white)
  - `--color-slatecamp-paper-cool` (#f5f5f7)
  - `--color-slatecamp-ink-main` (#1d1d1f)
  - `--color-slatecamp-ink-muted` (#6e6e73)
  - `--color-slatecamp-ink-subtle` (#86868b)
  - `--color-slatecamp-amber` (#ed8008 — brand accent, landing only)
  - `--color-slatecamp-sage` (#34c759 — success/mastery)
  - `--color-slatecamp-border`, `--color-slatecamp-border-strong`, `--color-slatecamp-border-light`

- [ ] **Step 4:** Run `bun run build` to confirm no broken references.

- [ ] **Step 5:** Commit:
  ```bash
  git add src/app/globals.css
  git commit -m "chore: prune unused SlateCamp brand color tokens — reduce palette sprawl"
  ```

### Task 1.5: Switch to System Font Stack

Rams Standard mandates: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` for body, `'JetBrains Mono', 'SF Mono', monospace` for code. Currently uses Geist (Google Font import).

- [ ] **Step 1:** In `src/app/layout.tsx`, remove the Geist font imports:
  ```typescript
  // DELETE these lines:
  import { Geist, Geist_Mono } from 'next/font/google'
  const geistSans = Geist({ variable: '--font-sans', subsets: ['latin'] })
  const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] })
  ```

- [ ] **Step 2:** Remove font variables from body className:
  ```tsx
  // Change FROM:
  <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
  // Change TO:
  <body className="font-sans antialiased">
  ```

- [ ] **Step 3:** In `src/app/globals.css`, in the `@theme inline` block, replace:
  ```css
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  ```
  with:
  ```css
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace;
  ```

- [ ] **Step 4:** Run `bun run build` to verify.

- [ ] **Step 5:** Commit:
  ```bash
  git add src/app/layout.tsx src/app/globals.css
  git commit -m "fix: switch to system font stack per Rams Standard — remove Google Fonts"
  ```

---

## Chunk 2: UI Primitive Alignment

**Goal:** Audit and fix all `src/components/ui/` primitives to conform to the Rams Standard tokens. These components are used everywhere — fixing them propagates correctness globally.

**Files:**
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/dialog.tsx`
- Modify: `src/components/ui/tooltip.tsx`
- Modify: `src/components/ui/badge.tsx`
- Audit: all other `src/components/ui/*.tsx` files

### Task 2.1: Audit Card Component

- [ ] **Step 1:** Read `src/components/ui/card.tsx`. Verify:
  - Uses `rounded-md` (correct per Rams)
  - Shadow is ultra-subtle or none (current: `shadow-[0_1px_0_rgba(31,35,40,0.04)]` — correct)
  - Border uses `border-border` token (correct)
  - No `rounded-xl` or `rounded-2xl` anywhere

- [ ] **Step 2:** Verify CardTitle uses Rams typography scale:
  - Current: `text-base leading-snug font-medium` for default, `text-sm` for sm
  - Rams: Card title = `text-sm font-semibold text-gray-900`
  - Fix: Change `text-base leading-snug font-medium` to `text-sm font-semibold`

- [ ] **Step 3:** Commit:
  ```bash
  git add src/components/ui/card.tsx
  git commit -m "fix: align CardTitle typography to Rams Standard"
  ```

### Task 2.2: Audit Button Component

- [ ] **Step 1:** Read `src/components/ui/button.tsx`. Verify:
  - `default` variant uses `bg-primary text-primary-foreground` — now resolves to blue-600 after Chunk 1. Correct.
  - `destructive` variant: current is `bg-destructive/10 text-destructive` (soft destructive). Rams says `red-500` for error states. This is fine as a soft variant.
  - All sizes use `rounded-md` (inherits from base class). Verify no `rounded-xl`.
  - Focus ring: verify `focus-visible:ring-ring/50` which resolves to blue-600. Correct.

- [ ] **Step 2:** Verify `h-8` default height is appropriate. Rams doesn't mandate specific button heights but says "buttons no larger than necessary." Current `h-8` (32px) is compact. Good.

- [ ] **Step 3:** If all checks pass, no changes needed. Document in commit:
  ```bash
  git commit --allow-empty -m "audit: button.tsx — already Rams-compliant"
  ```
  (Or skip empty commit and move on.)

### Task 2.3: Audit Dialog/Modal Component

- [ ] **Step 1:** Read `src/components/ui/dialog.tsx`. Verify:
  - Overlay radius: should be `rounded-lg` (8px) per Rams (modals/overlays)
  - Shadow: should use `shadow-lg` per Rams
  - No `rounded-xl`, `rounded-2xl`, or `rounded-3xl`

- [ ] **Step 2:** Fix any violations found. Common issues:
  - If using `rounded-xl` or `rounded-2xl`, change to `rounded-lg`
  - If using `shadow-xl` or `shadow-2xl`, change to `shadow-lg`

- [ ] **Step 3:** Commit fixes if any.

### Task 2.4: Audit All Remaining UI Primitives

- [ ] **Step 1:** For each file in `src/components/ui/`, check against Rams Standard:

  **Checklist per component:**
  - [ ] Border radius: `rounded-md` standard, `rounded-lg` overlays, `rounded-full` pills/avatars only
  - [ ] Colors: only `primary`, `border`, `muted`, `destructive`, `accent` tokens — no arbitrary hex
  - [ ] Shadows: `shadow-none` or ultra-subtle at rest, `shadow-sm` hover, `shadow-lg` overlays only
  - [ ] Typography: within the 4-size scale (11px labels, 14px body/card-title, 16px section, 20px page)
  - [ ] No forbidden colors (purple, indigo, teal, cyan, pink, orange)
  - [ ] No forbidden radius (rounded-xl+)
  - [ ] No forbidden shadows (shadow-xl, shadow-2xl on non-overlays)

  **Files to audit:** `input.tsx`, `textarea.tsx`, `label.tsx`, `badge.tsx`, `avatar.tsx`, `alert-dialog.tsx`, `sheet.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `command.tsx`, `tooltip.tsx`, `progress.tsx`, `slider.tsx`, `radio-group.tsx`, `select.tsx`, `switch.tsx`, `tabs.tsx`, `calendar.tsx`, `scroll-area.tsx`, `separator.tsx`, `skeleton.tsx`, `toast.tsx`, `toaster.tsx`, `resizable.tsx`, `input-group.tsx`, `AppleCloseButton.tsx`, `SlateCampLogo.tsx`

- [ ] **Step 2:** Fix violations found in each file.

- [ ] **Step 3:** Commit:
  ```bash
  git add src/components/ui/
  git commit -m "fix: align all UI primitives to Rams Standard tokens"
  ```

---

## Chunk 3: App Shell (Sidebar, Navbar, Header, Layout)

**Goal:** Fix the application shell — the sidebar, top bars, page layout wrapper, and navigation — to be Rams-compliant. This affects every page.

**Files:**
- Modify: `src/components/shared/Sidebar.tsx`
- Modify: `src/components/shared/Navbar.tsx`
- Modify: `src/components/shared/DashboardHeader.tsx`
- Modify: `src/components/shared/QuickActionsBar.tsx`
- Modify: `src/components/layouts/SharedPageLayout.tsx`
- Modify: `src/app/dashboard/layout.tsx`

### Task 3.1: Fix Sidebar Violations

- [ ] **Step 1:** Read `src/components/shared/Sidebar.tsx`. Fix the insurance tier color:
  ```tsx
  // Line ~305: Change FROM:
  tier === 'camp' ? 'text-blue-600' : 'text-indigo-600'
  // Change TO:
  tier === 'camp' ? 'text-blue-600' : 'text-blue-600'
  ```
  Rationale: indigo is FORBIDDEN in the Rams palette.

- [ ] **Step 2:** Verify sidebar background. Current: `bg-white`. Correct per Rams.

- [ ] **Step 3:** Verify border treatment. Current: `border-r border-border`. Correct — borders are primary structural element.

- [ ] **Step 4:** Verify active indicator. Current: `bg-blue-600 rounded-r-full` bar + `bg-blue-50 text-blue-600`. This is Rams-compliant.

- [ ] **Step 5:** Verify the Logomark component:
  ```tsx
  <div className='flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm'>
  ```
  Uses `rounded-md` and `bg-blue-600`. Correct.

- [ ] **Step 6:** Check tooltip styling in collapsed mode:
  ```tsx
  className='bg-zinc-950 text-zinc-50 font-medium text-xs'
  ```
  This is fine — dark tooltip on inverted background is standard.

- [ ] **Step 7:** Verify dialog component in sidebar uses proper destructive button:
  Current:
  ```tsx
  className='flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white'
  ```
  This overrides the destructive variant. Should use the standard `variant="destructive"` instead, but since Rams says red-500 for error states and the current button destructive variant is soft (bg-destructive/10), this explicit red is actually appropriate for a high-stakes "exit quiz" action. Keep as-is.

- [ ] **Step 8:** Commit:
  ```bash
  git add src/components/shared/Sidebar.tsx
  git commit -m "fix: remove indigo from sidebar tier colors — use blue-600 only"
  ```

### Task 3.2: Remove QuickActionsBar Floating Widget

Rams Standard Section 6.4: "No FABs, no floating toolbars, no bottom sheets on desktop."

- [ ] **Step 1:** Read `src/components/shared/QuickActionsBar.tsx` to understand its features:
  - Search (opens Omnibar)
  - AI Chat
  - Quick Note (opens QuickCaptureDrawer)

- [ ] **Step 2:** These features need to be relocated, not deleted:
  - **Search:** Already available via Omnibar — can be triggered by keyboard shortcut (Cmd+K). Remove the floating button.
  - **AI Chat:** Should be accessible from the sidebar or header, not a FAB.
  - **Quick Note:** Should be accessible from the sidebar or header, not a FAB.

- [ ] **Step 3:** In `src/app/dashboard/layout.tsx`, remove the `<QuickActionsBar />` component render:
  ```tsx
  // DELETE this line:
  <QuickActionsBar />
  ```

- [ ] **Step 4:** Add keyboard shortcut hints to the sidebar for Omnibar (Cmd+K is likely already wired). Verify the Omnibar is still accessible via keyboard.

- [ ] **Step 5:** Commit:
  ```bash
  git add src/app/dashboard/layout.tsx
  git commit -m "fix: remove floating QuickActionsBar — violates no-FAB rule (Rams 6.4)"
  ```

### Task 3.3: Clean SharedPageLayout

- [ ] **Step 1:** Read `src/components/layouts/SharedPageLayout.tsx`. Check for:
  - Dotted grid background or decorative patterns (violation: visual noise)
  - Correct padding per Rams: `p-6` (24px) for page padding
  - Max-width constraints

- [ ] **Step 2:** Remove any decorative background patterns (dotted grids, gradient overlays). The layout should be plain `bg-transparent` or `bg-white` to inherit from the parent.

- [ ] **Step 3:** Ensure consistent page padding: `p-6` on all sides.

- [ ] **Step 4:** Commit:
  ```bash
  git add src/components/layouts/SharedPageLayout.tsx
  git commit -m "fix: remove decorative grid background from SharedPageLayout"
  ```

### Task 3.4: Simplify DashboardHeader

- [ ] **Step 1:** Read `src/components/shared/DashboardHeader.tsx`. Assess if it adds value or just occupies vertical space.

- [ ] **Step 2:** If it only shows the page title with no actions, consider simplifying to a lightweight breadcrumb or removing entirely (page titles can be part of page content). The Rams Standard prioritizes maximizing content area.

- [ ] **Step 3:** If kept, ensure:
  - Typography: `text-xl font-semibold text-gray-900 tracking-tight` (page heading per Rams)
  - Background: transparent or white (not gray)
  - Minimal height

- [ ] **Step 4:** Commit:
  ```bash
  git add src/components/shared/DashboardHeader.tsx
  git commit -m "fix: simplify DashboardHeader — minimal chrome per Rams Standard"
  ```

### Task 3.5: Fix Dashboard Layout Background

- [ ] **Step 1:** In `src/app/dashboard/layout.tsx`, verify the outer container:
  ```tsx
  className='flex h-screen bg-[#f6f8fa] text-gray-900 font-sans selection:bg-gray-200'
  ```
  The `bg-[#f6f8fa]` is close to `gray-50 (#f9fafb)` but is an arbitrary hex. Rams says TWO backgrounds: white and gray-50.

- [ ] **Step 2:** Change to use the token:
  ```tsx
  className='flex h-screen bg-muted text-foreground font-sans selection:bg-gray-200'
  ```
  Or use the explicit Tailwind class: `bg-gray-50`

- [ ] **Step 3:** Commit:
  ```bash
  git add src/app/dashboard/layout.tsx
  git commit -m "fix: use bg-muted token instead of arbitrary hex for dashboard background"
  ```

---

## Chunk 4: Dashboard Hub

**Goal:** Overhaul the main `/dashboard` page and its components to be Rams-compliant.

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/components/dashboard/DashboardHero.tsx`
- Modify: `src/components/dashboard/DailyCatalystCard.tsx`
- Modify: `src/components/dashboard/RecentActivityCard.tsx`
- Modify: `src/components/dashboard/CompetenceSignalCard.tsx`
- Modify: `src/components/dashboard/HeatmapSection.tsx`
- Modify: `src/components/dashboard/RichInfoPopover.tsx`
- Modify: `src/components/dashboard/ActivityHeatmap.tsx`
- Modify: `src/components/dashboard/ModeCard.tsx`
- Modify: `src/components/dashboard/TestingHub.tsx`
- Modify: `src/components/shared/ReadinessGauge.tsx`

### Task 4.1: Audit Dashboard Page Layout

- [ ] **Step 1:** Read `src/app/dashboard/page.tsx`. Check:
  - Gap values align to 8px grid (`gap-2` = 8px — acceptable)
  - Grid structure is clean (current 3-column grid — fine)
  - No raw typography classes in the page file (should use components)

- [ ] **Step 2:** The inline card for heatmap section uses raw classes:
  ```tsx
  <div className='w-full bg-white relative border border-border rounded-md p-2'>
  ```
  This should use `<Card>` component instead:
  ```tsx
  <Card className="relative">
    <CardContent>
  ```

- [ ] **Step 3:** Fix and commit.

### Task 4.2: Audit DashboardHero Component

- [ ] **Step 1:** Read `src/components/dashboard/DashboardHero.tsx`. Check:
  - Heading size ≤ `text-xl` (Rams max for page headings)
  - No decorative gradients
  - Brand voice: "Welcome back" not "You've been away"
  - No gamification elements (streaks, confetti)
  - Color usage: max 3 non-gray on screen

- [ ] **Step 2:** Fix any violations. Common hero issues:
  - Oversized headings (text-2xl+) — cap at text-xl
  - Decorative illustrations — remove unless informational
  - Stats that use deficit framing — reframe to growth

- [ ] **Step 3:** Commit.

### Task 4.3: Audit DailyCatalystCard

- [ ] **Step 1:** Read `src/components/dashboard/DailyCatalystCard.tsx`. Check:
  - Uses `<Card>` component (not raw border/bg classes)
  - Typography within 4-size scale
  - CTA button uses `bg-blue-600` primary style
  - Brand voice: "Recommended for you" not "You must complete"

- [ ] **Step 2:** Fix any violations.

- [ ] **Step 3:** Commit.

### Task 4.4: Audit CompetenceSignalCard

- [ ] **Step 1:** Read `src/components/dashboard/CompetenceSignalCard.tsx`. Check:
  - Metric values use `font-mono text-sm font-medium tabular-nums`
  - Growth framing: "42 topics covered" not "58 topics remaining"
  - Semantic colors only (green for mastery, amber for developing, red for gaps)
  - No more than 3 non-gray colors visible

- [ ] **Step 2:** Fix violations.

- [ ] **Step 3:** Commit.

### Task 4.5: Audit Remaining Dashboard Components

- [ ] **Step 1:** Read and audit each remaining dashboard component:
  - `RecentActivityCard.tsx` — list items, timestamps
  - `HeatmapSection.tsx` — activity calendar
  - `ActivityHeatmap.tsx` — the actual heatmap (Recharts)
  - `RichInfoPopover.tsx` — info tooltip
  - `ModeCard.tsx` — quiz mode selector
  - `TestingHub.tsx` — testing mode hub
  - `ReadinessGauge.tsx` — circular gauge

- [ ] **Step 2:** For each, apply the standard checklist:
  - [ ] Border radius: only `rounded-md`, `rounded-lg` (overlays), `rounded-full` (pills)
  - [ ] Colors: within Rams palette
  - [ ] Typography: within 4-size scale
  - [ ] Shadows: minimal
  - [ ] No gradients on UI elements
  - [ ] No decorative icons
  - [ ] Chart styling: grid lines `#f4f4f5`, axis text `fill: '#6b7280', fontSize: 11`, primary color `blue-600`

- [ ] **Step 3:** For Recharts components (HeatmapSection, ActivityHeatmap), verify:
  ```tsx
  // Rams chart standards:
  // Grid: stroke="#f4f4f5"
  // Axis: fill="#6b7280" fontSize={11}
  // Tooltip: borderRadius="6px" border="1px solid #d0d7de"
  // Primary: "#2563eb" (blue-600)
  ```

- [ ] **Step 4:** Commit all dashboard fixes:
  ```bash
  git add src/components/dashboard/ src/components/shared/ReadinessGauge.tsx
  git commit -m "fix: align all dashboard components to Rams Standard"
  ```

---

## Chunk 5: Testing Hub & Quiz Experience

**Goal:** The highest-cognitive-load environment. Must be flawless per Rams Section 6 and the UX research paper's cognitive load findings.

**Files:**
- Modify: `src/app/dashboard/testing/page.tsx`
- Modify: `src/app/dashboard/testing/layout.tsx`
- Modify: `src/components/quiz/QuizHeader.tsx`
- Modify: `src/components/quiz/TimerBar.tsx`
- Modify: `src/components/quiz/QuestionStem.tsx`
- Modify: `src/components/quiz/OptionButton.tsx`
- Modify: `src/components/quiz/FooterNavigator.tsx`
- Modify: `src/components/quiz/ConfirmSubmitSheet.tsx`
- Modify: `src/components/quiz/SaveIndicator.tsx`
- Modify: `src/components/quiz/AITutorDrawer.tsx`
- Modify: `src/components/quiz/RationaleDrawer.tsx`
- Modify: `src/components/quiz/QuizOverlay.tsx`
- Modify: `src/components/dashboard/QuizRenderer.tsx`
- Modify: `src/components/dashboard/QuizStart.tsx`
- Modify: `src/components/dashboard/ResultsSummary.tsx`
- Modify: `src/components/dashboard/CustomSessionBuilder.tsx`

### Task 5.1: Audit Quiz Viewport Lock

Rams Section 6.1: "Testing interface MUST fit within 100vh. No browser-level scrolling."

- [ ] **Step 1:** Read `src/components/quiz/QuizOverlay.tsx` and `src/components/dashboard/QuizRenderer.tsx`. Verify:
  - Container: `h-screen` or `h-[100vh]` with `overflow-hidden`
  - Internal containers use `overflow-y-auto` for scrolling content
  - Test at 1440×900 (13" MacBook Pro)

- [ ] **Step 2:** Fix if viewport scrolling is possible.

### Task 5.2: Audit Split-Screen Quiz Layout

Rams Section 6.2: "Left: question stem (scrollable). Right: options + navigation (stationary). Options NEVER shift position."

- [ ] **Step 1:** Verify the quiz layout implements proper split-screen:
  - Left column: `overflow-y-auto` for long question stems
  - Right column: `overflow-hidden` or fixed height — options always at same Y position
  - On mobile: stacked vertically but options still fixed at bottom

- [ ] **Step 2:** Fix layout issues.

### Task 5.3: Audit Quiz Button Hierarchy

Rams Section 6.3 specifies exact button styles:

- [ ] **Step 1:** Read `src/components/quiz/FooterNavigator.tsx`. Verify:
  - Next/Submit: `bg-blue-600 hover:bg-blue-700 text-white`
  - Previous: `border border-gray-200 text-gray-600 hover:bg-gray-50`
  - Flag: `text-gray-400 hover:text-amber-500` (icon-only)
  - Exit: `text-gray-500 hover:text-gray-700`

- [ ] **Step 2:** Read `src/components/quiz/OptionButton.tsx`. Verify:
  - Uses quiz-specific CSS tokens: `--quiz-selected-bg`, `--quiz-correct-bg`, `--quiz-wrong-bg`
  - No forbidden colors (purple, indigo, teal)
  - Option positions are stable (no layout shift on select)

- [ ] **Step 3:** Fix any deviations.

### Task 5.4: Audit Timer UX

Rams Section 5.6: "Timer UX: subtle, non-dominant, optionally hideable."
Research paper Section 6: Timer anxiety is a major source of cognitive load.

- [ ] **Step 1:** Read `src/components/quiz/TimerBar.tsx`. Verify:
  - Uses secondary text color (`text-gray-500` or `text-xs text-gray-500`)
  - NOT using red or large bold text for time remaining
  - Provides option to hide/minimize timer
  - No pulsing or flashing animations when time is low (these increase anxiety)

- [ ] **Step 2:** If timer turns red when low, change to amber-500 warning (less aggressive).

- [ ] **Step 3:** Fix violations.

### Task 5.5: Audit SaveIndicator

Rams Section 5.6: "Auto-save: always active, always visible ('Saved ✓'), always reassuring."
Research paper Section on auto-save: Must continually reassure user data is safe.

- [ ] **Step 1:** Read `src/components/quiz/SaveIndicator.tsx`. Verify:
  - Shows "Saved ✓" or "All changes saved" with timestamp
  - Uses secondary text styling (small, non-dominant)
  - Transitions smoothly between "Saving..." and "Saved ✓"
  - Never shows alarming error states — graceful offline fallback

- [ ] **Step 2:** Fix if needed.

### Task 5.6: Audit Metacognitive Tools

Rams Section 6.5: Flag, eliminator, navigator grid must be "instantly accessible but never forced."

- [ ] **Step 1:** Verify flag/bookmark is accessible but not prominent.
- [ ] **Step 2:** Verify answer eliminator (strikethrough) exists and works.
- [ ] **Step 3:** Verify question navigator grid shows answered/unanswered/flagged states.
- [ ] **Step 4:** Ensure tools are docked (not floating) per Section 6.4.

### Task 5.7: Audit Quiz-Adjacent Components

- [ ] **Step 1:** Read and audit:
  - `QuizStart.tsx` — start confirmation
  - `ResultsSummary.tsx` — quiz results
  - `CustomSessionBuilder.tsx` — custom quiz config
  - `AITutorDrawer.tsx` — contextual AI tutor
  - `RationaleDrawer.tsx` — answer rationale
  - `ConfirmSubmitSheet.tsx` — submit confirmation

- [ ] **Step 2:** For each, apply Rams checklist.

- [ ] **Step 3:** Special attention for ResultsSummary:
  - Growth framing: "You covered 24 topics" not "You got 12 wrong"
  - No gamification (no confetti, no badges, no virtual rewards)
  - Brand voice: "Not quite. Here's why..." not "WRONG"

- [ ] **Step 4:** Commit all quiz fixes:
  ```bash
  git add src/components/quiz/ src/components/dashboard/QuizRenderer.tsx src/components/dashboard/QuizStart.tsx src/components/dashboard/ResultsSummary.tsx src/components/dashboard/CustomSessionBuilder.tsx
  git commit -m "fix: align entire quiz experience to Rams Standard and cognitive load research"
  ```

---

## Chunk 6: Wiki

**Goal:** Align wiki reading experience for minimal cognitive load. The wiki is a knowledge base — focus on readability and content hierarchy.

**Files:**
- Modify: `src/app/dashboard/wiki/page.tsx`
- Modify: `src/app/dashboard/wiki/[slug]/page.tsx`
- Modify: `src/app/dashboard/wiki/layout.tsx`
- Modify: `src/components/wiki/WikiArticle.tsx`
- Modify: `src/components/wiki/WikiLayoutClient.tsx`
- Modify: `src/components/wiki/WikiSidebar.tsx`
- Modify: `src/components/wiki/WikiTableOfContents.tsx`
- Modify: `src/components/wiki/WikiSearchBar.tsx`
- Modify: `src/components/wiki/WikiCommandPalette.tsx`
- Modify: `src/components/wiki/ArticlePrevNext.tsx`
- Modify: `src/components/wiki/RecentlyUpdatedStrip.tsx`

### Task 6.1: Audit Wiki Layout

- [ ] **Step 1:** Read wiki layout files. Check:
  - Sidebar: border-based structure, not shadow-based
  - Content area: max line length 65-75 characters (`max-w-prose` or ~ch units)
  - Typography: body text `text-sm text-gray-700`, line-height ≥ 1.5
  - Left-aligned text only (never justified)

- [ ] **Step 2:** Verify wiki article rendering:
  - Heading hierarchy: page → section → card title sizes
  - Code blocks: `font-mono` with proper background
  - No decorative elements

- [ ] **Step 3:** Fix and commit.

### Task 6.2: Audit Wiki Navigation

- [ ] **Step 1:** Check WikiSidebar, WikiTableOfContents, ArticlePrevNext:
  - Active state: blue-600 highlight
  - No forbidden colors
  - Proper border structure

- [ ] **Step 2:** Check WikiSearchBar:
  - Uses standard input styling
  - Focus ring: `ring-2 ring-blue-500/30 ring-offset-2`

- [ ] **Step 3:** Fix and commit:
  ```bash
  git add src/components/wiki/ src/app/dashboard/wiki/
  git commit -m "fix: align wiki components to Rams Standard"
  ```

---

## Chunk 7: Notes

**Goal:** Align notes interface. Notes is a personal workspace — should feel calm and focused.

**Files:**
- Modify: `src/app/dashboard/notes/page.tsx`
- Modify: `src/components/notes/NotesShell.tsx`
- Modify: `src/components/notes/NotesSidebar.tsx`
- Modify: `src/components/notes/NoteEditor.tsx`
- Modify: `src/components/notes/NotesList.tsx`
- Modify: `src/components/notes/NewNoteButton.tsx`
- Modify: `src/components/notes/QuickCaptureDrawer.tsx`
- Modify: `src/components/notes/TemplatePicker.tsx`

### Task 7.1: Audit Notes Layout

- [ ] **Step 1:** Read notes layout. Check:
  - Three-column or two-column layout with borders (not shadows)
  - Sidebar list uses consistent card patterns
  - Editor area maximizes writing space

- [ ] **Step 2:** Check TipTap editor styling:
  - Typography: system font, proper sizes
  - Toolbar: docked, not floating
  - No forbidden colors or decorative elements

- [ ] **Step 3:** Fix and commit:
  ```bash
  git add src/components/notes/ src/app/dashboard/notes/
  git commit -m "fix: align notes components to Rams Standard"
  ```

---

## Chunk 8: Analytics

**Goal:** Data presentation must follow Rams chart standards. Minimize non-data ink (Tufte principle).

**Files:**
- Modify: `src/app/dashboard/analytics/page.tsx`
- Modify: `src/components/analytics/AnalyticsSummaryBar.tsx`
- Modify: `src/components/analytics/ReadinessTrajectory.tsx`
- Modify: `src/components/analytics/StaminaCurve.tsx`
- Modify: `src/components/analytics/PacingQuadrant.tsx`
- Modify: `src/components/analytics/PacingInsights.tsx`
- Modify: `src/components/analytics/MemoryHealthMap.tsx`
- Modify: `src/components/analytics/ChartCoachingAnnotation.tsx`

### Task 8.1: Standardize All Recharts Components

- [ ] **Step 1:** For every Recharts component, enforce Rams Section 8.3:
  ```tsx
  // Grid lines:
  <CartesianGrid stroke="#f4f4f5" strokeDasharray="3 3" />

  // Axis text:
  <XAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />

  // Tooltip:
  <Tooltip
    contentStyle={{
      borderRadius: '6px',
      border: '1px solid #d0d7de',
      boxShadow: 'none',
      fontSize: '12px',
    }}
  />

  // Primary color:
  <Line stroke="#2563eb" /> // blue-600
  <Bar fill="#2563eb" />
  <Area stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} />
  ```

- [ ] **Step 2:** Verify consistent subject colors across ALL charts. If subjects use different colors in different charts, standardize.

- [ ] **Step 3:** Remove any chart shadows, gradients, or decorative fills.

- [ ] **Step 4:** Commit:
  ```bash
  git add src/components/analytics/
  git commit -m "fix: standardize all Recharts to Rams chart standards"
  ```

### Task 8.2: Audit Analytics Page Layout

- [ ] **Step 1:** Read analytics page. Check:
  - Cards use `<Card>` component
  - Metrics use `font-mono tabular-nums`
  - Growth framing in all copy
  - No more than 3 non-gray colors per card

- [ ] **Step 2:** Fix and commit:
  ```bash
  git add src/app/dashboard/analytics/
  git commit -m "fix: align analytics page to Rams Standard"
  ```

---

## Chunk 9: 3D Lab

**Goal:** Minimal wrapper alignment. The 3D scene itself operates under R3F performance rules, not the Rams design system. Focus on the chrome around the viewport.

**Files:**
- Modify: `src/app/dashboard/3d-lab/page.tsx`
- Modify: `src/app/dashboard/3d-lab/layout.tsx`
- Audit: `src/components/3d/Workspace.tsx` (chrome only, not scene internals)

### Task 9.1: Audit 3D Lab Chrome

- [ ] **Step 1:** Read 3D Lab page and layout. Check:
  - Page title follows Rams heading style
  - Any toolbar/controls around the viewport use border-based structure
  - Tree navigator (if any) uses standard sidebar patterns
  - No floating elements over the 3D viewport

- [ ] **Step 2:** Verify violation display follows brand voice:
  ```
  ✅ "Exceeds Rule VII §707: Max BHL = 15m"
  ❌ "ERROR: INVALID HEIGHT"
  ```

- [ ] **Step 3:** Fix and commit:
  ```bash
  git add src/app/dashboard/3d-lab/ src/components/3d/
  git commit -m "fix: align 3D Lab chrome to Rams Standard"
  ```

---

## Chunk 10: Settings

**Goal:** Settings page should be clean, form-focused, with proper input styling.

**Files:**
- Modify: `src/app/dashboard/settings/page.tsx`

### Task 10.1: Audit Settings Page

- [ ] **Step 1:** Read settings page. Check:
  - Form inputs use standard `<Input>` component
  - Section grouping uses `<Card>` with `<CardHeader>` + `<CardContent>`
  - Save buttons use primary blue-600
  - Destructive actions (delete account) use red-500 with confirmation dialog
  - Labels use `<Label>` component
  - No arbitrary colors or oversized typography

- [ ] **Step 2:** Fix and commit:
  ```bash
  git add src/app/dashboard/settings/
  git commit -m "fix: align settings page to Rams Standard"
  ```

---

## Chunk 11: Admin Panel

**Goal:** Admin doesn't need to be pretty but must be consistent with the design system. Content management tools should be functional and scannable.

**Files:**
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/components/admin/AdminNav.tsx`
- Modify: `src/components/admin/QuestionEditor.tsx`
- Modify: `src/components/admin/QuestionList.tsx`
- Modify: `src/components/admin/QuestionImporter.tsx`
- Modify: `src/components/admin/WikiEditor.tsx`
- Modify: `src/components/admin/WikiArticleList.tsx`
- Modify: `src/components/admin/TaxonomyEditor.tsx`
- Modify: `src/components/admin/SMEReviewQueue.tsx`
- Modify: `src/components/admin/AuditLogViewer.tsx`
- Modify: `src/components/admin/AssetUploader.tsx`
- Modify: `src/components/admin/AssetList.tsx`

### Task 11.1: Audit Admin Layout & Navigation

- [ ] **Step 1:** Read admin layout. Check:
  - Sidebar uses same structural patterns as main sidebar
  - Navigation items follow same active-state patterns
  - Background: white or gray-50

- [ ] **Step 2:** Fix admin nav styling to match main sidebar patterns.

### Task 11.2: Audit Admin CRUD Components

- [ ] **Step 1:** For each admin component, apply standard checklist:
  - Tables: proper header styling, consistent column spacing
  - Forms: labeled inputs, proper validation styling
  - Buttons: primary (blue-600), destructive (red-500), secondary (gray outline)
  - Cards: `<Card>` component, not raw divs with borders

- [ ] **Step 2:** Fix and commit:
  ```bash
  git add src/app/admin/ src/components/admin/
  git commit -m "fix: align admin panel to Rams Standard"
  ```

---

## Chunk 12: Auth Pages

**Goal:** Auth pages are the first impression after landing. Must be clean, trustworthy, minimal.

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`
- Modify: `src/app/(auth)/forgot-password/page.tsx`
- Modify: `src/app/(auth)/onboarding/page.tsx`
- Modify: `src/components/auth/SignInWithGoogleButton.tsx`

### Task 12.1: Audit Auth Pages

- [ ] **Step 1:** Read each auth page. Check:
  - Centered card layout with `<Card>` component
  - Page heading ≤ `text-xl`
  - Inputs use standard `<Input>` + `<Label>`
  - Primary CTA: `bg-blue-600` button
  - Google OAuth button: clean, no oversized icon
  - No decorative gradients or illustrations
  - Error messages: inline, plain language, with icon (not color-only)
  - Background: white or gray-50

- [ ] **Step 2:** Fix violations.

### Task 12.2: Audit Onboarding Flow

- [ ] **Step 1:** Read onboarding page. Check:
  - Step indicator is clean (dots or numbered, not gamified progress bar)
  - Discipline selection is clear
  - No "streaks" or gamification setup
  - Brand voice: "Let's set up your study path" not "JOIN THE ADVENTURE"

- [ ] **Step 2:** Fix and commit:
  ```bash
  git add src/app/\(auth\)/ src/components/auth/
  git commit -m "fix: align auth pages to Rams Standard"
  ```

---

## Final Verification

After all chunks are complete:

- [ ] **Step 1:** Run `bun run build` — must produce zero errors.

- [ ] **Step 2:** Run the Rams Standard Final Checklist against 3 representative pages (Dashboard, Quiz, Wiki):
  - [ ] No mixed border-radii on the same screen
  - [ ] No >3 non-gray colors visible simultaneously
  - [ ] No inconsistent padding between similar elements
  - [ ] No heading larger than text-xl in UI chrome
  - [ ] No shadow on a flat card
  - [ ] No gradient on a UI element
  - [ ] No decorative icon
  - [ ] No button larger than necessary
  - [ ] No element floating over content
  - [ ] Would this look at home in Linear's dashboard? → Ship it

- [ ] **Step 3:** Final commit:
  ```bash
  git commit --allow-empty -m "chore: UX/UI overhaul complete — Rams Standard compliance verified"
  ```
