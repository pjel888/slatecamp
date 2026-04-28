# RBAC Audit and Plan

**Last Updated:** 2026-04-27

## Current Authorization Model

### Auth Provider
- **Supabase Auth** (OAuth + email/password)
- Session managed via `@supabase/ssr` cookies
- Middleware refreshes session on every request

### Role Resolution Chain

Precedence (highest to lowest):
1. **Dev force user** (`DEV_FORCE_USER_ID`) → resolves to `owner`
2. **`user_roles` table** → strongest role by priority
3. **`profiles.role` column** → fallback
4. **Auth `app_metadata.role`** → fallback
5. **Auth `user_metadata.role`** → fallback
6. **Email fallback** (`OWNER_EMAILS` → `owner`; `ADMIN_EMAILS` → `super_admin`)
7. **Default:** authenticated → `member`; anonymous → `anonymous`

Evidence: `src/lib/entitlements/resolve-role.ts`

### Canonical Roles

| Role | Priority | Admin Access | CEO Access | Dev Portal |
|------|----------|--------------|------------|------------|
| `owner` | 10 | Yes | Yes | Yes |
| `super_admin` | 6 | Yes | Yes | Yes |
| `content_admin` | 5 | Yes | No | Yes |
| `admin` | 4 | Yes | No | Yes |
| `developer` | 4 | Yes | No | Yes |
| `ceo` | 4 | Yes | Yes | Yes |
| `sme_reviewer` | 3 | Yes (read-only-ish) | No | No |
| `member` | 1 | No | No | No |
| `anonymous` | 0 | No | No | No |

Evidence: `src/lib/entitlements/resolve-role.ts`, `src/lib/entitlements/policy.ts`

### Current Admin Capabilities

| Capability | Allowed Roles | Evidence |
|------------|---------------|----------|
| `adminCms` | `owner`, `super_admin`, `content_admin`, `sme_reviewer`, `admin`, `developer`, `ceo` | `src/lib/entitlements/policy.ts` |
| `canManageContent` | `owner`, `super_admin`, `content_admin`, `admin`, `developer`, `ceo` | `src/lib/entitlements/policy.ts` |
| `canReviewContent` | Same as `adminCms` | `src/lib/entitlements/policy.ts` |
| `canManageUsers` | `owner`, `super_admin` | `src/lib/entitlements/policy.ts` |
| `ceoPortal` | `owner`, `super_admin`, `ceo` | `src/lib/entitlements/policy.ts` |
| `devToolbar` | `owner`, `super_admin`, `content_admin`, `developer`, `admin`, `ceo` | `src/lib/entitlements/policy.ts` |

### Protection Layers

| Layer | What it checks | Where |
|-------|----------------|-------|
| Middleware | `canAccessAdminCmsForRole()` | `src/lib/supabase/middleware.ts` |
| Layout | `canReviewContent()`, `getUserRole()` | `src/app/admin/layout.tsx` |
| Page | `canManageContent()`, `isSuperAdmin()`, `isAdmin()` | Various `page.tsx` |
| Server Action | `canManageContent()`, `canReviewContent()`, `canManageUsers()` | `src/lib/actions/admin/*.ts` |

### Database-Level Constraints

- `user_roles.role` has CHECK constraint: `('owner', 'super_admin', 'content_admin', 'sme_reviewer', 'admin', 'developer', 'ceo')`
- RLS on `user_roles`: Only `is_super_admin()` can manage rows
- `profiles.role` has no DB-level enum constraint
- CEO tables have `is_ceo_or_super_admin()` RLS policy

Evidence: `DATABASE_SCHEMA.sql`

### Hardcoded Values

| Value | Location | Risk |
|-------|----------|------|
| `@slatecamp.com` domain in `isAdminByEmail()` | `src/lib/admin/is-admin.ts` | Medium |
| `OWNER_EMAILS` env → `owner` role | `src/lib/entitlements/resolve-role.ts` | Low (env-based) |
| `ADMIN_EMAILS` env → `super_admin` role | `src/lib/entitlements/resolve-role.ts` | Low (env-based) |
| `DEV_FORCE_USER_ID` → `owner` in dev | `src/lib/entitlements/resolve-role.ts` | Low (dev-only) |

---

## RBAC Gaps

### Gap 1: No Fine-Grained Permissions
**Severity:** Critical

Current model uses 4 coarse capabilities for all admin functions. There is no way to grant "view audit log" without also granting "manage users" or "manage content".

**Evidence:** `src/lib/entitlements/policy.ts`

### Gap 2: `/admin/settings` is Super-Admin Only
**Severity:** High

Role management is locked behind `isSuperAdmin()`. CEO users cannot manage admin roles even though they have `ceoPortal` access.

**Evidence:** `src/app/admin/settings/page.tsx`

### Gap 3: No Audit Logging for Role Changes
**Severity:** Medium

`assignRole()` and `revokeRole()` in `src/lib/actions/admin/roles.ts` do not write to `audit_logs`.

**Evidence:** `src/lib/actions/admin/roles.ts`

### Gap 4: `profiles.role` Fallback
**Severity:** Low

When `user_roles` table is unavailable (RLS denied), the system falls back to `profiles.role`. This creates two sources of truth.

**Evidence:** `src/lib/actions/admin/roles.ts`

### Gap 5: CEO Role Assignment Modal Excludes `ceo`
**Severity:** Medium

The CEO `RoleAssignmentModal` allows assigning `super_admin`, `admin`, `lead`, `member`, `consultant`, `viewer` but NOT `ceo`.

**Evidence:** `src/components/ceo/RoleAssignmentModal.tsx`

### Gap 6: Legacy `isAdminByEmail()` Still Present
**Severity:** Medium

Deprecated function with hardcoded domain still exists and could be called by legacy code.

**Evidence:** `src/lib/admin/is-admin.ts`

---

## Proposed RBAC Architecture

### Principles
1. **Deny by default** — every admin action requires an explicit permission.
2. **Server-side enforcement** — client-side UI gates are for UX only, not security.
3. **CEO control plane** — `/ceo` manages admin roles; `/admin` enforces them.
4. **Audit everything** — all permission changes and sensitive admin actions are logged.
5. **Least privilege** — roles receive only the permissions they need.

### Proposed Roles

| Role | Purpose | Derived From |
|------|---------|--------------|
| `owner` | Full system access | Existing |
| `super_admin` | Full admin access + user management | Existing |
| `ceo` | Business analytics + admin role management | Existing |
| `admin_manager` | Can manage users and roles, but not all content | **New** |
| `content_admin` | Full content management | Existing |
| `content_editor` | Can create/edit content, cannot publish/approve | **New** |
| `sme_reviewer` | Can review and approve content | Existing |
| `read_only_admin` | Can view admin data, cannot mutate | **New** |
| `developer` | Dev portal + admin read access | Existing |

### Proposed Permissions

| Permission Key | Label | Description | Default Roles |
|----------------|-------|-------------|---------------|
| `admin.access` | Access Admin Portal | Can enter `/admin` routes | `owner`, `super_admin`, `ceo`, `admin_manager`, `content_admin`, `content_editor`, `sme_reviewer`, `read_only_admin`, `developer` |
| `admin.dashboard.view` | View Dashboard | Can view admin dashboard | All admin roles |
| `admin.content.view` | View Content | Can view articles and questions | All admin roles |
| `admin.content.create` | Create Content | Can create articles and questions | `owner`, `super_admin`, `content_admin`, `content_editor` |
| `admin.content.edit` | Edit Content | Can edit articles and questions | `owner`, `super_admin`, `content_admin`, `content_editor` |
| `admin.content.delete` | Delete Content | Can delete articles and questions | `owner`, `super_admin`, `content_admin` |
| `admin.content.publish` | Publish Content | Can publish articles | `owner`, `super_admin`, `content_admin`, `sme_reviewer` |
| `admin.content.approve` | Approve Content | Can approve review queue items | `owner`, `super_admin`, `content_admin`, `sme_reviewer` |
| `admin.content.import` | Import Content | Can bulk import questions | `owner`, `super_admin`, `content_admin` |
| `admin.taxonomy.manage` | Manage Taxonomy | Can edit taxonomy tree | `owner`, `super_admin`, `content_admin` |
| `admin.assets.manage` | Manage Assets | Can upload and manage 3D assets | `owner`, `super_admin`, `content_admin` |
| `admin.pipeline.manage` | Manage Pipeline | Can move articles through pipeline | `owner`, `super_admin`, `content_admin`, `sme_reviewer` |
| `admin.reviews.view` | View Review Queue | Can see SME review queue | `owner`, `super_admin`, `content_admin`, `sme_reviewer` |
| `admin.audit.view` | View Audit Log | Can view full audit log | `owner`, `super_admin` |
| `admin.activity.view` | View Activity Feed | Can view activity feed | All admin roles |
| `admin.search.use` | Use Content Search | Can use admin search | All admin roles |
| `admin.analytics.view` | View Quality Analytics | Can view question analytics | `owner`, `super_admin`, `content_admin` |
| `admin.settings.view` | View Admin Settings | Can view admin settings | `owner`, `super_admin`, `ceo` |
| `admin.users.manage` | Manage Admin Users | Can assign/revoke admin roles | `owner`, `super_admin`, `ceo` |
| `admin.preview.view` | View Draft Previews | Can preview drafts | `owner`, `super_admin`, `content_admin`, `content_editor`, `sme_reviewer` |

### Permission Enforcement Plan

#### Server-Side
1. Add `assertPermission(permissionKey)` helper to `src/lib/admin/roles.ts`.
2. Update every admin server action to call `assertPermission()` at the top.
3. Return 403 if permission is missing.

#### Client-Side
1. Add `usePermission(permissionKey)` hook.
2. Use it to conditionally render UI elements (buttons, links, tabs).
3. Always hide rather than disable — disabled buttons are frustrating.

#### Middleware
1. Keep current `canAccessAdminCmsForRole()` as the coarse gate.
2. Fine-grained enforcement happens in layouts, pages, and actions.

### Audit Logging Plan

Every permission change and sensitive admin action should log to `audit_logs`:

| Action | Logged Fields |
|--------|---------------|
| Role assignment | `actor_id`, `target_user_id`, `old_role`, `new_role`, `timestamp` |
| Role revocation | `actor_id`, `target_user_id`, `revoked_role`, `timestamp` |
| Content publish | `actor_id`, `article_id`, `old_status`, `new_status`, `timestamp` |
| Content delete | `actor_id`, `article_id`, `title`, `timestamp` |
| User impersonation | `actor_id`, `target_user_id`, `timestamp` |

### Database Changes Needed

1. **New table: `role_permissions`** (optional, if not using code-based policy)
   - `role` (text)
   - `permission` (text)
   - `created_at`
   - UNIQUE(`role`, `permission`)

2. **Or:** Keep permissions in code (`policy.ts`) and only track role assignments in `user_roles`.

3. **Update `audit_logs` schema** if needed to capture permission-change events.

## Evidence

- Role resolution: `src/lib/entitlements/resolve-role.ts`
- Policy constants: `src/lib/entitlements/policy.ts`
- Admin roles: `src/lib/admin/roles.ts`
- Middleware: `src/lib/supabase/middleware.ts`
- Admin layout: `src/app/admin/layout.tsx`
- CEO actions: `src/lib/actions/ceo/team-actions.ts`
- Schema: `DATABASE_SCHEMA.sql`
