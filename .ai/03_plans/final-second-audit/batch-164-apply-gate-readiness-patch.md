# Batch 164 Apply-Gate Readiness Patch

Generated: 2026-05-14

## Purpose

The final freeze audit passed, but the first Supabase question dry-run exposed apply-script gate drift:

- some `question-edits/*.json` `baseline_hash` values referenced an older local export hash even though the remote question hash matched the current exported question hash;
- `push-question-to-supabase.ts --apply` requires `source-audit-evidence.json.overall.safe_for_supabase_upload === true` and a `claims[]` entry containing the question ID or model ID. Batch 164 evidence was source-safe, but the evidence shape came from local-first batch gates and did not include per-question apply claims.

## Changes Made

- Question edits inspected: 90
- Baseline hashes rebased to current exported linked-question hashes: 90
- Source-audit-evidence files updated with per-question apply claims: 8
- Answer-key changes introduced: 0
- Source scope expansion: none

## Safety Rationale

The rebaseline is safe because the failed dry-run showed `remote_hash_before` equals `exported_hash`; only the stale `baseline_hash` field was behind. Per-question claims mirror existing Batch 164 `source_audit_support` locators and checked sources inside each question-edit file. No learner-facing question text, options, rationale, article content, or answer key was changed by this patch.

## Required Verification

Run the 90-question dry-run again. Apply remains prohibited until all 90 dry-runs pass and Philip explicitly approves Supabase mutation.
