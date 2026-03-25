import { createClient } from '@/lib/supabase/server'
import type {
  FinancialSummary,
  RevenueBreakdown,
  UnitEconomics,
  EngagementSnapshot,
} from '@/types/ceo'

// ============================================================================
// getFinancialSummary
// ============================================================================

export const getFinancialSummary = async (): Promise<FinancialSummary> => {
  const supabase = await createClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  // MRR = SUM of active subscription amounts
  const { data: subscriptions } = await supabase
    .from('user_subscriptions')
    .select('amount')
    .eq('status', 'active')

  const mrr =
    subscriptions?.reduce((sum, row) => sum + (row.amount ?? 0), 0) ?? 0

  // Monthly burn = SUM of expense entries this month
  const { data: expenseEntries } = await supabase
    .from('ceo_financial_entries')
    .select('amount_php')
    .eq('entry_type', 'expense')
    .gte('entry_date', monthStart)
    .lte('entry_date', monthEnd)

  const monthlyBurn =
    expenseEntries?.reduce((sum, row) => sum + (row.amount_php ?? 0), 0) ?? 0

  // Cash on hand = latest cash balance entry
  const { data: cashEntry } = await supabase
    .from('ceo_cash_balance_entries')
    .select('amount_php')
    .order('balance_date', { ascending: false })
    .limit(1)
    .single()

  const cashOnHand = cashEntry?.amount_php ?? null

  const netBurn = monthlyBurn - mrr
  const arr = mrr * 12

  let runwayMonths: number | null = null
  if (cashOnHand !== null) {
    if (netBurn <= 0) {
      runwayMonths = 999 // profitable
    } else {
      runwayMonths = cashOnHand / netBurn
    }
  }

  return { mrr, arr, monthlyBurn, netBurn, runwayMonths, cashOnHand }
}

// ============================================================================
// getRevenueBreakdown
// ============================================================================

export const getRevenueBreakdown = async (): Promise<RevenueBreakdown[]> => {
  const supabase = await createClient()

  // Last 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  // Subscription revenue grouped by tier and month
  const { data: subscriptionData } = await supabase
    .from('user_subscriptions')
    .select('amount, tier, created_at')
    .gte('created_at', sixMonthsAgo.toISOString())

  // Financial entry revenue (manual entries)
  const { data: revenueEntries } = await supabase
    .from('ceo_financial_entries')
    .select('amount_php, category, entry_date')
    .eq('entry_type', 'revenue')
    .gte('entry_date', sixMonthsAgo.toISOString().split('T')[0])

  // Build a map keyed by "YYYY-MM"
  const monthMap: Record<
    string,
    { proMonthly: number; proExamPass: number; institutional: number }
  > = {}

  const getMonthKey = (dateStr: string) => dateStr.substring(0, 7)

  // Populate from subscriptions
  subscriptionData?.forEach((row) => {
    const key = getMonthKey(row.created_at ?? '')
    if (!key) return
    if (!monthMap[key]) monthMap[key] = { proMonthly: 0, proExamPass: 0, institutional: 0 }
    const tier = (row.tier ?? '') as string
    const amt = row.amount ?? (tier === 'pro' ? 399 : tier === 'enterprise' ? 2499 : 0)
    if (tier === 'enterprise') {
      monthMap[key].institutional += amt
    } else if (tier === 'pro') {
      monthMap[key].proMonthly += amt
    }
  })

  // Overlay manual financial entries
  revenueEntries?.forEach((row) => {
    const key = getMonthKey(row.entry_date ?? '')
    if (!key) return
    if (!monthMap[key]) monthMap[key] = { proMonthly: 0, proExamPass: 0, institutional: 0 }
    const category = row.category ?? ''
    if (category === 'exam_pass_revenue') {
      monthMap[key].proExamPass += row.amount_php ?? 0
    } else if (category === 'institutional_revenue') {
      monthMap[key].institutional += row.amount_php ?? 0
    } else {
      monthMap[key].proMonthly += row.amount_php ?? 0
    }
  })

  // Ensure we have entries for each of the last 6 months (fill zeros if missing)
  const result: RevenueBreakdown[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = d.toLocaleDateString('en-PH', { month: 'short', year: '2-digit' })
    const entry = monthMap[key] ?? { proMonthly: 0, proExamPass: 0, institutional: 0 }
    result.push({
      month: monthLabel,
      proMonthly: entry.proMonthly,
      proExamPass: entry.proExamPass,
      institutional: entry.institutional,
      total: entry.proMonthly + entry.proExamPass + entry.institutional,
    })
  }

  return result
}

// ============================================================================
// getUnitEconomics
// ============================================================================

// Separate lightweight query just for paying user count (used in NorthStar)
export const getPayingUserCount = async (): Promise<number> => {
  const supabase = await createClient()
  const { count } = await supabase
    .from('user_subscriptions')
    .select('subscription_id', { count: 'exact', head: true })
    .eq('status', 'active')
  return count ?? 0
}

export const getUnitEconomics = async (): Promise<UnitEconomics> => {
  const supabase = await createClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  // Total profiles (free users)
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })

  // Paying (active) subscriptions
  const { count: payingUsers } = await supabase
    .from('user_subscriptions')
    .select('subscription_id', { count: 'exact', head: true })
    .eq('status', 'active')

  // New paying users this month
  const { count: newPayingThisMonth } = await supabase
    .from('user_subscriptions')
    .select('subscription_id', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd)

  // Ad spend this month
  const { data: adSpendEntries } = await supabase
    .from('ceo_financial_entries')
    .select('amount_php')
    .eq('entry_type', 'expense')
    .eq('category', 'ad_spend')
    .gte('entry_date', monthStart.split('T')[0])
    .lte('entry_date', monthEnd.split('T')[0])

  const adSpend =
    adSpendEntries?.reduce((sum, row) => sum + (row.amount_php ?? 0), 0) ?? 0

  // Cancelled this month (for churn)
  const { count: cancelledThisMonth } = await supabase
    .from('user_subscriptions')
    .select('subscription_id', { count: 'exact', head: true })
    .eq('status', 'cancelled')
    .gte('updated_at', monthStart)
    .lte('updated_at', monthEnd)

  // Active at start of month (approximation: active now + cancelled this month)
  const activeAtMonthStart = (payingUsers ?? 0) + (cancelledThisMonth ?? 0)

  // MRR for ARPU
  const { data: subscriptions } = await supabase
    .from('user_subscriptions')
    .select('amount')
    .eq('status', 'active')

  const mrr =
    subscriptions?.reduce((sum, row) => sum + (row.amount ?? 0), 0) ?? 0

  // Compute metrics
  const paying = payingUsers ?? 0
  const total = totalUsers ?? 0
  const newPaying = newPayingThisMonth ?? 0
  const cancelled = cancelledThisMonth ?? 0

  const arpu = paying > 0 ? mrr / paying : null
  const cac = newPaying > 0 ? adSpend / newPaying : null
  const churnRate = activeAtMonthStart > 0 ? cancelled / activeAtMonthStart : null
  const ltv = arpu !== null && churnRate !== null && churnRate > 0 ? arpu / churnRate : null
  const ltvCacRatio = ltv !== null && cac !== null && cac > 0 ? ltv / cac : null
  const cacPaybackMonths = cac !== null && arpu !== null && arpu > 0 ? cac / arpu : null
  const freeToProConversion = total > 0 ? paying / total : 0

  return {
    cac,
    ltv,
    ltvCacRatio,
    cacPaybackMonths,
    monthlyChurnRate: churnRate,
    freeToProConversion,
    arpu,
  }
}

// ============================================================================
// getEngagementPreview
// ============================================================================

export const getEngagementPreview = async (): Promise<EngagementSnapshot | null> => {
  const supabase = await createClient()

  // Try materialized view first
  const { data: mvData, error: mvError } = await supabase
    .from('mv_engagement_snapshot')
    .select(
      'snapshot_date, dau, wau, mau, dau_mau_ratio, avg_sessions_per_week, avg_streak_length',
    )
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()

  if (!mvError && mvData) {
    return {
      snapshotDate: mvData.snapshot_date,
      dau: mvData.dau ?? 0,
      wau: mvData.wau ?? 0,
      mau: mvData.mau ?? 0,
      dauMauRatio: mvData.dau_mau_ratio ?? 0,
      avgSessionsPerWeek: mvData.avg_sessions_per_week ?? 0,
      avgStreakLength: mvData.avg_streak_length ?? 0,
    }
  }

  // Fallback: compute from quiz_sessions directly
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 86_400_000).toISOString()
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000).toISOString()

  const [{ count: dau }, { count: wau }, { count: mau }] = await Promise.all([
    supabase
      .from('quiz_sessions')
      .select('user_id', { count: 'exact', head: true })
      .gte('started_at', dayAgo),
    supabase
      .from('quiz_sessions')
      .select('user_id', { count: 'exact', head: true })
      .gte('started_at', weekAgo),
    supabase
      .from('quiz_sessions')
      .select('user_id', { count: 'exact', head: true })
      .gte('started_at', monthAgo),
  ])

  const dauVal = dau ?? 0
  const mauVal = mau ?? 0

  return {
    snapshotDate: now.toISOString().split('T')[0],
    dau: dauVal,
    wau: wau ?? 0,
    mau: mauVal,
    dauMauRatio: mauVal > 0 ? dauVal / mauVal : 0,
    avgSessionsPerWeek: 0,
    avgStreakLength: 0,
  }
}
