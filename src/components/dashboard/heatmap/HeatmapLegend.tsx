import { cn } from '@/lib/utils'
import { LEVEL_BG } from './HeatmapGrid'
import type { Level } from './HeatmapGrid'

interface HeatmapLegendProps {
  cellSize: number
}

export const HeatmapLegend = ({ cellSize }: HeatmapLegendProps) => (
  <div className='mt-2 flex items-center justify-between gap-4'>
    <div className='flex items-center gap-1.5'>
      <span className='text-xs text-muted-foreground select-none'>
        Less
      </span>
      {([0, 1, 2, 3, 4] as Level[]).map((lvl) => (
        <div
          key={lvl}
          className={cn('rounded-[2px]', LEVEL_BG[lvl])}
          style={{ width: cellSize, height: cellSize }}
        />
      ))}
      <span className='text-xs text-muted-foreground select-none'>
        More
      </span>
    </div>

    <div className='flex items-center justify-end gap-1.5'>
      <div
        className='rounded-[2px] bg-emerald ring-2 ring-emerald ring-offset-1 z-10'
        style={{ width: cellSize, height: cellSize }}
      />
      <span className='text-xs text-muted-foreground select-none'>
        Sign up day
      </span>
      <span className='ml-2 text-xs text-muted-foreground/70 select-none'>
        ·
      </span>
      <div
        className='rounded-[2px] bg-muted ring-2 ring-warning ring-offset-[1px] z-10'
        style={{ width: cellSize, height: cellSize }}
      />
      <span className='text-xs text-muted-foreground select-none'>
        Today
      </span>
      <span className='ml-2 text-xs text-muted-foreground/70 select-none'>
        ·
      </span>
      <div
        className='rounded-[2px] bg-destructive ring-1 ring-destructive ring-offset-[1px] z-10'
        style={{ width: cellSize, height: cellSize }}
      />
      <span className='text-xs text-muted-foreground select-none'>
        Exam day
      </span>
    </div>
  </div>
)
