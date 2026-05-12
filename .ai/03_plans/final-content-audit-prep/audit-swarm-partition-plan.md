# Second-Audit Swarm Execution Plan

**Version:** 1.0
**Created:** 2026-05-12
**Scope:** Post local-first batch completion, pre-Supabase publishing
**Workspace:** `/Users/philiplewis/slatecamp`
**Output directory:** `.ai/03_plans/final-content-audit-prep/`
**Constraint:** Read-only auditors. No Supabase push, deploy, commit, or source mutation except report files under this plan directory.

---

## 1. Purpose

This plan governs the **disciplined second-audit swarm** that runs after all source-audited local-first batches (001–N) complete and before any content is published to Supabase.

The first audit (local-first batch worker) verifies source evidence, composes candidates, and produces batch reports/ledgers. The **second audit** is an independent swarm that partitions the entire approved corpus across specialist reviewers, each with a narrow, non-overlapping mandate. The coordinator aggregates findings, serially accepts or rejects articles, and produces a final clean manifest for Supabase publishing.

**Golden rule:** No article reaches Supabase until it has passed the coordinator’s serial acceptance gate. Any failure spawns a remediation manifest; the article must pass a targeted re-audit before advancing.

---

## 2. Fixed Partition Strategy

Auditors **do not** choose their own articles. The coordinator assigns fixed partitions derived from the complete set of `PASS_LOCAL_FIRST_READY_FOR_FINAL_PUBLISHING_REVIEW` articles recorded across all batch ledgers.

### 2.1 Partition Dimensions

| Dimension | Basis | Purpose |
|---|---|---|
| **Batch slice** | Sequential batch ranges (e.g., 001–020, 021–040) | Ensures every batch gets independent coverage |
| **Topic family** | `topic_family` from `source-audit-evidence.json` | Routes domain expertise to the right specialist lane |
| **Source-risk tier** | `source_risk_tier` field | High-risk tiers (primary_code_dimensions, statute_map) get deeper inspection |
| **Question density** | Linked-question count per article | Articles with >10 linked questions get question-lane priority |

### 2.2 Partition Assignment Rules

1. The coordinator reads every batch ledger JSON under `.ai/content-audit-export/` and builds the **master accepted corpus list**:
   - Article UUID
   - Slug
   - Batch number
   - Topic family
   - Source risk tier
   - Linked question count
   - File paths (normalized.md, candidate.md, source-audit-evidence.json, question-edits/)

2. The coordinator assigns each article to **exactly one primary specialist lane** based on `topic_family` and `source_risk_tier`:
   - `accessibility_code_signage`, `building_code_life_safety`, `fire_code_egress` → **Legal/Code Lane**
   - `planning_statute`, `housing_governance`, `urban_design_policy` → **Legal/Code Lane**
   - Any article with `contains_legal_or_code_claims: true` and `source_risk_tier: primary_code_dimensions` → **Legal/Code Lane**
   - Articles with linked-question count ≥ 10 → **Questions Lane** (may be co-assigned)
   - Articles with scenario enrichment (`eligible-added` or `eligible-deferred`) → **Scenarios Lane** (may be co-assigned)
   - Articles with cross-source synthesis or derivative-text risk → **Citation/Evidence Lane**
   - All articles get **Roundtrip Lane** coverage (dry-run push validation)

3. **Co-assignment is allowed** for Question and Scenario lanes, but each article has exactly one **primary lane** responsible for its final sign-off.

4. The coordinator writes the **partition manifest** to:
   `.ai/03_plans/final-content-audit-prep/swarm-partition-manifest-{timestamp}.json`

### 2.3 Partition Manifest Schema (coordinator output)

```json
{
  "plan_version": "1.0",
  "generated_at": "ISO-8601",
  "total_articles": 396,
  "partitions": [
    {
      "partition_id": "legal-code-001",
      "lane": "legal_code",
      "auditor_model": "claude",
      "article_count": 80,
      "article_uuids": ["uuid-1", "uuid-2"],
      "basis": "topic_family in [accessibility_code_signage, building_code_life_safety, fire_code_egress, planning_statute] OR source_risk_tier == primary_code_dimensions"
    }
  ]
}
```

---

## 3. Specialist Lanes

Each lane has a narrow scope, explicit evidence requirements, and a single output file per partition.

### 3.1 Lane A — Legal / Code Compliance

**Scope:** All articles containing legal, code, or regulatory claims. Verifies section numbers, dimensions, and statutory references against local raw PDFs.

**MUST verify:**
- Every section number cited in `normalized.md` / `candidate.md` exists in the claimed raw PDF
- Every numeric claim (dimension, ratio, percentage, fee) has a raw-PDF locator
- No derivative text (refined markdown, web snippet, LLM-generated summary) is used as primary evidence
- `source-audit-evidence.json` `raw_pdf_gate.status` == `PASS`
- Cross-code conflicts (e.g., BP 344 vs PD 1096) are explicitly resolved in the article or flagged

**Output:** `legal-code-audit-{partition_id}.md` using `auditor-output-template.md`

### 3.2 Lane B — Questions Integrity

**Scope:** All articles with linked questions. Verifies that question-edits are source-safe, count-matched, and pedagogically sound.

**MUST verify:**
- Linked-question count in `linked-questions.json` == question-edit file count in `question-edits/`
- Every question-edit JSON has `action: "replace"`, `support_status: "source_safe_rewrite"`, and valid `baseline_hash`
- Question distractors are plausible and not obviously wrong
- Answer keys trace to the same raw PDF evidence as the parent article
- No placeholder text, `TODO`, or `FIXME` in question-edit JSON `rationale` or `stem` fields

**Output:** `questions-audit-{partition_id}.md`

### 3.3 Lane C — Roundtrip / Dry-Run Validation

**Scope:** Simulates the Supabase publish path for every article. Verifies that the content bundle is structurally valid and push-ready.

**MUST verify:**
- `content-audit:compose` would produce a candidate matching `normalized.md` (hash check)
- `content-audit:validate` passes with no blockers
- `content-audit:push --dry-run` succeeds (or correctly identifies why it would fail)
- All required JSON files parse cleanly (`article-metadata.json`, `sources.json`, `ui-blocks.json`, etc.)
- `normalized.md == candidate.md` (sha256 match)

**Output:** `roundtrip-audit-{partition_id}.md`

### 3.4 Lane D — Scenarios Enrichment

**Scope:** Articles marked `eligible-added` or `eligible-deferred` for scenario enrichment. Verifies that scenario claims are grounded in the same local source families as the parent article.

**MUST verify:**
- Scenario text does not introduce unsupported claims
- Scenario numbers, locations, or policy references trace to raw PDFs
- `eligible-deferred` articles have a clear deferral reason and no placeholder scenario text
- No fictional source names or unverified maps/charts

**Output:** `scenarios-audit-{partition_id}.md`

### 3.5 Lane E — Citation / Evidence Chain

**Scope:** Cross-cutting audit of source integrity. Verifies that the evidence chain from claim → refined markdown → raw PDF is intact and auditable.

**MUST verify:**
- Every `source-audit-evidence.json` claim has a `raw_pdf_path` and `raw_pdf_sha256`
- The raw PDF file exists on disk at the claimed path
- SHA256 hashes match (re-check at least 10% sample per partition)
- `refined_markdown_path` exists and line locators are plausible
- No `url`-dependent sources (internet URLs) are marked as verified primary evidence
- `is_verified: true` is only set when the auditor has confirmed the locator

**Output:** `citation-evidence-audit-{partition_id}.md`

---

## 4. Auditor Prompts and Guardrails

### 4.1 Prompt Distribution by Model

| Model | Role | Token Budget | Prompt Strategy |
|---|---|---|---|
| **Claude** | Legal/Code Lane lead; Citation/Evidence Lane lead | High (use sparingly) | Deep reasoning on statutory interpretation, cross-code conflict resolution, evidence-chain verification. Reserve for primary_code_dimensions and statute_map tiers. |
| **OpenCode Go** | Roundtrip Lane lead; Questions Lane sampling | Medium | Structural validation, JSON parsing, hash verification, compose/diff/validate command execution. Good for deterministic checks. |
| **Kimi** | Questions Lane lead; Scenarios Lane lead | Medium | Pedagogical review of distractors, scenario realism, source-to-question traceability. Good for pattern recognition across many question files. |
| **Codex** | Citation/Evidence Lane sampling; Remediation worker | Medium | File-system verification, hash recomputation, batch script execution, remediation patch generation. Good for tool-heavy tasks. |

### 4.2 Claude Guardrails (Limited-Token Protocol)

Claude is the most expensive reviewer. Apply these guardrails strictly:

1. **Claude only sees articles with `source_risk_tier: primary_code_dimensions` or `contains_legal_or_code_claims: true`.** Do not waste Claude tokens on plain-concept articles.
2. **Claude works on partitions, not the full corpus.** Maximum 20 articles per Claude session.
3. **Claude does not run shell commands or file-system checks.** Those go to Codex/OpenCode.
4. **Claude output must use the `auditor-output-template.md` structure.** No free-form prose.
5. **If Claude finds a blocker, Codex must independently verify the file path and raw PDF existence before the blocker is recorded.** Claude’s reasoning is authoritative; Codex’s filesystem check is the evidence.

### 4.3 OpenCode Go Guardrails

1. **OpenCode runs all deterministic checks:** `git diff --check`, JSON parse, hash compare, file count.
2. **OpenCode does not interpret legal/code claims.** It reports the presence/absence of locators, not their correctness.
3. **OpenCode produces machine-readable output blocks** (JSON tables) for coordinator aggregation.

### 4.4 Kimi Guardrails

1. **Kimi reviews question-edits for pedagogical quality:** distractor plausibility, rationale clarity, source alignment.
2. **Kimi reviews scenarios for realism and grounding.**
3. **Kimi does not verify raw PDF existence.** It assumes the Citation Lane has already confirmed that.
4. **Kimi flags suspected hallucinations** in question stems or scenario narratives.

### 4.5 Codex Guardrails

1. **Codex is the remediation worker.** When any lane finds a blocker, Codex receives a remediation manifest and executes the fix.
2. **Codex does not re-audit its own fixes.** A different lane (or the same lane in a new session) must re-audit.
3. **Codex produces diff-ready patches** and updates the remediation manifest with `remediation_applied` evidence.

---

## 5. Coordinator Aggregation and Serial Acceptance

### 5.1 Coordinator Responsibilities

The coordinator (human or designated orchestrator agent) is the only role with write access to:
- `.ai/03_plans/final-content-audit-prep/acceptance-log.md`
- `.ai/03_plans/final-content-audit-prep/swarm-final-manifest.json`
- `.ai/03_plans/final-content-audit-prep/remediation-queue.json`

The coordinator **never** edits article content, question edits, or source evidence directly.

### 5.2 Aggregation Protocol

1. **Collect all lane outputs** for a partition.
2. **Build the per-article triage matrix:**

```
| Article UUID | Legal | Questions | Roundtrip | Scenarios | Citation | Overall |
|--------------|-------|-----------|-----------|-----------|----------|---------|
| uuid-1       | PASS  | PASS      | PASS      | N/A       | PASS     | PASS    |
| uuid-2       | PASS  | FAIL      | PASS      | PASS      | PASS     | FAIL    |
```

3. **Overall verdict rules:**
   - If **any lane reports FAIL** → Overall = FAIL → Enter remediation queue
   - If **any lane reports BLOCKER** → Overall = BLOCKER → Enter remediation queue with priority
   - If **all lanes report PASS or N/A** → Overall = PASS → Eligible for serial acceptance

4. **N/A handling:** An article without linked questions gets Questions = N/A. An article without scenarios gets Scenarios = N/A. N/A does not block acceptance.

### 5.3 Serial Acceptance Protocol

1. The coordinator processes articles in **batch-order sequence** (001 → 002 → ... → N).
2. For each article with Overall = PASS:
   - Record acceptance in `acceptance-log.md` with timestamp and lane output references.
   - Append article UUID to `swarm-final-manifest.json` under `accepted_articles`.
3. For each article with Overall = FAIL or BLOCKER:
   - Record rejection in `acceptance-log.md` with exact failure reason and lane reference.
   - Append article UUID to `remediation-queue.json`.
   - Generate a **remediation manifest** from `remediation-manifest-template.json`.
4. **No article is accepted until all prior-batch articles have been resolved** (accepted or remediated). This preserves the serial dependency chain built by the local-first batches.

### 5.4 Acceptance Log Schema

```markdown
## Acceptance Log — Swarm Run {timestamp}

| Batch | Article UUID | Slug | Legal | Questions | Roundtrip | Scenarios | Citation | Overall | Accepted At | Remediation Ref |
|-------|--------------|------|-------|-----------|-----------|-----------|----------|---------|-------------|-----------------|
| 001   | uuid-1       | slug | PASS  | PASS      | PASS      | N/A       | PASS     | PASS    | 2026-05-12  | —               |
| 001   | uuid-2       | slug | PASS  | FAIL      | PASS      | N/A       | PASS     | FAIL    | —           | rem-001-002     |
```

---

## 6. Remediation and Re-Audit Loop

### 6.1 Remediation Manifest Generation

When an article fails, the coordinator generates a remediation manifest by filling `remediation-manifest-template.json`.

**Key rules:**
- One manifest per failed article (not per batch).
- The manifest names the failing lane, the exact finding, and the required fix.
- The manifest assigns a remediation worker (typically Codex) and a re-audit lane.

### 6.2 Remediation Workflow

1. **Coordinator assigns** the remediation manifest to Codex.
2. **Codex executes** the fix, updating the article folder, question-edits, or evidence files as needed.
3. **Codex records** `remediation_applied` evidence in the manifest.
4. **Coordinator routes** the article back to the **same lane that originally found the failure** for re-audit.
5. **Re-audit lane reviews** only the changed scope, not the entire article.
6. If re-audit → PASS, coordinator moves the article to acceptance.
7. If re-audit → FAIL again, coordinator escalates to human review or marks the article `PARKED`.

### 6.3 Parking Rules

An article may be parked if:
- It fails remediation twice.
- The required raw PDF source is unavailable and no narrowing is possible.
- The article is not on the critical path for launch.

Parked articles are recorded in `remediation-queue.json` with status `PARKED` and a `park_reason`. They do not block acceptance of other articles.

---

## 7. Pass / Fail / Blocker Taxonomy

### 7.1 Verdict Definitions

| Verdict | Definition | Next Action |
|---|---|---|
| **PASS** | All lane checks satisfied. No warnings that rise to failure. | Eligible for coordinator serial acceptance |
| **FAIL** | A specific, correctable defect was found. | Enter remediation loop |
| **BLOCKER** | A severe defect that risks student harm, legal liability, or data corruption. | Immediate remediation; may park if unresolvable |
| **N/A** | The lane does not apply to this article (e.g., no questions, no scenarios). | Does not affect overall verdict |

### 7.2 Blocker Criteria (Non-Exhaustive)

A finding is escalated to BLOCKER if it meets any of these criteria:

1. **Legal/Code Lane:**
   - A section number is cited that does not exist in the claimed raw PDF.
   - A dimension or ratio claim contradicts the raw PDF text.
   - Two codes are cited as agreeing when they actually conflict, with no resolution note.

2. **Questions Lane:**
   - A question-edit changes the correct answer without updating the rationale.
   - A question stem contains placeholder text (`TODO`, `FIXME`, `______`).
   - A question references a source that is not in the article’s `sources.json`.

3. **Roundtrip Lane:**
   - `normalized.md` and `candidate.md` have different SHA256 hashes.
   - A required JSON file fails to parse.
   - `content-audit:validate` reports a blocker (not a warning).

4. **Scenarios Lane:**
   - A scenario introduces a fictional law, policy, or map not traceable to raw sources.
   - A scenario contains a numerical claim with no source locator.

5. **Citation/Evidence Lane:**
   - A raw PDF file does not exist at the claimed path.
   - A SHA256 hash does not match the file on disk.
   - A source is marked `is_verified: true` but has no locator.

### 7.3 Warning Criteria

Warnings are recorded but do not block acceptance unless the coordinator elevates them:

- Missing `component-usage.json` for plain Markdown articles (known non-blocking).
- Minor formatting inconsistency in `source-audit-evidence.json`.
- Scenario enrichment deferred with a valid reason.
- Rationale is verbose but technically correct.

---

## 8. Evidence Requirements

Every lane finding (PASS, FAIL, BLOCKER) must be backed by **observable evidence** that the coordinator can verify without re-running the lane.

### 8.1 Required Evidence per Lane

| Lane | PASS Evidence | FAIL/BLOCKER Evidence |
|---|---|---|
| Legal/Code | List of verified section numbers/dimensions with PDF page locators | Exact claim text, expected vs actual raw-PDF text, PDF page number |
| Questions | Count match, sample question-edit UUIDs verified | Mismatch counts, offending question-edit UUID, exact defect |
| Roundtrip | Hash match output, validate command output | Parse error output, hash mismatch, validate blocker message |
| Scenarios | Scenario grounded in source X, page Y | Unsupported claim text, fictional source name, missing locator |
| Citation | File exists + hash match for sample UUIDs | Missing file path, expected vs actual hash, missing locator field |

### 8.2 Evidence File Policy

- Lane auditors append evidence to their output `.md` file.
- The coordinator does not copy evidence into the acceptance log; it references the lane output file path.
- Remediation manifests must include the **exact evidence excerpt** that triggered the failure, so the remediation worker does not need to re-run the full lane.

---

## 9. Artifact Inventory

### 9.1 Plan Files (This Directory)

| File | Purpose | Written By |
|---|---|---|
| `audit-swarm-partition-plan.md` | This document | Sisyphus (planning run) |
| `remediation-manifest-template.json` | Template for remediation tracking | Sisyphus (planning run) |
| `auditor-output-template.md` | Template for lane auditor reports | Sisyphus (planning run) |
| `swarm-partition-manifest-{ts}.json` | Assigned partitions per lane | Coordinator (pre-swarm) |
| `swarm-final-manifest.json` | Accepted articles after coordinator serial acceptance | Coordinator (post-swarm) |
| `acceptance-log.md` | Per-article acceptance/rejection record | Coordinator (post-swarm) |
| `remediation-queue.json` | Articles in remediation or parked | Coordinator (ongoing) |
| `legal-code-audit-{pid}.md` | Legal/Code Lane output | Claude / designated auditor |
| `questions-audit-{pid}.md` | Questions Lane output | Kimi / designated auditor |
| `roundtrip-audit-{pid}.md` | Roundtrip Lane output | OpenCode / designated auditor |
| `scenarios-audit-{pid}.md` | Scenarios Lane output | Kimi / designated auditor |
| `citation-evidence-audit-{pid}.md` | Citation/Evidence Lane output | Claude or Codex / designated auditor |
| `remediation-{article-uuid}.json` | Per-article remediation manifest | Coordinator (on failure) |

### 9.2 External References (Read-Only)

| Path | Purpose |
|---|---|
| `.ai/content-audit-export/source-audited-article-batch-NNN-local-first-ledger.json` | Batch completion state |
| `.ai/content-audit-export/source-audited-article-batch-NNN-local-first-report.md` | Batch worker self-report |
| `.ai/content-audit-export/articles/{slug}--{uuid}/` | Article bundles (read-only for auditors) |
| `vitruvius-connection/001_Raw-Source-Layer/` | Raw PDF evidence (read-only for auditors) |

---

## 10. Execution Sequence

```
Phase 0: Coordinator builds master corpus from batch ledgers 001-N
Phase 1: Coordinator writes swarm-partition-manifest-{ts}.json
Phase 2: Parallel lane audits (Legal, Questions, Roundtrip, Scenarios, Citation)
Phase 3: Coordinator aggregates lane outputs into triage matrix
Phase 4: Coordinator runs serial acceptance
   - PASS articles → swarm-final-manifest.json
   - FAIL/BLOCKER articles → remediation manifests + remediation-queue.json
Phase 5: Remediation workers (Codex) execute fixes
Phase 6: Re-audit of remediated articles (same lane, new session)
Phase 7: Coordinator updates acceptance log; parked articles recorded
Phase 8: Final swarm-final-manifest.json is the clean handoff to Supabase publishing
```

**Supabase publishing gate:** Only articles listed in `swarm-final-manifest.json` with `overall_status: ACCEPTED` may be pushed. The publishing run must reference this manifest and reject any article not on the list.

---

## 11. Safety Rules

1. **Auditors are read-only.** No lane auditor edits article content, question edits, batch ledgers, or handoff files.
2. **Coordinator is append-only.** The coordinator appends to acceptance log and manifest files; it does not rewrite history.
3. **Remediation is isolated.** Codex remediation patches are scoped to the failing article only.
4. **No Supabase push until Phase 8.** Any dry-run push during the swarm must be explicitly marked as dry-run and logged.
5. **Claude token budget is capped.** If a partition exceeds 20 articles, split it. If legal/code findings require deep statutory reasoning, request human SME review rather than burning tokens on ambiguous interpretation.
6. **Evidence before verdict.** No lane may report FAIL or BLOCKER without quoting the exact file path, line/claim, and expected-vs-actual evidence.

---

## 12. Success Criteria

The swarm is complete when:

- [ ] Every `PASS_LOCAL_FIRST_READY_FOR_FINAL_PUBLISHING_REVIEW` article from batches 001-N has an overall verdict.
- [ ] `swarm-final-manifest.json` contains only ACCEPTED articles with zero unresolved blockers.
- [ ] `remediation-queue.json` accounts for every rejected article (remediated, re-audited, or parked with reason).
- [ ] All lane output files are present and referenceable from the acceptance log.
- [ ] A human or designated final-gate reviewer has spot-checked at least 5% of ACCEPTED articles.
- [ ] The Supabase publishing run references `swarm-final-manifest.json` and rejects off-list articles.

---

*End of plan.*
