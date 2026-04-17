# Design System

**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026-04-06  
**Source-of-Truth:** `src/app/globals.css` (lines 1-1026)

---

## Slatecamp design system

SlateCamp uses the **Slatecamp design system** — a warm, research-backed aesthetic built on Tailwind CSS 4 with CSS-first configuration. All design tokens are defined as CSS custom properties in `globals.css`.

---

## Color Tokens

### Primary: Camp Cobalt

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `--primary` | `#1B3FC4` | `bg-primary` / `text-primary` | Primary actions, nav, links, active states |
| `--primary-50` | `#EEF2FC` | `bg-primary-50` | Light primary backgrounds |
| `--primary-100` | `#E3E6F3` | `bg-primary-100` | |
| `--primary-200` | `#C4CCE9` | `bg-primary-200` | |
| `--primary-300` | `#91A1DE` | `bg-primary-300` | |
| `--primary-400` | `#5874DA` | `bg-primary-400` | |
| `--primary-600` | `#1739B5` | `bg-primary-600` | |
| `--primary-700` | `#1535A8` | `text-primary-700` | Dark primary text |
| `--primary-800` | `#0A2070` | `bg-primary-800` | |
| `--primary-900` | `#06154C` | `bg-primary-900` | |
| `--primary-foreground` | `#FFFFFF` | `text-primary-foreground` | |

### Success: Emerald

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `--success` | `#2D9F6F` | `text-success` | Success, mastery, correct answers |
| `--emerald` | `#2D9F6F` | (alias) | Same as success |
| `--success-50` | `#EDFAF4` | `bg-success-50` | Light success bg |

### Destructive: Warm Red

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `--destructive` | `#D64545` | `text-destructive` | Errors, critical — always with context |
| `--danger` | `#D64545` | (alias) | Same as destructive |

### Warning: Amber

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `--warning` | `#D4951A` | `text-warning` | Warning, developing skill |
| `--amber` | `#D4951A` | (alias) | Same as warning |

### Accent: Camp Orange

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `--accent` | `#F5F5F5` | `bg-accent` | Neutral accent (default) |
| `--accent-blue` | `#1B3FC4` | — | Functional blue accent |
| `--accent-hover` | `#1535A8` | — | Hover state for blue accent |
| `--camp-orange` | `#E8853A` | — | Progress celebration, warm CTAs (sparingly) |

### Surface Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `--background` | `#FFFFFF` | `bg-background` | Page background |
| `--bg-primary` | `#FFFFFF` | (alias) | |
| `--bg-secondary` | `#F5F5F5` | `bg-secondary` | Secondary backgrounds |
| `--bg-tertiary` | `#EEF2FC` | — | Tertiary/light cobalt bg |
| `--surface-light` | `#F8F7F5` | (alias) | Warm white page bg |

### Text Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `--foreground` | `#1A2332` | `text-foreground` | Main text (Ink Primary) |
| `--ink-primary` | `#1A2332` | (alias) | |
| `--text-primary` | `#343638` | — | Primary text |
| `--text-secondary` | `#4A5568` | `text-text-secondary` | Secondary text |
| `--ink-secondary` | `#4A5568` | (alias) | |
| `--muted-foreground` | `#8896A7` | `text-muted-foreground` | Muted text, placeholders |
| `--ink-tertiary` | `#8896A7` | (alias) | |
| `--text-tertiary` | `#8896A7` | — | |

### Border Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `--border` | `#D4DAE3` | `border-border` | Default borders |
| `--border-default` | `#D4DAE3` | (alias) | |
| `--border-strong` | `#D4DAE3` | — | |
| `--border-warm` | `rgba(232,133,58,0.15)` | — | Warm accent border |

### Info

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `--info` | `#3B82C8` | — | Information indicators |

### Chart Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--chart-1` | `#1B3FC4` | Camp Cobalt |
| `--chart-2` | `#2D9F6F` | Emerald |
| `--chart-3` | `#E8853A` | Camp Orange |
| `--chart-4` | `#D4951A` | Amber |
| `--chart-5` | `#D64545` | Warm Red |

### Quiz State Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--quiz-correct-bg` | — | Correct answer background |
| `--quiz-correct-border` | — | Correct answer border |
| `--quiz-wrong-bg` | — | Wrong answer background |
| `--quiz-wrong-border` | — | Wrong answer border |
| `--quiz-selected-bg` | — | Selected option background |
| `--quiz-selected-border` | — | Selected option border |

### Wiki-Specific Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--cobalt-light` | — | Wiki highlights |
| `--signal-gold` | — | Warning indicators |
| `--signal-red` | — | Error indicators |
| `--signal-green` | — | Success indicators |
| `--cream` | — | Wiki prose backgrounds |
| `--wiki-body` | — | Wiki prose body text |
| `--wiki-border` | — | Wiki borders |

---

## Typography

### Font Families

Loaded via `next/font/google` in `src/app/layout.tsx`:

| Font | CSS Variable | Usage | Tailwind Class |
|------|-------------|-------|---------------|
| Atkinson Hyperlegible | `--font-atkinson` | Primary body text (accessibility-optimized) | `font-sans` (default) |
| DM Mono | `--font-dm-mono` | Code, data values, Readiness Score number | `font-mono` |
| Plus Jakarta Sans | `--font-display` | Display headings | — |
| Syne | `--font-syne` | Alternative display | `.font-syne` |
| Boldonse | `--font-boldonse` | Bold accents in headings | `.font-boldonse` |
| Sora | `--font-sora` | Logo | `.logo-sora` |
| Geist | fallback only | Sans-serif fallback | — |

### Font Usage Rules

- **Atkinson Hyperlegible** — Primary body text. Accessibility-optimized for legibility.
- **DM Mono** — Code snippets, data values, Readiness Score number display only. Never for labels/categories/metadata.
- **Plus Jakarta Sans / Syne** — Display headings and bold accents.
- **Never** use monospace for labels, categories, or metadata.

### Type Scale

| Element | Size | Tailwind Class |
|---------|------|---------------|
| Body | 15px | `text-base` |
| Small | 14px | `text-sm` |
| Tiny | 12px | `text-xs` |
| Micro | 10px | `text-[10px]` |
| Minimum | 8px | `text-[8px]` |

---

## Border Radius

| Token | Value | Tailwind Class | Usage |
|-------|-------|---------------|-------|
| `--radius-xs` | 2px | — | Micro elements, badges |
| `--radius-sm` | 4px | `rounded-sm` | Buttons, inputs, chips |
| `--radius-md` | 6px | `rounded-md` | Cards |
| `--radius-lg` | 8px | `rounded-lg` | Modals, dialogs |
| `--radius-xl` | 8px | — | **Cap at 8px — no larger** |

**Never use:** `rounded-xl` (on non-modal), `rounded-2xl`, `rounded-3xl`, `rounded-full` (except avatars and pills)

---

## Shadows

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| — | `shadow-none` | Rest state |
| — | `shadow-sm` | Hover state on cards, elevated elements |
| — | `shadow-md` | Dropdowns, popovers, menus |
| — | `shadow-lg` | Modals, floating panels, dialogs |

**Never use:** `shadow-xl`, `shadow-2xl`, `shadow-3xl` on non-modal elements.

---

## Transitions

| Token | Tailwind Class | Duration |
|-------|---------------|----------|
| Fast | `duration-150` | 150ms |
| Normal | `duration-200` | 200ms |
| Max | `duration-300` | 300ms |

**Easing:** `ease-out` only (default).  
**Never:** `ease-in-out`, `bounce`, or `spring` easing (except framer-motion structural animations).

---

## Gradients

| Token | Purpose |
|-------|---------|
| `--grad-warm-surface` | Warm background gradients |
| `--grad-cool-surface` | Cool background gradients |
| `--grad-slate` | Slate-toned gradients |
| `--grad-campfire` | Campfire orange/amber gradient |
| `--grad-emerald` | Emerald success gradients |
| `--grad-dark` | Dark theme gradients |

---

## Correct Component Usage

### Card

```tsx
// ✅ CORRECT — use shadcn/ui Card component
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Session Progress</CardTitle>
  </CardHeader>
  <CardContent>
    12 of 20 questions answered
  </CardContent>
</Card>

// ❌ WRONG — ad-hoc card div
<div className="rounded-md border bg-background shadow-sm p-6">
  <h3>Session Progress</h3>
  <p>12 of 20 questions answered</p>
</div>
```

### Button

```tsx
// ✅ CORRECT — use shadcn/ui Button
import { Button } from '@/components/ui/button'

<Button variant="default">Start Review</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="destructive">Delete</Button>

// ❌ WRONG — raw button with hardcoded styles
<button style={{ backgroundColor: '#1B3FC4' }}>
  Start Review
</button>
```

### HTML Sanitization

**Always sanitize before `dangerouslySetInnerHTML`:**

```tsx
import DOMPurify from 'isomorphic-dompurify'

const sanitized = DOMPurify.sanitize(userContent)
return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

---

## Incorrect Usage

| ❌ Wrong | ✅ Correct |
|----------|----------|
| `style={{ backgroundColor: '#1B3FC4' }}` | `className="bg-primary"` |
| `className="bg-[#F8F7F5]"` | `className="bg-background"` |
| `rounded-xl` on cards | `rounded-md` on cards |
| `shadow-xl` on dropdowns | `shadow-md` on dropdowns |
| `duration-500` transitions | `duration-300` max |
| `ease-bounce` | `ease-out` |
| Unsanitized `dangerouslySetInnerHTML` | `DOMPurify.sanitize()` first |
| `<div>` with onClick for buttons | `<button>` |
| `font-mono` for labels | `font-sans` for labels |

---

## Related Documents

- `03-design/002-copy-guide.md` — Brand voice, forbidden words
- `03-design/003-component-library.md` — shadcn/ui component inventory
- `.ai/rules/design.md` — Design implementation rules for agents

---

*All token values extracted directly from `src/app/globals.css`. Do not use values from archived `design-system.md`.*

