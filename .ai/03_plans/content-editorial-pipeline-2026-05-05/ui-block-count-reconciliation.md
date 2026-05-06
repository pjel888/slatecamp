# UI-Block Count Reconciliation — Phase 1A Evidence

**Date:** 2026-05-05  
**Scope:** Resolve `export-summary.json` claim of `ui_block_count: 0` / `parser_status: not_started` against per-article artifacts.  
**Status:** Evidence gathered; no regeneration performed.

---

## Executive Summary

`export-summary.json` reports `ui_block_count: 0` and `parser_status: "not_started"` for **all 567 articles**.  
Per-article artifacts (`ui-blocks.json`, `normalized.md`, `candidate.md`) exist for **all 567 articles** and contain real UI-block data.  
**The export-summary is stale for parser-state fields.** The per-article artifacts are the canonical Phase 1A evidence for component complexity and roundtrip readiness.

---

## Evidence Inventory

| Artifact | Count | Script Source | Freshness vs Export Summary |
|---|---|---|---|
| `export-summary.json` | 1 | `scripts/content-audit/export-article-bundles.ts` | Generated 2026-05-04T09:10:23.838Z |
| `ui-blocks.json` (per article) | 567 | `scripts/content-audit/normalize-article-bundles.ts` | Generated 2026-05-04T09:10:37.030Z (sampled) — **newer than export-summary** |
| `normalized.md` (per article) | 567 | `scripts/content-audit/normalize-article-bundles.ts` | Same run as ui-blocks |
| `candidate.md` (per article) | 567 | `scripts/content-audit/compose-candidates.ts` | Post-normalization pipeline stage |
| `parser-errors.json` (per article) | 567 | `scripts/content-audit/normalize-article-bundles.ts` | Same run as ui-blocks |
| `ui-block-edits.json` (per article) | 567 | `scripts/content-audit/normalize-article-bundles.ts` | Same run as ui-blocks |

---

## Working Hypothesis: Why Export-Summary Reports Zero

`export-article-bundles.ts` (lines 34–50) defines the `ExportedArticleSummary` interface with fields:
- `ui_block_count: number`
- `parser_status: ArticleMetadata['parser_status']`

The export script populates these from **article-metadata.json** at export time.  
If `article-metadata.json` lacks `ui_block_count` or `parser_status` (because normalization ran after the export, or metadata was not back-propagated), the export summary defaults to `0` and `"not_started"`.

**Working hypothesis:** Export summary is a **Supabase-export manifest**, not a **post-normalization manifest**. It appears to reflect DB-export state, not roundtrip-pipeline state. This is strongly supported by timestamps and corpus-wide zero parser fields, but remains a hypothesis until source-code tracing proves where `ui_block_count` / `parser_status` are written or omitted.

---

## Sample Per-Artifact Evidence

**Article:** `overview-building-materials--6e9a4321-c9db-4720-ab19-288e7f28be48`

| Field | Export-Summary Value | `ui-blocks.json` Value |
|---|---|---|
| `ui_block_count` | 0 | 8 |
| `parser_status` | `"not_started"` | N/A (file contains rich block data) |
| Blocks present | — | `SubjectSnapshot`, `ArticleMedia`, `ExamTip` (×2), `WikiExamTable`, `Note` (×3) |
| Parser confidence | — | `"high"` on all blocks |
| Status | — | `"preserved"` on all blocks |

The `ui-blocks.json` `normalized_created_at` is **2026-05-04T09:10:37.030Z**, which is **~14 seconds after** the `export-summary.json` `generated_at` of **2026-05-04T09:10:23.838Z**.  
This proves normalization ran after export for the sampled article and supports the stale-summary hypothesis.

---

## Sampling Protocol Still Required

Current Phase 1A evidence confirms corpus-wide file presence and one sampled positive case. Before Phase 1B uses UI-block counts for readiness scoring, the corpus needs a stratified spot-check:

- High component-count articles.
- Medium component-count articles.
- Low/no component-count articles.
- At least one parser-error or low-confidence case, if present.
- At least one article with question-edits artifacts.

Until that sampling is complete, `ui-blocks.json` is usable as **Phase 1A parser-output evidence**, not as final proof of editorial validity. Parser `confidence: "high"` is the parser's self-assessment, not a human or source-grounded validation finding.

---

## Artifact Trust Hierarchy for Phase 1A

| Priority | Artifact | Why It Wins |
|---|---|---|
| 1 (Phase 1A parser-output evidence) | `ui-blocks.json` | Produced by `normalize-article-bundles.ts`; contains actual parsed block data, hashes, confidence, and status. Requires stratified sampling before Phase 1B scoring. |
| 2 | `normalized.md` | Prose-only version with UI blocks replaced by placeholders; proves roundtrip extraction worked. |
| 3 | `candidate.md` | Composed candidate version; proves compose stage can reconstruct content from normalized + blocks. |
| 4 (fallback) | `export-summary.json` | Trusted only for export-run counts copied from Supabase at that time (`article_count`, `question_count`, `source_count`, `taxonomy_link_count`). Counts are not proof of current live freshness, and content drift can occur without row-count changes. **Do not trust** `ui_block_count`, `parser_status`, or `component_count` from this file. |

---

## Script Provenance

| Script | Role | Safety |
|---|---|---|
| `export-article-bundles.ts` | Exports Supabase article/question/source data to local bundles | Read-only against Supabase; writes local files only |
| `normalize-article-bundles.ts` | Parses `original.md`, extracts UI blocks, writes `normalized.md` + `ui-blocks.json` | Read-only against local bundles; writes local files only |
| `compose-candidates.ts` | Reconstructs `candidate.md` from `normalized.md` + `ui-blocks.json` | Pure local transformation |
| `diff-candidates.ts` | Compares `candidate.md` vs `original.md` | Pure local read |
| `validate-bundles.ts` | Validates bundle structure and hashes | Pure local read |

The roundtrip chain is read-only against Supabase until push commands are invoked. However, several scripts mutate local derived artifacts (`normalized.md`, `ui-blocks.json`, `candidate.md`, reports, sync state). Phase 1A should prefer file inspection over regeneration unless Philip explicitly authorizes the exact local-regeneration command.

---

## What Remains Safe for Phase 1A

- Using `ui-blocks.json` to assess component complexity per article.
- Using `normalized.md` + `candidate.md` + diff artifacts to prove roundtrip safety.
- Using `export-summary.json` for top-level count reconciliation (articles, questions, sources, taxonomy links).
- Using `parser-errors.json` and `ui-block-edits.json` to identify parsing gaps.

## What Blocks Phase 1B

- **No automated regeneration of `export-summary.json` after normalization.** Any Phase 1B script that relies on a single manifest for UI-block counts must either:
  1. Re-scan per-article `ui-blocks.json` files, or
  2. Run a fresh end-to-end export → normalize → summary pass.
- **Metadata back-propagation gap.** `article-metadata.json` does not appear to be updated by `export-article-bundles.ts` with normalization results, so re-export would still show stale parser fields unless normalization writes back to metadata.

## What Claude Should Review Next

1. Whether `export-article-bundles.ts` should be modified to read `ui-blocks.json` (if present) and emit accurate `ui_block_count` / `parser_status` in the summary.
2. Whether `normalize-article-bundles.ts` should write `ui_block_count` and `parser_status` back into `article-metadata.json` so future exports inherit it.
3. Whether the pilot-candidate shortlist should be re-scored using actual `ui-blocks.json` block counts instead of the zero-filled export-summary values.
