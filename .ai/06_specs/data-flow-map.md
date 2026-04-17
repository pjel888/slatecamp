# Data Flow Map

**Last Updated:** 2026-04-17

## Main flow types

| Flow | Typical path | Key anchors |
| --- | --- | --- |
| Learner flow | route -> query/action -> Supabase -> client UI/store | `src/app/dashboard/*`, `src/lib/actions/*`, `src/lib/queries/*` |
| Admin flow | guarded route -> admin action -> validation/compat helpers -> Supabase -> revalidation/render helpers | `src/app/admin/*`, `src/lib/actions/admin/*`, `src/components/admin/*` |
| Quiz flow | setup route -> session issuance -> entitlements/selection -> client stores -> answer/end-session actions | `src/app/quiz/*`, `src/lib/actions/quiz-v2/*`, `src/stores/useQuizStore.ts` |
| Wiki flow | route/search/sidebar -> wiki actions -> article/taxonomy joins -> published rendering | `src/app/dashboard/wiki/*`, `src/lib/actions/wiki-actions.ts`, `src/components/wiki/*` |
| Developer flow | internal route -> runtime-backed inspector or mock/status source -> UI | `src/app/developer/*`, `src/lib/actions/dev/*`, `src/lib/mocks/status.ts` |
| Payment/webhook flow | checkout route/action -> provider config -> webhook handler -> DB side effects | `src/lib/payments/*`, `src/lib/lemonsqueezy/*`, `src/lib/payrex/*`, `src/app/api/webhooks/*` |

## Current boundary cautions

- Admin uses both browser and server data access patterns, so flow reasoning must include auth and RLS context.
- Developer surfaces are not uniformly runtime-backed; some are mock or static inspection views.
- Webhook idempotency and service-role writes are privileged edges and should be treated explicitly during future audits.

## Companion docs

- `backend-system-map.md`
- `frontend-execution-model.md`
- `../00_system/data-boundary-map.md`
