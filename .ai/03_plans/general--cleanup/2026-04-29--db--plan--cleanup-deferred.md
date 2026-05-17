# Deferred Database Cleanup

**Last updated:** 2026-04-29 final launch hardening pass.

No destructive database cleanup was performed in this pass. The current launch can proceed without removing dormant LemonSqueezy schema/type remnants because the LemonSqueezy runtime route/config/dependency were removed and payments are deferred.

| DB Item | Type | Current Runtime Usage | Launch Impact | Recommended Future Action | Risk |
|---|---|---|---|---|---|
| `user_subscriptions.lemonsqueezy_customer_id` | Schema column | No active runtime references found outside schema/types/docs after Plan B cleanup. | None for payment-free launch. | Remove in explicit DB cleanup/reset/squash PR, or document as intentionally dormant if historical data must be preserved. | Medium if production data exists; low if pre-launch reset is approved. |
| `user_subscriptions.lemonsqueezy_subscription_id` | Schema column | No active runtime references found outside schema/types/docs after Plan B cleanup. | None for payment-free launch. | Remove in explicit DB cleanup/reset/squash PR, or document as intentionally dormant if historical data must be preserved. | Medium if production data exists; low if pre-launch reset is approved. |
| `src/types/supabase.ts` LemonSqueezy fields | Generated type fields | Type-only remnants mirror current schema snapshot. | None at runtime. | Regenerate after schema cleanup; do not hand-edit unless the repo's type-generation workflow is unavailable and documented. | Low runtime risk; medium drift risk if edited manually. |
| `src/types/app.ts` LemonSqueezy fields | App type fields | Type-only remnants for subscription records. | None at runtime unless future code starts using them. | Remove after schema decision and type/user-subscription consumer search. | Low. |
| `supabase/migrations/20260407_user_subscriptions.sql` | Historical migration | Contains original `lemon_squeezy_*` columns. | None for current runtime; migration history still recreates legacy columns. | Decide whether to squash/reset migrations before first production data. | Medium; migration rewrite is destructive to history. |
| `supabase/migrations/20260407_migrate_stripe_to_lemonsqueezy.sql` | Historical migration | Renames legacy Stripe/Lemon fields into `lemonsqueezy_*`. | None for current runtime; migration history still preserves old provider path. | Include in migration squash/reset decision. | Medium; do not edit casually if environments depend on migration history. |
| `processed_webhook_events.provider` rows for `lemonsqueezy` | Data possibility | No current handler writes LemonSqueezy events. | None unless historical rows exist. | If resetting DB, remove historical provider rows; if preserving DB, leave as historical audit data. | Medium if production audit history matters. |

## Future verification before destructive DB cleanup

1. Confirm production/staging data preservation requirements.
2. Search active runtime code for `lemonsqueezy`, `lemon_squeezy`, and `LEMON`.
3. Run schema/type generation and compare `DATABASE_SCHEMA.sql`, Supabase types, and migrations.
4. Run `bun run type-check`, `bun run test`, payment route tests, and entitlement checks.
5. Update `.ai/data-models.md`, `.ai/environment.md`, `.ai/integrations.md`, and README after schema cleanup.
