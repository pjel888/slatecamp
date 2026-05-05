'use client'

import { CalendarBlank } from '@phosphor-icons/react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { InfoTooltip } from '@/components/shared/InfoTooltip'
import { cn } from '@/lib/utils'

const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const fromISODate = (date: string): Date => {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

interface HeatmapHeaderProps {
  selectedYear: number
  years: number[]
  examDates: string[]
  onYearChange: (year: number) => void
  onExamDatesChange: (dates: string[]) => void
}

export const HeatmapHeader = ({
  selectedYear,
  years,
  examDates,
  onYearChange,
  onExamDatesChange,
}: HeatmapHeaderProps) => {
  const selectedExamDates = examDates.map(fromISODate)
  const calendarLabel =
    examDates.length === 0
      ? 'Exam dates'
      : `${examDates.length} exam day${examDates.length === 1 ? '' : 's'}`

  return (
    <header className='flex w-full shrink-0 items-start justify-between gap-4 pb-2'>
      <div className='flex flex-col gap-0.5'>
        <h3 className='text-sm font-semibold text-foreground'>
          Study Activity
        </h3>
        <p className='text-xs text-muted-foreground'>
          Your consistency over the past year
        </p>
      </div>

      <div className='flex items-center gap-2'>
        <div className='relative'>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className={cn(
              'appearance-none cursor-pointer rounded-md border border-border/70',
              'bg-transparent pl-3 pr-7 py-1 text-xs font-medium text-foreground',
              'hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30',
              'transition-colors',
            )}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <svg
            className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground'
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

        <Popover>
          <PopoverTrigger asChild>
            <button
              type='button'
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border border-border/70',
                'bg-transparent px-2.5 py-1 text-xs font-medium text-foreground',
                'transition-colors hover:border-primary/40 hover:bg-primary/[0.04]',
                'focus:outline-none focus:ring-2 focus:ring-primary/30',
              )}
              aria-label='Select exam dates for the study activity heatmap'
            >
              <CalendarBlank className='h-3.5 w-3.5 text-primary' aria-hidden />
              <span>{calendarLabel}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align='end' side='bottom' className='w-auto p-2'>
            <Calendar
              mode='multiple'
              selected={selectedExamDates}
              defaultMonth={
                selectedExamDates[0] ?? new Date(selectedYear, 0, 1, 12)
              }
              onSelect={(dates) => {
                onExamDatesChange(
                  (dates ?? [])
                    .map(toISODate)
                    .sort((a, b) => a.localeCompare(b)),
                )
              }}
            />
            <div className='flex items-center justify-between border-t border-border/60 px-2 pt-2'>
              <span className='text-[11px] text-muted-foreground'>
                Select one or more LEA exam days
              </span>
              <button
                type='button'
                className='text-[11px] font-medium text-primary hover:underline'
                onClick={() => onExamDatesChange([])}
              >
                Clear
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <InfoTooltip
          content='Each cell is one day. Darker blue = more activity: logins, articles read, questions completed.'
          side='left'
          align='end'
        />
      </div>
    </header>
  )
}
