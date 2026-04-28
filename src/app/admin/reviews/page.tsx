import type { Metadata } from 'next'
import { assertPermission } from '@/lib/admin/roles'
import { SMEReviewQueue } from '@/components/admin/SMEReviewQueue'

export const metadata: Metadata = { title: 'Reviews - SlateCamp Admin' }

export default async function AdminReviewsPage() {
  await assertPermission('admin.reviews.view')

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
