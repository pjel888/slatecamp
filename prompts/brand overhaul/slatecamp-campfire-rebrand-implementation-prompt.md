# SlateCamp "Campfire" Rebrand — Complete Implementation Prompt
## Companion to: slatecamp-brand-overhaul-v1.md (MUST READ FIRST)

---

## ROLE

You are simultaneously:

1. **Principal Frontend Architect (React/Next.js)** — You ship production-grade code. You understand Server Components vs. Client Components. You use Tailwind CSS idiomatically. You write surgical, minimal diffs — never rewrite files unnecessarily. You respect existing patterns and extend them, not replace them.

2. **Design Systems Engineer** — You implement design tokens systematically. You know that a rebrand is not "change some colors" — it's a cascading update to every surface, component, typography rule, shadow, radius, transition, and semantic color in the system. You work from tokens outward: define tokens first, then update components that consume them, then verify every page.

3. **Brand Consistency Auditor** — After every phase, you audit the ENTIRE visible UI for drift. You catch the card that still has the old orange. You catch the label that's still 9px monospace. You catch the button that still uses the old shadow. Zero tolerance for inconsistency.

4. **Sound UX Engineer** — You implement Web Audio API synthesized tones for the asymmetric audio feedback system. You understand oscillator nodes, gain envelopes, and frequency selection. No audio files. Zero bundle impact.

5. **Educational Psychologist** — You evaluate every UI string against the new voice principles: 65% warm / 35% authoritative. Growth framing, never deficit framing. "Confident companion" archetype, not "strict mentor."

---

## CRITICAL: READ THE BRAND DOCUMENT FIRST

Before executing ANY phase, you MUST read the attached `slatecamp-brand-overhaul-v1.md` in its entirety. This document contains:
- The complete "Campfire" color palette with hex values
- Typography scale and rules
- Voice & tone principles with before/after examples
- Component personality specifications
- Engagement mechanics validation framework
- Design system tokens (spacing, radius, shadow, transitions)
- Testing interface premium enhancements
- Marketing language guide

**If you have not read that document, STOP and read it now.** Every decision in this prompt references it.

---

## TASK

Implement the complete SlateCamp "Campfire" rebrand across the entire codebase. This is a systematic, token-driven transformation that touches every visual surface, every UI string, and every interactive behavior in the application.

**What "complete" means:**
- Every color in the app uses the new Campfire palette
- Every text element respects the new typography scale (11px minimum)
- Every component follows the new personality specs (cards, buttons, shadows, radii)
- Every student-facing string uses the new voice (warm-first, growth-framed)
- The audio feedback system is built and wired into the testing flow
- The testing interface has image support, micro-interactions, and rich explanations
- No remnant of the old Braun/Rams industrial aesthetic remains

---

## CONTEXT

### Technical Environment
- **Framework:** Next.js (App Router), React, TypeScript strict mode
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Postgres + RLS)
- **State Management:** Verify via audit (likely Zustand)
- **3D:** React Three Fiber (existing infrastructure)
- **Design System:** Currently GitHub Primer × Apple HIG hybrid — transitioning to "Campfire" system

### Tools You MUST Use
- **Supabase MCP** — Check schema for: `image_url` on questions table, `explanation` fields, `code_citation` fields, `model_id` for 3D linking, user preferences/settings table for audio toggle, any consistency/streak tracking tables.
- **File System Tools** — Read ALL of: tailwind.config.ts, globals.css, any theme/token files, every component in the testing feature, dashboard components, layout files, sidebar/navigation, shadcn component overrides. Map the ENTIRE color usage before changing anything.
- **`.claude/docs`, `.cursorrules`, `CLAUDE.md`** — Read project configuration. These may contain design system rules that need updating.

---

## TOKEN CONSERVATION & EXECUTION CONSTRAINTS

1. **No preambles.** Don't explain what you're about to do. Brief transitions only: "Auditing color tokens..." then results.
2. **Surgical edits.** Use targeted find-and-replace. Never rewrite entire files for 5-line changes.
3. **Batch reads.** Read 5-10 files in rapid succession, then analyze. Don't insert paragraphs between each file read.
4. **No prompt repetition.** You have the instructions. Execute.
5. **One-shot writes.** Get components right the first time. No placeholder → refactor cycles.
6. **Tables for analysis.** Use prose only for voice/tone decisions.
7. **Verify after each phase.** Quick grep/search to confirm no old tokens remain.

---

## PHASED EXECUTION PLAN

---

### PHASE 1: Full Codebase & Schema Audit

**Objective:** Map every color, typography value, shadow, radius, and UI string in the codebase before changing anything. Also verify database readiness for new features.

**Step 1.1 — Design Token Audit**
Read these files and extract ALL current design tokens:
- `tailwind.config.ts` (or `.js`) — custom colors, fonts, spacing, shadows
- `src/app/globals.css` (or equivalent) — CSS variables, custom properties
- Any theme provider files
- shadcn `components.json` and any theme configuration
- `CLAUDE.md` or `.cursorrules` — existing design system rules

**Output a token map:**
```
## CURRENT TOKEN MAP
| Token Category | Current Value | New Value (Campfire) | Files Using It |
|---------------|---------------|---------------------|----------------|
| Primary accent | #D4751A (Braun orange) | #3B6B9C (Slate Blue) | [list files] |
| CTA accent | #D4751A | #E8853A (Camp Orange) | [list files] |
| Success green | #3D8B52 | #2D9F6F (Emerald) | [list files] |
| Error red | #C0392B | #D64545 (Warm Red) | [list files] |
| Background | #F5F5F7 | #F8F7F5 (Surface Light) | [list files] |
| Card bg | #FFFFFF | #FFFFFF (unchanged) | [list files] |
| Text primary | #1D1D1F | #1A2332 (Ink Primary) | [list files] |
| Text secondary | #3A3A3C | #4A5568 (Ink Secondary) | [list files] |
| Text muted | #636366 | #8896A7 (Ink Tertiary) | [list files] |
| Border | #D1D1D6 | #D4DAE3 (Border Default) | [list files] |
| Font mono | JetBrains Mono (labels) | Inter only (mono for code only) | [list files] |
| Min font size | 9px | 11px | [list files] |
| ... | ... | ... | ... |
```

**Step 1.2 — Component Inventory**
Read every component directory and catalog:
- All button variants and their colors
- All card components and their styles
- All form inputs and their focus/active states
- Navigation/sidebar components
- Dashboard components
- Testing/quiz components
- Analytics components
- Any modal/dialog components
- Toast/notification components
- The Readiness Score display component

**Step 1.3 — UI String Audit**
Search the codebase for student-facing strings that need voice updates:
- Grep for: "dominate", "conquer", "camp now", "drill", "grind", "gap", "weakness", "deficiency", "behind", "overdue", "streak" (as pressure), "Protocol" (in UI), any strings with exclamation marks in non-celebratory context
- Grep for: "Blindspot Protocol", "Endurance Cycle", "Proof Simulation" — these need renaming in student-facing UI
- List every string that needs rewriting with its file location

**Step 1.4 — Database Schema Check**
Use Supabase MCP to verify:
- Does the `questions` table have `image_url`? `explanation`? `code_citation`? `model_id`?
- Is there a `user_preferences` or `user_settings` table (for audio toggle)?
- Is there streak/consistency tracking?
- What columns need to be added via migration?

**Step 1.5 — Output: Rebrand Scope Document**
Produce the complete audit in this format:

```
## REBRAND SCOPE
| Category | Items to Change | Estimated Edits | Risk |
|----------|---------------|-----------------|------|
| Color tokens | X files | X edits | Low (mechanical) |
| Typography | X files | X edits | Low |
| Component styles | X components | X edits | Medium |
| UI strings | X strings | X edits | Medium (voice) |
| New features (audio) | New file | 1 new file + wiring | Medium |
| New features (images) | Schema + components | 3+ files | High |
| CLAUDE.md update | 1 file | 1 edit | Low |
```

**STOP.** "Phase 1 Complete. Full audit mapped. [X] files need changes. Reply 'Proceed' for Phase 2: Token Foundation."

---

### PHASE 2: Token Foundation (Colors, Typography, Spacing)

**Objective:** Update ALL design tokens in ONE pass. After this phase, the entire app should render with the new Campfire palette.

**Step 2.1 — Update tailwind.config.ts**
Replace the color system with the Campfire palette:

```typescript
// The EXACT hex values from slatecamp-brand-overhaul-v1.md
colors: {
  // Primary
  'slate-blue': {
    DEFAULT: '#3B6B9C',
    50: '#F0F5FA',  // tint for backgrounds
    100: '#D6E4F0',
    600: '#3B6B9C', // primary
    700: '#2F5A85', // hover
    800: '#244A6E', // active
  },
  'camp-orange': {
    DEFAULT: '#E8853A',
    50: '#FEF5ED',  // tint for warm backgrounds
    100: '#FDE6D0',
    600: '#E8853A', // primary
    700: '#D4751A', // hover (the old Braun orange becomes a darker shade)
  },
  'emerald': {
    DEFAULT: '#2D9F6F',
    50: '#EDFAF4',
    100: '#D0F2E2',
    600: '#2D9F6F',
    700: '#248A5E',
  },
  // Semantic
  'warm-red': {
    DEFAULT: '#D64545',
    50: '#FDF0F0',
    600: '#D64545',
  },
  'amber': {
    DEFAULT: '#D4951A',
    50: '#FEF8ED',
    600: '#D4951A',
  },
  // Surfaces
  surface: {
    light: '#F8F7F5',    // warm white page bg
    card: '#FFFFFF',
    focused: '#F5F7FA',   // cool blue-white for testing
  },
  // Ink
  ink: {
    primary: '#1A2332',
    secondary: '#4A5568',
    tertiary: '#8896A7',
  },
  // Borders
  border: {
    DEFAULT: '#D4DAE3',
  },
}
```

**Step 2.2 — Update globals.css**
Replace CSS variables. Update any `:root` declarations with the new values. Ensure dark mode variables are set too (even if not active yet).

**Step 2.3 — Update Typography**
- Set minimum font sizes: grep for any `text-[9px]`, `text-[10px]` and replace with `text-[11px]` minimum
- Replace monospace usage on labels/categories with Inter. Keep monospace ONLY for: code snippets, data values, Readiness Score number
- Ensure the type scale follows the brand document:
  - Display: 32px/bold
  - Title: 24px/bold
  - Heading: 18px/semibold
  - Subheading: 16px/semibold
  - Body: 15px/regular
  - Body Small: 14px/regular
  - Caption: 12px/medium
  - Overline: 11px/semibold uppercase

**Step 2.4 — Update Shadows & Radii**
- Default shadow at rest: `shadow-none` (not shadow-sm)
- Hover shadow: `shadow-sm` only (0 1px 2px rgba(0,0,0,0.05))
- Dropdowns/popovers: `shadow-md`
- Modals: `shadow-lg`
- Border radius: `rounded-md` (8px) for cards, `rounded-sm` (6px) for buttons/inputs
- Remove ALL instances of `rounded-xl`, `rounded-2xl`, `rounded-3xl`

**Step 2.5 — Update Transitions**
- All transitions: max 300ms
- Default: `transition-all duration-150 ease-out`
- Remove any `bounce`, `spring`, or `duration-500+` transitions

**Step 2.6 — Verify**
After all token changes:
- Run the dev server
- Grep for ANY remaining old hex values (#D4751A, #1D1D1F, #F5F5F7, #3D8B52, #C0392B, #636366, #3A3A3C, #8E8E93)
- Grep for remaining `text-[9px]`, `text-[10px]`
- Grep for remaining `font-mono` on non-code elements
- List any stragglers

**STOP.** "Phase 2 Complete. Token foundation updated across [X] files. [Y] stragglers found and fixed. Reply 'Proceed' for Phase 3: Component Update."

---

### PHASE 3: Component Personality Update

**Objective:** Update every component to match the new "Campfire" personality. Cards, buttons, the Readiness Score, navigation, sidebar — everything.

**Step 3.1 — Buttons**
Update ALL button variants:
- Primary: `bg-slate-blue-600 hover:bg-slate-blue-700 text-white rounded-sm`
- Secondary: `bg-transparent border border-border text-ink-primary hover:bg-surface-light rounded-sm`
- Warm CTA: `bg-camp-orange-600 hover:bg-camp-orange-700 text-white rounded-sm` — ONLY for progress/celebration moments
- Danger: `bg-transparent border border-warm-red-600 text-warm-red-600 rounded-sm`

Check shadcn Button component variants and update the theme.

**Step 3.2 — Cards**
Update ALL card components:
- `bg-white border border-border rounded-md shadow-none hover:shadow-sm hover:border-slate-blue-600/30 transition-all duration-150`
- Padding: `p-4` to `p-5` (16-20px)
- Remove any existing heavy shadows

**Step 3.3 — Readiness Score Display**
This is the emotional centerpiece. Update:
- Number size: `text-5xl font-extrabold` (48px, weight 800)
- Color: dynamic based on value:
  - ≥70%: `text-emerald-600`
  - 40-69%: `text-camp-orange-600`
  - <40%: `text-warm-red-600`
- Subtle radial gradient tint behind the score at 5% opacity matching score color
- Context line below: `text-sm text-ink-secondary`

**Step 3.4 — Navigation/Sidebar**
Update navigation to use Slate Blue for active states:
- Active link: `text-slate-blue-600 bg-slate-blue-50`
- Hover: `text-slate-blue-600 bg-slate-blue-50/50`
- Default: `text-ink-secondary`
- Remove any Braun orange from navigation

**Step 3.5 — Taxonomy Heatmap**
Update node colors:
- Mastered: `bg-emerald-600` (was braun-green)
- Developing: `bg-camp-orange-600` (was braun-amber)
- Critical: `bg-warm-red-600` (was braun-red)
- Unexplored: `bg-border` (#D4DAE3, neutral — not ominous)

**Step 3.6 — Progress Bars**
- Track: `bg-slate-blue-50` (very light blue-gray)
- Fill: `bg-slate-blue-600` (general), `bg-emerald-600` (completion), `bg-camp-orange-600` (active/building)
- Height: `h-1.5` with `rounded-full`

**Step 3.7 — Forms & Inputs**
- Focus ring: `focus:ring-2 focus:ring-slate-blue-600/20 focus:border-slate-blue-600`
- Remove any Braun orange focus states

**STOP.** "Phase 3 Complete. All components updated. Reply 'Proceed' for Phase 4: Voice & Copy."

---

### PHASE 4: Voice & Copy Rewrite

**Objective:** Update every student-facing UI string to the new "confident companion" voice.

**Step 4.1 — Terminology Renames (Student-Facing UI Only)**

| Old Term | New Term | Files to Update |
|----------|----------|----------------|
| Blindspot Protocol | Focus Review | [find via grep] |
| Endurance Cycle | Extended Practice | [find via grep] |
| Proof Simulation | Full Exam Simulation | [find via grep] |
| "You're in camp now" | "Welcome to SlateCamp. Everything you need is here." | [find via grep] |
| "dominate" / "dominance" | "confidence" / "readiness" | [find via grep] |
| "conquer" | "master" or "cover" | [find via grep] |
| Any "gap" / "weakness" | "area to revisit" / "developing skill" | [find via grep] |
| Any "behind" / "overdue" | "ready for review" / growth framing | [find via grep] |

**Step 4.2 — Dashboard Copy**
Rewrite dashboard strings using the voice guide from the brand document. Key rewrites:
- Hero greeting: time-of-day aware, uses student's name, warm
- Empty states: welcoming, never accusatory
- CTAs: specific and action-oriented ("Start 10-Question Review" not "Begin Assessment")
- Progress signals: growth-framed ("42 topics covered" not "58 remaining")

**Step 4.3 — Testing Interface Copy**
- Quiz start messages
- Answer feedback messages (practice mode)
- Quiz completion messages
- Session summary copy
- Timer labels

**Step 4.4 — Verify**
Grep for ALL banned words/phrases from the brand document's "Words We Don't Use" table. Ensure none remain in student-facing UI.

**STOP.** "Phase 4 Complete. [X] strings rewritten. Reply 'Proceed' for Phase 5: Audio & Micro-Interactions."

---

### PHASE 5: Audio Feedback System & Micro-Interactions

**Objective:** Build the asymmetric audio feedback system and add premium micro-interactions to the testing interface.

**Step 5.1 — Audio Feedback Module**
Create `lib/audio/feedbackSounds.ts`:

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
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

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
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const ctx = getContext();
  // Two-note sequence: C5 → E5
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

**Step 5.2 — Audio Settings**
Add an audio toggle to user preferences:
- Default: ON for practice mode, OFF for timed/exam mode
- Respects system mute
- Store in user preferences (Supabase) or localStorage

**Step 5.3 — Wire Audio into Testing Flow**
In the answer submission handler (practice mode):
- If correct → call `playCorrectSound()`
- If incorrect → do nothing (silence)
- On quiz completion → call `playCompletionSound()`

**Step 5.4 — Micro-Interactions (CSS-Only)**
Add to the testing interface:

| Interaction | CSS Implementation |
|---|---|
| Option selection | `transition-all duration-150 ease-out` + `scale-[1.01]` on selected + background fill |
| Correct answer reveal | `ring-2 ring-emerald-200 shadow-[0_0_12px_rgba(45,159,111,0.15)]` for 1 pulse (400ms animation) |
| Incorrect reveal | `border-warm-red-300 opacity-80` on wrong, simultaneously highlight correct |
| Next question transition | Left column: `opacity` transition 100ms. Right options: stagger entrance 50ms each |
| Flag toggle | Rotate 15° and back (200ms), color gray→amber |
| Progress bar | `transition-all duration-200 ease-out` on width |
| Submit button | 800ms "Calculating..." state with thin progress animation |

**All animations respect `prefers-reduced-motion: reduce` — disable if set.**

**STOP.** "Phase 5 Complete. Audio system built and wired. Micro-interactions added. Reply 'Proceed' for Phase 6: Schema Migrations & Rich Content."

---

### PHASE 6: Schema Migrations & Rich Content Features

**Objective:** Add database support for images, explanations, and 3D model linking in questions. Build the rendering components.

**Step 6.1 — Schema Migrations (if columns missing)**
Add via Supabase MCP or SQL:
```sql
ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS code_citation TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS model_id TEXT;
```

**Step 6.2 — Image Rendering in Questions**
Build or update the question stem component:
- If `image_url` exists, render image in the left column (split-screen layout)
- Lazy-load with skeleton placeholder
- Lightbox on click (use a simple modal, not a heavy library)
- Gracefully handle: no image, broken image URL, slow load

**Step 6.3 — Rich Explanation Card**
Build the post-answer explanation component (practice mode only):
- Renders after the student answers
- Shows: correct answer, explanation text (markdown), code citation, Wiki link, 3D model link
- Styled: `bg-slate-blue-50 border border-slate-blue-100 rounded-md p-4`
- Slides in with `animate-in` (200ms)

**Step 6.4 — Session Summary Card**
Build the post-quiz summary:
- Score with context ("72% — 4 points above your average")
- Subject breakdown (mini colored bar segments)
- Time analysis
- Weakest area identified with specific recommendation
- "Start Focused Review →" CTA for weak areas
- Staggered reveal animation (score first, then breakdown, then recommendation)

**STOP.** "Phase 6 Complete. Schema updated. Rich content components built. Reply 'Proceed' for Phase 7: CLAUDE.md & Final Audit."

---

### PHASE 7: CLAUDE.md Update & Full Visual Audit

**Objective:** Update all project configuration files to reflect the new brand. Then do a full visual audit.

**Step 7.1 — Update CLAUDE.md**
Replace ALL old design system references with the Campfire system:
- Color palette (all hex values)
- Typography scale and minimums
- Shadow rules
- Radius rules
- Voice guide (add the "Words We Use / Don't Use" table)
- Engagement mechanics policy (the new validation test)

**Step 7.2 — Update .cursorrules (if exists)**
Same updates as CLAUDE.md.

**Step 7.3 — Full Visual Audit**
Systematically check every route/page:
- `/dashboard` — colors, typography, voice, card styles
- `/dashboard/testing` — full testing interface audit
- `/dashboard/analytics` — charts, data visualization colors
- `/dashboard/wiki` — content pages
- `/dashboard/notes` — workspace
- `/dashboard/3d-lab` — 3D interface
- `/dashboard/settings` — preferences, audio toggle
- Any auth pages (login, signup)
- Sidebar/navigation in all states
- Modals/dialogs
- Toast notifications
- Empty states

**For each page, check:**
- [ ] No old hex values (#D4751A, #1D1D1F, #F5F5F7, etc.)
- [ ] No text below 11px
- [ ] No monospace on labels/categories (only on code/data)
- [ ] No rounded-xl or rounded-2xl
- [ ] No shadow at rest (only hover/elevation)
- [ ] All buttons follow new variant system
- [ ] All copy follows new voice guidelines
- [ ] Warm white background (#F8F7F5), not cold white (#F5F5F7)

**Step 7.4 — Fix Any Stragglers**
Address every issue found in the audit.

**STOP.** "Phase 7 Complete. Full rebrand implemented and audited. Zero old-brand remnants remain."

---

## THE "CAMPFIRE" VISUAL CHECKLIST

Run this after EVERY phase. If any item fails, fix it before proceeding.

- [ ] Primary actions are Slate Blue #3B6B9C (not Braun orange)
- [ ] CTAs for celebration/progress moments are Camp Orange #E8853A
- [ ] Success states use Emerald #2D9F6F
- [ ] Page background is warm white #F8F7F5
- [ ] Testing interface uses cool #F5F7FA background
- [ ] Text is #1A2332 (not #1D1D1F or #000)
- [ ] Borders are #D4DAE3
- [ ] No text below 11px anywhere
- [ ] No monospace on labels (only code/data values)
- [ ] Cards have no shadow at rest, shadow-sm on hover
- [ ] All radii are rounded-md (8px) for cards, rounded-sm (6px) for buttons
- [ ] All transitions ≤300ms, ease-out
- [ ] Correct answer plays audio tone (practice mode)
- [ ] Incorrect answer plays SILENCE
- [ ] No student-facing text says "gap", "weakness", "behind", "overdue", "dominate", "conquer"
- [ ] "Blindspot Protocol" → "Focus Review" in student UI
- [ ] "Endurance Cycle" → "Extended Practice" in student UI
- [ ] "Proof Simulation" → "Full Exam Simulation" in student UI
- [ ] Readiness Score color is dynamic (emerald ≥70%, orange 40-69%, red <40%)

---

## REFERENCE: Quick Color Map

Copy-paste reference for rapid implementation:

```
Slate Blue:      #3B6B9C  (primary actions, nav, links)
Camp Orange:     #E8853A  (progress, celebration, warm CTAs)
Emerald:         #2D9F6F  (success, mastery, correct)
Warm Red:        #D64545  (error, critical — always with context)
Amber:           #D4951A  (warning, developing)
Surface Light:   #F8F7F5  (page background)
Surface Card:    #FFFFFF  (cards)
Surface Focused: #F5F7FA  (testing interface)
Ink Primary:     #1A2332  (main text)
Ink Secondary:   #4A5568  (supporting text)
Ink Tertiary:    #8896A7  (muted text)
Border:          #D4DAE3  (borders, dividers)
```

---

## FINAL REMINDERS

1. **TOKEN-DRIVEN, NOT AD-HOC.** Change the tokens FIRST (Phase 2), then everything inherits. Don't hunt-and-peck individual components for color changes.

2. **THE AUDIO SYSTEM IS ZERO-COST.** Web Audio API generates tones at runtime. No audio files to load. No bundle size impact. No CDN dependency. It just works.

3. **WARM WHITE IS THE SINGLE BIGGEST EMOTIONAL SHIFT.** Changing #F5F5F7 → #F8F7F5 sounds trivial. The student won't consciously notice. But their nervous system will register the space as warmer and more inviting. This one change moves the emotional needle more than any component redesign.

4. **THE VOICE CHANGES ARE AS IMPORTANT AS THE VISUAL CHANGES.** A warm color palette with stern copy is incoherent. A strict voice with warm visuals is confusing. Both must evolve together.

5. **EFFICIENCY.** You have limited tokens. Plan precisely. Execute cleanly. Verify after each phase. No wasted words, no wasted code.

---

*Read slatecamp-brand-overhaul-v1.md now. Then execute Phase 1.*
