import type { Metadata } from 'next'
import { getQuestionsForAnalytics } from '@/lib/actions/admin/question-queries'

export const metadata: Metadata = { title: 'Quality Analytics — SlateCamp Admin' }
import { SectionHeader } from '@/components/shared/section-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const bucketLabel = (bucket: number) => {
  const low = bucket.toFixed(1)
  const high = (bucket + 0.1).toFixed(1)
  return `${low}\u2013${high}`
}

const computeStats = (
  questions: { question_id: string; difficulty: number | null; rationale: string | null; code_citation: string | null; topic_id: string }[],
) => {
  const total = questions.length
  const missingRationale = questions.filter(
    (q) => !q.rationale || q.rationale.trim() === '',
  ).length
  const missingCitation = questions.filter(
    (q) => !q.code_citation || q.code_citation.trim() === '',
  ).length

  const difficulties = questions
    .map((q) => q.difficulty)
    .filter((d): d is number => d != null)

  const avgDifficulty =
    difficulties.length > 0
      ? difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length
      : 0

  // Build difficulty distribution buckets (0.0-0.1, 0.1-0.2, ..., 0.9-1.0)
  const buckets = new Map<number, number>()
  for (let i = 0; i <= 0.9; i = Math.round((i + 0.1) * 10) / 10) {
    buckets.set(i, 0)
  }
  for (const d of difficulties) {
    const bucket = Math.min(Math.floor(d * 10) / 10, 0.9)
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1)
  }

  const maxBucketCount = Math.max(...buckets.values(), 1)

  return {
    total,
    missingRationale,
    missingCitation,
    avgDifficulty,
    buckets,
    maxBucketCount,
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const QuestionsAnalyticsPage = async () => {
  const questions = await getQuestionsForAnalytics()
  const stats = computeStats(questions)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/knowledge/questions"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
        Back to Questions
      </Link>

      <SectionHeader
        eyebrow="Content"
        title="Question Quality Analytics"
        subtitle="Audit coverage and difficulty distribution across the question bank"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          eyebrow="Total Questions"
          value={stats.total.toLocaleString()}
          href="/admin/knowledge/questions"
        />
        <StatCard
          eyebrow="Missing Rationale"
          value={stats.missingRationale.toLocaleString()}
          color={stats.missingRationale > 0 ? 'text-amber-600' : 'text-emerald-600'}
          subtitle={
            stats.total > 0
              ? `${Math.round((stats.missingRationale / stats.total) * 100)}% of bank`
              : undefined
          }
        />
        <StatCard
          eyebrow="Missing Citation"
          value={stats.missingCitation.toLocaleString()}
          color={stats.missingCitation > 0 ? 'text-amber-600' : 'text-emerald-600'}
          subtitle={
            stats.total > 0
              ? `${Math.round((stats.missingCitation / stats.total) * 100)}% of bank`
              : undefined
          }
        />
        <StatCard
          eyebrow="Avg Difficulty"
          value={stats.avgDifficulty.toFixed(2)}
          subtitle={
            stats.avgDifficulty < 0.4
              ? 'Skews easy'
              : stats.avgDifficulty > 0.6
                ? 'Skews hard'
                : 'Balanced'
          }
        />
      </div>

      {/* Difficulty distribution */}
      <Card>
        <CardContent className="pt-4">
          <SectionHeader
            eyebrow="Distribution"
            title="Difficulty Spread"
            subtitle="Question count by difficulty bucket (0.0 = easiest, 1.0 = hardest)"
            level="card"
          />

          <div className="mt-4 space-y-2">
            {[...stats.buckets.entries()]
              .sort(([a], [b]) => a - b)
              .map(([bucket, count]) => {
                const widthPct = stats.maxBucketCount > 0
                  ? Math.max((count / stats.maxBucketCount) * 100, count > 0 ? 2 : 0)
                  : 0

                // Color gradient: emerald for easy, amber for mid, red for hard
                const barColor =
                  bucket < 0.3
                    ? 'bg-emerald-500'
                    : bucket < 0.6
                      ? 'bg-amber-500'
                      : 'bg-red-500'

                return (
                  <div key={bucket} className="flex items-center gap-3">
                    <span className="w-16 text-right text-[11px] font-[family-name:var(--font-dm-mono)] text-muted-foreground shrink-0">
                      {bucketLabel(bucket)}
                    </span>
                    <div className="flex-1 h-5 bg-muted/50 rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-150 ${barColor}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[11px] font-[family-name:var(--font-dm-mono)] text-foreground tabular-nums shrink-0">
                      {count}
                    </span>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Coverage summary */}
      <Card>
        <CardContent className="pt-4">
          <SectionHeader
            eyebrow="Coverage"
            title="Content Completeness"
            level="card"
          />

          <div className="mt-4 space-y-3">
            <CoverageRow
              label="Has rationale"
              filled={stats.total - stats.missingRationale}
              total={stats.total}
              color="bg-emerald-500"
            />
            <CoverageRow
              label="Has citation"
              filled={stats.total - stats.missingCitation}
              total={stats.total}
              color="bg-camp-cobalt"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Coverage bar row                                                   */
/* ------------------------------------------------------------------ */

const CoverageRow = ({
  label,
  filled,
  total,
  color,
}: {
  label: string
  filled: number
  total: number
  color: string
}) => {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-150 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-20 text-right text-[11px] font-[family-name:var(--font-dm-mono)] text-foreground tabular-nums shrink-0">
        {filled}/{total} ({pct}%)
      </span>
    </div>
  )
}

export default QuestionsAnalyticsPage
