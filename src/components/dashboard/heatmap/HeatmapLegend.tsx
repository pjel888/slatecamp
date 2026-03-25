import { cn } from '@/lib/utils'
import { LEVEL_BG } from './HeatmapGrid'
import type { Level } from './HeatmapGrid'

interface HeatmapLegendProps {
  cellSize: number
}

export const HeatmapLegend = ({ cellSize }: HeatmapLegendProps) => (
  <div className='mt-2 flex items-center justify-end gap-1.5'>
    <span className='text-xs text-white/40 select-none'>
      Less
    </span>
    {([0, 1, 2, 3, 4] as Level[]).map((lvl) => (
      <div
        key={lvl}
        className={cn('rounded-[2px]', LEVEL_BG[lvl])}
        style={{ width: cellSize, height: cellSize }}
      />
    ))}
    <span className='text-xs text-white/40 select-none'>
      More
    </span>
    <span className='ml-2 text-xs text-white/30 select-none'>
      ·
    </span>
    <div
      className='rounded-[2px] bg-destructive ring-1 ring-destructive ring-offset-[1px] z-10'
      style={{ width: cellSize, height: cellSize }}
    />
    <span className='text-xs text-white/40 select-none'>
      Exam day
    </span>
    <span className='ml-2 text-xs text-white/30 select-none'>
      ·
    </span>
    <div
      className='rounded-[2px] bg-white/10 ring-2 ring-warning ring-offset-[1px] z-10'
      style={{ width: cellSize, height: cellSize }}
    />
    <span className='text-xs text-white/40 select-none'>
      Today
    </span>
    <span className='ml-2 text-xs text-white/30 select-none'>
      ·
    </span>
    <div
      className='rounded-[2px] bg-emerald ring-2 ring-emerald ring-offset-1 z-10'
      style={{ width: cellSize, height: cellSize }}
    />
    <span className='text-xs text-white/40 select-none'>
      Sign up day
    </span>
  </div>
)
