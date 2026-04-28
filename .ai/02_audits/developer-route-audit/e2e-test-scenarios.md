# E2E Test Scenarios

**Last Updated:** 2026-04-28
**Framework:** Playwright

## Scenarios

### SC-01: Anonymous Access Denied

```
Test ID: SC-01
Title: Anonymous users cannot access developer portal
Priority: P0
Preconditions: User is not logged in
Role/permission: anonymous
Steps:
  1. Navigate to /developer
Expected result:
  - Redirects to /login?next=/developer
  - HTTP 307/308 status
Automation candidate: Yes
```

### SC-02: Member Access Denied

```
Test ID: SC-02
Title: Member users are redirected from developer portal
Priority: P0
Preconditions: User logged in with member role
Role/permission: member
Steps:
  1. Navigate to /developer
Expected result:
  - Redirects to /dashboard
  - No developer portal content visible
Automation candidate: Yes
```

### SC-03: Developer Role Can Access Portal

```
Test ID: SC-03
Title: Developer role can access developer portal
Priority: P0
Preconditions: User logged in with developer role
Role/permission: developer
Steps:
  1. Navigate to /developer
  2. Wait for page to load
Expected result:
  - URL is /developer
  - Page contains "Developer Portal" or "Internal Docs"
  - Sidebar navigation visible
Automation candidate: Yes
```

### SC-04: Developer Can Access All Sub-Routes

```
Test ID: SC-04
Title: Developer can navigate to all developer sub-routes
Priority: P1
Preconditions: User logged in with developer role
Role/permission: developer
Steps:
  1. Navigate to /developer/api-reference
  2. Navigate to /developer/architecture
  3. Navigate to /developer/status
  4. Navigate to /developer/status/database
  5. Navigate to /developer/status/infrastructure
  6. Navigate to /developer/tools
  7. Navigate to /developer/tools/console
  8. Navigate to /developer/tools/db
  9. Navigate to /developer/tools/logs
  10. Navigate to /developer/tools/test-data
Expected result:
  - All pages load without 500 errors
  - Each page shows expected content
Automation candidate: Yes
```

### SC-05: Unauthorized Direct Server Action Rejected

```
Test ID: SC-05
Title: Direct server action calls by unauthorized users are rejected
Priority: P1
Preconditions: User logged in with member role
Role/permission: member
Steps:
  1. Attempt to call generateTestSessions via API (if exposed) or simulate
Expected result:
  - Action rejects with "Not authorized" error
  - No test data created
Automation candidate: Partial (requires action exposure)
```

### SC-06: Test Data Generation Workflow

```
Test ID: SC-06
Title: Developer can generate test data
Priority: P1
Preconditions: User logged in with developer role, has active exam profile
Role/permission: developer
Steps:
  1. Navigate to /developer/tools/test-data
  2. Click "Generate Sessions"
  3. Wait for success message
Expected result:
  - Button shows "Generating..." during action
  - Success message appears: "Generated X/5 test sessions"
  - No error toast shown
Automation candidate: Yes
```

### SC-07: Database Browser Shows Tables

```
Test ID: SC-07
Title: Database browser displays table metadata
Priority: P1
Preconditions: User logged in with developer role
Role/permission: developer
Steps:
  1. Navigate to /developer/tools/db
  2. Wait for table to load
Expected result:
  - DataTable renders with table names
  - Row counts visible
  - RLS status visible
  - Search and sort functional
Automation candidate: Yes
```

### SC-08: Logs Page Shows Application Errors

```
Test ID: SC-08
Title: Logs page displays application errors for developers
Priority: P1
Preconditions: User logged in with developer role, application errors exist
Role/permission: developer
Steps:
  1. Navigate to /developer/tools/logs
  2. Scroll to Application Errors section
Expected result:
  - DataTable renders with error events
  - Severity, family, route, message columns visible
Automation candidate: Yes
```

### SC-09: Audit Logs Require Super Admin

```
Test ID: SC-09
Title: Audit logs section shows error for non-super-admin developers
Priority: P1
Preconditions: User logged in with developer role (not super admin)
Role/permission: developer
Steps:
  1. Navigate to /developer/tools/logs
  2. Scroll to Audit Logs section
Expected result:
  - Empty state or error message: "Audit logs are unavailable"
Automation candidate: Yes
```

### SC-10: Status Page Shows Health Metrics

```
Test ID: SC-10
Title: Status dashboard shows system health
Priority: P1
Preconditions: User logged in with developer role
Role/permission: developer
Steps:
  1. Navigate to /developer/status
Expected result:
  - Status banner visible
  - KPI cards visible (Database, API, Edge, Gateway)
  - Uptime bars visible
Automation candidate: Yes
```

### SC-11: API Reference Endpoint Expansion

```
Test ID: SC-11
Title: API reference endpoint cards expand on click
Priority: P2
Preconditions: User logged in with developer role
Role/permission: developer
Steps:
  1. Navigate to /developer/api-reference
  2. Click on an endpoint card with details
Expected result:
  - Card expands showing request schema, response, curl example
  - Chevron rotates
Automation candidate: Yes
```

### SC-12: Command Palette Search

```
Test ID: SC-12
Title: Developer portal search works via keyboard shortcut
Priority: P2
Preconditions: User logged in with developer role
Role/permission: developer
Steps:
  1. Navigate to /developer
  2. Press Cmd+K (Mac) or Ctrl+K (Windows)
  3. Type "database"
  4. Press Enter on "Database Browser"
Expected result:
  - Command palette opens
  - Search filters results
  - Navigates to /developer/tools/db
Automation candidate: Yes
```

### SC-13: Sensitive Data Not Exposed

```
Test ID: SC-13
Title: Developer portal does not expose secrets or sensitive user data
Priority: P0
Preconditions: User logged in with developer role
Role/permission: developer
Steps:
  1. Navigate to /developer/architecture
  2. Check Deployment tab for env vars
  3. Navigate to /developer/tools/console
  4. Inspect system info
Expected result:
  - Only env var NAMES shown, not values
  - System info shows current user ID/email (acceptable for own data)
  - No SUPABASE_SERVICE_ROLE_KEY visible
Automation candidate: Yes
```

### SC-14: Mobile Navigation Works

```
Test ID: SC-14
Title: Developer portal navigation works on mobile
Priority: P2
Preconditions: User logged in with developer role
Role/permission: developer
Steps:
  1. Set viewport to 375px width
  2. Navigate to /developer
  3. Open mobile navigation
  4. Click "Status Overview"
Expected result:
  - Mobile nav opens
  - Navigates to /developer/status
  - Content is readable
Automation candidate: Yes
```

## Existing E2E Coverage

The following existing E2E tests cover developer portal:

- `e2e/admin-permissions-developer.spec.ts` — Developer role access matrix
- `e2e/access-boundaries.spec.ts` — Unauthenticated redirect to `/developer`

## Recommended New E2E Tests

1. `e2e/developer-portal-functionality.spec.ts` — Core functionality (SC-03 through SC-12)
2. `e2e/developer-portal-security.spec.ts` — Permission boundaries (SC-01, SC-02, SC-05, SC-09, SC-13)
3. `e2e/developer-portal-mobile.spec.ts` — Responsive behavior (SC-14)
