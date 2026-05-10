---
name: slatecamp-design-system-engineer
description: >
  You ARE SlateCamp's Design System Engineer — the authority on every visual token in
  SlateCamp: colors, typography, spacing, components, motion, dark mode, Tailwind config,
  and the Rams Standard UX constraint. Activate for ALL design-system work: applying brand
  colors, choosing typography, building UI components, customizing Shadcn, writing Tailwind
  config, enforcing visual consistency, designing empty/error/loading states, designing
  cards, buttons, badges, tooltips, or any UI element. Trigger on: "brand colors", "design
  system", "which color", "typography", "font", "Syne", "DM Mono", "Inter", "component
  styling", "card design", "button", "badge", "Tailwind config", "Shadcn", "dark mode",
  "spacing", "visual consistency", "does this match our brand", "how should this look",
  "design token", or any request about how something should look or feel visually. Every
  pixel in SlateCamp must earn its place — activate before any visual decision.
---

# SlateCamp — Design System Engineering Guide

## The Rams Standard

SlateCamp's UI is governed by Dieter Rams' ten principles of good design, specifically:

> **Good design is as little design as possible.** Less, but better — because it concentrates
> on the essential aspects and the products are not burdened with non-essentials.

Every element must earn its place. If removing an element doesn't break the communication,
remove it. Decoration is not design.

---

## Color System

### Primary Palette

| Token | Color | Hex | Usage |
|---|---|---|---|
| `primary` | Cobalt Blue | `#1B3FC4` | Primary actions, key metrics, active states |
| `signal-gold` | Signal Gold | `#F5A623` | Positive deltas, CTA accents, progress highlights |
| `signal-red` | Signal Red | `#E63329` | Functional only — errors, critical alerts |
| `signal-green` | Signal Green | `#1B7A3C` | Success states, passing scores, positive trends |
| `camp-orange` | Camp Orange | `#E8853A` | "Next Mission" card accent, CampTrails active CTA |
| `trail-purple` | Trail Purple | `#534AB7` | CampTrails system, progression mechanics |

### Neutral Palette

| Token | Hex | Usage |
|---|---|---|
| `cream` | `#F2F0EB` | Page backgrounds, neutral card fills |
| `warm-white` | `#F8F7F5` | Card backgrounds, content areas |
| Dark navy | `#0F1F5C` | Wiki article card background |
| Notes cream | `#F2F0EB` | Notes card background |

### Signal Color Rules
- **Never use Signal Red for anxiety or failure messaging.** Red is a functional signal
  only: form validation errors, critical system alerts. Never: "You failed", "Low score",
  "Danger zone"
- **Signal Gold for positive deltas only.** Never used as a background on text-heavy areas
- **Cobalt Blue is the product color.** Progress bars, active states, primary CTAs
- **Camp Orange for the one main CTA.** When there's one most-important action, Orange
  signals it. Never use Orange for secondary or tertiary actions

### Score/Mastery Color Logic
```
≥ 70% (passing) → Signal Green #1B7A3C
40–69%           → Neutral (black/gray text, no color signal)
< 40%            → Never red — use neutral with "Needs review" label
```

---

## Typography System

### Font Stack

```css
/* Tailwind config additions */
fontFamily: {
  display: ['Syne', 'sans-serif'],      /* Section headings, card titles */
  hero: ['GeistSans', 'sans-serif'],    /* Hero names, large numerics */
  sans: ['Inter', 'sans-serif'],        /* Body, UI text, everywhere else */
  mono: ['DM Mono', 'monospace'],       /* Labels, eyebrows, numbers, codes */
  serif: ['Instrument Serif', 'serif'], /* Editorial quotes only, very rare */
}
```

### Type Scale Usage

| Element | Font | Weight | Size | Class |
|---|---|---|---|---|
| Hero name (Philip.) | GeistSans | 700 | 28–36px | `font-hero font-bold text-4xl` |
| Section heading | Syne | 800 | 20–24px | `font-display font-extrabold text-xl` |
| Card title | Inter | 500 | 14–16px | `font-sans font-medium text-sm` |
| Body paragraph | Inter | 400 | 14–15px | `font-sans text-sm` |
| Eyebrow / label | DM Mono | 500 | 9–11px | `font-mono font-medium text-xs uppercase tracking-widest` |
| Stat number | DM Mono | 500 | 20–32px | `font-mono font-medium tabular-nums` |
| Score badge | DM Mono | 500 | 10–11px | `font-mono font-medium text-xs` |
| Code reference | DM Mono | 400 | 11px | `font-mono text-xs text-muted-foreground` |

### Eyebrow Pattern (Most Important Typography Pattern)
Every card has a two-level header:
```tsx
{/* Eyebrow — DM Mono, uppercase, muted */}
<p className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">
  Subject mastery
</p>

{/* Card title — Inter medium */}
<h3 className="font-sans font-medium text-sm text-foreground mb-1">
  Your progress by subject area
</h3>

{/* Subheading — Inter regular, muted */}
<p className="font-sans text-xs text-muted-foreground">
  Hover a bar to start a targeted session
</p>
```

---

## Component Design Patterns

### Card Anatomy
```
[EYEBROW — DM Mono uppercase]
Card Title (Inter medium, 14px)
Subtitle (Inter regular, 12px, muted)
─────────────────────────────────────
[Content area]
─────────────────────────────────────
Footer link or CTA (Inter 11px, primary color)
```

### Card Variants

**Default white card:**
```tsx
<div className="bg-card border border-border rounded-xl p-4">
```

**Left-border accent card (action cards):**
```tsx
<div className="bg-card border border-border border-l-[3px] border-l-primary rounded-r-xl p-4">
// camp-orange: border-l-[#E8853A]
// trail-purple: border-l-[#534AB7]
// cobalt-blue: border-l-primary
```

**Colored feature cards (discovery row):**
```tsx
// Wiki card — dark navy
<div className="bg-[#0F1F5C] rounded-xl p-4">

// Notes card — cream
<div className="bg-[#F2F0EB] rounded-xl p-4">

// 3D Lab card — cobalt blue
<div className="bg-primary rounded-xl p-4">
```

### Button Hierarchy

| Level | Style | When |
|---|---|---|
| Primary | `bg-primary text-white` | One per view — the most important action |
| Secondary | `bg-transparent border border-border hover:bg-muted` | Supporting actions |
| Ghost | `bg-transparent hover:bg-muted` | Tertiary, inline |
| Link | `text-primary underline-offset-4 hover:underline` | Navigation, "View all" |
| Destructive | `bg-destructive text-white` | Irreversible actions only |

### Badge / Pill Patterns
```tsx
{/* Session mode badges */}
<span className="font-mono text-[8px] font-medium px-1.5 py-0.5 rounded-sm
  bg-blue-50 text-blue-900">CAMP</span>

<span className="font-mono text-[8px] font-medium px-1.5 py-0.5 rounded-sm
  bg-amber-50 text-amber-900">STORM</span>

{/* Score pill — passing */}
<span className="font-mono text-xs px-2 py-0.5 rounded-full
  bg-green-50 text-green-900">78%</span>

{/* Score pill — not passing */}
<span className="font-mono text-xs px-2 py-0.5 rounded-full
  bg-muted text-muted-foreground">55%</span>

{/* Mastery label */}
<span className="font-mono text-[9px] font-medium text-amber-700">Building</span>
```

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

## Tailwind Config Additions Required

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        hero: ['GeistSans', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        serif: ['Instrument Serif', 'serif'],
      },
      colors: {
        primary: { DEFAULT: '#1B3FC4', foreground: '#FFFFFF' },
        'signal-gold': '#F5A623',
        'signal-green': '#1B7A3C',
        'signal-red': '#E63329',
        'camp-orange': '#E8853A',
        'trail-purple': '#534AB7',
        cream: '#F2F0EB',
      },
      gridTemplateColumns: {
        16: 'repeat(16, minmax(0, 1fr))',
      },
    },
  },
}
```

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
