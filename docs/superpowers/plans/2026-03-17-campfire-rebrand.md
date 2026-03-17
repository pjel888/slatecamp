# SlateCamp "Campfire" Rebrand — Complete Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete visual, tonal, and feature rebrand from the current Rams Standard / Apple HIG aesthetic to the "Campfire" brand identity — warm, inviting, research-backed, commercially viable.

**Branch:** `ux-ui-overhaul` (continue existing branch)

**Governing Documents (READ BEFORE ANY WORK):**
- `prompts/brand overhaul/slatecamp-brand-overhaul-v1.md` — Brand identity, color research, voice guide
- `prompts/brand overhaul/slatecamp-campfire overhaul rebrand-complete-prompt.md` — 7 premium enhancements
- `prompts/brand overhaul/slatecamp-campfire-rebrand-implementation-prompt.md` — Phased execution details
- `CLAUDE.md` — Project constraints (will be updated in Phase 7)

**Tech Stack:** Next.js (App Router), React, Tailwind CSS 4, shadcn/ui, Supabase, Zustand, React Three Fiber, Bun

**CRITICAL RULE: DO NOT BREAK THE APP.** After every phase, run `bun run build` to verify zero errors.

---

## Architecture: Token-Driven Cascade

```
Phase 1 (Audit) ── already done, see "Current State" below
     │
Phase 2 (Tokens) ──→ Phase 3 (Components) ──→ Phase 5 (Audio + Micro-Interactions)
                  │                        ├──→ Phase 6 (Rich Content Features)
                  ├──→ Phase 4 (Voice/Copy) │
                  │                         │
                  └─────────────────────────┴──→ Phase 7 (CLAUDE.md + Final Audit)
```

Phases 3+4 are parallelizable after Phase 2.
Phases 5+6 are parallelizable after Phase 3.

---

## Current State (Phase 1 Audit Results)

### Token Map: Current → Campfire

| Token | Current Value | Campfire Value | CSS Variable |
|-------|--------------|----------------|-------------|
| Primary accent | `#2563eb` (blue-600) | `#3B6B9C` (Slate Blue) | `--primary` |
| Primary hover | `#1d4ed8` (blue-700) | `#2F5A85` (Slate Blue 700) | `--accent-hover` |
| CTA accent | N/A | `#E8853A` (Camp Orange) | NEW `--camp-orange` |
| Success | `#16a34a` / `#34c759` | `#2D9F6F` (Emerald) | `--success`, `--quiz-correct-border` |
| Error | `#ff3b30` / `#dc2626` | `#D64545` (Warm Red) | `--destructive`, `--danger` |
| Warning | `#d97706` / `#f59e0b` | `#D4951A` (Amber) | `--warning` |
| Info | `#0ea5e9` | `#3B82C8` (Info Blue) | `--info` |
| Background | `#ffffff` (`:root --background`) | `#F8F7F5` (Surface Light) | `--background` |
| Card bg | `#ffffff` | `#FFFFFF` (unchanged) | `--card` |
| Testing bg | N/A | `#F5F7FA` (Surface Focused) | NEW `--surface-focused` |
| Text primary | `#1d1d1f` | `#1A2332` (Ink Primary) | `--foreground`, `--text-primary` |
| Text secondary | `#6e6e73` | `#4A5568` (Ink Secondary) | `--text-secondary`, `--muted-foreground` |
| Text tertiary | `#86868b` | `#8896A7` (Ink Tertiary) | `--text-tertiary` |
| Border | `#d0d7de` | `#D4DAE3` (Border Default) | `--border` |
| Muted bg | `#f6f8fa` | `#F8F7F5` (same as background) | `--muted` |
| Secondary bg | `#f5f5f7` | `#F8F7F5` | `--secondary` |
| Ring | `#2563eb` | `#3B6B9C` | `--ring` |
| Sidebar bg | `#fbfbfd` | `#FFFFFF` | `--sidebar` |
| Sidebar active | `#2563eb` | `#3B6B9C` | `--sidebar-primary` |
| Font stack | System fonts (-apple-system...) | `Inter, -apple-system, ...` | `--font-sans` |
| Font mono | SF Mono, JetBrains Mono... | Same (unchanged) | `--font-mono` |
| Card radius | `6px` | `8px` (rounded-md) | `--card-radius` |
| Button radius | `4px` (rounded-sm) | `6px` (rounded-sm per Campfire) | `--radius-sm` |
| Chart primary | `#2563eb` | `#3B6B9C` | `--chart-1` |
| Chart success | `#34c759` | `#2D9F6F` | `--chart-2` |
| Chart accent | `#007aff` | `#E8853A` | `--chart-3` |
| Chart warning | `#ff9f0a` | `#D4951A` | `--chart-4` |
| Chart error | `#ff3b30` | `#D64545` | `--chart-5` |
| Readiness danger | `#dc2626` | `#D64545` | `--readiness-danger` |
| Readiness warning | `#d97706` | `#D4951A` | `--readiness-warning` |
| Readiness good | `#22c55e` | `#2D9F6F` | `--readiness-good` |
| Readiness strong | `#16a34a` | `#2D9F6F` | `--readiness-strong` |
| Quiz correct bg | `#e8f8ed` | `#EDFAF4` (Emerald-50) | `--quiz-correct-bg` |
| Quiz correct border | `#34c759` | `#2D9F6F` | `--quiz-correct-border` |
| Quiz wrong bg | `#ffeae9` | `#FDF0F0` (Warm Red-50) | `--quiz-wrong-bg` |
| Quiz wrong border | `#ff3b30` | `#D64545` | `--quiz-wrong-border` |
| Quiz selected bg | `#e8f0fe` | `#F0F5FA` (Slate Blue-50) | `--quiz-selected-bg` |
| Quiz selected border | `#007aff` | `#3B6B9C` | `--quiz-selected-border` |

### Old Tokens to REMOVE

These "Cerebro" / "Apple HIG" / "SlateCamp brand" tokens in `globals.css @theme inline` should be replaced with Campfire equivalents:

- `--color-snow`, `--color-bone`, `--color-ash`, `--color-slate`, `--color-graphite`, `--color-charcoal`, `--color-ink`
- `--color-signal-amber`, `--color-signal-green`, `--color-signal-red`, `--color-signal-blue`, `--color-result-gold`
- `--color-slatecamp-paper`, `--color-slatecamp-paper-cool`, `--color-slatecamp-paper-snow`
- `--color-slatecamp-ink-main`, `--color-slatecamp-ink-muted`, `--color-slatecamp-ink-subtle`
- `--color-slatecamp-amber`, `--color-slatecamp-sage`
- `--color-slatecamp-border`, `--color-slatecamp-border-strong`, `--color-slatecamp-border-light`

Before removing, grep each to confirm no usage, or replace references with Campfire equivalents.

### Audit Statistics (from agents)

| Metric | Count | Priority |
|--------|-------|----------|
| Total TSX component files | 185+ | — |
| Hardcoded hex colors | 161 distinct | HIGH |
| Tiny text (text-[8-10px]) | 396 instances | CRITICAL |
| font-mono instances | 42 (all justified — telemetry/technical) | LOW |
| rounded-xl+ violations | 39 (modals, 3D containers) | MEDIUM |
| shadow-xl+ violations | 0 | CLEAN |
| Banned word violations | 13 critical | CRITICAL |

### Banned Words Found (Must Fix in Phase 4)

| Term | Count | Files |
|------|-------|-------|
| Blindspot Protocol | 4 | ActionQueues.tsx, DashboardRightColumn.tsx |
| Endurance Cycle | 4 | ActionQueues.tsx, DashboardRightColumn.tsx |
| Proof Simulation | 5 | ActionQueues.tsx, ModeIntroScreen.tsx, DashboardRightColumn.tsx, TestingHub.tsx, dashboard.ts |
| drill/drilling/drills | 18+ | DailyCatalystCard, DashboardRightColumn, ModeIntroScreen, TestingHub, SubjectDrillSelector, moduleRegistry, daily-mission.ts, dashboard.ts |
| grind | 1 | pricing.ts line 29 |
| weakness | 1 | BentoFeatureGrid.tsx line 259 |

### Tiny Text Breakdown (Must Fix in Phase 2)

- `text-[10px]`: 157 instances
- `text-[11px]`: 156 instances (already at minimum — keep)
- `text-[9px]`: 63 instances (bump to 11px)
- `text-[8px]`: 20 instances (bump to 11px)
- Main zones: 3D Lab controls, module gallery, developer tools, analytics charts

### Component Priority Tiers

**CRITICAL (student-facing, immediate visual impact):**
- `src/components/dashboard/` (29 files)
- `src/components/shared/` (22 files)
- `src/components/quiz/` (10 files)
- `src/components/notes/` (13 files)
- `src/components/marketing/` (14 files)

**HIGH (core functionality):**
- `src/components/wiki/` (14 files)
- `src/components/analytics/` (7 files)
- Auth pages (4 files)
- 3D Lab chrome (not scene internals)

**MEDIUM (internal tools):**
- `src/components/admin/` (12 files)

**SKIP:**
- `src/components/dev/` (8 files — internal only)
- Developer pages (7 pages)

### Key Files to Modify

**Token files:** `src/app/globals.css`, `src/app/layout.tsx`

**Layout/shell:** `src/app/dashboard/layout.tsx`, `src/components/shared/Sidebar.tsx`, `src/components/shared/Navbar.tsx`, `src/components/shared/DashboardHeader.tsx`, `src/components/layouts/SharedPageLayout.tsx`

**UI primitives (shadcn):** All files in `src/components/ui/` — card.tsx, button.tsx, dialog.tsx, badge.tsx, input.tsx, etc.

**Dashboard:** `src/app/dashboard/page.tsx`, all files in `src/components/dashboard/`

**Quiz/Testing:** All files in `src/components/quiz/`, `src/components/dashboard/QuizRenderer.tsx`, `QuizStart.tsx`, `ResultsSummary.tsx`, `CustomSessionBuilder.tsx`

**Analytics:** All files in `src/components/analytics/`

**Wiki:** All files in `src/components/wiki/`, `src/app/dashboard/wiki/`

**Notes:** All files in `src/components/notes/`, `src/app/dashboard/notes/`

**3D Lab:** `src/app/dashboard/3d-lab/` (chrome only, not scene internals)

**Auth:** `src/app/(auth)/` pages

**New files to create:** `src/lib/audio/feedbackSounds.ts`

---

## Phase 2: Token Foundation

**Goal:** Update ALL design tokens in ONE pass. After this, the app renders in Campfire colors.

### Task 2.1: Update globals.css — :root block

- [ ] **Step 1:** Replace `:root` CSS variables with Campfire values:

```css
:root {
  --background: #F8F7F5;       /* Surface Light (warm white) */
  --foreground: #1A2332;        /* Ink Primary */
  --card: #ffffff;              /* Surface Card (unchanged) */
  --card-foreground: #1A2332;
  --popover: #ffffff;
  --popover-foreground: #1A2332;
  --primary: #3B6B9C;           /* Slate Blue */
  --primary-foreground: #ffffff;
  --secondary: #F8F7F5;         /* Surface Light */
  --secondary-foreground: #1A2332;
  --muted: #F8F7F5;             /* Surface Light */
  --muted-foreground: #8896A7;  /* Ink Tertiary */
  --accent: #F8F7F5;
  --accent-foreground: #1A2332;
  --destructive: #D64545;       /* Warm Red */
  --border: #D4DAE3;            /* Border Default */
  --input: #D4DAE3;
  --ring: #3B6B9C;              /* Slate Blue */
  --radius: 0.5rem;             /* 8px — card radius */

  --chart-1: #3B6B9C;           /* Slate Blue */
  --chart-2: #2D9F6F;           /* Emerald */
  --chart-3: #E8853A;           /* Camp Orange */
  --chart-4: #D4951A;           /* Amber */
  --chart-5: #D64545;           /* Warm Red */

  --sidebar: #ffffff;
  --sidebar-foreground: #1A2332;
  --sidebar-primary: #3B6B9C;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #F0F5FA;    /* Slate Blue 50 */
  --sidebar-accent-foreground: #1A2332;
  --sidebar-border: #D4DAE3;
  --sidebar-ring: #3B6B9C;

  /* Campfire — Neutral palette */
  --bg-primary: #F8F7F5;
  --bg-secondary: #F8F7F5;
  --bg-tertiary: #F0F5FA;
  --border-strong: #D4DAE3;
  --border-light: #D4DAE3;

  /* Campfire — Text hierarchy */
  --text-primary: #1A2332;
  --text-secondary: #4A5568;
  --text-tertiary: #8896A7;
  --text-quaternary: #8896A7;

  /* Campfire — Functional accents */
  --accent-blue: #3B6B9C;
  --accent-hover: #2F5A85;
  --success: #2D9F6F;
  --danger: #D64545;
  --warning: #D4951A;
  --info: #3B82C8;

  /* Campfire — NEW tokens */
  --camp-orange: #E8853A;
  --camp-orange-hover: #D4751A;
  --emerald: #2D9F6F;
  --emerald-50: #EDFAF4;
  --slate-blue-50: #F0F5FA;
  --surface-focused: #F5F7FA;    /* Testing interface bg */
  --border-warm: rgba(232, 133, 58, 0.15);

  /* Campfire — Card surfaces */
  --card-bg: #ffffff;
  --card-border-color: #D4DAE3;
  --card-shadow: none;
  --card-shadow-hover: 0 1px 2px rgba(0, 0, 0, 0.05);
  --card-radius: 8px;            /* rounded-md for cards */

  /* Campfire — Quiz states */
  --quiz-correct-bg: #EDFAF4;
  --quiz-correct-border: #2D9F6F;
  --quiz-wrong-bg: #FDF0F0;
  --quiz-wrong-border: #D64545;
  --quiz-selected-bg: #F0F5FA;
  --quiz-selected-border: #3B6B9C;

  /* Campfire — Transitions (max 300ms) */
  --transition-fast: 100ms ease-out;
  --transition-normal: 150ms ease-out;
  --transition-slow: 200ms ease-out;

  /* Campfire — Readiness Score */
  --readiness-danger: #D64545;
  --readiness-warning: #D4951A;
  --readiness-good: #2D9F6F;
  --readiness-strong: #2D9F6F;

  /* Confidence tap */
  --confidence-know: #EDFAF4;
  --confidence-unsure: #FEF8ED;
}
```

- [ ] **Step 2:** Update `.dark` block with Campfire dark mode values (future, but set correctly now):

```css
.dark {
  --background: #141B24;
  --foreground: #E8ECF1;
  --card: #1C2433;
  --card-foreground: #E8ECF1;
  --primary: #5B8BB8;  /* Slate Blue lightened */
  --primary-foreground: #ffffff;
  --destructive: #E85C5C;
  --border: #2A3444;
  --ring: #5B8BB8;
  /* ... update all dark tokens similarly */
}
```

- [ ] **Step 3:** Update `@theme inline` block — replace old Cerebro/Apple tokens with Campfire:

```css
@theme inline {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace;

  --radius-sm: 0.375rem;  /* 6px — buttons/inputs */
  --radius-md: 0.5rem;    /* 8px — cards */
  --radius-lg: 0.75rem;   /* 12px — modals */
  --radius-xl: 0.75rem;   /* cap at 12px — no larger */

  /* Campfire semantic tokens for Tailwind */
  --color-camp-orange: var(--camp-orange);
  --color-emerald: var(--emerald);
  --color-slate-blue-50: var(--slate-blue-50);
  --color-emerald-50: var(--emerald-50);
  --color-surface-focused: var(--surface-focused);
  --color-border-warm: var(--border-warm);

  /* REMOVE all old --color-snow, --color-bone, --color-ash, etc. */
  /* REMOVE all old --color-slatecamp-* tokens */
  /* REMOVE all old --color-signal-* tokens */
}
```

- [ ] **Step 4:** Remove the `--transition-slow: 500ms` — max is 300ms per Campfire. Already done above.

- [ ] **Step 5:** Update `pulse-glow` animation to use Emerald instead of signal-green:
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 #2D9F6F; }
  50% { box-shadow: 0 0 16px 4px color-mix(in srgb, #2D9F6F 25%, transparent); }
}
```

- [ ] **Step 6:** Update scrollbar colors from blue to Slate Blue tints.

### Task 2.2: Update layout.tsx — Add Inter font

- [ ] **Step 1:** In `src/app/layout.tsx`, add Inter font import:
```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
```

- [ ] **Step 2:** Add font variable to body:
```tsx
<body className={`${inter.variable} font-sans antialiased`}>
```

- [ ] **Step 3:** Update viewport themeColor to warm white:
```tsx
{ media: '(prefers-color-scheme: light)', color: '#F8F7F5' },
```

### Task 2.3: Update dashboard layout background

- [ ] In `src/app/dashboard/layout.tsx`, line 88:
```tsx
// FROM:
<div className='flex h-screen bg-muted text-gray-900 font-sans selection:bg-gray-200'>
// TO:
<div className='flex h-screen bg-[#F8F7F5] text-[#1A2332] font-sans selection:bg-[#3B6B9C]/10'>
```
(Or rely on the `bg-muted` token which now resolves to `#F8F7F5`)

### Task 2.4: Search and replace hardcoded old hex values

- [ ] Grep for and replace all instances:
  - `#2563eb` → `#3B6B9C` (or use `primary` / `slate-blue-600` token)
  - `#1d4ed8` → `#2F5A85`
  - `#1d1d1f` → `#1A2332` (or use `foreground` token)
  - `#f5f5f7` → `#F8F7F5` (or use `muted`/`secondary` token)
  - `#34c759` → `#2D9F6F` (or use `success` token)
  - `#ff3b30` → `#D64545` (or use `destructive` token)
  - `#dc2626` → `#D64545`
  - `#d97706` → `#D4951A`
  - `#007aff` → `#3B6B9C`
  - `#6e6e73` → `#4A5568`
  - `#86868b` → `#8896A7`
  - `bg-blue-600` → `bg-[#3B6B9C]` or `bg-primary`
  - `text-blue-600` → `text-[#3B6B9C]` or `text-primary`
  - `bg-blue-50` → `bg-[#F0F5FA]` or `bg-slate-blue-50`

**IMPORTANT:** Do NOT blindly replace. Check context — some may be in 3D Lab scene code or chart data that needs different handling.

### Task 2.5: Fix typography minimums

- [ ] Grep for `text-[9px]`, `text-[10px]`, `text-[8px]` across all `src/` — replace with minimum `text-[11px]` or `text-xs` (12px).
- [ ] Grep for `font-mono` — remove from labels, categories, metadata. Keep ONLY on code snippets, data values, and Readiness Score number.

### Task 2.6: Fix radii

- [ ] Cards: ensure `rounded-md` (8px). Update card.tsx if needed.
- [ ] Buttons/inputs: ensure `rounded-sm` (6px).
- [ ] Grep for `rounded-xl`, `rounded-2xl`, `rounded-3xl` — replace with `rounded-md` or `rounded-lg` max.

### Task 2.7: Fix shadows

- [ ] Default card shadow: `shadow-none` at rest. `shadow-sm` on hover.
- [ ] Remove any `shadow-xl` or `shadow-2xl` on non-modal elements.
- [ ] Modals: `shadow-lg`. Dropdowns: `shadow-md`.

### Task 2.8: Fix transitions

- [ ] Grep for `duration-500`, `duration-700`, `duration-1000` — cap at `duration-300`.
- [ ] Remove any `bounce`, `spring` easing.
- [ ] Default: `duration-150 ease-out`.

### Task 2.9: Verify

- [ ] `bun run build` — zero errors.
- [ ] Grep for old hex values — zero remaining in component files.

---

## Phase 3: Component Personality Update

### Task 3.1: Update Button variants (button.tsx)

- [ ] Primary: `bg-primary hover:brightness-90 text-white rounded-sm` (resolves to Slate Blue)
- [ ] Secondary: `bg-transparent border border-border text-foreground hover:bg-muted rounded-sm`
- [ ] Warm CTA (NEW variant): `bg-[#E8853A] hover:brightness-90 text-white rounded-sm` — celebration/progress ONLY
- [ ] Danger: `bg-transparent border border-destructive text-destructive rounded-sm`

### Task 3.2: Update Card component (card.tsx)

- [ ] `bg-white border border-border rounded-md shadow-none hover:shadow-sm hover:border-primary/30 transition-all duration-150`

### Task 3.3: Update Readiness Score Display

- [ ] Number: `text-5xl font-extrabold` (48px, weight 800)
- [ ] Color: dynamic — `text-[#2D9F6F]` (≥70%), `text-[#E8853A]` (40-69%), `text-[#D64545]` (<40%)
- [ ] Subtle radial gradient tint at 5% opacity matching score color

### Task 3.4: Update Sidebar navigation

- [ ] Active: `text-primary bg-[#F0F5FA]` (Slate Blue + Slate Blue-50)
- [ ] Hover: `text-primary bg-[#F0F5FA]/50`
- [ ] Default: `text-[#4A5568]`

### Task 3.5: Update Taxonomy Heatmap node colors

- [ ] Mastered: `#2D9F6F` (Emerald)
- [ ] Developing: `#E8853A` (Camp Orange)
- [ ] Critical: `#D64545` (Warm Red)
- [ ] Unexplored: `#D4DAE3` (Border Default — neutral)

### Task 3.6: Update Progress Bars

- [ ] Track: `bg-[#F0F5FA]`
- [ ] Fill: `bg-primary` (general), `bg-[#2D9F6F]` (completion), `bg-[#E8853A]` (active)
- [ ] Height: `h-1.5 rounded-full`

### Task 3.7: Update Forms & Inputs

- [ ] Focus: `ring-2 ring-primary/20 border-primary`

### Task 3.8: Update ALL Recharts components

- [ ] Grid: `stroke="#D4DAE3"`
- [ ] Axis: `fill: '#4A5568', fontSize: 11`
- [ ] Tooltip: `borderRadius: '8px', border: '1px solid #D4DAE3'`
- [ ] Primary data color: `#3B6B9C`

### Task 3.9: Verify

- [ ] `bun run build` — zero errors.

---

## Phase 4: Voice & Copy Rewrite

### Task 4.1: Terminology renames (grep + replace)

- [ ] "Blindspot Protocol" → "Focus Review" (student-facing UI only)
- [ ] "Endurance Cycle" → "Extended Practice"
- [ ] "Proof Simulation" → "Full Exam Simulation"
- [ ] "dominate" / "dominance" → "confidence" / "readiness"
- [ ] "conquer" → "master" or "cover"
- [ ] "gap" / "weakness" → "area to revisit" / "developing skill"
- [ ] "behind" / "overdue" → "ready for review"
- [ ] "drill" / "grind" → "practice" / "review"

### Task 4.2: Dashboard copy rewrite

- [ ] Hero greeting: warm, time-of-day aware
- [ ] Empty states: welcoming, never accusatory
- [ ] CTAs: specific ("Start 10-Question Review" not "Begin Assessment")
- [ ] Progress: growth-framed ("42 topics covered" not "58 remaining")

### Task 4.3: Testing interface copy

- [ ] Quiz start messages, answer feedback, completion messages, session summary

### Task 4.4: Verify — grep for ALL banned words. Zero remaining.

---

## Phase 5: Audio Feedback System & Micro-Interactions

### Task 5.1: Create `src/lib/audio/feedbackSounds.ts`

```typescript
// Web Audio API — zero bundle size, synthesized at runtime
let audioContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function playCorrectSound(): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

export function playCompletionSound(): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = getContext();
  [523.25, 659.25].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
    osc.start(ctx.currentTime + i * 0.15);
    osc.stop(ctx.currentTime + i * 0.15 + 0.3);
  });
}
// NO playIncorrectSound — silence IS the feedback
```

### Task 5.2: Wire audio into testing flow

- [ ] In answer submission handler (practice mode): correct → `playCorrectSound()`, incorrect → silence
- [ ] Quiz completion → `playCompletionSound()`
- [ ] Default ON for practice, OFF for timed/exam
- [ ] Respect `prefers-reduced-motion`

### Task 5.3: CSS Micro-interactions

- [ ] Option selection: `transition-all duration-150 ease-out` + `scale-[1.01]`
- [ ] Correct reveal: `ring-2 ring-[#2D9F6F]/30 shadow-[0_0_12px_rgba(45,159,111,0.15)]`
- [ ] Incorrect reveal: `border-[#D64545]/50 opacity-80` + highlight correct
- [ ] Progress bar: `transition-all duration-200 ease-out`
- [ ] All respect `prefers-reduced-motion: reduce`

---

## Phase 6: Schema Migrations & Rich Content

### Task 6.1: Check schema via Supabase MCP

- [ ] Verify questions table has: `image_url`, `explanation`, `code_citation`, `model_id`
- [ ] If missing, create migration:
```sql
ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS code_citation TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS model_id TEXT;
```

### Task 6.2: Image rendering in questions

- [ ] If `image_url` exists, render in question stem area
- [ ] Lazy-load with skeleton placeholder
- [ ] Lightbox on click
- [ ] Graceful no-image handling

### Task 6.3: Rich explanation card (practice mode)

- [ ] After answering: slide-in card with correct answer, WHY, code citation, Wiki/3D links
- [ ] Style: `bg-[#F0F5FA] border border-[#3B6B9C]/20 rounded-md p-4`

### Task 6.4: Session summary card

- [ ] Score with context ("72% — 4 points above your average")
- [ ] Subject breakdown with Campfire colors
- [ ] Time analysis
- [ ] Weakest area + recommendation
- [ ] "Start Focused Review →" warm CTA

---

## Phase 7: CLAUDE.md Update & Final Audit

### Task 7.1: Update CLAUDE.md

- [ ] Replace color palette section with Campfire hex values
- [ ] Update typography scale (11px minimum, Inter)
- [ ] Add shadow rules (none at rest, sm hover, md dropdown, lg modal)
- [ ] Add radius rules (md cards, sm buttons, FORBIDDEN: xl+)
- [ ] Add voice guide ("Words We Use / Don't Use" table)
- [ ] Update engagement policy (three-part test)
- [ ] Add transition rules (max 300ms, ease-out)

### Task 7.2: Full visual audit — check every route

For each page check:
- [ ] No old hex values (#2563eb, #1d1d1f, #f5f5f7, #34c759, #ff3b30, #007aff)
- [ ] No text below 11px
- [ ] No monospace on labels
- [ ] No rounded-xl+
- [ ] No shadow at rest
- [ ] All buttons follow Campfire variants
- [ ] All copy follows "confident companion" voice
- [ ] Background is warm white #F8F7F5
- [ ] Testing uses cool #F5F7FA

### Task 7.3: Build verify

- [ ] `bun run build` — zero errors
- [ ] Manual spot-check: dashboard, quiz, analytics

---

## Campfire Visual Checklist (Run After EVERY Phase)

- [ ] Primary actions: Slate Blue `#3B6B9C`
- [ ] Warm CTAs (celebration only): Camp Orange `#E8853A`
- [ ] Success: Emerald `#2D9F6F`
- [ ] Page bg: `#F8F7F5` (warm white)
- [ ] Testing bg: `#F5F7FA` (cool focus)
- [ ] Text: `#1A2332` (not `#000` or `#1D1D1F`)
- [ ] Borders: `#D4DAE3`
- [ ] No text below 11px
- [ ] No monospace on labels
- [ ] Cards: shadow-none rest, shadow-sm hover
- [ ] Radii: rounded-md (8px) cards, rounded-sm (6px) buttons
- [ ] Transitions ≤300ms, ease-out
- [ ] No banned words in student UI
- [ ] "Blindspot Protocol" → "Focus Review"
- [ ] "Endurance Cycle" → "Extended Practice"
- [ ] "Proof Simulation" → "Full Exam Simulation"
- [ ] Readiness Score color dynamic (emerald/orange/red by value)

---

## Quick Color Reference

```
Slate Blue:      #3B6B9C  (primary actions, nav, links)
Slate Blue 50:   #F0F5FA  (active backgrounds, tints)
Slate Blue 700:  #2F5A85  (hover)
Camp Orange:     #E8853A  (progress, celebration, warm CTAs)
Camp Orange 50:  #FEF5ED  (warm tints)
Emerald:         #2D9F6F  (success, mastery, correct)
Emerald 50:      #EDFAF4  (success backgrounds)
Warm Red:        #D64545  (error, critical — always with context)
Warm Red 50:     #FDF0F0  (error backgrounds)
Amber:           #D4951A  (warning, developing)
Amber 50:        #FEF8ED  (warning backgrounds)
Info Blue:       #3B82C8  (informational callouts)
Surface Light:   #F8F7F5  (page background)
Surface Card:    #FFFFFF  (cards)
Surface Focused: #F5F7FA  (testing interface)
Ink Primary:     #1A2332  (main text)
Ink Secondary:   #4A5568  (supporting text)
Ink Tertiary:    #8896A7  (muted text)
Border Default:  #D4DAE3  (borders, dividers)
Border Warm:     rgba(232, 133, 58, 0.15)  (highlighted cards)
```
