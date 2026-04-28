import { StatCard } from '@/components/shared/stat-card'
import { Eyebrow } from '@/components/ui/eyebrow'
import { CohortRetentionTable } from '@/components/ceo/CohortRetentionTable'
import { ChurnRiskBars } from '@/components/ceo/ChurnRiskBars'
import { TimeToValueFunnel } from '@/components/ceo/TimeToValueFunnel'
import {
  getEngagementSnapshot,
  getCohortRetention,
  getChurnRiskDistribution,
  getTimeToValue,
  getChurnSignals,
} from '@/lib/queries/ceo/user-queries'
import { formatPercent } from '@/types/ceo'
import { verifyCeoAccess } from '@/lib/queries/ceo/auth'

export const metadata = {
  title: 'Behavioral Insights — CEO Dashboard',
}
export const dynamic = 'force-dynamic'

export default async function InsightsPage() {
  await verifyCeoAccess()
  const [snapshot, cohorts, churnRisk, timeToValue, churnSignals] =
    await Promise.all([
      getEngagementSnapshot(),
      getCohortRetention(),
      getChurnRiskDistribution(),
      getTimeToValue(),
      getChurnSignals(),
    ])

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Behavioral Insights
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Are students actually learning and staying?
        </p>
      </div>

      {/* Engagement Snapshot */}
      <section>
        <Eyebrow className="block mb-3">Engagement Snapshot</Eyebrow>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            eyebrow="DAU"
            value={snapshot.dau.toLocaleString()}
            subtitle="Active in last 24h"
          />
          <StatCard
            eyebrow="WAU"
            value={snapshot.wau.toLocaleString()}
            subtitle="Active in last 7 days"
          />
          <StatCard
            eyebrow="MAU"
            value={snapshot.mau.toLocaleString()}
            subtitle="Active in last 30 days"
          />
          <StatCard
            eyebrow="D/M Ratio"
            value={formatPercent(snapshot.dauMauRatio)}
            subtitle={
              snapshot.dauMauRatio >= 0.2
                ? 'Healthy engagement'
                : snapshot.dauMauRatio > 0
                  ? 'Building momentum'
                  : 'No data yet'
            }
          />
        </div>
      </section>

      {/* Cohort Retention */}
      <section>
        <Eyebrow className="block mb-3">Cohort Retention</Eyebrow>
        <CohortRetentionTable data={cohorts} />
      </section>

      {/* Churn Risk Distribution */}
      <section>
        <Eyebrow className="block mb-3">Churn Risk Distribution</Eyebrow>
        <ChurnRiskBars data={churnRisk} />
      </section>

      {/* Time to Value */}
      <section>
        <Eyebrow className="block mb-3">Time to Value</Eyebrow>
        <TimeToValueFunnel data={timeToValue} />
      </section>

      {/* Top Churn Signals */}
      <section>
        <Eyebrow className="block mb-3">Top Churn Signals</Eyebrow>
        {churnSignals.length === 0 ? (
          <div className="bg-card border border-border rounded-md p-6 text-center">
            <p className="text-[13px] text-muted-foreground">
              Churn signal data will appear once enough user history is
              collected.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {churnSignals.map((signal) => (
              <div
                key={signal.signalKey}
                className="bg-card border border-border rounded-md p-4 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground leading-snug">
                    {signal.signalDescription}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {signal.affectedUsers.toLocaleString()} users affected
                  </p>
                </div>
                <div className="flex-shrink-0 px-2 py-0.5 rounded-sm bg-warning/10 border border-warning/20">
                  <span className="font-mono text-[11px] font-medium tabular-nums text-warning">
                    {signal.churnMultiplier.toFixed(1)}× base rate
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
