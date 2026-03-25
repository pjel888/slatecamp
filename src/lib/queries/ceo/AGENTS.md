<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# queries/ceo

## Purpose

CEO portal read queries and authorization. Provides financial summaries, team data, user engagement snapshots, cohort analysis, and churn risk segmentation. All queries require CEO or super_admin role. Used by CEO server components and CEO server actions.

## Key Files

| File | Description |
|------|-------------|
| **auth.ts** | `verifyCeoAccess()` -- server component auth (redirects on failure). `assertCeoRole()` -- server action auth (throws on failure). Both check `profiles.role` for `ceo` or `super_admin`. |
| **financial-queries.ts** | `getFinancialSummary()` -- MRR, monthly burn, net profit, runway. `getRevenueBreakdown()` -- revenue by category. `getUnitEconomics()` -- LTV, CAC, ARPU. |
| **team-queries.ts** | `getTeamMembers()` -- all team members from `ceo_team_members` with role, department, cost. `getDepartmentCosts()` -- aggregated cost by department. |
| **user-queries.ts** | `getEngagementSnapshot()` -- DAU/WAU/MAU, session frequency, streak data (uses `mv_engagement_snapshot` materialized view). `getCohortRetention()`, `getChurnRiskSegments()`, `getTimeToValue()`. |

## For AI Agents

### Working In This Directory

1. **Two auth patterns.** `verifyCeoAccess()` redirects (for server components). `assertCeoRole()` throws (for server actions in `@/lib/actions/ceo/`).
2. **Materialized views.** `user-queries.ts` reads from `mv_engagement_snapshot` for performance, with fallback to live queries.
3. **Currency is PHP.** Financial amounts are in Philippine Peso. Use `formatPeso()` from `@/types/ceo` for display.
4. **Read-only.** No mutations here. Writes go through `@/lib/actions/ceo/`.

## Dependencies

### Internal

- `@/lib/supabase/server` -- `createClient()` for authenticated queries
- `@/types/ceo` -- `FinancialSummary`, `TeamMember`, `EngagementSnapshot`, `CohortRow`, `ChurnRiskSegment`, etc.

### External

- `next/navigation` -- `redirect` (auth.ts)
