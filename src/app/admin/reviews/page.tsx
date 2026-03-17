import { canReviewContent } from '@/lib/admin/roles'
import { redirect } from 'next/navigation'
import { SMEReviewQueue } from '@/components/admin/SMEReviewQueue'

export default async function AdminReviewsPage() {
  const canReview = await canReviewContent()
  
  if (!canReview) {
    redirect('/admin')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">SME Review Queue</h1>
        <p className="text-muted-foreground">Review and approve content submitted by content managers</p>
      </div>

      <SMEReviewQueue />
    </div>
  )
}
