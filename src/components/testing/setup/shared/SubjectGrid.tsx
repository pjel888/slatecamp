'use client'

import { cn } from '@/lib/utils'

interface SubjectMastery {
  subjectId: string
  mastery: number
}

interface SubjectEntry {
  subjectId: string
  subjectName: string
}

interface SubjectGridProps {
  subjects: SubjectEntry[]
  masteryData: SubjectMastery[]
  selectedId: string | null
  onSelect: (subjectId: string) => void
}

const SubjectGrid = ({ subjects, masteryData, selectedId, onSelect }: SubjectGridProps) => {
  const getMastery = (subjectId: string): number => {
    const entry = masteryData.find((m) => m.subjectId === subjectId)
    return entry?.mastery ?? 0
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {subjects.map((subject) => {
        const mastery = getMastery(subject.subjectId)
        const isSelected = selectedId === subject.subjectId
        return (
          <button
            key={subject.subjectId}
            type="button"
            onClick={() => onSelect(subject.subjectId)}
            aria-pressed={isSelected}
            className={cn(
              'rounded-md border p-4 text-left transition-all duration-150 ease-out hover:shadow-sm select-none',
              isSelected
                ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                : 'border-[var(--border)] bg-white hover:border-[var(--primary)]/40',
            )}
          >
            <p
              className={cn(
                'text-[13px] font-medium leading-snug mb-2',
                isSelected ? 'text-[var(--primary)]' : 'text-[var(--foreground)]',
              )}
            >
              {subject.subjectName}
            </p>
            <p className="text-[12px] text-[var(--muted-foreground)]">{mastery}% mastery</p>
          </button>
        )
      })}
    </div>
  )
}

SubjectGrid.displayName = 'SubjectGrid'

export { SubjectGrid }
