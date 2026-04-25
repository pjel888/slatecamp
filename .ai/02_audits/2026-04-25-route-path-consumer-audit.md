# 2026-04-25 Route/Path Consumer Audit

## Scope
- `src/lib/routes.ts`
- hardcoded route consumers found via `Link`, `href`, `router.push`, `redirect`, notification deep links, and checkout/email redirect targets
- requested targets: `/dashboard/campfire`, `/dashboard/library`, `/dashboard/trails`, `/dashboard/settings/billing`, `/dashboard/settings/developer`, `/admin/wiki`, `/auth/reset-password`, `/quiz/full_exam/setup`

## Method
1. Read governing instructions from root `AGENTS.md`, `.ai/AGENTS.md`, `src/AGENTS.md`, `src/lib/AGENTS.md`, `src/app/AGENTS.md`, `src/components/AGENTS.md`, plus relevant subtree `AGENTS.md` files for `dashboard`, `camptrails`, `admin`, `developer`, `(auth)`, `quiz`, `components/shared`, and `components/trails`.
2. Inspect live route trees under `src/app/**` instead of trusting archived docs.
3. Cross-check each target against its route constant, live route implementation, and current consumers.

## Implementation update - 2026-04-25

This audit's launch-facing route fixes have been implemented.

- Added a real `/auth/reset-password` route and changed forgot-password email callbacks to land on it.
- Added canonical HTTP redirects in `next.config.ts` plus route-level fallback shims for `/settings`, `/dashboard/settings/billing`, `/dashboard/settings/developer`, `/dashboard/trail`, `/dashboard/trails`, `/dashboard/heatmap`, and `/admin/wiki`.
- Removed stale public route constants for dashboard Campfire, Library, Trails, nested Billing, nested Developer Settings, and admin Wiki. Legacy paths now live under `ROUTES.legacy` only where callback normalization needs them.
- Replaced live callers with current routes: `/dashboard/camptrails`, `/dashboard/settings`, `/developer`, `/dashboard/analytics`, and `/admin/knowledge`.
- Hid Library from mobile navigation and removed Campfire notification filter/preferences/dead deep-link defaults.
- Regenerated route audit evidence in `.ai/02_audits/evidence/route-manifest.json`, `.ai/02_audits/evidence/public-route-smoke.json`, and `.ai/02_audits/evidence/auth-route-browser.json`. Current manifest summary: 112 total page routes, 6 auth routes, 90 protected routes, 19 dynamic routes.

The inventory below is retained as the original finding record; use this implementation update as the current status.

## Requested target inventory

| Target | Current state | Live consumers / evidence | Recommended disposition | Notes |
| --- | --- | --- | --- | --- |
| `/dashboard/campfire` | **Missing route** — no `src/app/dashboard/campfire/*` subtree. | `src/lib/routes.ts`; `src/app/dashboard/results-day/_components/PasserFlow.tsx`; `src/types/notifications.ts` | **Hide** | The only live entry points are a results-day CTA and notification deep links. There is no implemented community surface to land on yet. |
| `/dashboard/library` | **Missing route** — no `src/app/dashboard/library/*` subtree. | `src/lib/routes.ts`; `src/components/shared/Navbar.tsx`; `src/lib/routes.ts` dynamic title prefix for `/dashboard/library/` | **Hide** | Mobile nav still exposes Library even though no student route exists. |
| `/dashboard/trails` | **Stale alias** — no `src/app/dashboard/trails/*`, but canonical Camp Trail surface lives at `src/app/dashboard/camptrails/*`. | `src/lib/routes.ts`; `src/components/dashboard/WelcomeGuide.tsx`; `src/components/trails/DashboardTrailCard.tsx`; canonical route in `src/app/dashboard/camptrails/page.tsx` | **Redirect** | Short-term safest behavior is a shim redirect to `/dashboard/camptrails`; follow-up should replace stale callers with `ROUTES.dashboard.camptrails`. |
| `/dashboard/settings/billing` | **Missing route** — only base `src/app/dashboard/settings/page.tsx` exists. | `src/lib/routes.ts`; `src/app/api/payments/checkout/route.ts`; `src/app/dashboard/3d-lab/page.tsx`; `src/lib/developer/api-reference-data.ts` | **Redirect** | Checkout success/cancel URLs and the 3D Lab upgrade CTA currently point to a dead target. Redirecting to `/dashboard/settings` is the lowest-risk stopgap until subscription management is built. |
| `/dashboard/settings/developer` | **Missing route** — no nested settings route exists; live developer portal is under `src/app/developer/*`. | `src/lib/routes.ts`; `src/components/shared/Navbar.tsx`; live destination at `src/app/developer/page.tsx` | **Redirect** | Preserve old bookmarks with a redirect to `/developer`, then remove the stale settings-path constant/link. |
| `/admin/wiki` | **Missing route** — no `src/app/admin/wiki/*` subtree. Live admin content editor is `src/app/admin/knowledge/*`. | `src/lib/routes.ts`; `src/lib/actions/admin/wiki.ts`; `src/lib/actions/admin/bulk.ts`; canonical editor at `src/app/admin/knowledge/page.tsx` | **Redirect** | The stale path still survives in `revalidatePath(ROUTES.admin.wiki)` calls. If legacy URLs must remain valid, redirect them to `/admin/knowledge`; otherwise remove the stale constant and revalidation target. |
| `/auth/reset-password` | **Missing route** — no reset-password page exists. | `src/lib/routes.ts`; forgot-password flow in `src/app/(auth)/forgot-password/page.tsx`; auth callback in `src/app/auth/callback/route.ts` | **Implement** | Password reset currently sends users through `/auth/callback?next=/settings`, but there is no recovery page and `/settings` is also stale. This needs a real recovery screen, not a cosmetic redirect. |
| `/quiz/full_exam/setup` | **Live** — served by dynamic route `src/app/quiz/[mode]/setup/page.tsx`, which explicitly allows `full_exam`. | `src/lib/routes.ts`; `src/app/quiz/[mode]/setup/page.tsx`; `src/components/testing/hub/ReviewHub.tsx` | **Keep** | This requested target is not stale in the current codebase. It should stay on the inventory as a verified-good route. |

## Additional stale targets found during the scan

| Target | Evidence | Recommended disposition | Why it matters |
| --- | --- | --- | --- |
| `/settings` | Hardcoded in `src/app/(auth)/forgot-password/page.tsx` via `redirectTo: ${window.location.origin}/auth/callback?next=/settings` | **Redirect** | After password-recovery callback, users are sent to a nonexistent top-level path instead of a real dashboard/settings or recovery route. |
| `/dashboard/trail` | `src/types/notifications.ts` default deep links for `trail_ready` and `proof_unlocked` | **Redirect** | Notification clicks can land on a dead path; canonical trail surface is `/dashboard/camptrails`. |
| `/dashboard/heatmap` | `src/types/notifications.ts` default deep links for `focus_review` and `weekly_digest` | **Redirect** | Notification clicks can land on a dead path; no live heatmap route exists under `src/app/dashboard/*`. |

## Consumer notes by surface

### Navigation/UI surfaces
- `src/components/shared/Navbar.tsx` still exposes two dead destinations: `/dashboard/library` and `/dashboard/settings/developer`.
- `src/components/dashboard/WelcomeGuide.tsx` hardcodes `/dashboard/trails` instead of the live Camp Trail surface.
- `src/components/trails/DashboardTrailCard.tsx` uses `ROUTES.dashboard.trails` for the empty-state CTA even though the live route constant beside it is `ROUTES.dashboard.camptrails`.
- `src/app/dashboard/results-day/_components/PasserFlow.tsx` points celebratory sharing into missing `/dashboard/campfire`.

### Notifications / background deep links
- `src/types/notifications.ts` currently ships dead defaults for `/dashboard/campfire`, `/dashboard/trail`, and `/dashboard/heatmap`.
- `src/lib/actions/sync-notifications.ts` already uses the live Camp Trail path (`/dashboard/camptrails/${slug}/today`), so notification generation is partially migrated while the fallback map is not.

### Checkout / upgrade flows
- `src/app/api/payments/checkout/route.ts` returns `/dashboard/settings/billing?success=true` and `/dashboard/settings/billing?cancelled=true` even though there is no billing sub-route.
- `src/app/dashboard/3d-lab/page.tsx` uses the same dead billing path for its upgrade CTA.
- `src/lib/developer/api-reference-data.ts` documents the dead billing URL, so developer docs currently reinforce the broken target.

### Admin content surface
- `src/lib/actions/admin/wiki.ts` and `src/lib/actions/admin/bulk.ts` still revalidate `ROUTES.admin.wiki` even though the live editor lives under `/admin/knowledge`.
- No current `src/app/admin/wiki/*` route tree exists, so path-based revalidation there is stale at best and misleading at worst.

## Priority order
1. **Password recovery** — implement a real reset-password completion route and stop sending users to `/settings`.
2. **Checkout/billing** — add a safe redirect for `/dashboard/settings/billing` or replace callers with `/dashboard/settings` until billing management exists.
3. **Notification dead links** — redirect `/dashboard/trail` and `/dashboard/heatmap`, and remove `/dashboard/campfire` fallbacks until Campfire exists.
4. **Navigation cleanup** — remove or replace stale navbar / welcome-guide / trail CTA targets.
5. **Legacy admin path cleanup** — retire `/admin/wiki` references in route constants and revalidation calls after a compatibility decision is made.

## Safe follow-up candidates
- Replace `ROUTES.dashboard.trails` consumers with `ROUTES.dashboard.camptrails` in `src/components/dashboard/WelcomeGuide.tsx` and `src/components/trails/DashboardTrailCard.tsx`.
- Replace `ROUTES.dashboard.settingsDeveloper` usage in `src/components/shared/Navbar.tsx` with `ROUTES.developer.root` if the mobile admin shortcut should remain.
- Replace `ROUTES.admin.wiki` path revalidation with `ROUTES.admin.knowledge` in admin content mutations once the compatibility decision is confirmed.
