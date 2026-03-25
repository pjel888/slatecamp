'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { createTestingSession } from '@/lib/actions/testing'
import type { SessionConfig } from '@/types/testing'
import { cn } from '@/lib/utils'

interface WeakNodeRow {
  topic_id: string
  current_mastery_weight: number
  total_attempts?: number
  taxonomy_tree: { name: string; ale_id: string | null; subject_area: string } | null
}

interface FocusReviewSetupProps {
  userId: string
  weakNodes: WeakNodeRow[]
}

const MASTERY_DOT_COLOR = (masteryPct: number): string => {
  if (masteryPct < 40) return 'bg-[var(--destructive)]'
  if (masteryPct < 65) return 'bg-[var(--warning)]'
  return 'bg-[var(--success)]'
}

const FocusReviewSetup = ({ userId, weakNodes }: FocusReviewSetupProps) => {
  const router = useRouter()

  // Normalize DB rows into display-ready shape
  const nodes = weakNodes.map((row) => ({
    nodeId: row.topic_id,
    nodeName: row.taxonomy_tree?.name ?? row.topic_id,
    mastery: Math.round(row.current_mastery_weight * 100),
  }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasWeakNodes = nodes.length > 0

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const config: SessionConfig = {
        source: 'focus_review',
        questionCount: 12,
        subjectFilter: [],
        topicFilter: nodes.map((n) => n.nodeId),
        difficultyBands: [],
        feedbackMode: 'immediate',
        timerEnabled: false,
        timerSeconds: null,
        focusOption: 'weakest',
        preSessionConfidence: [],
        isBlindspotSession: false,
        blindspotQueueId: null,
        isProofSimulation: false,
        isEnduranceSession: false,
        strippedUi: false,
        masteryWeightMultiplier: 2,
      }
      const sessionId = await createTestingSession(userId, config)
      router.push(ROUTES.TESTING_SESSION(sessionId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[600px] mx-auto px-4 py-8">
      <Link
        href={ROUTES.TESTING}
        className="inline-flex items-center text-[14px] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors duration-150 ease-out mb-8"
      >
        ← Back to Review
      </Link>

      <div className="mb-8">
        <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
          Focus Review
        </p>
        <h1 className="text-[24px] font-semibold text-[var(--foreground)] mb-2">Targeted</h1>
        {hasWeakNodes ? (
          <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
            This session targets{' '}
            <span className="font-medium text-[var(--foreground)]">{nodes.length} topics</span>{' '}
            that need the most work. 12 carefully selected questions.
          </p>
        ) : (
          <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
            Your mastery data drives every question in this session.
          </p>
        )}
      </div>

      {!hasWeakNodes ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--emerald-50)] px-4 py-5 mb-8">
          <p className="text-[14px] text-[var(--foreground)] font-medium mb-1">
            Great news — you don&apos;t have any stuck areas right now.
          </p>
          <p className="text-[13px] text-[var(--text-secondary)] mb-4">
            Try Camp Mode to keep progressing.
          </p>
          <Link
            href={ROUTES.TESTING_SETUP('camp')}
            className="text-[13px] font-medium text-[var(--primary)] hover:underline"
          >
            Go to Camp Mode →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
              Targeted topics
            </h2>
            <div className="space-y-2">
              {nodes.map((node) => (
                <div
                  key={node.nodeId}
                  className="flex items-center justify-between rounded-md border border-[var(--border)] bg-white px-4 py-3"
                >
                  <span className="text-[13px] font-medium text-[var(--foreground)]">
                    {node.nodeName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[var(--muted-foreground)]">
                      {node.mastery}%
                    </span>
                    <span
                      className={cn('w-2.5 h-2.5 rounded-full', MASTERY_DOT_COLOR(node.mastery))}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <p className="text-sm text-[destructive] text-center" role="alert">
              {error}
            </p>
          )}
          <Button
            variant="default"
            size="lg"
            fullWidth
            loading={loading}
            onClick={handleStart}
            className="bg-[var(--primary)] text-white hover:bg-[var(--accent-hover)] rounded-sm"
          >
            Start Focus Review
          </Button>
        </div>
      )}
    </div>
  )
}

FocusReviewSetup.displayName = 'FocusReviewSetup'

export { FocusReviewSetup }
