# Implementation Plan

**Last Updated:** 2026-04-27
**Status:** Ready for implementation
**Target:** `/admin` fully functional, UX-complete, RBAC-protected, with `/ceo` as RBAC control plane.

This plan is designed so a coding agent can implement it without re-auditing the codebase. Every task includes exact file paths, function names, and implementation patterns.

---

## Overview: 6 Implementation Sprints

| Sprint | Theme | Priority | Est. Files Touched |
|--------|-------|----------|--------------------|
| Sprint 0 | Cleanup & Baseline | P0 | 4 |
| Sprint 1 | Permission Infrastructure | P0 | 6 |
| Sprint 2 | Server-Side Enforcement | P0 | 14 |
| Sprint 3 | CEO Control Plane | P0 | 8 |
| Sprint 4 | Client-Side Gates & UX | P1 | 12 |
| Sprint 5 | Audit Logging & Tests | P1/P2 | 20+ |

---

## Sprint 0: Cleanup & Baseline

**Goal:** Remove legacy security holes and verify the baseline.

### Task 0.1: Remove `isAdminByEmail()`
**File:** `src/lib/admin/is-admin.ts`
**Action:** Delete the `isAdminByEmail` function entirely. If any callers exist, replace with `isAdmin()` from `src/lib/admin/roles.ts`.
**Verification:**
```bash
grep -r "isAdminByEmail" src/ --include="*.ts" --include="*.tsx"
# Must return zero matches
```

### Task 0.2: Add missing CEO page guards
**Files:**
- `src/app/(protected)/ceo/analytics/page.tsx`
- `src/app/(protected)/ceo/insights/page.tsx`
**Pattern:** Copy from `src/app/(protected)/ceo/financials/page.tsx`:
```typescript
import { verifyCeoAccess } from "@/lib/queries/ceo/auth";

export default async function Page() {
  await verifyCeoAccess();
  // ... rest of page
}
```

### Task 0.3: Verify no dev bypass env vars in staging/production
**Check:** `.env.local` or deployment config for:
- `DEV_FORCE_USER_ID`
- `ALLOW_DEV_PORTAL_BYPASS`
**Action:** If found in non-local environments, remove immediately.

### Task 0.4: Run baseline validation
```bash
bun run type-check
bun run lint
bun run test:e2e:smoke
```
**Acceptance:** All pass before proceeding.

---

## Sprint 1: Permission Infrastructure

**Goal:** Build the fine-grained permission system that everything else depends on.

### Task 1.1: Define `AdminPermission` type
**File:** `src/lib/entitlements/types.ts`
**Add:**
```typescript
export type AdminPermission =
  | "admin.access"
  | "admin.dashboard.view"
  | "admin.content.view"
  | "admin.content.create"
  | "admin.content.edit"
  | "admin.content.delete"
  | "admin.content.publish"
  | "admin.content.approve"
  | "admin.content.import"
  | "admin.taxonomy.manage"
  | "admin.assets.manage"
  | "admin.pipeline.manage"
  | "admin.reviews.view"
  | "admin.audit.view"
  | "admin.activity.view"
  | "admin.search.use"
  | "admin.analytics.view"
  | "admin.settings.view"
  | "admin.users.manage"
  | "admin.preview.view";
```

### Task 1.2: Build role-to-permission map
**File:** `src/lib/entitlements/policy.ts`
**Add after existing capability functions:**
```typescript
const ADMIN_PERMISSIONS: Record<CanonicalRole, AdminPermission[]> = {
  owner: [
    "admin.access", "admin.dashboard.view", "admin.content.view",
    "admin.content.create", "admin.content.edit", "admin.content.delete",
    "admin.content.publish", "admin.content.approve", "admin.content.import",
    "admin.taxonomy.manage", "admin.assets.manage", "admin.pipeline.manage",
    "admin.reviews.view", "admin.audit.view", "admin.activity.view",
    "admin.search.use", "admin.analytics.view", "admin.settings.view",
    "admin.users.manage", "admin.preview.view",
  ],
  super_admin: [ /* same as owner */ ],
  ceo: [
    "admin.access", "admin.dashboard.view", "admin.content.view",
    "admin.content.create", "admin.content.edit", "admin.content.delete",
    "admin.content.publish", "admin.content.approve", "admin.content.import",
    "admin.taxonomy.manage", "admin.assets.manage", "admin.pipeline.manage",
    "admin.reviews.view", "admin.activity.view",
    "admin.search.use", "admin.analytics.view", "admin.settings.view",
    "admin.users.manage", "admin.preview.view",
    // NOTE: ceo does NOT get admin.audit.view by default
  ],
  content_admin: [
    "admin.access", "admin.dashboard.view", "admin.content.view",
    "admin.content.create", "admin.content.edit", "admin.content.delete",
    "admin.content.publish", "admin.content.approve", "admin.content.import",
    "admin.taxonomy.manage", "admin.assets.manage", "admin.pipeline.manage",
    "admin.reviews.view", "admin.activity.view",
    "admin.search.use", "admin.analytics.view", "admin.preview.view",
  ],
  admin: [
    "admin.access", "admin.dashboard.view", "admin.content.view",
    "admin.content.create", "admin.content.edit", "admin.content.delete",
    "admin.content.publish", "admin.content.approve",
    "admin.taxonomy.manage", "admin.assets.manage", "admin.pipeline.manage",
    "admin.reviews.view", "admin.activity.view",
    "admin.search.use", "admin.analytics.view", "admin.preview.view",
  ],
  developer: [
    "admin.access", "admin.dashboard.view", "admin.content.view",
    "admin.content.create", "admin.content.edit",
    "admin.activity.view", "admin.search.use", "admin.preview.view",
  ],
  sme_reviewer: [
    "admin.access", "admin.dashboard.view", "admin.content.view",
    "admin.content.approve", "admin.pipeline.manage",
    "admin.reviews.view", "admin.activity.view",
    "admin.search.use", "admin.preview.view",
  ],
  member: [],
  anonymous: [],
};

export function hasPermission(role: CanonicalRole, permission: AdminPermission): boolean {
  return ADMIN_PERMISSIONS[role]?.includes(permission) ?? false;
}
```

### Task 1.3: Add `assertPermission()` server helper
**File:** `src/lib/admin/roles.ts`
**Add:**
```typescript
import { hasPermission } from "@/lib/entitlements/policy";
import type { AdminPermission } from "@/lib/entitlements/types";

export async function assertPermission(permission: AdminPermission): Promise<void> {
  const role = await getUserRole();
  if (!hasPermission(role, permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
}
```

### Task 1.4: Add `usePermission()` client hook
**File:** `src/hooks/usePermission.ts` (new)
```typescript
"use client";

import { useCallback } from "react";
import type { AdminPermission } from "@/lib/entitlements/types";

export function usePermission() {
  // TODO: fetch viewer entitlements and check permission
  // For now, mirror server-side check via a lightweight API or context
  const can = useCallback((permission: AdminPermission): boolean => {
    // Placeholder: replace with actual entitlement check
    return true;
  }, []);
  return { can };
}
```
**Note:** This hook needs a data source. Options:
- Option A: Add permissions array to `viewer` context / Zustand store
- Option B: Create `api/viewer/permissions` route that returns current user's permissions
- **Recommended:** Option A — add `permissions: AdminPermission[]` to the viewer entitlements object in `src/lib/entitlements/get-viewer-entitlements.ts`

### Task 1.5: Add permissions to viewer entitlements
**File:** `src/lib/entitlements/get-viewer-entitlements.ts`
**Action:** After resolving role, compute `permissions = ADMIN_PERMISSIONS[role]` and include in the returned entitlements object.
**File:** `src/lib/entitlements/types.ts`
**Add `permissions: AdminPermission[]` to `ViewerEntitlements` type.

### Task 1.6: Update `usePermission()` hook (complete)
**File:** `src/hooks/usePermission.ts`
```typescript
"use client";

import { useMemo } from "react";
import type { AdminPermission } from "@/lib/entitlements/types";
import { useViewer } from "@/lib/context/viewer-context"; // or however viewer is accessed

export function usePermission() {
  const viewer = useViewer();
  const permissions = useMemo(() => new Set(viewer?.permissions ?? []), [viewer]);
  const can = (permission: AdminPermission) => permissions.has(permission);
  return { can };
}
```

**Acceptance:**
- `bun run type-check` passes
- `hasPermission("admin", "admin.content.create")` returns `true`
- `hasPermission("sme_reviewer", "admin.content.create")` returns `false`

---

## Sprint 2: Server-Side Enforcement

**Goal:** Every admin server action checks permissions at the top.

### Pattern for every action file
At the top of every exported async function in `src/lib/actions/admin/*.ts`:
```typescript
import { assertPermission } from "@/lib/admin/roles";

export async function someAction(...) {
  "use server";
  await assertPermission("admin.content.edit"); // <-- add this
  // ... existing logic
}
```

### Task 2.1: Dashboard actions
**File:** `src/lib/actions/admin/dashboard.ts`
**Changes:**
- `getAdminDashboardData()` → `assertPermission("admin.dashboard.view")`
- `getNeedsAttentionData()` → `assertPermission("admin.dashboard.view")`
- `getContentBySubject()` → `assertPermission("admin.dashboard.view")`
- `getCriticalCoverageGap()` → `assertPermission("admin.dashboard.view")`

### Task 2.2: Content actions
**File:** `src/lib/actions/admin/content.ts`
**Changes:**
- `getContentEditorIndexData()` → `assertPermission("admin.content.view")`
- `getArticleFull()` → `assertPermission("admin.content.view")`
- Any mutation functions → `assertPermission("admin.content.edit")` or `"admin.content.create"`

### Task 2.3: Wiki actions
**File:** `src/lib/actions/admin/wiki.ts`
**Changes:**
- `createWikiArticle()` → `assertPermission("admin.content.create")`
- `updateWikiArticle()` → `assertPermission("admin.content.edit")`
- `deleteWikiArticle()` → `assertPermission("admin.content.delete")`
- `approveWikiArticleReview()` → `assertPermission("admin.content.approve")`
- `requestWikiArticleChanges()` → `assertPermission("admin.content.approve")`

### Task 2.4: Question actions
**File:** `src/lib/actions/admin/questions.ts`
**Changes:**
- `createQuestion()` → `assertPermission("admin.content.create")`
- `updateQuestion()` → `assertPermission("admin.content.edit")`
- `deleteQuestion()` / `deleteQuestions()` → `assertPermission("admin.content.delete")`

### Task 2.5: Question query actions
**File:** `src/lib/actions/admin/question-queries.ts`
**Changes:**
- `getQuestions()` / `getQuestionsGroupedByArticle()` / `getQuestion()` → `assertPermission("admin.content.view")`
- `getQuestionsForAnalytics()` → `assertPermission("admin.analytics.view")`

### Task 2.6: Design problem actions
**File:** `src/lib/actions/admin/design-problems.ts`
**Changes:**
- Read functions → `assertPermission("admin.content.view")`
- Mutations → `assertPermission("admin.content.create" | "edit" | "delete")`

### Task 2.7: Design scenario actions
**File:** `src/lib/actions/admin/design-scenarios.ts`
**Changes:** Same pattern as design-problems.

### Task 2.8: Pipeline actions
**File:** `src/lib/actions/admin/pipeline.ts`
**Changes:**
- `getPipelineArticles()` → `assertPermission("admin.pipeline.manage")`
- `updateArticleStatus()` → `assertPermission("admin.pipeline.manage")`

### Task 2.9: Taxonomy actions
**File:** `src/lib/actions/admin/taxonomy.ts`
**Changes:**
- `getTaxonomyNodes()` → `assertPermission("admin.taxonomy.manage")`
- Mutations → `assertPermission("admin.taxonomy.manage")`

### Task 2.10: Coverage actions
**File:** `src/lib/actions/admin/coverage.ts`
**Changes:**
- `fetchCoverageData()` → `assertPermission("admin.analytics.view")`

### Task 2.11: Asset actions
**File:** `src/lib/actions/admin/assets.ts`
**Changes:**
- `getAssets()` / `getAsset()` → `assertPermission("admin.assets.manage")`
- Mutations → `assertPermission("admin.assets.manage")`

### Task 2.12: Role actions
**File:** `src/lib/actions/admin/roles.ts`
**Changes:**
- `getAdminUsers()` → `assertPermission("admin.users.manage")`
- `assignRole()` → `assertPermission("admin.users.manage")`
- `revokeRole()` → `assertPermission("admin.users.manage")`

### Task 2.13: Bulk actions
**File:** `src/lib/actions/admin/bulk.ts`
**Changes:**
- `bulkDeleteQuestions()` → `assertPermission("admin.content.delete")`
- `bulkDeleteArticles()` → `assertPermission("admin.content.delete")`

### Task 2.14: Add error handling for permission denial
**Pattern:** `assertPermission()` throws a plain Error. Ensure the app's error boundary or action caller handles this gracefully. If needed, catch in the action and return `{ error: "Forbidden" }` instead of throwing.

**Acceptance:**
- `bun run type-check` passes
- Every exported function in `src/lib/actions/admin/*.ts` has an `assertPermission()` call
- Existing unit tests still pass (may need to mock `assertPermission` or seed test user with appropriate role)

---

## Sprint 3: CEO Control Plane

**Goal:** `/ceo/team` manages admin roles via `user_roles` table.

### Task 3.1: Create CEO admin role actions
**File:** `src/lib/actions/ceo/admin-role-actions.ts` (new)
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { assertCeoRole } from "@/lib/queries/ceo/auth";
import { logAdminAction } from "@/lib/admin/audit"; // see Sprint 5

export async function getAdminUsers() {
  const { supabase } = await assertCeoRole();
  const { data, error } = await supabase
    .from("user_roles")
    .select("*, profiles(full_name, email)");
  if (error) throw error;
  return data;
}

export async function assignAdminRole(userId: string, role: string) {
  const { supabase, user } = await assertCeoRole();
  // Safeguard: prevent removing final owner/super_admin
  await safeguardLastOwner(supabase, userId, role, "assign");
  const { error } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role, created_by: user.id });
  if (error) throw error;
  await logAdminAction({
    actorId: user.id,
    action: "role.assign",
    targetUserId: userId,
    metadata: { role },
  });
}

export async function revokeAdminRole(userId: string, role: string) {
  const { supabase, user } = await assertCeoRole();
  await safeguardLastOwner(supabase, userId, role, "revoke");
  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", role);
  if (error) throw error;
  await logAdminAction({
    actorId: user.id,
    action: "role.revoke",
    targetUserId: userId,
    metadata: { role },
  });
}

export async function getPermissionAuditLog(limit = 50, offset = 0) {
  const { supabase } = await assertCeoRole();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .in("action", ["role.assign", "role.revoke"])
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}

async function safeguardLastOwner(
  supabase: SupabaseClient,
  targetUserId: string,
  role: string,
  operation: "assign" | "revoke"
) {
  if (operation === "revoke" && ["owner", "super_admin"].includes(role)) {
    const { count } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .in("role", ["owner", "super_admin"]);
    if (count && count <= 1) {
      throw new Error("Cannot revoke the final owner/super-admin role");
    }
  }
  // Self-demotion block
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === targetUserId && operation === "revoke") {
    throw new Error("Cannot revoke your own role");
  }
}
```

### Task 3.2: Update `RoleAssignmentModal` to include `ceo`
**File:** `src/components/ceo/RoleAssignmentModal.tsx`
**Find:** `SYSTEM_ROLES` array (or equivalent)
**Add:** `'ceo'` to the array if missing.

### Task 3.3: Update `tr_sync_team_role` trigger
**File:** `supabase/migrations/` (new migration)
**SQL:**
```sql
-- Update existing trigger to also sync to user_roles
CREATE OR REPLACE FUNCTION sync_team_role_to_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    -- Update profiles.role (existing behavior)
    UPDATE public.profiles
    SET role = NEW.system_role
    WHERE id = NEW.user_id;

    -- NEW: Upsert into user_roles
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (NEW.user_id, NEW.system_role, NOW())
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
**Note:** This is a one-way sync. If a role is changed via `/ceo/team`, it adds to `user_roles`. Role revocation via `/ceo` should use the new `revokeAdminRole` action instead of this trigger.

### Task 3.4: Create `/ceo/team/admin-roles` page
**File:** `src/app/(protected)/ceo/team/admin-roles/page.tsx`
**Pattern:** Similar to `/admin/settings` but using CEO actions.
**Components needed:**
- Reuse or adapt `AdminRoleManager` from `src/components/admin/settings/AdminRoleManager.tsx`
- Create `CeoAdminRoleManager` wrapper if needed

### Task 3.5: Create `/ceo/team/permission-audit` page
**File:** `src/app/(protected)/ceo/team/permission-audit/page.tsx`
**Data:** `getPermissionAuditLog()`
**UI:** Table with columns: Actor, Target User, Action, Role, Timestamp

### Task 3.6: Update `/ceo/team` navigation
**File:** `src/app/(protected)/ceo/_components/CeoShell.tsx` or navigation config
**Add tabs/links:**
- Team Members
- Admin Roles
- Permission Audit

**Acceptance:**
- CEO can assign `admin` role to a member
- Assigned user can access `/admin` after refresh
- CEO cannot revoke final `owner`/`super_admin`
- CEO cannot revoke their own role
- Audit log entries created for every assignment/revocation

---

## Sprint 4: Client-Side Gates & UX

**Goal:** UI reflects permissions; high-impact UX issues fixed.

### Task 4.1: Update `AdminShell` navigation
**File:** `src/app/admin/_components/AdminShell.tsx`
**Action:** Conditionally render nav items based on `usePermission()`.
```typescript
const { can } = usePermission();

// Example:
{can("admin.content.view") && (
  <NavItem href="/admin/knowledge">Knowledge Base</NavItem>
)}
{can("admin.audit.view") && (
  <NavItem href="/admin/audit">Audit Log</NavItem>
)}
{can("admin.users.manage") && (
  <NavItem href="/admin/settings">Settings</NavItem>
)}
```

### Task 4.2: Update `QuestionsTableClient`
**File:** `src/components/admin/QuestionsTableClient.tsx`
**Action:**
- Hide edit/delete buttons if `!can("admin.content.edit")` / `!can("admin.content.delete")`
- Hide bulk actions if `!can("admin.content.delete")`

### Task 4.3: Update `PipelineClient`
**File:** `src/app/admin/pipeline/_components/PipelineClient.tsx`
**Action:** Hide "Publish" button if `!can("admin.content.publish")`.

### Task 4.4: Update knowledge pages
**Files:**
- `src/app/admin/knowledge/page.tsx`
- `src/app/admin/knowledge/questions/page.tsx`
**Action:** Hide "Create New" / "Import" buttons if `!can("admin.content.create")` / `!can("admin.content.import")`.

### Task 4.5: Fix Content Search pagination
**File:** `src/app/admin/search/_components/ContentSearchClient.tsx`
**Action:**
- Add `offset` state
- Add "Load more" or numbered pagination
- Increase limit or make it configurable

### Task 4.6: Fix `QuestionsTableClient` mobile layout
**File:** `src/components/admin/QuestionsTableClient.tsx`
**Action:**
- Add `overflow-x-auto` wrapper around table
- OR make taxonomy sidebar collapsible with a toggle button
- OR hide sidebar below `lg` and show filter button instead

### Task 4.7: Fix `DeleteArticleModal` close button
**File:** `src/components/admin/DeleteArticleModal.tsx`
**Action:** Change `showCloseButton={false}` to `showCloseButton={true}` on `DialogContent`.

### Task 4.8: Standardize loading skeletons
**Files:** All `src/app/admin/*/loading.tsx`
**Action:** Replace hand-rolled `animate-pulse` divs with `Skeleton` component from `src/components/ui/skeleton.tsx`.

### Task 4.9: Add skeleton to `SMEReviewQueue`
**File:** `src/components/admin/SMEReviewQueue.tsx`
**Action:** Use `Skeleton` components while loading instead of plain text.

### Task 4.10: Add `aria-live` to async components
**Files:**
- `src/components/admin/unified-editor/SaveAllBar.tsx`
- `src/components/admin/QuestionImporter.tsx`
- `src/app/admin/pipeline/_components/PipelineClient.tsx`
**Action:** Add `<div aria-live="polite" aria-atomic="true">` around status messages.

**Acceptance:**
- Read-only admin sees view-only UI
- Content Search has pagination working
- Mobile viewport test passes for QuestionsTableClient
- axe-core scan shows zero new violations

---

## Sprint 5: Audit Logging & Tests

**Goal:** Every mutation is logged; tests verify behavior.

### Task 5.1: Create `logAdminAction()` helper
**File:** `src/lib/admin/audit.ts` (new)
```typescript
import { createClient } from "@/lib/supabase/server";

export async function logAdminAction(params: {
  actorId: string;
  action: string;
  targetUserId?: string;
  targetArticleId?: string;
  targetQuestionId?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    actor_id: params.actorId,
    action: params.action,
    target_user_id: params.targetUserId,
    target_article_id: params.targetArticleId,
    target_question_id: params.targetQuestionId,
    metadata: params.metadata,
    created_at: new Date().toISOString(),
  });
}
```

### Task 5.2: Add audit logging to all admin mutations
**Pattern:** At the end of every mutation action, call `logAdminAction()`.
**Priority order:**
1. Role changes (`src/lib/actions/admin/roles.ts`)
2. Content deletions (`wiki.ts`, `questions.ts`)
3. Pipeline transitions (`pipeline.ts`)
4. Taxonomy changes (`taxonomy.ts`)
5. Asset changes (`assets.ts`)
6. Bulk operations (`bulk.ts`)

### Task 5.3: Add unit tests for permission denial
**File:** `src/lib/actions/admin/permissions.test.ts` (new)
**Test each action with a member user:**
```typescript
import { test, expect } from "bun:test";
import { createQuestion } from "./questions";

test("createQuestion rejects member", async () => {
  // Mock member user
  await expect(createQuestion({ ... })).rejects.toThrow("Forbidden");
});
```

### Task 5.4: Add unit tests for untested actions
**Files to create:**
- `src/lib/actions/admin/coverage.test.ts`
- `src/lib/actions/admin/taxonomy.test.ts`
- `src/lib/actions/admin/question-queries.test.ts`
- `src/lib/actions/admin/dashboard.test.ts`
- `src/lib/actions/admin/bulk.test.ts`

### Task 5.5: Add E2E tests for RBAC
**File:** `e2e/admin-rbac.spec.ts` (new)
**Scenarios:**
- E2E-ADM-01 through E2E-ADM-07 from `e2e-test-scenarios.md`
- Use `authenticatedDemoTest` fixture pattern from `e2e/support/authenticated-demo.ts`

### Task 5.6: Add E2E tests for CEO control plane
**File:** `e2e/ceo-rbac.spec.ts` (new)
**Scenarios:**
- E2E-CEO-01 through E2E-CEO-04 from `e2e-test-scenarios.md`

### Task 5.7: Update `src/app/admin/AGENTS.md`
**Action:** Document the new permission system and where to add `assertPermission()`.

### Task 5.8: Final validation
```bash
bun run type-check
bun run lint
bun test src/lib/actions/admin/
bun run test:e2e:auth-demo:portals
```

**Acceptance:**
- All tests pass
- Every admin mutation creates an `audit_logs` entry
- No TypeScript or lint errors

---

## Quick Reference: Permission Mappings

| Action | File | Permission Key |
|--------|------|----------------|
| View dashboard | `dashboard.ts` | `admin.dashboard.view` |
| View content | `content.ts`, `question-queries.ts` | `admin.content.view` |
| Create content | `wiki.ts`, `questions.ts` | `admin.content.create` |
| Edit content | `wiki.ts`, `questions.ts` | `admin.content.edit` |
| Delete content | `wiki.ts`, `questions.ts`, `bulk.ts` | `admin.content.delete` |
| Publish/approve | `wiki.ts`, `pipeline.ts` | `admin.content.publish` / `admin.content.approve` |
| Import | `content.ts` (importer) | `admin.content.import` |
| Manage taxonomy | `taxonomy.ts` | `admin.taxonomy.manage` |
| Manage assets | `assets.ts` | `admin.assets.manage` |
| Manage pipeline | `pipeline.ts` | `admin.pipeline.manage` |
| View analytics | `coverage.ts`, `question-queries.ts` | `admin.analytics.view` |
| View audit log | `audit/page.tsx` | `admin.audit.view` |
| Manage users | `roles.ts` | `admin.users.manage` |

## Evidence

- Actions: `src/lib/actions/admin/`
- Components: `src/components/admin/`
- RBAC: `src/lib/entitlements/`, `src/lib/admin/roles.ts`
- CEO: `src/app/(protected)/ceo/`, `src/lib/actions/ceo/`
- Tests: `src/lib/actions/admin/*.test.ts`
