'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { QuestionCountPills } from './shared/QuestionCountPills'
import { ROUTES } from '@/lib/constants/routes'
import { QUESTION_COUNT_OPTIONS, SECONDS_PER_QUESTION } from '@/lib/constants/testing-modes'
import { createTestingSession } from '@/lib/actions/testing'
import type { SessionConfig } from '@/types/testing'

interface StormSetupProps {
  userId: string
}

const StormSetup = ({ userId }: StormSetupProps) => {
  const router = useRouter()
  const [questionCount, setQuestionCount] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const minutes = Math.round((questionCount * SECONDS_PER_QUESTION) / 60)

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const config: SessionConfig = {
        source: 'storm_mode',
        questionCount,
        subjectFilter: [],
        topicFilter: [],
        difficultyBands: [],
        feedbackMode: 'deferred',
        timerEnabled: true,
        timerSeconds: questionCount * SECONDS_PER_QUESTION,
        focusOption: 'mixed',
        preSessionConfidence: [],
        isBlindspotSession: false,
        blindspotQueueId: null,
        isProofSimulation: false,
        isEnduranceSession: false,
        strippedUi: true,
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
          Storm Mode
        </p>
        <h1 className="text-[24px] font-semibold text-[var(--foreground)] mb-2">Timed</h1>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
          Exam conditions. No feedback during the session. Timer runs as a progress bar.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            How many questions?
          </h2>
          <QuestionCountPills
            options={QUESTION_COUNT_OPTIONS.storm}
            selected={questionCount}
            onChange={setQuestionCount}
          />
          <p className="mt-3 text-[13px] text-[var(--muted-foreground)]">
            <span className="font-medium text-[var(--text-secondary)]">{minutes} minutes</span>
            {' '}at 1 minute per question
          </p>
        </section>

        <div className="rounded-md bg-[#F8F7F5] border border-[var(--border)] px-4 py-4">
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
            Once you start, the timer runs continuously. You&apos;ll see your results and all
            explanations when you finish. Take a breath — you&apos;ve got this.
          </p>
        </div>

        {error && (
          <p className="text-sm text-[destructive] text-center" role="alert">
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
          Start {questionCount}-question timed session
        </Button>
      </div>
    </div>
  )
}

StormSetup.displayName = 'StormSetup'

export { StormSetup }
