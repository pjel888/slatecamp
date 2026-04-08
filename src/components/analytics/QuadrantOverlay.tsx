'use client'

import { cn } from '@/lib/utils'
import { CHART_COLORS } from '@/lib/constants/chart-colors'

interface QuadrantLabels {
  topLeft?: string
  topRight?: string
  bottomLeft?: string
  bottomRight?: string
}

interface QuadrantOverlayProps {
  labels: QuadrantLabels
  colors?: {
    topLeft?: string
    topRight?: string
    bottomLeft?: string
    bottomRight?: string
  }
  className?: string
}

export function QuadrantOverlay({
  labels,
  colors,
  className,
}: QuadrantOverlayProps) {
  const defaultColors = {
    topLeft: colors?.topLeft ?? CHART_COLORS.quadrantFallback,
    topRight: colors?.topRight ?? CHART_COLORS.quadrantFallback,
    bottomLeft: colors?.bottomLeft ?? CHART_COLORS.quadrantFallback,
    bottomRight: colors?.bottomRight ?? CHART_COLORS.quadrantFallback,
  }

  return (
    <div className={cn('absolute inset-0 pointer-events-none z-10', className)}>
      <div className='absolute inset-0 flex'>
        <div className='flex-1 flex flex-col'>
          <div className='flex-1 flex items-end justify-start pl-8 pb-1'>
            {labels.bottomLeft && (
              <span
                className='text-[11px] font-bold uppercase tracking-wider'
                style={{ color: defaultColors.bottomLeft }}
              >
                {labels.bottomLeft}
              </span>
            )}
          </div>
          <div className='flex-1 flex items-start justify-start pl-8 pt-1'>
            {labels.topLeft && (
              <span
                className='text-[11px] font-bold uppercase tracking-wider'
                style={{ color: defaultColors.topLeft }}
              >
                {labels.topLeft}
              </span>
            )}
          </div>
        </div>
        <div className='flex-1 flex flex-col'>
          <div className='flex-1 flex items-end justify-end pr-4 pb-1'>
            {labels.bottomRight && (
              <span
                className='text-[11px] font-bold uppercase tracking-wider'
                style={{ color: defaultColors.bottomRight }}
              >
                {labels.bottomRight}
              </span>
            )}
          </div>
          <div className='flex-1 flex items-start justify-end pr-4 pt-1'>
            {labels.topRight && (
              <span
                className='text-[11px] font-bold uppercase tracking-wider'
                style={{ color: defaultColors.topRight }}
              >
                {labels.topRight}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
