import { Suspense } from 'react'
import { StatCard } from '@/components/shared/stat-card'
import { Eyebrow } from '@/components/ui/eyebrow'
import { RunwayGauge } from '@/components/ceo/RunwayGauge'
import { RevenueChart } from '@/components/ceo/RevenueChart'
import { MetricCardSkeleton } from '@/components/ceo/skeletons/MetricCardSkeleton'
import { ChartSkeleton } from '@/components/ceo/skeletons/ChartSkeleton'
import {
  getFinancialSummary,
  getRevenueBreakdown,
  getUnitEconomics,
  getEngagementPreview,
  getPayingUserCount,
} from '@/lib/queries/ceo/financial-queries'
import {
  formatPeso,
  formatPercent,
  formatRatio,
} from '@/types/ceo'

// ── Metric grid skeleton ───────────────────────────────────────────────────────

const MetricGridSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <MetricCardSkeleton />
    <MetricCardSkeleton />
    <MetricCardSkeleton />
    <MetricCardSkeleton />
  </div>
)

// ── North Star section ─────────────────────────────────────────────────────────

const NorthStarSection = async () => {
  const [financial, unitEcon, payingCount] = await Promise.all([
    getFinancialSummary(),
    getUnitEconomics(),
    getPayingUserCount(),
  ])

  const runwayDisplay =
    financial.runwayMonths === null
      ? '—'
      : financial.runwayMonths >= 999
        ? '∞ mo'
        : `${Math.round(financial.runwayMonths)} mo`

  const conversionDisplay = formatPercent(unitEcon.freeToProConversion)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        eyebrow="Monthly Recurring Revenue"
        value={formatPeso(financial.mrr)}
        subtitle={`ARR ${formatPeso(financial.arr)}`}
      />
      <StatCard
        eyebrow="Cash Runway"
        value={runwayDisplay}
        subtitle={
          financial.cashOnHand !== null
            ? `${formatPeso(financial.cashOnHand)} on hand`
            : 'No cash balance recorded'
        }
      />
      <StatCard
        eyebrow="Paying Users"
        value={String(payingCount)}
        subtitle={`ARPU ${unitEcon.arpu !== null ? formatPeso(unitEcon.arpu) : '—'}`}
      />
      <StatCard
        eyebrow="Free → Pro Conversion"
        value={conversionDisplay}
        subtitle="Of all registered users"
      />
    </div>
  )
}

// ── Business Health section ────────────────────────────────────────────────────

const BusinessHealthSection = async () => {
  const [financial, revenueData] = await Promise.all([
    getFinancialSummary(),
    getRevenueBreakdown(),
  ])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <RunwayGauge
        runwayMonths={financial.runwayMonths}
        cashOnHand={financial.cashOnHand}
      />
      <RevenueChart data={revenueData} />
    </div>
  )
}

// ── Engagement Health section ──────────────────────────────────────────────────

const EngagementSection = async () => {
  const engagement = await getEngagementPreview()

  if (!engagement) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['DAU/MAU Ratio', 'D-7 Retention', 'Avg Score', 'Trail Completion'] as const).map(
          (label) => (
            <StatCard
              key={label}
              eyebrow={label}
              value="—"
              subtitle="Engagement data not yet available"
            />
          ),
        )}
      </div>
    )
  }

  const dauMauPercent =
    engagement.dauMauRatio > 0
      ? formatPercent(engagement.dauMauRatio)
      : '—'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        eyebrow="DAU / MAU Ratio"
        value={dauMauPercent}
        subtitle={`${engagement.dau} DAU · ${engagement.mau} MAU`}
      />
      <StatCard
        eyebrow="Weekly Active Users"
        value={String(engagement.wau)}
        subtitle={`${engagement.avgSessionsPerWeek.toFixed(1)} sessions / week avg`}
      />
      <StatCard
        eyebrow="Avg Streak Length"
        value={`${engagement.avgStreakLength.toFixed(1)} days`}
        subtitle="Across active learners"
      />
      <StatCard
        eyebrow="Snapshot Date"
        value={new Date(engagement.snapshotDate).toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
        })}
        subtitle="Last engagement snapshot"
      />
    </div>
  )
}

// ── Unit Economics section ─────────────────────────────────────────────────────

const UnitEconomicsSection = async () => {
  const unitEcon = await getUnitEconomics()

  const cacDisplay = unitEcon.cac !== null ? formatPeso(unitEcon.cac) : '—'
  const ltvDisplay = unitEcon.ltv !== null ? formatPeso(unitEcon.ltv) : '—'
  const ratioDisplay =
    unitEcon.ltvCacRatio !== null ? formatRatio(unitEcon.ltvCacRatio) : '—'
  const arpuDisplay = unitEcon.arpu !== null ? formatPeso(unitEcon.arpu) : '—'

  const ratioDirection =
    unitEcon.ltvCacRatio !== null
      ? unitEcon.ltvCacRatio >= 3
        ? ('up' as const)
        : ('down' as const)
      : undefined

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        eyebrow="Customer Acq. Cost"
        value={cacDisplay}
        subtitle={
          unitEcon.cacPaybackMonths !== null
            ? `${Math.round(unitEcon.cacPaybackMonths)} mo payback`
            : 'Payback period unavailable'
        }
      />
      <StatCard
        eyebrow="Lifetime Value"
        value={ltvDisplay}
        subtitle={
          unitEcon.monthlyChurnRate !== null
            ? `${formatPercent(unitEcon.monthlyChurnRate)} monthly churn`
            : 'Churn rate unavailable'
        }
      />
      <StatCard
        eyebrow="LTV : CAC Ratio"
        value={ratioDisplay}
        trend={
          ratioDirection
            ? {
                label: ratioDirection === 'up' ? 'Above 3:1 target' : 'Below 3:1 target',
                direction: ratioDirection,
              }
            : undefined
        }
      />
      <StatCard
        eyebrow="Avg Revenue Per User"
        value={arpuDisplay}
        subtitle="Per paying subscriber / month"
      />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CeoCommandCenterPage() {
  return (
    <div className="space-y-8 max-w-screen-xl">

      {/* North Star Metrics */}
      <section className="space-y-3">
        <Eyebrow>North Star Metrics</Eyebrow>
        <Suspense fallback={<MetricGridSkeleton />}>
          <NorthStarSection />
        </Suspense>
      </section>

      {/* Business Health */}
      <section className="space-y-3">
        <Eyebrow>Business Health</Eyebrow>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartSkeleton className="min-h-[200px]" />
              <ChartSkeleton className="min-h-[320px]" />
            </div>
          }
        >
          <BusinessHealthSection />
        </Suspense>
      </section>

      {/* Engagement Health */}
      <section className="space-y-3">
        <Eyebrow>Engagement Health</Eyebrow>
        <Suspense fallback={<MetricGridSkeleton />}>
          <EngagementSection />
        </Suspense>
      </section>

      {/* Unit Economics */}
      <section className="space-y-3">
        <Eyebrow>Unit Economics</Eyebrow>
        <Suspense fallback={<MetricGridSkeleton />}>
          <UnitEconomicsSection />
        </Suspense>
      </section>

    </div>
  )
}
