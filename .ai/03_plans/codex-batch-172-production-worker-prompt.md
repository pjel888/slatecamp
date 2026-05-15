# Codex Production Worker — Source-Audited Batch 172 / Closure Continuation

Repo: `/Users/philiplewis/slatecamp`
Branch: `3dlab-gray-viewport-bg`
Baseline: Batch 171 accepted and pushed at `81f42e48697a566d48ebb454f2e920ea30291703`.

You are the single production batch worker. Do not spawn other workers.

## Hard prohibitions

- No Supabase push, deploy, database mutation, auth/billing/DNS/infrastructure changes, main merge, force-push, or destructive git cleanup.
- Do not edit/stage/commit/push unrelated dirty files.
- Do not touch app/product/3D/marketing/Hermes skill files unless they are already explicitly part of accepted batch 172 scope, which is unlikely.

## Current dirty-tree context to preserve/off-limits

The watchdog observed unrelated dirty/untracked files before launching you, including:

- `.ai/00_performance/results/dev_server_memory_profile_dev-server.json`
- `.ai/00_system/DOCS_SOURCE_OF_TRUTH.md`
- `.ai/README.md`
- `.hermes/skills/README.md`
- `src/app/globals.css`
- `src/components/marketing/**`
- `src/features/3d-lab/**`
- `tests/vitest/components/marketing/**`
- `.ai/03_plans/3d-modules/**`
- `.ai/03_plans/blocked-source-recovery/prompt-*.md`
- previous prompt files under `.ai/03_plans/codex-batch-*.md` and `.ai/03_plans/opencode-*.md`
- untracked `.ai/content-audit-export/runs/content-roundtrip-*` run directories
- `tmp/**`

Preserve these exactly. If you need to mention them, list as off-limits/pre-existing dirty context only.

## Mission

Continue the local-first source-audited production line from Batch 171. First verify live artifacts, git log, handoff/ledger state, and residual sourceable queue. Batch 171 was a zero-content closure stating no eligible clusters remain after Batch 170/164 remediation chain. Do not assume that is globally true without scanning live ledgers/artifacts.

If genuinely no eligible source-auditable article/question clusters remain, create a Batch 172 zero-content closure packet that proves it:

- `.ai/content-audit-export/source-audited-article-batch-172-local-first-report.md`
- `.ai/content-audit-export/source-audited-article-batch-172-local-first-ledger.json`
- `.ai/content-audit-export/source-audited-article-batch-172-local-first-scoped-checks.json`
- `.ai/03_plans/batch-172-git-handoff-stage-paths.txt`

Then run an independent QA lane if possible, or clearly mark that Hermes/watchdog must run independent QA before acceptance. If you can run OpenCode read-only QA safely, write only:

- `.ai/03_plans/batch-172-independent-quality-review.md`

If eligible clusters are found, process a small fixed local-first batch with full rules:

- article + linked question edits together
- raw source first under `vitruvius-connection/001_Raw-Source-Layer` or accepted local captures
- source-safe scenario/depth consideration
- no unsupported legal/code claims
- strict compose/diff/validate, JSON parse, marker/source-gap scans, source-verification tests
- completion trio + ledger + scoped checks + independent QA
- batch handoff paths file for exact staging

## Required preservation

Preserve final-audit intelligence and do not erase or resolve by assertion:

- `THIN_NEEDS_EXPANSION`
- scenario/depth findings
- question-alignment risks
- source-primary/source-needed enrichment findings
- any source-gap/proprietary-source blockers

## Git behavior

You may stage/commit/push only if and only if all batch artifacts, scoped checks, and independent QA pass and you can stage exact Batch 172 intended paths only. If there is any uncertainty, write the handoff paths and stop without staging. Never broad-stage. Always run real `git diff --cached --check` before any commit. Commit message, if fully accepted: `chore(content): accept source-audited batch 172`. Push only to `origin 3dlab-gray-viewport-bg`.

## Report format

End with:

1. Batch 172 status
2. Artifacts written
3. Whether independent QA exists and verdict
4. Validation commands/results
5. Whether staged/committed/pushed, with commit hash if done
6. Off-limits dirty files left untouched
7. Recommended next action for Hermes watchdog
