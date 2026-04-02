<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# admin

## Purpose

The `admin` directory contains admin-specific utility functions: role checking, permission gates, admin profile retrieval, and feature flag management. Used to gate admin-only features (content review, user impersonation, analytics dashboards) and enforce role-based access control across the application.

## Key Files

| File | Description |
|------|-------------|
| `is-admin.ts` | Re-exports from `roles.ts` + legacy email-based `isAdminByEmail()` check for backward compatibility |
| `roles.ts` | Core role system: `isAdmin()`, `isSuperAdmin()`, `canManageContent()`, `canReviewContent()`, `getUserRole()`, `UserRole` enum |
| `get-admin-profile.ts` | Fetch admin user profile from Supabase: name, email, role, permissions, last activity |
| `feature-flags.ts` | Admin feature flags: check if feature is enabled for user by feature key |

## For AI Agents

### Working In This Directory

**Role System (CRITICAL):**
- Admin roles: `admin`, `super_admin`, `reviewer`, `content_manager`.
- Roles stored in auth metadata (Supabase auth.users → raw_app_meta_data) or inferred from email domain (@slatecamp.com).
- `getUserRole()` returns the strongest role for a user.
- `isAdmin()` = user has `admin` or `super_admin` role.
- `isSuperAdmin()` = user has `super_admin` role only.
- `canManageContent()` = `admin` or `content_manager`.
- `canReviewContent()` = `admin`, `super_admin`, or `reviewer`.

**Feature Flags:**
- Stored in Supabase `feature_flags` table: {key, enabled, admin_only, rollout_percentage}.
- `admin_only=true` → only admins can use.
- `rollout_percentage=50` → enabled for 50% of non-admin users (random seed by user ID).
- Check before rendering admin features or experimental endpoints.

**Admin Profile:**
- Fetched server-side only (no direct client-side access to admin metadata).
- Used for audit logs: "Reviewed by Admin Name".
- Includes last activity timestamp for admin dashboard.

**Backward Compatibility:**
- `isAdminByEmail()` checks if email ends with `@slatecamp.com` or is in `ADMIN_EMAILS` env var (comma-separated).
- Deprecated—use `getUserRole()` instead.

### Common Patterns

**Checking Admin Status (Server Action):**
```typescript
'use server'

import { isAdmin, canManageContent } from '@/lib/admin'

export const adminOnlyAction = async () => {
  if (!await isAdmin()) {
    throw new Error('Unauthorized: admin role required')
  }
  // Proceed with admin-only logic
}
```

**Checking Specific Permission:**
```typescript
import { canReviewContent } from '@/lib/admin'

if (await canReviewContent()) {
  // Show content review queue
}
```

**Getting Admin Role:**
```typescript
import { getUserRole } from '@/lib/admin'

const role = await getUserRole()
// role: 'admin' | 'super_admin' | 'reviewer' | 'content_manager' | 'user'
```

**Feature Flag Check:**
```typescript
import { isFeatureEnabled } from '@/lib/admin'

const showBetaUI = await isFeatureEnabled('beta_ui_v2')
if (showBetaUI) {
  return <BetaUI />
}
```

**Admin Profile (Server-side only):**
```typescript
'use server'

import { getAdminProfile } from '@/lib/admin'

const profile = await getAdminProfile()
// { id, email, fullName, role, lastActivity }
```

## Dependencies

### Internal

- **Supabase:** Database queries for feature flags and user metadata (in Server Actions).
- **Auth:** Current user from `getUser()` (via Supabase auth context).
- **Env vars:** `ADMIN_EMAILS` (comma-separated list of additional admin emails).

### External

- **Supabase auth:** User metadata stored in `raw_app_meta_data` JSON field.
- **Environment variables:** `ADMIN_EMAILS` (optional, for legacy email-based admin checks).

---

**Last Updated:** 2026-04-02

**For role management questions, consult `.claude/agents/` in the repository root.**
