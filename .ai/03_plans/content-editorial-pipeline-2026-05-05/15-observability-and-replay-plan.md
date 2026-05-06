# Observability and Replay Plan

## Objective

Every pipeline run must be explainable, replayable, and reviewable without relying on chat transcripts.

## Run manifest

Each run must record:

- run ID
- command
- actor
- git branch and commit
- export ID
- article IDs
- model role config
- prompt versions
- source pack versions
- input hashes
- output artifact paths
- validation summary
- cost/runtime summary

## Logging levels

- Human summary: concise run outcome.
- Machine log: JSONL event stream.
- Raw model output: stored for audit but never used directly without validation.
- Error log: failures, retries, quarantine reasons.

## Replay requirements

A reviewer should be able to reconstruct:

- exact input files,
- exact prompt version,
- source excerpts given to the model,
- raw model output,
- validated JSON artifact,
- applied patch, if any,
- final candidate diff.

## Admin sync

Only validated summaries should be synced to `/admin/ai-audit`; raw model outputs should remain local unless explicitly reviewed.

## Retention policy needed

Decide retention for:

- raw model outputs,
- source excerpts,
- full prompts,
- failed outputs,
- run manifests,
- review packets.
