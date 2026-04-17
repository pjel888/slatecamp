> Legacy rule document
> Preserved from the old `.ai/rules/` entrypoint.
> Active governance docs now live in `../`.

# Flowbite Pro v3.1 → SlateCamp Alignment Reference

**Source:** `design_system_migration_plan.md`, `surface_hierarchy_plan.md`
**Last Verified:** 2026-04-07
**Applies To:** All agents building or modifying UI components during design system migration

---

## Color Token Mapping

### Flowbite MCP Token → SlateCamp Token

When adapting Flowbite patterns from `flowbite/flowbite-mcp-pro-1.0.0/data/`, replace tokens as follows:

| Flowbite MCP Token | SlateCamp Tailwind Class | CSS Variable |
|---------------------|------------------------|-------------|
| `text-fg-brand-strong` | `text-primary-700` | `--primary-700` |
| `text-fg-brand` | `text-primary` | `--primary` |
| `text-fg-brand-subtle` | `text-primary-300` | `--primary-300` |
| `bg-brand-softer` | `bg-primary-50` | `--primary-50` |
| `bg-brand-soft` | `bg-primary-100` | `--primary-100` |
| `bg-brand` | `bg-primary` | `--primary` |
| `bg-brand-medium` | `bg-primary-200` | `--primary-200` |
| `bg-brand-strong` | `bg-primary-800` | `--primary-800` |
| `border-brand-subtle` | `border-primary-200` | `--primary-200` |
| `border-brand-light` | `border-primary-600` | `--primary-600` |
| `text-fg-danger-strong` | `text-destructive-700` | `--destructive-700` |
| `text-fg-danger` | `text-destructive` | `--destructive` |
| `bg-danger-soft` | `bg-destructive-50` | `--destructive-50` |
| `bg-danger` | `bg-destructive` | `--destructive` |
| `border-danger-subtle` | `border-destructive-200` | `--destructive-200` |
| `text-fg-success-strong` | `text-success-700` | `--success-700` |
| `text-fg-success` | `text-success` | `--success` |
| `bg-success-soft` | `bg-success-50` | `--success-50` |
| `bg-success` | `bg-success` | `--success` |
| `border-success-subtle` | `border-success-200` | `--success-200` |
| `text-fg-warning` | `text-warning` | `--warning` |
| `text-fg-warning-subtle` | `text-warning-400` | `--warning-400` |
| `bg-warning-soft` | `bg-warning-50` | `--warning-50` |
| `bg-warning` | `bg-warning` | `--warning` |
| `border-warning-subtle` | `border-warning-200` | `--warning-200` |
| `text-heading` | `text-foreground` | `--foreground` |
| `text-body` | `text-foreground` | `--foreground` |
| `text-body-subtle` | `text-muted-foreground` | `--muted-foreground` |
| `bg-neutral-primary` | `bg-card` | `--card` |
| `bg-neutral-primary-soft` | `bg-background` | `--background` |
| `bg-neutral-secondary-soft` | `bg-muted` | `--muted` |
| `bg-neutral-secondary` | `bg-muted` | `--muted` |
| `bg-neutral-secondary-medium` | `bg-muted` | `--muted` |
| `bg-neutral-secondary-strongest` | `bg-muted` | `--muted` |
| `bg-neutral-tertiary-soft` | `bg-muted` | `--muted` |
| `bg-neutral-tertiary` | `bg-muted` | `--muted` |
| `border-default` | `border-border` | `--border` |
| `border-default-medium` | `border-border` | `--border` |
| `border-default-subtle` | `border-border` | `--border` |
| `text-fg-disabled` | `text-muted-foreground` | `--muted-foreground` |
| `bg-disabled` | `bg-muted` | `--muted` |

**Note:** Flowbite has 3 neutral background tiers (secondary-soft, secondary-medium, tertiary) that all collapse to SlateCamp's `bg-muted`. Visual hierarchy between these is maintained through spacing and shadow, not background color distinction.

### Flowbite Role → SlateCamp Semantic Role

| Flowbite Role | SlateCamp Token | Hex (Light) | Hex (Dark) |
|---------------|----------------|-------------|------------|
| `primary` / `brand` | `--primary` (Camp Cobalt) | `#1B3FC4` | `#5B7FE0` |
| `secondary` | `--secondary` | `#F5F5F5` | `#1C2433` |
| `green` / `success` | `--success` (Emerald) | `#2D9F6F` | `#4DBF8F` |
| `red` / `danger` | `--destructive` (Warm Red) | `#D64545` | `#E85C5C` |
| `yellow` / `warning` | `--warning` (Amber) | `#D4951A` | `#E8B040` |
| `dark` | `--foreground` (Ink Primary) | `#1A2332` | `#E8ECF1` |
| `gray` | `--muted-foreground` | `#8896A7` | `#8896A7` |
| `blue` | `--primary` (Camp Cobalt) | `#1B3FC4` | `#5B7FE0` |

---

## Border Radius Mapping

| Flowbite Token | Flowbite Value | SlateCamp Replacement | SlateCamp Value |
|----------------|---------------|----------------------|-----------------|
| `rounded-0` | 0px | `rounded-none` | 0px |
| `rounded-xxs` | 2px | `rounded-xs` | 2px |
| `rounded-xs` | 4px | `rounded-sm` | 4px |
| `rounded-sm` | 6px | `rounded-md` | 6px |
| `rounded` / `rounded-base` | 8–12px | `rounded-sm` | 4px |
| `rounded-lg` | 16px | `rounded-md` | 6px (general) or `rounded-lg` 8px (modals/dialogs only) |
| `rounded-full` | 9999px | `rounded-full` | 9999px (avatars, pills only) |

**Rule:** No component may exceed `rounded-lg` (8px). Use `rounded-lg` ONLY for modals and dialogs. Use `rounded-md` (6px) for cards. Use `rounded-sm` (4px) for buttons, inputs, badges.

---

## Spacing Standards

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-section` | `1.5rem` (24px) | Section padding in layouts |
| `--spacing-card` | `1rem` (16px) | Card internal padding |
| `--spacing-card-lg` | `1.5rem` (24px) | Large card padding |
| `--spacing-form-gap` | `1rem` (16px) | Gap between form fields |
| `--spacing-inline` | `0.5rem` (8px) | Inline element gap |

**Grid:** 4px base grid. All spacing should be multiples of 4px.

---

## Shadow & Elevation Hierarchy

| Level | Token / Class | Value | Use Case |
|-------|--------------|-------|----------|
| **L0 — Flat** | `shadow-none` | none | Content sections on canvas (no separation needed) |
| **L1 — Resting** | `shadow-card` | `0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)` | Cards, panels at rest on `bg-canvas` |
| **L2 — Hover** | `shadow-sm` | Tailwind default | Cards on hover, interactive elements |
| **L3 — Floating** | `shadow-md` | Tailwind default | Dropdowns, popovers, floating panels |
| **L4 — Modal** | `shadow-lg` | Tailwind default | Dialogs, sheets, modals |

### Card-on-White Fallback Rule (Mandatory)

**Cards on `bg-canvas` use `shadow-card` only.** Cards on white parents (`bg-card` or `bg-background`) MUST retain `border border-border/50` as a fallback. Shadow-only separation only works when canvas != card surface color.

---

## Surface Hierarchy

| Surface Layer | Light Mode | Dark Mode | Token |
|--------------|-----------|-----------|-------|
| **Canvas** (page bg) | `#F5F5F5` | `#0F1318` | `bg-canvas` |
| **Surface** (cards, panels) | `#FFFFFF` | `#1C2433` | `bg-card` |
| **Surface Raised** (floating) | `#FFFFFF` + `shadow-md` | `#242D3D` + `shadow-md` | `bg-card shadow-md` |

---

## Transition & Animation Standards

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| **Default** | `duration-150` | `ease-out` | Button hover, input focus, card hover |
| **Emphasis** | `duration-200` | `ease-out` | Sidebar expand, tab switch, accordion |
| **Slow** | `duration-300` | `ease-out` | Modal enter/exit, sheet slide, page transitions |

**Maximum duration:** 300ms. Never exceed.
**Prohibited easing:** `ease-bounce`, `ease-spring`, `ease-in-out` — except identity-locked components (SlideToSubmit uses `cubic-bezier(0.34, 1.56, 0.64, 1)` by exemption).

---

## Icon Sizing Standards

| Context | Size | Tailwind Class |
|---------|------|---------------|
| Small (buttons xs/sm, badges) | 14px | `w-3.5 h-3.5` |
| Default (buttons md, nav items) | 16px | `w-4 h-4` |
| Medium (sidebar, section headers) | 20px | `w-5 h-5` |
| Large (empty states, heroes) | 24px | `w-6 h-6` |

---

## Flowbite React Import Replacement

When adapting React blocks from `flowbite/flowbite-react-blocks-1.8.0-beta/`:

| Flowbite React Import | SlateCamp Replacement |
|-----------------------|----------------------|
| `Button` | `@/components/ui/button` |
| `TextInput` | `@/components/ui/input` |
| `Label` | `@/components/ui/label` |
| `Checkbox` | `@/components/ui/checkbox` |
| `Table` | `@/components/ui/table` (Phase 2) |
| `Pagination` | `@/components/ui/pagination` (Phase 2) |
| `Dropdown` | `@/components/ui/dropdown-menu` |
| `Breadcrumb` | `@/components/ui/breadcrumb` (Phase 2) |
| `Badge` | `@/components/ui/badge` |
| `Modal` | `@/components/ui/dialog` |
| `Drawer` | `@/components/ui/sheet` |
| `Tabs` | `@/components/ui/tabs` |
| `Accordion` | `@/components/ui/accordion` |
| `Tooltip` | `@/components/ui/tooltip` |
| `Spinner` | `@/components/ui/spinner` |
| `Avatar` | `@/components/ui/avatar` |
| `Progress` | `@/components/ui/progress` |
| `Select` | `@/components/ui/select` |
| `Textarea` | `@/components/ui/textarea` |
| `theme` / `twMerge` | `cn()` from `@/lib/utils` |

---

## Extraction Protocol (6 Steps)

When building any component from Flowbite reference:

1. **Read** the Flowbite `.md` pattern from `flowbite/flowbite-mcp-pro-1.0.0/data/`
2. **Strip** all `flowbite-react` imports — replace with SlateCamp primitives per table above
3. **Map colors** — replace all Flowbite tokens with SlateCamp tokens per the cheatsheet above
4. **Cap radius** — replace `rounded-base`/`rounded-lg` with `rounded-sm` (4px) or `rounded-md` (6px). Only modals get `rounded-lg` (8px)
5. **Add data-slot + CVA** — wrap in class-variance-authority definition with `data-slot` attributes
6. **Verify dark mode** — ensure all colors use CSS custom properties that have `.dark` overrides

---

## Identity-Locked Tokens

The following CSS variables are used by `SlideToSubmit.tsx` and MUST NOT be modified during migration:

| Token | Current Value (Light) | Used By |
|-------|----------------------|---------|
| `--primary` | `#1B3FC4` | `text-primary`, `bg-primary/10`, `border-primary`, `border-primary/20`, `border-t-primary` |
| `--primary-50` | `#EEF2FC` | `bg-primary-50` |
| `--surface-light` | `#F8F7F5` | `bg-surface-light` |
| `--border` | `#D4DAE3` | `border-border` |

These tokens are implicitly locked — the migration plan does not modify them. Any future phase that needs to change these values must re-verify SlideToSubmit and RevealBlock appearance first.

---

*This document is the single source of truth for Flowbite → SlateCamp translation. All agents executing Phases 2–6 must reference this file.*
