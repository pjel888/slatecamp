'use server'

import { assertCeoRole } from '@/lib/queries/ceo/auth'
import { getFinancialSummary } from '@/lib/queries/ceo/financial-queries'
import { getTeamMembers } from '@/lib/queries/ceo/team-queries'
import { createClient } from '@/lib/supabase/server'
import { formatPeso, formatPercent } from '@/types/ceo'

export const generateInvestorExport = async (): Promise<{
  success: boolean
  markdown?: string
  error?: string
}> => {
  try {
    await assertCeoRole()

    const [financialSummary, teamMembers] = await Promise.all([
      getFinancialSummary(),
      getTeamMembers(),
    ])

    const supabase = await createClient()

    // Paying users count
    const { count: payingUsers } = await supabase
      .from('user_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    // Day-7 retention from engagement snapshot
    const { data: engagementData } = await supabase
      .from('mv_engagement_snapshot')
      .select('dau, mau, dau_mau_ratio')
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single()

    // Ad spend this month for CAC
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data: adSpendData } = await supabase
      .from('ceo_financial_entries')
      .select('amount_php')
      .eq('entry_type', 'expense')
      .eq('category', 'ad_spend')
      .gte('entry_date', monthStart)
      .lte('entry_date', monthEnd)

    const adSpend = adSpendData?.reduce((sum, r) => sum + (r.amount_php ?? 0), 0) ?? 0

    const paying = payingUsers ?? 0
    const total = totalUsers ?? 0
    const freeToProConversion = total > 0 ? (paying / total) * 100 : 0
    const arpu = paying > 0 ? financialSummary.mrr / paying : 0
    const dauMauRatio = engagementData?.dau_mau_ratio ?? 0

    const activeMembers = teamMembers.filter((m) => m.endDate === null)
    const departments = new Set(activeMembers.map((m) => m.department))
    const totalBurn = financialSummary.monthlyBurn

    const runwayStr =
      financialSummary.runwayMonths === null
        ? 'N/A'
        : financialSummary.runwayMonths >= 999
          ? '∞ (profitable)'
          : `${Math.round(financialSummary.runwayMonths)}mo`

    const dateStr = now.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const oneLineStatus = [
      `${formatPeso(financialSummary.mrr)} MRR`,
      `${paying} paying users`,
      `${runwayStr} runway`,
      `${(dauMauRatio * 100).toFixed(0)}% DAU/MAU`,
    ].join(', ')

    const markdown = `# SlateCamp — Weekly Update ${dateStr}

## One-Line Status
${oneLineStatus}

## Key Metrics
- MRR: ${formatPeso(financialSummary.mrr)}
- Paying Users: ${paying}
- Free→Paid Conversion: ${freeToProConversion.toFixed(1)}%
- DAU/MAU: ${(dauMauRatio * 100).toFixed(1)}%
- Day-7 Retention: [To be filled]

## Unit Economics
- CAC: ${adSpend > 0 && paying > 0 ? formatPeso(adSpend / paying) : 'N/A'}
- LTV: ${arpu > 0 ? formatPeso(arpu * 12) : 'N/A'}
- LTV:CAC: ${arpu > 0 && adSpend > 0 && paying > 0 ? `${((arpu * 12) / (adSpend / paying)).toFixed(1)}:1` : 'N/A'}
- ARPU: ${arpu > 0 ? formatPeso(arpu) : 'N/A'}
- Monthly Churn: [To be filled]

## Team
- Headcount: ${activeMembers.length} active (${departments.size} departments)
- Monthly burn: ${formatPeso(totalBurn)}
- Runway: ${runwayStr}

## Highlights
[To be filled by CEO]

## Asks
[To be filled by CEO]
`

    return { success: true, markdown }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}
