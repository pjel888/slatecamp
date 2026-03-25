<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# actions/ceo

## Purpose

CEO portal server actions for financial management, team administration, and investor report generation. All actions require CEO or super_admin role, verified via `assertCeoRole()` from `@/lib/queries/ceo/auth`. Financial data uses Philippine Peso (PHP) as the base currency.

## Key Files

| File | Description |
|------|-------------|
| **export-actions.ts** | `generateInvestorExport()` -- builds a markdown investor report combining financial summary, team data, paying/total user counts, and churn metrics. |
| **financial-actions.ts** | `addFinancialEntry()` -- creates revenue/expense/investment entries. Zod-validated with `entry_date`, `entry_type`, `category`, `amount_php`, `description`, `is_recurring`. |
| **team-actions.ts** | `addTeamMember()`, `updateTeamMember()`, `removeTeamMember()` -- CRUD for `ceo_team_members` table. Validates department, system role, monthly cost. |

## For AI Agents

### Working In This Directory

1. **CEO role gate.** Every action calls `assertCeoRole()` which throws on unauthorized access. Do not add redundant auth checks.
2. **Currency is PHP.** All financial amounts are in Philippine Peso. Field names use `_php` suffix (e.g., `amount_php`, `monthly_cost_php`).
3. **FormData input.** Actions accept `FormData` for form submissions, parsed through Zod schemas.
4. **Revalidate `/ceo/*` paths** after mutations using `revalidatePath()`.
5. **Read queries live in `@/lib/queries/ceo/`**, not here. This directory is mutations only.

### Common Patterns

**CEO-gated mutation:**
```typescript
'use server'

import { assertCeoRole } from '@/lib/queries/ceo/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const myCeoAction = async (formData: FormData) => {
  const { user } = await assertCeoRole() // throws if not CEO
  const supabase = await createClient()

  // mutation logic...

  revalidatePath('/ceo')
  return { success: true }
}
```

## Dependencies

### Internal

- `@/lib/queries/ceo/auth` -- `assertCeoRole()` authorization
- `@/lib/queries/ceo/financial-queries` -- `getFinancialSummary()` for export
- `@/lib/queries/ceo/team-queries` -- `getTeamMembers()` for export
- `@/lib/supabase/server` -- `createClient()` for DB access
- `@/types/ceo` -- `SystemRole`, `formatPeso`, `formatPercent`

### External

- `next/cache` -- `revalidatePath`
- `zod` -- input validation
