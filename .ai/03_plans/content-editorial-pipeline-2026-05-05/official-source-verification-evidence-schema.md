# Official Source Verification Evidence Schema — Phase 0.5B

**Generated:** 2026-05-05T15:28:29Z
**Scope:** Define the evidence table/log produced by future official-source verification runs.
**Status:** Schema only. No live verification has been executed by this file.

---

## 1. CSV Columns

| Column | Required | Description |
|---|---:|---|
| `verification_evidence_id` | Yes | Stable row ID, e.g. `osv-000001` |
| `run_id` | Yes | Verification run ID |
| `bundle_id` | Yes | Source bundle being checked |
| `proposed_source_id` | Yes | Candidate source ID from bundle map |
| `risk_tier` | Yes | Bundle risk tier copied from source-bundle map |
| `source_family` | Yes | Bundle source family |
| `source_title` | Yes | Local/reconciled source title |
| `primary_document_code` | Required if applicable | RA/PD/BP/IRR/SPP/code identifier |
| `query_used` | Yes | Exact search query or direct URL checked |
| `host_checked` | Yes | Host/domain checked |
| `host_classification` | Yes | `official_issuing_body`, `official_archive`, `authority_adjacent`, `third_party_discovery`, `unknown` |
| `candidate_url` | Yes if found | Candidate URL |
| `retrieval_status` | Yes | `reachable`, `unreachable`, `blocked`, `timeout`, `not_found`, `not_attempted` |
| `content_type` | Yes | `pdf`, `html`, `doc`, `unknown`, etc. |
| `candidate_title` | Required if visible | Title extracted from page/PDF metadata |
| `candidate_issuer` | Required if visible | Issuer/publisher visible on candidate |
| `candidate_version_year` | Required if visible | Year/date visible on candidate |
| `title_match` | Yes | `high`, `medium`, `low`, `mismatch`, `not_checked` |
| `document_code_match` | Yes | `high`, `medium`, `low`, `mismatch`, `not_applicable`, `not_checked` |
| `version_match` | Yes | `high`, `medium`, `low`, `mismatch`, `unknown`, `not_checked` |
| `page_count_match` | Yes | `match`, `mismatch`, `not_checked`, `not_applicable` |
| `hash_match_status` | Yes | `match`, `mismatch`, `not_checked`, `not_available` |
| `text_fingerprint_status` | Yes | `match`, `partial_match`, `mismatch`, `not_checked`, `not_available` |
| `local_file_compared` | Required if compared | Local path or source_file_id compared |
| `official_file_sha256` | Required if downloaded | SHA-256 of retrieved public official file |
| `local_file_sha256` | Required if compared | SHA-256 from local manifest |
| `official_match_status` | Yes | `unverified`, `official_candidate_found`, `no_official_url_found`, `mismatch`, `presumed_match`, `verified_match` |
| `conflict_type` | Required if conflict | See conflict policy |
| `conflict_severity` | Required if conflict | `low`, `medium`, `high`, `critical` |
| `evidence_notes` | Yes | Human-readable evidence notes |
| `review_required` | Yes | `ADMIN`, `SME_ADMIN`, `LEGAL_SME`, `COPYRIGHT_REVIEW` |
| `allowed_use_after_run` | Yes | Must remain `DISCOVERY_ONLY` unless a separate human decision updates it |
| `created_at_utc` | Yes | Timestamp |

---

## 2. JSON Shape

```json
{
  "run_id": "osv-run-2026-05-05-001",
  "generated_at_utc": "2026-05-05T00:00:00Z",
  "scope": "official-source verification evidence only",
  "mutation_performed": false,
  "source_approval_performed": false,
  "evidence_rows": []
}
```

---

## 3. Status Rules

1. `official_candidate_found` is not verification.
2. `presumed_match` is not approval.
3. `verified_match` is evidence for review, not automatic promotion.
4. `allowed_use_after_run` remains `DISCOVERY_ONLY` until a packet review decision exists.
5. High/Critical legal-code evidence must include locator support or a conflict note.

---

## 4. Conflict Fields

Use these conflict types:

- `local_vs_official_version`
- `pdf_vs_derived_text`
- `statute_vs_irr`
- `prc_program_vs_current_law`
- `two_official_sources_conflict`
- `locator_missing`
- `extraction_quality_insufficient`
- `copyright_or_provider_boundary`
- `no_official_source_found`

---

## 5. Acceptance Gate

```txt
EVIDENCE_SCHEMA_DEFINED = true
LIVE_VERIFICATION_EXECUTED = false
SOURCE_APPROVAL = false
MUTATION = false
```
