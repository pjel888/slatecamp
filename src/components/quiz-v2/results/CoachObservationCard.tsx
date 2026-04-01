'use client'

import { ArrowRight, Brain } from '@phosphor-icons/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { CoachObservation } from '@/types/patent'

interface CoachObservationCardProps {
  observation: CoachObservation | null
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  revisit: { label: 'Review this topic', color: 'text-[#D4951A]' },
  reinforce: { label: 'Practice more', color: 'text-[#1B3FC4]' },
  celebrate: { label: 'Keep it up', color: 'text-[#2D9F6F]' },
}

export const CoachObservationCard = ({ observation }: CoachObservationCardProps) => {
  if (!observation || observation.signalStrength === 'insufficient') return null

  return (
    <div className="rounded-md border border-[#D4DAE3] bg-white p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-[#EEF2FC]">
          <Brain size={16} weight="bold" className="text-[#1B3FC4]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1A2332]">Your Coach's Observation</p>
          {observation.signalStrength === 'moderate' && (
            <p className="text-[11px] text-[#8896A7]">Based on limited signal</p>
          )}
        </div>
      </div>

      {/* Observation message — coach voice */}
      <p className="text-sm text-[#4A5568] leading-relaxed">{observation.message}</p>

      {/* Topic recommendations */}
      {observation.recommendations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {observation.recommendations.slice(0, 4).map((rec) => {
            const config = ACTION_LABELS[rec.action] ?? ACTION_LABELS.revisit
            return (
              <span
                key={`${rec.topicName}-${rec.action}`}
                className={cn(
                  'inline-flex items-center gap-1 rounded-sm border border-[#D4DAE3] px-2.5 py-1',
                  'text-xs font-medium',
                  config.color,
                )}
              >
                {rec.topicName}
                <ArrowRight size={10} weight="bold" aria-hidden="true" />
                <span className="text-[#8896A7]">{config.label}</span>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
