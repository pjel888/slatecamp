import { createClient } from '@/lib/supabase/server'
import { verifyCeoAccess } from '@/lib/queries/ceo/auth'
import { StatCard } from '@/components/shared/stat-card'
import { RevenueExpenseChart } from '@/components/ceo/RevenueExpenseChart'
import { ExpenseBreakdownChart } from '@/components/ceo/ExpenseBreakdownChart'
import { FinancialLedger } from '@/components/ceo/FinancialLedger'
import { ExportButton } from '@/components/ceo/ExportButton'
import { formatPeso, CATEGORY_LABELS } from '@/types/ceo'
import type { FinancialEntry, FinancialEntryType } from '@/types/ceo'
import { Eyebrow } from '@/components/ui/eyebrow'

export const metadata = {
  title: 'Financials — CEO Dashboard',
}

const BREAK_EVEN_MRR = 172_000

// Map db row to FinancialEntry
const mapEntry = (row: Record<string, unknown>): FinancialEntry => ({
  id: row.id as string,
  entryDate: row.entry_date as string,
  entryType: row.entry_type as FinancialEntryType,
  category: row.category as string,
  amountPhp: row.amount_php as number,
  description: row.description as string | null,
  isRecurring: row.is_recurring as boolean,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
})

export default async function FinancialsPage() {
  await verifyCeoAccess()

  const supabase = await createClient()

  // Fetch all financial entries
  const { data: rawEntries } = await supabase
    .from('ceo_financial_entries')
    .select('id, entry_date, entry_type, category, amount_php, description, is_recurring, created_at, updated_at')
    .order('entry_date', { ascending: false })

  const entries: FinancialEntry[] = (rawEntries ?? []).map(mapEntry)

  // Latest cash balance
  const { data: cashEntry } = await supabase
    .from('ceo_cash_balance_entries')
    .select('amount_php, balance_date')
    .order('balance_date', { ascending: false })
    .limit(1)
    .single()

  const cashOnHand = cashEntry?.amount_php ?? null

  // Current month metrics
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0]

  const thisMonthEntries = entries.filter(
    (e) => e.entryDate >= monthStart && e.entryDate <= monthEnd,
  )

  const monthRevenue = thisMonthEntries
    .filter((e) => e.entryType === 'revenue')
    .reduce((s, e) => s + e.amountPhp, 0)

  const monthExpenses = thisMonthEntries
    .filter((e) => e.entryType === 'expense')
    .reduce((s, e) => s + e.amountPhp, 0)

  const monthNet = monthRevenue - monthExpenses

  // Monthly P&L chart data — last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-PH', { month: 'short', year: '2-digit' })

    const monthEntries = entries.filter((e) => e.entryDate.startsWith(key))
    const revenue = monthEntries
      .filter((e) => e.entryType === 'revenue')
      .reduce((s, e) => s + e.amountPhp, 0)
    const expenses = monthEntries
      .filter((e) => e.entryType === 'expense')
      .reduce((s, e) => s + e.amountPhp, 0)

    return { month: label, revenue, expenses, net: revenue - expenses }
  })

  // Expense breakdown by category (all time)
  const expenseMap = new Map<string, number>()
  entries
    .filter((e) => e.entryType === 'expense')
    .forEach((e) => {
      expenseMap.set(e.category, (expenseMap.get(e.category) ?? 0) + e.amountPhp)
    })

  const expenseBreakdown = Array.from(expenseMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      label: CATEGORY_LABELS[category] ?? category,
    }))
    .sort((a, b) => b.amount - a.amount)

  const totalExpenses = expenseBreakdown.reduce((s, e) => s + e.amount, 0)

  // Runway projection
  const runwayMonths =
    cashOnHand !== null && monthExpenses > monthRevenue
      ? cashOnHand / (monthExpenses - monthRevenue)
      : null

  const breakEvenProgress = monthRevenue > 0
    ? Math.min((monthRevenue / BREAK_EVEN_MRR) * 100, 100)
    : 0

  const runwayDate =
    runwayMonths !== null
      ? new Date(
          now.getFullYear(),
          now.getMonth() + Math.floor(runwayMonths),
          1,
        ).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
      : null

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Financials</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Philippine Peso (₱) · All time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton />
        </div>
      </div>

      {/* Summary metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          eyebrow="This Month Revenue"
          value={formatPeso(monthRevenue)}
          subtitle={monthRevenue > 0 ? undefined : 'No revenue recorded yet'}
        />
        <StatCard
          eyebrow="This Month Expenses"
          value={formatPeso(monthExpenses)}
          subtitle={monthExpenses > 0 ? undefined : 'No expenses recorded yet'}
        />
        <StatCard
          eyebrow="Net This Month"
          value={formatPeso(monthNet)}
          trend={
            monthNet !== 0
              ? {
                  label: monthNet > 0 ? 'Surplus' : 'Deficit',
                  direction: monthNet > 0 ? 'up' : 'flat',
                }
              : undefined
          }
        />
        <StatCard
          eyebrow="Cash on Hand"
          value={cashOnHand !== null ? formatPeso(cashOnHand) : '—'}
          subtitle={
            cashEntry?.balance_date
              ? `As of ${cashEntry.balance_date}`
              : 'No balance recorded'
          }
        />
      </div>

      {/* Monthly P&L Chart */}
      <div className="bg-card border border-border rounded-md p-4">
        <Eyebrow className="block mb-4">Monthly P&L</Eyebrow>
        <RevenueExpenseChart data={monthlyData} />
      </div>

      {/* Expense Breakdown + Cost Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-card border border-border rounded-md p-4">
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
            Expense Breakdown
          </p>
          <ExpenseBreakdownChart data={expenseBreakdown} />
        </div>

        <div className="bg-card border border-border rounded-md p-4">
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
            Cost Summary
          </p>
          {expenseBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expense data yet.</p>
          ) : (
            <div className="space-y-2">
              {expenseBreakdown.map((item) => {
                const pct =
                  totalExpenses > 0
                    ? ((item.amount / totalExpenses) * 100).toFixed(1)
                    : '0.0'
                return (
                  <div key={item.category} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground/70 font-mono tabular-nums">
                        {pct}%
                      </span>
                      <span className="font-mono tabular-nums text-foreground">
                        {formatPeso(item.amount)}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div className="border-t border-border pt-2 flex items-center justify-between text-sm font-medium">
                <span className="text-foreground">Total</span>
                <span className="font-mono tabular-nums text-foreground">
                  {formatPeso(totalExpenses)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Financial Ledger */}
      <div className="bg-card border border-border rounded-md p-4">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
          Financial Ledger
        </p>
        <FinancialLedger entries={entries} />
      </div>

      {/* Runway Projection */}
      <div className="bg-card border border-border rounded-md p-4">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
          Runway Projection
        </p>
        <div className="space-y-3">
          {runwayDate !== null ? (
            <p className="text-sm text-foreground">
              At current burn rate, runway ends{' '}
              <span className="font-medium">{runwayDate}</span>
              {runwayMonths !== null && (
                <span className="text-muted-foreground">
                  {' '}({Math.round(runwayMonths)} months)
                </span>
              )}
            </p>
          ) : cashOnHand !== null && monthExpenses <= monthRevenue ? (
            <p className="text-sm text-success font-medium">
              Revenue covers expenses — currently cash-flow positive.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add cash balance and expense entries to see runway projection.
            </p>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span>Break-even at {formatPeso(BREAK_EVEN_MRR)} MRR</span>
              <span>{breakEvenProgress.toFixed(0)}% of target</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${breakEvenProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Currently {formatPeso(monthRevenue)} MRR
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
