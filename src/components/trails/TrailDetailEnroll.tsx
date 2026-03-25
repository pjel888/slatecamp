'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { enrollInTrail } from '@/lib/actions/trails'
import type { CampTrail, TrailEnrollment } from '@/types/app'
import { Card } from '@/components/ui/card'

interface TrailDetailEnrollProps {
  trail: CampTrail
  enrollment: TrailEnrollment | null
}

export const TrailDetailEnroll = ({ trail, enrollment }: TrailDetailEnrollProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleEnroll = () => {
    startTransition(async () => {
      await enrollInTrail(trail.trail_id)
      router.push(`/dashboard/camptrails/${trail.slug}/today`)
    })
  }

  if (enrollment && enrollment.status === 'active') {
    return (
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-primary">
            Day {enrollment.current_day} of {trail.duration_days}
          </p>
          <p className="text-xs text-text-secondary">
            {enrollment.days_completed} days completed
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/camptrails/${trail.slug}/today`)}
          className="px-4 py-2 rounded-sm bg-camp-cobalt text-white text-sm font-medium transition-colors duration-150 ease-out hover:bg-primary-700"
        >
          Continue Trail →
        </button>
      </Card>
    )
  }

  return (
    <Card className="p-4 flex items-center justify-between">
      <p className="text-sm text-text-secondary">
        Ready to start? This trail takes {trail.duration_days} days to complete.
      </p>
      <button
        type="button"
        onClick={handleEnroll}
        disabled={isPending}
        className="px-5 py-2.5 rounded-sm bg-camp-cobalt text-white text-sm font-semibold transition-colors duration-150 ease-out hover:bg-primary-700 disabled:opacity-50"
      >
        {isPending ? 'Starting...' : 'Start This Trail →'}
      </button>
    </Card>
  )
}
