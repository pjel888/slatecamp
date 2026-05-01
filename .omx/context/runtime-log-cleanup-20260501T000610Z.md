# Runtime Log Cleanup Context

## Task statement
Fix dev runtime logs after launch route/auth cleanup: entitlement feature flag config mismatches, notification unread-count failures, and syncDashboardNotifications enum failure for `focus_review`.

## Desired outcome
Dashboard and app boot should not emit repeated entitlement config mismatch noise for existing feature flags, notification reads should fail gracefully with useful diagnostics or be fixed, and dashboard notification sync should not fail on `notification_type: focus_review`.

## Known facts/evidence
- `bun run dev` serves on port 3001.
- Logs show repeated `[entitlement-audit] entitlement.config.mismatch` with `sourceTrace:["unknown-tier:<feature_key>"]` for feature flags like `live_readiness_score`, `full_heatmap`, `trail_library`, `unlimited_questions`.
- Logs show `[NOTIFICATIONS] getUnreadCount failed: { message: "" }`.
- Logs show `syncDashboardNotifications RPC failed` with Postgres `22P02`, invalid enum `notification_type: "focus_review"`.

## Constraints
- Pre-launch MVP; prefer canonical data fixes and regression coverage over compatibility sprawl.
- Use Bun.
- Read live code before editing.
- Run GitNexus impact where available before editing functions/symbols.
- No tmux team runtime in this Codex surface.

## Unknowns/open questions
- Whether feature flag rows are using feature keys inside `target_tier` after target_roles removal.
- Whether notifications enum has a canonical replacement for focus review notification type.
- Whether getUnreadCount failure is RLS/schema/query-related or just low-signal error logging.

## Likely codebase touchpoints
- src/lib/entitlements/get-viewer-entitlements.ts
- src/lib/entitlements/normalize-feature-flag.ts
- src/lib/actions/notifications.ts
- src/lib/actions/sync-notifications.ts
- Supabase migrations / DATABASE_SCHEMA.sql / src/types/supabase.ts
- entitlement and notification tests
