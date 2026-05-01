# Ralph Context: lint cleanup + CEO live/staging readiness

## Task statement
Fix the repository lint warnings and assess whether live/staging CEO validation can use the user's Supabase auth account. Check `.env.local` safely.

## Desired outcome
- `bun run lint` has zero warnings if practical without behavior-changing cleanup.
- Typecheck/build/relevant tests remain green.
- CEO live/staging readiness is documented with env names/presence only; no secrets printed or stored.
- If credentials are missing, identify exact env names needed without asking for secret values in chat.

## Constraints
- Never print or store secrets, API keys, cookies, Supabase keys, passwords, or private user data.
- User provided email `philipjonlewis@gmail.com`; do not invent/store password. Use existing env vars if present.
- Use Bun. Keep changes reversible and behavior-preserving.
- Run GitNexus impact/detect where possible before edits.

## Known facts
- Previous commit `43b5a0bf` pushed RBAC/demo-auth release-validation work.
- Previous lint passed with 344 warnings, 0 errors.
- Live/staging CEO credentialed validation was blocked by missing safe credentials.

## Likely touchpoints
- `.env.local` names/presence only.
- `package.json`, ESLint config, lint-warning source files.
- E2E CEO/demo auth specs and docs under `.ai/05_logs/2026-04-28` if adding readiness report.

## Open questions
- Whether `.env.local` already contains Playwright CEO/test credentials.
- Whether zero-warning cleanup is feasible without changing behavior across hundreds of files.
