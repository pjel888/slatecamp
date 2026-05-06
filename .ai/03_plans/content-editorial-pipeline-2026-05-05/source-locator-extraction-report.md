# Phase 0.7 Source Locator Extraction Report

Generated: 2026-05-06T04:13:23.650Z

Status: deterministic local output only. No source approval, source-pack creation, chunks, embeddings, article/question edits, Supabase mutation, or admin live sync occurred.

## Summary

- Rows: 9
- Locator supported: 9
- Locator partial: 0
- Locator missing: 0
- Extraction blocked: 0
- Locator not checked: 0

## PDF extraction dependency posture

No existing local PDF text extraction dependency/CLI was detected in this repo environment. Phase 0.7 did not add a heavy dependency. Raw PDFs remain primary local source candidates, while Markdown/text scans are review aids only.

## Row results

| source_family | source_file_type | locator_status | confidence | extraction_quality_status | conflict_type | next_action |
|---|---:|---:|---:|---:|---|---|
| PD 1216 / Open Space Requirements | md | locator_supported | medium | usable_for_review | access_blocked_no_conflict_yet | Resolve hash/local-candidate conflict and spot-check locators before human/SME packet review. |
| RA 11201 / DHSUD Act | md | locator_supported | high | usable_for_review | raw_source_matches_official_but_conversion_layer_hash_mismatch | SME/human disposition required for conversion-layer mismatch; spot-check locator examples against raw PDF. |
| RA 11285 / Energy Efficiency and Conservation Act | md | locator_supported | medium | usable_for_review | none_detected_by_script | Prepare human/SME packet using locator examples as review aids only; do not approve source. |
| DOE DC2019-11-0014 / RA 11285 IRR | md | locator_supported | medium | usable_for_review | none_detected_by_script | Prepare human/SME packet using locator examples as review aids only; do not approve source. |
| BP 344 2024 Revised IRR | md | locator_supported | high | usable_for_review | local_webpage_pdf_vs_official_download_pdf_hash_mismatch | Resolve hash/local-candidate conflict and spot-check locators before human/SME packet review. |
| RA 9514 Fire Code RIRR | md | locator_supported | high | usable_for_review | official_source_blocked | Resolve hash/local-candidate conflict and spot-check locators before human/SME packet review. |
| PD 1096 / NBCP IRR | md | locator_supported | high | usable_for_review | local_version_vs_current_dpwh_download_hash_mismatch | Resolve hash/local-candidate conflict and spot-check locators before human/SME packet review. |
| RA 9266 / Architecture Act IRR | md | locator_supported | medium | usable_for_review | authority_host_unverified | Resolve hash/local-candidate conflict and spot-check locators before human/SME packet review. |
| PRC ALE/LEA Examination Program | md | locator_supported | high | usable_for_review | logistics_only_not_law_source | Resolve hash/local-candidate conflict and spot-check locators before human/SME packet review. |

## Gate status

```text
APPROVED_SOURCE_FILES = 0
VERIFIED_SOURCE_CANDIDATES = 0
SOURCE_PACKS_CREATED = 0
CHUNKS_CREATED = 0
EMBEDDINGS_CREATED = 0
SOURCE_APPROVAL = BLOCKED
SOURCE_PACK_CREATION = BLOCKED
EMBEDDINGS = BLOCKED
ARTICLE_REWRITING = BLOCKED
QUESTION_BANK_EDITING = BLOCKED
SUPABASE_MUTATION = BLOCKED
ADMIN_AI_AUDIT_LIVE_SYNC = BLOCKED
PHASE_1B = BLOCKED
```
