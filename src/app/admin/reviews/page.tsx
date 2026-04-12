import type { Metadata } from 'next'
import { SMEReviewQueue } from '@/components/admin/SMEReviewQueue'

export const metadata: Metadata = { title: 'Reviews â€” SlateCamp Admin' }

export default async function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">SME Review Queue</h1>
        <p className="text-muted-foreground">Review wiki articles awaiting SME validation and route them toward publication</p>
      </div>

      <SMEReviewQueue />
    </div>
  )
}
