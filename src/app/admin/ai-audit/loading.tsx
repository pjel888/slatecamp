import { StatCardSkeleton, TableRowSkeleton } from '@/components/ui/skeleton'

export default function AiAuditLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => <StatCardSkeleton key={index} />)}
      </div>
      <div className="rounded-lg border border-border">
        {Array.from({ length: 6 }).map((_, index) => <TableRowSkeleton key={index} columns={6} />)}
      </div>
    </div>
  )
}
