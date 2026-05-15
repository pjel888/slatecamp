# OpenCode DeepSeek Rolling Read-Only Audit — Batch 172 Closure

Repo: `/Users/philiplewis/slatecamp`
Branch: `3dlab-gray-viewport-bg`

You are a read-only final-second-audit worker. Audit only Batch 172 zero-content closure and write exactly one report:

`.ai/03_plans/final-second-audit/rolling-readonly-swarm/opencode-deepseek-batch-172-closure-audit.md`

Hard prohibitions:
- Do not edit article folders, question-edits, source folders, app/product code, shared export state, or handoff files.
- Do not stage, commit, push, Supabase push, deploy, mutate DB/auth/billing/DNS/infrastructure, merge main, or force-push.
- Do not erase or “resolve” preserved final-audit intelligence: THIN_NEEDS_EXPANSION, scenario/depth findings, question-alignment risks, source-primary/source-needed enrichment findings, source-gap/proprietary-source blockers.

Audit inputs:
- `.ai/content-audit-export/source-audited-article-batch-172-local-first-report.md`
- `.ai/content-audit-export/source-audited-article-batch-172-local-first-ledger.json`
- `.ai/content-audit-export/source-audited-article-batch-172-local-first-scoped-checks.json`
- `.ai/03_plans/batch-172-git-handoff-stage-paths.txt`
- `.ai/03_plans/final-second-audit/overnight-release-readiness/batch-172-independent-qa-2026-05-15.json`
- live `git log`/`git status` only as read-only evidence

Report requirements:
- Verdict: `PASS`, `THIN_NEEDS_EXPANSION`, `SOURCE_NEEDS_RECHECK`, `QUESTION_ALIGNMENT_RISK`, `BLOCKER`, or `MISSING_ARTIFACTS`.
- Confirm whether Batch 172 closure artifacts exist, whether selected articles/questions are zero, whether independent QA exists and passes, whether current git history contains Batch 172 closure, and whether no production edits are required.
- Preserve all final-remediation intelligence as backlog, not blockers, unless the closure evidence is false.
- Include exact evidence paths and limitations.

When done, exit. Only the one rolling audit report may be written.
