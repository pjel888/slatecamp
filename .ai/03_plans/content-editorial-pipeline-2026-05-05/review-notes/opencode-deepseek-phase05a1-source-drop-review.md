I detect **evaluation/review** intent — the user wants a senior planning review of the Phase 0.5A.1 Source Drop Intake Protocol documents. My approach: read all 10 files in parallel, then synthesize findings against the 7 challenge areas.
I've now read all 10 documents. Here is the complete Phase 0.5A.1 source drop intake protocol review.

---

# Phase 0.5A.1 Source Drop Intake Protocol — Senior Planning Review

**Reviewer:** Sisyphus (senior planning reviewer)  
**Date:** 2026-05-05  
**Status:** Planning review only. No implementation. No file mutations.

---

## 1. Executive Verdict

```
CONDITIONAL PASS — with 5 required corrections and 2 recommended hardening items
```

The intake protocol documents form a **coherent, defensively structured set of gates**. The core safety mechanisms — the forward-only state machine, the six-criterion grounding gate, the quarantine rules, the 10-rank authority hierarchy, the conflict resolution matrix, and the manifest schema with 50+ traceability fields — are internally consistent and cross-reference each other effectively. The documents correctly establish that no source file can be used for grounding without passing all gating criteria, that original PDFs anchor the chain of trust, that extracted text is a derivative artifact, and that critical-risk content requires the highest verification standard.

The weaknesses found are **document-level gaps and softeners**, not structural design flaws. They are addressable through amendments to this document set before any source files arrive.

---

## 2. Challenge-by-Challenge Assessment

### 2.1 Whether the intake protocol prevents over-trusting local files

**Verdict: STRONG — minor hardening recommended.**

The state machine (§2 of intake protocol) requires files to progress through 7 sequential states before reaching `VERIFIED_SOURCE_CANDIDATE`. The grounding gate (§3.3) requires six criteria simultaneously: manifest entry, original hash, derived hash (if extracted), verification status ≥ `spot_checked`, risk tier assigned, and `allowed_use` ≥ `GROUNDING_CANDIDATE`. The quarantine rules (§7) block any file missing any of these.

The authority hierarchy (§2 of `source-authority-hierarchy.md`) reinforces this: a local PDF with unknown provenance is `LOCAL_UNKNOWN_PROVENANCE` and "must not be used for grounding" until it matches Rank 1 or 2.

**Issue found:** The intake protocol's state machine and the manifest's `allowed_use` field operate on parallel but not explicitly mapped axes. A file could theoretically be promoted to `VERIFIED_SOURCE_CANDIDATE` while still having `allowed_use = AUTHORING_CONTEXT_ONLY`. The state machine rule "No file in any state before `VERIFIED_SOURCE_CANDIDATE` may be used for grounding" doesn't cover this edge case — a `VERIFIED_SOURCE_CANDIDATE` file with `allowed_use = AUTHORING_CONTEXT_ONLY` should still be blocked from grounding.

**Recommended correction:** Add an explicit cross-reference table mapping intake states to minimum allowed `allowed_use` values, and add a rule that `VERIFIED_SOURCE_CANDIDATE` requires `allowed_use` ≥ `GROUNDING_CANDIDATE`.

---

### 2.2 Whether original PDFs are required strongly enough

**Verdict: INCONSISTENT — requires correction.**

The manifest schema (§2.1) requires `original_pdf_path` and `original_file_sha256` as required fields. The grounding gates (§4.3) require `original_file_sha256` is not null. This effectively requires an original PDF for any file to pass the grounding gate. **This is correct.**

However, the intake protocol §3.1 states: "Original PDFs must be retained **whenever possible**" (emphasis mine). This softener contradicts the manifest schema and creates a loophole: an operator could argue a PDF wasn't retained because it wasn't "possible."

The `local-pdf-extraction-provenance.md` §2.1 also uses a conditionally-worded checklist item: "Original PDF retained in known location" — which is correct as a checklist item but doesn't elevate the requirement to mandatory status.

**Required correction:** Amend `source-drop-intake-protocol.md` §3.1 to read: "Original PDFs **must** be retained and stored in `01_original_pdfs/`. A file without a retained original PDF and recorded `original_file_sha256` cannot pass the grounding gate. If the original PDF is deleted, the chain of trust is broken and the derived text must be reclassified as `UNVERIFIED`."

---

### 2.3 Whether extracted Markdown/text is correctly treated as an artifact, not a source

**Verdict: STRONG — no issues.**

The intake protocol §3.2 is explicit: "Extracted text is a grounding artifact, not the source itself." The authority hierarchy reinforces this: extracted text chunks are Rank 7 with the critical rule: "The chunk must point back to its Rank 1-3 parent. If the parent is invalidated, the chunk is invalidated." The manifest schema enforces this through `original_pdf_path` and `derived_text_path` as separate required fields, with `derived_text_sha256` tracked independently.

The `local-pdf-extraction-provenance.md` §3 (claim-level citation safety) correctly classifies direct text extraction as "Conditional" (requires documentation and spot-checking) and OCR extraction as "High risk." This is appropriate because the extraction process can introduce errors.

**No correction needed.** The artifact-vs-source distinction is well-defended across multiple documents.

---

### 2.4 Whether manifest fields are sufficient for legal/code source traceability

**Verdict: STRONG — one recommended addition.**

The manifest schema defines 50+ fields including: `source_id`, `source_title`, `document_code`, `law_code`, `issuing_body`, `publisher`, `jurisdiction`, `version_year`, `effective_date`, `publication_date`, `original_file_sha256`, `derived_text_sha256`, `extraction_quality`, `has_page_locators`, `has_section_locators`, `has_table_preservation`, `official_url_candidate`, `official_web_match_status`, `verification_status`, `risk_tier`, `supersedes`, `superseded_by`, and `notes`. The chunk ID convention adds page/rule/section-level locators. This is comprehensive for legal traceability in the Philippine building code domain.

**Recommended addition:** Philippine building codes are frequently amended in part (not wholesale replacement). A `partially_superseded_by` field or an `amendment_status` enum (`current`, `amended_in_part`, `fully_superseded`, `draft_amendment_pending`) would improve traceability for scenarios where a 2004 IRR is still mostly operative but specific sections were amended by a later issuance. The `notes` field can carry this information, but structured fields enable automated gating.

**No correction required, but consider for manifest schema v2.**

---

### 2.5 Whether source IDs are stable and version-aware enough

**Verdict: CONDITIONAL PASS — one required correction.**

The naming convention encodes `<document-code>-<document-type>-<publisher>-<version-or-year>`. The stability rules (§4) are well-defined: IDs don't change once assigned; new revisions get new IDs; chunk IDs remain stable across re-extraction if content is substantively identical.

**Issue found:** The convention allows `current` as a version-year value (§2.2: "`current` if the exact year is unknown but the document is believed current"). This is inherently unstable. An ID like `ra9266-act-og-current` could silently refer to different documents over time as new versions are obtained. If a 2024 version is later obtained and assigned `ra9266-act-og-2024`, the `current`-labeled entry becomes ambiguous: was it the 2024 version or something earlier?

**Required correction:** Deprecate `current` as a version value. If the year is unknown, use `unknown` with a required `effective_date` or `publication_date` estimate and a `notes` entry explaining the uncertainty. Document that `unknown` is a signal to prioritize version identification, not a permanent classification. Alternatively, permit `current` only when paired with a mandatory `date_assigned_current` field in the manifest that records when the `current` label was applied and what evidence supported it.

---

### 2.6 Whether critical-risk content remains blocked until verified_match or expert_reviewed

**Verdict: STRONG — consistent across documents.**

Three independent documents enforce this:

1. **Manifest schema §4.3 (Grounding Gates):** "If `risk_tier` is `CRITICAL`, `official_web_match_status` must be `verified_match` or `verification_status` must be `expert_reviewed` / equivalent human sign-off. `presumed_match` is not sufficient for Critical-risk grounding."

2. **Intake protocol §7 (Quarantine Rules):** "`risk_tier` is `HIGH` or `CRITICAL` → Require human verification before any use."

3. **Authority hierarchy §3 (Minimum Authority for Claim Grounding):** Critical content (answer keys, code citations, dimensional standards) requires Rank 1-3 (official PDF or verified local PDF).

The manifest schema §4.2 (Allowed Status Combinations) further reinforces this: `presumed_match` + `spot_checked` is "Yes for Low/Medium/High only — Not sufficient for Critical-risk grounding."

**No correction needed.** The blockade is multilayered and consistent.

---

### 2.7 Whether source-pack creation remains blocked until at least one verified source candidate exists

**Verdict: STRONG — correctly blocked.**

The intake protocol §6 Step 7 states: "Only files in `VERIFIED_SOURCE_CANDIDATE` may be chunked and packaged into a source pack." The `source-pack-readiness-report.md` §1 issues a formal NO-GO for source-grounded prototype work. The `readiness-report.md` §15 lists "Source packs do not exist" as a Critical blocker for implementation.

Currently, `vitruvius-connection/` is empty (confirmed by `local-source-file-inventory.md` §2), zero local files exist, and zero source packs exist. Source-pack creation is correctly blocked.

**No correction needed.**

---

## 3. Blockers Before Source-Pack Creation

These must be resolved before any source pack can be created:

| # | Blocker | Source Document | Resolution Required |
|---|---|---|---|
| 1 | **No source files exist in `vitruvius-connection/`** | `local-source-file-inventory.md` §2, §6 | Files must be placed in the intake folder |
| 2 | **No file has reached `VERIFIED_SOURCE_CANDIDATE`** | `source-drop-intake-protocol.md` §2, §6 | At least one file must progress through the full state machine |
| 3 | **Source-pack storage location not formally decided** | `source-pack-readiness-report.md` §5.1.3 | Pick `.ai/16_source_packs/` or `.ai/content-audit-export/source-packs/` |
| 4 | **Copyright/provider boundary not accepted** | `source-pack-readiness-report.md` §5.1.4; `readiness-report.md` §14 | Decide whether Philippine government legal documents can be sent to AI providers |
| 5 | **`wiki_article_sources` verification audit not run** | `source-pack-readiness-report.md` §5.1.6 | Run live query to confirm verification state of 1,110 citation rows |
| 6 | **`taxonomy_sources` contradiction not resolved** | `source-pack-readiness-report.md` §5.1.5 | Investigate why 0 rows exist despite schema claiming completeness |

---

## 4. Blockers Before Phase 1B

These are documented in `readiness-report.md` §15 and `source-pack-readiness-report.md` §5. The source-pack-specific blockers are:

| # | Blocker | Severity |
|---|---|---|
| 1 | One approved source pack with ≥10 chunks, verification, and hash | Critical |
| 2 | Acceptance rule accepted: "no high-risk article enters Phase 1B without approved source-pack candidate or explicit unsourced baseline" | Critical |
| 3 | Phase 1A detailed article inventory by content type, source risk, UI-block usage, and question linkage | High |
| 4 | Component registry prop/nesting validation approach selected | High |
| 5 | Question-bank artifact schema drafted | High |
| 6 | Admin audit pipeline artifact-to-table mapping completed | High |
| 7 | Reviewer roles, capacity, authority, and SLA defined | High |
| 8 | Replay-grade traceability fields defined as mandatory | High |
| 9 | Rollback drill authorized and completed | High |
| 10 | Provider/data-governance boundary accepted | High |

---

## 5. Overclaims to Remove

### Overclaim 1: `local-source-file-inventory.md` §2 lists 567 `sources.json` files as `LOCAL_SECONDARY_COPY`

These files are Supabase export metadata (label strings, no text). The authority hierarchy correctly classifies them as Rank 8 (DB citation rows, discovery seed only). However, the `LOCAL_SECONDARY_COPY` classification in the inventory table could be misinterpreted as having secondary source value. These contain no source text, no verified URLs, and no claim locators.

**Correction:** Reclassify as `DB_EXPORT_CITATION_METADATA` with a note that these are discovery seeds, not sources. Or remove from the inventory table entirely since they are not source files — they are export artifacts. The inventory should only contain actual source material candidates.

### Overclaim 2: `source-authority-hierarchy.md` §1 Rank 5 says Lawphil/Senate archives have "High" authority

The document itself acknowledges the limitation in the text ("may lag behind latest IRR amendments") and §5 asks Claude to review "Is Rank 5 too high?" But this is stated as a question, not resolved. Rank 5 being "High for statute text" where IRR amendments may not be reflected creates a false confidence risk.

**Correction:** Downgrade Rank 5 to "Moderate" authority with a mandatory cross-check against the issuing body's latest IRR before any grounding use. The "authority for statute text" qualifier should be made more prominent.

### Overclaim 3: `readiness-report.md` §4.3 states existing fact-checking artifacts as "PARTIAL, HIGH RISK"

This is accurate but the document also lists `.ai/14_fact_checking/` with 418 flags as a "capability." These are historical manual artifacts, not an operational pipeline stage. The framing as "Existing fact-checking capabilities" in §4.3 could be read as suggesting they are actionable.

**Correction:** Retitle §4.3 header to "Historical Fact-Checking Artifacts (Not Operational)" to prevent any implication that these flags are currently usable for automated grounding.

---

## 6. Required Corrections (Summary)

| # | Correction | Document | Severity |
|---|---|---|---|
| C1 | Harden "whenever possible" to mandatory PDF retention | `source-drop-intake-protocol.md` §3.1 | High — creates grounding gate loophole |
| C2 | Deprecate `current` as version value or require `date_assigned_current` | `source-id-naming-convention.md` §2.2 | High — ID instability risk |
| C3 | Add explicit intake-state-to-allowed_use mapping table | `source-drop-intake-protocol.md` §2 or `source-file-manifest-schema.md` §3 | Medium — parallel status systems risk misalignment |
| C4 | Reclassify 567 `sources.json` files from `LOCAL_SECONDARY_COPY` to `DB_EXPORT_CITATION_METADATA` | `local-source-file-inventory.md` §2 | Medium — prevents false confidence |
| C5 | Downgrade Rank 5 (Lawphil/Senate) authority from "High" to "Moderate" for IRR-dependent claims | `source-authority-hierarchy.md` §1 | Medium — prevents over-trusting outdated statute text |
| R1 | Add `amendment_status` field to manifest schema | `source-file-manifest-schema.md` §2.2 | Low — recommended for v2 |
| R2 | Clarify that `VERIFIED_SOURCE_CANDIDATE` requires `allowed_use` ≥ `GROUNDING_CANDIDATE` | `source-drop-intake-protocol.md` §2 | Low — edge case hardening |

---

## 7. Final Assessment

The Phase 0.5A.1 documents **pass review with corrections required**. The defensive architecture is sound: files cannot bypass the grounding gate, critical-risk content has multilayered blockade, extracted text correctly serves as derivative artifact rather than source, and the manifest schema provides sufficient legal traceability fields.

The five required corrections (C1-C5) are all text-level amendments to planning documents — no structural redesign is needed. The six source-pack blockers (Section 3) are all preconditions that depend on external actions (files arriving, human verification, copyright decisions), not flaws in the protocol.

**Recommended immediate action:** Apply corrections C1-C5 to the document set, then proceed with the `wiki_article_sources` verification audit and taxonomy_sources contradiction investigation. When finalized source files arrive, the intake protocol is ready to receive them.
