import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChartSkeletonProps {
  height?: string
  className?: string
  type?: 'bar' | 'line' | 'table' | 'generic'
}

export function ChartSkeleton({ 
  height = 'h-[200px]', 
  className,
  type = 'generic' 
}: ChartSkeletonProps) {
  return (
    <Card className={cn(height, "animate-pulse border-border/50", className)}>
      <div className="p-3 flex flex-col h-full gap-3">
        {/* Header/Title placeholder */}
        <div className="h-2 w-24 bg-muted rounded" />
        
        <div className="flex-1 flex flex-col gap-2">
          {type === 'bar' && (
            <div className="flex items-end justify-between h-full px-2 pt-4 gap-2">
              <div className="flex-1 bg-muted/40 rounded-t h-[60%]" />
              <div className="flex-1 bg-muted/60 rounded-t h-[80%]" />
              <div className="flex-1 bg-muted/40 rounded-t h-[45%]" />
              <div className="flex-1 bg-muted/60 rounded-t h-[90%]" />
              <div className="flex-1 bg-muted/40 rounded-t h-[70%]" />
            </div>
          )}

          {type === 'line' && (
            <div className="relative h-full w-full overflow-hidden">
               <svg className="h-full w-full" preserveAspectRatio="none">
                 <path 
                   d="M0,80 Q50,20 100,60 T200,40 T300,70 T400,30" 
                   fill="none" 
                   stroke="currentColor" 
                   strokeWidth="2" 
                   className="text-muted/40"
                 />
               </svg>
            </div>
          )}

          {type === 'table' && (
            <div className="space-y-3 mt-2">
              {/* Table header */}
              <div className="flex gap-4 border-b border-border/30 pb-2">
                <div className="h-2 w-16 bg-muted/60 rounded" />
                <div className="h-2 w-24 bg-muted/60 rounded" />
                <div className="h-2 w-12 bg-muted/60 rounded ml-auto" />
              </div>
              {/* Rows */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-2 w-12 bg-muted/30 rounded" />
                  <div className={cn("h-2 bg-muted/30 rounded", i % 2 === 0 ? "w-32" : "w-24")} />
                  <div className="h-2 w-8 bg-muted/30 rounded ml-auto" />
                </div>
              ))}
            </div>
          )}

          {type === 'generic' && (
            <div className="flex-1 bg-muted/50 rounded w-full h-full" />
          )}
        </div>
      </div>
    </Card>
  )
}
