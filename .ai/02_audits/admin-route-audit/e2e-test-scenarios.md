# E2E Test Scenarios

**Last Updated:** 2026-04-27
**Framework:** Playwright 1.59.1
**Purpose:** Concrete, implementable E2E scenarios for admin RBAC, CEO control plane, and admin functionality.

---

## Test Data Setup

Before running these tests, create the following fixture users. The recommended approach is a Playwright project setup or fixture that seeds these users via Supabase admin API.

| Role | Email | Password | Setup Script |
|------|-------|----------|-------------|
| `owner` | `e2e-owner@slatecamp.test` | `Test1234!` | Create auth user + `user_roles` row with `role = 'owner'` |
| `super_admin` | `e2e-super@slatecamp.test` | `Test1234!` | Create auth user + `user_roles` row with `role = 'super_admin'` |
| `ceo` | `e2e-ceo@slatecamp.test` | `Test1234!` | Create auth user + `ceo_team_members` row with `system_role = 'ceo'` + `user_roles` row |
| `content_admin` | `e2e-content@slatecamp.test` | `Test1234!` | Create auth user + `user_roles` row with `role = 'content_admin'` |
| `admin` | `e2e-admin@slatecamp.test` | `Test1234!` | Create auth user + `user_roles` row with `role = 'admin'` |
| `developer` | `e2e-dev@slatecamp.test` | `Test1234!` | Create auth user + `user_roles` row with `role = 'developer'` |
| `sme_reviewer` | `e2e-reviewer@slatecamp.test` | `Test1234!` | Create auth user + `user_roles` row with `role = 'sme_reviewer'` |
| `member` | `e2e-member@slatecamp.test` | `Test1234!` | Create auth user only (no `user_roles` row) |

---

## Scenario List

### Auth and Access Boundaries

#### E2E-ADM-01: Non-admin cannot access `/admin`
```
Test File: e2e/admin-rbac.spec.ts
Priority: P0
Preconditions: User has role 'member' or is anonymous
Setup: Ensure test user has no `user_roles` row.

Steps:
  1. Navigate to /admin as anonymous
Expected: Redirected to /admin/login

  2. Login as member user
  3. Navigate to /admin
Expected: Redirected to /dashboard
```

#### E2E-ADM-02: Admin with `admin.access` can access dashboard
```
Test File: e2e/admin-rbac.spec.ts
Priority: P0
Preconditions: User has role 'admin'

Steps:
  1. Login as admin user via Supabase auth API
  2. Set auth cookies in browser context
  3. Navigate to /admin
Expected:
  - URL is /admin
  - Dashboard heading "Admin Dashboard" visible
  - Stats cards render (selectors: [data-testid="dashboard-stats"])
  - Needs-attention section visible if count > 0
```

#### E2E-ADM-03: Read-only admin can view but cannot mutate
```
Test File: e2e/admin-rbac.spec.ts
Priority: P0
Preconditions: User has role 'sme_reviewer'; at least one article exists

Steps:
  1. Login as sme_reviewer
  2. Navigate to /admin/knowledge
Expected: Knowledge base loads, article list visible

  3. Click first article
Expected: Article editor opens at /admin/knowledge/[id]

  4. Look for Save/Delete/Archive buttons
Expected: Save button is NOT visible (selector: [data-testid="save-article-btn"] count = 0)
  - Delete button is NOT visible
  - Article content is visible but editor may be read-only
```

#### E2E-ADM-04: Admin without specific permission cannot see restricted action
```
Test File: e2e/admin-rbac.spec.ts
Priority: P0
Preconditions: User has role 'sme_reviewer'

Steps:
  1. Login as sme_reviewer
  2. Navigate to /admin/knowledge/new
Expected: Redirected to /admin/login or /admin (exact behavior TBD — document what happens)

  3. Navigate to /admin/settings
Expected: Redirected to /admin (sme_reviewer lacks admin.users.manage)
```

#### E2E-ADM-05: Direct API call without permission is rejected
```
Test File: e2e/admin-rbac.spec.ts
Priority: P0
Preconditions: User has role 'member', has valid session cookie

Steps:
  1. Login as member
  2. In browser console or via fetch in test, POST to admin action:
     fetch('/api/admin/questions', {
       method: 'POST',
       body: JSON.stringify({ stem: 'Test' })
     })
Expected: Response status is 403

Alternative (for Server Actions):
  - Call the server action directly via Playwright page.evaluate() with the member session
Expected: Action rejects with error containing "Forbidden"
```

#### E2E-ADM-06: Super admin can access all admin pages
```
Test File: e2e/admin-rbac.spec.ts
Priority: P0
Preconditions: User has role 'super_admin'

Steps:
  1. Login as super_admin
  2. Visit /admin
Expected: Dashboard loads

  3. Visit /admin/audit
Expected: Audit log page loads (selector: [data-testid="audit-log-table"] visible)

  4. Visit /admin/settings
Expected: Settings page loads

  5. Visit /admin/knowledge/new
Expected: Create article page loads
```

#### E2E-ADM-07: CEO can access admin but not audit log
```
Test File: e2e/admin-rbac.spec.ts
Priority: P0
Preconditions: User has role 'ceo'

Steps:
  1. Login as ceo
  2. Visit /admin
Expected: Dashboard loads

  3. Visit /admin/audit
Expected: Redirected to /admin (ceo lacks admin.audit.view)

  4. Visit /admin/settings
Expected: Redirected to /admin (ceo lacks admin.users.manage per matrix — VERIFY: may be allowed)
  NOTE: If CEO should access settings, update test to expect load instead.
```

### CEO RBAC Control Plane

#### E2E-CEO-01: CEO can assign admin role from `/ceo`
```
Test File: e2e/ceo-rbac.spec.ts
Priority: P0
Preconditions:
  - CEO user exists and is logged in
  - Target user (email: e2e-target-member@slatecamp.test) exists with role 'member'

Steps:
  1. Login as CEO
  2. Navigate to /ceo/team
Expected: Team page loads with member list

  3. Find target user row (selector: text='e2e-target-member')
  4. Click "Assign Role" or "Edit" button on that row
Expected: Role assignment modal opens

  5. Select 'admin' from role dropdown (selector: [data-testid="role-select"])
  6. Click "Confirm" or "Save"
Expected:
  - Success toast appears (selector: text='Role assigned')
  - User row shows 'admin' badge

  7. In a new browser context, login as target user
  8. Navigate to /admin
Expected: Admin dashboard loads (user now has admin role)
```

#### E2E-CEO-02: CEO can revoke admin role from `/ceo`
```
Test File: e2e/ceo-rbac.spec.ts
Priority: P0
Preconditions:
  - CEO user exists and is logged in
  - Target user exists with role 'admin'

Steps:
  1. Login as CEO
  2. Navigate to /ceo/team
  3. Find target user with 'admin' role
  4. Click "Revoke Role" or "Remove"
Expected: Confirmation dialog appears

  5. Click "Confirm"
Expected:
  - Success toast appears
  - User row no longer shows 'admin' badge

  6. In a new browser context, login as target user
  7. Navigate to /admin
Expected: Redirected to /dashboard (role revoked)
```

#### E2E-CEO-03: Permission change takes effect after session refresh
```
Test File: e2e/ceo-rbac.spec.ts
Priority: P1
Preconditions:
  - Admin user is logged in
  - CEO user is available

Steps:
  1. Login as admin user in Browser A
  2. Navigate to /admin in Browser A
Expected: Dashboard loads

  3. In Browser B, login as CEO
  4. Revoke admin role from the admin user in Browser B
Expected: Success toast in Browser B

  5. In Browser A, navigate to /admin/knowledge/new (same session, no refresh)
Expected: MAY still load (session cached) — document this behavior

  6. In Browser A, refresh the page
Expected: Redirected to /dashboard (session invalidated or re-validated on refresh)

  NOTE: If the app caches role in session/jwt, this test documents the cache TTL.
```

#### E2E-CEO-04: CEO cannot accidentally remove final CEO/super-admin access
```
Test File: e2e/ceo-rbac.spec.ts
Priority: P0
Preconditions:
  - CEO user is logged in
  - CEO user is the ONLY user with 'ceo' or 'super_admin' role in the system

Steps:
  1. Login as CEO
  2. Navigate to /ceo/team
  3. Find own user row
  4. Click "Revoke Role" on own CEO role
Expected: Error message displayed — "Cannot revoke your own role"

  5. If there is another super_admin, attempt to revoke their last super_admin role
Expected: Error message — "Cannot revoke the final owner/super-admin role"
```

### Destructive Actions and Confirmation

#### E2E-ADM-08: Destructive admin actions require confirmation
```
Test File: e2e/admin-destructive.spec.ts
Priority: P1
Preconditions: Content admin user; at least one article exists

Steps:
  1. Login as content_admin
  2. Navigate to /admin/knowledge
  3. Click first article
  4. Click "Archive Article" button
Expected: Confirm dialog appears (selector: [data-testid="confirm-dialog"] or text='Are you sure')

  5. Click "Cancel" in dialog
Expected: Dialog closes, article still visible, URL unchanged

  6. Click "Archive Article" again
  7. Click "Confirm"
Expected: Success toast, redirect to /admin/knowledge, article no longer in list
```

#### E2E-ADM-09: Failed admin action shows usable error feedback
```
Test File: e2e/admin-destructive.spec.ts
Priority: P1
Preconditions: Content admin user

Steps:
  1. Login as content_admin
  2. Navigate to /admin/knowledge/new
  3. Fill title and content
  4. Block network requests to Supabase (via page.route() or browser devtools)
  5. Click "Save"
Expected: Error toast or banner with clear message (not generic "Something went wrong")
  - Message should indicate save failed
  - Form data should be preserved (title and content still in inputs)
```

### Table and List States

#### E2E-ADM-10: Admin tables handle empty state
```
Test File: e2e/admin-ui.spec.ts
Priority: P1
Preconditions: Admin user; review queue is empty (or use test isolation to create empty state)

Steps:
  1. Login as admin
  2. Navigate to /admin/reviews
Expected: Empty state message visible
  - Selector: [data-testid="empty-state"] or text matching 'No reviews pending'
  - Illustration or icon visible
```

#### E2E-ADM-11: Admin tables handle loading state
```
Test File: e2e/admin-ui.spec.ts
Priority: P1
Preconditions: Admin user

Steps:
  1. Login as admin
  2. Throttle network to Slow 3G
  3. Navigate to /admin/pipeline
Expected: Skeleton visible before data loads (selector: [data-testid="skeleton"] or `.animate-pulse`)
```

#### E2E-ADM-12: Admin tables handle populated state
```
Test File: e2e/admin-ui.spec.ts
Priority: P1
Preconditions: Admin user; at least 5 questions exist

Steps:
  1. Login as admin
  2. Navigate to /admin/knowledge/questions
Expected:
  - Table renders with >= 1 row (selector: `table tbody tr`)
  - Pagination or "Load more" visible if > 20 items
  - Column headers visible
```

### Form Validation

#### E2E-ADM-13: Admin forms validate required fields
```
Test File: e2e/admin-forms.spec.ts
Priority: P1
Preconditions: Content admin user

Steps:
  1. Login as content_admin
  2. Navigate to /admin/knowledge/questions/new
  3. Click "Create" without filling any fields
Expected:
  - Validation errors visible on required fields
  - Form does not submit
  - URL unchanged
```

#### E2E-ADM-14: Admin forms preserve input on error
```
Test File: e2e/admin-forms.spec.ts
Priority: P1
Preconditions: Content admin user

Steps:
  1. Login as content_admin
  2. Navigate to /admin/knowledge/questions/new
  3. Fill "Stem" with "Test question stem"
  4. Fill "Option A" with "Correct answer"
  5. Do NOT select correct option
  6. Click "Create"
Expected:
  - Validation error shown (e.g., "Please select a correct option")
  - "Stem" field still contains "Test question stem"
  - "Option A" still contains "Correct answer"
```

### Keyboard-Only Workflows

#### E2E-ADM-15: Keyboard-only user can complete core admin workflows
```
Test File: e2e/admin-a11y.spec.ts
Priority: P1
Preconditions: Admin user

Steps:
  1. Login as admin
  2. Navigate to /admin/knowledge/new using keyboard only (Tab, Enter)
  3. Tab to "Title" input, type "Keyboard Test Article"
  4. Tab to content editor, type "Content"
  5. Tab to "Save" button
  6. Press Enter
Expected:
  - Article created
  - Redirected to article editor or knowledge list
  - Success toast visible
```

#### E2E-ADM-16: Command palette accessible via keyboard
```
Test File: e2e/admin-a11y.spec.ts
Priority: P1
Preconditions: Admin user

Steps:
  1. Login as admin
  2. Press Cmd+K (or Ctrl+K)
Expected: Command palette modal opens (selector: [role="dialog"] or [data-testid="command-palette"])

  3. Type "pipeline"
Expected: "Pipeline" option visible in results

  4. Press Enter
Expected: Navigated to /admin/pipeline
```

### Search

#### E2E-ADM-17: Content search returns relevant results
```
Test File: e2e/admin-search.spec.ts
Priority: P1
Preconditions: Admin user; article with known title exists (seed: "Test Search Article Alpha")

Steps:
  1. Login as admin
  2. Navigate to /admin/search
  3. Type "Alpha" in search input (selector: [data-testid="search-input"] or `input[type="search"]`)
  4. Wait for debounce (typically 300ms)
Expected:
  - Results list visible
  - "Test Search Article Alpha" appears in results
```

#### E2E-ADM-18: Content search shows empty state when no results
```
Test File: e2e/admin-search.spec.ts
Priority: P1
Preconditions: Admin user

Steps:
  1. Login as admin
  2. Navigate to /admin/search
  3. Type "xyznonexistent12345" in search input
  4. Wait for debounce
Expected: "No results found" message visible
```

### Pipeline

#### E2E-ADM-19: Pipeline status change persists
```
Test File: e2e/admin-pipeline.spec.ts
Priority: P1
Preconditions: Content admin user; article in "Draft" status exists

Steps:
  1. Login as content_admin
  2. Navigate to /admin/pipeline
  3. Find article in "Draft" column
  4. Drag article to "In Review" column (or click status change button if drag is not implemented)
Expected: Article appears in "In Review" column

  5. Refresh page
Expected: Article still in "In Review" column
```

### Preview

#### E2E-ADM-20: Draft preview replicates student view
```
Test File: e2e/admin-preview.spec.ts
Priority: P1
Preconditions: Content admin user; unsaved draft exists

Steps:
  1. Login as content_admin
  2. Navigate to /admin/knowledge/new
  3. Fill title and content
  4. Click "Preview" button
Expected: New tab or modal opens with preview URL

  5. Navigate to preview URL
Expected:
  - Page renders like student wiki view
  - No admin sidebar visible
  - No admin topbar visible
  - Article content matches draft
```

### Mobile

#### E2E-ADM-21: Admin mobile nav is accessible
```
Test File: e2e/admin-mobile.spec.ts
Priority: P2
Preconditions: Admin user

Steps:
  1. Login as admin
  2. Set viewport to 375x667 (iPhone SE)
  3. Navigate to /admin
Expected: Hamburger menu button visible (selector: [data-testid="mobile-menu-btn"] or `button[aria-label*="menu"]`)

  4. Click hamburger menu
Expected: Mobile nav sheet/modal opens

  5. Click "Dashboard" link in mobile nav
Expected: Dashboard loads, mobile nav closes
```

---

## Implementation Notes for Playwright

### Page Object Models (Recommended)

Create `e2e/poms/admin.page.ts`:
```typescript
import { Page } from "@playwright/test";

export class AdminPage {
  constructor(private page: Page) {}

  async gotoDashboard() {
    await this.page.goto("/admin");
  }

  async assertDashboardLoaded() {
    await this.page.waitForSelector("[data-testid='dashboard-stats']");
  }

  async assertForbidden() {
    await this.page.waitForURL("/dashboard");
  }
}
```

### Auth Setup

Use `e2e/support/authenticated-demo.ts` as reference. For role-based tests, extend the fixture:
```typescript
// e2e/fixtures.ts
import { test as base } from "@playwright/test";

export const test = base.extend<{
  loginAs: (role: string) => Promise<void>;
}>({
  loginAs: async ({ page }, use) => {
    await use(async (role: string) => {
      // Use Supabase auth API or seed cookies
      // Implementation depends on your auth setup
    });
  },
});
```

### Test Isolation

- Use `test.describe.serial()` only for CEO tests that mutate shared state (role assignments).
- For most tests, use independent test users or seed fresh data per test.
- Clean up `user_roles` and `audit_logs` in `test.afterEach()` or setup script.

### Selectors to Add (if missing)

The following `data-testid` attributes should be added to components for stable E2E:

| Component | Selector | Location |
|-----------|----------|----------|
| Dashboard stats | `data-testid="dashboard-stats"` | `src/app/admin/_components/DashboardStats.tsx` |
| Save article button | `data-testid="save-article-btn"` | `src/components/admin/unified-editor/SaveAllBar.tsx` |
| Confirm dialog | `data-testid="confirm-dialog"` | `src/components/ui/alert-dialog.tsx` or custom modal |
| Empty state | `data-testid="empty-state"` | Various list components |
| Skeleton | `data-testid="skeleton"` | `src/components/ui/skeleton.tsx` |
| Search input | `data-testid="search-input"` | `src/app/admin/search/_components/ContentSearchClient.tsx` |
| Mobile menu button | `data-testid="mobile-menu-btn"` | `src/app/admin/_components/AdminShell.tsx` |
| Command palette | `data-testid="command-palette"` | Command palette component |
| Audit log table | `data-testid="audit-log-table"` | `src/app/admin/audit/page.tsx` |

---

## Evidence

- Playwright setup: `playwright.config.ts`
- Existing e2e: `e2e/`
- Auth fixture: `e2e/support/authenticated-demo.ts`
- Admin POM candidates: `src/app/admin/_components/`
