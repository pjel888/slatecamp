# Ralph Context Snapshot: Audit Remediation Production Hardening

Timestamp: 2026-04-25T12:10:20Z

## Task Statement

Implement the production-grade remediation set from `docs/product-ux-ui-feature-audit.md`, especially the top five critical issues:

1. Keep payments disabled or repair billing end-to-end.
2. Remove or gate `/test-3d`.
3. Make release gates green.
4. Add first-run activation from onboarding into the first useful study action.
5. Add production controls to settings/admin workflows.

## Desired Outcome

The app should be materially closer to beta/production readiness without adding new unfinished product surface. Changes should favor safety, honest UX, clear account/onboarding flows, and verifiable release gates.

## Known Facts / Evidence

- Current audit file: `docs/product-ux-ui-feature-audit.md`.
- Route manifest evidence: `.ai/02_audits/evidence/route-manifest.json` reports 112 routes: 90 protected, 15 public, 6 auth, 1 admin login.
- `src/app/test-3d/page.tsx` renders 3D Lab components directly.
- Dashboard 3D module route uses `getViewerEntitlements`.
- Payments are disabled by feature flag, but provider/webhook code remains present.
- `bun run check:entitlements` previously failed.
- `bun audit` previously failed with dependency advisories.
- `git diff --check` previously failed on a trailing-space line in `.ai/06_specs/deep/03-design/001-design-system.md` from an earlier design-doc lane.

## Constraints

- The worktree is already dirty with user/prior-agent changes; do not revert unrelated work.
- Use Bun for scripts.
- Read nearest `AGENTS.md` before editing affected subtrees.
- Do not perform destructive database operations.
- Do not expose secrets or production data.
- Prefer MVP/current behavior over legacy compatibility.
- Keep edits scoped and verifiable.

## Unknowns / Open Questions

- Whether billing should be fully repaired now or kept safely disabled. Conservative path: keep disabled, harden code to fail closed, and add visible billing status until full provider launch is intentionally scoped.
- Exact current failures for entitlements/audit/build need fresh verification after code inspection.
- Admin hardening may require targeted safety improvements rather than full editor decomposition in one pass.

## Likely Codebase Touchpoints

- `src/app/test-3d/page.tsx`
- `src/app/dashboard/3d-lab/[moduleId]/page.tsx`
- `src/lib/payments/*`
- `src/lib/payrex/*`
- `src/lib/lemonsqueezy/*`
- `src/app/api/webhooks/*`
- `src/app/(auth)/onboarding/*`
- `src/components/dashboard/WelcomeGuide.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/settings/*`
- `src/components/settings/*`
- `src/app/admin/*`
- `src/components/admin/*`
- `scripts/check-entitlement-legacy-usage.ts`
- `package.json`
- `.ai/00_system/VALIDATION_MATRIX.md`
- `docs/product-ux-ui-feature-audit.md`
