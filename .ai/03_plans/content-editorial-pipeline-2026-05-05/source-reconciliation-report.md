# Phase 0.6 Source Reconciliation Report

Generated: 2026-05-06T04:13:12.079Z

Status: deterministic local output only. No source approval, source-pack creation, embeddings, article/question edits, Supabase mutation, or admin live sync occurred.

## Vitruvius folder finding

The full vitruvius-connection intake was scanned locally (2894 hashable PDF/Markdown/text/JSON files). The files are related as an intake corpus, but they are not automatically source-approved: 001 raw PDFs, 002 conversions, and 003 canonical Markdown have different trust levels and must be reconciled by hash and locator support before use.

## Summary

- Matrix rows: 9
- Exact official/local raw PDF hash matches: 2
- Local raw hash mismatch or multiple-candidate rows: 6
- No local PDF rows: 1
- Conflict-flagged rows: 3
- Source approval status: blocked for every row
- Source-pack creation status: blocked for every row

## Row results

| source_family | document_code | local_raw_pdf_match_status | conversion_layer_mismatch | locator_status | conflict_type | next_action |
|---|---|---:|---:|---|---|---|
| PD 1216 / Open Space Requirements | PD 1216 | multiple_local_candidates | false | locator_partial | access_blocked_no_conflict_yet | Manually capture Official Gazette/Senate LRB body/PDF; compare local 001 raw PDF to opened official text; extract page/section locators. |
| RA 11201 / DHSUD Act | RA 11201 | exact_hash_match | true | locator_not_checked | raw_source_matches_official_but_conversion_layer_hash_mismatch | SME/human review should disposition 002 OCR/conversion mismatch against 001 raw official PDF; extract locators before packet use. |
| RA 11285 / Energy Efficiency and Conservation Act | RA 11285 | exact_hash_match | false | locator_not_checked | none_detected_by_script | Extract locators and compare text; keep DOE IRR as separate evidence lead needing metadata/PDF reconciliation. |
| DOE DC2019-11-0014 / RA 11285 IRR | DC2019-11-0014 | no_local_pdf | false | locator_partial | none_detected_by_script | Add/locate local raw IRR PDF if absent; compare DOE PDF text/locators before using IRR. |
| BP 344 2024 Revised IRR | BP 344 2024 Revised IRR | multiple_local_candidates | false | locator_partial | local_webpage_pdf_vs_official_download_pdf_hash_mismatch | Keep 2024 revised IRR as official evidence lead; compare NCDA downloadable PDF against local webpage-print PDF and older BP 344 derivatives; extract locators. |
| RA 9514 Fire Code RIRR | RA 9514 RIRR | multiple_local_candidates | false | locator_not_checked | official_source_blocked | Capture BFP body/PDF or Official Gazette alternative; compare local 001 PDF hash/text after official PDF is captured. |
| PD 1096 / NBCP IRR | PD 1096 IRR | multiple_local_candidates | false | locator_partial | local_version_vs_current_dpwh_download_hash_mismatch | Compare local PD1096 PDFs against current DPWH 432-page PDF; determine whether local 368-page file is derivative/older and extract locators. |
| RA 9266 / Architecture Act IRR | RA 9266 IRR | multiple_local_candidates | false | locator_partial | authority_host_unverified | Find opened PRC/PRBoA/Official Gazette/Senate official host for RA9266/IRR; compare local PDF after official host verified. |
| PRC ALE/LEA Examination Program | 2026 PRC Architect Licensure Examination schedule/program | multiple_local_candidates | false | locator_partial | logistics_only_not_law_source | Use only for exam logistics/scope/weights after review; do not use as legal/code source truth. |

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
