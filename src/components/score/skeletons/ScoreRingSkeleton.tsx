/* ScoreRingSkeleton — pulsing placeholder for ReadinessScoreRing */

interface ScoreRingSkeletonProps {
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = { sm: 80, md: 160, lg: 240 } as const

export const ScoreRingSkeleton = ({ size = 'md' }: ScoreRingSkeletonProps) => {
  const px = SIZE_MAP[size]

  return (
    <div
      className="inline-flex flex-col items-center gap-1"
      aria-hidden="true"
    >
      <div
        className="animate-pulse rounded-full bg-muted"
        style={{ width: px, height: px }}
      />
      <div className="animate-pulse h-2 w-16 rounded-sm bg-muted" />
    </div>
  )
}
