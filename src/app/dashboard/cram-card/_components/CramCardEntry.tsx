'use client'

import type { CramCardEntry as CramCardEntryType } from '@/lib/actions/cram-card'

type Props = {
  entry: CramCardEntryType
  index: number
}

export const CramCardEntry = ({ entry, index }: Props) => {
  const entryNumber = String(index + 1).padStart(2, '0')

  return (
    <div className="bg-card rounded-md border border-border p-4 flex flex-col gap-2">
      {/* Header row: number + LEA ID + frequency badge */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-primary leading-none">{entryNumber}</span>
        <span className="font-mono text-[9px] text-primary leading-none">{entry.leaId}</span>
        <span className="ml-auto font-mono text-[9px] text-muted-foreground leading-none uppercase">
          {entry.examFrequency}
        </span>
      </div>

      {/* Subtopic name */}
      <p className="font-semibold text-sm text-foreground leading-snug">{entry.subtopicName}</p>

      {/* The value — primary memorization target */}
      {entry.theValue && (
        <p className="font-bold text-sm text-primary">{entry.theValue}</p>
      )}

      {/* Code reference */}
      {entry.codeReference && (
        <p className="font-mono text-[11px] text-muted-foreground">{entry.codeReference}</p>
      )}

      {/* Memory hook */}
      {entry.memoryHook && (
        <p className="italic text-xs text-muted-foreground">{entry.memoryHook}</p>
      )}

      {/* Accuracy stat */}
      <p className="font-mono text-[10px] text-muted-foreground mt-1">
        You&apos;ve answered this correctly {entry.correctCount} of {entry.totalAttempts} times (
        {entry.accuracyPct}%)
      </p>
    </div>
  )
}
