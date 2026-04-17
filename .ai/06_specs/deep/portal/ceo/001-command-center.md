# CEO Command Center

**Analysis Date:** 2026-04-06

## Overview

The CEO Command Center is the primary business dashboard view. It provides a real-time overview of SlateCamp's financial health, user engagement, and growth metrics.

**Source:** `src/app/(protected)/ceo/`, `src/components/ceo/`

## Key Metrics

| Metric | Source | Display |
|--------|--------|---------|
| MRR (Monthly Recurring Revenue) | `mv_financial_summary` | Currency + trend |
| ARR (Annual Recurring Revenue) | Computed from MRR | Currency |
| Monthly Burn | `mv_financial_summary` | Currency |
| Net Profit | MRR − Burn | Currency + trend |
| Cash on Hand | Manual entry | Currency |
| Runway | Cash / Monthly Burn | Gauge |

**Source:** `src/lib/queries/ceo/financial-queries.ts`

## Runway Gauge

Visual indicator with status tiers:
- **Profitable (999+ months):** Emerald — sustained profitability
- **Secure (12+ months):** Emerald — healthy runway
- **Monitor (6–12 months):** Amber — attention needed
- **Critical (<6 months):** Warm Red — immediate action required

**Source:** `src/components/ceo/RunwayGauge.tsx`

## Revenue Chart

Stacked AreaChart showing revenue breakdown:
- Subscriptions (primary revenue)
- Consulting
- Content sales
- Break-even reference line

Custom tooltip with totals per category.

**Source:** `src/components/ceo/RevenueChart.tsx`

## DataTable Components

Two main tables:
- **FinancialLedger** — All transactions (sortable, filterable)
- **TeamTable** — Team roster with department filter and role assignment

Both use `DataTable` from `@/components/shared/data-table/`.

**Source:** `src/components/ceo/FinancialLedger.tsx`, `src/components/ceo/TeamTable.tsx`

---

*CEO command center: 2026-04-06*
