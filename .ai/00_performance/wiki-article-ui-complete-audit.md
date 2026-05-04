# Wiki Article UI — Complete Component Audit & Fix Report

**Date:** 2026-05-04
**Agent:** Hermes (deepseek-v4-pro) + 2 OpenCode subagents for data collection
**Branch:** codebase-modernization-batch1-2
**Articles audited:** 567

---

## 1. Summary

A full prop-mismatch audit was performed across ALL 40 registered wiki MDX components, cross-referencing every component's expected props against actual prop usage across 567 articles in the content corpus.

### Findings
- **4 components were BROKEN** (data loss due to prop mismatch): WikiMistakeCard, WikiMistakeList, WikiExamTable, KeyValues
- **11 components flagged CHECK** (need visual verification — children-based with extra props)
- **4 components verified OK** (no prop mismatches)
- **18 components UNUSED** (registered but never appear in article content)
- **3 components flagged but NOT broken** (ArticleMedia, ElaborativeInterrogation, WikiChangedPill — optional props)

### Fixes applied (6 files changed)
| Component | Articles affected | Root cause | Fix |
|-----------|------------------|------------|-----|
| WikiMistakeCard | 165 | 3 prop conventions, component only handled 1 | normalizeMistakeProps() handles all 3 |
| WikiMistakeList | 293 | No index passthrough, items alias not handled | Passes __index, accepts items prop |
| WikiExamTable | 177 | headers→columns mismatch, rows shape variance | normalizeTableProps() with array/object detection |
| KeyValues | 66 | values/pairs aliases not handled, title/note ignored | normalizeKeyValues() handles all conventions |

### Verification
| Gate | Result |
|------|--------|
| Typecheck | ✅ 0 errors |
| Lint | ✅ 0 errors |
| Wiki tests (9) | ✅ All pass |
| Full tests (704) | ✅ All pass |

---

## 2. Complete Component Audit Matrix

### BROKEN & FIXED

| Component | Articles | Prop Issue | Fix |
|-----------|----------|------------|-----|
| WikiMistakeCard | 165 | 3 conventions: A=mistake/correction/context (154), B=number/title/wrongValue/correctValue/explanation (2), C=title/body (9) | normalizeMistakeProps() |
| WikiMistakeList | 293 | items alias, no index passthrough | Accept items, pass __index |
| WikiExamTable | 177 | headers≠columns, rows format variance (arrays, objects, headings) | normalizeTableProps() |
| KeyValues | 66 | values/pairs aliases, title/note metadata ignored | normalizeKeyValues() |

### NOT BROKEN (verified optional props)

| Component | Articles | Why flagged | Verdict |
|-----------|----------|-------------|---------|
| ArticleMedia | 461 | "Missing" props are ALL optional (src, youtubeId, embedUrl, credit, carouselCount, etc.) — only used in status="ready" mode | OK — placeholder mode |
| ElaborativeInterrogation | 1 | Missing props (articleId, existingResponse, etc.) are provided by WikiArticle wrapper at runtime, not from MDX content | OK — wrapper-injected |
| WikiChangedPill | 1 | className/oldValue are optional, component renders with defaults when omitted | OK — optional props |

### CHECK — Children-based components with extra props (likely fine)

| Component | Articles | Extra props | Verdict |
|-----------|----------|-------------|---------|
| Tip | 402 | message (1 article) | Paired tag — content goes to children |
| Warn | 265 | message (1 article) | Paired tag — content goes to children |
| Note | 211 | spec, type | Paired tag — content goes to children |
| ExamTip | 311 | title | Paired tag — content goes to children |
| Example | 42 | title | Paired tag — content goes to children |
| Callout | 171 | color, severity, type | Paired tag — content goes to children |
| LawCallout | 146 | None | ✅ Props match perfectly |
| ProcessFlow | 37 | items, steps | Paired tag — extra metadata |
| ComparisonTable | 20 | categories, data, title, unit | Paired tag — extra metadata |
| Accordion | 8 | label, prompt | Paired tag — extra metadata |
| WikiCalloutBox | 4 | title, variant | Paired tag — extra metadata |

### OK

| Component | Articles | Notes |
|-----------|----------|-------|
| SubjectSnapshot | 8 | ✅ items prop matches |
| SPP206RefServices | 5 | ✅ No-op stub, no props needed |
| SPP207RefServices | 2 | ✅ No-op stub, no props needed |
| XPS | 1 | ✅ Legacy, no props needed |

### UNUSED (registered but never appear in 567 articles)

Warning, AlertBox, CalloutBox, AuthorityContent, RevealBlock, WikiArticleHero, WikiPartHeader, MistakeCard, MistakeList, Mistakes, FormulaBlock, InlineQuiz, Tabs, Tab, AccordionItem, EIPrompt, EIBlock, WikiReference, Mermaid, GenericBlock, PrequestionGate, TeachBackPrompt, WikiPre, WrongAnswerBanner

---

## 3. Files Changed

| File | Lines changed | Change |
|------|--------------|--------|
| `src/types/wiki.ts` | +30 | Added WikiMistakeCardRawProps |
| `src/components/wiki/blocks/WikiMistakeCard.tsx` | +50 | normalizeMistakeProps() |
| `src/components/wiki/blocks/WikiMistakeList.tsx` | +8 | items alias, index passthrough |
| `src/components/wiki/blocks/WikiExamTable.tsx` | +42 | normalizeTableProps() |
| `src/components/wiki/blocks/KeyValues.tsx` | +45 | normalizeKeyValues() |

### Data files created
- `.ai/wiki-ui-audit/component-prop-usage.json` — 62KB JSON, all component usage across 567 articles
- `.ai/wiki-ui-audit/component-crossref-report.json` — cross-reference report
- `wiki-blocks-props-inventory.json` — component prop inventory

---

## 4. Risk Report

### Blast radius
- Only component renderer files changed — NO article content, NO Supabase data, NO renderer pipeline changes
- All changes are backward-compatible — existing articles with correct props continue to work
- New normalization functions run only when component renders

### Rollback
```bash
git checkout src/types/wiki.ts src/components/wiki/blocks/WikiMistakeCard.tsx src/components/wiki/blocks/WikiMistakeList.tsx src/components/wiki/blocks/WikiExamTable.tsx src/components/wiki/blocks/KeyValues.tsx
```

---

## 5. Remaining Work

1. **Visual verification** — Browser-test the 11 CHECK components across multiple articles with different prop conventions
2. **Browser smoke test** — Verify `/dashboard/wiki/lea-hist-001-03-core-concept` shows all components
3. **Build fix** — Resolve pre-existing `repo-metrics.ts` import failure (unrelated to this work)
4. **Storybook** — Add stories for WikiExamTable and KeyValues with realistic data from corpus
