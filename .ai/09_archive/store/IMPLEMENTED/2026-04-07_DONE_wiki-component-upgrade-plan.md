# Wiki Component Upgrade: Flowbite Pro Alignment

**Created:** 2026-04-07
**Status:** DRAFT — Pending review
**Parent Plan:** `design_system_migration_plan.md`
**Scope:** Wiki reading experience for 500+ deep-dive articles

---

## 1. Article Typography & Layout

### Current State (`prose-wiki` utility in `globals.css`)

The existing prose config is already well-tuned:
- **Font:** Atkinson Hyperlegible (`font-sans`) — LOCKED
- **Size:** 15px base — good for accessibility, keep
- **Line-height:** 1.7 — excellent for long-form reading, keep
- **Paragraph max-width:** `max-w-[65ch]` — optimal for readability, keep
- **Heading hierarchy:** h2 = 22px bold, h3 = 16px semibold — functional but needs refinement

### Proposed Improvements

| Element | Current | Proposed (Flowbite-aligned) | Rationale |
|---------|---------|---------------------------|-----------|
| **h2** | `text-[22px] font-bold mt-0 mb-4` | `text-[22px] font-bold first:mt-0 mt-10 mb-4 tracking-tight` | Add `mt-10` for section breathing room; `first:mt-0` prevents unnecessary top margin on first h2 after the hero; `tracking-tight` for heading density |
| **h3** | `text-base font-semibold mt-7 mb-3` | `text-lg font-semibold mt-8 mb-3` | Use standard Tailwind size for clearer hierarchy: h2=22px, h3=18px, h4=15px-semibold, body=15px |
| **h4** (new) | Not styled | `text-[15px] font-semibold mt-6 mb-2 text-foreground/80` | 500+ articles need a 4th level; slightly muted to differentiate from h3 |
| **Paragraphs** | `mb-4 last:mb-0` | Keep as-is | Already optimal |
| **Strong** | `font-semibold` | Keep as-is | Already correct weight |
| **Code inline** | `rounded-[3px] bg-muted px-[5px] text-[12px] text-primary font-dm-mono` | `rounded-xs bg-muted px-1.5 py-px text-[12.5px] text-primary font-dm-mono` | Use radius token, fractionally larger for readability |
| **Blockquotes** | Default prose | `border-l-[3px] border-primary/20 pl-4 italic text-foreground/70` | Flowbite-aligned left-border accent pattern |
| **Lists** | Default prose | `[&_li]:mb-1.5 [&_li]:leading-relaxed` | Tighter list items for 500+ article density |
| **HR** | `my-10` | `my-12 border-wiki-divider` | More breathing room between major sections |

### Reading Mode Optimization

For deep-dive articles (2000+ words), add optional `data-reading-mode` on the article container:
```css
[data-reading-mode] .prose-wiki {
  font-size: 16px;
  line-height: 1.8;
  --tw-prose-body: var(--wiki-prose-body);
}
```

---

## 2. MDX Table Transformation

### Current State (`mdx-components-shared.ts`)

Tables already have custom rendering:
- **Wrapper:** `not-prose my-4 overflow-x-auto` div
- **Table:** `w-full border-collapse text-sm`
- **thead:** `bg-muted dark:bg-wiki-surface-dark`
- **th:** DM Mono font, 10px uppercase, wiki-muted color, bottom border
- **td:** 14px, relaxed leading, wiki-body color, bottom border per row

### Gaps Identified

| Feature | Current | Flowbite Standard | Priority |
|---------|---------|------------------|----------|
| **Striped rows** | No | `even:bg-neutral-secondary-soft` / `odd:bg-neutral-primary` | P1 |
| **Hover state** | No | `hover:bg-neutral-tertiary-soft` on rows | P1 |
| **Header accent** | Muted bg | Camp Cobalt left-accent or cobalt-tinted header bg | P1 |
| **Sticky header** | No | `sticky top-0 z-10` on thead for scrollable tables | P2 |
| **Border style** | `border-collapse` | `border-separate border-spacing-0` with rounded container | P2 |
| **Responsive indicator** | No | Horizontal scroll shadow/gradient on overflow | P2 |
| **Cell alignment** | `align-top` only | Support right-align for numeric columns | P3 |

### Proposed Table Classes

Update `mdx-components-shared.ts` table mappings:

```tsx
// Table wrapper — responsive scroll with subtle overflow indicator
// data-mdx-table enables descendant-selector scoping for tr/td rules if needed
table: (props) => createElement('div', {
  className: 'not-prose my-6 overflow-x-auto rounded-md border border-wiki-border',
  'data-mdx-table': '',
}, createElement('table', {
  className: 'w-full border-separate border-spacing-0 text-sm',
  ...props,
}))

// Header — Camp Cobalt tinted background
thead: (props) => createElement('thead', {
  className: 'sticky top-0 z-10 bg-primary-50 dark:bg-primary-900/20',
  ...props,
})

// Header cells — DM Mono, uppercase, Camp Cobalt accent
th: (props) => createElement('th', {
  className: cn(
    'px-4 py-3 text-left font-dm-mono text-[10px] font-medium uppercase tracking-[0.08em]',
    'text-primary-700 dark:text-primary-300',
    'border-b border-primary-200/50 dark:border-primary-800/30',
    'first:rounded-tl-md last:rounded-tr-md',
  ),
  ...props,
})

// Body rows — striped + hover
tr: (props) => createElement('tr', {
  className: 'even:bg-muted/30 hover:bg-primary-50/50 dark:even:bg-muted/10 dark:hover:bg-primary-900/10 transition-colors duration-100',
  ...props,
})

// Body cells — refined padding, border
td: (props) => createElement('td', {
  className: cn(
    'px-4 py-3 text-sm text-wiki-body leading-relaxed align-top',
    'border-b border-wiki-divider last:[tr:last-child_&]:border-b-0',
    '[&_strong]:text-wiki-ink [&_strong]:font-semibold',
    'dark:text-wiki-invert-body dark:border-wiki-invert-divider dark:[&_strong]:text-wiki-invert-heading',
  ),
  ...props,
})
```

> **Scoping note:** This `tr` mapping applies globally to all MDX-rendered elements named `tr`. It will NOT conflict with `ComparisonTable` and `WikiExamTable` because those components render their rows via direct `React.createElement('tr', ...)` calls inside their own component bodies — they bypass the MDX component mapping entirely. Only bare markdown tables (rendered through the MDX pipeline) are affected. To make this explicit at the `table` level, the wrapper `div` receives a `data-mdx-table` attribute (added to the table mapping above) so that future CSS-only rules can use the `[data-mdx-table] tr` descendant selector if additional scoping is ever needed.

**Cross-reference:** Dashboard data-table styling (`shared/data-table.tsx`) must align with these wiki table patterns. See Migration Plan Phase 5.4.

---

## 3. Callout & Alert Blocks

### Current State (`Callout.tsx`)

The unified Callout system is already well-designed with:
- **12 variants:** note, warning, tip, example, info, danger, requirement, exam-tip, authority, most-tested, ale-watch, version-alert
- **Design-token colors** using CSS custom properties
- **Dark mode support** via token indirection
- **Dismissible support** with close button
- **Two layout modes:** icon+label (standard) and eyebrow (branded callouts)

### Gaps vs. Flowbite Alert Patterns

| Feature | Current Callout | Flowbite Alert | Action |
|---------|----------------|---------------|--------|
| **Border style** | Full border with opacity (`border-[var(--info)]/30`) | Left-accent border (`border-l-4`) option | Add `accent` variant prop for left-border style |
| **Background opacity** | CSS opacity (`bg-[var(--info)]/5`) | Named soft tokens (`bg-brand-softer`) | Keep current — our opacity approach is more flexible |
| **Icon size** | 16px (`size={16}`) | 20px (`w-5 h-5`) | Bump to 18px for better visual weight at reading distance |
| **Close button** | Exists, custom implementation | Standard dismiss pattern | Keep current — already functional |
| **Link/action support** | Not present | Optional "View more" link in alert body | Add optional `action` prop with label + href |
| **List support in body** | `[&>ol]:m-0 [&>ol]:pl-4` | Similar | Keep current — already handles nested lists |

### Proposed Changes

1. **Add `bordered` prop** — when true, uses `border-l-[3px]` accent instead of full border. This matches Flowbite's "Bordered alerts" pattern while keeping our current default.

2. **Increase icon size** from 16px to 18px for better visual weight.

3. **Add optional `action` prop** — renders a small link/button at the bottom of the callout:
   ```tsx
   interface CalloutProps {
     // ... existing props
     action?: { label: string; href?: string; onClick?: () => void }
   }
   ```

4. **Refine spacing** — `my-6` → `my-7` for standard callouts (more breathing room between article sections).

5. **Do NOT change colors** — the current variant color mapping is correct and uses design tokens.

---

## 4. Interactive Widget Containers

### Current State (Widget Registry)

18 registered widgets in `src/components/wiki/widgets/registry.ts`:

| Group | Widgets | Current Container |
|-------|---------|-------------------|
| **BP 344: Accessibility** | AccessibilityChangesTable, DoorConfigurator, CorridorVisualizer, CubicleChecker, GrabBarExplainer, RecallDrill | Per-widget (inconsistent) |
| **DSGN-013: Furniture** | BedroomPlanView, BedSizeComparator, WorkstationCalculator, DimensionDrill | Per-widget (inconsistent) |
| **DSGN-013-01: Body** | BodyDimensionExplorer, ReachEnvelopeDiagram, BodyDimensionDrill | Per-widget (inconsistent) |
| **DSGN-013-03: Spatial** | DHRatioExplorer, ProportionComparator, SpatialQualityDrill | Per-widget (inconsistent) |
| **3D Lab** | Lab3DWidget | Custom 3D container |
| **Illustrations** | PHBuildingSetbacks | SVG container |

### Proposed: Unified Widget Container

Create `src/components/wiki/widgets/WidgetContainer.tsx` — a consistent wrapper applied at the registry level:

```tsx
interface WidgetContainerProps {
  label: string        // Widget name for the eyebrow
  children: React.ReactNode
  interactive?: boolean // True = adds hover border, false = static display
}
```

**Visual pattern (Flowbite Card-aligned):**
- `rounded-md border border-border` (6px, standard card radius)
- `bg-card` background
- Eyebrow label: DM Mono 10px uppercase, muted color — matches table header style
- `p-4` internal padding (16px, Flowbite standard)
- Optional: `shadow-sm` on hover for interactive widgets
- `not-prose` to isolate from article prose styles

**Application strategy:** Wrap at the resolver level in `resolveWidgets()` so individual widget authors don't need to add container markup. The WidgetContainer is applied automatically when a widget is loaded.

---

## 5. Implementation Steps

### Phase W1: MDX Global Styles (Typography & Tables)
**Estimated scope:** 2 files changed (`globals.css`, `mdx-components-shared.ts`)
**Depends on:** Migration Plan Phase 1 (token mapping)

- [ ] **W1.1** Update `prose-wiki` h2/h3/h4 styles in `globals.css`
- [ ] **W1.2** Add blockquote styling to `prose-wiki`
- [ ] **W1.3** Refine list item spacing in `prose-wiki`
- [ ] **W1.4** Replace table element mappings in `mdx-components-shared.ts` with Flowbite-aligned classes (striped rows, hover, cobalt header, sticky thead)
- [ ] **W1.5** Add `tr` mapping to `mdx-components-shared.ts` (currently unmapped — rows have no hover/stripe classes)
- [ ] **W1.6** Test table rendering with 5+ representative wiki articles containing tables

**Validation:** Visual comparison of 3 table-heavy articles before/after

### Phase W2: Callout Refinement
**Estimated scope:** 1 file changed (`Callout.tsx`)

- [ ] **W2.1** Add `bordered` prop for left-accent variant
- [ ] **W2.2** Increase icon size from 16px to 18px
- [ ] **W2.3** Add `action` prop support
- [ ] **W2.4** Adjust outer margin from `my-6` to `my-7`
- [ ] **W2.5** Update Callout Storybook stories to showcase new props

**Validation:** `bun run build-storybook` passes, callout stories render correctly

### Phase W3: Widget Container & TOC
**Estimated scope:** 2 new files, ~19 modified files (registry.ts + 18 widget files for container extraction)

- [ ] **W3.0** Strip outermost container markup from all 18 widgets before integrating WidgetContainer. Each widget currently owns its own border, padding, and border-radius — these must be extracted so WidgetContainer becomes the single source of that chrome. Without this step, wrapping at the resolver level produces double borders and double padding.
- [ ] **W3.1** Create `src/components/wiki/widgets/WidgetContainer.tsx`
- [ ] **W3.2** Integrate WidgetContainer into `resolveWidgets()` in `registry.ts`
- [ ] **W3.3** Add WidgetContainer Storybook story
- [ ] **W3.4** Test with 3 widget-heavy articles to verify container consistency
- [ ] **W3.5** Verify TOC anchor links still work with updated heading margins

**Validation:** Widget-heavy articles render consistently, no layout regressions

---

## Constraints Checklist

- [ ] Minimal rounded corners: All wiki elements use `rounded-md` (6px max for cards) or `rounded-sm` (4px for inline) — never exceeds 8px. **Requires normalizing existing widget border-radius from `rounded-lg`/`rounded-[10px]` to `rounded-md` as part of W3.0.** (14 occurrences found across the 18 registered widgets.)
- [x] Camp Cobalt accent: Table headers use `bg-primary-50` / `text-primary-700` — our cobalt tokens
- [x] Reading experience focus: All changes optimize for deep-dive 2000+ word articles
- [x] Atkinson Hyperlegible preserved: No font changes anywhere
- [x] No new dependencies: All changes are CSS/Tailwind class updates and React component refinements

---

*This plan extends the parent Design System Migration Plan with wiki-specific upgrades. It can run independently as a sub-project of Phase 5 (Feedback & Data Display).*
