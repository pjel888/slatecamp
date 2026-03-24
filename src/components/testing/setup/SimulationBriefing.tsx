'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { createTestingSession } from '@/lib/actions/testing'
import type { SessionConfig } from '@/types/testing'
import { SECONDS_PER_QUESTION } from '@/lib/constants/testing-modes'

interface SimulationBriefingProps {
  userId: string
}

const SIMULATION_QUESTION_COUNT = 200

const SimulationBriefing = ({ userId }: SimulationBriefingProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleBegin = async () => {
    setLoading(true)
    try {
      const config: SessionConfig = {
        source: 'proof_simulation',
        questionCount: SIMULATION_QUESTION_COUNT,
        subjectFilter: [],
        topicFilter: [],
        difficultyBands: [],
        feedbackMode: 'deferred',
        timerEnabled: true,
        timerSeconds: SIMULATION_QUESTION_COUNT * SECONDS_PER_QUESTION,
        focusOption: 'mixed',
        preSessionConfidence: [],
        isBlindsplotSession: false,
        blindspotQueueId: null,
        isProofSimulation: true,
        isEnduranceSession: false,
        strippedUi: true,
        masteryWeightMultiplier: 1,
      }
      const sessionId = await createTestingSession(userId, config)
      router.push(ROUTES.TESTING_SESSION(sessionId))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
      <div className="max-w-[560px] w-full mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-[28px] font-semibold text-[var(--foreground)] mb-3">
            Full Exam Simulation
          </h1>
          <p className="text-[16px] text-[var(--text-secondary)]">
            This is the closest experience to your real exam.
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-white p-6 mb-6">
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-4">
            What to expect
          </h2>
          <ul className="space-y-3">
            {[
              '200 questions',
              'Timed — matches real exam duration',
              'No feedback during the session',
              'Your score will be available 24 hours after you finish',
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-3">
                <span
                  className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--primary)]"
                  aria-hidden="true"
                />
                <span className="text-[14px] text-[var(--foreground)]">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md bg-[#F8F7F5] border border-[var(--border)] px-4 py-4 mb-6">
          <p className="text-[13px] font-medium text-[var(--text-secondary)] mb-1">
            Why 24 hours?
          </p>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Research shows that seeing your score immediately can trigger unhelpful emotional
            reactions. A 24-hour buffer lets you process the experience before seeing results.
          </p>
        </div>

        <p className="text-center text-[14px] text-[var(--text-secondary)] italic mb-8">
          You&apos;ve earned your way here. Trust your preparation.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="warmCta"
            size="xl"
            fullWidth
            loading={loading}
            onClick={handleBegin}
            className="rounded-sm"
          >
            Begin Simulation
          </Button>
          <Link
            href={ROUTES.TESTING}
            className="inline-flex items-center justify-center w-full rounded-sm px-4 py-2.5 text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-light)] transition-all duration-150 ease-out"
          >
            ← Not ready yet
          </Link>
        </div>
      </div>
    </div>
  )
}

SimulationBriefing.displayName = 'SimulationBriefing'

export { SimulationBriefing }
