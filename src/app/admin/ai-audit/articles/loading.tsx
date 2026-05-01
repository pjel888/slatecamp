import { TableRowSkeleton } from '@/components/ui/skeleton'

export default function AiAuditArticlesLoading() {
  return (
    <div className="rounded-lg border border-border">
      {Array.from({ length: 8 }).map((_, index) => <TableRowSkeleton key={index} columns={8} />)}
    </div>
  )
}
