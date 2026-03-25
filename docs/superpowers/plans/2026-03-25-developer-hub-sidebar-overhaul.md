# Developer Hub Sidebar & Polish Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the developer portal sidebar from 10 groups to 5, add 27 new components (content blocks + interactive widgets), and implement 3 polish items (right-rail TOC, Fuse.js search, structured changelog).

**Architecture:** The sidebar nav data lives in `DevPortalShell.tsx` and feeds into `PortalSidebar.tsx` (desktop) and `MobileNav.tsx` (mobile). Component metadata lives in `componentRegistry.ts`. Each domain has a `[component]/page.tsx` dynamic route that looks up registry data and renders `ComponentPageLayout`. New domains follow the same pattern.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Fuse.js (new), Lucide icons

**Spec:** `docs/superpowers/specs/2026-03-25-developer-hub-sidebar-overhaul-design.md`

---

## Chunk 1: Foundation (Types + Registry + Data)

These tasks have no dependencies and can run in parallel with each other.

### Task 1: Update TypeScript types

**Files:**
- Modify: `src/types/developer.ts`

- [ ] **Step 1: Add new domain values and lawGroup field**

In `ComponentMeta`, update the `domain` union and add `lawGroup`:

```typescript
export interface ComponentMeta {
  slug: string
  title: string
  description: string
  domain: 'wiki' | 'questions' | 'testing-path' | 'shared' | 'content-blocks' | 'widgets'
  status: 'stable' | 'beta' | 'deprecated'
  importPath: string
  filePath: string
  tags?: string[]
  lawGroup?: 'BP-344' | 'DSGN-013' | 'PD-1096'
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds (existing code still compiles since we widened the union)

- [ ] **Step 3: Commit**

```bash
git add src/types/developer.ts
git commit -m "feat(developer): add content-blocks and widgets domain types"
```

---

### Task 2: Expand component registry

**Files:**
- Modify: `src/lib/developer/componentRegistry.ts`

- [ ] **Step 1: Add DOMAIN_LABELS for new domains**

After the existing `DOMAIN_LABELS` entries (line 54-59), add:

```typescript
'content-blocks': 'Content Blocks',
'widgets': 'Interactive Widgets',
```

- [ ] **Step 2: Add 11 content block entries to COMPONENTS array**

After the `/* ── System / Shared ──` section, add a new section:

```typescript
/* ── Content Blocks ──────────────────────────────────────────────── */
{ slug: 'inline-quiz',              title: 'InlineQuiz',              description: 'Embedded retrieval practice quiz within wiki articles.',                       domain: 'content-blocks', status: 'stable', importPath: '@/components/wiki/InlineQuiz',              filePath: 'src/components/wiki/InlineQuiz.tsx',              tags: ['quiz', 'interactive', 'wiki'] },
{ slug: 'formula-block',            title: 'FormulaBlock',            description: 'Mathematical formula display with variable highlighting.',                     domain: 'content-blocks', status: 'stable', importPath: '@/components/wiki/FormulaBlock',            filePath: 'src/components/wiki/FormulaBlock.tsx',            tags: ['formula', 'math', 'wiki'] },
{ slug: 'exam-tip',                 title: 'ExamTip',                 description: 'Highlighted exam preparation tip callout.',                                   domain: 'content-blocks', status: 'stable', importPath: '@/components/wiki/ExamTip',                 filePath: 'src/components/wiki/ExamTip.tsx',                 tags: ['tip', 'exam', 'callout'] },
{ slug: 'process-flow',             title: 'ProcessFlow',             description: 'Step-by-step process visualization with numbered stages.',                    domain: 'content-blocks', status: 'stable', importPath: '@/components/wiki/ProcessFlow',             filePath: 'src/components/wiki/ProcessFlow.tsx',             tags: ['process', 'steps', 'flow'] },
{ slug: 'wiki-comparison-table',    title: 'WikiComparisonTable',     description: 'Side-by-side comparison table for wiki content.',                              domain: 'content-blocks', status: 'stable', importPath: '@/components/wiki/ComparisonTable',         filePath: 'src/components/wiki/ComparisonTable.tsx',         tags: ['table', 'comparison', 'wiki'] },
{ slug: 'law-callout',              title: 'LawCallout',              description: 'Legal citation callout with law code reference.',                              domain: 'content-blocks', status: 'stable', importPath: '@/components/wiki/LawCallout',              filePath: 'src/components/wiki/LawCallout.tsx',              tags: ['law', 'citation', 'callout'] },
{ slug: 'alert-box',                title: 'AlertBox',                description: 'Contextual alert box with severity levels.',                                  domain: 'content-blocks', status: 'stable', importPath: '@/components/wiki/AlertBox',                filePath: 'src/components/wiki/AlertBox.tsx',                tags: ['alert', 'warning', 'info'] },
{ slug: 'accordion',                title: 'Accordion',               description: 'Collapsible content sections for progressive disclosure.',                    domain: 'content-blocks', status: 'stable', importPath: '@/components/wiki/Accordion',               filePath: 'src/components/wiki/Accordion.tsx',               tags: ['accordion', 'collapse', 'disclosure'] },
{ slug: 'teach-back-prompt',        title: 'TeachBackPrompt',         description: 'Active recall prompt asking learners to explain concepts.',                    domain: 'content-blocks', status: 'stable', importPath: '@/components/wiki/TeachBackPrompt',         filePath: 'src/components/wiki/TeachBackPrompt.tsx',         tags: ['recall', 'teach-back', 'learning'] },
{ slug: 'elaborative-interrogation',title: 'ElaborativeInterrogation',description: 'Why/how questioning prompt for deeper understanding.',                        domain: 'content-blocks', status: 'stable', importPath: '@/components/wiki/ElaborativeInterrogation',filePath: 'src/components/wiki/ElaborativeInterrogation.tsx', tags: ['elaboration', 'question', 'learning'] },
{ slug: 'key-values',               title: 'KeyValues',               description: 'Key-value pair display for specifications and dimensions.',                   domain: 'content-blocks', status: 'stable', importPath: '@/components/wiki/KeyValues',               filePath: 'src/components/wiki/KeyValues.tsx',               tags: ['data', 'key-value', 'specs'] },
```

- [ ] **Step 3: Add 17 widget entries to COMPONENTS array**

```typescript
/* ── Interactive Widgets ─────────────────────────────────────────── */
{ slug: 'door-configurator',        title: 'DoorConfigurator',        description: 'Door compliance configurator for BP-344 2024 IRR.',                           domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/bp344/DoorConfigurator',        filePath: 'src/components/wiki/widgets/bp344/DoorConfigurator.tsx',        tags: ['accessibility', 'door', 'interactive'], lawGroup: 'BP-344' },
{ slug: 'corridor-visualizer',      title: 'CorridorVisualizer',      description: 'Interactive corridor width visualization with compliance check.',              domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/bp344/CorridorVisualizer',      filePath: 'src/components/wiki/widgets/bp344/CorridorVisualizer.tsx',      tags: ['accessibility', 'corridor', 'interactive'], lawGroup: 'BP-344' },
{ slug: 'cubicle-checker',          title: 'CubicleChecker',          description: 'Toilet cubicle compliance checker with real-time feedback.',                   domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/bp344/CubicleChecker',          filePath: 'src/components/wiki/widgets/bp344/CubicleChecker.tsx',          tags: ['accessibility', 'cubicle', 'interactive'], lawGroup: 'BP-344' },
{ slug: 'grab-bar-explainer',       title: 'GrabBarExplainer',        description: 'Interactive grab bar reference points diagram.',                               domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/bp344/GrabBarExplainer',        filePath: 'src/components/wiki/widgets/bp344/GrabBarExplainer.tsx',        tags: ['accessibility', 'grab-bar', 'interactive'], lawGroup: 'BP-344' },
{ slug: 'recall-drill',             title: 'RecallDrill',             description: 'Flashcard retrieval practice for BP-344 knowledge.',                           domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/bp344/RecallDrill',             filePath: 'src/components/wiki/widgets/bp344/RecallDrill.tsx',             tags: ['drill', 'recall', 'flashcard'], lawGroup: 'BP-344' },
{ slug: 'bp344-comparison',         title: 'BP344Comparison',         description: 'Interactive 2024 vs 2013 IRR comparison table.',                               domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/bp344/ComparisonTable',         filePath: 'src/components/wiki/widgets/bp344/ComparisonTable.tsx',         tags: ['comparison', 'table', 'interactive'], lawGroup: 'BP-344' },
{ slug: 'workstation-calculator',   title: 'WorkstationCalculator',   description: 'Office floor area calculator (NFA/GFA from employee count).',                  domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/dsgn013/WorkstationCalculator', filePath: 'src/components/wiki/widgets/dsgn013/WorkstationCalculator.tsx', tags: ['calculator', 'office', 'interactive'], lawGroup: 'DSGN-013' },
{ slug: 'reach-envelope-diagram',   title: 'ReachEnvelopeDiagram',    description: 'Interactive reach envelope zones for standing/seated/wheelchair.',              domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/dsgn013/ReachEnvelopeDiagram',  filePath: 'src/components/wiki/widgets/dsgn013/ReachEnvelopeDiagram.tsx',  tags: ['ergonomics', 'reach', 'interactive'], lawGroup: 'DSGN-013' },
{ slug: 'bedroom-plan-view',        title: 'BedroomPlanView',         description: 'SVG plan view of bedroom with clearance zones.',                               domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/dsgn013/BedroomPlanView',       filePath: 'src/components/wiki/widgets/dsgn013/BedroomPlanView.tsx',       tags: ['plan', 'bedroom', 'svg'], lawGroup: 'DSGN-013' },
{ slug: 'bed-size-comparator',      title: 'BedSizeComparator',       description: 'Interactive bed size comparison tool with room planning.',                     domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/dsgn013/BedSizeComparator',     filePath: 'src/components/wiki/widgets/dsgn013/BedSizeComparator.tsx',     tags: ['furniture', 'bed', 'comparison'], lawGroup: 'DSGN-013' },
{ slug: 'body-dimension-explorer',  title: 'BodyDimensionExplorer',   description: 'Interactive anthropometric data explorer with percentiles.',                   domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/dsgn013/BodyDimensionExplorer', filePath: 'src/components/wiki/widgets/dsgn013/BodyDimensionExplorer.tsx', tags: ['anthropometry', 'body', 'interactive'], lawGroup: 'DSGN-013' },
{ slug: 'dh-ratio-explorer',        title: 'DHRatioExplorer',         description: 'Interactive depth-to-height ratio spatial quality explorer.',                  domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/dsgn013/DHRatioExplorer',       filePath: 'src/components/wiki/widgets/dsgn013/DHRatioExplorer.tsx',       tags: ['spatial', 'ratio', 'interactive'], lawGroup: 'DSGN-013' },
{ slug: 'proportion-comparator',    title: 'ProportionComparator',    description: 'Room proportion comparison tool with classical ratios.',                       domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/dsgn013/ProportionComparator',  filePath: 'src/components/wiki/widgets/dsgn013/ProportionComparator.tsx',  tags: ['proportion', 'room', 'interactive'], lawGroup: 'DSGN-013' },
{ slug: 'dimension-drill',          title: 'DimensionDrill',          description: 'Flashcard drill for furniture and building dimensions.',                       domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/dsgn013/DimensionDrill',        filePath: 'src/components/wiki/widgets/dsgn013/DimensionDrill.tsx',        tags: ['drill', 'dimensions', 'flashcard'], lawGroup: 'DSGN-013' },
{ slug: 'spatial-quality-drill',    title: 'SpatialQualityDrill',     description: 'Flashcard drill for spatial quality concepts and D/H ratios.',                 domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/dsgn013/SpatialQualityDrill',   filePath: 'src/components/wiki/widgets/dsgn013/SpatialQualityDrill.tsx',   tags: ['drill', 'spatial', 'flashcard'], lawGroup: 'DSGN-013' },
{ slug: 'body-dimension-drill',     title: 'BodyDimensionDrill',      description: 'Flashcard drill for anthropometric data.',                                     domain: 'widgets', status: 'stable', importPath: '@/components/wiki/widgets/dsgn013/BodyDimensionDrill',    filePath: 'src/components/wiki/widgets/dsgn013/BodyDimensionDrill.tsx',    tags: ['drill', 'body', 'flashcard'], lawGroup: 'DSGN-013' },
{ slug: 'ph-building-setbacks',     title: 'PHBuildingSetbacks',      description: 'Property line setback illustration for building code compliance.',             domain: 'widgets', status: 'stable', importPath: '@/components/interactive-illustrations/2D/SetbackIllustration', filePath: 'src/components/interactive-illustrations/2D/SetbackIllustration.tsx', tags: ['setback', 'building', 'interactive'], lawGroup: 'PD-1096' },
```

- [ ] **Step 4: Verify build**

Run: `npx next build 2>&1 | tail -5`

- [ ] **Step 5: Commit**

```bash
git add src/lib/developer/componentRegistry.ts
git commit -m "feat(developer): add 28 content block and widget components to registry"
```

---

### Task 3: Create structured changelog data

**Files:**
- Create: `src/lib/developer/changelog.ts`

- [ ] **Step 1: Create the changelog file**

```typescript
export interface ChangelogEntry {
  date: string
  title: string
  description: string
  badge?: 'new' | 'update' | 'fix'
  domain?: string
}

export const CHANGELOG: ChangelogEntry[] = [
  { date: '2026-03-25', title: 'Interactive Widgets added to Design System', description: '17 interactive widgets (BP-344, DSGN-013) now documented in the developer hub.', badge: 'new', domain: 'widgets' },
  { date: '2026-03-25', title: 'Content Blocks catalog', description: '11 pedagogical content blocks (InlineQuiz, FormulaBlock, ExamTip, etc.) added.', badge: 'new', domain: 'content-blocks' },
  { date: '2026-03-25', title: 'Sidebar restructured to 5 groups', description: 'Collapsed 10 nav groups into 5 with domain-nested Design System.', badge: 'update' },
  { date: '2026-03-25', title: 'Fuzzy search in command palette', description: 'Fuse.js weighted fuzzy search with character highlighting.', badge: 'update' },
  { date: '2026-03-25', title: 'HeatmapGrid component', description: 'Topic mastery heatmap for the testing path domain.', badge: 'new', domain: 'testing-path' },
  { date: '2026-03-23', title: 'ReadinessRing v2 animation', description: 'CSS-only mount animation with configurable stroke width.', badge: 'update', domain: 'testing-path' },
  { date: '2026-03-21', title: 'Status Dashboard live', description: 'Database health, API latency, and edge function monitoring.', badge: 'new' },
  { date: '2026-03-19', title: 'QuestionCard interactive preview', description: 'Answer selection, difficulty badge, and rationale panel.', badge: 'update', domain: 'questions' },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/developer/changelog.ts
git commit -m "feat(developer): add structured changelog data"
```

---

## Chunk 2: Sidebar & Navigation

Depends on Chunk 1 (registry must have new domains).

### Task 4: Restructure DevPortalShell navItems (10→5 groups)

**Files:**
- Modify: `src/app/developer/_components/DevPortalShell.tsx`

- [ ] **Step 1: Rewrite the `devNavItems` array**

Collapse the current 10 NavGroups into 5. The Design System group now contains one Overview link plus 6 expandable NavItems. Each expandable item has children for the components in that domain.

Read the file, then replace the entire `devNavItems` const with the new 5-group structure. Key changes:
- "Portal" group: unchanged (Overview link)
- "Design System" group: Overview link + 6 expandable items (Wiki Article, Content Blocks, Interactive Widgets, Question & Q&A, Testing Path, System / Shared) each with component children
- "Documentation" group: API Reference, Architecture
- "Status" group: Overview, Database, Infrastructure
- "Tools" group: Dev Tools, Console, Database Browser, Audit Logs, Test Data

Content Blocks children use `href: '/developer/design-system/content-blocks/[slug]'`
Widget children use `href: '/developer/design-system/widgets/[slug]'`

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add src/app/developer/_components/DevPortalShell.tsx
git commit -m "feat(developer): restructure sidebar from 10 groups to 5"
```

---

### Task 5: Update MobileNav with manual toggle

**Files:**
- Modify: `src/components/portal/MobileNav.tsx`

- [ ] **Step 1: Add manualToggle state and toggle logic**

Port the `manualToggle` pattern from `PortalSidebar.tsx`:
- Add `const [manualToggle, setManualToggle] = React.useState<Record<string, boolean>>({})`
- Add `isExpanded` helper that checks manualToggle, then falls back to active state
- Add `toggleSection` handler
- Replace `{item.children && active && (` with `{item.children && isExpanded(item) && (`
- Make the parent item a `<button>` that calls `toggleSection` instead of a `<Link>`

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add src/components/portal/MobileNav.tsx
git commit -m "feat(developer): add manual expand/collapse to mobile nav"
```

---

### Task 6: Update Design System overview page

**Files:**
- Modify: `src/app/developer/design-system/page.tsx`

- [ ] **Step 1: Add new domains to DOMAIN_ORDER and DOMAIN_DESCRIPTIONS**

Add `'content-blocks'` and `'widgets'` to the `DOMAIN_ORDER` array (after 'wiki', before 'questions').
Add descriptions for both in `DOMAIN_DESCRIPTIONS`.

- [ ] **Step 2: Verify the page renders all 6 domain cards**

Run dev server, navigate to `/developer/design-system`, confirm 6 cards with correct counts.

- [ ] **Step 3: Commit**

```bash
git add src/app/developer/design-system/page.tsx
git commit -m "feat(developer): add content-blocks and widgets to design system overview"
```

---

### Task 7: Update homepage with dynamic changelog and component count

**Files:**
- Modify: `src/app/developer/page.tsx`

- [ ] **Step 1: Import changelog and render dynamically**

Replace hardcoded "Recent Changes" JSX with:
```typescript
import { CHANGELOG } from '@/lib/developer/changelog'
import { getAllComponents } from '@/lib/developer/componentRegistry'
```

Map over `CHANGELOG.slice(0, 5)` instead of hardcoded entries.
Update the "21 Components" badge to use `getAllComponents().length`.

- [ ] **Step 2: Commit**

```bash
git add src/app/developer/page.tsx
git commit -m "feat(developer): dynamic changelog and component count on homepage"
```

---

## Chunk 3: New Routes & Index Pages

Can run in parallel. Depends on Chunk 1 (registry entries).

### Task 8: Create content-blocks index page

**Files:**
- Create: `src/app/developer/design-system/content-blocks/page.tsx`

- [ ] **Step 1: Create the index page**

Follow the same pattern as `src/app/developer/design-system/page.tsx` but scoped to content-blocks domain. Import `getComponentsByDomain('content-blocks')` and render a list of cards linking to each component. Include Breadcrumbs.

- [ ] **Step 2: Commit**

---

### Task 9: Create content-blocks dynamic route + loading

**Files:**
- Create: `src/app/developer/design-system/content-blocks/[component]/page.tsx`
- Create: `src/app/developer/design-system/content-blocks/[component]/loading.tsx`

- [ ] **Step 1: Create the dynamic route page**

Follow the exact pattern from `src/app/developer/design-system/questions/[component]/page.tsx`:
- Import `getComponentBySlug`, `getComponentsByDomain` from registry
- Import `ComponentPageLayout` from `@/components/developer/ComponentPageLayout`
- Import `Breadcrumbs` from `@/components/developer/Breadcrumbs`
- Define `ComponentData` interface with `propsTable`, `codeSnippet`, `preview`
- Export `generateStaticParams` returning all content-blocks slugs
- Look up component by slug, render `ComponentPageLayout` or `notFound()`
- For now, create placeholder preview data for just the first 3 components (InlineQuiz, FormulaBlock, ExamTip). Remaining components get a placeholder preview saying "Preview coming soon".

- [ ] **Step 2: Create loading.tsx skeleton**

Copy pattern from existing `src/app/developer/design-system/questions/[component]/loading.tsx`.

- [ ] **Step 3: Verify route works**

Navigate to `/developer/design-system/content-blocks/inline-quiz` — should render.

- [ ] **Step 4: Commit**

```bash
git add src/app/developer/design-system/content-blocks/
git commit -m "feat(developer): add content-blocks dynamic routes with initial previews"
```

---

### Task 10: Create widgets index page

**Files:**
- Create: `src/app/developer/design-system/widgets/page.tsx`

- [ ] **Step 1: Create the index page**

Similar to content-blocks index but with law code grouping. Import widgets from registry, group by `lawGroup`, render sections: "BP-344: Accessibility Standards", "DSGN-013: Furniture & Clearances", "PD-1096: Building Code". Each section lists its widget cards.

- [ ] **Step 2: Commit**

---

### Task 11: Create widgets dynamic route + loading

**Files:**
- Create: `src/app/developer/design-system/widgets/[component]/page.tsx`
- Create: `src/app/developer/design-system/widgets/[component]/loading.tsx`

- [ ] **Step 1: Create the dynamic route page**

Same pattern as Task 9. For preview data, create placeholder entries for the first 3 widgets (DoorConfigurator, CorridorVisualizer, WorkstationCalculator). Remaining get "Preview coming soon" placeholder.

Note: Widget components are `'use client'` — import them dynamically with `next/dynamic` in the preview to avoid SSR issues:
```typescript
const DoorConfiguratorPreview = dynamic(
  () => import('@/components/wiki/widgets/bp344/DoorConfigurator').then(m => m.DoorConfigurator),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
)
```

- [ ] **Step 2: Create loading.tsx skeleton**

- [ ] **Step 3: Verify route works**

- [ ] **Step 4: Commit**

```bash
git add src/app/developer/design-system/widgets/
git commit -m "feat(developer): add widgets dynamic routes with initial previews"
```

---

## Chunk 4: Polish (Layout + Search + Search Data)

Independent from Chunk 3. Can run in parallel.

### Task 12: Add right-rail TOC to PortalLayout

**Files:**
- Modify: `src/components/portal/PortalLayout.tsx`

- [ ] **Step 1: Add rightRail prop and restructure layout**

Read the current file. Add `rightRail?: React.ReactNode` to `PortalLayoutProps`. Restructure the flex layout:

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

Import `cn` from `@/lib/utils`. The component needs `'use client'` if it doesn't already have it — check first. Actually, PortalLayout is currently a Server Component. Since `cn` is just a utility and `rightRail` is a prop, it can stay as a Server Component. No `'use client'` needed.

- [ ] **Step 2: Export the updated type**

Make sure `PortalLayoutProps` export includes the new `rightRail` field.

- [ ] **Step 3: Verify build**

- [ ] **Step 4: Commit**

```bash
git add src/components/portal/PortalLayout.tsx
git commit -m "feat(portal): add optional right-rail TOC slot to layout"
```

---

### Task 13: Install Fuse.js and integrate into CommandPalette

**Files:**
- Modify: `package.json` (via bun add)
- Modify: `src/components/portal/CommandPalette.tsx`

- [ ] **Step 1: Install fuse.js**

Run: `bun add fuse.js`

- [ ] **Step 2: Read current CommandPalette.tsx**

Understand the existing search/filter implementation.

- [ ] **Step 3: Add Fuse.js integration**

Key changes:
1. Import `Fuse` from `fuse.js`
2. Build search items from `getAllComponents()` + `STATIC_PAGES`
3. Create Fuse instance with weighted keys (name: 2.0, tags: 1.5, description: 1.0, domain: 0.5), threshold 0.35, includeMatches: true
4. Pass `shouldFilter={false}` to the `<Command>` component to disable cmdk's native filter
5. Filter results through Fuse when query is non-empty
6. When query is empty, show grouped suggestions (Recent, Quick Actions, Browse)

- [ ] **Step 4: Create HighlightMatch component**

A small inline component that renders text with matched character ranges bolded using Fuse.js `matches` data:

```typescript
const HighlightMatch = ({ text, matches }: { text: string; matches?: readonly Fuse.FuseResultMatch[] }) => {
  if (!matches?.length) return <>{text}</>
  // Find matches for this specific text field, render bolded ranges
}
```

- [ ] **Step 5: Update DevPortalSearch static pages**

Add content-blocks and widgets index pages to the `STATIC_PAGES` array in `src/app/developer/_components/DevPortalSearch.tsx`.

- [ ] **Step 6: Verify search works**

Open command palette (Cmd+K), type "door" — should show DoorConfigurator. Type "quiz" — should show InlineQuiz and QuestionCard.

- [ ] **Step 7: Commit**

```bash
git add package.json bun.lockb src/components/portal/CommandPalette.tsx src/app/developer/_components/DevPortalSearch.tsx
git commit -m "feat(developer): Fuse.js fuzzy search in command palette"
```

---

## Chunk 5: Verification & Build

### Task 14: Final build verification

- [ ] **Step 1: Run full build**

Run: `npx next build`

Fix any errors.

- [ ] **Step 2: Verify all new routes render**

Check these URLs resolve:
- `/developer` (homepage with dynamic changelog + count)
- `/developer/design-system` (6 domain cards)
- `/developer/design-system/content-blocks` (index page)
- `/developer/design-system/content-blocks/inline-quiz` (component page)
- `/developer/design-system/widgets` (index page with law groups)
- `/developer/design-system/widgets/door-configurator` (component page)

- [ ] **Step 3: Verify sidebar has 5 groups**

Confirm: Portal, Design System, Documentation, Status, Tools.
Confirm: Design System expands to show 6 domain sub-groups.

- [ ] **Step 4: Verify search**

Open Cmd+K, test fuzzy search with "corri" → CorridorVisualizer.

- [ ] **Step 5: Final text-size audit**

Run: `grep -r "text-\[8px\]\|text-\[9px\]\|text-\[10px\]" src/app/developer/ src/components/developer/ src/components/portal/`
Expected: zero matches

- [ ] **Step 6: Commit any fixes**

---

## Parallelization Guide

For agentic execution, these task groups are independent:

| Agent | Tasks | Depends On |
|-------|-------|-----------|
| Agent A | Task 1 (types) + Task 2 (registry) + Task 3 (changelog) | None |
| Agent B | Task 4 (sidebar) + Task 5 (MobileNav) | Agent A |
| Agent C | Task 6 (DS overview) + Task 7 (homepage) | Agent A |
| Agent D | Task 8 (CB index) + Task 9 (CB routes) | Agent A |
| Agent E | Task 10 (widgets index) + Task 11 (widget routes) | Agent A |
| Agent F | Task 12 (layout) + Task 13 (Fuse.js) | None |
| Verify | Task 14 | All |

Maximum parallelism: Agent A first, then Agents B-F in parallel, then Verify.
