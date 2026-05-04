# Wiki UI Component Inventory

**Audit Date:** 2026-05-04  
**Total Components Audited:** 49  
**Workbench:** `/Users/philiplewis/slatecamp/src/components/wiki/`

---

## 1. Article Components (6)

### 1.1 WikiArticle
- **File:** `article/WikiArticle.tsx`
- **Export:** `WikiArticle`, `WikiArticleSkeleton`, `getArticleHeadings`, `compileWikiArticleWithRenderer`
- **Props:** `article: WikiArticleType`, `nodeId?`, `nodeName?`, `eiPrompts?`, `eiResponses?`
- **Server/Client:** Server (async). Client sub-components via Suspense boundaries.
- **MDX Map:** Not directly — orchestrates WIKI_COMPONENTS internally
- **Risks:** Two parallel component maps (`WIKI_COMPONENTS` vs `baseMdxComponents`) risk drift; `WikiArticleSkeleton` has no `aria-busy`
- **Needs:** Unify component maps, add screen reader loading announcements

### 1.2 WikiArticleHeader
- **File:** `article/WikiArticleHeader.tsx`
- **Export:** Named
- **Props:** `title`, `updatedAt`, `readingTime?`
- **Server/Client:** Server ✅
- **Risks:** No truncation for long titles, no defensive check for empty `updatedAt`

### 1.3 WikiArticleHero
- **File:** `article/WikiArticleHero.tsx`
- **MDX Map:** ✅ (both WIKI_COMPONENTS and baseMdxComponents)
- **Risks:** **CRITICAL: `isMinimal` mode sets h1 to `text-[8px]`** — likely a unit error, renders illegibly
- **Needs:** Fix `isMinimal` title size

### 1.4 WikiArticleError
- **File:** `article/WikiArticleError.tsx`
- **Client:** `'use client'` (button click)
- **Risks:** No `aria-live` for error; hard page reload instead of soft retry

### 1.5 WikiItemRenderer
- **File:** `article/WikiItemRenderer.tsx`
- **Export:** Named + `WikiItem` type
- **Needs:** `aria-label` for warning emoji, `aria-hidden` on decorative SVGs

### 1.6 WikiLearningJourney / WikiLearningCompletion
- **File:** `article/WikiLearningJourney.tsx`
- **Export:** Both named
- **Needs:** Replace hardcoded 280px aside width, add truncation for long topic titles

---

## 2. Block Components (24)

### 2.1 Callout (unified)
- **File:** `blocks/Callout.tsx`
- **Export:** Callout + 9 backward-compat aliases (Note, Warn, Tip, Example, CalloutBox, AlertBox, ExamTip, AuthorityContent)
- **MDX Map:** ✅ All aliases registered
- **Risks:** Duplicate component implementations; `example` and `requirement` variants look identical

### 2.2 WikiTabs (Tabs + Tab)
- **File:** `blocks/WikiTabs.tsx`
- **Client:** `'use client'`
- **MDX Map:** ✅
- **Risks:** No arrow-key navigation between tabs, no `aria-orientation`

### 2.3 WikiAccordion / Accordion
- **File:** `blocks/WikiAccordion.tsx` → `Accordion.tsx` → `@/components/ui/accordion`
- **MDX Map:** ✅
- **Risks:** Chain of 3 re-exports adds indirection

### 2.4 WikiCalloutBox
- **File:** `blocks/WikiCalloutBox.tsx`
- Re-export to Callout — could be removed

### 2.5 WikiChangedPill
- **File:** `blocks/WikiChangedPill.tsx`
- **Risks:** `title` attribute tooltip not touch-accessible; unicode ⟳ character

### 2.6 WikiExamTable
- **File:** `blocks/WikiExamTable.tsx`
- **MDX Map:** ✅
- **Risks:** Source column hidden on mobile

### 2.7 WikiMistakeCard
- **File:** `blocks/WikiMistakeCard.tsx`
- **MDX Map:** ✅

### 2.8 WikiMistakeList
- **File:** `blocks/WikiMistakeList.tsx`
- **MDX Map:** ✅

### 2.9 WikiPartHeader
- **File:** `blocks/WikiPartHeader.tsx`
- **MDX Map:** ✅
- **Risks:** No title truncation

### 2.10 ComparisonTable
- **File:** `blocks/ComparisonTable.tsx`
- **MDX Map:** ✅
- **Risks:** Hardcoded blue header; no semantic table enforcement

### 2.11 ExamTip (re-export)
- **File:** `blocks/ExamTip.tsx`
- Re-exports to Callout — could be removed

### 2.12 FormulaBlock
- **File:** `blocks/FormulaBlock.tsx`
- **MDX Map:** ✅
- **Risks:** No screen-reader accessible formula description

### 2.13 GenericBlock + SPP stubs
- **File:** `blocks/GenericBlock.tsx`
- **MDX Map:** ✅ (17 alias names)
- **Risks:** Could benefit from debug visual indicator

### 2.14 InlineQuiz
- **File:** `blocks/InlineQuiz.tsx`
- **Client:** ✅
- **MDX Map:** ✅
- **Risks:** No radiogroup role; no keyboard navigation options

### 2.15 KeyValues
- **File:** `blocks/KeyValues.tsx`
- **MDX Map:** ✅
- **Risks:** Dynamic font sizing may cause inconsistency

### 2.16 LawCallout
- **File:** `blocks/LawCallout.tsx`
- **MDX Map:** ✅
- **Risks:** Defensive fallback for unknown codes — graceful

### 2.17 Mermaid
- **File:** `blocks/Mermaid.tsx`
- **Client:** ✅
- **MDX Map:** ✅ (WIKI_COMPONENTS only)
- **Risks:** **HIGH: `dangerouslySetInnerHTML` with SVG output** — potential XSS; no `aria-label` on diagram

### 2.18 PrequestionGate
- **File:** `blocks/PrequestionGate.tsx`
- **Client:** ✅
- **Risks:** No focus trap in modal; no Escape to skip gate; question counter missing `aria-describedby`

### 2.19 ProcessFlow
- **File:** `blocks/ProcessFlow.tsx`
- **MDX Map:** ✅
- **Risks:** Hardcoded cobalt shadow color

### 2.20 RevealBlock
- **File:** `blocks/RevealBlock.tsx`
- **Client:** ✅
- **MDX Map:** ✅ (WIKI_COMPONENTS only)
- **Risks:** `use-gesture` bundle dependency; no max-height for long content; no fallback if drag fails

### 2.21 SubjectSnapshot
- **File:** `blocks/SubjectSnapshot.tsx`
- **MDX Map:** ✅
- **Risks:** Hero detection heuristic fragile for localization

### 2.22 TeachBackPrompt
- **File:** `blocks/TeachBackPrompt.tsx`
- **Client:** ✅
- **Risks:** No list semantics for evaluation items; no focus management between phases

### 2.23 WrongAnswerBanner
- **File:** `blocks/WrongAnswerBanner.tsx`
- **MDX Map:** ✅
- **Risks:** Missing `role="alert"` for screen reader attention

### 2.24 WikiPre / ElaborativeInterrogation
- **Files:** `blocks/WikiPre.tsx`, `blocks/ElaborativeInterrogation.tsx`
- **Client:** Both ✅
- **MDX Map:** Both ✅
- **Risks:** EI uses `dangerouslySetInnerHTML` with DOMPurify; WikiPre uses `any` types extensively

---

## 3. Navigation Components (16)

### 3.1 WikiLayoutContent
- **File:** `navigation/WikiLayoutContent.tsx`
- **Server:** ✅ (async)
- **Risks:** Returns `null` if no user (silent failure); unauthenticated state could redirect

### 3.2 WikiSidebar
- **File:** `navigation/WikiSidebar.tsx`
- **Client:** ✅
- **Risks:** No-discipline Link uses `<button>` instead of next/link; taxonomy tree a11y depends on TaxonomyTree component

### 3.3 WikiSidebarLoader
- **File:** `navigation/WikiSidebarLoader.tsx`
- **Server:** ✅ (async)
- **Risks:** No error boundary for failed taxonomy fetch

### 3.4 WikiSidebarShell
- **File:** `navigation/WikiSidebarShell.tsx`
- **Client:** ✅
- **Risks:** Mouse-only resize (no keyboard/touch); returns `null` before mount (hydration flash)

### 3.5 WikiSidebarSkeleton
- **File:** `navigation/WikiSidebarSkeleton.tsx`
- **Risks:** No `aria-busy`

### 3.6 WikiHeader
- **File:** `navigation/WikiHeader.tsx`
- **Server:** ✅ (async)
- **Risks:** No error handling for failed data fetches

### 3.7 WikiHeaderClient
- **File:** `navigation/WikiHeaderClient.tsx`
- **Client:** ✅
- **Risks:** Well-implemented with breadcrumbs, mobile nav sheet, reading progress

### 3.8 WikiContentShell
- **File:** `navigation/WikiContentShell.tsx`
- **Client:** ✅
- **Risks:** No `aria-busy`/`aria-live` for skeleton transition

### 3.9 WikiRightSidebar
- **File:** `navigation/WikiRightSidebar.tsx`
- **Client:** ✅
- **Risks:** Commented-out dead code ('Study in Notes')

### 3.10 WikiRightSidebarSkeleton
- **File:** `navigation/WikiRightSidebarSkeleton.tsx`
- **Risks:** No `aria-busy`

### 3.11 WikiTableOfContents
- **File:** `navigation/WikiTableOfContents.tsx`
- **Client:** ✅
- **Risks:** IntersectionObserver requires heading IDs to exist

### 3.12 WikiReadingProgress
- **File:** `navigation/WikiReadingProgress.tsx`
- **Client:** ✅
- **Risks:** None — well implemented with passive scroll listener

### 3.13 WikiBookmarks
- **File:** `navigation/WikiBookmarks.tsx`
- **Client:** ✅
- **Risks:** Optimistic updates can cause UI/data mismatch on server failure

### 3.14 WikiNavigationContext
- **File:** `navigation/WikiNavigationContext.tsx`
- **Client:** ✅

### 3.15 WikiDisciplineContext
- **File:** `navigation/WikiDisciplineContext.tsx`
- **Client:** ✅

---

## 4. Quiz Components (2)

### 4.1 WikiQuizButton
- **File:** `quiz/WikiQuizButton.tsx`
- **Client:** ✅
- **Risks:** Null Suspense fallback — no loading state for lazy-loaded modal

### 4.2 WikiQuizModal
- **File:** `quiz/WikiQuizModal.tsx`
- **Client:** ✅ (519 lines, largest component)
- **Risks:** Focus trap only tracks `focusin` — doesn't Tab-cycle within dialog; uses `setInterval` for gated timer

---

## 5. Shared Components (7)

### 5.1 WikiHighlighter
- **File:** `shared/WikiHighlighter.tsx`
- **Client:** ✅ (returns null)
- **Risks:** `range.surroundContents` silently fails on multi-element ranges

### 5.2 WikiNoteAnchor
- **File:** `shared/WikiNoteAnchor.tsx`
- **Client:** ✅ (returns null)
- **Risks:** No defensive check for missing NoteContext

### 5.3 WikiReadTracker
- **File:** `shared/WikiReadTracker.tsx`
- **Client:** ✅ (returns null)
- **Risks:** No error handling for failed server actions

### 5.4 WikiReference
- **File:** `shared/WikiReference.tsx`
- **Client:** ✅
- **MDX Map:** ✅ (WIKI_COMPONENTS)
- **Risks:** Iframe for peek view could be replaced with proper renderer

### 5.5 WikiRelatedPopover
- **File:** `shared/WikiRelatedPopover.tsx`
- **Client:** ✅
- **Risks:** No Escape key handler; no focus trap; custom createPortal popover

### 5.6 WikiSourcesPopover
- **File:** `shared/WikiSourcesPopover.tsx`
- **Client:** ✅
- **Risks:** Same as WikiRelatedPopover — no Escape, no focus trap

### 5.7 WikiTextSelection
- **File:** `shared/WikiTextSelection.tsx`
- **Client:** ✅
- **Risks:** Position may overlap with mobile context menu; no debounce on selection handler

---

## 6. Widget Components (17+)

### 6.1 WidgetContainer
- **File:** `widgets/WidgetContainer.tsx`
- **Export:** Named
- **Risks:** None — well-implemented wrapper

### 6.2 Lab3DWidget
- **File:** `widgets/Lab3DWidget.tsx`
- **Export:** Default
- **Registry:** ✅ (widgetRegistry)
- **Risks:** 3D may not work on mobile; no responsive height; no accessible alternative

### 6.3 BP344 Widgets (6)
- **Files:** `widgets/bp344/DoorConfigurator.tsx`, `CorridorVisualizer.tsx`, `CubicleChecker.tsx`, `GrabBarExplainer.tsx`, `RecallDrill.tsx`, `ComparisonTable.tsx`
- **Risks:** SVG-based interactive tools may lack keyboard/touch support

### 6.4 DSGN013 Widgets (10+)
- **Files:** `widgets/dsgn013/*.tsx`
- **Risks:** Interactive drills may have inconsistent a11y; SVG-based visualizations need screen reader descriptions

### 6.5 registry.ts
- **File:** `widgets/registry.ts`
- **Risks:** `detectWidgets` uses `string.includes()` — false positive if tag name appears in prose

---

## 7. Utility Files (2)

### 7.1 parseMdxProp
- **File:** `shared/parse-mdx-prop.ts`
- **Status:** ✅ Well-implemented with graceful fallback

### 7.2 transformMistakeString
- **File:** `shared/transform-mistake-string.ts`
- **Status:** ✅ 8 patterns matched with comprehensive fallback

---
