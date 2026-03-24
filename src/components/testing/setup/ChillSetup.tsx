'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROUTES } from '@/lib/constants/routes'
import { createTestingSession } from '@/lib/actions/testing'
import type { SessionConfig } from '@/types/testing'
import { ALE_SUBJECTS } from '@/types/testing'

interface ChillSetupProps {
  userId: string
}

const ChillSetup = ({ userId }: ChillSetupProps) => {
  const router = useRouter()
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    try {
      const config: SessionConfig = {
        source: 'chill_mode',
        questionCount: null,
        subjectFilter: subjectFilter !== 'all' ? [subjectFilter] : [],
        topicFilter: [],
        difficultyBands: [],
        feedbackMode: 'immediate',
        timerEnabled: false,
        timerSeconds: null,
        focusOption: subjectFilter !== 'all' ? 'single-subject' : 'mixed',
        preSessionConfidence: [],
        isBlindsplotSession: false,
        blindspotQueueId: null,
        isProofSimulation: false,
        isEnduranceSession: false,
        strippedUi: false,
        masteryWeightMultiplier: 1,
      }
      const sessionId = await createTestingSession(userId, config)
      router.push(ROUTES.TESTING_SESSION(sessionId))
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
          Chill Mode
        </p>
        <h1 className="text-[24px] font-semibold text-[var(--foreground)] mb-2">Relaxed</h1>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
          Browse questions at your own pace. Skip any you want. End whenever you&apos;re ready.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Want to focus on a subject?
          </h2>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {ALE_SUBJECTS.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <p className="text-[13px] text-[var(--muted-foreground)]">
          You can end this session anytime — no penalty.
        </p>

        <Button
          variant="default"
          size="lg"
          fullWidth
          loading={loading}
          onClick={handleStart}
          className="bg-[var(--primary)] text-white hover:bg-[var(--accent-hover)] rounded-sm"
        >
          Start browsing
        </Button>
      </div>
    </div>
  )
}

ChillSetup.displayName = 'ChillSetup'

export { ChillSetup }
