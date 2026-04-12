import * as React from 'react'
import { cn } from '@/lib/utils'

interface SubjectDistributionItem {
  id: string
  leaId: string | null
  name: string
  primaryCount: number
  secondaryCount: number
}

interface SubjectDistributionBarProps {
  items: SubjectDistributionItem[]
  maxPrimaryCount: number
  primaryLabel?: string
  secondaryLabel?: string
  className?: string
}

/**
 * A shared visualization for subject-level resource distribution.
 * Displays primary (e.g., Questions) and secondary (e.g., Articles) metrics.
 */
export const SubjectDistributionBar = ({
  items,
  maxPrimaryCount,
  primaryLabel = 'Items',
  secondaryLabel = 'Wiki',
  className,
}: SubjectDistributionBarProps) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6", className)}>
      {items.map((subject) => {
        const primaryPct = Math.round((subject.primaryCount / maxPrimaryCount) * 100)
        
        // Color mapping based on subject code
        const colorClass = 
          subject.leaId?.includes('PRAC') ? 'bg-emerald-500' :
          subject.leaId?.includes('HIST') ? 'bg-amber-500' :
          subject.leaId?.includes('THEO') ? 'bg-sky-500' :
          subject.leaId?.includes('PLAN') ? 'bg-indigo-500' :
          subject.leaId?.includes('STRC') ? 'bg-rose-500' :
          subject.leaId?.includes('MATL') ? 'bg-violet-500' :
          subject.leaId?.includes('DSGN') ? 'bg-cyan-500' :
          subject.leaId?.includes('UTIL') ? 'bg-orange-500' :
          'bg-primary'

        return (
          <div key={subject.id} className="space-y-2">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-text-tertiary uppercase truncate">
                  {subject.leaId || 'Subject'}
                </p>
                <p className="text-xs font-semibold text-foreground truncate" title={subject.name}>
                  {subject.name}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="block text-xs font-bold text-foreground tabular-nums">
                    {subject.primaryCount}
                  </span>
                  <span className="block text-[9px] text-muted-foreground uppercase font-bold">{primaryLabel}</span>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-text-secondary tabular-nums">
                    {subject.secondaryCount}
                  </span>
                  <span className="block text-[9px] text-muted-foreground uppercase font-bold">{secondaryLabel}</span>
                </div>
              </div>
            </div>
            
            <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out", colorClass)}
                style={{ width: `${primaryPct}%`, opacity: 0.7 }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
