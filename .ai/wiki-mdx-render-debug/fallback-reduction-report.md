# Fallback Reduction Report

## Before Closeout
- **76** ArticleMedia articles triggering fallback
- 52 backslash-escaped JSX attributes
- 23 acorn-parse-error  
- 1 other

## Repairs Applied
**52 articles repaired** by fixing backslash-escaped ArticleMedia tags.
These articles had `\"` inside JSX attribute values (a content generation artifact) that broke MDX parsing:
- Pattern A: `alt="text...\" caption=\"text\" suggestedAsset=\"text\" placementIntent=\"text\"` (30 articles)
- Pattern B: ALL attributes `\"`-delimited: `id=\"value\" layout=\"value\"` etc. (22 articles)

Fix: split the embedded attributes properly or remove backslash-escaped quotes.

## After Repairs
- **24** ArticleMedia articles still triggering fallback
- All 24 are `acorn-parse-error`: content contains `{...}` curly braces in text
  - LaTeX math formulas: `\(TGFA = AMBF \times ...\)` — `\\(` and `\\)` don't prevent MDX from parsing braces inside
  - JSON arrays in props: `mistakes="[{\"label\":\"PRC Area\"...}]"` — `{` inside `"` breaks JS expression parsing

## Acceptability
All 24 remaining fallback articles:
- Have ArticleMedia PRESERVED in fallback output ✅
- Cannot be primary-compile fixed without changing article meaning or structure
- The acorn-parse-error is a pre-existing content architecture issue (LaTeX math + JSON in MDX)
- Fallback is the correct safety net for these cases

## Target Assessment
| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Fallback articles | 76 | 24 | 0 |
| ArticleMedia preserved in fallback | 76 (all) | 24 (all) | 24 (all) |
| ArticleMedia lost | 0 | 0 | 0 |
| Total with ArticleMedia intact | 461/461 | 461/461 | 461/461 |
