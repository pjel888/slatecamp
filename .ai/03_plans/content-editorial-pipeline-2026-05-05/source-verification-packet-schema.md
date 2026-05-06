# Source Verification Packet Schema — Phase 0.5B.1

**Created:** 2026-05-05T14:59:10Z  
**Scope:** Define the human/SME review packet required before a reconciled source bundle can become a verified source candidate.  
**Status:** Planning/evidence only. No source approval is implied by this schema.

---

## 1. Purpose

A source verification packet is the review object that converts a reconciled source bundle into a decision.

It answers one question:

```txt
Can this specific source document be used as a SlateCamp grounding candidate?
```

A packet is required before any source may move from `DISCOVERY_ONLY` or `AUTHORING_CONTEXT_ONLY` to `GROUNDING_CANDIDATE`.

---

## 2. Packet Header

```yaml
packet_id: svp-ra9514-rirr-bfp-2019-001
created_at_utc: 2026-05-05T00:00:00Z
bundle_id: bundle-000001
proposed_source_id: ra9514-rirr-bfp-2019
packet_status: DRAFT
review_required: SME_ADMIN
risk_tier: HIGH
allowed_use_requested: GROUNDING_CANDIDATE
```

---

## 3. Required Packet Fields

| Field | Required? | Description |
|---|---:|---|
| `packet_id` | Yes | Stable review packet ID |
| `bundle_id` | Yes | Reconciled source bundle being reviewed |
| `proposed_source_id` | Yes | Candidate stable source ID |
| `source_title` | Yes | Full document title |
| `document_code` | Yes | RA/PD/BP/IRR/SPP/code identifier where applicable |
| `issuing_body` | Yes | Official issuing or administering body |
| `publisher` | Yes | Publisher/host of official file or page |
| `jurisdiction` | Yes | Usually `Philippines` |
| `version_year` | Yes | Explicit year or `unknown` |
| `effective_date` | Required if legal/code | Date the rule/law/version took effect |
| `publication_date` | Required if known | Publication date |
| `amendment_status` | Yes | `current`, `amended_in_part`, `fully_superseded`, `unknown` |
| `local_files` | Yes | Files and hashes in the bundle |
| `official_url_candidates` | Yes | Official URL search results, even if empty |
| `official_match_status` | Yes | `verified_match`, `presumed_match`, `unverified`, `no_official_url_found` |
| `verification_method` | Yes | Hash match, text fingerprint, page spot-check, expert review, etc. |
| `locator_support` | Yes | Page/section/table/formula locator evidence |
| `extraction_quality` | Yes | `excellent`, `good`, `fair`, `poor`, `unusable`, or `not_applicable` |
| `conflicts` | Yes | Any local/official/source-version/article contradiction |
| `review_decision` | Yes before promotion | Approve/reject/needs more evidence |
| `reviewer` | Yes before promotion | Human/SME/admin reviewer identity or role |
| `review_notes` | Yes before promotion | Decision rationale |
| `approved_allowed_use` | Yes before promotion | Final allowed use value |

---

## 4. Local File Evidence Block

```yaml
local_files:
  - source_file_id: sf-000123
    role: original_pdf
    path: vitruvius-connection/002_Raw-Conversion-Layer/...
    sha256: <hash>
    file_type: pdf
    size_bytes: 1234567
  - source_file_id: sf-000124
    role: refined_markdown
    path: vitruvius-connection/002_Raw-Conversion-Layer/...
    sha256: <hash>
    file_type: markdown
    derived_from: sf-000123
  - source_file_id: sf-000125
    role: refinement_sidecar_json
    path: vitruvius-connection/002_Raw-Conversion-Layer/...
    sha256: <hash>
    file_type: other
```

Rules:

- A legal/code packet should identify the retained original PDF when available.
- Derived Markdown/text must not be treated as the source itself.
- If no original PDF exists, the packet must explain why and must not request `CANONICAL_AFTER_REVIEW` for High/Critical content.

---

## 5. Official Web Evidence Block

```yaml
official_web:
  search_completed_at_utc: 2026-05-05T00:00:00Z
  searched_sources:
    - Official Gazette
    - issuing body website
    - Lawphil
  url_candidates:
    - url: https://example.gov.ph/document.pdf
      host_type: official_issuing_body
      retrieval_status: reachable
      document_title_match: high
      version_match: high
      notes: candidate appears to match local document title and year
  selected_official_url: null
  official_match_status: unverified
  match_method: not_completed
```

Rules:

- Search summaries are not official verification.
- Third-party mirrors can be recorded as discovery leads only.
- High-risk `presumed_match` requires documented exhaustive official-source search.
- Critical-risk material requires `verified_match` or `expert_reviewed`.

---

## 6. Locator Support Block

```yaml
locator_support:
  page_count_known: true
  page_count: 142
  page_number_preserved: true
  section_numbers_preserved: true
  rule_numbers_preserved: true
  table_preservation: partial
  formula_preservation: not_applicable
  locator_notes:
    - Sections are visible in extracted Markdown.
    - Tables need manual spot-check before use.
```

Minimum locator rule:

- High/Critical legal-code sources must support page or section locators before grounding.
- If locators are weak, the source may be useful for discovery but not automatic claim verification.

---

## 7. Conflict Block

```yaml
conflicts:
  - conflict_type: local_vs_official_version
    severity: high
    description: Local file year differs from official page year.
    required_resolution: SME review before promotion.
```

Recognized conflict types:

- `local_vs_official_version`
- `pdf_vs_derived_text`
- `statute_vs_irr`
- `prc_program_vs_current_law`
- `article_claim_vs_source`
- `question_answer_vs_source`
- `two_official_sources_conflict`
- `locator_missing`
- `extraction_quality_insufficient`

---

## 8. Review Decision Block

```yaml
review:
  decision: needs_more_evidence
  reviewer_role: SME_ADMIN
  reviewer_id: null
  reviewed_at_utc: null
  approved_allowed_use: DISCOVERY_ONLY
  decision_notes:
    - Official URL candidate not yet matched.
    - Keep in discovery-only queue.
```

Decision values:

| Decision | Meaning |
|---|---|
| `approve_grounding_candidate` | May become `GROUNDING_CANDIDATE`; still review downstream edits |
| `approve_canonical_after_review` | May become `CANONICAL_AFTER_REVIEW` after explicit human approval |
| `needs_more_evidence` | Packet is incomplete |
| `reject_do_not_use` | Do not use the source |
| `defer` | Valid but not prioritized |

---

## 9. Packet Acceptance Gate

A packet is review-ready only when:

1. Bundle identity is clear enough for a human to review.
2. Local file hashes are recorded.
3. Official URL candidates are recorded or search failure is documented.
4. Locator support is assessed.
5. Extraction quality is assessed.
6. Risk tier is assigned.
7. Conflicts are listed, even if empty.
8. Requested allowed use is explicit.

A packet may approve a source only when:

1. A human/SME/admin records a review decision.
2. High/Critical risk requirements are satisfied.
3. `official_match_status` and `verification_status` are compatible with `source-file-manifest-schema.md`.
4. The source is not contradicted by a stronger authority without a conflict note.

---

## 10. Output Locations

Recommended future packet locations:

```txt
.ai/03_plans/content-editorial-pipeline-2026-05-05/source-verification-packets/
  pending/
  approved/
  rejected/
```

For now, do not create packet folders until the reconciliation pass generates actual packet candidates.

---

*End of Phase 0.5B.1 Source Verification Packet Schema.*
