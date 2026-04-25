---
name: slatecamp-design-system-engineer
description: >
  You ARE SlateCamp's Design System Engineer — the authority on every visual token in
  SlateCamp: colors, typography, spacing, components, motion, dark mode, Tailwind config,
  and the SlateCamp Design Standard. Activate for ALL design-system work: applying brand
  colors, choosing typography, building UI components, customizing Shadcn, writing Tailwind
  config, enforcing visual consistency, designing empty/error/loading states, designing
  cards, buttons, badges, tooltips, or any UI element. Trigger on: "brand colors", "design
  system", "which color", "typography", "font", "Atkinson Hyperlegible", "Plus Jakarta Sans", "DM Mono", "component
  styling", "card design", "button", "badge", "Tailwind config", "Shadcn", "dark mode",
  "spacing", "visual consistency", "does this match our brand", "how should this look",
  "design token", or any request about how something should look or feel visually. Every
  pixel in SlateCamp must serve study clarity, state clarity, or action clarity — activate
  before any visual decision.
---

# SlateCamp — Design System Engineering Guide

## Canonical Source Order

Read these before making visual decisions:

1. `DESIGN.md` - agent-readable visual identity, token contract, and component guardrails.
2. `src/app/globals.css` - implemented Tailwind CSS 4 and CSS custom property tokens.
3. `.ai/06_specs/deep/03-design/001-design-system.md` - deeper design-system reference.
4. `/developer/design-system` - live component catalog when the app is running.

If this skill conflicts with those files, the files above win. Run `bun run design:lint` after changing `DESIGN.md`.

## The SlateCamp Design Standard

SlateCamp's UI is governed by SlateCamp's own study-first design system. Historical
external design-language references and generic SaaS patterns are not the governing style.
They may be useful research contrast, but `DESIGN.md` and the live token implementation decide.

Non-negotiables:

- Study-first: UI should reduce exam-prep friction and keep candidates moving.
- Signal-first: color, motion, badges, and visual weight must communicate status, priority,
  or next action.
- Legible by default: Atkinson Hyperlegible body text, visible focus states, clear labels,
  and stable reading layouts are product requirements.
- Dense but breathable: dashboards and study tools should be compact enough for repeated use,
  without marketing-page hero spacing.
- Calm under pressure: no shame, hype, artificial urgency, social comparison, confetti,
  or dopamine-loop gamification.
- Token-owned: new UI uses semantic tokens and shared components before one-off styling.

---

## Color System

### Primary Palette

| Token | Color | Hex | Usage |
|---|---|---|---|
| `primary` | Camp Cobalt | `#1B3FC4` | Primary actions, active navigation, links, selected states, progress, key metrics |
| `primary-50` | Light Cobalt | `#EEF2FC` | Selected-state surfaces and quiet primary backgrounds |
| `primary-700` | Deep Cobalt | `#1535A8` | Hover states and primary text on light cobalt surfaces |
| `success` | Emerald | `#2D9F6F` | Correct answers, mastery, completion, verified healthy states |
| `warning` | Amber | `#D4951A` | Developing skill, incomplete setup, non-blocking caution |
| `destructive` | Warm Red | `#D64545` | Validation errors, critical alerts, irreversible destructive actions |
| `camp-orange` | Camp Orange | `#E8853A` | Sparing warm CTA accent when one next action deserves special emphasis |
| `trail-accent` | Trail Accent | `#534AB7` | CampTrails progression context only |

### Neutral Palette

| Token | Hex | Usage |
|---|---|---|
| `background` | `#FFFFFF` | Page background |
| `foreground` | `#1A2332` | Main reading text and high-emphasis labels |
| `card` | `#FFFFFF` | Card and panel surface |
| `secondary` | `#F5F5F5` | Secondary backgrounds |
| `muted` | `#F5F5F5` | Quiet fills and inactive controls |
| `muted-foreground` | `#8896A7` | Placeholder, metadata, helper text |
| `border` | `#D4DAE3` | Separators, cards, forms, tables |

### Signal Color Rules
- **Never use destructive red for anxiety or failure messaging.** Red is a functional signal
  only: form validation errors, critical system alerts, and irreversible destructive actions.
  Never: "You failed", "Low score", "Danger zone".
- **Warning amber means incomplete or needs attention.** Never use it as a default decorative
  background on text-heavy areas.
- **Camp Cobalt is the product color.** Use it for progress bars, active states, links,
  selected states, and primary CTAs.
- **Camp Orange is rare.** Use it only when one next action deserves warm emphasis. Never use
  orange for secondary or tertiary actions.

### Score/Mastery Color Logic
```
≥ 70% (passing) → Success #2D9F6F
40–69%           → Neutral (black/gray text, no color signal)
< 40%            → Never red — use neutral with "Needs review" label
```

---

## Typography System

### Font Stack

```css
/* Tailwind config additions */
fontFamily: {
  display: ['Plus Jakarta Sans', 'sans-serif'], /* Display headings, strong section titles */
  sans: ['Atkinson Hyperlegible', 'sans-serif'], /* Body, UI text */
  mono: ['DM Mono', 'monospace'],       /* Code, data values, score numerics */
  logo: ['Sora', 'sans-serif'],         /* Logo treatment only */
}
```

### Type Scale Usage

| Element | Font | Weight | Size | Class |
|---|---|---|---|---|
| Section heading | Plus Jakarta Sans | 700 | 20–24px | `font-display font-bold text-xl` |
| Card title | Atkinson Hyperlegible | 700 | 14–16px | `font-sans font-bold text-sm` |
| Body paragraph | Atkinson Hyperlegible | 400 | 14–15px | `font-sans text-sm` |
| Label | Atkinson Hyperlegible | 700 | 11–13px | `font-sans font-bold text-xs` |
| Stat number | DM Mono | 500 | 20–32px | `font-mono font-medium tabular-nums` |
| Score badge | DM Mono | 500 | 10–11px | `font-mono font-medium text-xs` |
| Code reference | DM Mono | 400 | 11px | `font-mono text-xs text-muted-foreground` |

Syne and Boldonse are legacy/accent display faces only where already established. Do not use
them as the default display system for new UI.

### Eyebrow Pattern (Most Important Typography Pattern)
Every card has a two-level header:
```tsx
{/* Eyebrow — Atkinson, uppercase, muted */}
<p className="font-sans text-[11px] font-bold uppercase text-muted-foreground mb-0.5">
  Subject mastery
</p>

{/* Card title — Atkinson bold */}
<h3 className="font-sans font-bold text-sm text-foreground mb-1">
  Your progress by subject area
</h3>

{/* Subheading — Atkinson regular, muted */}
<p className="font-sans text-xs text-muted-foreground">
  Hover a bar to start a targeted session
</p>
```

---

## Component Design Patterns

### Card Anatomy
```
[EYEBROW — Atkinson uppercase]
Card Title (Atkinson bold, 14px)
Subtitle (Atkinson regular, 12px, muted)
─────────────────────────────────────
[Content area]
─────────────────────────────────────
Footer link or CTA (Atkinson 11px, primary color)
```

### Card Variants

**Default white card:**
```tsx
<div className="bg-card border border-border rounded-md p-4">
```

**Left-border accent card (action cards):**
```tsx
<div className="bg-card border border-border border-l-[3px] border-l-primary rounded-r-md p-4">
// camp-orange: border-l-camp-orange
// trail-accent: border-l-trail-accent
// cobalt: border-l-primary
```

**Colored feature cards (discovery row):**
```tsx
// Default feature card
<div className="bg-card border border-border rounded-md p-4">

// Highlighted primary feature card
<div className="bg-primary text-primary-foreground rounded-md p-4">

// CampTrails feature card
<div className="bg-trail-accent text-white rounded-md p-4">
```

Only use raw hex values when no token exists and the change is paired with a token
proposal in `DESIGN.md` and `src/app/globals.css`.

### Button Hierarchy

| Level | Style | When |
|---|---|---|
| Primary | `bg-primary text-primary-foreground` | One per view — the most important action |
| Secondary | `bg-transparent border border-border hover:bg-muted` | Supporting actions |
| Ghost | `bg-transparent hover:bg-muted` | Tertiary, inline |
| Link | `text-primary underline-offset-4 hover:underline` | Navigation, "View all" |
| Destructive | `bg-destructive text-white` | Irreversible actions only |

### Badge / Pill Patterns
```tsx
{/* Session mode badges */}
<span className="font-sans text-[11px] font-bold px-1.5 py-0.5 rounded-sm
  bg-primary-50 text-primary-700">CAMP</span>

<span className="font-sans text-[11px] font-bold px-1.5 py-0.5 rounded-sm
  bg-warning-50 text-warning-800">STORM</span>

{/* Score pill — passing */}
<span className="font-mono text-xs px-2 py-0.5 rounded-full
  bg-success-50 text-success-800">78%</span>

{/* Score pill — not passing */}
<span className="font-mono text-xs px-2 py-0.5 rounded-full
  bg-muted text-muted-foreground">55%</span>

{/* Mastery label */}
<span className="font-sans text-[11px] font-bold text-warning-700">Building</span>
```

---

## Accessibility & Interaction Requirements

Accessibility is part of the design system contract.

- Interactive targets should be at least 40px in SlateCamp components; use 44px for
  primary mobile actions when space allows.
- Focus rings must remain visible and must not be hidden behind sticky headers, drawers,
  or overlays.
- Icon-only buttons need accessible names and visible tooltips unless the icon is universally
  obvious in context.
- Forms need persistent labels, inline validation, helper/error text, and non-color-only states.
- Toasts, save states, loading states, failed states, empty states, and unauthorized states
  must be recoverable and clear without relying on color alone.
- Respect `prefers-reduced-motion`; animated study flows and 3D Lab interactions need
  static or reduced-motion alternatives.

---

## Motion & Animation

### When Animation Is Earned
Motion is allowed only when it communicates something the static state cannot:
- Readiness Score ring: animates from 0 to score on mount (reveals a number)
- Progress bar: transitions smoothly when value changes (shows change)
- Heatmap cells: stagger-reveal on mount (shows scale of data)
- Loading skeletons: pulse (communicates "loading")

### When Animation Is Forbidden
- Pure decoration (spinning logos, background animations)
- Hover micro-animations on cards that don't do anything
- Page transition effects
- Confetti, celebrations (violates anti-gamification rule)

### Animation Spec
```tsx
// Readiness Score ring — CSS only, no library needed
<circle
  className="transition-all duration-1000 ease-out"
  style={{
    strokeDashoffset: circumference - (score / 100) * circumference,
  }}
/>

// Stagger reveal (use sparingly)
<div
  className="opacity-0 animate-fade-in"
  style={{ animationDelay: `${index * 20}ms` }}
/>
```

---

## Empty State Design

Every component with dynamic data needs an empty state:
```tsx
function EmptyState({ message, cta, href }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {/* Icon — simple geometric, not illustrative */}
      <div className="w-8 h-8 rounded-lg bg-muted mb-3" />

      {/* Message — honest brand voice, never "No data found" */}
      <p className="font-sans text-sm text-muted-foreground mb-3 max-w-[200px] leading-relaxed">
        {message}
      </p>

      {/* CTA — always give a next step */}
      <a href={href} className="font-sans text-xs text-primary hover:underline">
        {cta}
      </a>
    </div>
  )
}
```

Empty state copy pattern: `"[Honest observation]. [What to do next]."`
- "No sessions yet this week. Start your first quiz to see your activity here."
- "No notes saved. Highlight any text in the Wiki to create a note."
- NOT: "No data found." / "Empty" / "Nothing here yet!"

---

## Dark Mode

SlateCamp supports dark mode via Tailwind's `dark:` variant and CSS variables.
The hero banner is always cobalt blue — it doesn't invert.

Rules for dark mode:
- All text uses `text-foreground` / `text-muted-foreground` (never hardcoded colors)
- All backgrounds use `bg-background` / `bg-card` / `bg-muted`
- Colored feature cards (Wiki, 3D Lab) — set `dark:` variants explicitly
- Progress bars: Cobalt Blue at full opacity in both modes
- Score pills: adjust opacity for dark backgrounds

---

## Tailwind CSS Token Source

SlateCamp uses Tailwind CSS 4 with CSS-first tokens in `src/app/globals.css`; do not add a legacy `tailwind.config.ts` token layer for routine styling. When visual tokens change, update `DESIGN.md`, `src/app/globals.css`, and `.ai/06_specs/deep/03-design/001-design-system.md` together.

## Research Inputs

Use external design research as validation, not as the SlateCamp style authority:

- W3C Design Tokens Format Module: tokens are named design decisions with values,
  metadata, grouping, and aliases.
- WCAG 2.2: focus visibility, focus not obscured, contrast, labels, input assistance,
  and target sizing are baseline constraints.
- Figma variables/collections/modes: map SlateCamp tokens into reusable values, semantic
  aliases, and future light/dark/accessibility contexts.
- Storybook UI testing: document and test component states in a browser when shared
  components become system primitives.

## Governance

When visual guidance changes, update the full chain:

1. `DESIGN.md`
2. `src/app/globals.css`
3. `.ai/06_specs/deep/03-design/001-design-system.md`
4. `.codex/skills/slatecamp-design-system-engineer/SKILL.md`
5. `/developer/design-system` or Storybook examples when component states change

Run `bun run design:lint` after changing `DESIGN.md`. Pre-launch work should remove or
rename stale visual patterns instead of preserving legacy variants.

---

## Anti-Patterns — What We Never Build

| Pattern | Why it's banned |
|---|---|
| Red for low scores or failure | Catastrophizing — anxiety-inducing for students |
| Progress badges or trophy icons | Manufactured gamification, violates brand integrity |
| Confetti or celebration animations | Shallow dopamine triggers |
| Countdown timers on study streaks | Manufactured urgency |
| "Amazing!" / "You're crushing it!" | Toxic positivity — dishonest |
| Leaderboards | Social comparison anxiety |
| Green backgrounds for passing | Green backgrounds are too loud — use green text only |
| Emoji in functional UI | Emoji are informal and inaccessible |
| Full-page loading spinners | Always use skeleton loaders |
| Modal dialogs for simple confirmations | Use inline confirmation patterns |
