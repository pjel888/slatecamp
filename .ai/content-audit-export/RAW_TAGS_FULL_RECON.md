# RAW COMPONENT TAGS — FULL RECONNAISSANCE REPORT

## Executive Summary

- **65 total articles** with raw component tags found
- **60 with primary tags** (`<Warn>`, `<Tip>`, `<ExamTip>`, `<LawCallout>`)
- **5 with other component tags** (`<WikiExamTable>`, `<KeyValues>`, `<LeartBox>`)
- **All 60** already have `ui-blocks.json` files (block counts vary)
- **4** have prior optimization (have `question-edits/` directories)
- **All tags are simple standalone** — no deeply nested or structurally complex instances (except 1 LawCallout with attributes)

---

## 1. TAG COUNTS

| Tag | Articles | Instances | Simple | Complex |
|-----|----------|-----------|--------|---------|
| `<Warn>` | 47 | 47 | 47 | 0 |
| `<Tip>` | 6 | 6 | 6 | 0 |
| `<ExamTip>` | 7 | 7 | 7 | 0 |
| `<LawCallout>` | 1 | 1 | 0 | 1 (has `code=` attr) |
| **Primary total** | **60** | **61** | **60** | **1** |

## 2. OVERLAPS

- Warn only: 47 articles
- Tip only: 5 articles
- ExamTip only: 6 articles
- LawCallout only: 1 article
- Tip + ExamTip (same article): 1 article (`lea-hist-001-01`)

## 3. CATEGORY BREAKDOWN

| Category | Articles | Tags Used |
|----------|----------|-----------|
| Structural Conceptualization | 46 | All `<Warn>` |
| Theory of Architecture | 8 | 4 `<Tip>`, 4 `<ExamTip>` |
| History of Architecture | 2 | 1 `<Tip>`+`<ExamTip>`, 1 `<Tip>` |
| Professional Practice & Jurisprudence | 3 | 1 `<Warn>`, 2 `<ExamTip>` |
| Architectural Design & Site Planning | 1 | 1 `<LawCallout>` (complex, with `code=` attr) |

## 4. UI-BLOCKS.JSON STATUS

- **All 60 articles** have `ui-blocks.json` already
- Actual block counts vary by subject area:
  - Structures articles: ~2 blocks each
  - Theory articles: ~13 blocks each
  - History articles: ~12 blocks each
  - Electrical/mechanical: ~4 blocks

## 5. QUESTION-EDITS STATUS (Prior Optimization)

4 articles have `question-edits/` directories:

1. `electrical-and-mechanical-regulations--aeeecbe3` — LawCallout (1 raw tag + 3 roundtrip blocks already)
2. `lea-strc-001-01-core-concept--e6408b5e` — Warn (1 raw tag)
3. `lea-strc-001-02-core-concept--943907de` — Warn (1 raw tag)
4. `lea-strc-005-01-core-concept--dac86d82` — Warn (1 raw tag)

## 6. TAG CLASSIFICATION

### Simple Standalone (60 instances across 59 articles)
- All `<Warn>` instances: Simple, single-line text inline
- All `<Tip>` instances: Simple, single-line text inline
- All `<ExamTip>` instances: Simple, single-line text inline

### Complex (1 instance)
- 1 `<LawCallout>` in `electrical-and-mechanical-regulations`: Has `code=` and `section=` attributes, but no nested content. **Note:** This article ALSO has roundtrip-safe placeholders for 3 other LawCallout/ExamTip blocks — only this one was missed during prior conversion.

### Part of Larger MDX Structures
- **None found** — no `<WikiMistakeList>`, `<MCQ>`, or similar wrapper structures containing raw tags

---

## 7. FIVE OTHER COMPONENT TAGS (Non-Primary)

These 5 articles have other component tags not in the Warn/Tip/ExamTip/LawCallout set:

| Article | Tag | Category |
|---------|-----|----------|
| `lea-plan-003-02-what-you-need-to-know-for-the-lea--7c0e2fa5` | `<WikiExamTable>` | Planning, Housing & Urban Design |
| `lea-plan-005-05-core-concept--1bf5341b` | `<WikiExamTable>` | Planning, Housing & Urban Design |
| `lea-prac-ctr-010-performance-bond--6bb0f186` | `<KeyValues>` | Professional Practice & Jurisprudence |
| `lea-prac-ctr-012-guarantee-bond--5e194f59` | `<KeyValues>` | Professional Practice & Jurisprudence |
| `lea-prac-eth-010-introduction--265185c0` | `<LeartBox>` | Professional Practice & Jurisprudence |

---

## 8. BATCH CONVERSION NOTES

### Priority for conversion:
1. **47 `<Warn>` articles** (Structures) — all identical pattern, simplest to batch-convert
2. **6 `<Tip>` articles** (Theory/History) — simple standalone, minor content variation
3. **7 `<ExamTip>` articles** (Theory/History/Practice) — simple standalone, minor content variation
4. **1 `<LawCallout>`** (Design) — complex with attributes, needs careful handling
5. **5 other tags** — need separate handling per tag type

### Batch grouping by tag content pattern:
- 42 structures `<Warn>` articles use: `"These are frequently tested traps. Memorize them to avoid losing easy points on exam day."`
- 1 structures `<Warn>` article uses: `"The dual-threshold passing standard is critical..."` (lea-prac-law-008)
- 4 structures `<Warn>` articles have different content (lea-strc-001-01/02 already have question-edits)

### Block append vs. create:
- All 60 articles already have `ui-blocks.json` — so **append** only, no need to create new files
- Need to read existing blocks, add the new one, update `ui_block_count` and `total_blocks`

---

## 9. FILES GENERATED

| File | Contents |
|------|----------|
| `raw_tags_recon_report.json` | Full JSON dump of all 65 articles with tag details |
| `raw_tags_recon_report.md` | Markdown report (detailed per-article) |
| `raw_tags_recon_detailed.json` | Refined JSON with proper categories |
| `raw_tags_batch_list.csv` | CSV ready for batch processing import |
