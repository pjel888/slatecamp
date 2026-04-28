# QA Test Plan

**Last Updated:** 2026-04-28

## Smoke Tests

| ID | Title | Priority | Steps | Expected Result |
|----|-------|----------|-------|-----------------|
| SM-01 | Developer portal loads for authorized user | P0 | Login as developer role → navigate to `/developer` | Page loads with overview metrics |
| SM-02 | Developer portal redirects unauthorized user | P0 | Login as member → navigate to `/developer` | Redirects to `/dashboard` |
| SM-03 | All developer routes load without error | P0 | Navigate to each `/developer/*` route | No 500 errors, content renders |
| SM-04 | Layout renders sidebar and search | P0 | Visit `/developer` | Sidebar with nav groups, search button visible |

## Functional Tests

| ID | Title | Priority | Steps | Expected Result |
|----|-------|----------|-------|-----------------|
| FN-01 | Overview shows metrics | P1 | Visit `/developer` | User count, article count, question count, session count visible |
| FN-02 | Overview shows system health | P1 | Visit `/developer` | Database, API, Auth, Edge status dots visible |
| FN-03 | API reference tabs work | P1 | Visit `/developer/api-reference` → click each tab | Tab content switches |
| FN-04 | EndpointCard expands | P1 | Visit `/developer/api-reference` → click endpoint card | Expanded content visible |
| FN-05 | Architecture tabs work | P1 | Visit `/developer/architecture` → click each tab | Tab content switches |
| FN-06 | Status page shows KPIs | P1 | Visit `/developer/status` | Banner, KPI cards, uptime bars visible |
| FN-07 | Database status shows pool bar | P1 | Visit `/developer/status/database` | Connection pool bar, table list, migrations visible |
| FN-08 | Infrastructure status shows latency | P1 | Visit `/developer/status/infrastructure` | P50/P95/P99 cards, edge functions, deployment visible |
| FN-09 | Dev tools landing shows cards | P1 | Visit `/developer/tools` | Console, DB, Logs, Test Data cards visible |
| FN-10 | Console loads feature flags | P1 | Visit `/developer/tools/console` | Feature flag board visible |
| FN-11 | Database browser shows tables | P1 | Visit `/developer/tools/db` | DataTable with tables, rows, RLS visible |
| FN-12 | Logs show audit and application errors | P1 | Visit `/developer/tools/logs` | Both sections render (may be empty) |
| FN-13 | Test data generator creates sessions | P1 | Visit `/developer/tools/test-data` → click Generate Sessions | Success message appears |
| FN-14 | Test data generator creates org | P1 | Visit `/developer/tools/test-data` → click Generate Org | Success message appears |

## Permission Boundary Tests

| ID | Title | Priority | Role | Steps | Expected Result |
|----|-------|----------|------|-------|-----------------|
| PB-01 | Member denied developer portal | P0 | member | Navigate to `/developer` | Redirect to `/dashboard` |
| PB-02 | Anonymous denied developer portal | P0 | anonymous | Navigate to `/developer` | Redirect to `/login` |
| PB-03 | SME reviewer denied developer portal | P0 | sme_reviewer | Navigate to `/developer` | Redirect to `/dashboard` |
| PB-04 | Developer allowed | P0 | developer | Navigate to `/developer` | Page loads |
| PB-05 | Admin allowed | P0 | admin | Navigate to `/developer` | Page loads |
| PB-06 | Content admin allowed | P0 | content_admin | Navigate to `/developer` | Page loads |
| PB-07 | CEO allowed | P0 | ceo | Navigate to `/developer` | Page loads |
| PB-08 | Super admin allowed | P0 | super_admin | Navigate to `/developer` | Page loads |
| PB-09 | Owner allowed | P0 | owner | Navigate to `/developer` | Page loads |

## Negative Authorization Tests

| ID | Title | Priority | Steps | Expected Result |
|----|-------|----------|-------|-----------------|
| NA-01 | Direct API call to test-data by member | P1 | As member, call `generateTestSessions` | Rejected with auth error |
| NA-02 | Direct API call to db-viewer by member | P1 | As member, call `getTableInfo` | Rejected with auth error |
| NA-03 | Audit logs require super admin | P1 | As developer (non-super), visit logs page | Application errors visible; audit logs show error state |

## UI State Tests

| ID | Title | Priority | Steps | Expected Result |
|----|-------|----------|-------|-----------------|
| UI-01 | Loading states render | P1 | Throttle network → navigate to `/developer` | Skeleton loaders visible |
| UI-02 | Empty states render | P1 | Visit `/developer/tools/logs` with no data | Empty state messages visible |
| UI-03 | Error boundary catches errors | P1 | Simulate error in developer page | Error boundary renders with retry button |
| UI-04 | Not found page renders | P2 | Visit `/developer/nonexistent` | 404 page with back link |

## Form Validation Tests

| ID | Title | Priority | Steps | Expected Result |
|----|-------|----------|-------|-----------------|
| FV-01 | Test data generation handles no exam profile | P1 | Click Generate Sessions with no exam profile | Message: "No active exam profile found" |
| FV-02 | Test data generation handles no subjects | P1 | Click Generate Sessions with no subjects | Message: "No subjects found" |

## Error Handling Tests

| ID | Title | Priority | Steps | Expected Result |
|----|-------|----------|-------|-----------------|
| EH-01 | DB browser handles RPC failure | P1 | Visit `/developer/tools/db` when RPC unavailable | Falls back to known table list |
| EH-02 | Logs handle audit log unavailability | P1 | Visit `/developer/tools/logs` when audit_logs unavailable | Error state with message |
| EH-03 | Status API failure handled gracefully | P1 | Block `status.supabase.com` → visit `/developer/status` | All systems show operational |

## Responsive Layout Tests

| ID | Title | Priority | Steps | Expected Result |
|----|-------|----------|-------|-----------------|
| RL-01 | Mobile layout | P2 | View `/developer` at 375px width | Content stacks, sidebar accessible via mobile nav |
| RL-02 | Tablet layout | P2 | View `/developer` at 768px width | Grid adjusts to 2 columns |
| RL-03 | Desktop layout | P2 | View `/developer` at 1440px width | Full 3-column grid visible |

## Keyboard Tests

| ID | Title | Priority | Steps | Expected Result |
|----|-------|----------|-------|-----------------|
| KB-01 | Tab navigation | P1 | Press Tab through `/developer` | All interactive elements reachable |
| KB-02 | Search shortcut | P1 | Press ⌘K on `/developer` | Command palette opens |
| KB-03 | Endpoint card keyboard | P1 | Tab to endpoint card → press Enter | Card expands |

## Accessibility Tests

| ID | Title | Priority | Steps | Expected Result |
|----|-------|----------|-------|-----------------|
| AX-01 | Heading hierarchy | P1 | Run axe DevTools on `/developer` | No heading-order violations |
| AX-02 | Color contrast | P1 | Run axe DevTools on `/developer` | No contrast violations |
| AX-03 | ARIA usage | P1 | Run axe DevTools on `/developer/api-reference` | No invalid ARIA |

## Regression Tests

| ID | Title | Priority | Steps | Expected Result |
|----|-------|----------|-------|-----------------|
| RG-01 | Legacy redirect works | P2 | Visit `/dashboard/settings/developer` | Redirects to `/developer` |
| RG-02 | Middleware redirect works | P2 | Visit `/developer` as unauthenticated | Redirects to `/login?next=/developer` |

## Evidence

- E2E tests: `e2e/admin-permissions-developer.spec.ts`
- Access boundaries: `e2e/access-boundaries.spec.ts`
- Components: `src/components/developer/`
