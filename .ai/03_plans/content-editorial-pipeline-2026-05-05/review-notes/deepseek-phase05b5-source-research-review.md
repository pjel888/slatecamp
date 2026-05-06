# DeepSeek Phase 0.5B.5 Source Research Review

This is fallback review only, not Claude/human/SME/source status promotion. Hermes applied evidence-language/schema corrections after this memo: row/run IDs, row-level DISCOVERY_ONLY use, local hash comparison notes, locator_status notes, and expanded conflict-register coverage.

Now let me check for any AGENTS.md that defines review requirements in this subtree.
---

# Phase 0.5B.5 Evidence Outputs — DeepSeek Fallback Review Memo

**Reviewer:** DeepSeek (fallback; Claude unavailable)
**Date:** 2026-05-06
**Scope:** 7 evidence-output files only. No source approval, no human/SME sign-off.

---

## OVERALL VERDICT: **CONDITIONAL PASS — 4 FAIL items require correction before next phase**

---

## 1. Evidence-Row Completeness: **FAIL**

**CSV/JSON rows are structurally incomplete for verification purposes.**

| Schema-required field (per `official-source-verification-evidence-schema.md`) | Status |
|---|---|
| `verification_evidence_id` | **Missing** — no stable row ID |
| `run_id` | **Missing** — no run identifier |
| `query_used` | **Missing** — the CSV has `new_candidate_url` but not what search query or search anchor produced that URL |
| `host_classification` | **Missing** — `candidate_source_type` is present but not the schema-defined `host_classification` enum |
| `retrieval_status` | Not present as a separate field; `evidence_status` role-blends this with match outcome |
| `content_type` | **Missing** — only `pdf_found` boolean exists |
| `official_match_status` schema field | Not defined; `evidence_status` approximates but doesn't use the schema enum |
| `allowed_use_after_run` | **Missing** — no row-level allowed-use declaration |
| `local_pdf_available` | `"unknown"` on every row |
| `local_file_hash_if_known` | **Empty** on every row |

**Correction required:** Add `verification_evidence_id`, `run_id`, `query_used`, `host_classification`, `retrieval_status`, `content_type`, `official_match_status`, and `allowed_use_after_run` columns. Populate `local_pdf_available` and `local_file_hash_if_known` by comparing against the local source inventory (or explicitly state "not yet compared" if deferred).

---

## 2. Stale or Outdated-Source Risk: **PASS with note**

BP 344 is correctly flagged as `OUTDATED_SOURCE_RISK` in the conflict register and leads files. The evidence notes properly warn: "Older BP 344 extracts remain OUTDATED_SOURCE_RISK until reconciled against this PDF."

**Note:** The register does not trace outdated-source risk to specific affected article content (`wiki_articles.content`) or question rationales (`questions.rationale`), as the conflict-resolution policy (§2.2–§2.3) requires. This is a scope gap, not a labeling error — no correction required for this review pass, but the next phase should map OUTDATED_SOURCE_RISK to specific downstream content.

---

## 3. Missing Local-File/Hash Matching Requirements: **FAIL**

**Zero rows perform local file comparison.**

- `local_pdf_available` = `"unknown"` on all 9 rows
- `local_file_hash_if_known` = empty on all 9 rows
- Even rows with `OFFICIAL_PDF_FOUND` status (BP 344, PD 1096, RA 11201) have no corresponding local hash to match against
- The files are transparent that this work is pending — but the evidence is structurally incomplete for verification. Per the `official-web-verification-policy.md` §3.1, verification requires: (1) download official file, (2) compute official hash (done for BP 344, PD 1096, RA 11201), (3) compute local hash (not done), (4) compare. Steps 3–4 are universally missing.

**Correction required:** For every row where `official_hash_if_downloaded` is populated, look up the corresponding local file(s) from `local-source-file-manifest.generated.csv` or `local-source-file-hashes.json` and populate `local_file_hash_if_known`. If the local file doesn't exist, set `local_pdf_available = false` and note the gap. If comparison can't be done in this phase, state it as a blocking condition rather than leaving "unknown".

---

## 4. Missing Locator Requirements: **FAIL**

| Row | `locator_evidence_found` | Actual locator data extracted |
|---|---|---|
| PD 1216 | `false` | None |
| RA 11285 IRR | `false` | None |
| BP 344 | `true` | No page/section locator data extracted; only confirms PDF was found and hashed |
| PD 1096 IRR | `true` | Same — no section/page locators extracted |
| RA 9514 RIRR | `false` | None |
| RA 9266 row 1 | `false` | None |
| RA 9266 row 2 | `true` (Lawphil) | Archive page only; no locators |
| PRC ALE/LEA | `false` | None |
| RA 11201 | `false` | None |

Per `source-verification-packet-schema.md` §6: "High/Critical legal-code sources must support page or section locators before grounding." All 9 rows are HIGH risk and none have extracted page/section locator data. The `source-verification-next-action-queue.md` defers locator work to "after governance review" — which is circular, since locator evidence is a prerequisite for governance review.

**Correction required:** For PDF-found rows (BP 344, PD 1096, RA 11201), add a `locator_status` field documenting whether the PDF has preserved page/section numbers. For page-found rows (RA 11285, RA 9266 Lawphil), note whether the HTML has visible section markers. For security-gated rows, document that locators cannot be assessed until access is obtained.

---

## 5. High-Risk Source Routing: **PASS**

- All 9 rows have `risk_tier: HIGH` and `human_review_required: true`
- 8/9 rows have `sme_review_required: true` (correctly; PRC ALE/LEA row has `sme_review_required: false` per its logistics-only scope)
- SECURITY_GATED rows correctly state "Security gate is not absence"
- The `official-source-verification-evidence-schema.md` §4 rule 4 (`allowed_use_after_run` remains `DISCOVERY_ONLY`) is honored throughout

No corrections needed.

---

## 6. Conflict-Register Completeness: **FAIL**

`source-conflict-register.generated.md` has **5 rows. It should have at least 7, possibly 8.**

| Missing entry | Reason |
|---|---|
| **PD 1216** (bundle-000017) | Not in register despite being in the three-packet queue |
| **RA 11201** (bundle-000018) | Carried forward in three-packet queue but not in register |
| **RA 11285 / RA 11285 IRR** (bundle-000019) | `OFFICIAL_PAGE_FOUND` with `INSUFFICIENT_EVIDENCE` but not listed |

Additionally:
- The `conflict_type` values used (`OUTDATED_SOURCE_RISK`, `INSUFFICIENT_EVIDENCE`, `SECURITY_GATED`, `OFFICIAL_SOURCE_BLOCKED`) do not match the recognized conflict type enum from the conflict-resolution policy §2.x or the evidence schema §4 (`local_vs_official_version`, `pdf_vs_derived_text`, `statute_vs_irr`, etc.)
- There are no `article_claim_vs_source` or `question_answer_vs_source` entries, though known stale-content risks exist (per `source-coverage-gap-map.md`)

**Correction required:** Add entries for PD 1216, RA 11201, and RA 11285. Remap conflict types to the canonical enum where possible. Document why article/question conflict entries are absent (e.g., "not yet mapped; requires local file matching first").

---

## 7. Forbidden-Label Leakage: **PASS**

No evidence row uses forbidden approval/promotion labels:
- Status values used: `SECURITY_GATED`, `OFFICIAL_PAGE_FOUND`, `OFFICIAL_PDF_FOUND`, `AUTHORITY_ARCHIVE_FOUND`, `OFFICIAL_SOURCE_BLOCKED` — all evidence-level, not approval-level
- No `VERIFIED_SOURCE_CANDIDATE`, `GROUNDING_CANDIDATE`, `CANONICAL`, `SOURCE_PACK_READY`, or `APPROVED` labels used
- `DISCOVERY_ONLY` is consistently maintained across all files
- Packet decisions correctly use `needs_more_evidence` and `ready_for_human_packet_review` with explicit caveats that no promotion has occurred
- `CLAUDE_REVIEW_STATUS = CLAUDE_UNAVAILABLE_TOKEN_LIMIT` and `fallback_review_used = browser_terminal` are correctly reported

**One presentational concern (not a label error):** `high-coverage-ale-official-source-leads.md` lists `OFFICIAL_PDF_FOUND` for PD 1096 and BP 344 with hashes but no local-matching caveat in the table body. The header says "Evidence-only" and the next-action column mentions "local hash/text/locator match," but a skim reader could misinterpret "OFFICIAL_PDF_FOUND" as verified. Recommend adding a footnote to the status column in that table: "†hash not yet matched to local files."

---

## Summary Table

| Check | Result | Severity |
|---|---|---|
| Evidence-row completeness | **FAIL** | HIGH |
| Stale/outdated-source risk | **PASS with note** | LOW |
| Local-file/hash matching | **FAIL** | HIGH |
| Locator requirements | **FAIL** | HIGH |
| High-risk source routing | **PASS** | — |
| Conflict-register completeness | **FAIL** | MEDIUM |
| Forbidden-label leakage | **PASS** | — |

**Overall: CONDITIONAL PASS.** The files are honest about their limitations and maintain appropriate evidence-only discipline. However, 4 FAIL items must be addressed before this evidence can feed into any downstream gate (Phase 0.5C, packet review, or source-pack build). The most critical gaps are: (1) no local file hash comparison despite having official PDF hashes, (2) no locator evidence for any HIGH-risk row, and (3) no stable row/run identifiers in the leads CSV. The conflict register is also missing 3 entries that the three-packet queue already tracks.

**Recommended corrections in priority order:**
1. Populate `local_file_hash_if_known` for the 3 rows where `pdf_hash_if_downloaded` exists — or explicitly set `local_pdf_available = false` and document the gap.
2. Add `verification_evidence_id`, `run_id`, and `allowed_use_after_run` to the CSV/JSON schema.
3. Add locator-status field for every PDF-found row (even if the answer is "not yet assessed").
4. Add PD 1216, RA 11201, and RA 11285 to the conflict register with canonical conflict types.
