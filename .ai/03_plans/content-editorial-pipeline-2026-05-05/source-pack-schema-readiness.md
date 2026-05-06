# Source Pack Schema Readiness — Phase 0.5 Planning

**Date:** 2026-05-05
**Scope:** Define the required future source-pack schema. Include source identity, version, URL, publisher, verified status, claim support, locators, article links, question links, risk level, and unresolved issues.
**Constraint:** This document defines the planning schema only. It does NOT generate actual source packs, embeddings, or chunks.

---

## 1. Purpose

A source pack is a structured, versioned, claim-addressable collection of source text excerpts from an official/legal/technical document. It is the canonical authority against which AI-proposed factual changes are validated.

A source pack is NOT:
- A citation row (`wiki_article_sources` is a citation row, not a source pack).
- A URL list (URLs are pointers, not verifiable text).
- An article (`wiki_articles.content` is editorial prose, not official text).
- A fact-checking flag (flags are judgments, not sources).

---

## 2. Required Source Pack Schema

### 2.1 Top-Level Source Pack Object

```json
{
  "source_pack_id": "string — unique identifier (e.g., pd1096-irr-2004-v1.0.0)",
  "title": "string — human-readable title (e.g., PD 1096 2004 Revised IRR)",
  "source_type": "enum — primary_pdf | official_html | scanned_ocr | transcription | compilation",
  "publisher": "string — official publisher (e.g., DPWH, Philippine Congress)",
  "official_url": "string — canonical official URL if available",
  "official_web_match_status": "enum — not_checked | candidate_url_identified | verified_match | presumed_match | mismatch | no_official_url_found",
  "local_file_path": "string — path to local primary file (e.g., vitruvius-connection/pdfs/pd1096-irr-2004.pdf)",
  "original_file_name": "string — original PDF/source filename before normalization",
  "derived_text_path": "string or null — path to Markdown/text derived from the source file",
  "version_label": "string — version identifier (e.g., 2004 Revised IRR, 2024 Edition)",
  "version_date": "ISO 8601 date — date of the official version",
  "effective_date": "ISO 8601 date — date the version became effective",
  "supersedes": ["array of source_pack_ids this version replaces"],
  "superseded_by": "source_pack_id or null — if this version is obsolete",
  "language": "string — e.g., en, fil, en-fil-mixed",
  "jurisdiction": "string — e.g., Philippines, National, Local",
  "extraction_method": "enum — pymupdf | pdfminer | manual_ocr | official_html_scrape | copypaste",
  "extraction_date": "ISO 8601 date — when text was extracted",
  "extracted_by": "string — person or process that performed extraction",
  "verification_status": "enum — unverified | spot_checked | fully_verified | expert_reviewed",
  "verified_by": "string or null — reviewer identifier",
  "verified_at": "ISO 8601 date or null",
  "total_pages": "integer or null",
  "total_chunks": "integer",
  "source_pack_hash": "string — sha256 hash of the entire normalized source pack JSON",
  "raw_file_hash": "string — sha256 hash of the original PDF/file",
  "extracted_text_hash": "string — sha256 hash of the derived Markdown/text used for chunking",
  "page_locator_support": "enum — exact_page | section_only | approximate | none",
  "table_preservation_status": "enum — preserved | partly_preserved | image_only | not_applicable | unknown",
  "copyright_status": "enum — public_domain | government_work | licensed | fair_use | unknown",
  "provider_boundary_classification": "enum — safe_for_ai_processing | restricted | do_not_send_to_provider",
  "risk_level": "enum — low | medium | high | critical",
  "notes": "string — editorial notes about this source pack",
  "chunks": ["array of Chunk objects — see 2.2"],
  "index": {
    "by_section": { "section_label": "chunk_id" },
    "by_page": { "page_number": ["chunk_id"] },
    "by_keyword": { "keyword": ["chunk_id"] }
  },
  "linked_articles": ["array of article_id strings"],
  "linked_questions": ["array of question_id strings"],
  "linked_taxonomy_nodes": ["array of node_id strings"],
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp"
}
```

### 2.2 Chunk Object

```json
{
  "chunk_id": "string — unique within source pack (e.g., pd1096-rule-viii-sec-805)",
  "section_label": "string — human-readable section (e.g., Rule VIII, Section 805)",
  "section_hierarchy": ["array of strings — breadcrumb to this section"],
  "legal_citation": {
    "law_code": "string — e.g., PD 1096, BP 344, RA 9514, RA 9266",
    "rule_number": "string or null — structured rule identifier, e.g., VIII",
    "section_number": "string or null — structured section identifier, e.g., 805",
    "irr_year": "string or null — e.g., 2004, 2024",
    "paragraph_identifier": "string or null — e.g., a, b, 1, 2",
    "is_current_version": "boolean or null — whether this chunk belongs to the currently accepted version"
  },
  "page_start": "integer or null",
  "page_end": "integer or null",
  "line_start": "integer or null",
  "line_end": "integer or null",
  "text": "string — exact source text excerpt",
  "text_hash": "string — sha256 hash of the text field",
  "is_table": "boolean — true if this chunk is a table extract",
  "is_formula": "boolean — true if this chunk contains a formula/calculation",
  "is_definition": "boolean — true if this chunk defines a term",
  "is_penalty": "boolean — true if this chunk specifies a penalty/fine",
  "is_exception": "boolean — true if this chunk is an exception to a rule",
  "keywords": ["array of strings — extracted keywords for retrieval"],
  "related_chunks": ["array of chunk_ids — semantically related chunks"],
  "cited_by_articles": ["array of article_id strings"],
  "cited_by_questions": ["array of question_id strings"],
  "verification_status": "enum — unverified | spot_checked | fully_verified",
  "verification_notes": "string or null"
}
```

### 2.3 Claim-to-Chunk Linkage Object (for pipeline use)

```json
{
  "claim_id": "string — unique claim identifier",
  "claim_text": "string — the factual claim being made",
  "source_pack_id": "string",
  "chunk_id": "string or null — null if source_needed",
  "chunk_text_excerpt": "string or null — the relevant excerpt",
  "support_level": "enum — direct_quote | paraphrase | inference | unsupported | source_needed",
  "locator": "string — human-readable locator (e.g., PD 1096 Rule VIII, Sec 805, p.123)",
  "confidence": "enum — high | medium | low",
  "reviewer_override": "string or null — reviewer decision if challenged",
  "created_at": "ISO 8601 timestamp"
}
```

### 2.4 Question-to-Chunk Linkage Object (separate from article claims)

Question-bank grounding is not equivalent to article grounding. A source pack may support both, but question validation must separately protect answer-key correctness, distractor validity, and rationale/citation consistency.

```json
{
  "question_id": "string — UUID from questions or design_scenario_questions",
  "question_table": "enum — questions | design_scenario_questions",
  "code_citation_raw": "string or null — original free-text citation",
  "code_citation_normalized": {
    "law_code": "string or null",
    "rule_number": "string or null",
    "section_number": "string or null",
    "irr_year": "string or null",
    "paragraph_identifier": "string or null"
  },
  "answer_key_claim": "string — factual/legal claim implied by the keyed answer",
  "rationale_claims": ["array of claim strings extracted from rationale"],
  "supported_by": [
    {
      "source_pack_id": "string",
      "chunk_id": "string",
      "locator": "string",
      "support_level": "direct_quote | paraphrase | inference | unsupported | source_needed"
    }
  ],
  "validation_status": "unvalidated | citation_matches | citation_mismatch | unsupported | conflicting_source | needs_human_review",
  "risk_level": "low | medium | high | critical"
}
```

**Phase 1B question rule:** question-bank edits remain out of scope unless this linkage object is accepted and a read-only citation-normalization strategy exists. Article source packs may be reused for question validation only after the question's free-text `code_citation` is normalized and matched to a chunk.

---

## 3. Storage Location Decision (Pending)

| Option | Pros | Cons | Status |
|---|---|---|---|
| `.ai/16_source_packs/` | Clean separation from exports; versionable | New directory; needs gitignore rules for large files | Under consideration |
| `.ai/content-audit-export/source-packs/` | Co-located with article bundles | Mixes primary sources with derived exports | Under consideration |
| `001_Raw-Source-Layer/` (repo root) | Clear top-level primary source signal | Unconventional for `.ai`-centric repo; may clutter root | Under consideration |
| Supabase table (`source_packs` JSONB) | Queryable; accessible to admin UI | Large text storage; migration needed; provider-boundary concerns | Under consideration |

**Phase 0.5 requirement:** Decide one primary storage location and one backup location.

---

## 4. Required Schema Maturity Levels

### Level 1: Feasibility (Phase 0.5)

- One source pack created manually for a high-coverage source.
- At least 10 chunks with `text`, `section_label`, `page_start`, `text_hash`, and structured `legal_citation` fields where the source is legal/code text.
- `source_pack_id`, `version_label`, `extraction_method` present.
- No index required.
- No article/question linkage required.

### Level 2: Pilot-Ready (Phase 1B)

- One full source pack for one official source (e.g., PD 1096 IRR).
- All chunks have `text`, `section_label`, `legal_citation`, `page_start`, `text_hash`.
- `verification_status` at least `spot_checked`.
- `source_pack_hash` and `raw_file_hash` present.
- Basic `by_section` index.
- Linked to at least 5 pilot articles.

### Level 3: Production-Ready (Phase 2+)

- Source packs for all high-risk clusters (PD 1096, BP 344, RA 9514, RA 9266, SPP, NSCP).
- All chunks fully verified or marked `unverified` with risk flag.
- Full index (`by_section`, `by_page`, `by_keyword`).
- Article and question linkage populated.
- `copyright_status` and `provider_boundary_classification` decided.
- Claim-to-chunk linkage operational.

---

## 5. Acceptance Rule for Phase 1B

> **No high-risk article can enter Phase 1B (non-mutating prototype) unless it has an approved source-pack candidate or is explicitly marked as an unsourced baseline/control.**

**Definition of "approved source-pack candidate":**
- `source_pack_id` is assigned.
- `version_label` and `version_date` are known.
- At least one chunk covers the article's primary subject matter.
- Legal/code chunks have structured `legal_citation` populated (`law_code`, rule/section where applicable, `irr_year`, and current-version flag).
- `verification_status` is `spot_checked` or higher.
- `source_pack_hash` is recorded.

**Definition of "unsourced baseline/control":**
- Article is explicitly marked `source_needed` in the pipeline.
- No factual changes are proposed by AI.
- Only structural/component/pedagogy improvements are allowed.
- Human reviewer must approve any factual addition.

---

## 6. Unresolved Issues

| Issue | Severity | Blocks |
|---|---|---|
| Storage location not decided | Medium | Source pack creation |
| Copyright status of official Philippine government documents not confirmed | High | Provider-boundary decision; AI processing permission |
| Extraction method not chosen | Medium | First source pack creation |
| No `source_packs` table or local directory exists | Critical | Any source-grounded work |
| `provider_boundary_classification` not defined | High | Cannot decide which source packs may be sent to AI providers |
| Chunk size strategy not defined (by section? by page? by paragraph?) | Medium | Consistency across source packs |
| No source-pack versioning policy (semver? date-based?) | Medium | Replay and traceability |
| No diff strategy for source-pack updates (new IRR version) | Medium | Long-term maintenance |
| `taxonomy_sources` contradiction not resolved | High | Node-level source linkage |

---

## 7. Comparison to Existing `10-source-pack-and-grounding-plan.md`

The existing plan (`10-source-pack-and-grounding-plan.md`) proposed a JSON shape with `source_pack_id`, `title`, `source_type`, `file_path`, `version_label`, `extraction_method`, and `chunks`.

This Phase 0.5 schema readiness document expands that shape to include:
- `publisher`, `official_url`, `effective_date`, `supersedes/superseded_by` — for version tracking.
- `verification_status`, `verified_by`, `verified_at` — for trust.
- `source_pack_hash`, `raw_file_hash` — for integrity.
- `copyright_status`, `provider_boundary_classification` — for governance.
- `risk_level`, `notes` — for pipeline risk scoring.
- `index` — for retrieval performance.
- `linked_articles`, `linked_questions`, `linked_taxonomy_nodes` — for cross-reference.
- `Claim-to-Chunk Linkage Object` — for pipeline traceability.

**Key addition:** The acceptance rule that no high-risk article enters Phase 1B without an approved source-pack candidate or explicit unsourced baseline marking.

---

## 9. Phase 0.5A Local Source File Readiness

### Current state
- Local intake files now exist in `vitruvius-connection/`: 2,551 visible files, including 47 PDFs and 1,840 Markdown files, recorded in the generated Phase 0.5A.2 artifacts.
- The source-pack schema defined in this document is **planning-only**; visible files do not make a source pack.
- Local files must be reconciled and verified with the fields defined in `local-source-file-inventory.md` and `source-file-manifest-schema.md`.
- Extraction quality must be documented per `local-pdf-extraction-provenance.md`.

### Impact on schema
- The schema structure is planned and documented, but it is not a finalized implementation contract.
- Multiple unresolved issues remain, including storage location, copyright/provider-boundary classification, first-source target, and validation tooling.
- Generated inventory artifacts now provide `local_file_path` and SHA-256 values for visible files, but source-pack-level `raw_file_hash` / `extracted_text_hash` entries are not approved until source-level grouping and verification are complete.

---

## 10. What Claude Should Review Next

1. Is the JSON schema too heavy for a first source pack? Should Level 1 (feasibility) be even simpler?
2. Should `provider_boundary_classification` be decided before any source pack is built, or can it be retrofitted?
3. Is `copyright_status = government_work` sufficient for Philippine official documents (PD 1096, BP 344, etc.)?
4. Should the first feasibility source pack target PD 1096 IRR (broad) or BP 344 IRR (narrower, more tractable)?
5. Does the schema need a `language` field for mixed English/Filipino sources?
