'use client'

import Link from 'next/link'
import { ArrowRight, Play, Lightning, ArrowCounterClockwise } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import type { DailyCatalyst } from '@/lib/actions/dashboard'

const CATALYST_CONFIG = {
  resume: {
    icon: ArrowCounterClockwise,
    label: 'Pick up where you left off',
    accent: 'bg-primary',
    iconBg: 'bg-[#1B3FC4]',
  },
  drill: {
    icon: Lightning,
    label: 'Focused practice session',
    accent: 'bg-primary',
    iconBg: 'bg-[#1B3FC4]',
  },
  warmup: {
    icon: Play,
    label: 'Suggested for today',
    accent: 'bg-primary',
    iconBg: 'bg-[#1B3FC4]',
  },
} as const

interface DailyCatalystCardProps {
  catalyst: DailyCatalyst
}

export function DailyCatalystCard({ catalyst }: DailyCatalystCardProps) {
  const config = CATALYST_CONFIG[catalyst.type]
  const Icon = config.icon
  const progressPercent = catalyst.progress
    ? Math.round((catalyst.progress.current / catalyst.progress.total) * 100)
    : null

  return (
    <div className='bg-primary rounded-md border border-[#1535A8] p-5 flex flex-col gap-4 h-full relative overflow-hidden group'>
      {/* Header */}
      <div className='flex items-start gap-3 relative z-10'>
        <div className='p-2 rounded-md bg-primary/50 shrink-0 mt-0.5'>
          <SCIcon icon={Icon} size='sm' className='text-white' />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='font-dm-mono text-[11px] font-medium text-white/50 uppercase tracking-[0.2em] leading-none mb-1.5'>
            {config.label}
          </p>
          <h2 className='font-display text-white text-xl font-extrabold leading-tight tracking-tight'>
            {catalyst.title}
          </h2>
          <p className='text-primary/80 text-sm mt-1.5 leading-relaxed'>
            {catalyst.subtitle}
          </p>
        </div>
      </div>

      {/* Progress bar (resume only) */}
      {progressPercent !== null && (
        <div className='relative z-10'>
          <div className='flex items-center justify-between mb-1.5'>
            <span className='text-xs font-medium text-primary/20'>
              Question {catalyst.progress!.current} of{' '}
              {catalyst.progress!.total}
            </span>
            <span className='text-xs font-bold text-primary/10'>
              {progressPercent}% complete
            </span>
          </div>
          <div className='h-1.5 bg-[#EEF2FC] rounded-full overflow-hidden'>
            <div
              className='h-full bg-white/80 rounded-full transition-all duration-300'
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className='flex items-center justify-between relative z-10'>
        <div className='flex items-center gap-1.5 bg-primary/40 text-primary/10 text-xs font-medium px-2.5 py-1 rounded-full'>
          <svg
            className='h-3 w-3'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <circle cx='12' cy='12' r='10' />
            <polyline points='12 6 12 12 16 14' />
          </svg>
          ~{catalyst.estimatedMinutes} min
        </div>

        <Link
          href={catalyst.href}
          className={cn(
            'flex items-center gap-2 bg-white text-primary font-bold text-sm',
            'px-4 py-2 rounded-sm',
            'hover:bg-[#EEF2FC] transition-colors duration-150',
            'group-hover:shadow-md',
          )}
        >
          {catalyst.type === 'resume' ? 'Continue' : 'Start'}
          <SCIcon icon={ArrowRight} size='sm' className='transition-transform duration-150 group-hover:translate-x-0.5' />
        </Link>
      </div>
    </div>
  )
}

export function DailyCatalystCardSkeleton() {
  return (
    <div className='bg-primary/20 rounded-md border border-primary/20 p-5 flex flex-col gap-4 animate-pulse'>
      <div className='flex items-start gap-3'>
        <div className='w-8 h-8 bg-primary/50 rounded-md shrink-0' />
        <div className='flex-1 space-y-2'>
          <div className='h-2 bg-primary/50 rounded w-24' />
          <div className='h-5 bg-primary/50 rounded w-48' />
          <div className='h-3 bg-primary/30 rounded w-full' />
        </div>
      </div>
      <div className='flex justify-between items-center'>
        <div className='h-6 bg-primary/40 rounded-full w-16' />
        <div className='h-9 bg-primary/50 rounded-md w-24' />
      </div>
    </div>
  )
}
