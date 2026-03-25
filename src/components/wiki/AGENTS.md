<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# wiki

## Purpose

Knowledge base and reference system for SlateCamp. Renders structured article content with syntax highlighting, interactive widgets, pedagogical callouts, navigation, and inline learning aids (note anchors, bookmarks, highlights, teaching prompts, elaborative interrogation). The wiki is the primary context source for the AI Contextual Tutor and supports deep-dive learning between quiz sessions.

## Key Files

| File | Description |
|------|-------------|
| `WikiArticle.tsx` | Main article renderer using MDXRemote. Composes heading navigation, MDX components (callouts, tables, formulas, accordions, tabs, widgets), elaborative interrogation, mistake lists, inline quiz. |
| `WikiLayoutContent.tsx` | Inner content container. Applies typography, spacing, and responsive widths for readability. |
| `WikiContentShell.tsx` | Wrapper for article body. Manages scroll context, reading progress tracking, TOC sticky positioning. |
| `WikiHeader.tsx` | Top navigation bar with discipline/article breadcrumb, mobile menu toggle, search, settings. |
| `WikiHeaderClient.tsx` | Client-side header logic (mobile detection, drawer state). `'use client'` |
| `WikiArticleHeader.tsx` | Article title, discipline context, publication/update metadata, action buttons (bookmark, share, flag). |
| `WikiArticleHero.tsx` | Large hero section with article cover image, title, intro paragraph, estimated read time. `'use client'` |
| `WikiPartHeader.tsx` | Section divider header within article. Marks major structural boundaries. `'use client'` |
| `WikiSidebar.tsx` | Left sidebar with article taxonomy tree, related articles, search. Collapsible on mobile via rail+overlay pattern. `'use client'` |
| `WikiSidebarShell.tsx` | Container for sidebar. |
| `WikiSidebarLoader.tsx` | Lazy loader for sidebar content. |
| `WikiSidebarSkeleton.tsx` | Loading skeleton for sidebar. |
| `WikiRightSidebar.tsx` | Right sidebar with table of contents, reading progress, bookmark list, note anchors. |
| `WikiTableOfContents.tsx` | Interactive TOC extracted from h2/h3 headings. Scrolling highlights current section. Sticky positioning. |
| `WikiReadingProgress.tsx` | Progress bar or visual indicator showing scroll % through article. |
| `WikiNavigationContext.tsx` | Context provider for navigation state (current article, discipline, breadcrumb). |
| `WikiDisciplineContext.tsx` | Context provider for discipline metadata (id, name, tree, icon). |
| `WikiHighlighter.tsx` | User-initiated text selection highlight in color. Stores to user's personal workspace. |
| `WikiTextSelection.tsx` | Utility for capturing user text selection on mobile/desktop. |
| `WikiNoteAnchor.tsx` | Inline anchor for a user-created note or highlight. Shows note preview on hover. |
| `WikiBookmarks.tsx` | List of bookmarked articles or sections. |
| `WikiReadTracker.tsx` | Tracks user read progress per article (scroll depth, time spent). Persisted to user profile. |
| `WikiCallout.tsx` | Semantic callout component: Note, Warn, Tip, Example. Styled with Campfire colors + icons. |
| `WikiCalloutBox.tsx` | Container for callout content. Applies border, background tint, icon. |
| `WikiChangedPill.tsx` | Badge indicating "Updated X days ago" or "New." Content freshness indicator. `'use client'` |
| `WikiExamTable.tsx` | Styled table for exam content (requirements matrix, comparison table). Responsive grid on mobile. `'use client'` |
| `WikiMistakeCard.tsx` | Card highlighting a common misconception with correct principle. |
| `WikiMistakeList.tsx` | List of common mistakes for a topic. |
| `WikiSourcesPopover.tsx` | Popover with citation metadata and links to source documents. `'use client'` |
| `WikiRelatedPopover.tsx` | Popover suggesting related articles, prerequisite topics, or advanced depth. `'use client'` |
| `WrongAnswerBanner.tsx` | Banner above article when linked from incorrect quiz answer. |
| `Accordion.tsx` | Reusable accordion component (base UI). Used by WikiAccordion. |
| `WikiAccordion.tsx` | Accordion wrapper for MDX content. |
| `Tabs.tsx` | Reusable tab component (base UI). Used by WikiTabs. |
| `WikiTabs.tsx` | Tab wrapper for MDX content. |
| `AlertBox.tsx` | Alert box MDX component for important notices. |
| `AuthorityContent.tsx` | Authority content block for official references. |
| `Callout.tsx` | Generic callout MDX component. |
| `ComparisonTable.tsx` | Side-by-side comparison table MDX component. |
| `ExamTip.tsx` | Exam tip callout for test-relevant information. |
| `FormulaBlock.tsx` | Renders mathematical formulas/equations using KaTeX. `'use client'` |
| `GenericBlock.tsx` | Generic content block MDX component. |
| `InlineQuiz.tsx` | Embedded quiz within article body. Quick self-check with instant feedback. |
| `KeyValues.tsx` | Two-column key-value pairs (term, definition). |
| `LawCallout.tsx` | Specialized callout for legal/code reference (e.g., "IBC 101.2.1"). Uses monospace for code. |
| `ProcessFlow.tsx` | Process flow diagram MDX component. |
| `ElaborativeInterrogation.tsx` | "Why is this true?" prompts activating deeper recall. Toggles reveal of deeper explanation. `'use client'` |
| `TeachBackPrompt.tsx` | "Explain this concept in your own words." Text input + AI evaluation. `'use client'` |
| `index.ts` | Barrel exports for wiki components. |
| `mdx-components-shared.ts` | Shared MDX component mappings for article rendering. |
| `parse-mdx-prop.ts` | Utility for parsing MDX component props from content. |
| `transform-mistake-string.ts` | Utility for transforming mistake data into display format. |
| `wiki-icons.ts` | Wiki-specific icon definitions. |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `widgets/` | Interactive widget subdirectory with registry | 1 file (registry.ts) |
| `widgets/bp344/` | Building Performance 344 code widgets | 7 files |
| `widgets/dsgn013/` | Design/ergonomics widgets | 10 files |

### widgets/bp344/

| File | Description |
|------|-------------|
| `DoorConfigurator.tsx` | Interactive door opening width, threshold height, approach space validator. `'use client'` |
| `GrabBarExplainer.tsx` | 3D grab bar placement and specification tool. `'use client'` |
| `CorridorVisualizer.tsx` | 2D corridor layout with width, cross-slope, tactile warning visualization. `'use client'` |
| `CubicleChecker.tsx` | Cubicle dimension checker with compliance legend. `'use client'` |
| `ComparisonTable.tsx` | Side-by-side comparison of code requirements. `'use client'` |
| `RecallDrill.tsx` | Spaced repetition drill for code dimensions/requirements. `'use client'` |
| `index.ts` | Barrel exports for bp344 widgets. |

### widgets/dsgn013/

| File | Description |
|------|-------------|
| `BodyDimensionExplorer.tsx` | Interactive explorer of male/female body dimensions (percentiles: 5th, 50th, 95th). `'use client'` |
| `BodyDimensionDrill.tsx` | Spaced repetition drill for body dimension questions. `'use client'` |
| `DimensionDrill.tsx` | General-purpose dimension flashcard tool. `'use client'` |
| `BedSizeComparator.tsx` | Interactive bed size comparison with dimensions. `'use client'` |
| `BedroomPlanView.tsx` | Top-down 2D bedroom plan view with draggable furniture. `'use client'` |
| `ReachEnvelopeDiagram.tsx` | Visualization of comfortable reach envelope. `'use client'` |
| `SpatialQualityDrill.tsx` | Drill for spatial quality dimension questions. `'use client'` |
| `ProportionComparator.tsx` | Slider to compare proportional dimensions. `'use client'` |
| `DHRatioExplorer.tsx` | Door height ratio explorer. `'use client'` |
| `WorkstationCalculator.tsx` | Ergonomic workstation calculator based on user height. `'use client'` |

## For AI Agents

### Working In This Directory

The wiki is a **structured knowledge base** designed for reference and deep learning between quiz sessions. Articles are authored in Markdown with custom MDX syntax for callouts, widgets, and learning aids.

**Critical constraints:**
1. **Widget registration:** New widgets must be added to `widgets/registry.ts` with a unique namespace (e.g., `bp344/WidgetName`). Do NOT hardcode widget imports in WikiArticle.tsx.
2. **No quiz content in wiki:** The wiki explains *concepts*. Quiz *questions* live separately and link to wiki for rationales.
3. **Citation badges required:** Any AI-generated explanation must include citation badges linking to exact Wiki paragraph IDs.
4. **Reading progress:** Track scroll depth and time spent. Persist to user profile for analytics.
5. **Responsive:** Mobile-first. Sidebar collapses to rail+overlay (like Supabase/GitHub). NEVER use inline collapsible width transitions.

**Pedagogical hooks:**
- **Elaborative Interrogation:** "Why is this true?" prompts activate deeper recall.
- **Teach-Back:** Ask users to explain concepts in their own words.
- **Spaced Repetition:** Inline quizzes and drills within article body.
- **Mistake highlighting:** Common misconceptions paired with correct principles.
- **Related articles:** Link to prerequisites, advanced depth, and alternative explanations.

**Language:** Growth-framed. Avoid "weakness," "gap," "behind." Use "developing skill," "area to revisit," "strengthen understanding."

### Common Patterns

1. **MDX composition:** Articles import MDX components for callouts, formulas, tabs, accordions, widgets, and learning aids. Each component receives `children` (from Markdown) or explicit props.
2. **Widget isolation:** Widgets are standalone client components. They receive article context (nodeId, nodeName) but manage their own state. Use `'use client'` at the top.
3. **Sidebar pattern:** Rail (icon buttons) on left when wide, drawer on mobile. NO inline width transitions. Use Framer Motion for drawer slide.
4. **TOC generation:** Headings (h2, h3) are auto-collected and rendered in right sidebar. Use consistent heading structure.
5. **Note anchors:** User-created notes/highlights are stored in personal workspace and linked back as inline elements with hover previews.
6. **Image & diagram responsive:** Use Next.js Image with responsive sizes. SVG diagrams scale via viewBox.

## Dependencies

### Internal

- `@/types/app` -- WikiArticle, TocHeading, EIPrompt, EIResponseMap, TaxonomyNode
- `@/lib/wiki-markdown` -- extractHeadings(), heading ID generation, Markdown utilities
- `@/lib/actions/ei-prompts` -- Elaborative interrogation prompt fetching
- `@/lib/routes` -- GROUPED_NAVIGATION for sidebar tree
- `@/components/ui/*` -- shadcn/ui (Sheet, Tooltip, etc.)
- `@/components/graphics/icons/Icon` -- SCIcon wrapper for Phosphor
- `@/components/shared/score-display` -- Score display utilities

### External

- `react` (19.x) -- Hooks, Suspense, context
- `next-mdx-remote/rsc` -- Server-side MDX rendering
- `remark-gfm` -- GitHub Flavored Markdown plugin
- `framer-motion` -- Drawer animations, transitions
- `@phosphor-icons/react` -- Icon set
- `katex` -- LaTeX math rendering (FormulaBlock)
- `recharts` (if any charts in widgets)

## Campfire Design System

### Colors & Styling

- **Text:** text-[#1A2332] (primary), text-[#4A5568] (secondary), text-[#8896A7] (tertiary)
- **Borders:** border-[#D4DAE3] (#D4DAE3)
- **Backgrounds:** bg-white (content), bg-[#F8F7F5] (page), callout tints per type (Info Blue, Warm Red, Amber, Emerald with 50 variant)
- **Callout colors:**
  - Note: Info Blue (#3B82C8) + bg-[#F0F6FF] (approx)
  - Warn: Warm Red (#D64545) + bg-[#FDF0F0]
  - Tip: Emerald (#2D9F6F) + bg-[#EDFAF4]
  - Example: Amber (#D4951A) + bg-[#FEF8ED]
- **Shadows:** shadow-sm (cards), shadow-md (popovers)
- **Radii:** rounded-sm (6px), rounded-md (8px)
- **Transitions:** max 300ms, duration-150 ease-out

### Typography

- Minimum text: 11px. NEVER 8/9/10px.
- Monospace ONLY on code, formulas, specifications. NOT on labels.
- Inter via next/font/google.
- Code blocks: light background, line numbers optional, syntax highlighting.

<!-- MANUAL: -->
