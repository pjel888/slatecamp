# Developer Hub Sidebar & Polish Overhaul — Design Spec

**Date:** 2026-03-25
**Status:** Approved (rev 2 — critic feedback incorporated)
**Scope:** Sidebar restructure, component registry expansion, 3 polish items

---

## 1. Sidebar Restructure

### Problem

The current sidebar has 10 top-level nav groups. The four design system domain groups (Wiki Article, Question & Q&A, Review & Testing Path, System / Shared) are each their own top-level section containing a single expandable item. This wastes vertical space, fragments the design system, and violates the progressive disclosure principle from the UX research blueprint.

### Solution

Collapse 10 groups into 5. Move all component domains under a single "Design System" parent group. Add two new domains for content blocks and interactive widgets.

### New Sidebar Structure

```
PORTAL
  Overview

DESIGN SYSTEM
  Overview
  ▸ Wiki Article (5)
      WikiCard, ArticleRenderer, TableOfContents, BreadcrumbNav, TagBadge
  ▸ Content Blocks (11)
      InlineQuiz, FormulaBlock, ExamTip, ProcessFlow, WikiComparisonTable,
      LawCallout, AlertBox, Accordion, TeachBackPrompt,
      ElaborativeInterrogation, KeyValues
  ▸ Interactive Widgets (17)
      DoorConfigurator, CorridorVisualizer, CubicleChecker,
      GrabBarExplainer, RecallDrill, BP344Comparison,
      WorkstationCalculator, ReachEnvelopeDiagram,
      BedroomPlanView, BedSizeComparator, BodyDimensionExplorer,
      DHRatioExplorer, ProportionComparator, DimensionDrill,
      SpatialQualityDrill, BodyDimensionDrill, PHBuildingSetbacks
  ▸ Question & Q&A (5)
      QuestionCard, AnswerOption, RationalePanel, DifficultyBadge, SessionTimer
  ▸ Testing Path (5)
      ReadinessRing, MasteryBar, HeatmapGrid, TrailProgressCard, SubjectPill
  ▸ System / Shared (6)
      Button, Badge, Card, Tooltip, Skeleton, EmptyState

DOCUMENTATION
  API Reference
  Architecture

STATUS
  Overview
  Database
  Infrastructure

TOOLS
  Dev Tools
  Console
  Database Browser
  Audit Logs
  Test Data
```

**Naming collision note:** There are two `ComparisonTable` components — one in `src/components/wiki/ComparisonTable.tsx` (content block, generic) and one in `src/components/wiki/widgets/bp344/ComparisonTable.tsx` (interactive widget, BP-344 specific). They are registered with distinct slugs and display names: `WikiComparisonTable` vs `BP344Comparison`.

### Data Structure Changes

**File:** `src/app/developer/_components/DevPortalShell.tsx`

The `devNavItems` array restructures from 10 NavGroups to 5. The "Design System" group contains one Overview link plus 6 expandable NavItems (one per domain), each with children for the components in that domain. The Interactive Widgets children are flat — law code grouping (BP-344, DSGN-013) is shown as section labels on the widgets index page, NOT as nav hierarchy.

### PortalSidebar Component

**File:** `src/components/portal/PortalSidebar.tsx`

The component already supports group → item → children nesting. No structural changes needed. The search filter works with the new structure since it filters by label at all levels.

### MobileNav Component

**File:** `src/components/portal/MobileNav.tsx`

Currently expands children only when the parent link is active (`{item.children && active &&`). With 6 expandable domains under Design System, mobile UX needs updating: add the same `manualToggle` expand/collapse behavior from PortalSidebar so users can browse component lists without navigating to the parent first. Share the toggle pattern but keep Sheet drawer behavior.

---

## 2. Component Registry Expansion

### New Domains

Add two new domain values to `ComponentMeta.domain` union type:
- `'content-blocks'` — Pedagogical MDX blocks embedded in wiki articles
- `'widgets'` — Interactive per-law visualizers and calculators

### Type Changes

**File:** `src/types/developer.ts`

```typescript
// Update domain union
domain: 'wiki' | 'questions' | 'testing-path' | 'shared' | 'content-blocks' | 'widgets'

// Add law group as union type (not string)
lawGroup?: 'BP-344' | 'DSGN-013' | 'PD-1096'
```

### DOMAIN_LABELS Update

**File:** `src/lib/developer/componentRegistry.ts`

Add to the existing `DOMAIN_LABELS` map:
```typescript
'content-blocks': 'Content Blocks',
'widgets': 'Interactive Widgets',
```

This is used by DevPortalSearch (command palette) and Breadcrumbs for human-readable group names. Without it, new domains display raw keys like "content-blocks".

### New Registry Entries

**File:** `src/lib/developer/componentRegistry.ts`

Add ~27 new entries. All file paths below are FULL paths from project root.

**Content Blocks (domain: 'content-blocks'):**
| Slug | Title | Source File |
|------|-------|------------|
| inline-quiz | InlineQuiz | src/components/wiki/InlineQuiz.tsx |
| formula-block | FormulaBlock | src/components/wiki/FormulaBlock.tsx |
| exam-tip | ExamTip | src/components/wiki/ExamTip.tsx |
| process-flow | ProcessFlow | src/components/wiki/ProcessFlow.tsx |
| wiki-comparison-table | WikiComparisonTable | src/components/wiki/ComparisonTable.tsx |
| law-callout | LawCallout | src/components/wiki/LawCallout.tsx |
| alert-box | AlertBox | src/components/wiki/AlertBox.tsx |
| accordion | Accordion | src/components/wiki/Accordion.tsx |
| teach-back-prompt | TeachBackPrompt | src/components/wiki/TeachBackPrompt.tsx |
| elaborative-interrogation | ElaborativeInterrogation | src/components/wiki/ElaborativeInterrogation.tsx |
| key-values | KeyValues | src/components/wiki/KeyValues.tsx |

**Interactive Widgets (domain: 'widgets'):**
| Slug | Title | Source File | Law Group |
|------|-------|------------|-----------|
| door-configurator | DoorConfigurator | src/components/wiki/widgets/bp344/DoorConfigurator.tsx | BP-344 |
| corridor-visualizer | CorridorVisualizer | src/components/wiki/widgets/bp344/CorridorVisualizer.tsx | BP-344 |
| cubicle-checker | CubicleChecker | src/components/wiki/widgets/bp344/CubicleChecker.tsx | BP-344 |
| grab-bar-explainer | GrabBarExplainer | src/components/wiki/widgets/bp344/GrabBarExplainer.tsx | BP-344 |
| recall-drill | RecallDrill | src/components/wiki/widgets/bp344/RecallDrill.tsx | BP-344 |
| bp344-comparison | BP344Comparison | src/components/wiki/widgets/bp344/ComparisonTable.tsx | BP-344 |
| workstation-calculator | WorkstationCalculator | src/components/wiki/widgets/dsgn013/WorkstationCalculator.tsx | DSGN-013 |
| reach-envelope-diagram | ReachEnvelopeDiagram | src/components/wiki/widgets/dsgn013/ReachEnvelopeDiagram.tsx | DSGN-013 |
| bedroom-plan-view | BedroomPlanView | src/components/wiki/widgets/dsgn013/BedroomPlanView.tsx | DSGN-013 |
| bed-size-comparator | BedSizeComparator | src/components/wiki/widgets/dsgn013/BedSizeComparator.tsx | DSGN-013 |
| body-dimension-explorer | BodyDimensionExplorer | src/components/wiki/widgets/dsgn013/BodyDimensionExplorer.tsx | DSGN-013 |
| dh-ratio-explorer | DHRatioExplorer | src/components/wiki/widgets/dsgn013/DHRatioExplorer.tsx | DSGN-013 |
| proportion-comparator | ProportionComparator | src/components/wiki/widgets/dsgn013/ProportionComparator.tsx | DSGN-013 |
| dimension-drill | DimensionDrill | src/components/wiki/widgets/dsgn013/DimensionDrill.tsx | DSGN-013 |
| spatial-quality-drill | SpatialQualityDrill | src/components/wiki/widgets/dsgn013/SpatialQualityDrill.tsx | DSGN-013 |
| body-dimension-drill | BodyDimensionDrill | src/components/wiki/widgets/dsgn013/BodyDimensionDrill.tsx | DSGN-013 |
| ph-building-setbacks | PHBuildingSetbacks | src/components/interactive-illustrations/2D/SetbackIllustration.tsx | PD-1096 |

### New Dynamic Routes

**Files to create:**
- `src/app/developer/design-system/content-blocks/[component]/page.tsx` — dynamic route with `generateStaticParams`
- `src/app/developer/design-system/content-blocks/[component]/loading.tsx` — skeleton loader
- `src/app/developer/design-system/widgets/[component]/page.tsx` — dynamic route with `generateStaticParams`
- `src/app/developer/design-system/widgets/[component]/loading.tsx` — skeleton loader

Each `page.tsx` must export `generateStaticParams` returning all slugs for its domain (same pattern as existing wiki/[component]/page.tsx line 239).

### Preview Data Strategy

**Important:** Each component page requires manually authored preview data — a `ComponentData` record with `{ propsTable, codeSnippet, preview }`. This is the same pattern as existing domains (see `wiki/[component]/page.tsx` lines 22-233).

For the 27 new components, use a **minimal viable approach**:
- `preview`: Import and render the actual component with realistic mock props. Content blocks are lightweight enough to render directly. Widgets are client-side interactive components — render them inside a constrained container (max-w-md).
- `propsTable`: Extract from the component's TypeScript interface. Start with the 3-5 most important props; mark "Show all" for the rest.
- `codeSnippet`: Minimal import + usage JSX showing the component with required props only.

This is the bulk of the implementation work (~50-60% of effort). Plan for ~15-20 min per component.

### Preview Files

**Files to create:**
- `src/app/developer/design-system/content-blocks/_previews.tsx` — exports preview render functions. Content blocks render with sample wiki-style content (exam questions, formulas, process steps).
- `src/app/developer/design-system/widgets/_previews.tsx` — exports preview render functions. Widgets render at constrained size with mock data. Mark as `'use client'` since all widgets use client-side interactivity.

### Index Pages

**Files to create:**
- `src/app/developer/design-system/content-blocks/page.tsx` — lists all content block components with description and link
- `src/app/developer/design-system/widgets/page.tsx` — lists all widgets grouped by law code (BP-344, DSGN-013, PD-1096) with descriptions

These are needed because the sidebar expandable items need valid `href` targets for the parent items.

---

## 3. Polish: Right-Rail Table of Contents

### Problem

Component pages and long content pages lack an "On This Page" navigation rail.

### Solution

**File:** `src/components/portal/PortalLayout.tsx`

The current layout is a simple flex: `<PortalSidebar /> + <main>`. This must be restructured to support an optional third column.

**Layout restructure:**
1. Wrap `<main>` and the optional right rail in a new flex container
2. Add `rightRail?: React.ReactNode` prop to PortalLayout
3. When `rightRail` is provided, render it as a sibling to `<main>`
4. Right rail: `w-[170px] shrink-0 sticky top-12 h-fit hidden xl:block` (Tailwind `xl` = 1280px)
5. Main content: add `max-w-4xl` constraint when right rail is present to prevent it from pushing the rail offscreen

**Updated layout structure:**
```tsx
<div className="flex flex-1">
  <PortalSidebar ... />
  <div className="flex flex-1 min-w-0">
    <main className={cn("flex-1 min-w-0 overflow-y-auto px-6 py-6 lg:px-8", rightRail && "max-w-4xl")}>
      {children}
    </main>
    {rightRail && (
      <aside className="w-[170px] shrink-0 sticky top-12 h-fit hidden xl:block py-5 pr-4">
        {rightRail}
      </aside>
    )}
  </div>
</div>
```

**File:** `src/app/developer/_components/TableOfContents.tsx`

Already exists. Wire it into component detail pages by passing it as `rightRail` from the page or a sub-layout. The TOC auto-generates from h2/h3 headings.

---

## 4. Polish: Fuse.js Fuzzy Search in Command Palette

### Problem

The CommandPalette uses basic string matching via cmdk's built-in filter. No fuzzy matching, no typo tolerance, no weighted results.

### Solution

**Install:** `bun add fuse.js`

**File:** `src/components/portal/CommandPalette.tsx`

**Integration approach:** Disable cmdk's native filter by passing `shouldFilter={false}` to the `<Command>` component. Use Fuse.js to compute results and pass them as the items list.

**Fuse.js configuration:**
```typescript
const fuse = new Fuse(searchItems, {
  keys: [
    { name: 'name', weight: 2.0 },
    { name: 'tags', weight: 1.5 },
    { name: 'description', weight: 1.0 },
    { name: 'domain', weight: 0.5 },
  ],
  threshold: 0.35,       // slightly less aggressive than 0.3 to reduce false positives on short names
  includeMatches: true,
  minMatchCharLength: 2,
})
```

**Search index:** Build from `getAllComponents()` plus existing `STATIC_PAGES` array. Add new static pages for content-blocks and widgets index pages.

**Character highlighting:** Use `includeMatches` from Fuse.js results to bold matched character ranges in result item names. Implement a `HighlightMatch` component that splits the name string by match indices.

**File:** `src/app/developer/_components/DevPortalSearch.tsx`

Add content-blocks and widgets index pages to the `STATIC_PAGES` array so they appear in command palette results.

---

## 5. Polish: Structured Changelog

### Problem

The homepage "Recent Changes" section has hardcoded JSX entries.

### Solution

**File to create:** `src/lib/developer/changelog.ts`

```typescript
interface ChangelogEntry {
  date: string        // ISO date
  title: string
  description: string
  badge?: 'new' | 'update' | 'fix'
  domain?: string     // links to design system domain
}

export const CHANGELOG: ChangelogEntry[] = [
  // Newest first — homepage renders first 5
]
```

**File:** `src/app/developer/page.tsx`

- Import `CHANGELOG` and map over `CHANGELOG.slice(0, 5)` instead of hardcoded JSX
- Update the "21 Components" badge to use `getAllComponents().length` for a dynamic count

---

## 6. Design System Overview Page Update

### Problem

`src/app/developer/design-system/page.tsx` hardcodes `DOMAIN_ORDER` and `DOMAIN_DESCRIPTIONS` with only 4 domains. After adding content-blocks and widgets, the overview page won't show them.

### Solution

**File:** `src/app/developer/design-system/page.tsx`

- Add `'content-blocks'` and `'widgets'` to `DOMAIN_ORDER`
- Add descriptions for both to `DOMAIN_DESCRIPTIONS`
- Component counts are already dynamically computed from the registry

---

## Files Changed Summary

| File | Change Type |
|------|------------|
| `src/app/developer/_components/DevPortalShell.tsx` | Restructure navItems (10→5 groups), add new domain children |
| `src/lib/developer/componentRegistry.ts` | Add ~27 entries, add DOMAIN_LABELS for new domains |
| `src/types/developer.ts` | Add 'content-blocks' and 'widgets' to domain union, add lawGroup union |
| `src/app/developer/design-system/page.tsx` | Add new domains to DOMAIN_ORDER and DOMAIN_DESCRIPTIONS |
| `src/app/developer/design-system/content-blocks/page.tsx` | **New** — domain index page |
| `src/app/developer/design-system/content-blocks/[component]/page.tsx` | **New** — dynamic route with generateStaticParams |
| `src/app/developer/design-system/content-blocks/[component]/loading.tsx` | **New** — skeleton |
| `src/app/developer/design-system/content-blocks/_previews.tsx` | **New** — preview render functions |
| `src/app/developer/design-system/widgets/page.tsx` | **New** — domain index page with law code grouping |
| `src/app/developer/design-system/widgets/[component]/page.tsx` | **New** — dynamic route with generateStaticParams |
| `src/app/developer/design-system/widgets/[component]/loading.tsx` | **New** — skeleton |
| `src/app/developer/design-system/widgets/_previews.tsx` | **New** — preview render functions ('use client') |
| `src/components/portal/PortalLayout.tsx` | Add rightRail prop, restructure flex layout |
| `src/components/portal/MobileNav.tsx` | Add manual expand/collapse toggle for domains |
| `src/components/portal/CommandPalette.tsx` | Fuse.js integration, disable cmdk native filter |
| `src/app/developer/_components/DevPortalSearch.tsx` | Add new static pages to STATIC_PAGES |
| `src/lib/developer/changelog.ts` | **New** — structured changelog data |
| `src/app/developer/page.tsx` | Import changelog, dynamic component count |
| `package.json` | Add fuse.js dependency |

## Acceptance Criteria

- [ ] Sidebar shows 5 top-level groups (Portal, Design System, Documentation, Status, Tools)
- [ ] Design System group contains 6 expandable domains with all components nested
- [ ] All ~48 components accessible via sidebar navigation (link exists, page renders)
- [ ] Content blocks domain has index page + all 11 component detail pages
- [ ] Widgets domain has index page (grouped by law code) + all 17 component detail pages
- [ ] Each new component page has working Preview, Props, and Code tabs
- [ ] MobileNav supports manual expand/collapse for domain groups
- [ ] Right-rail TOC visible on component pages at ≥1280px (xl breakpoint)
- [ ] Command palette uses Fuse.js with weighted fuzzy search (`shouldFilter={false}` on cmdk)
- [ ] Matched characters highlighted in search results
- [ ] Homepage changelog reads from `src/lib/developer/changelog.ts`
- [ ] Homepage component count badge is dynamic
- [ ] Design System overview page shows all 6 domains with correct counts
- [ ] DOMAIN_LABELS includes 'Content Blocks' and 'Interactive Widgets'
- [ ] New routes export `generateStaticParams`
- [ ] `npm run build` passes with zero errors
- [ ] All text remains ≥11px minimum
