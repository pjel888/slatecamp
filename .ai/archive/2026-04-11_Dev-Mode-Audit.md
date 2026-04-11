# Dev Mode Audit

## Executive Summary

The developer account was being treated like an unprivileged user in the 3D Lab and dashboard shell because role resolution was fragmented across multiple sources of truth. The 3D Lab gate depended on a profile-derived `isAdmin` flag, while the floating dev toolbar depended on dashboard-shell admin detection. Both paths missed developer identity stored in auth/profile metadata.

I fixed the issue by centralizing role resolution, recognizing developer/internal roles from auth metadata, profile rows, and legacy role rows, and then using that shared result for:

- 3D Lab tier bypass
- dashboard dev-toolbar visibility
- internal tier resolution in the dashboard shell

Normal user entitlement behavior remains intact.

## Symptoms Observed

- The developer account hit the 3D Lab paywall copy instead of the lab.
- The UI copy shown was:
  - `3D Interactive Lab`
  - `Explore building components, structural systems, and design concepts in three dimensions. Available for Camp, Insurance, and Institutional subscribers.`
- The floating dev mode widget was absent from the dashboard shell.
- Non-developer users still needed to remain gated normally.

## Root Cause Analysis

### 1. Role resolution ignored developer identity in auth/profile metadata

Before the fix, `src/lib/admin/roles.ts` only recognized roles from:

- `user_roles`
- legacy admin email allowlist

It did not resolve roles from:

- `user.app_metadata.role`
- `user.user_metadata.role`
- `profiles.role`

That meant a developer account stored as `developer` in auth metadata or profile data resolved to `null`, which cascaded into restricted behavior.

### 2. 3D Lab access used a broken admin proxy

`src/app/dashboard/3d-lab/page.tsx` gates access with:

- `getAdminAwareProfile()`
- `hasTierAccess("pro", profile.tier, profile.isAdmin, flags)`

But `profile.isAdmin` was derived from the broken role helper. If the role was not found in `user_roles`, the developer account looked like a free user and hit the paywall.

### 3. The floating dev widget was mounted behind the wrong access check

`src/components/dashboard/DashboardLayoutContent.tsx` only mounted:

- `DevToolbar`
- `DevKeyboardProvider`

when `showDevTools` was true. That condition was effectively admin-only and did not recognize developer/internal roles from auth metadata. The widget was not hidden by CSS or off-screen. It was not rendered at all.

### 4. The app had split sources of truth for privileged access

Different parts of the app used different access rules:

- dashboard shell: `user.app_metadata.role === 'admin'` or email heuristics
- developer portal layout: `getUserRole()` truthiness
- 3D Lab: `getAdminAwareProfile().isAdmin`
- admin routes: `user_roles` / `canReviewContent()`

That split made the same user appear privileged in one area and unprivileged in another.

### 5. The testing surfaces had their own tier and bypass logic

Beyond 3D Lab, the testing stack had parallel entitlement logic:

- `src/app/dashboard/drills/page.tsx` passed raw subscription tier into the client hub
- `src/components/testing/hub/ReviewHub.tsx` inferred paid access from `NODE_ENV` and raw tier
- `src/lib/actions/quiz-v2/start-session.ts` used its own local `NODE_ENV` bypass for Pro-only modes
- `src/lib/actions/quiz-v2/get-review-data.ts` used a separate raw paid-tier check for Pro-only review enrichments

These were the same class of issue:

- server/client mismatch
- environment-driven bypasses
- raw tier checks detached from the canonical effective-tier path

## End-to-End Entitlement Flow

### Before

`Supabase auth session`
-> `auth user metadata / profile role / user_roles`
-> `getUserRole()` only checked `user_roles` + legacy admin emails
-> developer identity resolved to `null`
-> `getAdminAwareProfile().isAdmin` became `false`
-> `getEffectiveTier()` stayed at the DB tier
-> `hasTierAccess("pro", ...)` failed
-> 3D Lab showed the paywall

### After

`Supabase auth session`
-> `auth user metadata / profile role / user_roles`
-> `getUserRole()` resolves the strongest recognized role across metadata, profile, and legacy role rows
-> developer/internal role is recognized
-> explicit policy helpers decide:
  - dev-toolbar visibility
  - internal tier bypass
-> `getAdminAwareProfile().hasInternalTierBypass` becomes `true` for allowed internal/dev roles
-> `getEffectiveTier()` resolves to institutional for dev-tool access
-> `hasTierAccess("pro", ...)` passes
-> 3D Lab renders normally

The same effective-tier path now also drives:

- drills hub paid-mode visibility
- simulation readiness bypass for allowed internal roles
- Pro-only quiz session start checks
- Pro-only quiz review enrichments

### 3D Lab access definition

Defined in:

- `src/lib/dev/dev-mode.ts` via `TIER_CAPABILITIES.threeDLabAccess`
- `src/lib/admin/feature-flags.ts` via `hasTierAccess()`
- `src/app/dashboard/3d-lab/page.tsx` via the page gate

Allowed tiers in the capability matrix:

- `pro`
- `prime`
- `institutional`
- `enterprise`

The page gate requires at least `pro`, which is the canonical entitlement check used by the app.

## End-to-End Dev Widget Visibility Flow

### Before

`dashboard layout`
-> `isAdmin()` from `src/lib/admin/roles.ts`
-> only recognized `user_roles` admin roles
-> developer account not recognized
-> `showDevTools` false
-> `DevToolbar` and `DevKeyboardProvider` not mounted
-> widget missing

### After

`dashboard layout`
-> `getUserRole()` resolves internal/developer roles from metadata/profile/roles
-> `canSeeDevToolbar()` filters to the internal/dev set
-> `showDevTools` true for developer/internal users
-> `DevToolbar` mounts in the persistent dashboard shell
-> widget appears again with the correct floating position

### Visibility conclusion

The widget was not a CSS/z-index bug. It was a render-condition bug.

## Relevant Files Reviewed

- `middleware.ts`
- `src/app/layout.tsx`
- `src/components/dev/dev-mode-overlay.tsx`
- `src/components/dev/dev-toolbar.tsx`
- `src/components/dev/demo-shell.tsx`
- `src/components/dashboard/DashboardLayoutContent.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/3d-lab/page.tsx`
- `src/app/dashboard/3d-lab/[moduleId]/page.tsx`
- `src/app/dashboard/drills/page.tsx`
- `src/app/quiz/[mode]/setup/client.tsx`
- `src/lib/admin/feature-flags.ts`
- `src/lib/admin/get-admin-profile.ts`
- `src/lib/admin/roles.ts`
- `src/lib/admin/access-policy.ts`
- `src/lib/admin/is-admin.ts`
- `src/lib/actions/quiz-v2/start-session.ts`
- `src/lib/actions/quiz-v2/get-review-data.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/developer/layout.tsx`
- `src/app/admin/layout.tsx`
- `src/lib/dev/dev-mode.ts`
- `src/lib/actions/admin/roles.ts`
- `src/components/wiki/widgets/Lab3DWidget.tsx`
- `src/components/testing/hub/ReviewHub.tsx`
- `src/features/3d-lab/gate-copy.ts`

## Relevant Files Changed

- `src/lib/admin/roles.ts`
- `src/lib/admin/access-policy.ts`
- `src/lib/admin/get-admin-profile.ts`
- `src/components/dashboard/DashboardLayoutContent.tsx`
- `src/app/dashboard/3d-lab/page.tsx`
- `src/app/dashboard/3d-lab/[moduleId]/page.tsx`
- `src/features/3d-lab/gate-copy.ts`
- `src/components/3d/Workspace.tsx`
- `src/app/dashboard/drills/page.tsx`
- `src/components/testing/hub/ReviewHub.tsx`
- `src/lib/actions/quiz-v2/start-session.ts`
- `src/lib/actions/quiz-v2/get-review-data.ts`
- `src/app/quiz/[mode]/setup/client.tsx`
- `src/lib/admin/roles.test.ts`
- `src/lib/admin/access-policy.test.ts`
- `src/features/3d-lab/gate-copy.test.ts`
- `src/lib/admin/is-admin.ts`

## Before vs After Behavior

### Before

- Developer account could not enter the 3D Lab.
- The paywall copy appeared instead of the lab.
- The floating dev widget was not mounted.
- Internal role detection differed across server components and layout code.

### After

- Developer account can access the 3D Lab.
- Entitled subscriber tiers still retain access.
- Non-entitled users remain gated.
- The dev widget renders again for internal/developer users.
- Shared role resolution now drives both server-side gating and dashboard-shell visibility.
- Drills and quiz surfaces now use the same internal-bypass and effective-tier model instead of local `NODE_ENV` heuristics.

## Config and Env Dependencies Discovered

- `NEXT_PUBLIC_SUPABASE_URL`
  - Controls connected vs local mode through `getConnectionState()`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Used for the regular SSR client.
- `SUPABASE_SERVICE_ROLE_KEY`
  - Used for dev-force and admin client paths.
- `DEV_FORCE_USER_ID`
  - Development-only impersonation bypass; grants `super_admin` locally.
- `ADMIN_EMAILS`
  - Legacy super-admin fallback in the role resolver.
- `ALLOW_DEV_PORTAL_BYPASS`
  - Developer portal bypass for local development.
- `cerebro_dev_flags` cookie
  - Stores dev flag overrides for the dashboard shell.
- `NEXT_PUBLIC_APP_URL`
  - Affects metadata base and environment behavior.

## Supabase-Specific Findings

- `user_roles` only stores:
  - `super_admin`
  - `content_admin`
  - `sme_reviewer`
- `profiles.role` exists and is used by other portal logic, including CEO access.
- `auth.users.app_metadata.role` is also used in some dashboard code paths.
- Because `developer` is not a valid `user_roles.role`, the developer identity must be resolved from metadata/profile claims, not only from `user_roles`.
- `middleware.ts` refreshes the session and injects `x-pathname`, which the dashboard shell uses for pathname-aware onboarding guards.

## Server/Client Mismatch Findings

- Server-side 3D Lab access and dashboard-shell dev-tool visibility were using different role sources.
- Drills and quiz paths had independent tier logic that bypassed the canonical effective-tier flow.
- Client-side `DevToolbar` state was fine; the issue was whether it got mounted.
- `getFeatureFlags()` and `getAdminAwareProfile()` were aligned only after role resolution was centralized.
- `ReviewHub` was also using a client-side `NODE_ENV` shortcut for paid/simulation behavior, which has now been removed in favor of server-derived props.
- No evidence pointed to a hydration bug, hidden overlay, or off-screen widget. The bug was upstream of rendering.

## Risk Assessment

- **Primary risk:** role precedence conflicts if a user has multiple internal indicators across auth metadata, profile rows, and `user_roles`.
  - Mitigation: the resolver now picks the strongest recognized role.
- **Secondary risk:** policy now explicitly treats `super_admin`, `content_admin`, `developer`, `admin`, and `ceo` as internal-dev roles for toolbar and internal tier bypass surfaces.
  - If product policy should narrow that list, update the helper in one place.
- **Policy boundary:** `sme_reviewer` remains excluded from dev-toolbar and internal tier bypass access.
  - Reason: review capability is not equivalent to platform-debug capability.
- **Low risk to normal users:** free users still resolve to `null` and remain gated.

## Validation Steps Performed

Executed successfully:

- `bun test src/lib/admin/roles.test.ts`
- `bun test src/lib/admin/access-policy.test.ts`
- `bun test src/features/3d-lab/gate-copy.test.ts`
- `bun run type-check`
- `bunx eslint src/lib/admin/roles.ts src/lib/admin/get-admin-profile.ts src/components/dashboard/DashboardLayoutContent.tsx src/lib/admin/roles.test.ts src/lib/admin/is-admin.ts`
- `bun run build`

Notes:

- `bun run lint` fails in unrelated preexisting repo areas (`flowbite/` and generated Storybook/static assets). The touched files themselves lint cleanly.
- The targeted verification scope now includes 3D Lab, drills hub, quiz-session start, quiz review enrichment, and quiz setup error messaging.

## Recommended Follow-up Improvements

- Consolidate all privileged-role checks into a single `getUserRole()` / `hasDevToolAccess()` surface.
- Replace remaining ad hoc checks like `user.app_metadata.role === 'admin'` with shared helpers.
- Continue migrating entitlement-sensitive pages toward explicit policy helpers plus server-derived effective tier props.
- Consider adding an explicit `developer` access policy if the role should differ from other internal roles.
- Extract broader pricing/gate copy only if more feature gates clearly need the same abstraction; for now it should remain 3D-Lab-local.

## Open Questions

- Should `sme_reviewer` also be treated as an internal-dev role for the floating toolbar?
  - Current implementation excludes it intentionally.
- Should the same explicit policy-module pattern be applied to non-testing paid surfaces like pods and other feature-specific Pro gates?
  - They were reviewed as part of the scan but were not required to fix this regression set.
