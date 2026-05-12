# Design System

**Status:** Active
**Version:** 1.0
**Last Updated:** 2026-04-25
**Source-of-Truth:** `DESIGN.md` for agent-readable visual identity, `src/app/globals.css` for implemented CSS/Tailwind tokens

---

## SlateCamp Design System

SlateCamp uses the **SlateCamp design system**: a calm, study-first product language for Philippine Licensure Examination for Architects candidates. The system is not a borrowed external design-language derivative. External references are research inputs only; the current authority is SlateCamp's own candidate-centered doctrine in `DESIGN.md`.

`DESIGN.md` is the root-level agent-readable contract for the same design system. Keep it aligned with this document and `src/app/globals.css` whenever color, typography, spacing, shape, component, or visual identity rules change. Validate it with `bun run design:lint`.

All design tokens are defined as CSS custom properties in `globals.css`. New work should use semantic Tailwind utilities and shared components instead of raw hex values, ad-hoc radii, or borrowed visual-system terminology.

### Design Doctrine

SlateCamp's design standard is:

- **Study-first:** layouts reduce exam-prep friction and keep candidates oriented.
- **Signal-first:** visual emphasis communicates state, priority, or the next useful action.
- **Legible by default:** Atkinson Hyperlegible body text, clear contrast, persistent labels, and visible focus states are product requirements.
- **Dense but breathable:** dashboards and study tools should support repeated daily use without marketing-page spacing.
- **Calm under pressure:** no shame language, hype, confetti, leaderboards, or artificial urgency.
- **Token-owned:** color, typography, spacing, radius, elevation, and motion come from the current SlateCamp token set.

### System Layers

| Layer | Owner | Current Source |
|-------|-------|----------------|
| Foundations | Design system | `DESIGN.md`, `src/app/globals.css`, this file |
| Components | Frontend/design system | `src/components/ui/`, shared app components, `/developer/design-system` |
| Patterns | Product/frontend | onboarding, quiz, dashboard, settings, admin, empty/error/loading states |
| Governance | Docs/agents | `.ai/00_system/DOCS_SOURCE_OF_TRUTH.md`, `.codex/skills/slatecamp-design-system-engineer/SKILL.md`, `bun run design:lint` |

### Research Inputs

Research validates constraints; it does not become the brand.

- [W3C Design Tokens Format Module 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/) supports token names, values, metadata, grouping, and aliases as a cross-tool design-system contract.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) governs focus visibility, focus not obscured, labels, contrast, input assistance, and minimum pointer targets.
- [Figma variables, collections, and modes](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes) map well to SlateCamp's semantic tokens, aliases, and future light/dark/accessibility modes.
- [Storybook UI testing](https://storybook.js.org/docs/writing-tests) is the reference model for documenting and testing shared component states when the component catalog is expanded.

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

### Legacy / Wiki-Specific Alias Colors

These aliases exist in `globals.css` for current Wiki and preserved component compatibility. New UI should prefer the semantic tokens above (`--primary`, `--warning`, `--destructive`, `--success`, `--background`, `--foreground`, `--border`) unless a Wiki component explicitly depends on the alias.

| Token | Hex | Usage |
|-------|-----|-------|
| `--cobalt-light` | — | Wiki highlights |
| `--signal-gold` | — | Legacy warning alias |
| `--signal-red` | — | Legacy error alias |
| `--signal-green` | — | Legacy success alias |
| `--cream` | — | Legacy/wiki prose backgrounds |
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
| Syne | `--font-syne` | Legacy/accent display only | `.font-syne` |
| Boldonse | `--font-boldonse` | Legacy/accent display only | `.font-boldonse` |
| Sora | `--font-sora` | Logo | `.logo-sora` |
| Geist | fallback only | Sans-serif fallback | — |

### Font Usage Rules

- **Atkinson Hyperlegible** — Primary body text. Accessibility-optimized for legibility.
- **DM Mono** — Code snippets, data values, Readiness Score number display only. Never for labels/categories/metadata.
- **Plus Jakarta Sans** — Default display headings and bold section titles.
- **Syne / Boldonse** — Legacy/accent display use only where already established.
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

### Modal

```tsx
// ✅ CORRECT — use the canonical popup modal shell
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'

<Modal open={open} onOpenChange={setOpen}>
  <ModalContent size="lg" position="top-center">
    <ModalHeader>
      <ModalTitle>Search</ModalTitle>
    </ModalHeader>
    <ModalBody>Scrollable modal content</ModalBody>
    <ModalFooter>Footer actions or hints</ModalFooter>
  </ModalContent>
</Modal>

// ❌ WRONG — ad-hoc popup shell with its own close/header/footer layout
<div className="fixed inset-0 z-50">
  <div className="rounded-xl bg-card p-6">Custom modal</div>
</div>
```

Popup modals must use `@/components/ui/modal` so the Omnibar layout remains standard: title/header left, close button right, fixed header/footer, scrollable body, and flexible sizing only. Keep `Sheet` for slide-in panels and `Popover` for anchored non-modal disclosures.

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
