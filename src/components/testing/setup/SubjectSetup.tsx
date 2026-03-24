'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { QuestionCountPills } from './shared/QuestionCountPills'
import { SubjectGrid } from './shared/SubjectGrid'
import { ROUTES } from '@/lib/constants/routes'
import { QUESTION_COUNT_OPTIONS } from '@/lib/constants/testing-modes'
import { createTestingSession } from '@/lib/actions/testing'
import type { SessionConfig } from '@/types/testing'
import { ALE_SUBJECTS } from '@/types/testing'

interface MasteryRow {
  topic_id: string
  current_mastery_weight: number
  taxonomy_tree: { subject_area: string } | null
}

interface SubjectSetupProps {
  userId: string
  masteryData: MasteryRow[]
}

const SubjectSetup = ({ userId, masteryData }: SubjectSetupProps) => {
  // Aggregate mastery per subject area (average of node weights, expressed as %)
  const subjectMasteryMap = masteryData.reduce<Record<string, { total: number; count: number }>>(
    (acc, row) => {
      const subjectArea = row.taxonomy_tree?.subject_area
      if (!subjectArea) return acc
      if (!acc[subjectArea]) acc[subjectArea] = { total: 0, count: 0 }
      acc[subjectArea]!.total += row.current_mastery_weight
      acc[subjectArea]!.count += 1
      return acc
    },
    {},
  )
  const computedMasteryData = Object.entries(subjectMasteryMap).map(([subjectId, { total, count }]) => ({
    subjectId,
    mastery: Math.round((total / count) * 100),
  }))
  const router = useRouter()
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(20)
  const [loading, setLoading] = useState(false)

  const subjects = ALE_SUBJECTS.map((s) => ({ subjectId: s.id, subjectName: s.name }))

  const selectedSubject = selectedSubjectId
    ? ALE_SUBJECTS.find((s) => s.id === selectedSubjectId)
    : null

  const handleStart = async () => {
    if (!selectedSubjectId) return
    setLoading(true)
    try {
      const config: SessionConfig = {
        source: 'subject_mode',
        questionCount,
        subjectFilter: [selectedSubjectId],
        topicFilter: [],
        difficultyBands: [],
        feedbackMode: 'immediate',
        timerEnabled: false,
        timerSeconds: null,
        focusOption: 'single-subject',
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
          Subject Mode
        </p>
        <h1 className="text-[24px] font-semibold text-[var(--foreground)] mb-2">Focused</h1>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
          Deep-dive into one subject. Questions matched to your current mastery level.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Choose a subject
          </h2>
          <SubjectGrid
            subjects={subjects}
            masteryData={computedMasteryData}
            selectedId={selectedSubjectId}
            onSelect={setSelectedSubjectId}
          />
        </section>

        <section>
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            How many questions?
          </h2>
          <QuestionCountPills
            options={QUESTION_COUNT_OPTIONS.subject}
            selected={questionCount}
            onChange={setQuestionCount}
          />
        </section>

        <Button
          variant="default"
          size="lg"
          fullWidth
          loading={loading}
          disabled={!selectedSubjectId}
          onClick={handleStart}
          className="bg-[var(--primary)] text-white hover:bg-[var(--accent-hover)] rounded-sm disabled:opacity-50"
        >
          {selectedSubject
            ? `Start ${selectedSubject.name} session`
            : 'Start session'}
        </Button>
      </div>
    </div>
  )
}

SubjectSetup.displayName = 'SubjectSetup'

export { SubjectSetup }
