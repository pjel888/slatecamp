# 05 — Test and Validation Matrix

## Baseline unit/integration tests

| Area | Command | What it proves |
| --- | --- | --- |
| Role precedence | `bun test src/lib/entitlements/resolve-role.test.ts` | Canonical role source ordering and dev override behavior. |
| Middleware route authorization | `bun test src/lib/entitlements/middleware-authorization.test.ts src/lib/supabase/middleware.test.ts` | `/admin`, `/developer`, `/ceo`, login redirects, and middleware failure behavior. |
| Admin wrappers/policy | `bun test src/lib/admin/roles.test.ts src/lib/actions/admin/roles.test.ts` | Admin role facade behavior and role mutation actions. |
| Feature flag normalization | `bun test src/lib/entitlements/normalize-feature-flag.test.ts src/lib/entitlements/resolve-entitlements.test.ts src/lib/entitlements/final-stretch.test.ts` | Tier normalization and feature decision behavior. |
| Editor status | `bun test src/lib/admin/editor-workflow.test.ts src/lib/actions/admin/pipeline.test.ts src/lib/actions/admin/content.test.ts src/lib/actions/admin/wiki.test.ts` | Canonical/legacy status handling and admin content status writes. |
| Entitlement guard | `bun run check:entitlements` | No unauthorized legacy entitlement usage outside canonical boundaries. |
| Launch DB cleanup readiness | `bun run check:auth-cleanup-readiness` | Service-role launch data check for removed/empty `feature_flags.target_roles`, canonical `target_tier` values, absence of legacy review statuses, and absence of legacy subscription tiers. |

## E2E lanes for implementation wave

| Lane | Command | Why required |
| --- | --- | --- |
| Restricted access | `bun run test:e2e:auth-demo:restricted` | Catches accidental privileged route exposure or bad redirects. |
| Content admin | `bun run test:e2e:auth-demo:admin-content-admin` | Catches CMS permission regressions. |
| SME reviewer | `bun run test:e2e:auth-demo:admin-sme-reviewer` | Catches reviewer least-privilege regressions. |
| Developer | `bun run test:e2e:auth-demo:admin-developer` | Catches developer tooling/admin boundary drift. |
| CEO portal | `bun run test:e2e:auth-demo:ceo-portal` | Catches CEO/super-admin portal access regressions. |
| Portals | `bun run test:e2e:auth-demo:portals` | Broad role portal smoke after policy changes. |

## Build/static validation

| Command | Required when |
| --- | --- |
| `bun run type-check` | Always after source/schema/type edits. |
| `bun run lint` | Always after source/test/script/doc workflow edits. |
| `bun run build` | Required for route/layout/server-action auth changes. |
| `git diff --check` | Always before completion. |
| `npx gitnexus detect-changes --repo slatecamp` | Before commit/finalization after implementation. |

## Data checks required before schema-sensitive changes

These checks may need local Supabase or production-like read access. Do not fake them.

| Check | Purpose |
| --- | --- |
| Confirm `feature_flags.target_roles` is removed or empty. | Proves role-targeted feature flags are absent and schema deletion is safe. |
| Count `feature_flags.target_tier` values outside canonical tiers. | Proves legacy tier normalization can be retired. |
| Count `wiki_articles.status IN ('review', 'pending_review')`. | Proves old review status rows are gone or need read compatibility. |
| Count `wiki_ei_prompts.status IN ('review', 'pending_review')`. | Proves old EI prompt review status rows are gone or need read compatibility. |
| Count `user_subscriptions.tier IN ('camp', 'insurance')`. | Proves legacy tier normalization can be retired globally. |
| Confirm `wiki_articles_status_check` allows `in_review`. | Proves canonical writes do not need fallback. |
| Confirm generated `src/types/supabase.ts` matches current DB. | Prevents schema/type drift during column cleanup. |

Repeatable command:

```bash
bun run check:auth-cleanup-readiness
```

This command must pass before and after deleting schema columns/types or removing legacy tier/status read normalization.

## Manual smoke checklist

Use after automated checks pass:

- Log in as content admin; open admin dashboard; access content editor; move article to review.
- Log in as SME reviewer; open reviews; confirm content creation/manage actions are blocked.
- Log in as developer; open developer console; confirm admin CMS access follows policy.
- Log in as normal member; confirm `/admin`, `/developer`, and `/ceo` redirect/deny correctly.
- Confirm entitlement-gated surfaces still render: quiz, 3D Lab gate, dashboard, settings.

## Coverage gap to close before implementation

Current tests cover many units, but the implementation should add/adjust tests for:

- canonical feature flag tier behavior after `target_roles` removal.
- canonical-only `in_review` write/read behavior after DB readiness is proven.
- route/layout behavior after replacing `getUserRole()` in `src/app/admin/layout.tsx` and `src/app/admin/page.tsx`.


## Guard blocker discovered and resolved during preparation

`bun run check:entitlements` originally failed with:

```text
scripts/playwright-run.ts:176 [direct-dev-force-usage] Direct entitlement-affecting env usage is banned outside the canonical boundary.
```

That blocker was resolved by explicitly allowlisting `scripts/playwright-run.ts` as a Playwright-only real-DB E2E harness. The implementation wave must still keep `bun run check:entitlements` green before claiming auth/entitlement cleanup readiness.
