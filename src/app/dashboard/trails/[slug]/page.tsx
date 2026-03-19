import { notFound } from 'next/navigation'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { getTrailBySlug, getTrailDays, getEnrollmentForTrail } from '@/lib/actions/trails'
import { TrailDetail } from '@/components/trails/TrailDetail'

const TrailDetailPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params

  const trail = await getTrailBySlug(slug)
  if (!trail) notFound()

  const [days, enrollment] = await Promise.all([
    getTrailDays(trail.trail_id),
    getEnrollmentForTrail(trail.trail_id),
  ])

  return (
    <SharedPageLayout>
      <div className="w-full max-w-3xl mx-auto">
        <TrailDetail trail={trail} days={days} enrollment={enrollment} />
      </div>
    </SharedPageLayout>
  )
}

export default TrailDetailPage
