# Storybook Overhaul Plan

Date: 2026-04-06

## Objective

- Replace placeholder Storybook scaffolding with real, interactive component documentation.
- Make Storybook the single source of truth for reusable component documentation.
- Remove redundant or stale component-library surfaces from the `/developer` area.
- Create a dedicated Storybook section for the wiki article system and its custom article components.
- Eliminate documentation and component ownership redundancies across the project before adding new stories.

# Research

## Current Storybook Baseline

- `package.json` exposes `storybook` and `build-storybook` scripts and currently installs Storybook `8.6.14` on `@storybook/react-vite`.
- `.storybook/main.ts` scans:
  - `../src/components/**/*.stories.@(ts|tsx)`
  - `../src/app/**/*.stories.@(ts|tsx)`
  - `../src/features/**/*.stories.@(ts|tsx)`
- `.storybook/main.ts` currently enables `@storybook/addon-essentials`, `@storybook/addon-a11y`, `@storybook/addon-interactions`, and `@storybook/addon-themes`.
- `.storybook/preview.ts` imports `src/app/globals.css` and `fonts.css`, but it does not mirror the live app provider stack from `src/app/layout.tsx`.
- The live app layout wraps the app in:
  - `ThemeProvider`
  - `TooltipProvider`
  - `NoiseFilter`
  - `NavigationProgress`
  - `DevModeOverlay` in development
  - `DemoShell` in demo mode
- Current Storybook is therefore visually close to the app theme but behaviorally incomplete for components that depend on theme, tooltip context, browser APIs, or app-level providers.

## Story Coverage Audit

### Overall

| Metric | Value |
| --- | ---: |
| Total stories | 80 |
| Placeholder scaffold stories | 71 |
| Non-scaffold stories | 9 |

### Coverage by top-level component group

| Group | Real `.tsx` components | Stories | Placeholder stories |
| --- | ---: | ---: | ---: |
| `wiki` | 78 | 0 | 0 |
| `quiz-v2` | 59 | 0 | 0 |
| `analytics` | 49 | 0 | 0 |
| `dashboard` | 38 | 0 | 0 |
| `ui` | 36 | 36 | 36 |
| `shared` | 36 | 36 | 35 |
| `admin` | 26 | 0 | 0 |
| `trails` | 21 | 0 | 0 |
| `marketing` | 20 | 0 | 0 |
| `ceo` | 19 | 0 | 0 |
| `developer` | 9 | 6 | 0 |
| `portal` | 7 | 1 | 0 |
| `calculators` | 8 | 1 | 0 |

### Meaning of the current coverage

- Story coverage is concentrated almost entirely in `ui` and `shared`.
- Those two folders are also where the placeholder problem is worst.
- The most domain-specific and pedagogically valuable component system in the repo, `src/components/wiki`, has zero stories.
- Storybook currently documents the least strategic parts of the component tree and ignores the most specialized parts.

## Developer Portal Redundancy Verification

### Confirmed stale component-library surface

- `src/app/developer/components/` contains only `loading.tsx`.
- There is no `src/app/developer/components/page.tsx`.
- The project still ships stale references to `/developer/components` in:
  - `src/app/developer/_components/DevPortalSidebar.tsx`
  - `src/app/developer/_components/DevPortalSearch.tsx`
  - `src/lib/constants/routes.ts`

This means the old in-app component-library surface is not actually live, but multiple parts of the codebase still behave as if it is.

### Confirmed stale registry

- `src/lib/developer/componentRegistry.ts` still defines a component catalog.
- Audit result:
  - 57 registry entries checked
  - 29 valid file paths
  - 28 invalid file paths
- Invalid examples include paths that no longer match the real component structure, such as:
  - `src/components/wiki/InlineQuiz.tsx`
  - `src/components/wiki/FormulaBlock.tsx`
  - `src/components/wiki/WikiItemRenderer.tsx`
  - `src/components/questions/AnswerOption.tsx`
  - `src/components/testing/HeatmapGrid.tsx`

This registry is no longer a reliable documentation backbone and should not be preserved as a second source of truth.

### Confirmed duplicate or unnecessary wrapper surfaces

| File | Finding | Required action |
| --- | --- | --- |
| `src/app/developer/_components/CopyButton.tsx` | Duplicates the implementation already in `src/components/portal/CopyButton.tsx` | Remove duplicate and import the canonical component directly |
| `src/app/developer/_components/PropTable.tsx` | Thin re-export of `src/components/developer/PropTable.tsx` | Remove wrapper and import canonical component directly |
| `src/components/developer/ComponentPageLayout.tsx` | Documentation-only layout for the old in-app component library | Retire unless a surviving internal docs page still needs it |
| `src/app/dashboard/developer/docs/page.tsx` | Separate internal docs surface outside `/developer` | Merge into `/developer` docs or retire |

### Practical conclusion

- The repository still contains developer component-library artifacts.
- Those artifacts are partly dead, partly stale, and partly duplicated.
- Storybook overhaul must begin with deleting or absorbing these surfaces, not by layering new docs on top of them.

## Reusable Frontend Surface Inventory

### Shared component surface

The reusable component surface is already large and structurally rich:

- `src/components/wiki`: 78 components
- `src/components/quiz-v2`: 59 components
- `src/components/analytics`: 49 components
- `src/components/dashboard`: 38 components
- `src/components/ui`: 36 components
- `src/components/shared`: 36 components
- `src/components/admin`: 26 components
- `src/components/trails`: 21 components
- `src/components/marketing`: 20 components
- `src/components/ceo`: 19 components

### Feature module surface

| Feature module | Real `.tsx` components |
| --- | ---: |
| `src/features/3d-lab` | 57 |
| `src/features/wall-configurator` | 9 |

### Route-private extraction backlog

- The app currently contains 104 route-private `_components` files under `src/app`.
- Distribution:
  - `dashboard`: 66
  - `calculators`: 12
  - `admin`: 10
  - `developer`: 9
  - `(auth)`: 6
  - `(protected)/ceo`: 1

### What belongs in Storybook

Storybook should document only:

- stable, reusable components in `src/components`
- extracted public components from `src/features`
- composition scenes intentionally created for documentation

Storybook should not document:

- route-private `_components` directly
- page files under `src/app`
- dead or transitional documentation scaffolding

## Secondary Code Audit: Concrete Refactor Targets

### Dead duplicate route tree: `src/app/dashboard/developer`

- `src/app/dashboard/developer/layout.tsx` redirects to `/developer`.
- Despite that redirect, duplicate child implementations still exist under:
  - `src/app/dashboard/developer/console/*`
  - `src/app/dashboard/developer/db/*`
  - `src/app/dashboard/developer/docs/*`
  - `src/app/dashboard/developer/logs/*`
  - `src/app/dashboard/developer/test-data/*`
- Exact duplicate file pairs exist for:
  - `console-client.tsx`
  - `db/page.tsx`
  - `logs/page.tsx`
  - `test-data/page.tsx`
  - `test-data/test-data-client.tsx`

This is dead maintenance weight, not intentional multi-surface reuse. Storybook work should not start until the route tree is collapsed to one canonical implementation.

### Developer portal is bypassing shared primitives that already exist

The second audit found repeated developer-portal UI patterns that should converge on existing shared components rather than spawning new developer-only abstractions.

| Audit finding | Existing shared primitive | Affected files | Directive |
| --- | --- | --- | --- |
| Repeated page-header blocks with eyebrow, title, and description | `src/components/shared/section-header.tsx` | `src/app/developer/page.tsx`, `src/app/developer/tools/page.tsx`, `src/app/developer/status/page.tsx`, `src/app/developer/status/database/page.tsx`, `src/app/developer/status/infrastructure/page.tsx`, `src/app/developer/api-reference/page.tsx`, `src/app/developer/architecture/page.tsx` | Use `SectionHeader level="page"` as the canonical header primitive |
| Dormant overlapping header primitive | `src/components/shared/section-header.tsx` already covers page-level use | `src/components/shared/page-header.tsx` | Retire `page-header.tsx` unless a distinct second use appears |
| Custom portal navigation tiles built from `Link + Card` | `src/components/shared/action-card.tsx` | `src/app/developer/page.tsx`, `src/app/developer/tools/page.tsx` | Reuse `ActionCard` where card shape is icon + title + description + optional badge |
| Hand-rolled developer tables and empty states | `src/components/shared/data-table.tsx`, `src/components/shared/empty-state.tsx` | `src/app/developer/tools/db/page.tsx`, `src/app/developer/tools/logs/page.tsx` | Normalize onto shared table and empty-state primitives instead of adding a developer-only table wrapper |
| Parallel breadcrumb rendering | `src/components/shared/breadcrumb.tsx` | `src/components/developer/Breadcrumbs.tsx` | Keep segment-to-label mapping local, but delegate rendering to shared `Breadcrumb` |
| Duplicate relative-time helpers | `src/lib/utils/format-time` | `src/app/developer/status/database/page.tsx`, `src/app/developer/status/infrastructure/page.tsx` | Replace local `timeAgo()` helpers with the shared formatter or a single local status formatter |

### Exact duplicate wiki widget files

The wiki widget layer contains file-level duplicates, not just similar implementations:

| Duplicate pair | Current export state | Required direction |
| --- | --- | --- |
| `src/components/wiki/widgets/bp344/RecallDrill.tsx` and `src/components/wiki/widgets/bp344/RecallPractice.tsx` | Both export `RecallDrill` | Keep one canonical implementation file |
| `src/components/wiki/widgets/dsgn013/DimensionDrill.tsx` and `src/components/wiki/widgets/dsgn013/DimensionPractice.tsx` | Both export `DimensionDrill` | Keep one canonical implementation file |
| `src/components/wiki/widgets/dsgn013/BodyDimensionDrill.tsx` and `src/components/wiki/widgets/dsgn013/BodyDimensionPractice.tsx` | Both export `BodyDimensionDrill` | Keep one canonical implementation file |
| `src/components/wiki/widgets/dsgn013/SpatialQualityDrill.tsx` and `src/components/wiki/widgets/dsgn013/SpatialQualityPractice.tsx` | Both export `SpatialQualityDrill` | Keep one canonical implementation file |

The live widget registry uses the `*Drill` paths, so Storybook should document only the canonical drill components. Any legacy `*Practice` paths should become thin aliases or be deleted if they are truly unused.

### Non-targets from the second audit

The second audit also identified several local helpers that should remain local for now. They are not repeated enough to justify extraction.

| File | Why it stays local for now |
| --- | --- |
| `src/app/admin/3d-models/_components/ModelConfigDetail.tsx` local `DataTable` | It renders arbitrary config records and nested object inspection; no second consumer exists |
| `src/app/admin/knowledge/analytics/page.tsx` local `CoverageRow` | Single-surface analytical row, too narrow to promote |
| `src/components/quiz-v2/results/SimulationDebrief.tsx` local `SectionHeader` | Styling is local to one debrief surface and does not yet justify widening the shared API |
| `src/app/dashboard/3d-lab/_components/ComplianceReportPanel.tsx` local `StatusBadge` | Domain semantics are different from developer status and content-status badges |

## Wiki Article System Audit

### Live page composition

The wiki article route at `src/app/dashboard/wiki/[slug]/page.tsx` composes a mature article system from reusable parts:

- `WikiHeader`
- `WikiArticleHero`
- `WikiArticle`
- `TeachBackPrompt`
- `WrongAnswerBanner`
- `WikiReadTracker`
- `WikiRightSidebar`

### Wiki component structure

| Wiki area | Real `.tsx` components |
| --- | ---: |
| `blocks` | 29 |
| `navigation` | 15 |
| `widgets/dsgn013` | 13 |
| `shared` | 7 |
| `widgets/bp344` | 7 |
| `article` | 4 |
| `quiz` | 2 |
| `widgets/Lab3DWidget.tsx` | 1 |

### Why the wiki needs its own Storybook section

- `src/components/wiki/article/WikiArticle.tsx` is not a trivial renderer. It compiles MDX, injects EI prompts, resolves widgets dynamically, and maps many custom article blocks.
- `src/components/wiki/index.ts` already behaves like a partial public API for the article system.
- `src/components/wiki/widgets/registry.ts` is a lazy registry with multiple widget families and is a real domain system, not a generic UI primitive collection.
- The wiki surface combines:
  - article shell components
  - MDX blocks
  - pedagogical interactions
  - navigation utilities
  - interactive widgets

This is exactly the kind of domain-specific system that should receive detailed Storybook coverage instead of being hidden behind generic scaffolding.

## Technical Constraint: Storybook Runtime vs Next.js Runtime

- Storybook currently runs on `@storybook/react-vite`.
- Several target components are client components with browser API dependencies:
  - `navigator.clipboard`
  - `IntersectionObserver`
  - `window.location`
  - `next-themes`
- Several target components are also async server components or import server actions directly:
  - `WikiArticle` is async and server-rendered
  - `WikiRightSidebar` calls server actions for bookmarks and feedback

This means the overhaul cannot treat Storybook as a direct runtime mirror of the app.

The plan must therefore introduce:

- provider decorators
- browser API mocks
- fixture-based adapters for server components
- separation between component stories and full-page compositions

# Design

## Canonical Ownership Model

| Surface | Future role |
| --- | --- |
| Storybook | Single source of truth for reusable component documentation |
| `/developer` portal | Architecture docs, API reference, status, tools |
| `/developer/components` | Remove as a docs destination; optionally replace with redirect to Storybook |
| `src/lib/developer/componentRegistry.ts` | Remove or replace only if a live runtime search feature still truly depends on it |
| `src/app/dashboard/developer/docs` | Merge into `/developer/architecture` or retire |
| `src/app/**/_components` | Stay private until extracted; do not document directly in Storybook |

## Pragmatic Modularization Rules

- Prefer converging on an existing shared primitive before creating a new component.
- Extract only when a block appears across multiple real surfaces or when a single large file contains a clearly reusable semantic unit.
- Do not create new shared components for tiny wrappers, local rows, or one-page helper elements.
- Route aliases should use redirects or thin wrappers, never copied page implementations.
- Same-name components are not automatically duplicates. Keep them separate when their semantics differ.

## Canonical Shared Primitive Decisions From The Second Audit

| Concern | Canonical direction | Explicit non-goal |
| --- | --- | --- |
| Page and section headers | `SectionHeader` becomes the canonical shared header primitive | Do not keep both `page-header.tsx` and `section-header.tsx` as overlapping shared APIs |
| Developer portal tiles | Reuse `ActionCard` for full navigation cards where the shape already matches | Do not invent a new developer-only card primitive for the same card structure |
| Developer tables | Reuse `DataTable` and `EmptyState` for stable tabular admin/developer surfaces | Do not add a `DeveloperDataTable` wrapper unless a real cross-portal gap appears |
| Developer breadcrumbs | Keep developer path-to-label mapping local, render through shared `Breadcrumb` | Do not maintain parallel breadcrumb markup once the shared primitive is sufficient |
| Status badges | Keep `src/components/developer/StatusBadge.tsx` for infrastructure health semantics | Do not force-merge it with the content-oriented `StatusBadge` inside `src/components/ui/badge.tsx` |
| Wiki drill widgets | One canonical implementation per drill widget | Do not preserve duplicated `*Practice` and `*Drill` implementations in parallel |

## Storybook Information Architecture

### Top-level taxonomy

```text
Foundations/
  UI/
  Tokens/
  Typography/
  Layout Primitives/

Patterns/
  Shared/
  Portal/
  Data Display/
  Empty and Loading States/

Wiki/
  Article/
  Navigation/
  Blocks/
  Teaching/
  Sources and Notes/
  Widgets/
    BP344/
    DSGN013/
    Integrations/
  Compositions/

Internal/
  Developer Status/
  Calculator Support/

Scenes/
  Portal Shells/
  Wiki Full Article/
  Cross-component reference layouts/
```

### Story title convention

- `Foundations/UI/Button`
- `Foundations/UI/Card`
- `Patterns/Shared/Data Table`
- `Wiki/Article/Wiki Article Hero`
- `Wiki/Blocks/Callout`
- `Wiki/Teaching/Teach Back Prompt`
- `Wiki/Widgets/BP344/Door Configurator`
- `Scenes/Wiki/Full Article Layout`

### Ownership rule

- One documented component has one canonical source path.
- One canonical source path has one Storybook story module.
- Variants live inside that story module, not as parallel documentation surfaces in `/developer`.

## Story Authoring Standard

Each story module must document actual usage, not just render a stub.

Every production story should include:

- clear component intent
- canonical import path
- realistic args or fixtures
- primary, secondary, and edge states
- accessibility notes where behavior changes
- route or feature usage notes
- known coupling to providers, browser APIs, or server data

The following should be banned from the codebase:

- `Story scaffold for`
- placeholder text that only repeats the import path
- story modules with no real component import
- passive docs entries that duplicate the old developer component library

## Runtime and Fixture Architecture

### Storybook should mirror the live app where it matters

Storybook preview should wrap stories in the providers that components actually expect:

- `ThemeProvider`
- `TooltipProvider`
- optional `Toaster` harness for toast-driven components

Storybook should not globally mount visual noise or app-only chrome that makes stories harder to read:

- `NoiseFilter` should be opt-in for scenes, not a universal decorator
- `NavigationProgress` should be omitted from component-level docs
- `DevModeOverlay` and `DemoShell` should not be part of global story decorators

### Shared Storybook support layer

Create a local Storybook support layer, for example under `src/storybook/`, with:

- `decorators/`
- `fixtures/`
- `mocks/`
- `scenes/`
- `docs/`

This layer should own:

- app provider decorators
- router and `next/link` helpers
- `navigator.clipboard` mock
- `IntersectionObserver` mock
- sample wiki article data
- mock server-action adapters for interactive stories

### Server component strategy

Do not document async server components by importing pages into Storybook directly.

Instead:

- extract pure presentational subcomponents where needed
- build fixture-driven adapters for server-rendered compositions
- keep page-level reference stories in `Scenes/`, not in `src/app`

## Story Discovery Rules

### Required change to story scanning

Current globs are too permissive because they invite page-level stories and route-level duplication.

Target approach:

- keep Storybook focused on `src/components`
- allow curated stories from `src/features`
- remove routine scanning of `src/app`
- add a dedicated `src/storybook/scenes` location for composition stories

Target principle:

- no regular `src/app/**/*.stories.tsx`
- no route-private `_components` stories
- no documentation surface that competes with Storybook

## Wiki Dedicated Section Design

### 1. Article

Document the structural shell and article-entry components:

- `WikiArticleHero`
- `WikiArticleHeader`
- `WikiItemRenderer`
- `WikiArticle` through a fixture adapter, not as raw app runtime

### 2. Navigation

Document article navigation and reading support:

- `WikiHeader`
- `WikiContentShell`
- `WikiTableOfContents`
- `WikiRightSidebar`
- `WikiSidebar`
- `WikiReadingProgress`

### 3. Blocks

Document the custom MDX block system in grouped stories:

- `Callout`, `Note`, `Warn`, `Tip`, `Example`
- `WikiCalloutBox`
- `WikiExamTable`
- `WikiPartHeader`
- `WikiChangedPill`
- `WikiMistakeCard`
- `WikiMistakeList`
- `ComparisonTable`
- `FormulaBlock`
- `KeyValues`
- `ProcessFlow`
- `RevealBlock`
- `LawCallout`
- `Mermaid`
- `SubjectSnapshot`
- `Accordion` and `WikiAccordion`
- `Tabs` and `WikiTabs`

### 4. Teaching

Document the pedagogical interaction layer:

- `InlineQuiz`
- `TeachBackPrompt`
- `ElaborativeInterrogation`
- `PrequestionGate`
- `WrongAnswerBanner`
- `WikiQuizButton`
- `WikiQuizModal`

### 5. Sources and Notes

Document article-side learning utilities:

- `WikiSourcesPopover`
- `WikiRelatedPopover`
- `WikiReference`
- `WikiTextSelection`
- `WikiNoteAnchor`
- `WikiHighlighter`
- `WikiReadTracker`

### 6. Widgets

Split widgets by domain because they are not generic UI:

- `Wiki/Widgets/BP344/*`
- `Wiki/Widgets/DSGN013/*`
- `Wiki/Widgets/Integrations/Lab3DWidget`

### 7. Compositions

Add high-value composition scenes for:

- full article shell with right rail
- article with multiple MDX block types
- article with wrong-answer recovery context
- article with one BP344 widget
- article with one DSGN013 widget

These scenes should be documentation assets, not page clones.

## Redundancy Elimination Rules

The overhaul should enforce the following rules:

1. No component docs in `/developer/components`.
2. No stale component metadata registry that drifts from the file system.
3. No duplicate wrappers for already-exported shared components.
4. No Storybook stories for route-private `_components` until they are promoted.
5. No second docs surface under `/dashboard/developer` if the same role is served by `/developer` or Storybook.
6. No placeholder story files preserved "for later".
7. No duplicate import paths for the same documented component.
8. Prefer existing shared primitives over new portal-specific wrappers.
9. Route aliases must use redirects or thin wrappers, not copied implementations.
10. Same-name components with different semantics must not be merged just to reduce file count.

# Implementation

## Phase 0: Baseline and Freeze

### Goals

- Freeze generation of new placeholder stories.
- Establish the migration boundary before any new docs are added.

### Actions

1. Record the current Storybook inventory and tag every story file as:
   - keep and upgrade
   - replace
   - delete
2. Add a temporary repository check that fails on the string `Story scaffold for`.
3. Create a Storybook migration tracker under `.ai/plans` or adjacent implementation notes so the replacement work stays measurable.

### Exit criteria

- No new placeholder stories can enter the repo.
- Every current story file has a migration disposition.

## Phase 1: Remove the Old Developer Component-Library Surface

### Goals

- Remove stale and competing component docs surfaces before building the new one.

### Actions

1. Remove `/developer/components` from:
   - `src/app/developer/_components/DevPortalSidebar.tsx`
   - `src/app/developer/_components/DevPortalSearch.tsx`
   - `src/lib/constants/routes.ts`
2. Decide the route behavior for `/developer/components`:
   - preferred: redirect to Storybook once Storybook is published
   - fallback: delete the route and let the portal stop advertising it
3. Delete or retire `src/lib/developer/componentRegistry.ts` unless a proven runtime dependency remains after code search.
4. Remove duplicate wrappers:
   - `src/app/developer/_components/CopyButton.tsx`
   - `src/app/developer/_components/PropTable.tsx`
5. Audit `src/components/developer/`:
   - keep live status components used by `/developer/status`
   - retire old component-library-only helpers if they have no remaining caller
6. Merge or retire `src/app/dashboard/developer/docs/page.tsx`.

### Exit criteria

- No live navigation points to `/developer/components`.
- No stale component registry remains as a second source of truth.
- Duplicate wrappers are removed.

## Phase 2: Rebuild Storybook Foundation

### Goals

- Turn Storybook into a reliable documentation runtime for this specific Next.js app.

### Actions

1. Narrow story discovery in `.storybook/main.ts` to public components and curated scenes.
2. Stop using Storybook as a page scanner for `src/app`.
3. Add a Storybook support layer for:
   - decorators
   - fixtures
   - mocks
   - scenes
4. Update `.storybook/preview.ts` to provide the provider stack components actually need.
5. Add browser API mocks for clipboard and intersection observers.
6. Add reusable wiki fixtures and portal fixtures.
7. Decide whether passive autodocs should be disabled by default so docs become opt-in and intentional.

### Exit criteria

- Storybook can render theme-dependent, tooltip-dependent, and browser-API-dependent components consistently.
- No component story depends on app pages or live server data.

## Phase 2.5: Canonicalize Shared UI Primitives Before Story Authoring

### Goals

- Remove dead duplicate route implementations.
- Settle the canonical shared primitives that Storybook will document.
- Reduce UI redundancy without introducing new micro-components.

### Actions

1. Collapse the dead duplicate `/dashboard/developer` route subtree:
   - delete duplicate page/client implementations under `console`, `db`, `docs`, `logs`, and `test-data`
   - keep only redirect behavior or thin alias wrappers if legacy links must survive
2. Standardize developer portal page headers onto `SectionHeader level="page"` across:
   - `src/app/developer/page.tsx`
   - `src/app/developer/tools/page.tsx`
   - `src/app/developer/status/page.tsx`
   - `src/app/developer/status/database/page.tsx`
   - `src/app/developer/status/infrastructure/page.tsx`
   - `src/app/developer/api-reference/page.tsx`
   - `src/app/developer/architecture/page.tsx`
3. Resolve shared-header overlap:
   - migrate any remaining usage intent from `src/components/shared/page-header.tsx` into `SectionHeader`
   - delete or archive `page-header.tsx` if it remains unused after migration
4. Refactor `src/components/developer/Breadcrumbs.tsx` to generate breadcrumb items and render them through `src/components/shared/breadcrumb.tsx`.
5. Migrate developer DB and logs surfaces onto `DataTable` and `EmptyState`:
   - `src/app/developer/tools/db/page.tsx`
   - `src/app/developer/tools/logs/page.tsx`
   Do not add a developer-only table component.
6. Replace duplicate developer `timeAgo()` helpers with `formatRelativeTime` or a single local status formatter shared by the status pages.
7. Reuse `ActionCard` for developer portal navigation cards where the card shape already matches:
   - section cards in `src/app/developer/page.tsx`
   - tool cards in `src/app/developer/tools/page.tsx`
   Keep the smaller quick-action cards inline unless a second real consumer appears.
8. Keep `src/components/developer/StatusBadge.tsx` domain-specific; do not merge it into `src/components/ui/badge.tsx`.

### Exit criteria

- No dead duplicate implementations remain under `src/app/dashboard/developer`.
- Developer pages no longer hand-roll headers, breadcrumb markup, or simple tables where shared primitives already exist.
- Shared header ownership is reduced to one canonical primitive.

## Phase 3: Replace Placeholder Stories With Real Documentation

### Goals

- Remove the 71 placeholder stories and replace only the stories that matter.

### Actions

1. Delete or rewrite every scaffold story under:
   - `src/components/ui`
   - `src/components/shared`
2. Start with the most reused foundational components:
   - `button`
   - `card`
   - `badge`
   - `input`
   - `dialog`
   - `tooltip`
   - `tabs`
   - `accordion`
   - `separator`
3. Then document high-reuse shared patterns:
   - `data-table`
   - `empty-state`
   - `section-header`
   - `action-card`
   - `DashboardHeader`
   - `CodeBlock`
   - `SlatecampLoader`
   - `question-card`
4. Do not preserve Storybook coverage for dormant shared primitives that lose the canonical decision in Phase 2.5.
5. Preserve and improve the 9 non-scaffold stories rather than rewriting them blindly.

### Exit criteria

- Placeholder story count is `0`.
- Every surviving story imports and documents a real component.

## Phase 4: Build the Wiki Storybook Section

### Goals

- Give the wiki article system first-class documentation coverage.

### Actions

1. Create the `Wiki/` top-level Storybook section.
2. Build article-shell stories first:
   - `WikiArticleHero`
   - `WikiHeader`
   - `WikiRightSidebar`
   - `WikiTableOfContents`
   - `WikiContentShell`
3. Build block-level stories second:
   - callout family
   - `WikiExamTable`
   - `FormulaBlock`
   - `ComparisonTable`
   - `KeyValues`
   - `RevealBlock`
   - `ProcessFlow`
   - `SubjectSnapshot`
4. Build pedagogical stories third:
   - `InlineQuiz`
   - `TeachBackPrompt`
   - `ElaborativeInterrogation`
   - `WrongAnswerBanner`
   - `WikiQuizButton`
   - `WikiQuizModal`
5. Build utility stories fourth:
   - `WikiSourcesPopover`
   - `WikiRelatedPopover`
   - `WikiReference`
   - `WikiTextSelection`
   - `WikiNoteAnchor`
6. Before widget story authoring, consolidate exact duplicate widget file pairs:
   - `bp344/RecallPractice.tsx` + `bp344/RecallDrill.tsx`
   - `dsgn013/DimensionPractice.tsx` + `dsgn013/DimensionDrill.tsx`
   - `dsgn013/BodyDimensionPractice.tsx` + `dsgn013/BodyDimensionDrill.tsx`
   - `dsgn013/SpatialQualityPractice.tsx` + `dsgn013/SpatialQualityDrill.tsx`
   Keep a single canonical implementation file per widget and preserve aliases only where legacy imports or content still require them.
7. Build widget stories fifth, grouped by domain:
   - BP344
   - DSGN013
   - Lab integration
8. Build composition scenes last using fixture data.

### Exit criteria

- Wiki has a dedicated Storybook section with article, navigation, block, teaching, utility, and widget coverage.
- At least one full article composition scene exists without depending on live page runtime.

## Phase 5: Extract Route-Private Components Worth Documenting

### Goals

- Reduce component duplication by promoting only the right private components into public shared ownership.

### Promotion criteria

Promote a route-private component only if it meets all of the following:

1. Used in more than one route or portal.
2. Has stable props that can be fixture-driven.
3. Does not depend on route-local server data shape.
4. Makes sense as a reusable UI pattern rather than page glue.

### Concrete extraction guidance from the second audit

- Promote existing shared primitives first. The second audit did not justify a new developer-only header, breadcrumb, table, or card library.
- Prefer deleting dead duplicates over extracting them. `src/app/dashboard/developer/**` is a cleanup target, not a new shared feature module.
- Treat the following as explicit non-targets for promotion until a second consumer appears:
  - `ModelConfigDetail.tsx` local record-inspection table
  - `CoverageRow` in `src/app/admin/knowledge/analytics/page.tsx`
  - `SectionHeader` in `src/components/quiz-v2/results/SimulationDebrief.tsx`
  - `StatusBadge` in `src/app/dashboard/3d-lab/_components/ComplianceReportPanel.tsx`
- If a candidate is only repeated because a route tree was copied, collapse the duplicate route first and reassess extraction after the copy is gone.

### Actions

1. Triage the 104 `_components` files.
2. Extract reusable candidates into `src/components` or `src/features`.
3. Leave page glue private and undocumented.
4. Add stories only after extraction, never before.

### Exit criteria

- Route-private components are no longer implicitly treated as shared library assets.
- Storybook coverage reflects only canonical public components.

## Phase 6: Governance and CI

### Goals

- Keep Storybook useful after the initial overhaul.

### Actions

1. Add CI for `build-storybook`.
2. Add a repo check that rejects:
   - `Story scaffold for`
   - story files without a real component import
3. Add a PR checklist item:
   - if a public reusable component is added or materially changed, Storybook docs must be added or updated
4. Add a component ownership rule to internal docs:
   - docs live in Storybook
   - operational and architecture docs live in `/developer`
5. Review stories by folder every sprint until the highest-value uncovered groups are addressed.

### Exit criteria

- Storybook stays buildable in CI.
- Placeholder docs cannot regress.
- Documentation ownership is unambiguous.

## Definition of Done

The Storybook overhaul is complete when all of the following are true:

- Placeholder story count is `0`.
- `/developer/components` is no longer a live documentation destination.
- There are no stale component-library links in developer navigation or route constants.
- `componentRegistry.ts` no longer acts as a stale parallel docs catalog.
- Dead duplicate implementations under `src/app/dashboard/developer` are removed or reduced to thin redirects.
- Duplicate developer wrappers are removed.
- One canonical shared page-header primitive remains.
- The duplicated wiki `*Practice` and `*Drill` widget files are consolidated to one implementation per widget.
- Storybook documents the canonical reusable component surface rather than app pages.
- The wiki article system has its own detailed Storybook section.
- Route-private `_components` are documented only after extraction to public ownership.
- Storybook is the single source of truth for reusable component documentation.

