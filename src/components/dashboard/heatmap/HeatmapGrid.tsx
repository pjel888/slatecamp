'use client'

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// ─── Types & Constants ───────────────────────────────────────────────────────

export type Level = 0 | 1 | 2 | 3 | 4

export const LEVEL_BG: Record<Level, string> = {
  0: 'bg-primary/[0.18] dark:bg-primary/25',
  1: 'bg-primary/50 dark:bg-primary/55',
  2: 'bg-primary/70 dark:bg-primary/75',
  3: 'bg-primary/90 dark:bg-primary/95',
  4: 'bg-primary dark:bg-primary',
}

export const toLevel = (n: number): Level => {
  if (n <= 0) return 0
  if (n === 1) return 1
  if (n <= 3) return 2
  if (n <= 6) return 3
  return 4
}

const COLS = 7
const ROWS = 5
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

export const dateISO = (year: number, month: number, day: number): string =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const formatTooltip = (iso: string): string =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MonthBlock {
  year: number
  month: number
  dim: number
  blockIndex: number
  isYearStart: boolean
}

export interface HeatmapLayout {
  cell: number
  step: number
  blockW: number
  blockH: number
  slot: number
  totalW: number
  monthGap: number
}

interface HeatmapGridProps {
  blocks: MonthBlock[]
  layout: HeatmapLayout
  actMap: Map<string, number>
  examSet: Set<string>
  signupISO: string
  todayISO: string
  headerH: number
  sepGap: number
  gap: number
}

// ─── Component ───────────────────────────────────────────────────────────────

export const HeatmapGrid = ({
  blocks,
  layout,
  actMap,
  examSet,
  signupISO,
  todayISO,
  headerH,
  sepGap,
  gap,
}: HeatmapGridProps) => (
  <div
    className='relative w-full'
    style={{ height: headerH + layout.blockH }}
  >
    {/* ── Month labels ────────────────────────────────────────── */}
    {blocks.map((b) => (
      <span
        key={b.blockIndex}
        className='absolute text-xs leading-none text-muted-foreground select-none whitespace-nowrap'
        style={{
          top: 0,
          left: b.blockIndex * layout.slot,
          width: layout.blockW,
          textAlign: 'center',
        }}
      >
        {MONTH_NAMES[b.month]}
      </span>
    ))}

    {/* ── Separators ──────────────────────────────────────────── */}
    {blocks.slice(1).map((b) => {
      const x = b.blockIndex * layout.slot - sepGap / 2 - 0.5
      return b.isYearStart ? (
        <div
          key={b.blockIndex}
          className='pointer-events-none absolute bg-border'
          style={{
            left: x,
            top: 0,
            width: 1.5,
            height: headerH + layout.blockH,
            borderRadius: 1,
          }}
        />
      ) : (
        <div
          key={b.blockIndex}
          className='pointer-events-none absolute bg-border/70'
          style={{
            left: x,
            top: headerH,
            width: 1,
            height: layout.blockH,
          }}
        />
      )
    })}

    {/* ── Month blocks ────────────────────────────────────────── */}
    {blocks.map((b) => (
      <div
        key={b.blockIndex}
        className='absolute'
        style={{
          top: headerH,
          left: b.blockIndex * layout.slot,
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${layout.cell}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${layout.cell}px)`,
          gap,
          width: layout.blockW,
          height: layout.blockH,
        }}
      >
        {Array.from({ length: COLS * ROWS }, (_, s) => {
          const day = s + 1

          if (day > b.dim) {
            return (
              <div
                key={s}
                className='rounded-[2px] bg-primary/[0.08]'
              />
            )
          }

          const iso = dateISO(b.year, b.month, day)
          const isExamDay = examSet.has(iso)
          const isToday = iso === todayISO
          const beforeSignup = iso < signupISO
          const count = beforeSignup ? 0 : (actMap.get(iso) ?? 0)
          const level = toLevel(count)
          const isSignup = iso === signupISO

          const tipText =
            (isExamDay
              ? `${formatTooltip(iso)} · Exam day`
              : beforeSignup
                ? `${formatTooltip(iso)} · Before signup`
                : `${formatTooltip(iso)} · ${
                    count === 0
                      ? 'No activity'
                      : `${count} ${count === 1 ? 'activity' : 'activities'}`
                  }${isSignup ? ' · Account created' : ''}`) +
            (isToday ? ' · Today' : '')

          return (
            <Tooltip key={s}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'rounded-[2px] cursor-default transition-opacity hover:opacity-70',
                    isExamDay
                      ? 'bg-destructive ring-1 ring-destructive ring-offset-[1px]'
                      : beforeSignup
                        ? 'bg-primary/[0.12]'
                        : LEVEL_BG[level],
                    isSignup &&
                      !isExamDay &&
                      '!bg-emerald ring-2 ring-emerald ring-offset-1 z-10',
                    isToday &&
                      'ring-2 ring-warning ring-offset-[1px] z-10',
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side='top' sideOffset={6}>
                {tipText}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    ))}
  </div>
)
