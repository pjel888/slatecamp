import { PacingEnduranceGauge } from '@/components/dashboard/PacingEnduranceGauge'
import { PersonalWorkspaceLink } from '@/components/dashboard/PersonalWorkspaceLink'
import { TaxonomyHeatmap } from '@/components/dashboard/TaxonomyHeatmap'
import { ReadinessScore } from '@/components/dashboard/ReadinessScore'
import { getAnalyticsSummary, getTaxonomyHeatmap } from '@/lib/actions/analytics'
import { getUserGlobalStats } from '@/lib/actions/user-stats'
import { Activity } from 'lucide-react'

export default async function AnalyticsPage() {
  const [summary, stats] = await Promise.all([
    getAnalyticsSummary(),
    getUserGlobalStats()
  ])

  const heatmap = stats?.current_discipline_id 
    ? await getTaxonomyHeatmap(stats.current_discipline_id)
    : []

  if (!summary) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-zinc-500 mt-1">Real-time prediction and mastery mapping.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-2xl">
          <Activity className="h-4 w-4 text-amber-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Prediction Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Readiness Arc */}
        <div className="lg:col-span-4">
          <ReadinessScore 
            score={summary.readinessScore}
            previousScore={summary.readinessTrend[summary.readinessTrend.length - 2]?.score || null}
          />
        </div>

        {/* Pacing & Performance */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <PacingEnduranceGauge
            averageSecondsPerItem={summary.averageSecondsPerItem}
            targetSecondsPerItem={summary.targetSecondsPerItem}
            enduranceMinutes={summary.enduranceMinutes}
            trend={summary.trend}
          />
          <PersonalWorkspaceLink />
        </div>
      </div>

      {/* Taxonomy Heatmap */}
      <div className="w-full">
        <TaxonomyHeatmap clusters={heatmap} />
      </div>
    </div>
  )
}
