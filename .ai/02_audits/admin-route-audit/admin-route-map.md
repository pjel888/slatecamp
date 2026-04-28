# Admin Route Map

**Last Updated:** 2026-04-27

## Route Tree

```
/admin
├── /                          Dashboard (overview, stats, needs attention)
├── /login                     Public admin login (no portal chrome)
├── /3d-models                 3D Models Registry
├── /activity                  Activity Feed (audit logs, last 50)
├── /articles/[id]             Article detail (legacy route, loading only)
├── /assets                    3D Asset Manager
├── /assets/[id]               Asset Detail
├── /audit                     Audit Log (super admin only)
├── /dashboard                 Dashboard (same as /admin root, loading only)
├── /knowledge                 Knowledge Browser
├── /knowledge/[id]            Article Editor (full-bleed unified editor)
├── /knowledge/analytics       Quality Analytics
├── /knowledge/import          Bulk Question Import
├── /knowledge/new             Create Article (full-bleed)
├── /knowledge/questions       Question Bank
├── /knowledge/questions/[id]  Question Editor
├── /knowledge/questions/design-problems       Design Problem Bank
├── /knowledge/questions/design-problems/[id]  Design Problem Editor
├── /knowledge/questions/new                   Create Question
├── /knowledge/questions/scenarios             Scenario Question Bank
├── /knowledge/questions/scenarios/[id]        Scenario Editor
├── /pipeline                  Publishing Pipeline (Kanban)
├── /preview/[previewId]       Draft Preview (no chrome, no loading)
├── /reviews                   SME Review Queue
├── /search                    Content Search
├── /settings                  Admin Settings / Role Manager (super admin only)
├── /taxonomy                  Taxonomy Editor
├── /taxonomy/coverage         Coverage Map
└── /wiki                      Legacy redirect → /admin/knowledge
```

## Layouts, Loading, and Error Boundaries

| Path | Layout | Loading | Error | Notes |
|------|--------|---------|-------|-------|
| `/admin` | `layout.tsx` | `loading.tsx` | `error.tsx` | Root layout with auth gate |
| `/admin/login` | `layout.tsx` (bypass chrome) | `loading.tsx` | — | Public route within admin group |
| `/admin/search` | `search/layout.tsx` | `loading.tsx` | — | Custom layout (metadata only) |
| `/admin/preview/[previewId]` | `layout.tsx` | **None** | — | Intentionally no loading to replicate student view |
| All other routes | `layout.tsx` | `loading.tsx` | `error.tsx` | Inherited from root |

## Layout Details

### `src/app/admin/layout.tsx`
- **Type:** Async Server Component
- **Auth checks:**
  1. Public bypass for `/admin/login`
  2. `getUser()` → redirect to login if unauthenticated
  3. `canReviewContent()` → redirect to dashboard if not admin
  4. `getUserRole()` → redirect to dashboard if no role
- **Data:** `getNeedsAttentionData()` → pending review count
- **Props to AdminShell:** `role`, `badgeCounts`, `noPadding`
- **Full-bleed detection:** Regex `^\/admin\/knowledge(\/questions)?\/[^/]+$` for editor routes

### `src/app/admin/error.tsx`
- **Type:** Client Component (`"use client"`)
- **Features:** Error message, digest ID, "Try again", "Back to Admin" link
- **Logs:** `[ADMIN ERROR]` prefix to console

## Middleware and Route Guards

### `src/lib/supabase/middleware.ts`
- First line of defense for all `/admin/*` paths
- Checks `canAccessAdminCmsForRole(role)` from entitlements
- Redirects to `/dashboard` if denied
- Logs `entitlement.denied` audit event
- Dev bypass: `DEV_FORCE_USER_ID` on localhost

### Layout-Level Guards
- `canReviewContent()` — minimum bar for any admin page
- `getUserRole()` — ensures role is resolved

### Page-Level Guards
| Page | Guard | Redirect on Denial |
|------|-------|-------------------|
| `/admin/3d-models` | `canReviewContent()` | `/admin/login` |
| `/admin/activity` | `isAdmin()` | `/admin` |
| `/admin/assets/[id]` | `canManageContent()` | `/admin/login` |
| `/admin/audit` | `isSuperAdmin()` | `/admin` |
| `/admin/knowledge` | `canManageContent()` | `/admin/login` |
| `/admin/knowledge/[id]` | `canManageContent() \|\| canReviewContent()` | — |
| `/admin/knowledge/import` | `canManageContent()` | `/admin/login` |
| `/admin/knowledge/new` | `canManageContent()` | `/admin/login` |
| `/admin/knowledge/questions` | `canManageContent()` | `/admin/login` |
| `/admin/knowledge/questions/[id]` | `canManageContent() \|\| canReviewContent()` | — |
| `/admin/knowledge/questions/design-problems` | `canManageContent()` | `/admin/login` |
| `/admin/knowledge/questions/design-problems/[id]` | `canManageContent()` | `/admin/login` |
| `/admin/knowledge/questions/new` | `canManageContent()` | `/admin/login` |
| `/admin/knowledge/questions/scenarios` | `canManageContent()` | `/admin/login` |
| `/admin/knowledge/questions/scenarios/[id]` | `canManageContent()` | `/admin/login` |
| `/admin/settings` | `isSuperAdmin()` | `/admin` |

## Related API/Server Routes

| Route | Purpose | Used By |
|-------|---------|---------|
| `src/lib/actions/admin/dashboard.ts` | Dashboard stats, subject distribution, needs attention | `/admin/page.tsx` |
| `src/lib/actions/admin/content.ts` | Article CRUD, MDX preview, taxonomy linking | `/admin/knowledge/*` |
| `src/lib/actions/admin/questions.ts` | Standard question mutations | `/admin/knowledge/questions/*` |
| `src/lib/actions/admin/question-queries.ts` | Question fetching, grouping, analytics | `/admin/knowledge/*` |
| `src/lib/actions/admin/design-problems.ts` | Design problem CRUD | `/admin/knowledge/questions/design-problems/*` |
| `src/lib/actions/admin/design-scenarios.ts` | Design scenario CRUD | `/admin/knowledge/questions/scenarios/*` |
| `src/lib/actions/admin/wiki.ts` | Wiki article CRUD + review workflow | `/admin/knowledge/*` |
| `src/lib/actions/admin/pipeline.ts` | Pipeline status transitions | `/admin/pipeline` |
| `src/lib/actions/admin/taxonomy.ts` | Taxonomy tree CRUD | `/admin/taxonomy` |
| `src/lib/actions/admin/coverage.ts` | Coverage map data | `/admin/taxonomy/coverage` |
| `src/lib/actions/admin/assets.ts` | 3D asset CRUD + upload | `/admin/assets/*` |
| `src/lib/actions/admin/roles.ts` | Admin user role management | `/admin/settings` |
| `src/lib/actions/admin/bulk.ts` | Bulk delete operations | `/admin/knowledge/*` |
| `src/lib/actions/admin/dashboard.ts` | Dashboard data aggregation | `/admin/page.tsx` |

## Related `/ceo` Routes

| Route | Purpose | Relevance to Admin RBAC |
|-------|---------|------------------------|
| `/ceo` | Command Center (North Star, Business Health) | — |
| `/ceo/analytics` | 8 analytics sections | **Missing `verifyCeoAccess()`** |
| `/ceo/financials` | Financial ledger, P&L, runway | Has `verifyCeoAccess()` |
| `/ceo/insights` | Behavioral insights | **Missing `verifyCeoAccess()`** |
| `/ceo/team` | Team roster, role assignment | Has `verifyCeoAccess()`; `RoleAssignmentModal` can assign roles |

## Evidence

- Routes: `src/app/admin/`
- Layout: `src/app/admin/layout.tsx`
- Error: `src/app/admin/error.tsx`
- Middleware: `src/lib/supabase/middleware.ts`
- Admin role helpers: `src/lib/admin/roles.ts`
- Entitlements: `src/lib/entitlements/policy.ts`
- CEO layout: `src/app/(protected)/ceo/layout.tsx`
- CEO team actions: `src/lib/actions/ceo/team-actions.ts`
