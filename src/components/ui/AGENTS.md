<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# ui

## Purpose

shadcn/ui primitive components with Campfire design system tokens applied via Tailwind CSS v4 CSS variables. Base UI layer (Button, Card, Dialog, Input, etc.) used throughout the codebase. All styled with strict design constraints: no `shadow-xl`/`shadow-2xl` (except modals), max 300ms transitions, min 11px text, proper border radii (cards `rounded-md`, buttons `rounded-sm`, modals `rounded-lg`).

## Key Files

| File | Description |
|------|-------------|
| `button.tsx` | Button primitive: variants (default, outline, secondary, ghost, destructive, warmCta, link), sizes (xs–lg, icon sizes). Uses `class-variance-authority` (CVA) for variants. |
| `card.tsx` | Card container: `shadow-none` at rest, `shadow-sm` on hover. Flexible grid layout via data-slot attributes. Supports CardHeader, CardTitle, CardContent, CardFooter. |
| `input.tsx` | Text input: base styles, focus ring, validation states (aria-invalid). No custom sizing overrides. |
| `textarea.tsx` | Multi-line text input: similar to input.tsx but taller. |
| `label.tsx` | Form label: simple text styling. Pairs with inputs via `htmlFor`. |
| `dialog.tsx` | Modal dialog: DialogRoot, DialogTrigger, DialogContent, DialogClose. Backdrops with backdrop-blur. Escape key closes. |
| `alert-dialog.tsx` | Confirmation dialog: destructive actions (delete, etc.). Button styles (cancel vs. confirm). |
| `select.tsx` | Dropdown: SelectRoot, SelectTrigger, SelectContent, SelectItem. Keyboard navigation. |
| `dropdown-menu.tsx` | Context menu: DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem. |
| `popover.tsx` | Floating popover: PopoverRoot, PopoverTrigger, PopoverContent. Auto-positioning. |
| `tooltip.tsx` | Hover/focus tooltip: TooltipRoot, TooltipTrigger, TooltipContent. Keyboard support. |
| `tabs.tsx` | Tabbed interface: TabsRoot, TabsList, TabsTrigger, TabsContent. Keyboard (arrow keys) support. |
| `progress.tsx` | Linear progress bar: `h-2` default, color via className. No animation (not animated by default). |
| `slider.tsx` | Range input: single or dual-handle. Keyboard (arrow) navigation. |
| `radio-group.tsx` | Radio button group: RadioGroupRoot, RadioGroupItem. Label association. |
| `switch.tsx` | Toggle switch: checked/unchecked states. Accessible keyboard interaction. |
| `checkbox.tsx` | Checkbox: checked/indeterminate/unchecked. Label pairing. |
| `badge.tsx` | Semantic badge: status (success, warning, error) or default. Small capsule shape. |
| `avatar.tsx` | User avatar: AvatarImage (with fallback) + AvatarFallback (initials). Circular. |
| `scroll-area.tsx` | Scrollable container: custom scrollbar styling, cross-browser. |
| `separator.tsx` | Horizontal or vertical divider line. Simple border. |
| `sheet.tsx` | Slide-out sheet (sidebar-like): SheetRoot, SheetTrigger, SheetContent. From left, right, top, bottom. |
| `command.tsx` | Command palette / search input. Filterable list. Keyboard navigation (arrow keys, Enter). |
| `calendar.tsx` | Month calendar picker: prev/next month, day selection. Used by date inputs. |
| `resizable.tsx` | Resizable panel groups: PanelGroup, Panel, PanelResizeHandle. Horizontal or vertical. |
| `input-group.tsx` | Input with icon slots: icon-start, icon-end. Wrapper div styling. |
| `skeleton.tsx` | Loading placeholder: animated shimmer. Width/height configurable via className. |
| `toast.tsx` | Toast notification: ToastRoot, ToastTitle, ToastDescription, ToastAction. Auto-dismiss. |
| `toaster.tsx` | Toast container: renders all active toasts. Usually placed in layout root. |
| `AppleCloseButton.tsx` | Custom close button: X icon from Phosphor. Used in modals, cards. |
| `SlateCampLogo.tsx` | SlateCamp logo SVG. Sized via className (e.g., size-8). |

## Subdirectories

None.

## For AI Agents

### Working In This Directory

1. **Do not modify these files unless updating design tokens.** These are foundational primitives. If a new variant is needed, discuss with design first and add via CVA (button.tsx pattern).

2. **CSS variable mapping.** All colors (text, background, border) map to Tailwind CSS v4 variables defined in tailwind.config.ts. Example: `bg-primary` → `var(--color-primary)`. Do NOT hardcode hex values in new primitives.

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

// Default (primary blue)
<Button>Click me</Button>

// Variants
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="warmCta">Action</Button>

// Sizes
<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">💡</Button>
```

**Card structure:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
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

**Input + Label:**
```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

**Tooltip:**
```tsx
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon">?</Button>
  </TooltipTrigger>
  <TooltipContent>Help text</TooltipContent>
</Tooltip>
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
| **class-variance-authority** | CVA for variant styling (button.tsx, badge.tsx, etc.) | Latest |
| **@phosphor-icons/react** | Icons (X, ChevronDown, etc.) | ^1.4.14 |
| **clsx** / **tailwind-merge** | className merging (via cn() utility) | Latest |
| **react** | Hooks, React.ReactNode types | ^19.2.4 |
| **next** | Image optimization (if used in card/avatar) | 16.1.6 |

<!-- MANUAL: -->
