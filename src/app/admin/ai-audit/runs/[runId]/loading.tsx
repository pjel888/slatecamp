import { CardSkeleton, TableRowSkeleton } from '@/components/ui/skeleton'

export default function AiAuditRunDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <CardSkeleton />
      <div className="rounded-lg border border-border">
        {Array.from({ length: 6 }).map((_, index) => <TableRowSkeleton key={index} columns={6} />)}
      </div>
    </div>
  )
}
