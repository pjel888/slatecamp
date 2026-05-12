# Final Content Audit Protocol — Post-Local-First, Pre-Supabase

**Version:** 1.0.0
**Date:** 2026-05-12
**Scope:** Read-only audit swarm protocol for final-gate criteria validation before Supabase publish.
**Protocol type:** Fail-closed. Missing evidence = blocked. Ambiguous evidence = NEEDS_REMEDIATION.

---

## 1. Operating Principles

### 1.1 Fail-Closed Default

Every gate is fail-closed. If a criterion cannot be verified from the evidence on disk, the article is NOT `PASS_LOCAL_FIRST`. No "assumed OK," no "probably fine," no "looks good to me" without evidence.

### 1.2 Read-Only Audit Swarm

This protocol is designed for independent, parallel reviewers. Any reviewer with read access to the workspace can apply these criteria mechanically. Content-domain expertise is not required for gate execution — only for evaluating substantive claim quality (the reviewer's qualitative assessment is captured in `reviewer_notes` but does not override mechanical gate results).

### 1.3 Remediation Queue, Not Skipping

Articles that fail any gate enter the remediation queue. The protocol defines exact remediation paths per status code. No article is permanently skipped — blocker resolution is always the first remediation step.

### 1.4 Single Article as Minimum Audit Unit

Each article receives its own `article-audit-passport.json`. Batches aggregate passports. No batch-level "mostly done" pass — every article in the batch must carry `PASS_LOCAL_FIRST` for batch acceptance.

---

## 2. Audit Status Codes

### 2.1 Terminal Accept Status

| Status | Meaning |
|--------|---------|
| `PASS_LOCAL_FIRST` | All gates pass. Article is source-safe, internally consistent, and ready for final publishing review. |

### 2.2 Remediation Statuses

| Status | Meaning | Remediation |
|--------|---------|-------------|
| `NEEDS_REMEDIATION` | One or more mechanical gates failed with fixable defects (placeholders found, counts mismatched, stale error files, JSON parse errors). | Return to worker with exact gate failures and remediation instructions. |
| `BLOCKED_SOURCE_GAP` | One or more factual claims lack local raw-source support. This is not fixable by editing — requires source acquisition. | Record exact source families needed; park article until source acquired. |
| `BLOCKED_ROUNDTRIP` | `normalized.md != candidate.md` and the diff is not accounted for by intentional edits. | Re-run compose; if persistent, mark for manual diff review. |
| `BLOCKED_QUESTION_MISMATCH` | Linked question count does not equal created question-edit count. | Audit question list; resolve missing/extra question-edits. |
| `BLOCKED_VALIDATION` | Compose, diff, or validate gate failed with documented errors. | Fix root cause and re-run full validation gate list. |

### 2.3 Progression Rule

A batch may be accepted only when **every article** in the batch carries `PASS_LOCAL_FIRST` and the batch's independent QA review confirms with `blockers=0`.

---

## 3. Per-Article Audit Gates

Each gate produces a `pass | fail | blocked` verdict with evidence. Failing any gate blocks `PASS_LOCAL_FIRST`.

### Gate 1: Article Folder Integrity

**Check:** Required files exist with non-zero size.

| Required File | Purpose |
|---------------|---------|
| `original.md` | Original exported article (source-of-truth baseline) |
| `normalized.md` | Worker-improved article after source audit |
| `candidate.md` | Must be byte-identical to `normalized.md` |
| `sources.json` | Source citations with raw-pdf paths and sha256 hashes |
| `source-audit-evidence.json` | Per-claim source traceability ledger |
| `linked-questions.json` | Linked question IDs and metadata |
| `ui-blocks.json` | UI block inventory (may be empty array) |
| `question-edits/` | Directory; files must match linked-question count |

**Fail condition:** Any required file missing, empty, or zero bytes.
**Result on fail:** `NEEDS_REMEDIATION` — specify missing file(s).

### Gate 2: Raw-PDF-First Source Audit

**Check:** Every source entry in `sources.json` must:
- Have `url: null` (no internet dependency)
- Have `raw_pdf_path` pointing to a file under `vitruvius-connection/001_Raw-Source-Layer/`
- Have `raw_pdf_sha256` hash recorded
- Have `refined_markdown_path` with specific line/page locators
- Have `is_verified: true`
- The referenced raw PDF must **exist on disk** at the stated path

**Fail condition:** Any source references a URL instead of a local raw PDF, or any claimed raw PDF path does not exist on disk.
**Result on fail:** `BLOCKED_SOURCE_GAP` — record missing PDF paths.

### Gate 3: Source Hash Verification

**Check:** Every `raw_pdf_sha256` in `sources.json` and `source-audit-evidence.json` matches the actual sha256 hash of the file on disk.

**Verification command:** `shasum -a 256 <path>`

**Fail condition:** Any hash mismatch (stale reference, file modified after audit, wrong file).
**Result on fail:** `NEEDS_REMEDIATION` — record mismatched (file, expected_hash, actual_hash).

### Gate 4: Claim-to-Source Traceability

**Check:** Every factual/legal/code/numeric claim in `source-audit-evidence.json`:
- Has at least one `checked_source` entry
- Each `checked_source` has a `raw_pdf_path`, `sha256`, and `line_locators`
- No claim depends solely on SlateCamp-internal docs (THEORY_ATTRIBUTION_GUIDE.md, VERIFIED_REFERENCE.md, etc.) unless those docs themselves link to raw PDFs

**Fail condition:** Any claim has zero checked sources, or all checked sources point to SlateCamp-internal docs without raw-pdf backing.
**Result on fail:** `BLOCKED_SOURCE_GAP` — record unsupported claim text and recommended source family.

### Gate 5: Placeholder / Internal Note / Source Gap Scan

**Check:** Scan `normalized.md`, `candidate.md`, `sources.json`, `source-audit-evidence.json`, and all files in `question-edits/` for:

| Pattern | Rationale |
|---------|-----------|
| `SLATECAMP_UI_BLOCK` | Placeholder that should have been replaced with real content |
| `TODO`, `FIXME`, `HACK`, `XXX` | Internal development notes that must not ship |
| `source-gap`, `unsupported-source`, `INTERNAL-NOTE` | Flagged but unresolved gaps |
| `AI-generated`, `[NEEDS CITATION]`, `[VERIFY]`, `[CHECK]` | Unverified content markers |
| Lines matching `^\s*$` repeated > 3 times | Potential content gaps |

**Note:** `SLATECAMP_UI_BLOCK` in `original.md` is expected and NOT a failure. It is only a failure if found in `normalized.md`, `candidate.md`, or question-edits.

**Fail condition:** Any prohibited pattern found in improved article files.
**Result on fail:** `NEEDS_REMEDIATION` — record file, line, and matched pattern.

### Gate 6: Linked Question / Question Edit Count Match

**Check:**
- Count question IDs in `linked-questions.json`
- Count `.json` files in `question-edits/` directory
- Both counts must be equal and > 0

**Fail condition:** Counts differ, or either count is 0.
**Result on fail:** `BLOCKED_QUESTION_MISMATCH` — record linked_count vs edit_count.

### Gate 7: Question Edit Integrity

**Check:** Every `.json` file in `question-edits/` must:
- Parse as valid JSON
- Include `baseline_hash` (non-empty string)
- Include `action` field (typically `"replace"`)
- Include `answer_key_fields_changed: true`
- Include `support_status` (must be `"source_safe_rewrite"`)
- Include `checked_sources` array with at least one entry per changed field
- Each checked source has `raw_pdf_path`, `sha256`, and `locators`
- No `SLATECAMP_UI_BLOCK` or placeholder markers

**Fail condition:** Any JSON parse error, missing required field, empty checked sources.
**Result on fail:** `NEEDS_REMEDIATION` — record file, error type, and missing field.

### Gate 8: Rationale Source Safety

**Check:** Every question-edit's `rationale` field and every claim's `support_text` in source-audit-evidence must reference the same local raw-source families as their parent article. No fabrications, no unsupported generalizations, no appeal to "common knowledge."

**Fail condition:** Rationale cites sources not in the article's `sources.json`, or cites no source at all.
**Result on fail:** `BLOCKED_SOURCE_GAP` — record affected question-edit IDs and unsupported rationale text.

### Gate 9: Scenario Status / Source Safety

**Check:**
- Scenario enrichment status is explicitly recorded: `eligible-added`, `eligible-deferred`, or `not-applicable`
- If `eligible-added`: scenario claims must trace to the same local-source families as the article
- If `not-applicable`: a reason must be recorded

**Fail condition:** Status missing, or `eligible-added` with unsupported claims.
**Result on fail:** `NEEDS_REMEDIATION` — record missing status or unsupported scenario claim.

### Gate 10: Roundtrip Integrity (Compose / Diff / Validate)

**Check:**
- **Compose gate:** `candidate.md` exists and is byte-identical to `normalized.md` (confirmed by `diff`)
- **Diff gate:** Any diff between normalized and candidate is intentional and documented; no unexpected content loss
- **Validate gate:** Content passes structural validation (valid markdown, proper section hierarchy, no broken links)

**Fail condition:** `candidate.md` differs from `normalized.md` without documented reason, or validate gate reports errors.
**Result on fail:** `BLOCKED_ROUNDTRIP` — record diff details.

### Gate 11: JSON Parse Scan

**Check:** Every `.json` file in the article folder parses successfully.

**Verification command:** For each `.json`: parse with any JSON parser, confirm no parse error.

**Fail condition:** Any JSON parse failure.
**Result on fail:** `NEEDS_REMEDIATION` — record file and parse error.

### Gate 12: Stale Compose-Error Scan

**Check:** No `compose-error.json` file exists in the article folder.

**Fail condition:** `compose-error.json` file present (indicates a failed compose run that was not cleaned up).
**Result on fail:** `NEEDS_REMEDIATION` — remove stale error file and re-run compose.

### Gate 13: Independent QA Review

**Check:** An independent reviewer (not the batch worker) must:
- Deep-inspect at least 2 articles (or 40% of batch, whichever is greater)
- Count-verify all articles in the batch for file presence and question-edit counts
- Scan-verify all articles for placeholder/internal-note patterns
- Hash-verify all claimed raw PDF families on disk
- Run `git diff --check` against the article content-audit-export paths
- Confirm source-narrowing was applied where manifest declared blocker-resolution-needed
- Produce a QA review document with pass/fail verdict and evidence

**Fail condition:** Independent QA not completed, or QA found gate failures.
**Result on fail:** `BLOCKED_VALIDATION` — record QA findings.

### Gate 14: Coordinator Acceptance

**Check:** The serial coordinator (see coordination protocol) reviews:
- All 13 prior gates pass
- Independent QA confirms `blockers=0`
- Batch exclusion check confirms no duplicate articles across batches
- Scoped `git diff --check` passes
- All blocker-resolution notes from manifest have been addressed

**Fail condition:** Any prior gate blocked, QA found issues, duplicate articles detected, or unresolved blockers remain.
**Result on fail:** Returns batch to worker with coordinator notes.

---

## 4. Batch-Level Validation

### 4.1 Batch Aggregation

A batch aggregates N article audit passports. The batch status is:

| Batch Status | Condition |
|--------------|-----------|
| `PASS` | All N articles carry `PASS_LOCAL_FIRST` |
| `BLOCKED` | Any article carries a `BLOCKED_*` status |
| `NEEDS_REMEDIATION` | Any article carries `NEEDS_REMEDIATION` and none are `BLOCKED_*` |

### 4.2 Batch Acceptance Checklist

- [ ] All article passports present and valid
- [ ] All article statuses = `PASS_LOCAL_FIRST`
- [ ] Batch report generated (summary of all passports)
- [ ] Batch ledger generated (machine-readable summary JSON)
- [ ] Scoped checks artifact generated (aggregated gate results)
- [ ] Independent QA review completed and passing
- [ ] `git diff --check` passes for batch paths
- [ ] Batch exclusion check confirms no overlap with prior accepted batches
- [ ] Coordinator acceptance recorded

---

## 5. Audit Artifacts Per Article

Every article folder receives:

| Artifact | Path (relative to article folder) | Description |
|----------|----------------------------------|-------------|
| Audit Passport | `article-audit-passport.json` | Machine-verifiable gate results |
| Source Hash Manifest | `source-hash-manifest.json` | All sha256 hashes with on-disk verification timestamps |
| Gate Evidence Log | `gate-evidence-log.json` | Per-gate evidence with pass/fail/blocked and diagnostic output |

---

## 6. Remediation Queue Workflow

```
Article enters audit swarm
         │
         ▼
  Apply G1-G12 (mechanical)
         │
    ┌────┴────┐
    │         │
  Pass      Fail
    │         │
    │    ┌────┴────┐
    │    │         │
    │  Fixable   Blocked
    │  (NEEDS_   (BLOCKED_*)
    │  REMEDI-   │
    │  ATION)    │
    │    │       │
    │    ▼       ▼
    │  Return   Record source
    │  to       families needed;
    │  worker   park until
    │  for fix  source acquired
    │           │
    │           ▼
    │       Source acquired?
    │           │
    │      ┌────┴────┐
    │      │         │
    │     Yes       No
    │      │         │
    │      ▼         ▼
    │  Re-audit   Remains
    │             BLOCKED
    │
    ▼
  G13: Independent QA
         │
    ┌────┴────┐
    │         │
  Pass      Fail
    │         │
    │         ▼
    │    Return to worker
    │    with QA findings
    │
    ▼
  G14: Coordinator Acceptance
         │
    ┌────┴────┐
    │         │
  Accept    Reject
    │         │
    ▼         ▼
  PASS_    Return with
  LOCAL_   coordinator
  FIRST    notes
```

---

## 7. Evidence Requirements Summary

| Evidence Category | Required | Verification Method |
|-------------------|----------|---------------------|
| Local raw PDF exists on disk | Yes | `test -f <path>` |
| Raw PDF sha256 matches recorded hash | Yes | `shasum -a 256 <path>` |
| Source JSON has `url: null` | Yes | JSON field check |
| All claims have checked sources | Yes | Count check + field presence |
| No placeholders in improved files | Yes | Regex scan |
| No internal notes in improved files | Yes | Regex scan |
| Question count matches edit count | Yes | Directory listing count |
| Question-edits parse as valid JSON | Yes | JSON parser |
| Question-edits have source_safe_rewrite support | Yes | Field presence check |
| normalized.md == candidate.md | Yes | `diff` or byte comparison |
| No compose-error.json present | Yes | File existence check |
| Scenario status recorded | Yes | Field presence check |
| Independent QA completed | Yes | QA document present |
| Coordinator acceptance recorded | Yes | Acceptance field in passport |

---

## 8. Tooling Requirements

The audit swarm requires only:
- Filesystem read access to the workspace
- A JSON parser (jq, Python json, Node, or equivalent)
- A sha256 hasher (`shasum -a 256` or equivalent)
- A diff tool (`diff` or equivalent)
- A regex/text scanner (grep or equivalent)

No database access. No Supabase connection. No internet. No write access.

---

## 9. Schema References

- **Criteria schema:** `final-content-audit-criteria.json` — machine-readable definitions of every gate, field, type, and fail condition
- **Passport schema:** `article-audit-passport.schema.json` — JSON Schema for per-article audit result files
