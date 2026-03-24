'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { HeatmapHeader } from './heatmap/HeatmapHeader'
import { HeatmapGrid, dateISO } from './heatmap/HeatmapGrid'
import { HeatmapLegend } from './heatmap/HeatmapLegend'
import type { MonthBlock, HeatmapLayout } from './heatmap/HeatmapGrid'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_MONTHS = 12

// Fixed structural spacings (independent of cell size)
const GAP = 2 // px gap between cells within a block
const SEP_GAP = 8 // px gap between month blocks (separator lives here)
const MONTH_ROW_H = 13
const HEADER_GAP = 3
const HEADER_H = MONTH_ROW_H + HEADER_GAP // 16 px

const MOCK_SIGNUP = new Date('2026-01-18T12:00:00')
const MOCK_SIGNUP_YEAR = 2026
const CURRENT_YEAR = new Date().getFullYear()
// Mock exam: 3-day board exam in late June 2026
const MOCK_EXAM_DATES: string[] = ['2026-06-26', '2026-06-27', '2026-06-28']

// ─── Derived layout (from measured container width) ───────────────────────────

function deriveLayout(containerWidth: number): HeatmapLayout {
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

function signupISOStr(d: Date): string {
  return dateISO(d.getFullYear(), d.getMonth(), d.getDate())
}

// ─── Data builders ────────────────────────────────────────────────────────────

interface YearSpan {
  year: number
  firstBlock: number
  lastBlock: number
}

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

export interface ActivityDay {
  date: string
  count: number
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

  const { blocks } = useMemo(() => buildBlocks(start), [start])
  const todayISO = signupISOStr(new Date())

  return (
    <div className='flex w-full min-w-0 flex-col p-2 overflow-y-auto scrollbar-thin flex-1 min-h-0'>
      <HeatmapHeader
        selectedYear={selectedYear}
        years={years}
        onYearChange={setSelectedYear}
      />

      {/* ── Measurement + grid container ──────────────────────────────────── */}
      <div ref={containerRef} className='w-full min-w-0'>
        {layout && (
          <>
            <HeatmapGrid
              blocks={blocks}
              layout={layout}
              actMap={actMap}
              examSet={examSet}
              signupISO={iso0}
              todayISO={todayISO}
              headerH={HEADER_H}
              sepGap={SEP_GAP}
              gap={GAP}
            />
            <HeatmapLegend cellSize={layout.cell} />
          </>
        )}
      </div>
    </div>
  )
}
