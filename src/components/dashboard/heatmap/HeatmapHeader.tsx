'use client'

import { InfoTooltip } from '@/components/shared/InfoTooltip'
import { cn } from '@/lib/utils'

interface HeatmapHeaderProps {
  selectedYear: number
  years: number[]
  onYearChange: (year: number) => void
}

export const HeatmapHeader = ({ selectedYear, years, onYearChange }: HeatmapHeaderProps) => (
  <header className='flex w-full shrink-0 items-start justify-between gap-4 pb-2'>
    <div className='flex flex-col gap-0.5'>
      <h3 className='text-sm font-semibold text-white'>
        Study Activity
      </h3>
      <p className='text-xs text-white/50'>
        Your consistency over the past year
      </p>
    </div>

    <div className='flex items-center gap-2'>
      {/* ── Year dropdown ─────────────────────────────────────────────── */}
      <div className='relative'>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className={cn(
            'appearance-none cursor-pointer rounded-md border border-white/20',
            'bg-white/10 pl-3 pr-7 py-1 text-xs font-medium text-white',
            'hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30',
            'transition-colors',
          )}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <svg
          className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/50'
          width='10'
          height='10'
          viewBox='0 0 10 10'
          fill='none'
        >
          <path
            d='M2 3.5L5 6.5L8 3.5'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>

      <InfoTooltip
        content='Each cell is one day. Darker blue = more activity: logins, articles read, questions completed.'
        side='left'
        align='end'
      />
    </div>
  </header>
)
