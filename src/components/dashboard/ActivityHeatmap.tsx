'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { InfoTooltip } from '@/components/shared/InfoTooltip'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const COLS = 7 // days per row
const ROWS = 5 // max weeks per month: ceil(31/7)
const TOTAL_MONTHS = 12

// Fixed structural spacings (independent of cell size)
const GAP = 2 // px gap between cells within a block
const SEP_GAP = 8 // px gap between month blocks (separator lives here)
const YEAR_ROW_H = 0 // year shown in dropdown, not in grid
const MONTH_ROW_H = 13
const HEADER_GAP = 3
const HEADER_H = MONTH_ROW_H + HEADER_GAP // 16 px

const MOCK_START = new Date('2026-01-01T12:00:00')
const MOCK_SIGNUP = new Date('2026-01-18T12:00:00')
const MOCK_SIGNUP_YEAR = 2026
const CURRENT_YEAR = new Date().getFullYear()
// Mock exam: 3-day board exam in late June 2026
const MOCK_EXAM_DATES: string[] = ['2026-06-26', '2026-06-27', '2026-06-28']

// ─── Derived layout (from measured container width) ───────────────────────────
//
// availableWidth = TOTAL_MONTHS * BLOCK_W + (TOTAL_MONTHS - 1) * SEP_GAP
// BLOCK_W        = 7 * STEP - GAP  = 7*(CELL+GAP) - GAP = 7*CELL + 6*GAP
// → CELL = (BLOCK_W - 6*GAP) / 7
//
// So: BLOCK_W = (availableWidth - (TOTAL_MONTHS-1)*SEP_GAP) / TOTAL_MONTHS
//     CELL    = floor((BLOCK_W - 6*GAP) / 7)
//     STEP    = CELL + GAP
//     BLOCK_W = recalculated from integer CELL = 7*CELL + 6*GAP
//     SLOT    = BLOCK_W + SEP_GAP

function deriveLayout(containerWidth: number) {
  const totalSep = (TOTAL_MONTHS - 1) * SEP_GAP
  const blockW_raw = (containerWidth - totalSep) / TOTAL_MONTHS
  const cell = Math.max(6, Math.floor((blockW_raw - 6 * GAP) / 7))
  const step = cell + GAP
  const blockW = 7 * step - GAP // exact integer pixel block
  const blockH = 5 * step - GAP
  const slot = blockW + SEP_GAP
  const totalW = TOTAL_MONTHS * slot - SEP_GAP
  return { cell, step, blockW, blockH, slot, totalW }
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function dateISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function signupISOStr(d: Date): string {
  return dateISO(d.getFullYear(), d.getMonth(), d.getDate())
}

function formatTooltip(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Activity levels ──────────────────────────────────────────────────────────

type Level = 0 | 1 | 2 | 3 | 4

function toLevel(n: number): Level {
  if (n <= 0) return 0
  if (n === 1) return 1
  if (n <= 3) return 2
  if (n <= 6) return 3
  return 4
}

const LEVEL_BG: Record<Level, string> = {
  0: 'bg-zinc-100 dark:bg-zinc-800',
  1: 'bg-primary/10',
  2: 'bg-primary/20',
  3: 'bg-primary/60',
  4: 'bg-primary',
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActivityDay {
  date: string
  count: number
}

interface MonthBlock {
  year: number
  month: number
  dim: number
  blockIndex: number
  isYearStart: boolean
}

interface YearSpan {
  year: number
  firstBlock: number
  lastBlock: number
}

// ─── Data builders ────────────────────────────────────────────────────────────

function buildBlocks(start: Date): {
  blocks: MonthBlock[]
  yearSpans: YearSpan[]
} {
  const blocks: MonthBlock[] = []
  const yearSpans: YearSpan[] = []
  let y = start.getFullYear()
  let m = start.getMonth()
  let lastYear = -1

  for (let i = 0; i < TOTAL_MONTHS; i++) {
    const isYearStart = y !== lastYear
    if (isYearStart) {
      yearSpans.push({ year: y, firstBlock: i, lastBlock: i })
      lastYear = y
    } else {
      yearSpans[yearSpans.length - 1].lastBlock = i
    }
    blocks.push({
      year: y,
      month: m,
      dim: daysInMonth(y, m),
      blockIndex: i,
      isYearStart,
    })
    if (++m > 11) {
      m = 0
      y++
    }
  }
  return { blocks, yearSpans }
}

function generateMock(start: Date, signup: Date): ActivityDay[] {
  const iso0 = signupISOStr(signup)
  const todayISO = signupISOStr(new Date())
  // Last exam date — activity drops off after this
  const lastExamDate = MOCK_EXAM_DATES[MOCK_EXAM_DATES.length - 1] ?? ''
  let y = start.getFullYear()
  let m = start.getMonth()
  const result: ActivityDay[] = []

  for (let i = 0; i < TOTAL_MONTHS; i++) {
    const dim = daysInMonth(y, m)
    for (let d = 1; d <= dim; d++) {
      const iso = dateISO(y, m, d)
      if (iso < iso0) {
        result.push({ date: iso, count: 0 })
        continue
      }
      if (iso > todayISO) {
        result.push({ date: iso, count: 0 })
        continue
      }

      const r = Math.random()

      // ── Post-exam: sparse activity ────────────────────────────────────────
      // Adjust 0.90 to control density: 0.70 = moderate, 0.98 = almost nothing
      if (iso > lastExamDate) {
        result.push({ date: iso, count: r < 0.9 ? 0 : 1 })
        continue
      }

      // ── Normal activity before/during exam period ─────────────────────────
      result.push({
        date: iso,
        count:
          r < 0.5
            ? 0
            : r < 0.78
              ? 1
              : r < 0.92
                ? 2
                : r < 0.98
                  ? 3
                  : 4 + Math.floor(Math.random() * 4),
      })
    }
    if (++m > 11) {
      m = 0
      y++
    }
  }
  return result
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ActivityHeatmapProps {
  data?: ActivityDay[]
  /** Year the account was created — first selectable year. Defaults to 2026. */
  signupYear?: number
  /** Last selectable year. Defaults to current year. */
  endYear?: number
  accountCreatedAt?: Date
  /**
   * ISO date strings (YYYY-MM-DD) for exam days.
   * These cells render in orange-red regardless of activity level.
   * Can span multiple days (e.g. a 3-day board exam).
   */
  examDates?: string[]
}

export function ActivityHeatmap({
  data,
  signupYear,
  endYear,
  accountCreatedAt,
  examDates,
}: ActivityHeatmapProps) {
  const signup = accountCreatedAt ?? MOCK_SIGNUP
  const firstYear = signupYear ?? MOCK_SIGNUP_YEAR
  const lastYear = endYear ?? Math.max(CURRENT_YEAR, firstYear)

  // Set of exam date strings for O(1) lookup
  const examSet = useMemo(
    () => new Set(examDates ?? MOCK_EXAM_DATES),
    [examDates],
  )

  // Available years for the dropdown
  const years = useMemo(
    () =>
      Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i),
    [firstYear, lastYear],
  )

  const [selectedYear, setSelectedYear] = useState(firstYear)

  // Jan 1 of the selected year
  const start = useMemo(
    () => new Date(`${selectedYear}-01-01T12:00:00`),
    [selectedYear],
  )

  // ── Measure container width ──────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setContainerW(entry.contentRect.width)
    })
    ro.observe(el)
    setContainerW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  // ── Derive pixel layout from container width ──────────────────────────────
  const layout = useMemo(
    () => (containerW > 0 ? deriveLayout(containerW) : null),
    [containerW],
  )

  // ── Data ─────────────────────────────────────────────────────────────────
  const iso0 = useMemo(() => signupISOStr(signup), [signup])
  const mock = useMemo(() => generateMock(start, signup), [start, signup])
  const days = data ?? mock

  const actMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const d of days) m.set(d.date, d.count)
    return m
  }, [days])

  const { blocks, yearSpans } = useMemo(() => buildBlocks(start), [start])
  const todayISO = signupISOStr(new Date())

  return (
    <div className='flex w-full min-w-0 flex-col p-2 overflow-y-auto scrollbar-thin flex-1 min-h-0'>
      {/* ── Card header ───────────────────────────────────────────────────── */}
      <header className='flex w-full shrink-0 items-start justify-between gap-4 pb-2'>
        <div className='flex flex-col gap-0.5'>
          <h3 className='text-sm font-semibold text-zinc-900'>
            Study Activity
          </h3>
          <p className='text-xs text-zinc-500'>
            Your consistency over the past year
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {/* ── Year dropdown ─────────────────────────────────────────────── */}
          <div className='relative'>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={cn(
                'appearance-none cursor-pointer rounded-md border border-border',
                'bg-white pl-3 pr-7 py-1 text-xs font-medium text-zinc-700',
                'hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/30',
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
              className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400'
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

      {/* ── Measurement + grid container ──────────────────────────────────── */}
      <div ref={containerRef} className='w-full min-w-0'>
        {layout && (
          <>
            {/* Single positioning root — no scrollbar, fills 100% */}
            <div
              className='relative w-full'
              style={{ height: HEADER_H + layout.blockH }}
            >
              {/* ── Month labels ────────────────────────────────────────── */}
              {blocks.map((b) => (
                <span
                  key={b.blockIndex}
                  className='absolute text-xs leading-none text-zinc-500 select-none whitespace-nowrap'
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
                const x = b.blockIndex * layout.slot - SEP_GAP / 2 - 0.5
                return b.isYearStart ? (
                  <div
                    key={b.blockIndex}
                    className='pointer-events-none absolute bg-zinc-300'
                    style={{
                      left: x,
                      top: 0,
                      width: 1.5,
                      height: HEADER_H + layout.blockH,
                      borderRadius: 1,
                    }}
                  />
                ) : (
                  <div
                    key={b.blockIndex}
                    className='pointer-events-none absolute bg-zinc-200'
                    style={{
                      left: x,
                      top: HEADER_H,
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
                    top: HEADER_H,
                    left: b.blockIndex * layout.slot,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${COLS}, ${layout.cell}px)`,
                    gridTemplateRows: `repeat(${ROWS}, ${layout.cell}px)`,
                    gap: GAP,
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
                          className='rounded-[2px] bg-zinc-100 dark:bg-zinc-800'
                          style={{ opacity: 0.3 }}
                        />
                      )
                    }

                    const iso = dateISO(b.year, b.month, day)
                    const isExamDay = examSet.has(iso)
                    const isToday = iso === todayISO
                    const beforeSignup = iso < iso0
                    const count = beforeSignup ? 0 : (actMap.get(iso) ?? 0)
                    const level = toLevel(count)
                    const isSignup = iso === iso0

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
                            // title={tipText}
                            className={cn(
                              'rounded-[2px] cursor-default transition-opacity hover:opacity-70',
                              isExamDay
                                ? 'bg-red-400 ring-1 ring-red-600 ring-offset-[1px]'
                                : beforeSignup
                                  ? 'bg-zinc-100 dark:bg-zinc-800'
                                  : LEVEL_BG[level],
                              isSignup &&
                                !isExamDay &&
                                '!bg-green-500 ring-2 ring-green-700 ring-offset-1 z-10',
                              isToday &&
                                'ring-2 ring-amber-500 ring-offset-[1px] z-10',
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

            {/* ── Legend ────────────────────────────────────────────────── */}
            <div className='mt-2 flex items-center justify-end gap-1.5'>
              <span className='text-xs text-zinc-400 select-none'>
                Less
              </span>
              {([0, 1, 2, 3, 4] as Level[]).map((lvl) => (
                <div
                  key={lvl}
                  className={cn('rounded-[2px]', LEVEL_BG[lvl])}
                  style={{ width: layout.cell, height: layout.cell }}
                />
              ))}
              <span className='text-xs text-zinc-400 select-none'>
                More
              </span>
              <span className='ml-2 text-xs text-zinc-300 select-none'>
                ·
              </span>
              <div
                className='rounded-[2px] bg-red-400 ring-1 ring-red-600 ring-offset-[1px] z-10'
                style={{ width: layout.cell, height: layout.cell }}
              />
              <span className='text-xs text-zinc-400 select-none'>
                Exam day
              </span>
              <span className='ml-2 text-xs text-zinc-300 select-none'>
                ·
              </span>
              <div
                className='rounded-[2px] bg-zinc-100 dark:bg-zinc-800 ring-2 ring-amber-500 ring-offset-[1px] z-10'
                style={{ width: layout.cell, height: layout.cell }}
              />
              <span className='text-xs text-zinc-400 select-none'>
                Today
              </span>
              <span className='ml-2 text-xs text-zinc-300 select-none'>
                ·
              </span>
              <div
                className='rounded-[2px] bg-green-500 ring-2 ring-green-700 ring-offset-1 z-10'
                style={{ width: layout.cell, height: layout.cell }}
              />
              <span className='text-xs text-zinc-400 select-none'>
                Sign up day
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
