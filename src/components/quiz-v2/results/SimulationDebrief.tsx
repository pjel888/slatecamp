'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { EndSessionResult, ReviewQuestionData, StaminaBlock } from '@/types/quiz-config'

// ─── Sub-types ────────────────────────────────────────────────────────────────

interface TaxonomyLoss {
  topic: string
  pointsLost: number
  total: number
  percent: number
}

interface TimeAllocationEntry {
  section: string
  timeMinutes: number
  questionCount: number
}

interface ActionItem {
  rank: number
  topic: string
  reason: string
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SimulationDebriefProps {
  result: EndSessionResult
  reviewQuestions: ReviewQuestionData[]
  staminaBlocks?: StaminaBlock[]
  prediction?: number | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildTaxonomyLosses = (questions: ReviewQuestionData[]): TaxonomyLoss[] => {
  const map = new Map<string, { lost: number; total: number }>()

  for (const q of questions) {
    const topic = q.taxonomyBreadcrumb.split(' > ')[0] || 'Unknown'
    const entry = map.get(topic) ?? { lost: 0, total: 0 }
    entry.total++
    if (!q.isCorrect && !q.isSkipped) {
      entry.lost++
    }
    map.set(topic, entry)
  }

  return Array.from(map.entries())
    .map(([topic, { lost, total }]) => ({
      topic,
      pointsLost: lost,
      total,
      percent: total > 0 ? Math.round((lost / total) * 100) : 0,
    }))
    .filter((entry) => entry.pointsLost > 0)
    .sort((a, b) => b.pointsLost - a.pointsLost)
}

const buildTimeAllocation = (questions: ReviewQuestionData[]): TimeAllocationEntry[] => {
  const map = new Map<string, { timeMs: number; count: number }>()

  for (const q of questions) {
    const section = q.taxonomyBreadcrumb.split(' > ')[0] || 'Unknown'
    const entry = map.get(section) ?? { timeMs: 0, count: 0 }
    // ReviewQuestionData does not have timeSpentMs, approximate from position grouping
    entry.count++
    map.set(section, entry)
  }

  // Since we don't have per-question time on ReviewQuestionData, distribute
  // total time proportionally by question count
  const totalQuestions = questions.length
  return Array.from(map.entries())
    .map(([section, { count }]) => ({
      section,
      timeMinutes: Math.round((count / Math.max(1, totalQuestions)) * 100),
      questionCount: count,
    }))
    .sort((a, b) => b.questionCount - a.questionCount)
}

const buildActionPlan = (losses: TaxonomyLoss[]): ActionItem[] =>
  losses.slice(0, 3).map((loss, i) => ({
    rank: i + 1,
    topic: loss.topic,
    reason: `${loss.pointsLost} question${loss.pointsLost !== 1 ? 's' : ''} missed (${loss.percent}% of ${loss.total} in this area)`,
  }))

// ─── Section Components ───────────────────────────────────────────────────────

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8896A7] mb-3">
    {children}
  </h3>
)

// ─── Point Loss Analysis ──────────────────────────────────────────────────────

const PointLossTable = ({ losses }: { losses: TaxonomyLoss[] }) => {
  if (losses.length === 0) {
    return (
      <p className="text-[13px] text-[#2D9F6F] font-medium">
        No points lost. Outstanding performance.
      </p>
    )
  }

  const maxLost = Math.max(...losses.map((l) => l.pointsLost))

  return (
    <div className="space-y-2">
      {losses.map((loss) => (
        <div
          key={loss.topic}
          className="flex items-center gap-3 px-3 py-2 rounded-md bg-white border border-[#D4DAE3]"
        >
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#1A2332] truncate">
              {loss.topic}
            </p>
            <p className="text-[11px] text-[#8896A7]">
              {loss.pointsLost} of {loss.total} missed
            </p>
          </div>
          {/* Magnitude bar */}
          <div className="w-24 h-2 rounded-full bg-[#F8F7F5] overflow-hidden shrink-0">
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-out"
              style={{
                width: `${maxLost > 0 ? (loss.pointsLost / maxLost) * 100 : 0}%`,
                backgroundColor: loss.percent >= 50 ? '#D64545' : '#D4951A',
              }}
              aria-hidden="true"
            />
          </div>
          <span className="text-[12px] font-medium tabular-nums text-[#4A5568] w-8 text-right shrink-0">
            {loss.pointsLost}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Stamina Curve ────────────────────────────────────────────────────────────

const StaminaSection = ({ blocks }: { blocks: StaminaBlock[] }) => {
  if (blocks.length < 2) return null

  const firstAcc = blocks[0].accuracy
  const lastAcc = blocks[blocks.length - 1].accuracy
  const drop = firstAcc - lastAcc

  return (
    <div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={blocks} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid stroke="#D4DAE3" strokeDasharray="3 3" />
            <XAxis
              dataKey="blockNumber"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#4A5568', fontSize: 11 }}
              label={{ value: 'Question Block', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#8896A7' }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#4A5568', fontSize: 11 }}
              ticks={[0, 50, 75, 100]}
            />
            <Tooltip
              formatter={(v: number) => [`${v}%`, 'Accuracy']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #D4DAE3',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                fontSize: '12px',
              }}
            />
            <ReferenceLine y={75} stroke="#2D9F6F" strokeDasharray="4 4" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#1B3FC4"
              strokeWidth={1.5}
              dot={{ r: 3, fill: '#1B3FC4', stroke: '#fff', strokeWidth: 1.5 }}
              activeDot={{ r: 4 }}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {drop >= 10 && (
        <p className="text-[12px] text-[#D4951A] mt-2 leading-snug">
          Your accuracy dropped {drop}% across the session. Shorter practice sessions
          can help build endurance gradually.
        </p>
      )}
      {drop < 5 && blocks.length >= 3 && (
        <p className="text-[12px] text-[#2D9F6F] mt-2 leading-snug">
          Strong endurance throughout the simulation. Accuracy stayed consistent.
        </p>
      )}
    </div>
  )
}

// ─── Time Allocation ──────────────────────────────────────────────────────────

const TimeAllocationChart = ({ data }: { data: TimeAllocationEntry[] }) => {
  if (data.length === 0) return null

  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 8)} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid stroke="#D4DAE3" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="section"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#4A5568', fontSize: 10 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#4A5568', fontSize: 11 }}
            label={{ value: 'Questions', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#8896A7' }}
          />
          <Tooltip
            formatter={(v: number) => [`${v} questions`, 'Topic']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #D4DAE3',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="questionCount" radius={[3, 3, 0, 0]} animationDuration={800}>
            {data.slice(0, 8).map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? '#1B3FC4' : '#1B3FC4'}
                fillOpacity={1 - index * 0.08}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Prediction Comparison ────────────────────────────────────────────────────

const PredictionComparison = ({
  prediction,
  actual,
}: {
  prediction: number
  actual: number
}) => {
  const diff = actual - prediction
  const isOver = diff > 0
  const isClose = Math.abs(diff) <= 3

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-md bg-white border border-[#D4DAE3]">
      <div className="flex-1">
        <p className="text-[12px] text-[#8896A7] mb-1">Your prediction</p>
        <p className="text-lg font-semibold tabular-nums text-[#1A2332]">{prediction}%</p>
      </div>
      <div className="w-px h-10 bg-[#D4DAE3]" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-[12px] text-[#8896A7] mb-1">Actual score</p>
        <p className="text-lg font-semibold tabular-nums text-[#1A2332]">{actual}%</p>
      </div>
      <div className="w-px h-10 bg-[#D4DAE3]" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-[12px] text-[#8896A7] mb-1">Calibration</p>
        <p
          className={cn(
            'text-lg font-semibold tabular-nums',
            isClose
              ? 'text-[#2D9F6F]'
              : isOver
                ? 'text-[#1B3FC4]'
                : 'text-[#D4951A]',
          )}
        >
          {isClose
            ? 'Well-calibrated'
            : isOver
              ? `+${diff}% (exceeded)`
              : `${diff}% (below)`}
        </p>
      </div>
    </div>
  )
}

// ─── Action Plan ──────────────────────────────────────────────────────────────

const ActionPlanSection = ({ items }: { items: ActionItem[] }) => {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.rank}
          className="flex items-start gap-3 px-3.5 py-3 rounded-md bg-white border border-[#D4DAE3]"
        >
          <span
            className="flex items-center justify-center h-6 w-6 rounded-full bg-[#EEF2FC] text-[#1B3FC4] text-[11px] font-bold shrink-0"
            aria-hidden="true"
          >
            {item.rank}
          </span>
          <div>
            <p className="text-[13px] font-medium text-[#1A2332]">{item.topic}</p>
            <p className="text-[12px] text-[#4A5568] mt-0.5">{item.reason}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SimulationDebrief = ({
  result,
  reviewQuestions,
  staminaBlocks,
  prediction,
}: SimulationDebriefProps) => {
  const taxonomyLosses = useMemo(
    () => buildTaxonomyLosses(reviewQuestions),
    [reviewQuestions],
  )
  const timeAllocation = useMemo(
    () => buildTimeAllocation(reviewQuestions),
    [reviewQuestions],
  )
  const actionPlan = useMemo(
    () => buildActionPlan(taxonomyLosses),
    [taxonomyLosses],
  )

  return (
    <div className="space-y-8">
      {/* Point Loss Analysis */}
      <section aria-label="Point loss analysis">
        <SectionHeader>Point Loss Analysis</SectionHeader>
        <PointLossTable losses={taxonomyLosses} />
      </section>

      {/* Stamina Curve */}
      {staminaBlocks && staminaBlocks.length >= 2 && (
        <section aria-label="Stamina curve">
          <SectionHeader>Stamina Curve</SectionHeader>
          <StaminaSection blocks={staminaBlocks} />
        </section>
      )}

      {/* Time Allocation */}
      <section aria-label="Time allocation">
        <SectionHeader>Question Distribution by Topic</SectionHeader>
        <TimeAllocationChart data={timeAllocation} />
      </section>

      {/* Prediction Comparison */}
      {prediction != null && (
        <section aria-label="Prediction comparison">
          <SectionHeader>Prediction vs. Reality</SectionHeader>
          <PredictionComparison
            prediction={prediction}
            actual={result.score.percent}
          />
        </section>
      )}

      {/* Action Plan */}
      <section aria-label="Action plan">
        <SectionHeader>Your Next Steps</SectionHeader>
        {actionPlan.length > 0 ? (
          <ActionPlanSection items={actionPlan} />
        ) : (
          <p className="text-[13px] text-[#2D9F6F] font-medium">
            No major areas to address. Continue with your current study plan.
          </p>
        )}
      </section>
    </div>
  )
}

SimulationDebrief.displayName = 'SimulationDebrief'

export { SimulationDebrief }
