'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'
import { StudyWindowSelector, type StudyWindow } from '@/components/settings/StudyWindowSelector'
import { ReviewCenterStep } from './ReviewCenterStep'
import { CoexistenceScreen } from './CoexistenceScreen'
import { CalibrationScreen } from './CalibrationScreen'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'
import { skipOnboarding } from '@/lib/actions/profile'
import { toast } from '@/lib/hooks/use-toast'
import type { Discipline } from '@/types/app'

type ReviewerType = 'first_taker' | 'returning_reviewer'
type ReviewCenterValue = 'jpt' | 'atlas_cdc' | 'other' | 'none'
type Step = 'main' | 'review_center' | 'coexistence' | 'calibrating'
type SubmitStatus = 'idle' | 'pending' | 'error'

interface Subject {
  node_id: string
  name: string
}

interface OnboardingSubmitResult {
  success: boolean
  redirectTo?: string
  formError?: string
  fieldErrors?: Partial<Record<'disciplineId' | 'reviewerType' | 'studyWindow', string>>
}

interface OnboardingFormProps {
  disciplines: Discipline[]
  subjectsByDiscipline: Record<string, Subject[]>
  onSubmit: (formData: FormData) => Promise<OnboardingSubmitResult>
}

const REVIEWER_OPTIONS: {
  value: ReviewerType
  label: string
  subLabel: string
}[] = [
  {
    value: 'first_taker',
    label: 'Preparing for the LEA',
    subLabel: 'First time taking the Licensure Exam',
  },
  {
    value: 'returning_reviewer',
    label: 'Returning reviewer - refining my strategy',
    subLabel: 'You know the LEA. You know what needs to change.',
  },
]

export const OnboardingForm = ({
  disciplines,
  subjectsByDiscipline,
  onSubmit,
}: OnboardingFormProps) => {
  const router = useRouter()
  const [step, setStep] = useState<Step>('main')
  const [selectedDisciplineId, setSelectedDisciplineId] = useState('')
  const [reviewerType, setReviewerType] = useState<ReviewerType>('first_taker')
  const [studyWindow, setStudyWindow] = useState<StudyWindow>('any')
  const [examDate, setExamDate] = useState('')
  const [struggledSubjects, setStruggledSubjects] = useState<string[]>([])
  const [reviewCenter, setReviewCenter] = useState<ReviewCenterValue>('none')
  const [reviewCenterOther, setReviewCenterOther] = useState('')
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [isSkipPending, setIsSkipPending] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [mainStepError, setMainStepError] = useState<string | null>(null)
  const [calibrationReturnStep, setCalibrationReturnStep] = useState<'review_center' | 'coexistence'>('review_center')

  const handleSkip = useCallback(async () => {
    if (submitStatus === 'pending' || isSkipPending) return

    setIsSkipPending(true)
    setSubmitError(null)
    trackEvent({ event_name: 'onboarding_skipped' })
    try {
      const result = await skipOnboarding()
      if (result.success) {
        router.push(ROUTES.dashboard.root)
        return
      }

      const description = result.error ?? 'We could not skip setup right now. Try again.'
      setSubmitError(description)
      toast({ title: 'Setup still required', description, variant: 'error' })
    } catch {
      const description = 'We could not skip setup right now. Try again.'
      setSubmitError(description)
      toast({ title: 'Setup still required', description, variant: 'error' })
    } finally {
      setIsSkipPending(false)
    }
  }, [isSkipPending, router, submitStatus])

  useEffect(() => {
    trackEvent({ event_name: 'onboarding_started' })
  }, [])

  const subjects = selectedDisciplineId ? (subjectsByDiscipline[selectedDisciplineId] ?? []) : []
  const showExamDate = reviewerType === 'first_taker' || reviewerType === 'returning_reviewer'
  const showStruggledSubjects = reviewerType === 'returning_reviewer'

  const totalSteps = reviewCenter !== 'none' ? 3 : 2
  const currentStepNumber = useMemo(() => {
    if (step === 'main') return 1
    if (step === 'review_center') return 2
    if (step === 'coexistence') return 3
    return totalSteps
  }, [step, totalSteps])

  useEffect(() => {
    if (step !== 'main' && step !== 'calibrating') {
      trackEvent({
        event_name: 'onboarding_step_viewed',
        event_properties: { step, step_number: currentStepNumber },
      })
    }
  }, [step, currentStepNumber])

  const toggleSubject = (nodeId: string) => {
    setStruggledSubjects((previous) =>
      previous.includes(nodeId) ? previous.filter((id) => id !== nodeId) : [...previous, nodeId],
    )
  }

  const handleMainSubmit = (formData: FormData) => {
    setMainStepError(null)
    setSubmitError(null)
    setSubmitStatus('idle')
    setPendingFormData(formData)
    setStep('review_center')
    trackEvent({
      event_name: 'onboarding_main_step_completed',
      event_properties: {
        discipline_id: selectedDisciplineId,
        reviewer_type: reviewerType,
        struggled_subjects_count: struggledSubjects.length,
      },
    })
  }

  const handleReviewCenterContinue = () => {
    setSubmitError(null)
    setSubmitStatus('idle')
    trackEvent({
      event_name: 'onboarding_review_center_selected',
      event_properties: { reviewCenter },
    })

    if (reviewCenter !== 'none') {
      setStep('coexistence')
      return
    }

    setCalibrationReturnStep('review_center')
    setStep('calibrating')
  }

  const doFinalSubmit = useCallback(async () => {
    if (!pendingFormData || submitStatus === 'pending') return

    const finalFormData = new FormData()
    pendingFormData.forEach((value, key) => {
      finalFormData.append(key, value)
    })

    finalFormData.set('studyWindow', studyWindow)
    finalFormData.set('enrolledReviewCenter', reviewCenter)
    if (reviewCenter === 'other' && reviewCenterOther.trim()) {
      finalFormData.set('enrolledReviewCenterOther', reviewCenterOther.trim())
    }

    setSubmitStatus('pending')
    setSubmitError(null)
    setMainStepError(null)

    trackEvent({ event_name: 'onboarding_submit_started' })

    const result = await onSubmit(finalFormData)

    if (result.success && result.redirectTo) {
      router.push(result.redirectTo)
      return
    }

    trackEvent({
      event_name: 'onboarding_submit_failed',
      event_properties: {
        has_field_errors: !!result.fieldErrors && Object.keys(result.fieldErrors).length > 0,
      },
    })

    if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
      setMainStepError(result.formError ?? 'We could not validate your setup. Review your answers and try again.')
      setStep('main')
      setSubmitStatus('idle')
      setSubmitError(null)
      return
    }

    setSubmitStatus('error')
    setSubmitError(result.formError ?? 'We could not finish setup right now. Your answers are still here. Try again.')
  }, [onSubmit, pendingFormData, reviewCenter, reviewCenterOther, router, studyWindow, submitStatus])

  useEffect(() => {
    if (step === 'calibrating' && submitStatus === 'idle') {
      void doFinalSubmit()
    }
  }, [doFinalSubmit, step, submitStatus])

  const handleCalibrationRetry = useCallback(() => {
    setSubmitStatus('idle')
    setSubmitError(null)
  }, [])

  const handleCalibrationBack = useCallback(() => {
    setSubmitStatus('idle')
    setSubmitError(null)
    setStep(calibrationReturnStep)
  }, [calibrationReturnStep])

  if (step === 'calibrating') {
    return (
      <CalibrationScreen
        status={submitStatus === 'error' ? 'error' : 'pending'}
        errorMessage={submitError}
        onRetry={handleCalibrationRetry}
        onBack={handleCalibrationBack}
      />
    )
  }

  if (step === 'coexistence') {
    return (
      <div className="space-y-6">
        <div className="mb-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
            Step {currentStepNumber} of {totalSteps}
          </p>
        </div>
        <CoexistenceScreen
          onContinue={() => {
            if (isSkipPending || submitStatus === 'pending') return
            setCalibrationReturnStep('coexistence')
            setSubmitError(null)
            setSubmitStatus('idle')
            setStep('calibrating')
          }}
        />
        {submitError && (
          <p className="rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        )}
        <button
          type="button"
          onClick={handleSkip}
          disabled={isSkipPending || submitStatus === 'pending'}
          className="w-full rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSkipPending ? 'Skipping...' : 'Skip for now'}
        </button>
      </div>
    )
  }

  if (step === 'review_center') {
    return (
      <div className="space-y-5">
        <div className="mb-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
            Step {currentStepNumber} of {totalSteps}
          </p>
        </div>
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-foreground">Study Harmony</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Are you enrolled in a review center?</p>
        </div>
        <ReviewCenterStep
          value={reviewCenter}
          otherText={reviewCenterOther}
          onChange={setReviewCenter}
          onOtherTextChange={setReviewCenterOther}
        />
        <button
          type="button"
          onClick={handleReviewCenterContinue}
          disabled={
            isSkipPending ||
            submitStatus === 'pending' ||
            (reviewCenter === 'other' && !reviewCenterOther.trim())
          }
          className="w-full rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue &rarr;
        </button>
        {submitError && (
          <p className="rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        )}
        <button
          type="button"
          onClick={handleSkip}
          disabled={isSkipPending || submitStatus === 'pending'}
          className="w-full rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSkipPending ? 'Skipping...' : 'Skip for now'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
          Step {currentStepNumber} of {totalSteps}
        </p>
      </div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-foreground">Let&apos;s set up your study path</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          A few quick questions, then we&apos;ll build your diagnostic.
        </p>
      </div>

      <form action={handleMainSubmit} className="space-y-5">
        <input
          type="hidden"
          name="struggledSubjects"
          value={JSON.stringify(
            subjects.filter((subject) => struggledSubjects.includes(subject.node_id)).map((subject) => subject.name),
          )}
        />
        <input type="hidden" name="studyWindow" value={studyWindow} />

        {mainStepError && (
          <div className="rounded-sm border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {mainStepError}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Choose your discipline</label>
          <div className="space-y-2">
            {disciplines.map((discipline) => (
              <label
                key={discipline.discipline_id}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors duration-150 hover:border-primary hover:bg-primary/5',
                  selectedDisciplineId === discipline.discipline_id ? 'border-primary bg-primary/5' : 'border-border',
                )}
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

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">What brings you to SlateCamp?</p>
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
                        reviewerType === value ? 'border-primary' : 'border-border',
                      ].join(' ')}
                    >
                      {reviewerType === value && <div className="h-2 w-2 rounded-full bg-primary" />}
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

        {reviewerType === 'returning_reviewer' && (
          <div className="rounded-md border border-border bg-muted px-4 py-3">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              You know the LEA. You know what needs to change.{' '}
              <span className="font-medium text-foreground">SlateCamp gives you the data to change it.</span>
            </p>
          </div>
        )}

        {showStruggledSubjects && subjects.length > 0 && (
          <div>
            <p className="mb-1 text-sm font-medium text-foreground">What subject felt hardest?</p>
            <p className="mb-2 text-xs text-muted-foreground">
              Select all that apply - we&apos;ll prioritise these areas for you.
            </p>
            <div className="space-y-1.5">
              {subjects.map((subject) => {
                const isChecked = struggledSubjects.includes(subject.node_id)

                return (
                  <button
                    key={subject.node_id}
                    type="button"
                    onClick={() => toggleSubject(subject.node_id)}
                    className={[
                      'flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors duration-150',
                      isChecked ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-primary/5',
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

        {showExamDate && (
          <div>
            <label htmlFor="examDate" className="mb-1.5 block text-sm font-medium text-foreground">
              When is your target exam date?
            </label>
            <Input
              type="date"
              id="examDate"
              name="examDate"
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Helps us recommend the right study trail for your timeline.
            </p>
          </div>
        )}

        <div className="border-t border-border pt-2">
          <p className="mb-1 text-sm font-medium text-foreground">When do you usually study?</p>
          <p className="mb-2 text-xs text-muted-foreground">
            Optional - helps order trail activities for better retention.
          </p>
          <StudyWindowSelector compact mode="controlled" value={studyWindow} onChange={setStudyWindow} />
        </div>

        <SubmitButton variant="primary" size="lg" fullWidth pendingLabel="Continuing...">
          Continue &rarr;
        </SubmitButton>
        <button
          type="button"
          onClick={handleSkip}
          className="w-full rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-muted"
        >
          Skip for now
        </button>
      </form>
    </div>
  )
}
