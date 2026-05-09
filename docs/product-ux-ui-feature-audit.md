# Product UX/UI Feature Audit — Superseded Bridge

**Superseded on:** 2026-04-29

This root `docs/` file is intentionally reduced to a bridge pointer so it does not compete with the current README and `.ai/` operational intelligence docs.

## Current source of truth

Use these files for current launch readiness and cleanup state:

- `README.md`
- `.ai/final-launch-readiness.md`
- `.ai/launch-cutline.md`
- `.ai/routes.md`
- `.ai/features.md`
- `.ai/deferred-integrations.md`
- `.ai/db-cleanup-deferred.md`
- `.ai/risk-register.md`
- `.ai/known-issues.md`
- `.ai/cleanup-execution-log.md`

## Current launch stance

- Current launch is **payment-free**.
- Current launch is **learner-facing live-AI-provider-free**.
- PayRex checkout/webhook verification is deferred post-launch and is not a current launch blocker while `NEXT_PUBLIC_PAYMENTS_ENABLED=false`.
- LemonSqueezy runtime route/config/test/dependency were removed; only dormant schema/type remnants remain for a future DB cleanup/reset PR.
- Live learner-facing OpenRouter/OpenAI/Anthropic provider behavior is deferred; public copy and launch-facing study UI must not imply live AI provider readiness. Developer-local OpenRouter usage is separate internal tooling, not launch evidence.
- Removed route shims such as `/test-3d`, `/admin/wiki`, `/dashboard/heatmap`, `/dashboard/trail(s)`, `/dashboard/settings/billing`, `/dashboard/settings/developer`, `/settings`, and `/quiz` should not be treated as implemented routes.

Historical audit details from earlier passes are superseded by the files above and should not be used as current implementation evidence without re-checking the codebase.
