# Design System Rules

**Source:** `src/app/globals.css`, `CLAUDE.md`, `package.json`, `.ai/state/memory.md`  
**Last Verified:** 2026-04-10  
**Applies To:** All agents writing UI code

---

## Slatecamp design system — Absolute Rules

### Color Tokens (Use Only These)

Never hardcode hex values. Always use the token → Tailwind class mapping:

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| Camp Cobalt | `#1B3FC4` | `text-primary` / `bg-primary` | Primary actions, nav, links, active states |
| Cobalt Light | `#EEF2FC` | `bg-primary-50` | Light primary backgrounds |
| Cobalt Dark | `#1535A8` | `text-primary-700` | Dark primary text |
| Camp Orange | `#E8853A` | — | Progress celebration, warm CTAs (sparingly) |
| Emerald | `#2D9F6F` | `text-success` | Success, mastery, correct answers |
| Warm Red | `#D64545` | `text-destructive` | Error, critical — always with context |
| Amber | `#D4951A` | `text-warning` | Warning, developing skill |
| Surface Light | `#F8F7F5` | `bg-background` | Page background (warm white) |
| Ink Primary | `#1A2332` | `text-foreground` | Main text |
| Border | `#D4DAE3` | `border-border` | Default borders |
| Ink Secondary | `#4A5568` | `text-text-secondary` | Secondary text |
| Ink Tertiary | `#8896A7` | `text-muted-foreground` | Muted text, placeholders |

### Correct Usage

```tsx
// ✅ CORRECT — use Tailwind semantic classes
<button className="bg-primary text-white hover:bg-primary-700">
  Submit
</button>

<div className="bg-background text-foreground border-border">
  Content
</div>

<span className="text-success">Mastered</span>
<span className="text-destructive">Incorrect</span>
```

### Incorrect Usage

```tsx
// ❌ WRONG — hardcoded hex values
<button style={{ backgroundColor: '#1B3FC4' }}>
  Submit
</button>

// ❌ WRONG — inline hex in className
<div className="bg-[#F8F7F5] text-[#1A2332]">
  Content
</div>
```

---

## Typography

### Font Families

| Font | Purpose | Tailwind Class | Variable |
|------|---------|---------------|----------|
| Atkinson Hyperlegible | Body text (primary) | `font-sans` | `--font-atkinson` |
| Boldonse | Headings, bold accents | — | `--font-boldonse` |
| Syne | Display headings | `font-syne` | `--font-syne` |
| Sora | Alternative headings | — | `--font-sora` |
| DM Mono | Code/data values | `font-mono` | `--font-dm-mono` |

### Font Loading

Loaded via `next/font/google` in `src/app/layout.tsx`. Do not import fonts directly.

### Type Scale

| Element | Size | Class |
|---------|------|-------|
| Body | 16px | `text-base` |
| Small | 14px | `text-sm` |
| Tiny | 12px | `text-xs` |
| Caption | 10px | `text-[10px]` |
| Minimum | 8px | `text-[8px]` |

---

## Spacing & Sizing

| Token | Tailwind Class |
|-------|---------------|
| xs | `space-x-1` / `gap-1` |
| sm | `space-x-2` / `gap-2` |
| md | `space-x-4` / `gap-4` |
| lg | `space-x-6` / `gap-6` |
| xl | `space-x-8` / `gap-8` |

---

## Border Radius

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| Small | `rounded-sm` | Buttons, inputs, chips |
| Medium | `rounded-md` | Cards, panels |
| Large | `rounded-lg` | Modals, dialogs |
| Full | `rounded-full` | Avatars, pills |

**Never use:** `rounded-xl`, `rounded-2xl`, `rounded-3xl`

---

## Shadows

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| sm | `shadow-sm` | Hover state on cards |
| md | `shadow-md` | Dropdowns, popovers |
| lg | `shadow-lg` | Modals, floating panels |

**Never use:** `shadow-xl`, `shadow-2xl`, `shadow-3xl`

---

## Transitions

| Token | Tailwind Class |
|-------|---------------|
| Fast | `duration-150` |
| Normal | `duration-200` |
| Slow | `duration-300` |

**Easing:** `ease-out` only — never `ease-in-out`, `bounce`, or `spring`  
**Duration:** Max 300ms — never longer

---

## Component Usage

### Use shadcn/ui Components

Always prefer components from `@/components/ui/`:
- `<Card>` — never ad-hoc card divs
- `<Button>` — never raw `<button>` with custom styles
- `<Input>` — never raw `<input>` with custom styles
- `<Dialog>` / `<Modal>` — never ad-hoc modal divs

### Card Pattern

```tsx
// ✅ CORRECT
import { Card, CardHeader, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>

// ❌ WRONG
<div className="rounded-md border bg-background shadow-sm p-6">
  <h3>Title</h3>
  <div>Content</div>
</div>
```

---

## HTML Sanitization

**Always sanitize HTML** before `dangerouslySetInnerHTML`:

```tsx
import DOMPurify from 'isomorphic-dompurify'

const sanitized = DOMPurify.sanitize(userContent)
return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

---

## Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML (`<button>`, `<a>`, `<nav>`) over `<div>` with click handlers
- Include `aria-label` for icon-only buttons
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text

---

## Prohibited

- ❌ Hardcoded hex values in Tailwind classes
- ❌ Hardcoded hex values in inline styles
- ❌ `rounded-xl` or larger on non-modal elements
- ❌ `shadow-xl` or larger
- ❌ `ease-bounce` or `ease-spring` transitions
- ❌ Transitions longer than 300ms
- ❌ Ad-hoc card/modal/button divs (use shadcn/ui)
- ❌ Unsanitized `dangerouslySetInnerHTML`
- ❌ Inline styles for anything that can be done with Tailwind

---

*Extract tokens from `src/app/globals.css` for authoritative values. This file summarizes rules for agent reference.*

