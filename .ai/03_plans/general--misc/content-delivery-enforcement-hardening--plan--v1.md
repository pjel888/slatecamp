# SlateCamp Content Delivery Enforcement Hardening Plan

Updated: 2026-05-11
Scope: Article/question local-first pipeline, final publishing gate, and future scenario enrichment.

## Current Assurance Level

The current local-first batch pipeline already enforces the major SlateCamp quality requirements:

1. Raw-source-first legal/code verification
   - Primary source truth is `vitruvius-connection/001_Raw-Source-Layer`.
   - Refined markdown/conversion layers are locators only, not primary truth.
   - Each passed batch records source evidence and source hashes.

2. Roundtrip protocol
   - `ui-blocks.json` owns UI blocks.
   - `normalized.md` owns placeholders.
   - `candidate.md` is generated/validated through compose.
   - Publication surfaces must not contain raw `[SLATECAMP_UI_BLOCK:...]` markers.

3. Article quality checks
   - Remove placeholders, internal notes, unsupported claims, and stale compose errors.
   - Refresh `sources.json` and `source-audit-evidence.json`.
   - Compose, diff, and validate every selected article locally.

4. Question quality checks
   - Every linked question in the selected bundle receives a source-safe `question-edits/*.json` file.
   - Unsupported exact legal/code/numeric claims must be sourced or rewritten to source-safe form.
   - Question-edit counts are checked against actual linked-question counts, not assumed counts.

5. Batch-level gates
   - Scoped JSON parse.
   - Placeholder/internal-note/source-gap scans.
   - Source hash checks.
   - Question-edit count checks.
   - Stale compose-error checks.
   - Targeted content-audit tests.
   - Scoped `git diff --check`.
   - Handoff file updated before/after each batch.

## Remaining Weakness

The pipeline is strong, but enforcement is still partly prompt/procedure-driven. That means a careful agent follows it, but a future tired/cheaper agent could accidentally skip or under-document a gate unless the repo has a single machine-readable hard gate.

## Hardening Objective

Create a single pre-publish and batch-completion enforcement layer that refuses to mark any batch/article/question as publish-ready unless every required criterion is machine-verified or explicitly marked not-applicable with rationale.

## Proposed Enforcement Additions

### 1. Machine-readable batch manifest

For every batch, require a `source-audited-article-batch-NNN-local-first-ledger.json` schema with required fields:

- `batch_id`
- `selected_articles[]`
  - `article_id`
  - `slug`
  - `article_folder`
  - `question_edits_folder`
  - `linked_question_count`
  - `question_edit_count`
  - `raw_sources[]`
  - `sources_json_updated`
  - `source_audit_evidence_updated`
  - `compose_passed`
  - `diff_safe_to_push`
  - `validate_passed`
  - `ui_block_validation_passed`
  - `publication_marker_scan_passed`
  - `source_gap_scan_passed`
  - `stale_compose_error_absent`
  - `scenario_policy_status` (`eligible-added`, `eligible-deferred`, `not-applicable`)
  - `scenario_policy_reason`
- `batch_gates`
  - JSON parse
  - source hash checks
  - question-edit count checks
  - targeted tests
  - scoped `git diff --check`
- `unresolved_blockers`
- `safe_for_final_publishing_review`

### 2. Single hard gate script

Add or extend a script such as:

```bash
bun scripts/content-audit/verify-local-first-batch-readiness.ts --batch 052
```

It should fail non-zero if any item is missing or invalid.

Required assertions:

- Batch report, ledger, and scoped-checks exist.
- Every selected article folder exists.
- Every `normalized.md`, `candidate.md`, `sources.json`, `source-audit-evidence.json`, `article-metadata.json`, and `ui-blocks.json` exists.
- No raw UI-block placeholders or internal notes on publication surfaces.
- No `compose-error.json` remains for selected articles.
- `candidate.md` is generated from current normalized/UI block state.
- `question-edits` count equals linked-question count.
- Every question edit is valid JSON and source-safe.
- Every source evidence row points to an existing local raw source and has a hash/locator.
- Report and ledger agree on selected IDs, counts, blockers, and paths.
- Handoff has pre-selection, selection, and end checkpoint for the batch.
- `safe_for_final_publishing_review === true` only when blockers are 0.

### 3. Scenario enrichment gate

For real-world scenarios, enforce a policy instead of blanket inclusion:

- Each article must state one of:
  - `eligible-added`: scenario is present and source-safe.
  - `eligible-deferred`: scenario is useful but deferred for a separate enrichment pass.
  - `not-applicable`: scenario would be forced or pedagogically unnecessary.
- Scenario text must not introduce unsupported legal/code dimensions, dates, penalties, or procedural claims.
- Scenario must be anchored to already-cited article sources or written as a clearly practical, non-authoritative design/professional context.
- Scenario absence is acceptable only when rationale is recorded.

### 4. Final publishing preflight

Before Supabase push, require a repo-level command like:

```bash
bun scripts/content-audit/verify-final-publishing-readiness.ts --batches 001-052
```

This should aggregate all batch ledgers and fail if:

- any batch has unresolved blockers,
- any article lacks required files,
- any selected question lacks source-safe edits,
- any publication surface has raw placeholders/internal notes,
- any source evidence path/hash is missing,
- any scenario policy status is missing for completed articles,
- any batch handoff checkpoint is missing.

### 5. Agent prompt contract

Every future batch worker prompt should include this non-negotiable line:

> Do not mark a batch complete from narrative judgment. A batch is complete only when the hard gate script exits 0 and the report/ledger/handoff record that exact command and result.

## Recommended Next Implementation

1. Keep the current Codex batch worker running; do not interrupt it.
2. Let OpenCode finish the scenario-enrichment plan.
3. After the current batch worker reaches a natural clean stop, create the hard-gate script and schema validator.
4. Rerun the hard gate retroactively across Batches 029 onward, then earlier batches if needed.
5. Only then proceed to final Supabase publishing review.

## Definition of Done

The pipeline is considered fully enforced when:

- A single command can verify any local-first batch.
- A single command can verify all batches before publishing.
- Scenario policy status is recorded for every improved article.
- Batch reports cannot claim PASS unless the hard gate command passed.
- Final Supabase publishing cannot proceed without all hard gates passing.
