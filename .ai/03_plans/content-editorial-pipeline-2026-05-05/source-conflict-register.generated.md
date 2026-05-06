# Source Conflict Register — Generated

Updated in Phase 0.5B.6 after Claude renewed human-style review and Hermes reconciliation against new `001_Raw-Source-Layer` PDFs.

| source family | conflict flag | conflict type | note | action |
|---|---:|---|---|---|
| PD 1216 / bundle-000017 | false | access_blocked_no_conflict_yet | SC E-Library opened; OG/Senate remain security-gated; local 001 PDF exists but has no opened official PDF match. | Manual OG/Senate capture and locator extraction. |
| RA 11201 / bundle-000018 | true | raw_source_matches_official_but_conversion_layer_hash_mismatch | 001 raw PDF exactly matches Official Gazette PDF hash; older 002 OCR/conversion PDF hash differs. | SME/human disposition of conversion artifact before packet review. |
| RA 11285 / bundle-000019 | false | statute_ready_but_irr_separate | 001 raw statute PDF matches OG PDF hash; DOE IRR now has official PDF hash but remains separate unapproved IRR lead. | Extract statute/IRR locators; compare DOE IRR to local candidates. |
| DOE DC2019-11-0014 / RA 11285 IRR | false | local_source_missing_or_unmatched | DOE legacy page/PDF captured and hashed; no matching 001 local IRR PDF found by filename search. | Locate/add raw IRR PDF; compare text/locators. |
| BP 344 2024 Revised IRR | true | local_webpage_pdf_vs_official_download_pdf_hash_mismatch | NCDA official downloadable PDF hash differs from local 001 webpage-print/export PDF. | Treat official downloadable PDF as stronger candidate; compare content and locators; keep older extracts OUTDATED_SOURCE_RISK. |
| PD 1096 / NBCP IRR | true | local_version_vs_current_dpwh_download_hash_mismatch | Current DPWH 432-page PDF hash differs from selected local 368-page DPWH Official PDF. | Compare all local PD1096 candidates against current DPWH PDF; extract locators. |
| RA 9514 RIRR | false | official_source_blocked | BFP official candidate remains security-gated; local 001 PDF exists but no official host match captured. | Manual BFP/OG capture and hash match. |
| RA 9266 / IRR | false | authority_host_unverified | Local PRC/Board IRR PDF exists; Official Gazette/PRC/PRBoA host not opened/verified. | Find official host and match local PDF. |
| PRC ALE/LEA 2026 | false | logistics_only_not_law_source | PRC page/program PDFs captured for logistics only. | Do not use as legal source truth; compare only to exam scope/weights. |

Article/question conflict rows remain absent because Phase 0.5B.6 did not compare article claims or question rationales against source text. That remains blocked until source/file/hash/text/locator matching is complete.
