# SlateCamp Design System
## The Camp Standard — v1.0

> This is the canonical design reference for the entire SlateCamp product:
> landing page, dashboard, quiz interface, analytics, wiki, and all future surfaces.
> All new UI must conform to this system. When in doubt, reference this document first.

---

## PART 1: PHILOSOPHY

### Design DNA

**Bold. Honest. Architectural.**

SlateCamp is not a generic edtech platform. The visual language reflects that. Every surface should feel like it was designed by someone who understands architecture — precision, materiality, structural clarity. No gradients for decoration. No shadows for depth. Color does the work.

The system is unapologetically primary. Inspired by Bauhaus, Swiss typographic tradition, and the bold-color-block energy of reference graphic design systems. Each color has one identity. Each surface earns its color.

### Three rules to never break

1. **Color has meaning.** You cannot use Camp Red because it looks nice. Red is for urgency, fear hooks, and conversion moments. If something doesn't earn red, it doesn't get red.

2. **Noise textures go on colored surfaces only.** Never on white, never on cream, never on the page background. Noise enriches bold surfaces. On neutral surfaces it reads as dirt.

3. **Syne is the display typeface. Always.** If you find yourself using Inter, Roboto, or system-ui on a heading or card, you are wrong. DM Mono for labels and metadata only.

---

## PART 2: COLOR SYSTEM

### Primary Palette — The Camp Colors

These six are the core cards of the visual language. Every colored surface uses exactly one of these.

| Token | Name | Hex | Role |
|---|---|---|---|
| `--camp-black` | Camp Black | `#111111` | Review Mode, AI features, "serious" surfaces |
| `--camp-cobalt` | Camp Cobalt | `#1B3FC4` | Analytics, Engine, data intelligence |
| `--camp-red` | Camp Red | `#E63329` | Fear hooks, urgency CTAs, quote cards |
| `--camp-green` | Camp Green | `#1B7A3C` | 3D Lab, visual learning, growth states |
| `--camp-amber` | Camp Amber | `#F5A623` | Sessions, progress, energy states |
| `--camp-cream` | Camp Cream | `#FFFDF7` | Stats, testimonials, neutral info cards |

### Structural Colors

| Token | Name | Hex | Role |
|---|---|---|---|
| `--page-bg` | Page Background | `#F2F0EB` | The canvas. Warm off-white. Never pure white. |
| `--primary` | Camp Cobalt / Primary | `#1B3FC4` | All interactive: CTAs, links, focus rings, active states, brand color |
| `--secondary` | Camp Amber / Secondary | `#F5A623` | Secondary CTAs, score accents, starburst, amber badges |
| `--ink` | Ink | `#18181B` | Headings and bold text on light surfaces |
| `--border` | Border | `#E8E4DC` | All dividers, card borders, input borders |
| `--text-secondary` | Secondary Text | `#6B6B6B` | Body copy on light surfaces |
| `--text-tertiary` | Tertiary Text | `#9CA3AF` | Captions, metadata, timestamps |

### CSS Custom Properties (add to global.css)

```css
:root {
  /* Camp Colors */
  --camp-black:  #111111;
  --camp-cobalt: #1B3FC4;
  --camp-red:    #E63329;
  --camp-green:  #1B7A3C;
  --camp-amber:  #F5A623;
  --camp-cream:  #FFFDF7;

  /* Structural */
  --page-bg:      #F2F0EB;
  --primary:       #1B3FC4;  /* Camp Cobalt — Primary Brand */
  --primary-hover: #1535A8;
  --secondary:     #F5A623;  /* Camp Amber — Secondary Brand */
  --secondary-hover: #E0961A;
  --brand-hover:  #1535A8;
  --ink:          #18181B;
  --border:       #E8E4DC;
  --text-2:       #6B6B6B;
  --text-3:       #9CA3AF;

  /* Noise opacity levels */
  --noise-light:  0.035;
  --noise-std:    0.055;
  --noise-heavy:  0.09;
}
```

### Tailwind Config Extension

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      // ── PRIMARY & SECONDARY ──────────────────────────────────
      primary:           '#1B3FC4',   // Camp Cobalt — THE brand color
      'primary-hover':   '#1535A8',   // Cobalt darkened
      'camp-cobalt': '#1B3FC4',
      'camp-red':    '#E63329',
      'camp-green':  '#1B7A3C',
      'camp-amber':  '#F5A623',
      'camp-cream':  '#FFFDF7',
      'page-bg':     '#F2F0EB',
      'ink':         '#18181B',
      'border-warm': '#E8E4DC',
    }
  }
}
```

### Color Rules

**On Camp Black, Camp Cobalt, Camp Red, Camp Green:**
- Primary text: `text-white`
- Secondary text: `text-white/55` to `text-white/60`
- Tertiary / labels: `text-white/35` to `text-white/45`
- Borders / dividers: `border-white/10` to `border-white/15`
- Pills: `border-white/20 text-white/55`

**On Camp Amber:**
- Primary text: `text-zinc-900` or `text-[#111]`
- Secondary text: `text-black/55`
- Borders: `border-black/15`
- Pills: `border-black/15 text-black/45`

**On Camp Cream / Page Background:**
- Primary text: `text-ink` (`#18181B`)
- Secondary: `text-[#6B6B6B]`
- Borders: `border-[#E8E4DC]`

---

## PART 3: NOISE TEXTURE SYSTEM

Grain/noise overlay gives depth to bold colored surfaces. It prevents flat color from feeling cheap or digital. Think of it as the "paper texture" of the system.

### How It Works

A CSS `::after` pseudo-element using an SVG fractalNoise filter, applied as a `background-image` URL, rendered with `mix-blend-mode: overlay`. This is pure CSS — no image files, no external assets, zero extra load time.

### The Three Levels

| Class | Opacity | Use on |
|---|---|---|
| `.noise-light` | 3.5% | Amber cards, any very light surface |
| `.noise` | 5.5% | Black cards, Red cards |
| `.noise-heavy` | 9% | Cobalt cards, Green cards |

### Implementation CSS

```css
/* globals.css or a dedicated utilities layer */

.noise::after,
.noise-light::after,
.noise-heavy::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  pointer-events: none;
  mix-blend-mode: overlay;
}

.noise-light::after { opacity: 0.035; }
.noise::after       { opacity: 0.055; }
.noise-heavy::after { opacity: 0.09;  }
```

**Requirements for any element using noise:**
- Must have `position: relative` (the pseudo-element is absolute)
- Must have `overflow: hidden` (the pseudo-element tiles beyond the element edge)
- Must have a colored background — noise on transparent or white does nothing useful
- Child elements must have `position: relative; z-index: 1` if they were rendering below the pseudo-element (use `isolation: isolate` on the card's content wrapper if needed)

### Tailwind equivalent (add to tailwind.config.ts)

```ts
// In the `plugins` array:
plugin(({ addUtilities }) => {
  addUtilities({
    '.noise': {
      position: 'relative',
      overflow: 'hidden',
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: '0',
        borderRadius: 'inherit',
        backgroundImage: `url("data:image/svg+xml,...")`, // same SVG as above
        backgroundSize: '180px 180px',
        opacity: '0.055',
        pointerEvents: 'none',
        mixBlendMode: 'overlay',
      }
    },
    '.noise-light': { /* same, opacity 0.035 */ },
    '.noise-heavy': { /* same, opacity 0.09  */ },
  })
})
```

### Which card gets which noise level

| Surface | Noise Level | Rationale |
|---|---|---|
| Camp Black cards | `.noise` | Standard — warm up the flat black |
| Camp Cobalt cards | `.noise-heavy` | Cobalt needs the most texture to avoid feeling digital |
| Camp Red cards | `.noise` | Red is already loud — standard noise, don't compete |
| Camp Green cards | `.noise-heavy` | Deep green benefits from maximum organic texture |
| Camp Amber cards | `.noise-light` | Yellow is warm already — barely-there grain only |
| Camp Cream cards | ❌ none | Cream is explicitly clean — noise reads as dirt here |
| Page background | ❌ none | Never |
| White surfaces | ❌ none | Never |

---

## PART 4: TYPOGRAPHY

### Font Stack

| Role | Font | Weight | Usage |
|---|---|---|---|
| Display / Headlines | Syne | 800 | Hero headlines, card titles, section headers |
| Body / UI | Syne | 400 | Body copy, paragraph text, descriptions |
| Labels / Metadata | DM Mono | 400, 500 | Tags, monospaced labels, version numbers, eyebrows |
| Italic / Pull quotes | DM Mono Italic | 400 | Quote markers, italic emphasis in mono contexts |

### Loading (Next.js)

```tsx
// fonts.ts or layout.tsx
import { Syne, DM_Mono } from 'next/font/google'

export const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  display: 'swap',
  variable: '--font-display',
})

export const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-mono',
})
```

Add both variables to the `<html>` element and update `tailwind.config.ts`:

```ts
fontFamily: {
  sans:    ['Syne', 'sans-serif'],
  mono:    ['DM Mono', 'monospace'],
  display: ['Syne', 'sans-serif'],
}
```

### Type Scale

| Name | Size | Weight | Letter-spacing | Line-height | Usage |
|---|---|---|---|---|---|
| Hero | clamp(36px, 5vw, 56px) | 800 | -0.03em | 1.0 | Landing hero headline |
| Display | clamp(28px, 3.5vw, 40px) | 800 | -0.025em | 1.05 | Section heroes, bento card main titles |
| Heading 1 | clamp(22px, 2.5vw, 28px) | 800 | -0.02em | 1.1 | Card headlines, section titles |
| Heading 2 | 20px | 700 | -0.01em | 1.2 | Sub-section titles, page section labels |
| Heading 3 | 17px | 700 | 0 | 1.3 | Card sub-titles, sidebar headers |
| Body | 15px | 400 | 0 | 1.7 | All body copy |
| Small | 13px | 400 | 0 | 1.6 | Card descriptions, secondary text |
| Caption | 12px | 400 | 0 | 1.5 | Metadata, image captions |
| Label | 10–11px | 400 | 0.18–0.22em | — | DM Mono uppercase eyebrows, section labels |
| Micro | 9–10px | 400 | 0.1em | — | DM Mono only — pills, source citations, version numbers |

### Eyebrow Pattern

The monospaced uppercase eyebrow above section headlines is a signature system element:

```tsx
// Always DM Mono, always uppercase, always muted
<span className='font-mono text-[10px] tracking-[0.2em] uppercase text-white/40'>
  [ Section Label ]
</span>

// Or with a starburst:
<div className='flex items-center gap-2'>
  <Starburst className='h-3.5 w-3.5 text-[#F5A623]' />
  <span className='font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-500'>
    How It Works
  </span>
</div>
```

---

## PART 5: SURFACE & CARD SYSTEM

### Surface Hierarchy

```
Level 0 — Page Background:    #F2F0EB  (the canvas)
Level 1 — White Surface:      #FFFFFF  (modals, popovers, dropdown menus)
Level 2 — Cream Surface:      #FFFDF7  (cards, panels, sidebars)
Level 3 — Camp Color Surface: bold card backgrounds
```

### Card Anatomy

Every card in the system has these properties:

```tsx
<div className='
  relative          // required for noise pseudo-element
  overflow-hidden   // required for noise pseudo-element
  rounded-[10px]    // system corner radius — always 10px for cards
  p-7               // 28px padding — standard card padding
  noise             // noise class based on background color
  bg-[#111111]      // always one of the 6 Camp Colors
  text-white        // or text-[#111] for amber
'>
  {/* All child content must be z-indexed if noise causes stacking issues */}
  <div className='relative z-10'>
    {/* card content */}
  </div>
</div>
```

### Card Border Radius

- Cards, bento panels: `border-radius: 10px` (`rounded-[10px]`)
- Inner panels, nested cards: `border-radius: 8px` (`rounded-md`)
- Pills, badges: `border-radius: 999px` (`rounded-full`)
- Inputs, buttons: `border-radius: 4–6px` (`rounded-sm`)
- Never use `rounded-lg` (12px) or larger for cards — it reads too bubbly for this aesthetic

### Pill / Tag Pattern

```tsx
// On dark cards
<span className='
  font-mono text-[9px] tracking-[0.1em]
  px-[9px] py-[3px]
  rounded-full
  border border-white/20
  text-white/55
'>
  Active Recall
</span>

// On amber card (dark version)
<span className='
  font-mono text-[9px] tracking-[0.1em]
  px-[9px] py-[3px]
  rounded-full
  border border-black/15
  text-black/45
'>
  Camp Mode
</span>
```

---

## PART 6: INTERACTIVE ELEMENTS

### Primary CTA Button

The main CTA uses Brand Blue (`#1B3FC4`), not any Camp Color. The Camp Colors are for surfaces, not interactive elements. This distinction keeps the interactive layer clear.

```tsx
<button className='
  inline-flex items-center gap-2
  rounded-sm                    // 4px — sharp, architectural
  bg-primary                    // #1B3FC4
  hover:bg-[#1535A8]
  px-7 py-3
  text-[14px] font-medium text-white
  transition-colors duration-150
  focus-visible:outline-none
  focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
'>
  Join Free →
</button>
```

### Secondary / Ghost Button

```tsx
<button className='
  inline-flex items-center gap-2
  rounded-sm
  border border-[#E8E4DC]
  bg-transparent hover:bg-[#FFFDF7]
  px-5 py-2.5
  text-[13px] font-medium text-[#6B6B6B]
  transition-colors duration-150
'>
  See how it works
</button>
```

### Input Fields

```tsx
<input className='
  w-full rounded-sm
  border border-[#E8E4DC]
  bg-[#FFFDF7]
  px-4 py-2.5
  text-[14px] text-[#111]
  placeholder:text-[#9CA3AF]
  focus:border-primary focus:outline-none
  focus:ring-1 focus:ring-primary/30
  transition-colors duration-150
' />
```

### Focus Ring

Always use Brand Blue. `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`

---

## PART 7: ICON & ACCENT SYSTEM

### Starburst

The `<Starburst />` component is the system's decorative accent. It replaces generic bullet points for section eyebrows and card accent marks.

- Always in `text-[#F5A623]` (Camp Amber) — this is one of two places amber appears on non-amber surfaces
- Size: `h-4 w-4` for standard use, `h-3.5 w-3.5` for tight spaces
- Position: paired with eyebrow text in section headers, or floated to `justify-between` in card headers

### Arrow Circle

A 30–32px circle with a single `→` glyph. Used at the bottom-right of bento cards as a "learn more" affordance.

```tsx
// On dark cards
<div className='flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/25 text-white/55 text-[13px]'>
  →
</div>

// On amber / light cards
<div className='flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black/20 text-black/40 text-[13px]'>
  →
</div>
```

### Readiness Ring SVG

The core data visualization. Used in bento grid, dashboard, and the hero ConversionHookCard.

Key parameters:
- `r="36"` — ring radius
- `stroke-dasharray: 226.2` — full circumference (2π × 36)
- `stroke-dashoffset` = `226.2 × (1 - score/100)` — calculates filled portion
- `transform="rotate(-90 50 50)"` — starts fill from 12 o'clock
- Ring track color: `rgba(255,255,255,0.1)` on dark, `rgba(0,0,0,0.07)` on light
- Ring fill color: `#E2E2E6` (neutral) or `#4ade80` (passing zone, score ≥ 75)
- Center number: Syne 800, white on dark, `#111` on light
- Center label: DM Mono 6–7px, all caps `READINESS`, 30% opacity

---

## PART 8: SPACING & LAYOUT

### Base Grid

- Max content width: `1200px` (`max-w-[1200px]`)
- Page horizontal padding: `px-6` (24px on mobile → use `px-4`)
- Section vertical padding: `py-24` (96px) for major sections, `py-16` for minor
- Bento card gap: `gap-[10px]` — always 10px, not Tailwind's `gap-3` (12px)

### Card Padding

- Standard card: `p-7` (28px)
- Compact card / inner panel: `p-5` (20px)
- Dense UI (analytics rows, list items): `p-4` (16px)

### Section Rhythm

```tsx
// Major section: border-top + full padding
<section className='border-t border-[#E8E4DC] px-6 py-24'>

// Minor / transitional section: no border, reduced padding
<section className='px-6 py-12'>
```

---

## PART 9: MOTION & ANIMATION

### Scroll Reveal (existing, keep)

```css
.landing-reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 400ms ease-out, transform 400ms ease-out;
}
.landing-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
/* Stagger delays */
.landing-delay-1 { transition-delay: 80ms; }
.landing-delay-2 { transition-delay: 160ms; }
.landing-delay-3 { transition-delay: 240ms; }
.landing-delay-4 { transition-delay: 320ms; }
.landing-delay-5 { transition-delay: 400ms; }
.landing-delay-6 { transition-delay: 480ms; }

@media (prefers-reduced-motion: reduce) {
  .landing-reveal { opacity: 1; transform: none; transition: none; }
}
```

### Card Hover

```css
/* Applied to all bento cards */
transition: transform 0.15s ease;

&:hover {
  transform: translateY(-2px);
}
```

No box-shadow changes on hover. No color changes on hover. Translation only.

### Interactive State Transitions

- Color: `transition-colors duration-150`
- Transform: `transition-transform duration-150`
- All: `transition-all duration-150`

Use `duration-150` everywhere. `200ms` if it feels too snappy. Never `300ms` for micro-interactions.

---

## PART 10: COMPONENT PATTERNS BY APP SURFACE

### Landing Page

- Page background: `bg-[#F2F0EB]`
- Nav: `bg-[#FFFDF7]/90 border-[#E8E4DC]` (scrolled), transparent (at top)
- Bento cards: all 6 Camp Colors with noise (see Part 5)
- Hero cards: `bg-[#FFFDF7]` with warm border
- Social proof bar: `bg-[#FFFDF7]/80 border-[#E8E4DC]`
- Final CTA panel: `bg-[#111111] noise` — black, authoritative, full stop

### Dashboard / App Shell

- Page background: `bg-[#F2F0EB]`
- Sidebar: `bg-[#FFFDF7] border-r border-[#E8E4DC]`
- Main content area: transparent (page bg shows through)
- Metric/stat cards: `bg-[#FFFDF7] border border-[#E8E4DC]` — NOT Camp Colors
  - Camp Colors are reserved for marketing surfaces and feature highlights
  - Dashboard data cards should be cream/white for clarity and readability
- Active navigation item: `bg-camp-cobalt text-white` with `noise`
- Focused/selected state: left border `border-l-2 border-primary`

### Quiz Interface

- Question card background: `bg-white border border-[#E8E4DC]` — pure white for focus
- Answer options neutral: `bg-[#FFFDF7] border border-[#E8E4DC]`
- Answer option correct: `bg-green-50 border border-green-300 text-green-800`
- Answer option incorrect: `bg-red-50 border border-red-200 text-red-700`
- Answer option selected: `bg-[#EBF3FB] border border-primary/40`
- Question category badge: `bg-[#111111] text-white noise-light` — same pill pattern

### Readiness Score Display

- High (≥ 75%): ring fill `#4ade80` (green), label text green
- Medium (50–74%): ring fill `#fbbf24` (amber), label text amber
- Low (< 50%): ring fill `#f87171` (soft red), label text red
- Not started: ring fill `rgba(0,0,0,0.1)`, label "Not started"

### Empty States

```tsx
<div className='flex flex-col items-center py-16 text-center'>
  <div className='h-12 w-12 rounded-full bg-[#E8E4DC] flex items-center justify-center'>
    {/* icon */}
  </div>
  <h3 className='mt-4 text-[17px] font-semibold text-[#111]'>Nothing here yet</h3>
  <p className='mt-2 text-[14px] text-[#6B6B6B] max-w-xs leading-relaxed'>
    Contextual description of the empty state.
  </p>
  <button className='mt-6 {primary-button-classes}'>Take action</button>
</div>
```

---

## PART 11: THE NOISE TEXTURE — IMPLEMENTATION GUIDE FOR CLAUDE CODE

When adding noise to any component:

**Step 1** — Add `.noise`, `.noise-light`, or `.noise-heavy` class to the card element.

**Step 2** — Ensure the card has `position: relative` and `overflow: hidden`. In Tailwind: `relative overflow-hidden`.

**Step 3** — If any child element appears hidden beneath the noise overlay, add `relative z-10` to the card's inner content wrapper:

```tsx
// Template for any bento card
<div className='relative overflow-hidden rounded-[10px] bg-[#1B3FC4] p-7 text-white noise-heavy'>
  {/* Everything inside this div is above the noise */}
  <div className='relative z-10'>
    <span className='font-mono text-[10px] tracking-[0.2em] uppercase text-white/40'>
      [ Card Label ]
    </span>
    {/* ... */}
  </div>
</div>
```

**Step 4** — The noise SVG data URL. Copy this exactly (it cannot be broken across lines or it will corrupt):

```
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
```

---

## PART 12: WHAT NEVER TO DO

| ❌ Never | ✅ Instead |
|---|---|
| `bg-gray-600` on any card | Use a Camp Color |
| `bg-white` as a page background | Use `bg-[#F2F0EB]` |
| Gradient backgrounds | Solid color + noise texture |
| Drop shadows on cards | Translation on hover only |
| `font-family: Inter` on headings | Syne only |
| `rounded-lg` (12px) on cards | `rounded-[10px]` |
| Noise on white/cream surfaces | Camp Colors only |
| More than 4 bold Camp Color surfaces visible at once | Reduce — visual fatigue |
| Using Camp Red for non-urgent content | Red = urgency/fear/error only |
| **Single-sided colored borders** — `border-l-4`, `border-left: 3px solid`, left-accent callout cards | Full border or no border. **Never one side only. Ever.** |
| **Dark backgrounds on inputs, forms, or any text entry surface** | Inputs always on `#FFFDF7` or `#ffffff`. Forms live on light surfaces exclusively. |
| Alert/callout boxes with a colored left stripe | Inline text with a colored semantic badge/pill above it, or a full-border card in the correct Camp Color |
| `border-l-2 border-primary` as an active/selected indicator in nav | `bg-primary text-white noise` fill for active states instead |
| Mixing bold Camp Color cards with dark-background form panels on the same screen | Keep bold cards in marketing/feature contexts; keep forms and inputs on cream/white always |

---

## APPENDIX: QUICK-COPY CARD TEMPLATES

### Black card
```tsx
<div className='relative overflow-hidden rounded-[10px] bg-[#111111] p-7 text-white noise'>
  <div className='relative z-10'>
    <span className='font-mono text-[10px] tracking-[0.2em] uppercase text-white/40'>[ Label ]</span>
    <h3 className='mt-7 text-[26px] font-extrabold leading-tight tracking-tight'>Headline</h3>
    <p className='mt-2 text-[13px] leading-relaxed text-white/55'>Description text.</p>
  </div>
</div>
```

### Cobalt card
```tsx
<div className='relative overflow-hidden rounded-[10px] bg-[#1B3FC4] p-7 text-white noise-heavy'>
  <div className='relative z-10'>{/* content */}</div>
</div>
```

### Red card
```tsx
<div className='relative overflow-hidden rounded-[10px] bg-[#E63329] p-7 text-white noise'>
  <div className='relative z-10'>{/* content */}</div>
</div>
```

### Green card
```tsx
<div className='relative overflow-hidden rounded-[10px] bg-[#1B7A3C] p-7 text-white noise-heavy'>
  <div className='relative z-10'>{/* content */}</div>
</div>
```

### Amber card
```tsx
<div className='relative overflow-hidden rounded-[10px] bg-[#F5A623] p-7 noise-light'>
  <div className='relative z-10'>
    {/* text-[#111] for all copy */}
  </div>
</div>
```

### Cream card (no noise)
```tsx
<div className='rounded-[10px] bg-[#FFFDF7] border border-[#E8E4DC] p-7'>
  {/* text-[#111] / text-[#6B6B6B] for copy */}
</div>
```

---

*This document is the canonical design reference for SlateCamp.*
*Version: 1.0 — established from the color uplift sprint.*
*Next review: when a major new surface is added (mobile app, onboarding flow, etc.)*

---

## PART 13: THE TWO ABSOLUTE UI RULES (added sprint 1)

These came directly from product review and are non-negotiable for every screen, every component, forever.

### Rule 1: No dark-background inputs. Ever.

Forms, text inputs, textareas, dropdowns, search fields — every data-entry surface in the entire app lives on `#FFFDF7` (Camp Cream) or `#FFFFFF` (white). No exceptions.

```tsx
// ✅ CORRECT — always light
<input className='
  border border-[#E8E4DC]
  bg-[#FFFDF7]
  rounded-[5px] px-4 py-2.5
  text-[14px] text-[#111]
  placeholder:text-[#9CA3AF]
  focus:border-[#1B3FC4]
  focus:ring-2 focus:ring-[#1B3FC4]/15
' />

// ❌ WRONG — never dark
<input className='bg-zinc-800 text-white ...' />
<input className='bg-[#111] ...' />
<input className='bg-gray-900 ...' />
```

If a form must appear near bold Camp Color cards (e.g. a sign-up form below the hero bento), place the form inside a `bg-[#FFFDF7]` panel that visually separates it from the dark cards. The contrast between bold colored cards and clean white forms is intentional — it communicates "features" vs "data entry."

### Rule 2: No single-sided colored borders. Ever.

The left-border accent card pattern (a card with `border-left: 4px solid [color]` and a white or gray body) is explicitly banned from the SlateCamp design system. It looks like a Bootstrap default. It is a default.

```tsx
// ✅ CORRECT — full border or no border
<div className='rounded-[10px] border border-[#E8E4DC] bg-[#FFFDF7] p-5'>
  <span className='font-mono text-[9px] text-[#F5A623] tracking-[.18em] uppercase'>Warning</span>
  <p className='mt-2 text-[13px] text-[#555]'>Architectural Theory needs attention — below 50%.</p>
</div>

// ✅ CORRECT — Camp Color full fill for semantic callouts
<div className='relative overflow-hidden rounded-[10px] bg-[#E63329] p-5 text-white noise'>
  <div className='relative z-10'>
    <p className='text-[13px] text-white/90'>1 in 3 ALE examinees don't pass. Know your score now.</p>
  </div>
</div>

// ❌ WRONG — left-border accent
<div className='border-l-4 border-blue-500 bg-blue-50 pl-4 py-3'>...</div>
<div className='border-left: 3px solid #1B3FC4 ...' />
```

**For semantic callouts (info, warning, success, danger):** Use a colored label/badge above plain body text on a cream card. The color lives in the badge, not the border.

```tsx
// ✅ Semantic callout — the correct pattern
<div className='rounded-[10px] border border-[#E8E4DC] bg-[#FFFDF7] p-5'>
  <span className='
    inline-block mb-2
    font-mono text-[9px] tracking-[.15em] uppercase
    bg-[#FFF3D6] text-[#92400e]
    px-2 py-0.5 rounded-[4px]
  '>
    ⚠ Warning
  </span>
  <p className='text-[13px] text-[#555] leading-relaxed'>
    Architectural Theory is below 50% — this subject needs focused review before exam day.
  </p>
</div>
```
