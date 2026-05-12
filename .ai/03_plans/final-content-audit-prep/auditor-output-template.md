# Auditor Output Template

**Version:** 1.0
**Purpose:** Standard structure for every specialist lane audit output in the second-audit swarm.
**Constraint:** Auditors are read-only. This file is the only artifact the auditor may create or append in the swarm scope.

---

## Header

| Field | Value |
|---|---|
| **Lane** | `legal_code | questions | roundtrip | scenarios | citation_evidence` |
| **Partition ID** | `string` |
| **Auditor Model** | `claude | opencode | kimi | codex` |
| **Session ID** | `string` |
| **Audit Date** | `YYYY-MM-DD` |
| **Articles Assigned** | `integer` |
| **Articles Audited** | `integer` (must equal assigned) |
| **Overall Partition Verdict** | `PASS | FAIL | MIXED` |

---

## Audit Methodology

Briefly state:
- Which checks were performed (refer to `audit-swarm-partition-plan.md` §3 for your lane).
- Sampling strategy if applicable (e.g., "deep-inspected articles 1 and 5; count-verified all 5").
- Tools or commands used (e.g., `git diff --check`, `sha256sum`, `bun run content-audit:validate`).
- Any deviations from the standard lane scope and why.

---

## Per-Article Results

Repeat this block for every article in the partition.

### Article: `{slug}` (`{article_uuid}`)

| Field | Value |
|---|---|
| Batch | `NNN` |
| Topic Family | `string` |
| Source Risk Tier | `string` |
| Linked Questions | `integer` |
| Scenario Enrichment | `eligible-added | eligible-deferred | not-applicable` |

#### Verdict: `PASS | FAIL | BLOCKER | N/A`

**Reasoning:**
- If PASS: Summarize the key evidence that supports the pass (e.g., "12 claims verified against BP 344 raw PDF pages 11–18; all section numbers match").
- If FAIL: Describe the defect precisely. Quote the exact text, file path, and expected vs actual.
- If BLOCKER: State which blocker criterion from the plan is met. Quote the evidence.
- If N/A: Explain why this lane does not apply (e.g., "Article has zero linked questions").

**Evidence:**
```
File: {relative path}
Locator: {page, line, or section}
Expected: {what the source or standard requires}
Actual:   {what the article currently says}
```

**Cross-references:**
- `source-audit-evidence.json` path: `{path}`
- `normalized.md` hash: `{sha256}`
- `candidate.md` hash: `{sha256}`
- Question-edit count: `{integer}` (if applicable)

---

## Summary Statistics

| Metric | Count |
|---|---|
| Articles with PASS | `integer` |
| Articles with FAIL | `integer` |
| Articles with BLOCKER | `integer` |
| Articles with N/A | `integer` |
| Total findings | `integer` |
| Findings requiring remediation | `integer` |

### Findings Breakdown by Type

| Finding Type | Count | Severity (FAIL vs BLOCKER) |
|---|---|---|
| `section_number_mismatch` | `integer` | `FAIL | BLOCKER` |
| `dimension_contradiction` | `integer` | `FAIL | BLOCKER` |
| `question_count_mismatch` | `integer` | `FAIL | BLOCKER` |
| `placeholder_in_content` | `integer` | `FAIL | BLOCKER` |
| `hash_mismatch` | `integer` | `FAIL | BLOCKER` |
| `raw_pdf_missing` | `integer` | `BLOCKER` |
| `fictional_source` | `integer` | `BLOCKER` |
| `json_parse_error` | `integer` | `FAIL | BLOCKER` |
| `other` | `integer` | `FAIL | BLOCKER` |

---

## Sampling Limits & Confidence

State explicitly:
- Which articles were deep-inspected vs count-verified.
- Which evidence was independently recomputed vs trusted from the batch ledger.
- Any assumptions made (e.g., "assumed refined markdown line locators are accurate because raw PDF hash matched").
- Confidence level: `HIGH | MEDIUM | LOW` and why.

**Example:**
> Deep-inspected: Articles 1 and 5 (highest source-risk tier). Count-verified: all 5. Hash-verified: all claimed raw PDF families confirmed on disk. Scan-verified: placeholder/marker scans on articles 1 and 5; full-batch scan reported by scoped checks. Diff-verified: `git diff --check` independently run and confirmed clean. **Confidence: HIGH.**

---

## Recommended Coordinator Action

- If all PASS: **"Accept partition. Zero blockers. Ready for serial acceptance."**
- If mixed: **"Remediate N articles before acceptance. See per-article BLOCKER/FAIL details above."**
- If systemic pattern: **"Consider splitting next partition or elevating to human SME because X% of articles share the same defect type."**

---

## Non-Blocking Advisories

List any warnings or observations that do not block acceptance but may be useful for future improvement:

- `{observation}` — not blocking because `{reason}`.

---

## Evidence Checklist

Before submitting this output, verify you have included:

- [ ] Header with lane, partition, auditor model, session, date, counts.
- [ ] Methodology section.
- [ ] Per-article results for every assigned article.
- [ ] Exact file paths for every claim, pass or fail.
- [ ] Expected vs actual quotes for every FAIL and BLOCKER.
- [ ] Summary statistics table.
- [ ] Sampling limits and confidence statement.
- [ ] Recommended coordinator action.
- [ ] Non-blocking advisories (if any).

---

## Appendix: Lane-Specific Prompt (Copy into Session)

### Legal / Code Lane Prompt

```
You are the Legal/Code auditor for the SlateCamp second-audit swarm.
You are READ-ONLY. Do not edit any article content, question edits, or batch files.
Your partition is: {partition_id} with {N} articles.

For each article:
1. Open the article's source-audit-evidence.json.
2. Verify that every legal/code claim has a raw_pdf_path and raw_pdf_sha256.
3. Verify that section numbers and dimensions match the claimed raw PDF.
4. Flag any cross-code conflicts that are unresolved.
5. Report PASS, FAIL, or BLOCKER using the Auditor Output Template.

BLOCKER criteria:
- Cited section number does not exist in raw PDF.
- Dimension/ratio claim contradicts raw PDF.
- Unresolved cross-code conflict.

Use the exact structure in the template. Quote evidence for every FAIL/BLOCKER.
```

### Questions Lane Prompt

```
You are the Questions auditor for the SlateCamp second-audit swarm.
You are READ-ONLY. Do not edit any question-edit JSON files.
Your partition is: {partition_id} with {N} articles.

For each article:
1. Count linked-questions.json entries.
2. Count question-edit JSON files in question-edits/.
3. Verify the counts match.
4. Sample at least 2 question-edits per article. Verify they have action="replace", support_status="source_safe_rewrite", and a valid baseline_hash.
5. Check for placeholder text (TODO, FIXME, ______) in stems and rationales.
6. Report PASS, FAIL, or BLOCKER using the Auditor Output Template.

BLOCKER criteria:
- Question-edit changes correct answer without updating rationale.
- Placeholder text in question stem or rationale.
- Question references a source not in the article's sources.json.
```

### Roundtrip Lane Prompt

```
You are the Roundtrip auditor for the SlateCamp second-audit swarm.
You are READ-ONLY. Do not edit any article files.
Your partition is: {partition_id} with {N} articles.

For each article:
1. Verify normalized.md SHA256 == candidate.md SHA256.
2. Verify all JSON files in the article folder parse cleanly.
3. Note whether content-audit:validate would pass (check existing compose-report.json and diff-report.json).
4. Report PASS, FAIL, or BLOCKER using the Auditor Output Template.

BLOCKER criteria:
- normalized.md and candidate.md hashes differ.
- Any required JSON file fails to parse.
- Existing compose/diff/validate report shows a blocker.
```

### Scenarios Lane Prompt

```
You are the Scenarios auditor for the SlateCamp second-audit swarm.
You are READ-ONLY. Do not edit any article files.
Your partition is: {partition_id} with {N} articles.

For each article with scenario enrichment:
1. Read the scenario section in normalized.md / candidate.md.
2. Verify scenario claims trace to the article's raw PDF sources.
3. Flag fictional sources, unsupported maps, or numerical claims without locators.
4. For eligible-deferred articles, verify the deferral reason is valid and no placeholder scenario text exists.
5. Report PASS, FAIL, or BLOCKER using the Auditor Output Template.

BLOCKER criteria:
- Scenario introduces a fictional law, policy, or map.
- Scenario contains a numerical claim with no source locator.
```

### Citation / Evidence Lane Prompt

```
You are the Citation/Evidence auditor for the SlateCamp second-audit swarm.
You are READ-ONLY. Do not edit any article files or raw PDFs.
Your partition is: {partition_id} with {N} articles.

For each article:
1. Open source-audit-evidence.json.
2. Verify every checked_source has a raw_pdf_path pointing to vitruvius-connection/001_Raw-Source-Layer/.
3. Verify the raw PDF file exists on disk.
4. Re-check SHA256 for at least 10% of sources (more if BLOCKER suspected).
5. Verify refined_markdown_path exists and line locators are plausible.
6. Verify no internet URL is marked as verified primary evidence.
7. Report PASS, FAIL, or BLOCKER using the Auditor Output Template.

BLOCKER criteria:
- Raw PDF file does not exist at claimed path.
- SHA256 hash does not match file on disk.
- Source marked is_verified:true but has no locator.
```

---

*End of template.*
