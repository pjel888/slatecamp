I detect **evaluation/audit** intent — reviewing Phase 0.5A source-file readiness policies against specific challenge criteria. My approach: read all files in parallel, then deliver a structured verdict.

Let me read all 10 files simultaneously.
Now let me also check the two remaining files I need — the Phase 0.5 source-pack docs referenced:

I've already read `source-canonicality-decision.md`, `source-pack-schema-readiness.md`, `source-pack-readiness-report.md`, `readiness-report.md`, and `README.md` in full. I have all the content I need.

---

# Phase 0.5A Local Source File Readiness — Senior Planning Review

## Phase 0.5A Verdict

**CONDITIONAL GO with 2 hard-blocking findings, 3 must-resolve open questions, and 2 overclaims to correct.**

The Phase 0.5A docs are the most rigorous source-governance planning I've seen in this repo. The inventory is honest (zero local files), the hierarchy is well-sorted, the extraction provenance requirements would pass a peer review, and the conflict resolution policy correctly defaults to "flag, block, require human review." The major finding is not that the documents are wrong — it's that a few open questions, if answered incorrectly, could undermine the most important safeguards.

---

## Challenge-by-Challenge Findings

### 1. Whether local PDF-derived files are being over-trusted

**Finding: NO over-trust. Appropriate caution.**

- `local-source-file-inventory.md` reports zero local PDFs, zero extracted text, zero `vitruvius-connection/`. The inventory table is empty by classification — every row is either `LOCAL_SECONDARY_COPY`, `NOT_A_SOURCE`, or `LOCAL_UNKNOWN_PROVENANCE` (pending).
- `source-authority-hierarchy.md` ranks local PDFs at Rank 3–4 (below official issuing-body PDFs at Rank 1–2), and extracted text at Rank 7 (explicitly labeled "grounding artifact, not the source" in principle 2.1).
- `local-pdf-extraction-provenance.md` Section 5 declares: "ALL local files are unsafe for claim-level citation because no extracted source text exists."

**Risk assessement:** Low. The documents are appropriately skeptical. No file can be used for grounding without passing the provenance checklist in `local-source-file-inventory.md` Section 5.

---

### 2. Whether original PDFs are distinguished from extracted text

**Finding: Properly distinguished. No conflation.**

The separation is enforced at three levels:

| Level | Original PDF Fields | Extracted Text Fields |
|---|---|---|
| Inventory (`local-source-file-inventory.md` §5) | `file_hash_sha256`, `original_pdf_available`, `page_count` | `text_hash_sha256`, `derived_text_available`, `extraction_method`, `extraction_quality` |
| Authority (`source-authority-hierarchy.md`) | Rank 3 (`LOCAL_OFFICIAL_PDF_VERIFIED`), Rank 4 (`LOCAL_OFFICIAL_PDF_UNVERIFIED`) | Rank 7 ("grounding artifact, not the source") |
| Schema (`source-pack-schema-readiness.md`) | `raw_file_hash`, `local_file_path`, `original_file_name`, `total_pages` | `extracted_text_hash`, `derived_text_path`, `extraction_method` |

Principle 2.1 in the authority hierarchy is explicit: "If the parent is found to be outdated, wrong, or non-official, the chunk must be marked invalid regardless of its own quality."

**Risk assessment:** Low. Well-defined separation.

---

### 3. Whether hashes/versioning/page locators are required before grounding

**Finding: STRONG requirements, with one open decision.**

Required before any file reaches `LOCAL_OFFICIAL_PDF_VERIFIED`:

- `file_hash_sha256` and `text_hash_sha256` — required inventory fields
- `version/date` and effective date — required inventory fields
- Page locator support — required classification (`exact_page`, `section_only`, `approximate`, `none`)
- Section/page preservation — required in the provenance checklist
- `source_pack_hash`, `raw_file_hash`, `extracted_text_hash` — required in the source pack schema

`local-pdf-extraction-provenance.md` Section 3 explicitly classifies extraction without section/page preservation as **"Unsafe — Cannot generate claim locators; cannot verify."**

**Open question (Section 7, Q4 of that doc):** "What is the minimum acceptable extraction quality for exam-prep legal text: `good` or `excellent`?" This needs an answer before `vitruvius-connection/` files can be used. For critical-risk content (answer keys, dimensional standards), the answer should be `excellent`. Leaving this open creates ambiguity about whether a `good` extraction of a legal text could ground critical claims.

---

### 4. Whether official web verification is strict enough

**Finding: Adequately strict, with one high-severity open question.**

Strengths:
- Direct hash verification is the preferred method (§3.1)
- Spot-check fallback with 5% or 10-page minimum (§3.2)
- Version-date comparison required (§3.3)
- Prohibited actions list is explicit: no Scribd/CourseHero/Studocu as canonical, no search-snippet citations, no LLM-generated legal text (§4.2)
- Candidate verification anchors already identified for PD 1096, BP 344, RA 9514, RA 9266, PD 957, PRC board program (§7)

**Critical open question (Section 8, Q4 of that doc):** "Should `presumed_match` ever be accepted for Critical-risk content, or only for Low/Medium risk?"

The `source-authority-hierarchy.md` requires Rank 1–3 (official or hash-verified) for Critical-risk content. `presumed_match` means the hash didn't match but content spot-checking showed the text was the same — this implies the file is a different encoding/compression of the same source, or a slightly different version. For Critical-risk content (answer keys, code citations, dimensional standards), `presumed_match` should NOT be sufficient — the student's exam answer depends on whether "1.20 meters" or "1.2 m" or "1200 mm" is the correct text. This question must be resolved before source packs can be approved.

**Additional gap:** Section 5's handling of "official website is down" says "retry after 24 hours." For time-critical launch work, a hard 24-hour retry cycle may be too slow. Consider: retry at escalating intervals (1h, 6h, 24h) before classifying as `access_restricted`.

---

### 5. Whether third-party mirrors are excluded from canonical use

**Finding: Strongly and consistently excluded.**

Three separate documents reinforce this:

| Document | Classification |
|---|---|
| `source-authority-hierarchy.md` Rank 10 | "Third-Party Mirrors: Not authoritative. Use for grounding: No. Permitted use: Discovery only." |
| `official-web-verification-policy.md` §4.2 | "Treating Scribd/CourseHero/Studocu as canonical: Prohibited." |
| `source-canonicality-decision.md` | Not listed as any valid source classification |

**Risk assessment:** Very low. This rule is unambiguous and consistently applied.

---

### 6. Whether conflict resolution blocks unsafe rewriting

**Finding: Strongly conservative. One nuance needs resolution.**

The `source-conflict-resolution-policy.md` is the most operationally sound document in the pack. Key protections:

- **Default posture for every conflict type:** Flag, block, require human review (§1)
- **Answer keys:** "Never auto-change an answer key without human approval" (§2.3)
- **Question rationale contradictions with answer key:** "Critical bug. Flag question for immediate review" (§2.3)
- **Statute-vs-IRR conflicts:** "Flag as STATUTE_IRR_CONFLICT. This is a legal ambiguity. Require legal/SME review. Do not resolve automatically" (§2.4)
- **Conflict logging** with required fields (§4): conflict_id, claim_id, source_a, source_b, resolution_status, resolved_by, resolved_at

**Open question (Section 5, Q2):** "Is the 'PRC Program Override' too strong? Should there be a caveat that PRC program errors should still be flagged even if they govern exam prep?"

This is a genuine tension. If the PRC board program contains an error (e.g., cites an outdated IRR version), blindly following it could cause students to answer incorrectly on the actual exam. The PRC program should be treated as the **default** for exam prep but should still be flagged when it contradicts current legal text. The student should know both: "The board program says X, but the current law says Y. The exam is likely to test X, but professional practice requires Y."

**Recommendation:** Add a rule: "When PRC program contradicts current legal text, flag as `PRC_VS_CURRENT_LAW` and include both texts in the review packet. The default exam-prep answer follows PRC, but the contradiction must be disclosed to the student."

---

### 7. Whether Phase 1B remains correctly blocked

**Finding: Correctly and consistently blocked. The block is well-defended.**

The block is reinforced by four independent documents:

| Document | Verdict |
|---|---|
| `source-pack-readiness-report.md` §1 | "NO-GO for source-grounded prototype work" |
| `readiness-report.md` §18 | "Phase 1B non-mutating prototype: BLOCKED until at least one pilot slice satisfies source/export/UI/admin scope gates" |
| `source-canonicality-decision.md` Decision Gate | "Before Phase 1B can begin: at least one approved source pack must exist" |
| `source-pack-schema-readiness.md` §5 Acceptance Rule | "No high-risk article can enter Phase 1B unless it has an approved source-pack candidate or is explicitly marked as an unsourced baseline/control" |

The conditions for unblocking are explicit:
1. One approved source pack exists (10+ chunks, spot-checked, hashed)
2. Storage location decided
3. Copyright/provider boundary decided
4. `taxonomy_sources` contradiction resolved
5. `wiki_article_sources` verification audit completed
6. Acceptance rule formally accepted

**The narrow exception** (`readiness-report.md` §18: "low-risk articles with structural/component improvements only") is properly scoped and doesn't weaken the block on high-risk content.

**Risk assessment:** Low. The block is the strongest and most consistent gate in the entire plan pack.

---

### 8. Whether question-bank source requirements remain separate from article requirements

**Finding: Well-separated. Different schemas, different rules, different risk profiles.**

The separation is enforced at multiple levels:

| Dimension | Article Requirements | Question Requirements |
|---|---|---|
| Schema | Claim-to-Chunk Linkage Object (§2.3 of `source-pack-schema-readiness.md`) | Question-to-Chunk Linkage Object (§2.4) with `answer_key_claim`, `rationale_claims`, `code_citation_normalized` |
| Conflict resolution | §2.2: paraphrase is OK if meaning preserved | §2.3: rationale contradictions are "Critical bug. Flag question for immediate review" |
| Risk classification | Content risk (Critical/High/Medium/Low) | Separate `validation_status` with `citation_mismatch`, `conflicting_source`, `needs_human_review` |
| Phase 1B rule | Article source packs can be reused for questions | Question-bank edits remain out of scope unless linkage object is accepted AND `code_citation` is normalized |
| Unblock criteria | Requires 5 pilot article links | Separately requires 100 question links to source pack chunks |

**Risk assessment:** Low. The separation is explicit and operational.

---

## Blocker Summary

### Blockers Before Source-Pack Creation

| # | Blocker | Severity | Document Reference |
|---|---|---|---|
| B1 | No local PDFs exist; `vitruvius-connection/` folder not created | **Critical — no data to create packs from** | `local-source-file-inventory.md` §6 |
| B2 | Storage location not decided (`.ai/16_source_packs/` vs Supabase vs root) | **Critical — no location for packs** | `source-pack-schema-readiness.md` §3 |
| B3 | Extraction method not chosen (pymupdf vs pdfminer vs manual OCR) | **High — determines extraction quality** | `local-pdf-extraction-provenance.md` §2.2 |
| B4 | Copyright/provider-boundary classification not decided for Philippine government documents | **Critical — blocks AI processing permission** | `source-pack-schema-readiness.md` §6 |
| B5 | `taxonomy_sources` contradiction (0 rows vs comment claiming completeness) not resolved | **High — blocks node-level source linkage** | `source-canonicality-decision.md` §2 |
| B6 | Minimum acceptable extraction quality for legal text not decided (`good` vs `excellent`) | **High — determines whether extraction quality gate passes** | `local-pdf-extraction-provenance.md` §7 Q4 |

### Blockers Before Phase 1B

All of the above (B1–B6) plus:

| # | Blocker | Severity | Document Reference |
|---|---|---|---|
| B7 | At least one approved source pack must exist (10+ chunks, spot-checked, hashed) | **Critical — acceptance rule prerequisite** | `source-pack-schema-readiness.md` §5 |
| B8 | `presumed_match` for Critical-risk content not resolved | **Critical — could allow insufficiently verified legal text into exam-prep content** | `official-web-verification-policy.md` §8 Q4 |
| B9 | PRC Program Override needs a "flag errors" caveat | **High — could propagate PRC errors to students** | `source-conflict-resolution-policy.md` §5 Q2 |
| B10 | `wiki_article_sources` verification audit not completed (current export shows 1,110/1,110 `is_verified: false`, 0 populated URLs) | **High — false confidence in existing citations** | `source-pack-readiness-report.md` §5.1 item 6 |

---

## Overclaims to Remove

### OC1: `source-pack-schema-readiness.md` §9 — "The schema is ready for data"

> "The schema is ready for data, but data does not yet exist."

**Why this is an overclaim:** The schema assumes infrastructure that doesn't exist — a `source_packs` table or directory, an indexing subsystem, a chunking pipeline, and a claim-to-chunk linkage system. "Ready for data" implies the schema is implementable without further decisions. It is not — §6 lists 9 unresolved issues, several of which are critical.

**Correction:** Replace with: "The schema structure is planned and documented. Multiple unresolved issues remain (§6), including storage location, copyright status, and provider-boundary classification. The schema represents design intent, not a finalized implementation contract."

### OC2: `source-authority-hierarchy.md` §3 — Minimum Authority for Claim Grounding table

> Medium risk (professional practice rules, contract clauses): Rank 1–5 (official or Lawphil/Senate)

**Why this is an overclaim:** Rank 5 (Lawphil/Senate) is presented as acceptable for Medium-risk content. But Lawphil may not reflect the latest IRR amendments — the document itself acknowledges this in §2.1 Limitation. For contract clauses and professional practice rules that affect exam answers, Lawphil may not be sufficient. The document's own §5 Q1 asks "Is Rank 5 too high?" — the table should not be presented as final while this question is open.

**Correction:** Mark the Medium row in the table with a caveat: "Lawphil acceptable only when IRR text is not materially relevant or when official source is unavailable. When in doubt, escalate to Rank 1–3." Or, resolve §5 Q1 before presenting the table as operational.

---

## Required Corrections

### RC1: Resolve `presumed_match` for Critical-risk content

**Where:** `official-web-verification-policy.md` §8 Q4

**Current state:** Open question asking whether `presumed_match` is acceptable for Critical-risk.

**Required:** Add a rule: `presumed_match` is **never** sufficient for Critical-risk content (answer keys, dimensional standards, code citations). Critical-risk content requires `verified_match` (hash-confirmed) or `expert_reviewed` (SME-confirmed). Without this rule, a hash-mismatch that passes a spot-check could still ground content where the exact text matters to exam success.

### RC2: Add PRC Program Override caveat

**Where:** `source-conflict-resolution-policy.md` §3.2

**Current state:** "If the PRC board program explicitly specifies a version, rule, or interpretation, that specification governs for exam-prep content even if it differs from the latest legal text."

**Required:** Append: "When PRC program contradicts current legal text, the pipeline must flag the discrepancy as `PRC_VS_CURRENT_LAW`. Both texts must be included in the review packet. The default exam-prep answer follows the PRC program, but the contradiction must be disclosed to the student in editorial content."

### RC3: Decide minimum extraction quality for legal text

**Where:** `local-pdf-extraction-provenance.md` §7 Q4

**Current state:** Open question.

**Required:** Set the minimum to `excellent` for Critical-risk and High-risk content. `good` is acceptable for Medium-risk and Low-risk content. This directly connects to the authority hierarchy's minimum-rank table in `source-authority-hierarchy.md` §3.

---

## Overall Assessment

The Phase 0.5A documents are **well-constructed, internally consistent, and appropriately cautious**. They correctly identify that the repo has zero local primary source files, that no source pack exists, and that Phase 1B remains blocked. The authority hierarchy, extraction provenance requirements, and conflict resolution policies are operationally sound.

The three issues that need resolution (RC1–RC3) are all about hardening the boundaries between planning and implementation — answering the open questions that, if left open, could allow verified content to reach students:

| Issue | What it prevents |
|---|---|
| `presumed_match` for Critical content | A student failing because "1.2m" was in the source but "1.20 meters" was in the extraction |
| PRC Program Override without error flagging | A student learning an outdated rule because PRC's board program hasn't been updated |
| Minimum extraction quality undecided | A `good` extraction of legal text being used where `excellent` was needed |

These are not theoretical concerns. They are the exact failure modes that a source-grounded editorial pipeline exists to prevent.
