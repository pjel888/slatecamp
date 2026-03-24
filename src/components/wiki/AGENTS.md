<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# wiki

## Purpose

Knowledge base and reference system for SlateCamp. Renders structured article content with syntax highlighting, interactive widgets, pedagogical callouts, navigation, and inline learning aids (note anchors, bookmarks, highlights, teaching prompts, elaborative interrogation). The wiki is the primary context source for the AI Contextual Tutor and supports deep-dive learning between quiz sessions.

## Key Files

| File | Description |
|------|-------------|
| `WikiArticle.tsx` | Main article renderer using MDXRemote. Composes heading navigation, MDX components (callouts, tables, formulas, accordions, tabs, widgets), elaborative interrogation, mistake lists, inline quiz. |
| `WikiLayoutClient.tsx` | Client-side layout shell. Wraps article content, manages mobile nav drawer (left sidebar), responds to viewport changes. |
| `WikiContentShell.tsx` | Wrapper for article body. Manages scroll context, reading progress tracking, TOC sticky positioning. |
| `WikiLayoutContent.tsx` | Inner content container. Applies typography, spacing, and responsive widths for readability. |
| `WikiHeader.tsx` | Top navigation bar with discipline/article breadcrumb, mobile menu toggle, search, settings. |
| `WikiHeaderClient.tsx` | Client-side header logic (mobile detection, drawer state). |
| `WikiArticleHeader.tsx` | Article title, discipline context, publication/update metadata, action buttons (bookmark, share, flag). |
| `WikiArticleHero.tsx` | Large hero section with article cover image, title, intro paragraph, estimated read time. |
| `WikiPartHeader.tsx` | Section divider header within article. Marks major structural boundaries. |
| `WikiSidebar.tsx` | Left sidebar with article taxonomy tree, related articles, search. Collapsible on mobile via rail+overlay pattern. |
| `WikiSidebarShell.tsx` | Container for sidebar. |
| `WikiRightSidebar.tsx` | Right sidebar with table of contents, reading progress, bookmark list, note anchors. |
| `WikiTableOfContents.tsx` | Interactive TOC extracted from h2/h3 headings. Scrolling highlights current section. Sticky positioning. |
| `WikiReadingProgress.tsx` | Progress bar or visual indicator showing scroll % through article. May link to sections. |
| `WikiNavigationContext.tsx` | Context provider for navigation state (current article, discipline, breadcrumb). |
| `WikiDisciplineContext.tsx` | Context provider for discipline metadata (id, name, tree, icon). |
| `WikiHighlighter.tsx` | User-initiated text selection → highlight in color (per note/bookmark context). Stores to user's personal workspace. |
| `WikiTextSelection.tsx` | Utility for capturing user text selection on mobile/desktop. Prevents default behavior, triggers note action menu. |
| `WikiNoteAnchor.tsx` | Inline anchor for a user-created note or highlight. Shows note preview on hover. Links to workspace. |
| `WikiNoteAction.tsx` | Post-selection menu: Create Note, Add Bookmark, Flag for Review, Share. Modal to capture note text. |
| `WikiBookmarks.tsx` | List of bookmarked articles or sections. May appear in right sidebar or as dedicated modal. |
| `WikiReadTracker.tsx` | Tracks user read progress per article (scroll depth, time spent, comprehension check). Persisted to user profile. |
| `WikiCallout.tsx` | Semantic callout components: Note, Warn, Tip, Example, Callout (generic). Styled with Campfire colors + icons. |
| `WikiCalloutBox.tsx` | Container for callout content. Applies border, background tint, icon. |
| `LawCallout.tsx` | Specialized callout for legal/code reference (e.g., "IBC 101.2.1"). Uses monospace for code. |
| `FormulaBlock.tsx` | Renders mathematical formulas/equations. May use KaTeX or MathJax. |
| `KeyValues.tsx` | Two-column key-value pairs (term, definition). Useful for glossaries, specs. |
| `WikiExamTable.tsx` | Styled table for exam content (requirements matrix, comparison table, specification table). Responsive grid on mobile. |
| `Tabs.tsx` | Reusable tab component (base UI). Used by WikiTabs. |
| `WikiTabs.tsx` | Tab wrapper for MDX. Useful for showing multiple related examples (e.g., code in Python vs. Pseudocode). |
| `Accordion.tsx` | Reusable accordion component (base UI). Used by WikiAccordion. |
| `WikiAccordion.tsx` | Accordion wrapper for MDX. Useful for collapsing lengthy optional content. |
| `WikiMistakeCard.tsx` | Card highlighting a common misconception with correct principle. Sourced from question rationale data. |
| `WikiMistakeList.tsx` | List of common mistakes for a topic. Compiled from question feedback. |
| `InlineQuiz.tsx` | Embedded quiz within article body. Quick self-check (1–3 questions) with instant feedback. Not scored; pedagogical only. |
| `ElaborativeInterrogation.tsx` | Prompt: "Why is this true? How does it connect to...?" Toggles reveal of deeper explanation. Spaced repetition hook. |
| `TeachBackPrompt.tsx` | Prompt: "Explain this concept in your own words." Text input + AI evaluation (optional). Retrieval practice. |
| `WikiSourcesPopover.tsx` | Popover with citation metadata and links to source documents. Links to exact Wiki paragraphs. |
| `WikiRelatedPopover.tsx` | Popover suggesting related articles, prerequisite topics, or advanced depth. |
| `WikiChangedPill.tsx` | Badge indicating "Updated X days ago" or "New." Helps users know content freshness. |
| `WikiNoteAnchor.tsx` | Inline link to a note or highlight. Shows creator, timestamp, content preview. |
| `WrongAnswerBanner.tsx` | Banner above article when linked from incorrect quiz answer. "You missed this — here's the concept:" |
| `widgets/bp344/` | **Building Performance 344 widget set** — Building code/accessibility. Includes: |
| `widgets/bp344/DoorConfigurator.tsx` | Interactive door opening width, threshold height, approach space validator. Real-time compliance checking against code. |
| `widgets/bp344/GrabBarExplainer.tsx` | 3D grab bar placement and specification tool with measurement inputs. |
| `widgets/bp344/CorridorVisualizer.tsx` | 2D corridor layout with width, cross-slope, tactile warning visualization. |
| `widgets/bp344/CubicleChecker.tsx` | Cubicle dimension checker (width, depth, knee space) with compliance legend. |
| `widgets/bp344/ComparisonTable.tsx` | Side-by-side comparison of code requirements (old vs. new, ADA vs. IBC, etc.). |
| `widgets/bp344/RecallDrill.tsx` | Spaced repetition drill for code dimensions/requirements (flashcard style). |
| `widgets/dsgn013/` | **Design 013 widget set** — Ergonomic/anthropometric data. Includes: |
| `widgets/dsgn013/BodyDimensionExplorer.tsx` | Interactive explorer of male/female body dimensions (percentiles: 5th, 50th, 95th). Highlights architectural relevance (e.g., eye height → sightlines). |
| `widgets/dsgn013/BodyDimensionDrill.tsx` | Spaced repetition drill: "What dimension determines shelf height?" with multiple-choice or free-text response. |
| `widgets/dsgn013/DimensionDrill.tsx` | General-purpose dimension flashcard tool. |
| `widgets/dsgn013/BedSizeComparator.tsx` | Interactive bed size comparison (Twin, Full, Queen, King, California King) with dimensions, diagonal, use cases. |
| `widgets/dsgn013/BedroomPlanView.tsx` | Top-down 2D bedroom plan view. Draggable furniture, dimension readout, collision detection. |
| `widgets/dsgn013/ReachEnvelopeDiagram.tsx` | Visualization of comfortable reach envelope (arm extension, forward reach, upward reach) for different seated positions. |
| `widgets/dsgn013/SpatialQualityDrill.tsx` | Drill: "What is the maximum comfortable reach overhead?" with dimension-based feedback. |
| `widgets/dsgn013/ProportionComparator.tsx` | Slider to compare proportional dimensions across body dimensions or objects (e.g., door height to corridor width ratio). |
| `widgets/dsgn013/WorkstationCalculator.tsx` | Calculator for ergonomic desk height, monitor position, keyboard tray depth given user height input. |
| `widgets/registry.ts` | Dynamic widget resolution by article/component ID. Maps widget codes (bp344/*, dsgn013/*) to component imports. Supports lazy loading. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `widgets/` | Interactive widget subdirectory containing **bp344/** and **dsgn013/** widget sets. Registered dynamically via registry. |
| `widgets/bp344/` | Building Performance code widgets. |
| `widgets/dsgn013/` | Design/ergonomics widgets. |

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

- `@/types/app` — WikiArticle, TocHeading, EIPrompt, EIResponseMap, TaxonomyNode
- `@/lib/wiki-markdown` — extractHeadings(), heading ID generation, Markdown utilities
- `@/lib/actions/ei-prompts` — Elaborative interrogation prompt fetching
- `@/lib/routes` — GROUPED_NAVIGATION for sidebar tree
- `@/components/ui/*` — shadcn/ui (Sheet, Tooltip, etc.)
- `@/components/graphics/icons/Icon` — SCIcon wrapper for Phosphor

### External

- `react` (19.x) — Hooks, Suspense, context
- `next-mdx-remote/rsc` — Server-side MDX rendering
- `remark-gfm` — GitHub Flavored Markdown plugin
- `framer-motion` — Drawer animations, transitions
- `@phosphor-icons/react` — Icon set
- `recharts` (if any charts in widgets)
- `three.js` + `react-three-fiber` (if 3D visualization needed for spatial widgets)

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

