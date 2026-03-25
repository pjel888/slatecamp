import { cn } from '@/lib/utils'
import type { EndSessionResult } from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubjectBreakdownProps {
  breakdown: EndSessionResult['subjectBreakdown']
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getBarColor = (percent: number): string => {
  if (percent >= 70) return 'bg-[#2D9F6F]'
  if (percent >= 50) return 'bg-[#D4951A]'
  return 'bg-[#D4DAE3]'
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SubjectBreakdown = ({ breakdown }: SubjectBreakdownProps) => {
  // Weakest first
  const sorted = [...breakdown].sort((a, b) => a.percent - b.percent)

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8896A7] mb-3">
        By Subject
      </p>

      <div className="bg-white rounded-md border border-[#D4DAE3] divide-y divide-[#D4DAE3]">
        {sorted.map((subject) => (
          <div key={subject.disciplineId} className="px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-[#1A2332] font-medium leading-snug">
                {subject.disciplineName}
              </span>
              <span className="text-xs text-[#4A5568] tabular-nums ml-3 shrink-0">
                {subject.correct}/{subject.total}
              </span>
            </div>

            {/* Bar track */}
            <div
              className="h-1.5 w-full bg-[#F8F7F5] rounded-sm overflow-hidden"
              role="presentation"
              aria-label={`${subject.disciplineName}: ${subject.percent}%`}
            >
              <div
                className={cn('h-full rounded-sm transition-none', getBarColor(subject.percent))}
                style={{ width: `${subject.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
