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
      'rounded-md border border-success/20 bg-success-50 p-5',
      className,
    )}
    role="status"
    aria-label="Criterion reached"
  >
    <div className="flex items-start gap-3">
      <CheckCircle
        weight="fill"
        size={24}
        className="mt-0.5 shrink-0 text-success"
      />
      <div className="flex-1 space-y-3">
        <div>
          <h3 className="font-medium text-sm text-foreground">
            You&apos;ve reached criterion
            {topicName ? ` for ${topicName}` : ''}
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            We&apos;ll re-test you tomorrow to make sure it sticks. Each
            successful re-test extends the interval until the knowledge is
            durable.
          </p>
        </div>

        {/* Spacing timeline preview */}
        <div className="pt-1">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-text-secondary">
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
              className="rounded-sm bg-primary text-white hover:bg-primary-700"
            >
              Continue
            </Button>
          )}
          {onBackToHub && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onBackToHub}
              className="rounded-sm text-text-secondary"
            >
              Back to Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
)
