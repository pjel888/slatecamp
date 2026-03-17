import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { HeatmapNode } from './TaxonomyHeatmap'

interface NodeInspectorSheetProps {
  node: HeatmapNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NodeInspectorSheet = ({
  node,
  open,
  onOpenChange,
}: NodeInspectorSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-full max-w-md border-l border-border bg-white'
      >
        <SheetHeader>
          <SheetTitle className='text-sm font-medium tracking-tight text-text-primary'>
            {node?.label ?? 'Node details'}
          </SheetTitle>
        </SheetHeader>

        {node ? (
          <div className='mt-4 space-y-5'>
            <section className='space-y-1'>
              <p className='text-xs font-medium text-text-secondary'>
                Current mastery
              </p>
              <p className='text-2xl font-semibold tracking-tight text-text-primary'>
                {Math.round(node.progress)}%
              </p>
              <p className='mt-1 text-xs text-text-tertiary'>
                Based on lifetime attempts in camp. Higher-weight questions
                count more than quick practice sessions.
              </p>
            </section>

            <section className='space-y-2'>
              <p className='text-xs font-medium text-text-secondary'>
                Accuracy over time
              </p>
              <div className='h-24 w-full rounded-sm bg-slate-blue-50/70 px-3 py-2'>
                {/* Placeholder sparkline — replace with real time-series later */}
                <div className='h-full w-full'>
                  <svg
                    viewBox='0 0 100 32'
                    className='h-full w-full text-text-secondary'
                  >
                    <polyline
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      points='2,28 15,24 28,20 41,22 54,16 67,12 80,14 93,8'
                    />
                  </svg>
                </div>
              </div>
              <p className='text-[11px] text-text-tertiary'>
                Each point represents a recent session touching this node. The
                official dashboard will use full session history.
              </p>
            </section>

            <section className='space-y-1.5 text-xs text-text-tertiary'>
              <p>
                Use this to decide whether to revisit this topic before you
                move on. Areas to revisit will appear in your Focus Review
                queue.
              </p>
            </section>
          </div>
        ) : (
          <p className='mt-6 text-xs text-text-tertiary'>
            Select any node in the heatmap to inspect its history without
            leaving the dashboard.
          </p>
        )}
      </SheetContent>
    </Sheet>
  )
}
