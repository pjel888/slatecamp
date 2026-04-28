# CEO Admin RBAC Control Plane

**Last Updated:** 2026-04-27

## Current `/ceo` Capabilities

### Routes
| Route | Purpose | Access Check |
|-------|---------|--------------|
| `/ceo` | Command Center (North Star, Business Health, Engagement, Unit Economics) | Layout + `canAccessCeoPortalForRole()` |
| `/ceo/analytics` | 8 analytics sections | **Layout only** — missing `verifyCeoAccess()` |
| `/ceo/financials` | Financial ledger, P&L, runway | `verifyCeoAccess()` |
| `/ceo/insights` | Behavioral insights | **Layout only** — missing `verifyCeoAccess()` |
| `/ceo/team` | Team roster, role assignment | `verifyCeoAccess()` |

### Components
| Component | Purpose | Evidence |
|-----------|---------|----------|
| `CeoShell` | Portal chrome with sidebar nav | `src/app/(protected)/ceo/_components/CeoShell.tsx` |
| `RoleAssignmentModal` | Assign system roles to team members | `src/components/ceo/RoleAssignmentModal.tsx` |
| `TeamTable` | Display team roster | `src/components/ceo/TeamTable.tsx` |

### Server Actions
| Action | Auth | Notes |
|--------|------|-------|
| `addTeamMember` | `assertCeoRole()` | Adds to `ceo_team_members` |
| `updateTeamMember` | `assertCeoRole()` | Updates `ceo_team_members` |
| `removeTeamMember` | `assertCeoRole()` | Removes from `ceo_team_members` |
| `assignSystemRole` | `assertCeoRole()` | Updates `ceo_team_members.system_role` |

### Key Finding: Role Sync Architecture

When `assignSystemRole` updates `ceo_team_members.system_role`, a database trigger (`tr_sync_team_role`) syncs the role to `profiles.role` IF `user_id` is not null.

**BUT:** This does NOT write to the `user_roles` table, which is the canonical role store for admin access.

Evidence: `src/lib/actions/ceo/team-actions.ts`, `DATABASE_SCHEMA.sql`

---

## Gap Analysis

### Gap 1: CEO Cannot Manage Admin Roles Effectively
- `/ceo/team` can assign `system_role` to `ceo_team_members`, but this only affects `profiles.role`.
- The `user_roles` table is the canonical source for admin access resolution.
- There is no CEO-facing UI to manage `user_roles`.

### Gap 2: CEO Role Assignment Modal Excludes `ceo`
- `RoleAssignmentModal` allows: `super_admin`, `admin`, `lead`, `member`, `consultant`, `viewer`
- `ceo` is excluded from the dropdown.

### Gap 3: `/ceo/analytics` and `/ceo/insights` Lack Page-Level Guards
- These pages rely only on the layout gate.
- Inconsistent with `financials` and `team` which call `verifyCeoAccess()`.

### Gap 4: No Audit Trail for CEO Role Changes
- `assignSystemRole` does not log to `audit_logs`.

---

## Proposed `/ceo` Admin RBAC Control Plane

### Design Principles
1. **CEO is the control plane for admin access.**
2. **All admin role changes flow through `/ceo`.**
3. **`/admin/settings` becomes read-only or is removed.**
4. **Changes write to `user_roles` (canonical) and optionally `ceo_team_members`.**
5. **All changes are audited.**

### Proposed `/ceo` Pages

#### `/ceo/team` (Existing — Enhanced)
**Purpose:** Team roster + admin role management

**Additions:**
- Tab: "Team Members" (existing)
- Tab: "Admin Roles" (new)
- Tab: "Permission Audit" (new)

**"Admin Roles" Tab:**
- Table of all users with admin access
- Columns: User, Email, Current Role(s), Admin Status, Actions
- Actions: Assign Role, Revoke Role, View Permissions
- Filter by role, search by name/email

#### `/ceo/team/admin-roles` (New Page)
**Purpose:** Dedicated admin role management

**Features:**
- View all admin users
- Assign admin role to any user
- Revoke admin role from any user
- Bulk revoke (with confirmation)
- View effective permissions for each user
- Filter by role (`super_admin`, `content_admin`, `admin`, `developer`, `sme_reviewer`)

#### `/ceo/team/permission-audit` (New Page)
**Purpose:** Audit trail for all permission changes

**Features:**
- Table of role changes
- Columns: Actor, Target User, Action, Old Role, New Role, Timestamp
- Filter by actor, target user, date range
- Export to CSV

### Proposed Server Actions for CEO

```typescript
// src/lib/actions/ceo/admin-role-actions.ts

async function getAdminUsers(): Promise<AdminUser[]>
// Returns all users with admin access, including their roles from user_roles

async function assignAdminRole(userId: string, role: AdminRole): Promise<void>
// Inserts into user_roles table. Logs to audit_logs.
// Requires: ceoPortal + canManageUsers (or CEO-specific permission)

async function revokeAdminRole(userId: string, role: AdminRole): Promise<void>
// Deletes from user_roles table. Logs to audit_logs.
// Requires: ceoPortal + canManageUsers

async function getPermissionAuditLog(limit: number, offset: number): Promise<AuditEntry[]>
// Returns role change audit entries
// Requires: ceoPortal
```

### Edge Cases and Safeguards

| Edge Case | Handling |
|-----------|----------|
| CEO tries to revoke their own CEO access | **Blocked** — prevent self-demotion from final CEO role |
| CEO tries to remove last `owner`/`super_admin` | **Blocked** — require at least one owner/super_admin |
| CEO assigns `owner` role | **Requires confirmation** — high-risk action |
| Target user has active sessions | **Document only** — changes take effect on next session refresh |
| `user_roles` table is unavailable | **Error** — do not fall back to `profiles.role` for CEO-managed changes |
| Duplicate role assignment | **Idempotent** — ignore if role already exists |

### UI Design Recommendations

#### Role Assignment Flow
1. CEO navigates to `/ceo/team/admin-roles`
2. Clicks "Assign Role" on a user row
3. Dialog opens with role dropdown
4. CEO selects role and clicks "Assign"
5. **Confirmation toast:** "Admin role assigned to [user]"
6. **Audit log entry created automatically**

#### Permission View
- Show effective permissions as a read-only checklist
- Group by category (Content, Users, Analytics, Settings)
- Use icons: ✓ (has permission), − (no permission)

#### Bulk Actions
- Select multiple users via checkboxes
- Bulk action dropdown: "Revoke admin access"
- **Confirm dialog:** "Are you sure? This will revoke admin access for 3 users."

### Database Changes

1. **No schema changes required** if using existing `user_roles` table.
2. **Add audit log trigger** on `user_roles` INSERT/DELETE (optional, or handle in application code).
3. **Update `ceo_team_members` sync trigger** to also sync to `user_roles` if desired.

### Implementation Sequence

1. **Phase 1:** Add `getAdminUsers`, `assignAdminRole`, `revokeAdminRole` server actions.
2. **Phase 2:** Build `/ceo/team/admin-roles` page with read-only user table.
3. **Phase 3:** Add role assignment/revocation UI.
4. **Phase 4:** Add audit logging to all role changes.
5. **Phase 5:** Add safeguards (self-demotion block, last-owner block).
6. **Phase 6:** Deprecate or make read-only `/admin/settings`.
7. **Phase 7:** Add `/ceo/team/permission-audit` page.

## Evidence

- CEO routes: `src/app/(protected)/ceo/`
- CEO actions: `src/lib/actions/ceo/team-actions.ts`
- CEO auth: `src/lib/queries/ceo/auth.ts`
- Role modal: `src/components/ceo/RoleAssignmentModal.tsx`
- Admin settings: `src/app/admin/settings/page.tsx`
- Admin roles action: `src/lib/actions/admin/roles.ts`
- Schema: `DATABASE_SCHEMA.sql`
