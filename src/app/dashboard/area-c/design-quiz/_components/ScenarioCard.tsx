'use client'

import Link from 'next/link'
import { Clock, Warning } from '@phosphor-icons/react'
import type { DesignScenario } from '@/lib/design-scenarios'

const DIFFICULTY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  FOUNDATIONAL: { label: 'Foundational', color: 'var(--success)', bg: 'var(--success-50)' },
  INTERMEDIATE: { label: 'Intermediate', color: 'var(--warning)', bg: 'var(--warning-50)' },
  ADVANCED: { label: 'Advanced', color: 'var(--destructive)', bg: 'var(--destructive-50)' },
}

type ScenarioCardProps = {
  scenario: DesignScenario
}

export const ScenarioCard = ({ scenario }: ScenarioCardProps) => {
  const style = DIFFICULTY_STYLES[scenario.difficulty] ?? {
    label: scenario.difficulty,
    color: 'var(--muted-foreground)',
    bg: 'var(--background)',
  }

  const hours = Math.floor(scenario.time_limit_minutes / 60)
  const mins = scenario.time_limit_minutes % 60
  const timeLabel =
    hours > 0 ? (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`) : `${mins}m`

  const href = `/dashboard/area-c/design-quiz/${scenario.id}`

  return (
    <Link
      href={href}
      className='group block rounded-md border border-border bg-card p-4 flex flex-col gap-3 transition-shadow duration-150 ease-out hover:shadow-sm'
    >
      {/* Header */}
      <div className='flex items-start justify-between gap-2'>
        <div className='flex-1 min-w-0'>
          <p className='text-[10px] text-muted-foreground mb-1'>{scenario.building_type}</p>
          <h3 className='text-sm font-semibold text-foreground leading-snug'>{scenario.title}</h3>
        </div>
        <span
          className='shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-sm'
          style={{ color: style.color, background: style.bg }}
        >
          {style.label}
        </span>
      </div>

      {/* Brief excerpt */}
      <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>{scenario.brief}</p>

      {/* Footer */}
      <div className='flex items-center justify-between gap-2 pt-1 border-t border-border/60'>
        <div className='flex items-center gap-3'>
          <span className='text-[10px] text-muted-foreground'>
            {scenario.questions.length} questions
          </span>
          {scenario.trap_count > 0 && (
            <div className='flex items-center gap-1'>
              <Warning size={11} className='text-warning' weight='fill' />
              <span className='text-[10px] text-warning'>
                Contains {scenario.trap_count} hidden {scenario.trap_count === 1 ? 'trap' : 'traps'}
              </span>
            </div>
          )}
        </div>
        <div className='flex items-center gap-1 text-muted-foreground'>
          <Clock size={12} />
          <span className='text-[10px]'>{timeLabel}</span>
        </div>
      </div>
    </Link>
  )
}
