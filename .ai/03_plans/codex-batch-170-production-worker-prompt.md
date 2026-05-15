# Codex Production Worker Prompt — Source-Audited Batch 170

Repo: `/Users/philiplewis/slatecamp`
Branch: `3dlab-gray-viewport-bg`
Baseline: latest accepted/pushed content batch is Batch 169 at `10331d514` unless live git shows a later accepted batch.

You are the single active write-capable SlateCamp local-first source-audited production worker. Do not spawn other production workers.

## Hard prohibitions

- No Supabase push/apply.
- No deploy.
- No DB mutation.
- No main merge.
- No force-push.
- Do not stage, commit, or push from the worker unless explicitly instructed by a later coordinator prompt.
- Do not edit unrelated dirty product/3D/marketing/Hermes/docs files.
- Do not delete or revert unrelated work.

## Current watchdog facts

- OS process scan found no active `codex exec`, `opencode run`, `gemini`, `cmd -p`/CommandCode, or `kimi` production worker in `/Users/philiplewis/slatecamp` at launch time.
- Hermes process registry was empty at launch time.
- `origin/3dlab-gray-viewport-bg` contains `10331d514 chore(content): accept source-audited batch 169`.
- Batch 169 is a zero-content closure/readiness packet that states no remaining eligible source-auditable residual article plus linked-question cluster was found after Batch 168.
- Treat that as evidence to verify, not as permission to invent content.

## Off-limits pre-existing dirty/untracked paths/globs

Preserve these unless your exact Batch 170 evidence proves a file is an intended Batch 170 artifact:

- `.ai/00_performance/results/dev_server_memory_profile_dev-server.json`
- `.ai/00_system/DOCS_SOURCE_OF_TRUTH.md`
- `.ai/README.md`
- `.ai/content-audit-export/sync-state.json`
- `.ai/content-audit-export/ui-block-edit-validation.json`
- `.ai/content-audit-export/validation-report.json`
- `.ai/content-audit-export/runs/**`
- `.hermes/skills/README.md`
- `src/components/marketing/**`
- `src/features/3d-lab/**`
- `tests/vitest/components/marketing/**`
- `.ai/00_system/philip-ux-ui-calibration.md`
- `.ai/03_plans/3d-modules/**`
- `.ai/03_plans/blocked-source-recovery/prompt-*.md`
- existing prior-batch prompts such as `.ai/03_plans/codex-batch-161-reopen-nscp-prompt.md` through `.ai/03_plans/codex-batch-169*` if present
- the stale deletion of `.ai/content-audit-export/articles/lea-strc-011-03-core-concept--d7de9bc9-ea50-46d1-8079-2dd3cc0378e7/compose-error.json` unless your Batch 170 scope explicitly owns it

## Required startup checks

1. Confirm current directory, branch, `git status -sb`, and latest accepted content-batch commits.
2. Inspect `.ai/00_system/slatecamp-authoritative-reference.md` and relevant `.ai/03_plans` handoff/coordination artifacts.
3. Inspect Batch 169 report, ledger, scoped checks, independent QA, and handoff paths.
4. Verify whether any eligible source-auditable residual article + linked-question cluster remains after accepted Batch 169.

## Work decision

### If eligible source-auditable residual clusters exist

Run Batch 170 as a local-first source-audited content batch:

- Select only sourceable article + linked-question clusters not accepted in prior production-line batches.
- Use raw/local sources first: `vitruvius-connection/001_Raw-Source-Layer`, then conversions/canonical layers for anchors.
- Edit article `normalized.md`/`candidate.md` and all linked `question-edits/*.json` together.
- Add source-safe Real World Scenarios where useful; otherwise record `eligible-deferred` or `not-applicable`.
- Preserve answer keys unless source evidence proves a correction is required; document any answer-key change explicitly.
- Run compose/diff/validate, scoped JSON parse, marker/source-gap/internal-note scans, source-verification tests, question-edit parity, and scoped `git diff --check`.
- Write completion trio:
  - `.ai/content-audit-export/source-audited-article-batch-170-local-first-report.md`
  - `.ai/content-audit-export/source-audited-article-batch-170-local-first-ledger.json`
  - `.ai/content-audit-export/source-audited-article-batch-170-local-first-scoped-checks.json`
- Write independent-QA-ready handoff/stage file under `.ai/03_plans/`, preferably `.ai/03_plans/batch-170-git-handoff-stage-paths.txt`.

### If no eligible source-auditable residual clusters exist

Create a zero-content Batch 170 closure/readiness packet only. Do not edit content folders. The packet must verify live evidence and preserve final-audit backlog intelligence:

- `THIN_NEEDS_EXPANSION`
- scenario/depth findings
- question-alignment findings
- source-primary/source-needed findings
- source-acquisition blockers requiring authorized copies or future research

Required zero-content artifacts:

- `.ai/content-audit-export/source-audited-article-batch-170-local-first-report.md`
- `.ai/content-audit-export/source-audited-article-batch-170-local-first-ledger.json`
- `.ai/content-audit-export/source-audited-article-batch-170-local-first-scoped-checks.json`
- `.ai/03_plans/batch-170-independent-quality-review.md` or a QA-ready memo if a separate reviewer is still needed
- `.ai/03_plans/batch-170-git-handoff-stage-paths.txt`

## Acceptance standard

A completed Batch 170 must have blockers=0, scoped checks PASS, clear selected article/question-edit counts, and exact intended stage paths. If blocked, write the exact blocker and do not stage unrelated files.
