# Ralph Context Snapshot - 3D Lab Production Hardening

## Task statement
Implement the next 3D Lab production-hardening loop: repeated built-auth 3D performance baselines, full module smoke testing, mobile/mid-range WebGL performance measurement, staging/prod-like auth timing where safe, WebGL/slow-loading/context-loss fallbacks, console/runtime-error enforcement, CI warning gates that can become hard gates after stable history, and a concrete measurable onboarding/tutorial system that fixes suspected duplicate onboarding/tutorial modals.

## Desired outcome
- 3D Lab has repeatable production-quality validation lanes rather than one-off evidence.
- /dashboard/3d-lab and all module detail routes can be smoke-tested with safe demo auth.
- Onboarding/tutorial presentation is single-owner, deduped, measurable, and persisted safely.
- Reports/logs/results live under .ai/00_performance.
- No secrets, cookies, tokens, or real user data are printed or stored.

## Known facts/evidence
- Current HEAD before work: 081770758b1bfaddfdbc73ed26e7b99c383a8b50.
- Prior loop added memory profiling, route-sequence isolation, and demo-auth built-app measurement.
- Built-auth /dashboard/3d-lab local baseline: cold p95 1,556 ms, warm p95 1,356 ms, server RSS max 211.7 MiB, no login redirect.
- Full local dev suite still emits Next memory-threshold restart warnings and remains warning-only.
- Team tmux runtime likely unavailable in this app session because TMUX is empty; tmux and omx exist.
- Unrelated untracked folder exists: .ai/13_research/3D-Lab-Audit-And-UXUI-Improvement/ - do not touch.

## Constraints
- Use Bun for scripts/tests.
- Do not store secrets or live credentials. Only env var names/presence are allowed.
- Do not run destructive DB operations.
- Preserve server-component defaults and 3D performance-sensitive patterns.
- Keep changes minimal and reversible; update .ai/00_performance ledger.
- GitNexus CLI/MCP was previously unavailable; retry and document if still blocked.

## Unknowns/open questions
- Exact locations and owners of current 3D onboarding/tutorial modal logic.
- Whether every 3D module detail route can load without WebGL rendering in headless Chromium.
- Whether mobile emulation exposes useful WebGL heap/timing signals on local Playwright.
- Whether real staging credentials are present in the environment; if not, credential timing must remain readiness-only.

## Likely codebase touchpoints
- src/app/dashboard/3d-lab/page.tsx
- src/app/dashboard/3d-lab/[moduleId]/page.tsx
- src/features/3d-lab/components/*
- src/features/3d-lab/config/registry/*
- src/features/3d-lab/config/module-paths.ts
- src/features/3d-lab/stores/*
- .ai/00_performance/playwright/perf.spec.ts
- .ai/00_performance/scripts/*
- scripts/playwright-web-server.ts
- package.json
