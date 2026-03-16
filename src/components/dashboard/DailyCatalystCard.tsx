import Link from 'next/link'
import { ArrowRight, Play, Zap, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DailyCatalyst } from '@/lib/actions/dashboard'

const CATALYST_CONFIG = {
  resume: {
    icon: RotateCcw,
    label: 'Resume where you left off',
    accent: 'bg-blue-600',
    iconBg: 'bg-blue-500',
  },
  drill: {
    icon: Zap,
    label: 'Targeted drill',
    accent: 'bg-blue-600',
    iconBg: 'bg-blue-500',
  },
  warmup: {
    icon: Play,
    label: 'Recommended for you',
    accent: 'bg-blue-600',
    iconBg: 'bg-blue-500',
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
    <div className='bg-blue-600 rounded-md border border-blue-700 p-5 flex flex-col gap-4 relative overflow-hidden group'>
      {/* Subtle background texture */}
      <div
        className='absolute inset-0 opacity-[0.06] pointer-events-none'
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Header */}
      <div className='flex items-start gap-3 relative z-10'>
        <div className='p-2 rounded-md bg-blue-500/50 shrink-0 mt-0.5'>
          <Icon className='h-4 w-4 text-white' />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-blue-200 text-xs font-bold uppercase tracking-widest leading-none mb-1.5'>
            {config.label}
          </p>
          <h2 className='text-white text-lg font-semibold leading-tight tracking-tight'>
            {catalyst.title}
          </h2>
          <p className='text-blue-100/80 text-sm mt-1.5 leading-relaxed'>
            {catalyst.subtitle}
          </p>
        </div>
      </div>

      {/* Progress bar (resume only) */}
      {progressPercent !== null && (
        <div className='relative z-10'>
          <div className='flex items-center justify-between mb-1.5'>
            <span className='text-xs font-medium text-blue-200'>
              Question {catalyst.progress!.current} of {catalyst.progress!.total}
            </span>
            <span className='text-xs font-bold text-blue-100'>
              {progressPercent}% complete
            </span>
          </div>
          <div className='h-1.5 bg-blue-500/40 rounded-full overflow-hidden'>
            <div
              className='h-full bg-white/80 rounded-full transition-all duration-300'
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className='flex items-center justify-between relative z-10'>
        <div className='flex items-center gap-1.5 bg-blue-500/40 text-blue-100 text-xs font-medium px-2.5 py-1 rounded-full'>
          <svg className='h-3 w-3' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
            <circle cx='12' cy='12' r='10' />
            <polyline points='12 6 12 12 16 14' />
          </svg>
          ~{catalyst.estimatedMinutes} min
        </div>

        <Link
          href={catalyst.href}
          className={cn(
            'flex items-center gap-2 bg-white text-blue-600 font-bold text-sm',
            'px-4 py-2 rounded-md',
            'hover:bg-blue-50 transition-colors duration-150',
            'group-hover:shadow-md',
          )}
        >
          {catalyst.type === 'resume' ? 'Continue' : 'Start'}
          <ArrowRight className='h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5' />
        </Link>
      </div>
    </div>
  )
}

export function DailyCatalystCardSkeleton() {
  return (
    <div className='bg-blue-600/20 rounded-md border border-blue-200 p-5 flex flex-col gap-4 animate-pulse'>
      <div className='flex items-start gap-3'>
        <div className='w-8 h-8 bg-blue-200/50 rounded-md shrink-0' />
        <div className='flex-1 space-y-2'>
          <div className='h-2 bg-blue-200/50 rounded w-24' />
          <div className='h-5 bg-blue-200/50 rounded w-48' />
          <div className='h-3 bg-blue-200/30 rounded w-full' />
        </div>
      </div>
      <div className='flex justify-between items-center'>
        <div className='h-6 bg-blue-200/40 rounded-full w-16' />
        <div className='h-9 bg-blue-200/50 rounded-md w-24' />
      </div>
    </div>
  )
}
