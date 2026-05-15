# Codex production worker — Batch 171

Repo: `/Users/philiplewis/slatecamp`
Branch: `3dlab-gray-viewport-bg`
Baseline accepted/pushed content batch: `1cfff965b chore(content): accept source-audited batch 170` (verify live before editing).

You are the next SlateCamp local-first source-audited content production worker. Work autonomously, but obey these boundaries exactly.

## Hard prohibitions

- Do not push to Supabase.
- Do not deploy.
- Do not merge to main.
- Do not mutate any database.
- Do not run destructive git cleanup/reset commands.
- Do not stage, commit, or push. Hermes watchdog is the serial accepter.
- Do not edit unrelated dirty 3D/marketing/Hermes/docs/planning files.

## Existing dirty tree / off-limits paths

The watchdog observed a mixed dirty tree before launch. Treat these as off-limits unless your live inspection proves they are required batch-171 content artifacts:

- `.ai/00_performance/results/dev_server_memory_profile_dev-server.json`
- `.ai/00_system/DOCS_SOURCE_OF_TRUTH.md`
- `.ai/00_system/philip-ux-ui-calibration.md`
- `.ai/README.md`
- `.hermes/skills/README.md`
- `.ai/03_plans/3d-modules/`
- `.ai/03_plans/blocked-source-recovery/prompt-*.md`
- earlier prompt files under `.ai/03_plans/codex-batch-16*-production-worker-prompt.md`, `.ai/03_plans/opencode-batch-*.md`
- `src/components/marketing/**`
- `src/features/3d-lab/**`
- `tests/vitest/components/marketing/**`
- stale/untracked historical `.ai/content-audit-export/runs/content-roundtrip-2026-05-13*/` unless your current validation creates a new batch-171 run and records it in handoff paths.

## Required orientation

1. Check live git branch/status/log.
2. Read `.ai/00_system/slatecamp-authoritative-reference.md` and relevant `.ai/.hermes/.codex/.omx` batch/handoff artifacts.
3. Verify the latest accepted source-audited batch from git history and artifacts. If batch 170 is still latest and no batch 171 artifacts exist, proceed with batch 171. If a later completed/accepted batch exists, continue from latest + 1.
4. Inspect prior batch reports/ledgers/manifests to avoid duplicate clusters.

## Batch work scope

Continue the local-first source-audited production line:

- Select the next eligible source-auditable article/question clusters not already accepted, prioritizing residual clusters with authoritative local raw sources or approved captured official/authoritative internet sources already stored locally.
- If no eligible clusters remain, produce a zero-content closure packet proving the queue is exhausted and listing source-acquisition-only blockers separately. Do not invent support.
- For selected clusters, edit article content and all linked question-edits together.
- Raw/source layer first: use `vitruvius-connection/001_Raw-Source-Layer` before refined/canonical layers. Include hashes, locators, and source-safe claim boundaries.
- Preserve THIN_NEEDS_EXPANSION, scenario, question-alignment, and source-primary findings for final rigorous remediation after all local-first batches complete. Do not hide them.
- Add/source-safe real-world scenarios only when naturally supported; otherwise explicitly record `eligible-deferred` or `not-applicable`.

## Required artifacts

Write the normal batch completion trio and handoff artifacts under `.ai/03_plans/` and article/question folders as appropriate:

- batch 171 report with article list, question-edit count, blockers, scenario status, source-gap decisions, validation evidence
- batch 171 ledger
- batch 171 scoped checks JSON/MD as project convention requires
- `batch-171-git-handoff-stage-paths.txt` listing exact intended paths for watchdog staging
- independent-QA-ready summary of what another reviewer must verify

If this is a zero-content closure batch, the report/ledger/scoped checks must clearly say `zero_content_closure`, selected article count 0, article/source edits 0, blockers 0 for eligible queue, and list remaining proprietary/source-acquisition blockers separately.

## Validation gates

Run the narrowest real checks for your touched paths:

- article compose/diff/validate for each touched article
- linked question JSON parse for every `question-edits/*.json`
- placeholder/internal-note/raw marker/source-gap scan over touched files
- content source-verification tests if available and scoped
- `git diff --check` over intended touched paths

Final report must state exact commands and pass/fail results. Blockers must be exact and actionable.

## Final state

Do not stage or commit. Leave all intended paths listed in `batch-171-git-handoff-stage-paths.txt`. If blocked, write the exact blocker and safe continuation path, then stop.
