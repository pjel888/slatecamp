'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Target } from 'lucide-react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { EmptyState } from '@/components/shared/empty-state'
import { getScoreColorHex } from '@/components/shared/score-display'
import type { SubjectMastery } from '@/types/dashboard'

interface SubjectMasteryCardProps {
  data: SubjectMastery[]
}

// ── Mastery color constants ──────────────────────────────────────────────────

const MASTERY_COLORS = {
  unexplored: '#E5E7EB',
  high: '#57be90',
  mid: '#da9359',
  low: '#8896A7',    // neutral muted — never red for low scores
  track: '#F5F5F5',
  ringHigh: '#57be90',
  ringMid: '#8ED4AE',
  ringMidLow: '#da9359',
  ringLow: '#8896A7', // neutral muted — never red for low scores
} as const

// ── Color helpers ────────────────────────────────────────────────────────────

const getMasteryColor = (mastery: number, questionsAnswered: number): string => {
  if (questionsAnswered === 0) return MASTERY_COLORS.unexplored
  if (mastery >= 70) return MASTERY_COLORS.high
  if (mastery >= 40) return MASTERY_COLORS.mid
  return getScoreColorHex(mastery).main  // neutral muted — never red for low scores
}

const getMasteryLabel = (mastery: number, questionsAnswered: number): string => {
  if (questionsAnswered === 0) return 'Not started'
  if (mastery >= 70) return 'Strong'
  if (mastery >= 40) return 'Developing'
  return 'Needs review'
}

const lerpColor = (a: string, b: string, t: number): string => {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const bl = Math.round(b1 + (b2 - b1) * t)
  return `rgb(${r},${g},${bl})`
}

const getRingColor = (ringPct: number): string => {
  if (ringPct <= 30)
    return lerpColor(
      MASTERY_COLORS.ringLow,
      MASTERY_COLORS.ringMidLow,
      ringPct / 30,
    )
  if (ringPct <= 60)
    return lerpColor(
      MASTERY_COLORS.ringMidLow,
      MASTERY_COLORS.ringMid,
      (ringPct - 30) / 30,
    )
  return lerpColor(
    MASTERY_COLORS.ringMid,
    MASTERY_COLORS.ringHigh,
    (ringPct - 60) / 40,
  )
}

// ── SVG arc path helper ──────────────────────────────────────────────────────

const describeArc = (
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
): string => {
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180)

  const outerStart = {
    x: cx + outerR * Math.cos(toRad(startAngle)),
    y: cy + outerR * Math.sin(toRad(startAngle)),
  }
  const outerEnd = {
    x: cx + outerR * Math.cos(toRad(endAngle)),
    y: cy + outerR * Math.sin(toRad(endAngle)),
  }
  const innerStart = {
    x: cx + innerR * Math.cos(toRad(endAngle)),
    y: cy + innerR * Math.sin(toRad(endAngle)),
  }
  const innerEnd = {
    x: cx + innerR * Math.cos(toRad(startAngle)),
    y: cy + innerR * Math.sin(toRad(startAngle)),
  }

  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ')
}

// ── Radial Heatmap ───────────────────────────────────────────────────────────

const RINGS = 10
const GAP_DEG = 3
const INNER_RADIUS = 16
const OUTER_RADIUS = 88

const RadialHeatmap = ({
  data,
  animated,
}: {
  data: SubjectMastery[]
  animated: boolean
}) => {
  const [hovered, setHovered] = useState<number | null>(null)
  const count = data.length
  if (count === 0) return null

  const sliceAngle = 360 / count
  const ringWidth = (OUTER_RADIUS - INNER_RADIUS) / RINGS
  const cx = 110,
    cy = 110

  return (
    <svg
      viewBox='0 0 220 220'
      className='w-full h-full'
      role='img'
      aria-label='Subject mastery radial heatmap'
    >
      <defs>
        <filter id='cellglow' x='-30%' y='-30%' width='160%' height='160%'>
          <feGaussianBlur stdDeviation='1.5' result='blur' />
          <feMerge>
            <feMergeNode in='blur' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </defs>

      {data.map((item, i) => {
        const startAngle = i * sliceAngle + GAP_DEG / 2
        const endAngle = (i + 1) * sliceAngle - GAP_DEG / 2
        const mastery = Math.max(0, Math.min(100, Math.round(item.mastery)))
        const filledRings =
          item.questionsAnswered === 0
            ? 0
            : Math.max(1, Math.round((mastery / 100) * RINGS))
        const isHovered = hovered === i

        return (
          <g
            key={item.subject}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'default' }}
          >
            {Array.from({ length: RINGS }).map((_, ring) => {
              const innerR = INNER_RADIUS + ring * ringWidth
              const outerR = innerR + ringWidth - 0.6
              return (
                <path
                  key={`bg-${ring}`}
                  d={describeArc(cx, cy, innerR, outerR, startAngle, endAngle)}
                  fill={MASTERY_COLORS.track}
                  opacity={0.4}
                />
              )
            })}

            {Array.from({ length: RINGS }).map((_, ring) => {
              if (ring >= filledRings) return null
              const innerR = INNER_RADIUS + ring * ringWidth
              const outerR = innerR + ringWidth - 0.6
              const bandPct = ((ring + 1) / RINGS) * 100
              const color = getRingColor(bandPct)

              return (
                <path
                  key={`fill-${ring}`}
                  d={describeArc(cx, cy, innerR, outerR, startAngle, endAngle)}
                  fill={color}
                  opacity={animated ? (isHovered ? 1 : 0.8) : 0}
                  filter={isHovered ? 'url(#cellglow)' : undefined}
                  style={{
                    transition: `opacity 300ms ease-out ${ring * 30}ms`,
                  }}
                />
              )
            })}

            {(() => {
              const midAngle = (startAngle + endAngle) / 2
              const labelR = OUTER_RADIUS + 12
              const rad = (midAngle - 90) * (Math.PI / 180)
              const lx = cx + labelR * Math.cos(rad)
              const ly = cy + labelR * Math.sin(rad)

              return (
                <text
                  x={lx}
                  y={ly}
                  textAnchor='middle'
                  dominantBaseline='central'
                  fill={isHovered ? '#1A2332' : '#8896A7'}
                  fontSize={8}
                  fontWeight={isHovered ? 600 : 400}
                  style={{ transition: 'fill 150ms ease-out' }}
                >
                  {item.shortLabel}
                </text>
              )
            })()}
          </g>
        )
      })}

      {hovered !== null ? (
        <g>
          <text
            x={cx}
            y={cy - 6}
            textAnchor='middle'
            fill='#1A2332'
            fontSize={14}
            fontWeight={700}
          >
            {Math.round(data[hovered].mastery)}%
          </text>
          <text
            x={cx}
            y={cy + 6}
            textAnchor='middle'
            fill='#8896A7'
            fontSize={7}
          >
            {data[hovered].shortLabel}
          </text>
        </g>
      ) : (
        <text
          x={cx}
          y={cy + 2}
          textAnchor='middle'
          fill='#8896A7'
          fontSize={7}
          fontWeight={500}
        >
          MASTERY
        </text>
      )}
    </svg>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export const SubjectMasteryCard = ({ data }: SubjectMasteryCardProps) => {
  const [animated, setAnimated] = useState(false)
  const hasData = data.some((d) => d.questionsAnswered > 0)
  const abovePassing = data.filter((d) => d.mastery >= 70).length

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className='grid grid-rows-3 bg-white rounded-md overflow-hidden h-full p-2 gap-2'>
      {/* ── Radial heatmap section ──────────────────────────────────── */}
      <div className='rounded-md bg-[#F5F5F5] border border-[#E5E7EB] p-3 flex flex-col min-h-0'>
        <div className='flex items-center gap-1.5 mb-0.5'>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className='font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] cursor-default text-[#6B6B6B]'>
                [ Subject Mastery ]
              </h3>
            </TooltipTrigger>
            <TooltipContent side='top'>
              Each wedge is a subject area. Rings fill outward as your mastery
              grows — hover to see your score per subject.
            </TooltipContent>
          </Tooltip>
        </div>
        <p className='text-[11px] text-[text-tertiary] mb-1'>
          Hover a wedge to see your score
        </p>

        {!hasData ? (
          <EmptyState
            icon={<Target className="h-5 w-5" />}
            message="Your mastery shape appears here"
            description="Complete a quiz session to see how your skills map across subjects."
            action={{ label: "Start a quiz", href: "/dashboard/testing" }}
            className="flex-1"
          />
        ) : (
          <div className='w-full max-w-[200px] mx-auto shrink-0'>
            <RadialHeatmap data={data} animated={animated} />
          </div>
        )}
      </div>

      {/* ── Subject breakdown bars ──────────────────────────────────── */}
      <div className='row-span-2 rounded-md bg-[#F5F5F5] border border-[#E5E7EB] p-3 flex flex-col min-h-0 overflow-hidden'>
        <h4 className='font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#6B6B6B] shrink-0'>
          [ Breakdown ]
        </h4>
        <p className='text-[11px] text-[text-tertiary] mb-2'>
          Your mastery per subject area
        </p>

        <div className='flex flex-col flex-1 min-h-0 justify-evenly'>
          {data.map((item, i) => {
            const clamped = Math.max(0, Math.min(100, Math.round(item.mastery)))
            const barColor = getMasteryColor(clamped, item.questionsAnswered)
            const label = getMasteryLabel(clamped, item.questionsAnswered)

            return (
              <div key={item.subject}>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium text-[text-primary] truncate pr-2'>
                    {item.subject}
                  </span>
                  <span className='text-xs font-semibold text-[text-primary] tabular-nums shrink-0'>
                    {clamped}%
                  </span>
                </div>
                <div className='h-1 w-full bg-white rounded-full overflow-hidden border border-[#E5E7EB]'>
                  <div
                    className='h-full rounded-full'
                    style={{
                      width: animated ? `${Math.max(clamped, 1)}%` : '0%',
                      backgroundColor: barColor,
                      transition: `width 300ms ease-out ${i * 60}ms`,
                    }}
                  />
                </div>
                <span
                  className='text-[11px] font-medium block leading-tight'
                  style={{ color: barColor === MASTERY_COLORS.unexplored ? '#8896A7' : barColor }}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className='pt-2 border-t border-[#E5E7EB] flex items-center justify-between shrink-0'>
          <p className='text-[11px] text-[text-tertiary]'>
            {hasData
              ? `${abovePassing} of ${data.length} above passing`
              : 'Bars fill as you answer questions'}
          </p>
          <Link
            href='/dashboard/analytics'
            className='text-[11px] font-medium underline underline-offset-2 shrink-0 ml-2'
            style={{ color: '#1B3FC4' }}
          >
            Analytics &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
