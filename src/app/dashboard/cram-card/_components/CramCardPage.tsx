'use client'

import type { CramCardData } from '@/lib/actions/cram-card'
import { CramCardEntry } from './CramCardEntry'
import { CramCardGate } from './CramCardGate'

type Props = {
  data: CramCardData
}

export const CramCardPage = ({ data }: Props) => {
  if (data.gated) {
    return <CramCardGate totalSessions={data.totalSessions} />
  }

  const ungated = data as Extract<CramCardData, { gated: false }>
  const entries = ungated.entries

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <p className="font-mono text-[9px] text-[#1B3FC4] tracking-widest uppercase">
          YOUR CRAM CARD
        </p>
        <h1 className="text-xl font-semibold text-[#1A2332]">Values to memorize</h1>
        <p className="text-sm text-[#4A5568]">
          {entries.length === 0
            ? 'No entries yet — keep practicing to surface your weakest numerical values.'
            : `${entries.length} ${entries.length === 1 ? 'topic' : 'topics'} ranked by your accuracy, lowest first.`}
        </p>
      </div>

      {/* Entry list */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {entries.map((entry, index) => (
            <CramCardEntry key={entry.aleId || index} entry={entry} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
