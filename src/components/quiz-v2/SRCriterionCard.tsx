'use client'

import { CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { SRSpacingTimeline } from './SRSpacingTimeline'
import { cn } from '@/lib/utils'

interface SRCriterionCardProps {
  topicName?: string
  onContinue?: () => void
  onBackToHub?: () => void
  className?: string
}

export const SRCriterionCard = ({
  topicName,
  onContinue,
  onBackToHub,
  className,
}: SRCriterionCardProps) => (
  <div
    className={cn(
      'rounded-md border border-[#2D9F6F]/20 bg-[#EDFAF4] p-5',
      className,
    )}
    role="status"
    aria-label="Criterion reached"
  >
    <div className="flex items-start gap-3">
      <CheckCircle
        weight="fill"
        size={24}
        className="mt-0.5 shrink-0 text-[#2D9F6F]"
      />
      <div className="flex-1 space-y-3">
        <div>
          <h3 className="font-medium text-sm text-[#1A2332]">
            You&apos;ve reached criterion
            {topicName ? ` for ${topicName}` : ''}
          </h3>
          <p className="mt-1 text-xs text-[#4A5568]">
            We&apos;ll re-test you tomorrow to make sure it sticks. Each
            successful re-test extends the interval until the knowledge is
            durable.
          </p>
        </div>

        {/* Spacing timeline preview */}
        <div className="pt-1">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-[#4A5568]">
            Re-test schedule
          </p>
          <SRSpacingTimeline currentLevel={0} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {onContinue && (
            <Button
              size="sm"
              onClick={onContinue}
              className="rounded-sm bg-[#1B3FC4] text-white hover:bg-[#1535A8]"
            >
              Continue
            </Button>
          )}
          {onBackToHub && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onBackToHub}
              className="rounded-sm text-[#4A5568]"
            >
              Back to Testing Hub
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
)
