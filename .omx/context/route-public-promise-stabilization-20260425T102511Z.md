# Route Public Promise Stabilization

## Task

Fix launch-facing dead routes and stale public promises identified in `.ai/02_audits`.

## Desired Outcome

- `/auth/reset-password` exists and the password reset email callback lands there.
- Legacy or stale user-facing routes redirect to current surfaces.
- Navigation and notification surfaces stop promising unsupported Library and Campfire experiences.
- Route constants prefer current destinations such as `/dashboard/camptrails`, `/dashboard/settings`, `/developer`, and `/admin/knowledge`.

## Known Evidence

- `src/lib/routes.ts` already defines `ROUTES.auth.resetPassword`.
- `src/app/(auth)/forgot-password/page.tsx` still redirects password reset flow to `/auth/callback?next=/settings`.
- `src/components/shared/Navbar.tsx` links to `/dashboard/library` even though no route exists.
- `src/components/dashboard/WelcomeGuide.tsx` and `src/components/trails/DashboardTrailCard.tsx` still reference stale trails URLs.
- Notification types and UI still expose Campfire filters/preferences/deep links.

## Constraints

- Pre-launch MVP: no backward compatibility requirement beyond safe redirects for already-published paths.
- Keep database/schema cleanup out of this route pass.
- Avoid destructive changes and preserve existing unrelated dirty worktree changes.
- Use server redirects for legacy shims.

## Likely Touchpoints

- `src/app/auth/reset-password/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/dashboard/**/page.tsx`
- `src/app/admin/wiki/page.tsx`
- `src/components/shared/Navbar.tsx`
- `src/components/dashboard/WelcomeGuide.tsx`
- `src/components/trails/DashboardTrailCard.tsx`
- `src/components/notifications/*`
- `src/types/notifications.ts`
- `src/lib/routes.ts`

## Open Questions

- Whether `/dashboard/heatmap` should redirect to analytics or dashboard root. Use analytics because it is the closest current destination for review/insight promises.
