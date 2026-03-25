<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 -->

# ceo

## Purpose

CEO dashboard components for SlateCamp business operations. Displays financial metrics (revenue, expenses, runway), team management, cohort retention, churn risk, and time-to-value analytics. All components are client-side with Recharts for charting and Supabase-backed data via server actions. Uses the PortalLayout shell from `@/components/portal`.

## Key Files

| File | Description |
|------|-------------|
| `RevenueChart.tsx` | Recharts stacked AreaChart: revenue breakdown by stream (subscriptions, consulting, content). Break-even reference line. Custom tooltip with totals. `'use client'` |
| `RevenueExpenseChart.tsx` | Recharts combined revenue vs. expense comparison chart. Shows profitability trend over time. `'use client'` |
| `ExpenseBreakdownChart.tsx` | Recharts chart showing expense categories (engineering, content, marketing, ops). `'use client'` |
| `RunwayGauge.tsx` | Visual runway indicator with status tiers: Profitable (green, 999+ months), Secure (green, 12+ months), Monitor (amber, 6-12 months), Critical (red, <6 months). Shows cash on hand. `'use client'` |
| `DepartmentCostChart.tsx` | Recharts chart of costs per department over time. `'use client'` |
| `ChurnRiskBars.tsx` | Horizontal bar chart of churn risk by user segment. Color-coded by risk level. `'use client'` |
| `CohortRetentionTable.tsx` | Cohort retention grid: rows = monthly cohorts, columns = months since signup. Color-coded cells (green high retention, red low). `'use client'` |
| `TimeToValueFunnel.tsx` | Funnel visualization: signup -> first session -> 10 sessions -> subscription. Shows conversion rates. `'use client'` |
| `TeamTable.tsx` | Team member management table with department filter tabs, alumni toggle, role assignment modal. Uses DataTable from shared. `'use client'` |
| `RoleAssignmentModal.tsx` | Modal for assigning/changing team member roles. Dialog with role selector. `'use client'` |
| `FinancialLedger.tsx` | Table of financial transactions: date, description, category, amount. Sortable, filterable. `'use client'` |
| `FinancialEntryForm.tsx` | Form for adding financial entries: date, description, category dropdown, amount, type (revenue/expense). `'use client'` |
| `ExportButton.tsx` | CSV/JSON export button for financial data. `'use client'` |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `skeletons/` | Loading skeleton components for CEO dashboard cards and charts | 3 files |

### skeletons/

| File | Description |
|------|-------------|
| `ChartSkeleton.tsx` | Animated skeleton placeholder for chart areas. |
| `MetricCardSkeleton.tsx` | Animated skeleton for metric summary cards (eyebrow + value + trend). |
| `TableSkeleton.tsx` | Animated skeleton for data tables. |

## For AI Agents

### Working In This Directory

1. **CEO types from `@/types/ceo`.** All financial types (RevenueBreakdown, TeamMember, TeamDepartment, etc.), color constants (CEO_CHART_COLORS, DEPARTMENT_COLORS), and formatting utilities (formatPeso) are defined in `@/types/ceo`. Do NOT duplicate.

2. **Server actions from `@/lib/actions/ceo/`.** Financial data fetching and mutations use server actions in `@/lib/actions/ceo/`. Components receive data as props from server-rendered parent pages.

3. **Recharts integration.** All charts use ResponsiveContainer for responsive sizing. Use CEO_CHART_COLORS for consistent color palette across charts. Custom tooltips follow the same pattern (check active, render payload).

4. **Runway status tiers.** RunwayGauge uses semantic CSS variables (`bg-success`, `bg-warning`, `bg-destructive`) rather than hardcoded hex values. The tier logic is: Profitable (999+), Secure (12+), Monitor (6-12), Critical (<6 months).

5. **DataTable reuse.** TeamTable and FinancialLedger use `DataTable` from `@/components/shared/data-table` for consistent table behavior (sorting, filtering, pagination).

6. **Portal layout.** The CEO dashboard uses `PortalLayout` from `@/components/portal` as its shell. CEO-specific nav items and accent colors are configured in the CEO layout.tsx.

7. **Currency formatting.** Use `formatPeso()` from `@/types/ceo` for all monetary values. Do NOT format currency manually.

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/types/ceo` | RevenueBreakdown, TeamMember, CEO_CHART_COLORS, DEPARTMENT_COLORS, formatPeso |
| `@/lib/actions/ceo/*` | Server actions for financial and team data |
| `@/components/shared/data-table` | DataTable, Column type for TeamTable and FinancialLedger |
| `@/components/ui/*` | Button, Dialog, Badge, Input, Select |
| `@/components/portal` | PortalLayout shell (consumed by CEO layout.tsx) |
| `@/lib/utils` | cn() for class merging |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **recharts** | AreaChart, BarChart, ResponsiveContainer, Tooltip, Legend | ^3.8.0 |
| **react** | Hooks: useState, useMemo | ^19.2.4 |
| **lucide-react** | Icons: Pencil, ShieldCheck | ^0.577.0 |

<!-- MANUAL: -->
