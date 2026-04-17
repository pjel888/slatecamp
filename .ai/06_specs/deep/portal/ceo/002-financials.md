# CEO Financials

**Analysis Date:** 2026-04-06

## Overview

Financial management and reporting tools for the CEO portal. All amounts in Philippine Peso (PHP).

**Source:** `src/components/ceo/`, `src/lib/queries/ceo/financial-queries.ts`

## Financial Views

### Revenue vs. Expenses

Combined comparison chart:
- Revenue line (stacked area)
- Expense line
- Profit/loss shading
- Period selector (monthly, quarterly, annual)

**Source:** `src/components/ceo/RevenueExpenseChart.tsx`

### Expense Breakdown

Category-based expense visualization:
- Engineering
- Content
- Marketing
- Operations

**Source:** `src/components/ceo/ExpenseBreakdownChart.tsx`

### Department Costs

Cost tracking by department over time:
- DepartmentCostChart (Recharts)
- Aggregated from `getDepartmentCosts()`

**Source:** `src/components/ceo/DepartmentCostChart.tsx`

## Financial Entry

Manual financial data entry:
- `FinancialEntryForm.tsx` — Date, description, category, amount, type
- `ExportButton.tsx` — CSV/JSON export
- `FinancialLedger.tsx` — Transaction table with sort/filter

**Source:** `src/components/ceo/FinancialEntryForm.tsx`

## Unit Economics

```typescript
interface UnitEconomics {
  ltv: number;      // Lifetime Value
  cac: number;      // Customer Acquisition Cost
  arpu: number;     // Average Revenue Per User
  ltvCacRatio: number;
  paybackMonths: number;
}
```

**Source:** `src/types/ceo.ts`, `src/lib/queries/ceo/financial-queries.ts`

## Cohort Retention

`CohortRetentionTable.tsx` — Cohort analysis grid:
- Rows: Monthly signup cohorts
- Columns: Months since signup
- Cells: Retention rate (color-coded green→red)
- Highlights high-risk cohorts

**Source:** `src/components/ceo/CohortRetentionTable.tsx`

## Churn Risk

`ChurnRiskBars.tsx` — Horizontal bar chart:
- Segments: Free, Camp, Insurance, Institutional
- Color-coded by risk level
- Tooltip with absolute numbers

**Source:** `src/components/ceo/ChurnRiskBars.tsx`

## Time-to-Value Funnel

`TimeToValueFunnel.tsx` — Conversion funnel:
```
Signup → First Session → 10 Sessions → Subscription
```
Shows conversion rates at each stage.

**Source:** `src/components/ceo/TimeToValueFunnel.tsx`

---

*CEO financials: 2026-04-06*
