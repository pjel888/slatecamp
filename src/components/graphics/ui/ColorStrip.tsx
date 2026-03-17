'use client'
import { cn } from '@/lib/utils'

interface ColorStripSegment {
  color: string
  percent: number
  label?: string
}

interface ColorStripProps {
  segments: ColorStripSegment[]
  height?: number
  gap?: number
  rounded?: boolean
  animated?: boolean
  className?: string
}

export function ColorStrip({
  segments,
  height = 6,
  gap = 1,
  rounded = true,
  animated = false,
  className,
}: ColorStripProps) {
  const totalGap = gap * (segments.length - 1)
  const r = rounded ? height / 2 : 0

  // Build rects with running offset
  let offset = 0
  const rects = segments.map((seg, i) => {
    const availableWidth = 200 - totalGap
    const w = (seg.percent / 100) * availableWidth
    const x = offset
    const isFirst = i === 0
    const isLast = i === segments.length - 1

    offset = x + w + gap

    return (
      <rect
        key={i}
        x={x}
        width={Math.max(w, 0)}
        height={height}
        rx={isFirst || isLast ? r : 0}
        fill={seg.color}
        style={
          animated
            ? {
                transform: 'scaleX(0)',
                transformOrigin: `${x}px center`,
                animation: `strip-grow 600ms ease-out ${i * 80}ms forwards`,
              }
            : undefined
        }
      >
        {seg.label && <title>{seg.label}</title>}
      </rect>
    )
  })

  return (
    <svg
      viewBox={`0 0 200 ${height}`}
      preserveAspectRatio="none"
      className={cn('w-full block', className)}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      {rects}
    </svg>
  )
}
