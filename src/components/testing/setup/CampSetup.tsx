'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { QuestionCountPills } from './shared/QuestionCountPills'
import { ConfidenceCheck } from './shared/ConfidenceCheck'
import { FocusSelector } from './shared/FocusSelector'
import { ROUTES } from '@/lib/constants/routes'
import { QUESTION_COUNT_OPTIONS } from '@/lib/constants/testing-modes'
import { createTestingSession } from '@/lib/actions/testing'
import type { SubjectConfidence, FocusOption, SessionConfig } from '@/types/testing'
import { ALE_SUBJECTS } from '@/types/testing'

interface CampSetupProps {
  userId: string
  completedSessionCount: number
}

const CampSetup = ({ userId, completedSessionCount }: CampSetupProps) => {
  const router = useRouter()
  const [questionCount, setQuestionCount] = useState(20)
  const [confidenceRatings, setConfidenceRatings] = useState<SubjectConfidence[]>([])
  const [focusOption, setFocusOption] = useState<FocusOption>('weakest')
  const [focusSubjectId, setFocusSubjectId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subjects = ALE_SUBJECTS.map((s) => ({ subjectId: s.id, subjectName: s.name }))
  const isFirstTime = completedSessionCount === 0

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const config: SessionConfig = {
        source: 'camp_mode',
        questionCount,
        subjectFilter: focusOption === 'single-subject' && focusSubjectId ? [focusSubjectId] : [],
        topicFilter: [],
        difficultyBands: [],
        feedbackMode: 'immediate',
        timerEnabled: false,
        timerSeconds: null,
        focusOption,
        preSessionConfidence: confidenceRatings,
        isBlindspotSession: false,
        blindspotQueueId: null,
        isProofSimulation: false,
        isEnduranceSession: false,
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
          Camp Mode
        </p>
        <h1 className="text-[24px] font-semibold text-[var(--foreground)] mb-2">
          Guided Study
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
          Instant feedback after each answer. Full explanations on every question. No timer, no
          pressure.
        </p>
      </div>

      {isFirstTime && (
        <div className="mb-8 rounded-md bg-[var(--slate-blue-50)] border border-[var(--primary)]/20 px-4 py-3">
          <p className="text-[13px] text-[var(--primary)] font-medium">
            New to SlateCamp? The defaults are already set for you. Just hit Start.
          </p>
        </div>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            How many questions?
          </h2>
          <QuestionCountPills
            options={QUESTION_COUNT_OPTIONS.camp}
            selected={questionCount}
            onChange={setQuestionCount}
          />
        </section>

        <section>
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Confidence check
          </h2>
          <ConfidenceCheck
            subjects={subjects}
            ratings={confidenceRatings}
            onChange={setConfidenceRatings}
          />
        </section>

        <section>
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Focus
          </h2>
          <FocusSelector
            selected={focusOption}
            onChange={setFocusOption}
            selectedSubjectId={focusSubjectId}
            onSubjectChange={setFocusSubjectId}
          />
        </section>

        {error && (
          <p className="text-sm text-destructive text-center" role="alert">
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
          Start {questionCount}-question session
        </Button>
      </div>
    </div>
  )
}

CampSetup.displayName = 'CampSetup'

export { CampSetup }
