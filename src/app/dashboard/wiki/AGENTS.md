<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# wiki

## Purpose

Knowledge Wiki for SlateCamp -- the authoritative study reference for Architecture Licensure Exam content. Provides a taxonomy-tree-navigated article browser with rich content types (facts, definitions, formulas, code provisions, exam tips, warnings, cross-references). Articles are rendered with a hero section, structured content blocks, table of contents, sources popover, related articles, elaborative interrogation prompts, teach-back prompts, and wrong-answer banners linked from quiz sessions. The layout includes a sidebar with the taxonomy tree for navigation.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Wraps children in `WikiLayoutContent` (provides taxonomy sidebar) inside a full-height container with Suspense boundary |
| `loading.tsx` | Skeleton loading state mimicking article structure |
| `page.tsx` | Client component -- landing/empty state with hero icon, feature grid (Syllabus Mapped, Interactive, Smart Search), and sidebar usage hint |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[slug]/` | Dynamic article route -- renders full wiki article by slug with all content blocks, sources, related articles, and active learning prompts |
| `test/` | Empty test directory (no files) |

## Article Page (`[slug]/page.tsx`)

The article page is the primary learning surface. It:
1. Resolves article and taxonomy node from the slug via `resolveArticleAndNode()`
2. Fetches article sources via `getArticleSources()`
3. Fetches elaborative interrogation prompts via `getEIPromptsForArticle()`
4. Fetches teach-back criteria via `getTeachBackCriteria()`
5. Renders `WikiArticleHero` (title, difficulty badge, reading time, navigation)
6. Renders `WikiArticle` (structured content blocks with 10 item types)
7. Renders `WikiRightSidebar` (table of contents, related articles)
8. Includes `TeachBackPrompt`, `WrongAnswerBanner`, and `WikiReadTracker`

**Content item types:** `fact`, `definition`, `formula`, `concept`, `code_provision`, `exam_tip`, `warning`, `heading`, `detail`, `cross_ref` -- each with distinct border color, background, and label styling.

## For AI Agents

### Working In This Directory

- **Taxonomy-driven navigation:** The wiki sidebar (from `WikiLayoutContent`) renders a hierarchical taxonomy tree. Articles are organized under the 8 LEA (Architecture Licensure Exam) root categories.
- **Article sourcing:** Every article MUST have verified sources. Use `getArticleSources()` and render source citations via `WikiSourcesPopover`.
- **Active learning features:** Articles include elaborative interrogation (EI) prompts that challenge the reader to explain concepts, and teach-back prompts that assess comprehension. These are pedagogically grounded -- not generic quizzes.
- **Content block styling:** Each of the 10 content item types has specific visual treatment defined in `ITEM_STYLES` (border-left color, background tint, label text color). Follow these exactly.
- **Reading time:** Calculated via `estimateReadingTime()` from `@/lib/wiki-markdown` and displayed in the hero.
- **Wrong answer integration:** `WrongAnswerBanner` shows when a user navigates to an article after getting a related question wrong, linking their quiz experience to study material.
- **Read tracking:** `WikiReadTracker` tracks article reading progress for analytics.
- **Difficulty mapping:** Articles display difficulty as "Foundational" (level 0-1), "Intermediate" (level 2), or "Advanced" (level 3+).

### Testing Requirements

- Verify article rendering for all 10 content item types
- Test taxonomy sidebar navigation and article slug resolution
- Confirm sources popover displays article citations
- Test elaborative interrogation prompt rendering and user response flow
- Verify teach-back prompt criteria loading
- Test wrong-answer banner visibility when navigating from a failed quiz question
- Verify empty state (landing page) renders correctly with feature grid

### Common Patterns

- **Server Component data fetching** with parallel `Promise.all` for article, sources, and prompts
- **Content block rendering** via `WikiArticle` with structured item type styling
- **Sidebar layout** via `WikiLayoutContent` wrapping the taxonomy tree
- **Dynamic routes** with `[slug]` for article pages

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/actions/wiki-actions` | `resolveArticleAndNode`, `getArticleSources` |
| `@/lib/actions/ei-prompts` | `getEIPromptsForArticle`, `getUserEIResponsesForArticle` |
| `@/lib/actions/teach-back` | `getTeachBackCriteria` |
| `@/lib/wiki-markdown` | `estimateReadingTime` |
| `@/components/wiki/WikiArticle` | Article renderer with `getArticleHeadings` |
| `@/components/wiki/WikiArticleHero` | Article header (title, metadata, difficulty) |
| `@/components/wiki/WikiHeader` | Wiki page header |
| `@/components/wiki/WikiRightSidebar` | Table of contents + related articles |
| `@/components/wiki/WikiLayoutContent` | Layout wrapper with taxonomy sidebar |
| `@/components/wiki/WikiSourcesPopover` | Sources citation overlay |
| `@/components/wiki/WikiRelatedPopover` | Related articles popover |
| `@/components/wiki/TeachBackPrompt` | Active learning prompt component |
| `@/components/wiki/WrongAnswerBanner` | Post-quiz wrong answer notification |
| `@/components/wiki/WikiReadTracker` | Reading progress tracker |
| `@/components/wiki/ElaborativeInterrogation` | EI prompt component |
| `@/components/wiki/WikiSidebar` | Taxonomy tree sidebar |

### External

| Package | Purpose |
|---------|---------|
| `@phosphor-icons/react` | Icons (BookOpen, MagnifyingGlass, Sparkle, Lightning) |

<!-- MANUAL: -->
