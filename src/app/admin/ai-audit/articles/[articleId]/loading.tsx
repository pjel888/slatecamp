import { CardSkeleton, TableRowSkeleton } from '@/components/ui/skeleton'

export default function AiAuditArticleDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="rounded-lg border border-border">
        {Array.from({ length: 4 }).map((_, index) => <TableRowSkeleton key={index} columns={5} />)}
      </div>
    </div>
  )
}
