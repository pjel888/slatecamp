'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'
import { StudyWindowSelector } from '@/components/settings/StudyWindowSelector'
import { ReviewCenterStep } from './ReviewCenterStep'
import { CoexistenceScreen } from './CoexistenceScreen'
import type { Discipline } from '@/types/app'

type ReviewerType = 'first_taker' | 'returning_reviewer' | 'undergrad' | 'dae'
type ReviewCenterValue = 'jpt' | 'atlas_cdc' | 'other' | 'none'

// Steps: 'main' → 'review_center' → 'coexistence' (only if not 'none') → submit
type Step = 'main' | 'review_center' | 'coexistence'

interface Subject {
  node_id: string
  name: string
}

interface OnboardingFormProps {
  disciplines: Discipline[]
  subjectsByDiscipline: Record<string, Subject[]>
  onSubmit: (formData: FormData) => Promise<void>
}

const REVIEWER_OPTIONS: {
  value: ReviewerType
  label: string
  subLabel: string
}[] = [
  {
    value: 'first_taker',
    label: 'Preparing for the ALE',
    subLabel: 'First time taking the Licensure Exam',
  },
  {
    value: 'returning_reviewer',
    label: 'Returning reviewer — refining my strategy',
    subLabel: 'You know the ALE. You know what needs to change.',
  },
  {
    value: 'undergrad',
    label: 'Architecture student — studio reference',
    subLabel: 'No pressure. Just the best building code reference.',
  },
  {
    value: 'dae',
    label: 'Licensed architect — staying current',
    subLabel: 'Keep your knowledge current between renewals.',
  },
]

export const OnboardingForm = ({
  disciplines,
  subjectsByDiscipline,
  onSubmit,
}: OnboardingFormProps) => {
  const [step, setStep] = useState<Step>('main')
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>('')
  const [reviewerType, setReviewerType] = useState<ReviewerType>('first_taker')
  const [struggledSubjects, setStruggledSubjects] = useState<string[]>([])
  const [reviewCenter, setReviewCenter] = useState<ReviewCenterValue>('none')
  const [reviewCenterOther, setReviewCenterOther] = useState<string>('')

  // Captured form data from the main step — held so we can submit after extra steps
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)

  const subjects = selectedDisciplineId
    ? (subjectsByDiscipline[selectedDisciplineId] ?? [])
    : []

  const showExamDate = reviewerType === 'first_taker' || reviewerType === 'returning_reviewer'
  const showStudyWindow = true
  const showStruggledSubjects = reviewerType === 'returning_reviewer'
  const showSchoolField = reviewerType === 'undergrad'

  const toggleSubject = (nodeId: string) => {
    setStruggledSubjects(prev =>
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    )
  }

  // Called when the main form's native action fires — intercept to add extra steps
  const handleMainSubmit = (formData: FormData) => {
    setPendingFormData(formData)
    setStep('review_center')
  }

  const handleReviewCenterContinue = () => {
    if (reviewCenter !== 'none') {
      setStep('coexistence')
    } else {
      void doFinalSubmit()
    }
  }

  const doFinalSubmit = async () => {
    if (!pendingFormData) return
    // Append the review center value before submitting
    pendingFormData.set('enrolledReviewCenter', reviewCenter)
    if (reviewCenter === 'other' && reviewCenterOther.trim()) {
      pendingFormData.set('enrolledReviewCenterOther', reviewCenterOther.trim())
    }
    await onSubmit(pendingFormData)
  }

  // ── Coexistence screen ────────────────────────────────────────────────────
  if (step === 'coexistence') {
    return <CoexistenceScreen onContinue={() => { void doFinalSubmit() }} />
  }

  // ── Review center step ────────────────────────────────────────────────────
  if (step === 'review_center') {
    return (
      <div className="space-y-5">
        <ReviewCenterStep
          value={reviewCenter}
          otherText={reviewCenterOther}
          onChange={setReviewCenter}
          onOtherTextChange={setReviewCenterOther}
        />
        <button
          type="button"
          onClick={handleReviewCenterContinue}
          className="w-full rounded-sm bg-[#1B3FC4] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#1535A8] focus:outline-none focus:ring-2 focus:ring-[#1B3FC4] focus:ring-offset-2"
        >
          Continue &rarr;
        </button>
      </div>
    )
  }

  // ── Main step (original form) ─────────────────────────────────────────────
  return (
    <form action={handleMainSubmit} className="space-y-5">
      {/* Hidden field: struggled subjects serialised as JSON */}
      <input
        type="hidden"
        name="struggledSubjects"
        value={JSON.stringify(
          subjects
            .filter(s => struggledSubjects.includes(s.node_id))
            .map(s => s.name)
        )}
      />

      {/* Discipline Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Choose your discipline
        </label>
        <div className="space-y-2">
          {disciplines.map((discipline: Discipline) => (
            <label
              key={discipline.discipline_id}
              className="flex items-center justify-between rounded-md border border-border p-3 transition-colors duration-150 hover:border-primary hover:bg-primary/5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <span className="text-[11px] font-bold">{discipline.acronym}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{discipline.name}</span>
              </div>
              <input
                type="radio"
                name="disciplineId"
                value={discipline.discipline_id}
                required
                onChange={() => setSelectedDisciplineId(discipline.discipline_id)}
                className="h-4 w-4 border-border text-primary"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Reviewer Type — 4-way selector */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          What brings you to SlateCamp?
        </p>
        <div className="space-y-2">
          {REVIEWER_OPTIONS.map(({ value, label, subLabel }) => (
            <label key={value} className="block cursor-pointer">
              <input
                type="radio"
                name="reviewerType"
                value={value}
                checked={reviewerType === value}
                onChange={() => setReviewerType(value)}
                className="peer sr-only"
              />
              <div className="rounded-md border border-border p-3 transition-colors duration-150 peer-checked:border-primary peer-checked:bg-primary/10 hover:border-primary/50 hover:bg-primary/5">
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150',
                      reviewerType === value
                        ? 'border-primary'
                        : 'border-border',
                    ].join(' ')}
                  >
                    {reviewerType === value && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">{subLabel}</p>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Returning reviewer — context copy */}
      {reviewerType === 'returning_reviewer' && (
        <div className="rounded-md border border-border bg-muted px-4 py-3">
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            You know the ALE. You know what needs to change.{' '}
            <span className="font-medium text-foreground">
              SlateCamp gives you the data to change it.
            </span>
          </p>
        </div>
      )}

      {/* Undergrad — context copy */}
      {reviewerType === 'undergrad' && (
        <div className="rounded-md border border-border bg-muted px-4 py-3">
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            No pressure. Just the best building code reference in the Philippines.
          </p>
        </div>
      )}

      {/* DAE — context copy */}
      {reviewerType === 'dae' && (
        <div className="rounded-md border border-border bg-muted px-4 py-3">
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Keep your knowledge current between renewals.
          </p>
        </div>
      )}

      {/* Struggled subjects — returning_reviewer only */}
      {showStruggledSubjects && subjects.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-1">
            What subject felt hardest?
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Select all that apply — we&apos;ll prioritise these areas for you.
          </p>
          <div className="space-y-1.5">
            {subjects.map(subject => {
              const isChecked = struggledSubjects.includes(subject.node_id)
              return (
                <button
                  key={subject.node_id}
                  type="button"
                  onClick={() => toggleSubject(subject.node_id)}
                  className={[
                    'w-full flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors duration-150',
                    isChecked
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2 transition-colors duration-150',
                      isChecked ? 'border-primary bg-primary' : 'border-border',
                    ].join(' ')}
                  >
                    {isChecked && (
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-foreground">{subject.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* School / Institution — undergrad only */}
      {showSchoolField && (
        <div>
          <label htmlFor="schoolOrInstitution" className="block text-sm font-medium text-foreground mb-1.5">
            School or institution
          </label>
          <Input
            type="text"
            id="schoolOrInstitution"
            name="schoolOrInstitution"
            placeholder="e.g. University of Santo Tomas"
          />
        </div>
      )}

      {/* Exam Date — first_taker + returning_reviewer only */}
      {showExamDate && (
        <div>
          <label htmlFor="examDate" className="block text-sm font-medium text-foreground mb-1.5">
            When is your target exam date?
          </label>
          <Input
            type="date"
            id="examDate"
            name="examDate"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Helps us recommend the right study trail for your timeline.
          </p>
        </div>
      )}

      {/* Study Window — all types */}
      {showStudyWindow && (
        <div className="pt-2 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-1">
            When do you usually study?
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Optional — helps order trail activities for better retention.
          </p>
          <StudyWindowSelector compact />
        </div>
      )}

      <SubmitButton variant="primary" size="lg" fullWidth pendingLabel="Setting up your account...">
        Continue &rarr;
      </SubmitButton>
    </form>
  )
}

