import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type NodeState = 'mastered' | 'familiar' | 'danger' | 'unexplored'

export interface HeatmapNode {
  id: string
  label: string
  state: NodeState
  progress: number
}

export interface HeatmapCluster {
  id: string
  title: string
  nodes: HeatmapNode[]
}

interface TaxonomyHeatmapProps {
  clusters: HeatmapCluster[]
  onNodeSelect?: (node: HeatmapNode) => void
}

const stateClassMap: Record<NodeState, string> = {
  mastered: 'bg-[#2D9F6F]',
  familiar: 'bg-[#E8853A]',
  danger: 'bg-[#D64545]',
  unexplored: 'bg-[#D4DAE3]',
}

export const TaxonomyHeatmap = ({
  clusters,
  onNodeSelect,
}: TaxonomyHeatmapProps) => {
  return (
    <Card className='border-border bg-white shadow-none'>
      <CardHeader className='flex flex-row items-start justify-between gap-4 pb-2'>
        <div>
          <CardTitle className='text-sm font-medium tracking-tight text-[#4A5568]'>
            Global Taxonomy Heatmap
          </CardTitle>
          <p className='mt-1 text-xs text-[#8896A7]'>
            Master syllabus coverage, by subject and topic.
          </p>
        </div>
      </CardHeader>
      <CardContent className='space-y-4 pt-1'>
        {clusters.map((cluster) => (
          <div key={cluster.id} className='space-y-2 rounded-md bg-[#F8F7F5] p-3'>
            <div className='flex items-baseline justify-between gap-2'>
              <p className='text-xs font-medium tracking-tight text-[#1A2332]'>
                {cluster.title}
              </p>
            </div>

            <div className='flex flex-col gap-1.5'>
              {cluster.nodes.map((node) => (
                <button
                  key={node.id}
                  type='button'
                  onClick={onNodeSelect ? () => onNodeSelect(node) : undefined}
                  className={cn(
                    'group flex items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-xs',
                    'outline-none ring-0 transition-colors',
                    'hover:bg-[#EEF2FC] focus-visible:bg-[#EEF2FC]',
                  )}
                >
                  <span className='truncate text-[#1A2332]'>{node.label}</span>
                  <span className='flex min-w-[96px] items-center gap-2'>
                    <span className='relative block h-1.5 w-full overflow-hidden rounded-full bg-[#EEF2FC]'>
                      <span
                        className={cn(
                          'absolute inset-y-0 left-0 rounded-full transition-all',
                          stateClassMap[node.state],
                        )}
                        style={{
                          width: `${Math.max(4, Math.min(100, node.progress))}%`,
                        }}
                      />
                    </span>
                    <span className='w-[34px] text-right text-[11px] text-[#8896A7]'>
                      {Math.round(node.progress)}%
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className='mt-1 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-[11px] text-[#8896A7]'>
          <div className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-[#2D9F6F]' />
            <span>Mastered</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-[#E8853A]' />
            <span>Familiar</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-[#D64545]' />
            <span>Critical</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-[#D4DAE3]' />
            <span>Unexplored</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
