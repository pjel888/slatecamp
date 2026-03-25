<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# (protected)

## Purpose

Next.js route group for role-gated portals that require elevated permissions beyond standard authentication. Currently houses the CEO Dashboard portal, which provides business analytics, financial tracking, team management, and behavioral insights for executives. The `(protected)` prefix is a route group -- it does not appear in the URL path.

## Key Files

| File | Description |
|------|-------------|
| (none at group level) | Route group has no layout or page of its own; each child portal defines its own layout |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `ceo/` | CEO Dashboard portal -- business metrics, financials, engagement insights, team management |

## CEO Portal Structure

| File / Directory | Description |
|------------------|-------------|
| `ceo/layout.tsx` | CEO layout -- verifies auth + `ceo`/`super_admin` role, redirects unauthorized users, wraps children in `CeoShell` |
| `ceo/page.tsx` | Command center -- North Star metrics (MRR, ARR, runway, paying users, conversion), business health charts (runway gauge, revenue), engagement health (DAU/MAU, WAU, streaks), unit economics (CAC, LTV, LTV:CAC ratio, ARPU) |
| `ceo/loading.tsx` | Skeleton loading state for CEO dashboard |
| `ceo/financials/page.tsx` | Financial ledger -- revenue/expense charts, expense breakdown, export functionality. Uses `BREAK_EVEN_MRR` threshold (172,000 PHP) |
| `ceo/insights/page.tsx` | Behavioral insights -- cohort retention table, churn risk bars, time-to-value funnel, churn signals |
| `ceo/team/page.tsx` | Team management -- team member table, department cost chart, monthly cost tracking |
| `ceo/_components/CeoShell.tsx` | Client component -- portal shell using `PortalLayout` with CEO-specific nav groups (Business, Product, Operations, Settings) |

## For AI Agents

### Working In This Directory

- **Role check is mandatory:** The CEO layout (`layout.tsx`) verifies the user has `ceo` or `super_admin` role via Supabase profile query. Non-qualifying users are redirected to `/dashboard`.
- **Server Components with Suspense:** All page-level data fetching uses async Server Components wrapped in `<Suspense>` boundaries with skeleton fallbacks.
- **Currency formatting:** Use `formatPeso()`, `formatPercent()`, `formatRatio()` from `@/types/ceo` -- never raw number display.
- **Portal shell pattern:** `CeoShell` wraps all pages with `PortalLayout` from `@/components/portal`, providing sidebar navigation, topbar branding, and consistent layout. Portal config comes from `@/config/portals`.
- **Nav structure:** Business (Dashboard, Revenue, Growth), Product (Users, Outcomes, Content), Operations (Team, Financials), Settings.
- **Data sources:** Financial queries in `@/lib/queries/ceo/financial-queries.ts`, user/engagement queries in `@/lib/queries/ceo/user-queries.ts`, team queries in `@/lib/queries/ceo/team-queries.ts`.
- **Access verification helper:** Use `verifyCeoAccess()` from `@/lib/queries/ceo/auth` in pages that need explicit auth checks beyond the layout.

### Testing Requirements

- Verify role-gating: non-CEO users must be redirected to `/dashboard`
- Verify unauthenticated users redirect to `/login`
- Confirm financial data displays with proper PHP currency formatting
- Ensure Suspense fallbacks render correctly during data loading
- Test with null/missing data -- all metric cards should show `"--"` gracefully

### Common Patterns

- `StatCard` from `@/components/shared/stat-card` for metric display
- `Eyebrow` from `@/components/ui/eyebrow` for section labels
- `Promise.all()` for parallel data fetching in async Server Components
- Chart components from `@/components/ceo/` (RunwayGauge, RevenueChart, etc.)
- Skeleton components from `@/components/ceo/skeletons/` for loading states

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/supabase/server` | `createClient` for server-side Supabase queries |
| `@/lib/queries/ceo/financial-queries` | `getFinancialSummary`, `getRevenueBreakdown`, `getUnitEconomics`, `getEngagementPreview`, `getPayingUserCount` |
| `@/lib/queries/ceo/user-queries` | `getEngagementSnapshot`, `getCohortRetention`, `getChurnRiskDistribution`, `getTimeToValue`, `getChurnSignals` |
| `@/lib/queries/ceo/team-queries` | `getTeamMembers`, `getDepartmentCosts` |
| `@/lib/queries/ceo/auth` | `verifyCeoAccess` -- throws/redirects if not authorized |
| `@/lib/actions/ceo/` | `export-actions`, `financial-actions`, `team-actions` -- server actions for mutations |
| `@/types/ceo` | `FinancialEntry`, `formatPeso`, `formatPercent`, `formatRatio`, `CATEGORY_LABELS` |
| `@/components/ceo/` | 13 CEO-specific components: charts, tables, gauges, forms, export buttons |
| `@/components/shared/stat-card` | Reusable metric card |
| `@/components/portal` | `PortalLayout` -- shared shell for all portals |
| `@/config/portals` | Portal configuration (label, colors, back navigation) |

### External

| Package | Purpose |
|---------|---------|
| `lucide-react` | Icons for CEO navigation |
| `recharts` | Chart rendering (revenue, expenses, retention) |

<!-- MANUAL: -->
