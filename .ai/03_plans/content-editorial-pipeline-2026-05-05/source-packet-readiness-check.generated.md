# Phase 0.6 Source Packet Readiness Check

Generated: 2026-05-06T04:13:23.631Z

This is a future-approval eligibility screen only. It does not approve sources, create source packs, create embeddings, edit articles/questions, mutate Supabase, or sync live admin audit data.

## Counts

- blocked_conversion_mismatch: 1
- blocked_hash_mismatch: 4
- blocked_missing_locators: 2
- blocked_missing_official_evidence: 2

## Checks

| source_family | document_code | readiness_state | blockers | next_action |
|---|---|---|---|---|
| PD 1216 / Open Space Requirements | PD 1216 | blocked_hash_mismatch | Multiple local candidates require human selection before packet use.; Page/section/table locators are missing, partial, or not checked.; SME review required before any future promotion. | Manually capture Official Gazette/Senate LRB body/PDF; compare local 001 raw PDF to opened official text; extract page/section locators. |
| RA 11201 / DHSUD Act | RA 11201 | blocked_conversion_mismatch | Derived/OCR/conversion layer mismatch requires disposition against raw PDF.; Page/section/table locators are missing, partial, or not checked.; SME review required before any future promotion. | SME/human review should disposition 002 OCR/conversion mismatch against 001 raw official PDF; extract locators before packet use. |
| RA 11285 / Energy Efficiency and Conservation Act | RA 11285 | blocked_missing_locators | Page/section/table locators are missing, partial, or not checked.; SME review required before any future promotion. | Extract locators and compare text; keep DOE IRR as separate evidence lead needing metadata/PDF reconciliation. |
| DOE DC2019-11-0014 / RA 11285 IRR | DC2019-11-0014 | blocked_missing_locators | No local raw PDF candidate found.; Page/section/table locators are missing, partial, or not checked.; SME review required before any future promotion. | Add/locate local raw IRR PDF if absent; compare DOE PDF text/locators before using IRR. |
| BP 344 2024 Revised IRR | BP 344 2024 Revised IRR | blocked_hash_mismatch | Multiple local candidates require human selection before packet use.; Page/section/table locators are missing, partial, or not checked.; SME review required before any future promotion. | Keep 2024 revised IRR as official evidence lead; compare NCDA downloadable PDF against local webpage-print PDF and older BP 344 derivatives; extract locators. |
| RA 9514 Fire Code RIRR | RA 9514 RIRR | blocked_missing_official_evidence | Missing opened official PDF/hash evidence.; Multiple local candidates require human selection before packet use.; Page/section/table locators are missing, partial, or not checked.; SME review required before any future promotion. | Capture BFP body/PDF or Official Gazette alternative; compare local 001 PDF hash/text after official PDF is captured. |
| PD 1096 / NBCP IRR | PD 1096 IRR | blocked_hash_mismatch | Multiple local candidates require human selection before packet use.; Page/section/table locators are missing, partial, or not checked.; SME review required before any future promotion. | Compare local PD1096 PDFs against current DPWH 432-page PDF; determine whether local 368-page file is derivative/older and extract locators. |
| RA 9266 / Architecture Act IRR | RA 9266 IRR | blocked_missing_official_evidence | Missing opened official PDF/hash evidence.; Multiple local candidates require human selection before packet use.; Page/section/table locators are missing, partial, or not checked.; SME review required before any future promotion. | Find opened PRC/PRBoA/Official Gazette/Senate official host for RA9266/IRR; compare local PDF after official host verified. |
| PRC ALE/LEA Examination Program | 2026 PRC Architect Licensure Examination schedule/program | blocked_hash_mismatch | Multiple local candidates require human selection before packet use.; Page/section/table locators are missing, partial, or not checked.; SME review required before any future promotion. | Use only for exam logistics/scope/weights after review; do not use as legal/code source truth. |
