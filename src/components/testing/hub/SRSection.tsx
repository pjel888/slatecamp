'use client'

import { useMemo } from 'react'
import { ArrowRight, ArrowClockwise, Target } from '@phosphor-icons/react'
import { SRProgressRing } from '@/components/quiz-v2/SRProgressRing'
import { SRSpacingTimeline } from '@/components/quiz-v2/SRSpacingTimeline'
import { SectionHeader } from '@/components/shared/section-header'
import { cn } from '@/lib/utils'
import type { SRActiveCycle, SRDueCycle, SRProgressSummary } from '@/lib/actions/quiz-v2/successive-relearning'

// ─── Props ───────────────────────────────────────────────────────────────────

interface SRSectionProps {
  activeCycles: SRActiveCycle[]
  dueCycles: SRDueCycle[]
  progress: SRProgressSummary
  className?: string
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const DueCycleRow = ({ cycle }: { cycle: SRDueCycle }) => {
  const dueLabel = useMemo(() => {
    const dueDate = new Date(cycle.next_retest_at)
    const now = new Date()
    const hoursOverdue = Math.floor(
      (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60),
    )
    if (hoursOverdue < 1) return 'Due now'
    if (hoursOverdue < 24) return `${hoursOverdue}h overdue`
    return `${Math.floor(hoursOverdue / 24)}d overdue`
  }, [cycle.next_retest_at])

  return (
    <div className="flex items-center justify-between rounded-md border border-[#D4DAE3] bg-white px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#EEF2FC]">
          <ArrowClockwise size={16} weight="bold" className="text-[#1B3FC4]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#1A2332]">{cycle.topic_name}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4A5568]">
              Spacing level {cycle.spacing_level}/4
            </span>
            <span className="text-xs text-[#D4951A]">{dueLabel}</span>
          </div>
        </div>
      </div>
      <a
        href="/quiz/focused/setup"
        className="inline-flex items-center gap-1 rounded-sm bg-[#1B3FC4] px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-[#1535A8]"
      >
        Re-test
        <ArrowRight size={12} weight="bold" />
      </a>
    </div>
  )
}

const ActiveCycleRow = ({ cycle }: { cycle: SRActiveCycle }) => {
  const isLearning = cycle.status === 'active' || cycle.status === 'reset'

  return (
    <div className="flex items-center justify-between rounded-md border border-[#D4DAE3] bg-white px-3 py-2.5">
      <div className="flex items-center gap-3">
        {isLearning ? (
          <SRProgressRing count={cycle.consecutive_correct} target={3} size={36} />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center">
            <SRSpacingTimeline currentLevel={cycle.spacing_level} />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-[#1A2332]">{cycle.topic_name}</p>
          <span className="text-xs text-[#4A5568]">
            {isLearning
              ? `${cycle.consecutive_correct}/3 consecutive correct`
              : `Spacing — re-test in ${cycle.current_spacing_interval ?? '?'}d`}
            {cycle.total_resets > 0 && (
              <span className="ml-1 text-[#8896A7]">
                ({cycle.total_resets} reset{cycle.total_resets !== 1 ? 's' : ''})
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

const ProgressSummaryBar = ({ progress }: { progress: SRProgressSummary }) => {
  if (progress.total === 0) return null

  const segments = [
    { count: progress.durable, color: '#2D9F6F', label: 'Durable' },
    { count: progress.spacing, color: '#1B3FC4', label: 'Spacing' },
    { count: progress.active + progress.reset, color: '#D4DAE3', label: 'Learning' },
  ].filter((s) => s.count > 0)

  return (
    <div className="space-y-1.5">
      {/* Bar */}
      <div className="flex h-2 overflow-hidden rounded-full bg-[#F8F7F5]">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="transition-all duration-300"
            style={{
              width: `${(seg.count / progress.total) * 100}%`,
              backgroundColor: seg.color,
            }}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3">
        {segments.map((seg) => (
          <span key={seg.label} className="flex items-center gap-1 text-[10px] text-[#4A5568]">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            {seg.count} {seg.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const SRSection = ({
  activeCycles,
  dueCycles,
  progress,
  className,
}: SRSectionProps) => {
  const hasAnyCycles = progress.total > 0
  const hasDue = dueCycles.length > 0
  const hasActive = activeCycles.length > 0

  return (
    <section
      className={cn('space-y-4', className)}
      aria-label="Master a Topic — Successive Relearning"
    >
      <SectionHeader
        eyebrow="Successive Relearning"
        title="Master a Topic"
        subtitle={
          hasAnyCycles
            ? `${progress.durable} topic${progress.durable !== 1 ? 's' : ''} mastered to durable memory`
            : 'Answer 3 in a row, then prove it sticks over spaced re-tests'
        }
        level="section"
        action={
          <a
            href="/quiz/focused/setup"
            className="inline-flex items-center gap-1 rounded-sm border border-[#D4DAE3] bg-white px-3 py-1.5 text-xs font-medium text-[#1A2332] transition-colors duration-150 hover:bg-[#F8F7F5]"
          >
            <Target size={14} weight="bold" />
            Start SR Session
          </a>
        }
      />

      {/* Progress bar */}
      {hasAnyCycles && <ProgressSummaryBar progress={progress} />}

      {/* Due re-tests — highest priority */}
      {hasDue && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-[#D4951A]">
            Re-tests due
          </p>
          {dueCycles.map((cycle) => (
            <DueCycleRow key={cycle.id} cycle={cycle} />
          ))}
        </div>
      )}

      {/* Active learning cycles */}
      {hasActive && (
        <div className="space-y-2">
          {hasDue && (
            <p className="text-xs font-medium uppercase tracking-wider text-[#8896A7]">
              In progress
            </p>
          )}
          {activeCycles.slice(0, 5).map((cycle) => (
            <ActiveCycleRow key={cycle.id} cycle={cycle} />
          ))}
          {activeCycles.length > 5 && (
            <p className="text-xs text-[#8896A7]">
              +{activeCycles.length - 5} more topic{activeCycles.length - 5 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasAnyCycles && !hasDue && (
        <div className="rounded-md border border-dashed border-[#D4DAE3] bg-white px-4 py-6 text-center">
          <p className="text-sm text-[#4A5568]">
            No topics in your relearning queue yet.
          </p>
          <p className="mt-1 text-xs text-[#8896A7]">
            Start a Focus Review session to begin mastering individual topics.
          </p>
          <a
            href="/quiz/focused/setup"
            className="mt-3 inline-flex items-center rounded-sm bg-[#1B3FC4] px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-[#1535A8]"
          >
            Start Focus Review
          </a>
        </div>
      )}
    </section>
  )
}
