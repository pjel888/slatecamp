# Ralph Context Snapshot — Admin/CEO RBAC Release Validation

## Task statement
Continue the active `$ultrawork $ralph $team` loop and run all remaining validation work from the prior handoff: focused admin/CEO Playwright demo-auth lanes, full release validation, live/staging CEO role readiness checks without secrets, safe GitNexus refresh, lint debt review where practical, and commit/push any resulting changes/evidence.

## Desired outcome
- Fresh verification evidence for admin/CEO RBAC E2E lanes.
- Full `bun run validate:release` attempted and either green or blocker documented with logs.
- Live/staging CEO role assignment and audit logging readiness assessed without printing/storing secrets.
- GitNexus index refreshed safely, preserving embeddings if present.
- Non-blocking lint debt handled or inventoried without widening scope recklessly.
- Working tree clean or only explicitly documented untracked artifacts remain.
- Changes/evidence committed with meaningful Lore-format message and pushed to `origin/main` if files changed.

## Known facts/evidence
- Branch before this loop: `main`.
- HEAD before this loop: `3a2b32805c66aac87e2428c5656f0c6b502e7294` (`Stabilize CEO role E2E selector`).
- Prior verification at that HEAD reportedly passed: type-check, lint (0 errors / 343 warnings), build, test, check:entitlements, diff check.
- New RBAC E2E scripts exist and need fresh execution:
  - `bun run test:e2e:auth-demo:admin-content-admin`
  - `bun run test:e2e:auth-demo:admin-sme-reviewer`
  - `bun run test:e2e:auth-demo:admin-developer`
  - `bun run test:e2e:auth-demo:ceo-portal`
- Current working tree contains an untracked performance result: `.ai/00_performance/results/dev_server_memory_profile_dev-server.json`.
- `tmux` is installed but this leader shell is not inside tmux (`$TMUX` empty), so durable `omx team` panes are unavailable from this context. Use local execution/native subagent only if needed.

## Constraints
- Use Bun for repo scripts.
- Never print or store secrets, API keys, cookies, tokens, private Supabase credentials, or user data.
- Do not run destructive database operations.
- Preserve GitNexus embeddings when refreshing index.
- Do not mass-fix broad lint warnings without focused evidence and low risk.
- Follow Lore commit protocol for any commits.

## Unknowns/open questions
- Whether all focused demo-auth Playwright lanes pass in this local environment.
- Whether `validate:release` is stable after the latest RBAC changes.
- Whether GitNexus can refresh with the local/network environment.
- Whether current env has live/staging credential names present; if values are present, report only names/presence, never values.

## Likely codebase touchpoints
- `package.json`
- Playwright config/scripts under `scripts/` and e2e specs under `e2e/` or `tests/e2e/`
- `.ai/05_logs/2026-04-28/` for validation/readiness evidence
- `.gitnexus/meta.json` and `.gitnexus/` index files
- `.omx/state/sessions/019dd187-37d2-75d0-b395-7005c12a71c6/` Ralph/Ultrawork state
