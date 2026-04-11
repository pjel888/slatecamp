# Entitlement Migration Ledger

| Legacy Path | Status | Replacement Path | Remaining Consumers | Removal Gate |
| --- | --- | --- | --- | --- |
| `src/lib/admin/roles.ts` | wrapped | `src/lib/entitlements/resolve-role.ts` | broad repo usage | Optional future import cleanup only |
| `src/lib/admin/access-policy.ts` | wrapped | `src/lib/entitlements/policy.ts` | tests and compatibility exports | Optional future import cleanup only |
| `src/lib/admin/feature-flags.ts` | removed | `src/lib/entitlements/dev-overrides.ts` + `src/lib/entitlements/resolve-entitlements.ts` | none | complete |
| `src/lib/admin/get-admin-profile.ts` | removed | `src/lib/entitlements/get-viewer-entitlements.ts` | none | complete |
| `src/lib/paywall/check-access.ts` | removed | `src/lib/entitlements/resolve-entitlements.ts` | none | complete |
| `src/lib/subscription/get-tier.ts` | removed | `src/lib/entitlements/get-viewer-entitlements.ts` | none | complete |
| `src/lib/actions/feature-flags.ts` | removed | `src/lib/entitlements/dev-overrides.ts` | none | complete |
| Raw `feature_flags.target_tier` reads | migrated_storage | `src/lib/entitlements/normalize-feature-flag.ts` | DB read remains in `get-viewer-entitlements.ts` only | complete |
| Raw `sub?.tier === 'free'` checks | removed | `src/lib/entitlements/resolve-entitlements.ts` | none in runtime/product code under `src` | complete |
| `getUserRole()` truthiness gating | migrated | `src/lib/entitlements/policy.ts` | none in privileged route/layout paths | complete |
| CEO auth/profile-only role checks | removed | `src/lib/entitlements/resolve-role.ts` + `src/lib/entitlements/policy.ts` | none in CEO layout/auth helpers | complete |
| DAE raw subscription-tier narrowing | removed | `src/lib/entitlements/get-viewer-entitlements.ts` | none in DAE mode state/session paths | complete |
| CEO revenue tier misclassification for `prime` / `institutional` | removed | canonical `UserTier` mapping in `src/lib/queries/ceo/financial-queries.ts` | none in revenue breakdown path | complete |
