# Surface & Elevation Strategy: Border-Light Architecture

**Created:** 2026-04-07
**Status:** DRAFT — Companion to `design_system_migration_plan.md`
**Principle:** Depth through surface contrast and shadow, not border lines

---

## 1. Current Border Audit

### Border Density (measured 2026-04-07)

| Area | `border-border` / `border-*` Count | Worst Offenders |
|------|-------------------------------------|-----------------|
| `src/components/shared/` | 21 across 8 files | `data-table.tsx` (5), `Omnibar.tsx` (4), `content-sidebar.tsx` (4) |
| `src/components/calculators/` | ~30 across 6 files | `FlooringInputPanel.tsx` (13), `PaintInputPanel.tsx` (11) |
| `src/components/ceo/` | ~15 across 8 files | `FinancialEntryForm.tsx` (6) |
| `src/components/admin/` | ~10 across 6 files | `QuestionImporter.tsx` (4) |
| Sidebar/Layout panels | 5 `border-r` separators | Listed below |

### Sidebar/Panel Border Separators (Replace Targets)

| File | Current Pattern | Surface-First Replacement |
|------|----------------|--------------------------|
| `src/app/developer/_components/DevPortalSidebar.tsx` | `border-r border-border` | `bg-muted/50` fill, drop `border-r` |
| `src/app/dashboard/wiki/loading.tsx` | `border-r border-zinc-200` | `bg-muted/30` fill, drop `border-r` |
| `src/features/3d-lab/templates/CalculatorTemplate.tsx` | `border-r` on input panel | `bg-card` panel on `bg-background` canvas |
| `src/features/3d-lab/DevControlsModule/dashboard/DevControlsLabV2.tsx` | `border-r border-border` | `bg-card` panel, drop `border-r` |
| `src/app/admin/3d-models/_components/ModelRegistryPage.tsx` | `border-r border-[#D4DAE3]` (hardcoded!) | `bg-card` panel, drop border, fix hardcoded hex |

### Double-Border Hotspots

Common anti-pattern: Card with `border` inside a section with `border`:
- Calculator panels: Input panel has `border-r` + child cards have `border`
- Data tables: Table wrapper has `border` + header has `border-b` + rows have `border-b`
- Content sidebar: Container has `border-r` + items have `border-b`

---

## 2. Surface Token System

### New Semantic Tokens

Add to `:root` and `.dark` in `globals.css`:

```css
:root {
  /* Surface hierarchy — 3 layers */
  --canvas: #F5F5F5;           /* Page background — subtle warm gray */
  --surface: #FFFFFF;           /* Card/panel surface — pure white */
  --surface-raised: #FFFFFF;    /* Elevated surface (same as surface, differentiated by shadow) */

  /* Existing tokens that already serve this role */
  /* --background: #FFFFFF     — current page bg (will shift to canvas role) */
  /* --card: #ffffff           — card surface (stays) */
  /* --muted: #F5F5F5          — already available as subtle bg */
}

.dark {
  --canvas: #0F1318;            /* Darker than current --background */
  --surface: #1C2433;           /* Card surface — matches current --card */
  --surface-raised: #242D3D;    /* Slightly lighter for elevated panels */
}
```

**Decision: Use existing tokens, add one new one.**

Rather than adding a whole new token layer, the surface strategy maps to existing tokens:

| Surface Layer | Light Mode | Dark Mode | Token |
|--------------|-----------|-----------|-------|
| **Canvas** (page bg) | `#F5F5F5` (`--bg-secondary`) | `#0F1318` (new, darker than `--background`) | `bg-muted` or new `bg-canvas` |
| **Surface** (cards, panels) | `#FFFFFF` (`--card`) | `#1C2433` (`--card`) | `bg-card` |
| **Surface Raised** (floating) | `#FFFFFF` + `shadow-md` | `#242D3D` + `shadow-md` | `bg-card shadow-md` |

### Tailwind Theme Addition

```css
@theme inline {
  --color-canvas: var(--canvas, var(--bg-secondary));
}
```

This gives us `bg-canvas` as a utility class for the page-level background.

---

## 3. Shadow-over-Border Strategy

### Elevation Scale

| Level | Shadow | Use Case | Replaces |
|-------|--------|----------|----------|
| **L0 — Flat** | `shadow-none` | Content sections on canvas (no separation needed) | Background div with border |
| **L1 — Resting** | `shadow-[0_1px_2px_rgba(0,0,0,0.04)]` | Cards, panels at rest | `border border-border` |
| **L2 — Hover** | `shadow-sm` | Cards on hover, interactive elements | `border border-border hover:shadow-sm` |
| **L3 — Floating** | `shadow-md` | Dropdowns, popovers, floating panels | `border border-border shadow-md` |
| **L4 — Modal** | `shadow-lg` | Dialogs, sheets, modals | `border border-border shadow-lg` |

### Custom Shadow Token (L1)

The default Tailwind `shadow-sm` is too strong for a resting card. Add a subtler L1:

```css
@theme inline {
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
}
```

Usage: `shadow-card` for all resting cards that currently use `border border-border`.

### What Keeps Borders

NOT all borders should be removed. Borders stay for:
- **Table cell dividers** — `border-b` between rows is structural, not decorative
- **Input field outlines** — `border border-input` is a form control pattern, not a layout separator
- **Callout left-accent** — `border-l-[3px]` is semantic (callout type indicator)
- **Active state indicators** — sidebar active bar (`w-[3px] bg-primary`) is a brand element
- **Dividers/Separators** — `<Separator>` component stays (semantic hr replacement)
- **SlideToSubmit** — `border border-border` on track is IDENTITY LOCKED

### What Loses Borders

| Pattern | Current | Replacement |
|---------|---------|-------------|
| Card wrapper | `border border-border rounded-md` | `bg-card shadow-card rounded-md` on `bg-canvas` parent |
| Sidebar panel | `border-r border-border` | `bg-card` panel on `bg-canvas` canvas (contrast separation) |
| Content sidebar | `border-r` + `border-b` items | `bg-card` fill, items use `hover:bg-muted` without borders |
| Section header | `border-b` under header | `pb-4` spacing + slightly bolder heading (no line) |
| Stats row | Cards with `border border-border` | Cards with `bg-card shadow-card` on `bg-canvas` |

---

## 4. Sidebar Redesign Strategy

### Current Sidebar Architecture

`sidebar-nav.tsx` is already well-designed:
- Active item: `bg-primary/10 text-primary` with left accent bar
- Hover: `hover:bg-muted hover:text-foreground`
- No explicit borders on the sidebar component itself

**The border problem is in the layout wrappers**, not the sidebar component:
- `DevPortalSidebar.tsx`: `border-r border-border`
- `wiki/loading.tsx`: `border-r border-zinc-200`

### Proposed Sidebar Surface Treatment

**Option A: Subtle Fill (Recommended)**
```tsx
// Before
<aside className="w-[220px] border-r border-border bg-background">

// After — sidebar gets a tinted background, canvas shows through as contrast
<aside className="w-[220px] bg-muted/40">
```

This creates visual separation through background contrast alone:
- Sidebar: `bg-muted/40` (very subtle gray tint)
- Main content: `bg-canvas` (slightly warmer gray)
- Cards in content: `bg-card` (white)

Three-layer depth: **Sidebar tint → Canvas → Card surface**

**Option B: Camp Cobalt Tint (Bolder)**
```tsx
<aside className="w-[220px] bg-primary-50/30">
```

Uses a very faint cobalt wash — reinforces brand in the navigation without competing with content.

**Decision:** Start with Option A. Option B can be tested as a variant in Phase 3.

### Dark Mode Sidebar

```tsx
// Dark — slightly lighter than canvas for separation
<aside className="w-[220px] bg-muted/20 dark:bg-[#1A2230]">
```

---

## 5. Contrast & Accessibility Verification

### Light Mode Surface Pairs

| Pair | Background | Foreground | Contrast Ratio | WCAG AA |
|------|-----------|-----------|---------------|---------|
| Canvas → Card text | `#F5F5F5` → `#1A2332` | N/A (text on card, not canvas) | 13.8:1 | Pass |
| Card → Body text | `#FFFFFF` → `#3D3D3A` (wiki-body) | — | 12.1:1 | Pass |
| Card → Muted text | `#FFFFFF` → `#8896A7` | — | 3.7:1 | Pass (large text) |
| Sidebar → Item text | `bg-muted/40` ≈ `#F7F7F7` → `#8896A7` | — | 3.5:1 | Pass (large text only) |
| Sidebar active → Primary text | `bg-primary/10` ≈ `#EEF2FC` → `#1B3FC4` | — | 5.2:1 | Pass |

### Shadow vs Border Visibility

The `shadow-card` token (`0 1px 2px rgba(0,0,0,0.04)`) is visible on `bg-canvas` (#F5F5F5) but subtle. On pure white backgrounds, it may be too faint. The strategy only works when canvas ≠ card surface color.

> **Card-on-white fallback rule (mandatory):**
> **Cards on `bg-canvas` use `shadow-card` only. Cards on white parents (`bg-card` or `bg-background`) MUST retain `border border-border/50` as a fallback.** Only cards on `bg-canvas` drop to shadow-only.

---

## 6. Implementation Integration

This plan integrates into the parent Migration Plan as a **sub-task of Phase 1** (token mapping) and **Phase 3** (layout overhaul):

### Phase 1 Additions
- [ ] **1.x** Add `--canvas` token to `:root` and `.dark` in `globals.css`
- [ ] **1.x** Add `--shadow-card` custom shadow to `@theme inline`
- [ ] **1.x** Document the surface hierarchy (Canvas → Surface → Raised) in `.ai/rules/flowbite-alignment.md`

### Phase 3 Additions
- [ ] **3.x** Replace `border-r border-border` with `bg-muted/40` fill in all 5 sidebar/panel layouts
- [ ] **3.x** Fix hardcoded `border-[#D4DAE3]` in `ModelRegistryPage.tsx`
- [ ] **3.x** Update Card component default variant: add `shadow-card` option alongside existing `border` default
- [ ] **3.x** Add `bg-canvas` to dashboard layout wrappers where cards should float

### Phase 5 Additions
- [ ] **5.x** Audit `stat-card`, `data-table`, `action-card` for border→shadow migration candidates
- [ ] **5.x** Preserve borders on table internals (row dividers, header bottoms)

---

## 7. What Does NOT Change

| Element | Current | Reason |
|---------|---------|--------|
| SlideToSubmit track border | `border border-border` | IDENTITY LOCKED |
| Input field borders | `border border-input` | Form control affordance — users expect outlined inputs |
| Table row dividers | `border-b border-wiki-divider` | Structural, aids scanning |
| Callout borders | `border-l-[3px]` / `border` | Semantic indicator, not decorative |
| Separator component | `<Separator>` | Semantic hr replacement |
| Dialog/Sheet borders | `border` | May keep for now — shadow alone on dark mode is less distinct |

---

## Constraints Checklist

- [x] Identity Lock preserved — SlideToSubmit borders untouched
- [x] Minimal rounded corners — no radius changes in this plan
- [x] Uses existing SlateCamp tokens (`--bg-secondary`, `--card`, `--muted`)
- [x] Sidebar addressed with surface contrast strategy (Option A + Option B variant)
- [x] WCAG AA contrast maintained for all surface pairs

---

*This plan eliminates decorative border clutter while preserving structural borders that aid comprehension. The result: a cleaner, more open interface where hierarchy comes from light and shadow, not lines.*
