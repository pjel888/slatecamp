# Ralph Context Snapshot — launch cutline cleanup

## Task statement
Proceed with the documented `.ai` recommendation: implement the pre-launch cleanup sequence starting with confirmed alias removals, low-risk dependency verification/removal, route/namespace compatibility cleanup, and `.ai` documentation updates. Analyze blast radius and verify everything still works.

## Desired outcome
- Remove confirmed dead wiki alias wrappers/practice aliases if still present.
- Verify/remove low-risk unused dependencies DEP-02/03/04 when safe.
- Implement launch cutline namespace cleanup around duplicate `/tools` and `/calculators` surfaces when evidence supports a canonical choice.
- Preserve launch-critical flows and redirects where needed.
- Update `.ai` markdown files to match implementation.
- Add/adjust tests where cleanup needs behavior locks.
- Run focused and broad validation before completion.

## Known facts/evidence
- `.ai/03_plans/cleanup-executive-roadmap.md` says first wave: L1-C001, L1-C002, DEP-02, DEP-03, DEP-04, plus compatibility inventory for admin/quiz/testing.
- `.ai/prelaunch-readiness.md` recommends Plan B pre-launch cleanup.
- `.ai/launch-cutline.md` says consolidate `/tools` and `/calculators` into one canonical public utility namespace.
- Recent quiz consolidation already made `/quiz` canonical and `/dashboard/drills` redirect-only.
- Worktree already has broad intended quiz consolidation changes; avoid clobbering.
- tmux team runtime unavailable because TMUX is empty; proceed locally under Ralph.

## Constraints
- Use Bun.
- Read relevant AGENTS/docs before edits.
- Keep `.ai`, README, AGENTS aligned when routes/docs change.
- No production secrets or destructive DB operations.
- Prefer minimal, reviewable cleanup. Do not delete uncertain operator scripts.
- Run tests/typecheck/lint/diff check and route/E2E checks as needed.

## Unknowns/open questions
- Whether L1 confirmed alias files still exist after earlier cleanup.
- Whether DEP packages are still present and unused in current package.json/lockfile.
- Which namespace should be canonical for public utility calculators; docs imply `/tools` as canonical public namespace while `/calculators` duplicates are superseded.
- Exact redirect/test changes needed for `/calculators` -> `/tools`.

## Likely codebase touchpoints
- `src/app/tools/**`
- `src/app/calculators/**`
- `src/lib/routes.ts`
- `next.config.ts`
- E2E launch/access tests
- route tests
- package.json / bun.lock
- `.ai/launch-cutline.md`, `.ai/prelaunch-readiness.md`, `.ai/routes.md`, `.ai/testing.md`, `.ai/03_plans/*`, `.ai/10_state/*`
