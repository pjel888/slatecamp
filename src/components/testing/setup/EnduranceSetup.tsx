'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { createTestingSession } from '@/lib/actions/testing'
import type { SessionConfig } from '@/types/testing'

interface PreviousSession {
  session_id: string
  config: Record<string, unknown> | null
  completed_at: string | null
}

interface EnduranceSetupProps {
  userId: string
  previousSessions: PreviousSession[]
}

/**
 * Derives the reliable window (median question count) from past endurance sessions.
 */
const deriveReliableWindow = (sessions: PreviousSession[]): number | null => {
  if (sessions.length === 0) return null
  const counts = sessions
    .map((s) => {
      const qc = (s.config as { questionCount?: number } | null)?.questionCount
      return typeof qc === 'number' ? qc : null
    })
    .filter((n): n is number => n !== null)
  if (counts.length === 0) return null
  counts.sort((a, b) => a - b)
  const mid = Math.floor(counts.length / 2)
  return counts.length % 2 !== 0
    ? counts[mid]!
    : Math.round((counts[mid - 1]! + counts[mid]!) / 2)
}

const EnduranceSetup = ({ userId, previousSessions }: EnduranceSetupProps) => {
  const previousFatigueThreshold = deriveReliableWindow(previousSessions)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const config: SessionConfig = {
        source: 'extended_practice',
        questionCount: 100,
        subjectFilter: [],
        topicFilter: [],
        difficultyBands: [],
        feedbackMode: 'immediate',
        timerEnabled: false,
        timerSeconds: null,
        focusOption: 'mixed',
        preSessionConfidence: [],
        isBlindspotSession: false,
        blindspotQueueId: null,
        isProofSimulation: false,
        isEnduranceSession: true,
        strippedUi: false,
        masteryWeightMultiplier: 1,
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
          Extended Practice
        </p>
        <h1 className="text-[24px] font-semibold text-[var(--foreground)] mb-2">Endurance</h1>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
          This session starts with 100 questions and monitors your accuracy in 10-question blocks.
          When your accuracy dips, that&apos;s your current endurance limit.
        </p>
      </div>

      <div className="space-y-8">
        {previousFatigueThreshold !== null && (
          <div className="rounded-md border border-[var(--border)] bg-[var(--slate-blue-50)] px-4 py-4">
            <p className="text-[13px] font-medium text-[var(--text-secondary)] mb-1">
              Previous session
            </p>
            <p className="text-[14px] text-[var(--foreground)]">
              Your reliable window was around{' '}
              <span className="font-medium">{previousFatigueThreshold} questions</span>.
            </p>
            <p className="mt-1 text-[12px] text-[var(--muted-foreground)]">
              See how you compare today.
            </p>
          </div>
        )}

        <div className="rounded-md bg-surface-light border border-[var(--border)] px-4 py-4">
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
            You&apos;ll receive immediate feedback throughout. The session ends at 100 questions
            unless you choose to stop earlier.
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center" role="alert">
            {error}
          </p>
        )}
        <Button
          variant="warmCta"
          size="lg"
          fullWidth
          loading={loading}
          onClick={handleStart}
          className="rounded-sm"
        >
          Start Extended Practice
        </Button>
      </div>
    </div>
  )
}

EnduranceSetup.displayName = 'EnduranceSetup'

export { EnduranceSetup }
