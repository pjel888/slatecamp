<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# admin

## Purpose

Admin control room for content and system management. Gated by role check (`canReviewContent()`). Admins create/edit/delete questions, wiki articles, manage taxonomy, review content submissions, audit logs, and manage 3D assets. Public landing page at `/admin` accepts Google OAuth. Protected routes redirect unauthorized users to `/dashboard`.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Admin landing page. Public, unauthenticated. Google OAuth sign-in button. No layout applied (public landing bypass in layout.tsx). |
| `layout.tsx` | Admin layout wrapper. Protects all routes except `/admin` root. Checks `canReviewContent()`, redirects non-admins to dashboard. Renders sidebar nav, admin header with back/logout links, main content area. |
| `error.tsx` | Admin route error boundary. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `dashboard/` | Admin dashboard homepage. Stats cards (question count, wiki count, 3D asset count). Quick management grid (new question, new article, manage taxonomy, audit logs). |
| `questions/` | Question bank CRUD. List view with filtering/search, create new, edit `[id]`, bulk import. |
| `wiki/` | Wiki article CRUD. Article list, create new, edit `[id]`. Full text editor for markdown content. |
| `taxonomy/` | Taxonomy tree management. View/edit taxonomy nodes, discipline structure, level hierarchy. |
| `reviews/` | Content review queue. User submissions pending admin review. (Currently placeholder: "No pending reviews.") |
| `audit/` | Audit logs viewer. System events, user actions, admin changes. Time-indexed, filterable. |
| `assets/` | 3D asset management. Upload, catalog, preview 3D models used in 3D Lab. |

## For AI Agents

### Working In This Directory

- Admin routes are **Server Components by default** with inline async/await.
- The **layout.tsx enforces a public bypass**: `/admin` root page returns `<>{children}</>` without auth check (allows OAuth landing page).
- All other routes check `canReviewContent()` and redirect non-admins to `/dashboard`.
- Data is fetched server-side using `@/lib/actions/admin/*` Server Actions.
- The sidebar layout is controlled by layout.tsx and AdminNav component (not by each page).

### Common Patterns

- **Public landing:** `/admin` page is unauthenticated, uses Google OAuth, then redirects to `/admin/dashboard`.
- **Protected routes:** Use Server Action queries from `@/lib/actions/admin/` (e.g., `getAdminStats()`, `getQuestions()`, `getArticles()`).
- **Auth check:** Layout checks `canReviewContent()` once; child pages assume auth is valid.
- **Sidebar nav:** Centralized in `AdminNav` component; update there for new routes.
- **UI:** Cards use border + bg-white, no shadows at rest. Icons from `@phosphor-icons/react`. Consistent with Campfire design tokens.
- **Forms:** Question/wiki/taxonomy forms are client-side (marked with `'use client'`) for interactivity.

## Dependencies

### Internal

- `@/lib/supabase/server` — `createClient()`, `getUser()` for auth.
- `@/lib/admin/roles` — `canReviewContent()` for authorization check.
- `@/lib/actions/admin/dashboard` — `getAdminStats()`.
- `@/lib/actions/admin/question-queries` — `getQuestions()`.
- `@/lib/actions/admin/wiki-queries` — `getArticles()`.
- `@/components/admin/AdminNav` — Sidebar navigation.
- `@/components/admin/QuestionList` — Question list and bulk actions.
- `@/components/admin/WikiArticleList` — Wiki article list and bulk actions.
- `@/components/auth/SignInWithGoogleButton` — OAuth button for landing page.
- `@/components/auth/SignOutButton` — Logout button in header.
- `@/lib/constants/routes` — ROUTES constant for redirects.
- `next/navigation` — `redirect()`.
- `next/headers` — `headers()` for x-pathname.
- `@phosphor-icons/react` — Icon library (Question, FileText, Cube, etc.).

<!-- MANUAL: Admin OAuth redirect target is /admin/dashboard. Update ROUTES.ADMIN_DASHBOARD if URL structure changes. -->
