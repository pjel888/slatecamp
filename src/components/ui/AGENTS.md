<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# ui

## Purpose

shadcn/ui primitive components with Campfire design system tokens applied via Tailwind CSS v4 CSS variables. Base UI layer (Button, Card, Dialog, Input, etc.) used throughout the codebase. All styled with strict design constraints: no `shadow-xl`/`shadow-2xl` (except modals), max 300ms transitions, min 11px text, proper border radii (cards `rounded-md`, buttons `rounded-sm`, modals `rounded-lg`).

## Key Files

| File | Description |
|------|-------------|
| `button.tsx` | Button primitive: variants (default, outline, secondary, ghost, destructive, warmCta, link), sizes (xs-lg, icon sizes). Uses `class-variance-authority` (CVA). |
| `card.tsx` | Card container: `shadow-none` at rest, `shadow-sm` on hover. Supports CardHeader, CardTitle, CardContent, CardFooter via data-slot. |
| `input.tsx` | Text input: base styles, focus ring, validation states (aria-invalid). |
| `textarea.tsx` | Multi-line text input. |
| `label.tsx` | Form label: pairs with inputs via `htmlFor`. |
| `dialog.tsx` | Modal dialog: DialogRoot, DialogTrigger, DialogContent, DialogClose. Backdrop with blur. Escape closes. |
| `alert-dialog.tsx` | Confirmation dialog for destructive actions. |
| `select.tsx` | Dropdown: SelectRoot, SelectTrigger, SelectContent, SelectItem. Keyboard navigation. |
| `dropdown-menu.tsx` | Context menu: DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem. |
| `popover.tsx` | Floating popover: PopoverRoot, PopoverTrigger, PopoverContent. Auto-positioning. |
| `tooltip.tsx` | Hover/focus tooltip with keyboard support. |
| `tabs.tsx` | Tabbed interface with keyboard (arrow keys) support. |
| `progress.tsx` | Linear progress bar. |
| `progress-bar.tsx` | Alternative progress bar component. |
| `slider.tsx` | Range input: single or dual-handle. |
| `radio-group.tsx` | Radio button group with label association. |
| `switch.tsx` | Toggle switch: checked/unchecked states. |
| `checkbox.tsx` | Checkbox: checked/indeterminate/unchecked. Label pairing. |
| `badge.tsx` | Semantic badge: status (success, warning, error) or default. |
| `avatar.tsx` | User avatar: AvatarImage (with fallback) + AvatarFallback (initials). |
| `scroll-area.tsx` | Scrollable container with custom scrollbar styling. |
| `separator.tsx` | Horizontal or vertical divider line. |
| `sheet.tsx` | Slide-out sheet: SheetRoot, SheetTrigger, SheetContent. From left, right, top, bottom. |
| `command.tsx` | Command palette / search input. Filterable list with keyboard navigation. |
| `calendar.tsx` | Month calendar picker. |
| `resizable.tsx` | Resizable panel groups: PanelGroup, Panel, PanelResizeHandle. |
| `input-group.tsx` | Input with icon slots: icon-start, icon-end. |
| `skeleton.tsx` | Loading placeholder with animated shimmer. |
| `toast.tsx` | Toast notification: ToastRoot, ToastTitle, ToastDescription, ToastAction. Auto-dismiss. |
| `toaster.tsx` | Toast container: renders all active toasts. |
| `accordion.tsx` | Accordion component. |
| `close-button.tsx` | Reusable close button with X icon. |
| `difficulty-bar.tsx` | Visual difficulty indicator bar (1-5 scale). |
| `event-badge.tsx` | Event/activity type badge. |
| `eyebrow.tsx` | Eyebrow text component (small uppercase label above titles). |
| `form-field.tsx` | Form field wrapper with label, input, error message. |
| `icon-button.tsx` | Icon-only button variant. |
| `mode-button.tsx` | Test mode selection button. |
| `status-badge.tsx` | Status indicator badge with semantic colors. |
| `student-view-watermark.tsx` | Watermark overlay for student preview mode. |
| `toolbar.tsx` | Generic toolbar component. |
| `SlateCampLogo.tsx` | SlateCamp logo SVG. Sized via className. |

## Subdirectories

None. All UI primitives are flat in `src/components/ui/`.

## For AI Agents

### Working In This Directory

1. **Do not modify these files unless updating design tokens.** These are foundational primitives. If a new variant is needed, discuss with design first and add via CVA (button.tsx pattern).

2. **CSS variable mapping.** All colors (text, background, border) map to Tailwind CSS v4 variables defined in tailwind.config.ts. Example: `bg-primary` maps to `var(--color-primary)`. Do NOT hardcode hex values in new primitives.

3. **Accessibility mandatory.**
   - All interactive elements must be keyboard-accessible (tab, arrow keys, Enter, Escape).
   - Use semantic HTML (button, input, label, dialog, etc.).
   - ARIA attributes (aria-label, aria-expanded, aria-invalid) where needed.

4. **Transitions must respect prefers-reduced-motion.** Use Tailwind `data-[state=open]:animate-*` with conditional logic, or CSS media queries.

5. **No custom Campfire logic.** These are unstyled headless components with Campfire tokens baked in. Business logic (quiz, analytics) belongs in domain-specific components (quiz/, analytics/).

### Common Patterns

**Using button variants:**
```tsx
import { Button } from '@/components/ui/button'

<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="warmCta">Action</Button>
<Button size="xs">Extra small</Button>
<Button size="icon">Icon</Button>
```

**Card structure:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

**Dialog with form:**
```tsx
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogTitle>Confirm</DialogTitle>
    <DialogDescription>Are you sure?</DialogDescription>
    <form onSubmit={handleSubmit}>
      <Button type="submit">Confirm</Button>
    </form>
  </DialogContent>
</Dialog>
```

**Eyebrow label:**
```tsx
import { Eyebrow } from '@/components/ui/eyebrow'

<Eyebrow>Section Label</Eyebrow>
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/utils` | cn() for merging classNames |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **@base-ui/react** | Unstyled headless components (Button, Dialog, Popover, etc.) | ^1.2.0 |
| **class-variance-authority** | CVA for variant styling (button.tsx, badge.tsx, etc.) | latest |
| **@phosphor-icons/react** | Icons (X, ChevronDown, etc.) | ^1.4.14 |
| **lucide-react** | Some icons in newer components | ^0.577.0 |
| **clsx** / **tailwind-merge** | className merging (via cn() utility) | latest |
| **react** | Hooks, React.ReactNode types | ^19.2.4 |
| **next** | Image optimization (if used in card/avatar) | 16.1.6 |

<!-- MANUAL: -->
