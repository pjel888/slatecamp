# Entitlement Migration Ledger

| Legacy Path | Status | Replacement Path | Remaining Consumers | Removal Gate |
| --- | --- | --- | --- | --- |
| `src/lib/admin/roles.ts` | wrapped | `src/lib/entitlements/resolve-role.ts` | broad repo usage | All callers migrated to canonical resolver or compatibility wrapper only |
| `src/lib/admin/access-policy.ts` | wrapped | `src/lib/entitlements/policy.ts` | dashboard, dev tooling | All policy checks route through canonical policy helpers |
| `src/lib/admin/feature-flags.ts` | wrapped | `src/lib/entitlements/dev-overrides.ts` + `src/lib/entitlements/resolve-entitlements.ts` | dashboard, 3d-lab, quiz-v2 | No production surface calls legacy tier helper directly |
| `src/lib/admin/get-admin-profile.ts` | wrapped | `src/lib/entitlements/get-viewer-entitlements.ts` | settings compatibility | No consumer requires admin-aware shape directly |
| `src/lib/paywall/check-access.ts` | wrapped | `src/lib/entitlements/resolve-entitlements.ts` | paywall callers | All paywall checks use canonical access decisions |
| `src/lib/subscription/get-tier.ts` | wrapped | `src/lib/entitlements/get-viewer-entitlements.ts` | unknown | No privilege gating depends on raw tier helper |
| `src/lib/actions/feature-flags.ts` | wrapped | `src/lib/entitlements/dev-overrides.ts` | legacy action callers | All cookie-backed override reads use canonical override reader |
| Raw `feature_flags.target_tier` reads | migrated_runtime | `src/lib/entitlements/normalize-feature-flag.ts` | DB select remains in `get-viewer-entitlements.ts` | Storage backfill migration applied and direct product/runtime reads remain zero |
| Raw `sub?.tier === 'free'` checks | partial | `src/lib/entitlements/resolve-entitlements.ts` | `blindspot-scan`, `payments/checkout`, `MobileDrawer`, `final-stretch` | Repo guard baseline shrinks to zero remaining product/runtime consumers |
| `getUserRole()` truthiness gating | migrated | `src/lib/entitlements/policy.ts` | none in privileged route/layout paths touched here | No privileged route/layout gates on truthiness alone |
