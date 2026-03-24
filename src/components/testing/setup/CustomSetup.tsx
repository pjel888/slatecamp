'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ROUTES } from '@/lib/constants/routes'
import { createTestingSession } from '@/lib/actions/testing'
import type { SessionConfig, DifficultyBand, FeedbackStyle } from '@/types/testing'
import { ALE_SUBJECTS } from '@/types/testing'
import { cn } from '@/lib/utils'

interface CustomSetupProps {
  userId: string
  availableQuestionCount?: number
}

const DIFFICULTY_BANDS: { value: DifficultyBand; label: string }[] = [
  { value: 'foundational', label: 'Foundational' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
]

const CustomSetup = ({ userId, availableQuestionCount }: CustomSetupProps) => {
  const router = useRouter()
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState(20)
  const [selectedBands, setSelectedBands] = useState<DifficultyBand[]>([])
  const [feedbackStyle, setFeedbackStyle] = useState<FeedbackStyle>('immediate')
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(30)
  const [loading, setLoading] = useState(false)

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    )
  }

  const toggleBand = (band: DifficultyBand) => {
    setSelectedBands((prev) =>
      prev.includes(band) ? prev.filter((b) => b !== band) : [...prev, band],
    )
  }

  const handleStart = async () => {
    setLoading(true)
    try {
      const config: SessionConfig = {
        source: 'custom_session',
        questionCount,
        subjectFilter: selectedSubjectIds,
        topicFilter: [],
        difficultyBands: selectedBands,
        feedbackMode: feedbackStyle,
        timerEnabled,
        timerSeconds: timerEnabled ? timerMinutes * 60 : null,
        focusOption: selectedSubjectIds.length === 1 ? 'single-subject' : 'mixed',
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
          Custom Session
        </p>
        <h1 className="text-[24px] font-semibold text-[var(--foreground)] mb-2">Flexible</h1>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
          Full control. Pick topics, difficulty, question count, and feedback style.
        </p>
      </div>

      <div className="space-y-8">
        {/* Subject selector */}
        <section>
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Subjects
          </h2>
          <div className="space-y-2">
            {ALE_SUBJECTS.map((subject) => {
              const isChecked = selectedSubjectIds.includes(subject.id)
              return (
                <label
                  key={subject.id}
                  className="flex items-center gap-3 cursor-pointer rounded-md border border-[var(--border)] px-4 py-3 hover:bg-[#F8F7F5] transition-colors duration-150 ease-out"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSubject(subject.id)}
                    className="w-4 h-4 accent-[var(--primary)] rounded"
                  />
                  <span className="text-[13px] font-medium text-[var(--foreground)]">
                    {subject.name}
                  </span>
                </label>
              )
            })}
          </div>
        </section>

        {/* Question count slider */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Question count
            </h2>
            <span className="text-[14px] font-medium text-[var(--foreground)]">
              {questionCount}
            </span>
          </div>
          <Slider
            min={5}
            max={100}
            value={questionCount}
            onValueChange={(val) => {
              const v = Array.isArray(val) ? val[0] : val
              if (typeof v === 'number') setQuestionCount(v)
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-[var(--muted-foreground)]">5</span>
            <span className="text-[11px] text-[var(--muted-foreground)]">100</span>
          </div>
        </section>

        {/* Difficulty bands */}
        <section>
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Difficulty
          </h2>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_BANDS.map((band) => {
              const isSelected = selectedBands.includes(band.value)
              return (
                <button
                  key={band.value}
                  type="button"
                  onClick={() => toggleBand(band.value)}
                  aria-pressed={isSelected}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out border select-none',
                    isSelected
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-white text-[var(--text-secondary)] border-[var(--border)] hover:bg-[#F8F7F5]',
                  )}
                >
                  {band.label}
                </button>
              )
            })}
          </div>
          {selectedBands.length === 0 && (
            <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">
              All difficulty levels included when none selected.
            </p>
          )}
        </section>

        {/* Feedback style */}
        <section>
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Feedback style
          </h2>
          <div className="flex items-center gap-3">
            <Switch
              checked={feedbackStyle === 'deferred'}
              onCheckedChange={(checked) =>
                setFeedbackStyle(checked ? 'deferred' : 'immediate')
              }
            />
            <span className="text-[13px] text-[var(--foreground)]">
              {feedbackStyle === 'immediate' ? 'Immediate (after each answer)' : 'After session'}
            </span>
          </div>
        </section>

        {/* Timer */}
        <section>
          <h2 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Timer
          </h2>
          <div className="flex items-center gap-3 mb-3">
            <Switch checked={timerEnabled} onCheckedChange={setTimerEnabled} />
            <span className="text-[13px] text-[var(--foreground)]">
              {timerEnabled ? 'On' : 'Off'}
            </span>
          </div>
          {timerEnabled && (
            <div className="flex items-center gap-3 mt-3">
              <label className="text-[13px] text-[var(--text-secondary)]" htmlFor="timer-minutes">
                Duration (minutes)
              </label>
              <input
                id="timer-minutes"
                type="number"
                min={1}
                max={300}
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 rounded-sm border border-[var(--border)] px-2 py-1 text-[13px] text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors duration-150"
              />
            </div>
          )}
        </section>

        {/* Live counter */}
        {availableQuestionCount !== undefined && (
          <div className="rounded-md bg-[#F8F7F5] border border-[var(--border)] px-4 py-3">
            <p className="text-[13px] text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--foreground)]">
                {availableQuestionCount} questions
              </span>{' '}
              available with these settings
            </p>
          </div>
        )}

        <Button
          variant="default"
          size="lg"
          fullWidth
          loading={loading}
          onClick={handleStart}
          className="bg-[var(--primary)] text-white hover:bg-[var(--accent-hover)] rounded-sm"
        >
          Start custom session
        </Button>
      </div>
    </div>
  )
}

CustomSetup.displayName = 'CustomSetup'

export { CustomSetup }
