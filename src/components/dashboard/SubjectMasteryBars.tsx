'use client'

export interface SubjectMasteryBarsProps {
  subjects: { name: string; mastery: number }[]
}

function getBarColor(mastery: number): string {
  if (mastery >= 70) return '#2D9F6F'
  if (mastery >= 40) return '#E8853A'
  if (mastery > 0) return '#D64545'
  return '#D4DAE3'
}

export function SubjectMasteryBarsSkeleton() {
  return (
    <div className="bg-white border border-[#D4DAE3] rounded-md p-5">
      <div className="h-3 w-36 bg-[#F2F0EB] rounded-full animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div
              className="h-3 bg-[#F2F0EB] rounded-full animate-pulse mb-1.5"
              style={{ width: `${55 + i * 10}%` }}
            />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#F2F0EB] rounded-full animate-pulse" />
              <div className="h-3 w-9 bg-[#F2F0EB] rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SubjectMasteryBars({ subjects }: SubjectMasteryBarsProps) {
  if (subjects.length === 0) {
    return <SubjectMasteryBarsSkeleton />
  }

  return (
    <div className="bg-white border border-[#D4DAE3] rounded-md p-5">
      <p className="font-dm-mono text-[11px] font-medium text-[#8896A7] uppercase tracking-[0.2em] mb-4">
        Subject Mastery
      </p>

      <div className="space-y-3">
        {subjects.map((subject) => {
          const clamped = Math.max(0, Math.min(100, Math.round(subject.mastery)))
          const barColor = getBarColor(clamped)

          return (
            <div key={subject.name}>
              <p className="text-sm text-[#4A5568] leading-snug mb-1">
                {subject.name}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#F2F0EB] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${clamped}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
                <span className="text-[11px] font-medium text-[#1A2332] w-[36px] text-right tabular-nums">
                  {clamped}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
