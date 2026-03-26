'use client'

import type { CramCardEntry as CramCardEntryType } from '@/lib/actions/cram-card'

type Props = {
  entry: CramCardEntryType
  index: number
}

export const CramCardEntry = ({ entry, index }: Props) => {
  const entryNumber = String(index + 1).padStart(2, '0')

  return (
    <div className="bg-white rounded-md border border-[#D4DAE3] p-4 flex flex-col gap-2">
      {/* Header row: number + ALE ID + frequency badge */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-[#1B3FC4] leading-none">{entryNumber}</span>
        <span className="font-mono text-[9px] text-[#1B3FC4] leading-none">{entry.aleId}</span>
        <span className="ml-auto font-mono text-[9px] text-[#8896A7] leading-none uppercase">
          {entry.examFrequency}
        </span>
      </div>

      {/* Subtopic name */}
      <p className="font-semibold text-sm text-[#1A2332] leading-snug">{entry.subtopicName}</p>

      {/* The value — primary memorization target */}
      {entry.theValue && (
        <p className="font-bold text-sm text-[#1B3FC4]">{entry.theValue}</p>
      )}

      {/* Code reference */}
      {entry.codeReference && (
        <p className="font-mono text-[11px] text-[#8896A7]">{entry.codeReference}</p>
      )}

      {/* Memory hook */}
      {entry.memoryHook && (
        <p className="italic text-xs text-[#4A5568]">{entry.memoryHook}</p>
      )}

      {/* Accuracy stat */}
      <p className="font-mono text-[10px] text-[#8896A7] mt-1">
        You&apos;ve answered this correctly {entry.correctCount} of {entry.totalAttempts} times (
        {entry.accuracyPct}%)
      </p>
    </div>
  )
}
