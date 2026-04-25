# Component Library

**Status:** Active
**Analysis Date:** 2026-04-06
**Source:** `src/components/ui/`

## Overview

The UI component library at `src/components/ui/` provides 43 shadcn/ui primitive components styled with the SlateCamp design system. All components use Tailwind CSS v4 CSS variables and follow strict design constraints.

## Component Inventory

### Layout Primitives

| Component | File | Variants | Notes |
|-----------|------|----------|-------|
| **Card** | `card.tsx` | default, interactive, selected, accent-left, feature, ghost | Uses CVA. `shadow-none` at rest, `shadow-sm` on hover for interactive. Supports CardHeader, CardTitle, CardContent, CardFooter, CardAction, CardDescription via `data-slot`. |
| **Sheet** | `sheet.tsx` | — | Slide-out panel from left/right/top/bottom |
| **Separator** | `separator.tsx` | — | Horizontal or vertical divider |
| **ScrollArea** | `scroll-area.tsx` | — | Custom scrollbar styling |
| **Resizable** | `resizable.tsx` | — | PanelGroup, Panel, PanelResizeHandle |

### Form Controls

| Component | File | Variants | Notes |
|-----------|------|----------|-------|
| **Button** | `button.tsx` | primary, default, secondary, outline, ghost, subtle, destructive, link, success, warmCta | CVA variants. Sizes: xs, sm, md, lg, icon. Uses `@base-ui/react/button`. |
| **Input** | `input.tsx` | size: sm, md, lg | Uses `@base-ui/react/input`. SearchInput composite with debounce, clear, loading states. |
| **Textarea** | `textarea.tsx` | — | Multi-line text input |
| **Select** | `select.tsx` | — | SelectRoot, SelectTrigger, SelectContent, SelectItem |
| **Checkbox** | `checkbox.tsx` | — | Checked/indeterminate/unchecked states |
| **RadioGroup** | `radio-group.tsx` | — | Label association for accessibility |
| **Switch** | `switch.tsx` | — | Toggle switch |
| **Slider** | `slider.tsx` | — | Single or dual-handle range |
| **InputGroup** | `input-group.tsx` | — | Input with icon slots (icon-start, icon-end) |
| **FormField** | `form-field.tsx` | — | Wrapper with label, input, error message |
| **Label** | `label.tsx` | — | Pairs with inputs via `htmlFor` |

### Feedback & Status

| Component | File | Variants | Notes |
|-----------|------|----------|-------|
| **Badge** | `badge.tsx` | 10 color variants + 4 sizes + 2 shapes | CVA. Includes StatusBadge, VerificationBadge, DifficultyBadge, SessionModeBadge, MasteryBadge presets. |
| **Progress** | `progress.tsx` | — | Linear progress bar |
| **ProgressBar** | `progress-bar.tsx` | — | Alternative progress bar |
| **Skeleton** | `skeleton.tsx` | — | Loading placeholder with shimmer |
| **Spinner** | `spinner.tsx` | — | Loading indicator |
| **Toast** | `toast.tsx` | — | ToastRoot, ToastTitle, ToastDescription, ToastAction |
| **Toaster** | `toaster.tsx` | — | Toast container |

### Navigation & Overlays

| Component | File | Variants | Notes |
|-----------|------|----------|-------|
| **Dialog** | `dialog.tsx` | — | DialogRoot, DialogTrigger, DialogContent, DialogClose. Backdrop blur, Escape closes. |
| **AlertDialog** | `alert-dialog.tsx` | — | Confirmation dialog for destructive actions |
| **Popover** | `popover.tsx` | — | PopoverRoot, PopoverTrigger, PopoverContent. Auto-positioning. |
| **Tooltip** | `tooltip.tsx` | — | Hover/focus tooltip with keyboard support |
| **DropdownMenu** | `dropdown-menu.tsx` | — | DropdownMenuRoot, Trigger, Content, Item |
| **Tabs** | `tabs.tsx` | — | Keyboard navigation (arrow keys) |
| **Accordion** | `accordion.tsx` | — | Collapsible sections |
| **Toolbar** | `toolbar.tsx` | — | Generic toolbar component |
| **Command** | `command.tsx` | — | Command palette with search/filter |

### Data Display

| Component | File | Variants | Notes |
|-----------|------|----------|-------|
| **Avatar** | `avatar.tsx` | — | AvatarImage with fallback, AvatarFallback (initials) |
| **Calendar** | `calendar.tsx` | — | Month calendar picker |
| **CloseButton** | `close-button.tsx` | — | Reusable close button with X icon |
| **Eyebrow** | `eyebrow.tsx` | — | Small uppercase label above titles |

## Design Token Mapping

All components use CSS variables from `src/app/globals.css`. Never hardcode hex values.

| Token | CSS Variable | Usage |
|-------|-------------|-------|
| Camp Cobalt | `var(--color-primary)` | `bg-primary`, `text-primary` |
| Surface Light | `var(--color-background)` | `bg-background` |
| Ink Primary | `var(--color-foreground)` | `text-foreground` |
| Border | `var(--color-border)` | `border-border` |
| Ink Secondary | `var(--color-text-secondary)` | `text-text-secondary` |
| Ink Tertiary | `var(--color-muted-foreground)` | `text-muted-foreground` |

## Styling Constraints

| Property | Allowed | Forbidden |
|----------|---------|-----------|
| **Border radius** | `rounded-sm` (buttons/inputs), `rounded-md` (cards), `rounded-lg` (modals) | `rounded-xl`, `rounded-2xl` |
| **Shadows** | `shadow-sm` (hover), `shadow-md` (dropdowns), `shadow-lg` (modals) | `shadow-xl`, `shadow-2xl` on non-modals |
| **Transitions** | Max 300ms, `duration-150 ease-out` default | `bounce`, `spring`, `duration-500+` |
| **Minimum text** | 11px (`text-[11px]`) | 8px, 9px, 10px |

## Accessibility Requirements

All interactive components must be:
- Keyboard-accessible (tab, arrow keys, Enter, Escape)
- Use semantic HTML
- Include ARIA attributes where needed (`aria-label`, `aria-expanded`, `aria-invalid`)
- Respect `prefers-reduced-motion`

## Common Patterns

### Using Button
```tsx
import { Button } from '@/components/ui/button'

<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="warmCta">Warm CTA</Button>
<Button size="xs">Extra small</Button>
<Button size="icon">Icon</Button>
```

### Using Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

### Using Badge Presets
```tsx
import { StatusBadge, DifficultyBadge, SessionModeBadge } from '@/components/ui/badge'

<StatusBadge status="published" />
<DifficultyBadge level="intermediate" />
<SessionModeBadge mode="camp" />
```

## Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `@base-ui/react` | ^0.9.5 | Headless primitives (Button, Input, Dialog, etc.) |
| `class-variance-authority` | latest | CVA for variant styling |
| `@phosphor-icons/react` | ^2.1.10 | Icons (X, ChevronDown, Check, etc.) |
| `lucide-react` | ^0.577.0 | Some icons in newer components |
| `@radix-ui/react-slot` | latest | Slot pattern for polymorphic components |

---

*Component library survey: 2026-04-06*
