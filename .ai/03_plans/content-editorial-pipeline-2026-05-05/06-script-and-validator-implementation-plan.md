# Script and Validator Implementation Plan

## Objective

Build the deterministic tooling that makes AI-assisted editing safe.

## Proposed scripts

### `scripts/content-audit/audit-editorial-readiness.ts`

Reads current repo/corpus state and writes readiness artifacts.

Outputs:
- plan-folder readiness report
- current script map
- article bundle inventory
- pilot shortlist

### `scripts/content-audit/generate-editorial-diagnosis.ts`

Runs read-only diagnosis for one or many articles.

Inputs:
- article bundle path or article ID
- model role config

Outputs:
- `editorial/editorial-diagnosis.json`

### `scripts/content-audit/extract-fact-ledger.ts`

Extracts atomic claims and classifies risk.

Outputs:
- `editorial/fact-ledger.json`

### `scripts/content-audit/propose-editorial-edits.ts`

Generates patch proposals only. Does not mutate content.

Outputs:
- `editorial/rewrite-plan.json`
- `editorial/proposed-edits.json`

### `scripts/content-audit/apply-editorial-proposal.ts`

Applies approved low-risk proposals locally.

Mutations allowed:
- `normalized.md`
- `question-edits/*.json`
- derived hashes as required by roundtrip protocol

Mutations forbidden:
- `original.md`
- `linked-questions.json`
- hand-written `candidate.md`

### `scripts/content-audit/validate-editorial-artifacts.ts`

Validates all JSON artifacts against schemas.

### `scripts/content-audit/validate-components.ts`

Validates component names, props, nesting, and placeholder safety against the real component registry.

### `scripts/content-audit/check-fact-changes.ts`

Compares proposed/applied edits against `fact-ledger.json`.

### `scripts/content-audit/validate-question-edits.ts`

Validates question edit files and answer-key sanity.

### `scripts/content-audit/generate-review-packet.ts`

Creates `editorial/review-packet.md` from all artifacts and diffs.

### `scripts/content-audit/sync-editorial-results-to-admin-audit.ts`

Syncs pipeline run results into `/admin/ai-audit` tables without mutating article/question content.

## Validator-first rule

Build validators before proposal application. AI output must be rejected by code before it can touch local bundles.

## Testing strategy

Create fixtures for:
- article with no UI blocks
- article with multiple UI blocks
- article with linked questions
- article with invalid component proposal
- article with unsupported claim proposal
- article with question answer-key edit

Run:

```bash
bun run type-check
bun run lint
git diff --check
bun test scripts/content-audit/content-audit.test.ts
```

If no Bun tests exist for a new validator, add targeted tests before implementation.
