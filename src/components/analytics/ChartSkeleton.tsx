import { Card } from '@/components/ui/card'

export function ChartSkeleton({ height = 'h-[200px]' }: { height?: string }) {
  return (
    <Card className={`${height} animate-pulse border-border/50`}>
      <div className="p-3 flex flex-col h-full gap-2">
        <div className="h-2 w-24 bg-zinc-100 rounded" />
        <div className="flex-1 bg-zinc-50 rounded" />
      </div>
    </Card>
  )
}
