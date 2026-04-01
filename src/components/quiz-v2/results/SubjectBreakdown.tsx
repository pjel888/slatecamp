import { getSubjectColor } from '@/lib/constants/subject-colors'
import type { EndSessionResult } from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubjectBreakdownProps {
  breakdown: EndSessionResult['subjectBreakdown']
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
        {sorted.map((subject) => {
          const colors = getSubjectColor(subject.disciplineId)
          return (
            <div
              key={subject.disciplineId}
              className="flex px-4 py-3"
            >
              {/* Subject accent left border dot */}
              <div
                className="w-0.5 rounded-full shrink-0 mr-3 self-stretch"
                style={{ backgroundColor: colors.border }}
                aria-hidden="true"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-sm font-medium leading-snug"
                    style={{ color: colors.text }}
                  >
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
                    className="h-full rounded-sm transition-none"
                    style={{ width: `${subject.percent}%`, backgroundColor: colors.border }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
