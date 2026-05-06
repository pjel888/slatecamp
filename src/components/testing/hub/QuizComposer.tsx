'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  DotsSixVertical,
  Plus,
  X,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/routes'
import { getCoreSubjects } from '@/lib/actions/taxonomy'
import { startSession } from '@/lib/actions/quiz-v2'
import { SlideToSubmit } from '@/components/quiz-v2/SlideToSubmit'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface Subject {
  node_id: string
  name: string
  subject_area: string
}

interface QuizComposerProps {
  initialSubjects?: Subject[]
}

type QuestionCountOption = 10 | 20 | 30 | 50

const QUESTION_COUNT_OPTIONS = [10, 20, 30, 50] as const satisfies readonly QuestionCountOption[]
const TIMER_PRESETS = [15, 30, 60] as const
const SUBJECT_ACCENTS = [
  '#1B3FC4',
  '#534AB7',
  '#0D9488',
  '#059669',
  '#D4951A',
  '#E11D48',
  '#7C3AED',
  '#0891B2',
  '#DC2626',
]

const formatDuration = (questionCount: number) => {
  const minutes = Math.round(questionCount * 1.5)
  return minutes < 60
    ? `~${minutes} min`
    : `~${Math.floor(minutes / 60)}h${minutes % 60 > 0 ? ` ${minutes % 60}m` : ''}`
}

const formatTimer = (minutes: number) =>
  minutes >= 60
    ? `${Math.floor(minutes / 60)}h${minutes % 60 > 0 ? ` ${minutes % 60}m` : ''}`
    : `${minutes} min`

export const QuizComposer = ({ initialSubjects }: QuizComposerProps) => {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects ?? [])
  const [subjectsLoading, setSubjectsLoading] = useState((initialSubjects?.length ?? 0) === 0)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(new Set())
  const [questionCount, setQuestionCount] = useState<QuestionCountOption>(20)
  const [timedMode, setTimedMode] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(30)
  const [error, setError] = useState<string | null>(null)
  const [validationTouched, setValidationTouched] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [dropActive, setDropActive] = useState(false)

  useEffect(() => {
    if (initialSubjects && initialSubjects.length > 0) {
      setSubjects(initialSubjects)
      setSubjectsLoading(false)
      return
    }

    setSubjectsLoading(true)
    getCoreSubjects()
      .then((loadedSubjects) => {
        setSubjects(loadedSubjects)
        setSubjectsLoading(false)
      })
      .catch(() => {
        setError('Failed to load subjects.')
        setSubjectsLoading(false)
      })
  }, [initialSubjects])

  const selectedSubjects = useMemo(
    () => subjects.filter((subject) => selectedSubjectIds.has(subject.node_id)),
    [subjects, selectedSubjectIds],
  )
  const selectedCount = selectedSubjects.length
  const valid = selectedCount > 0
  const estimatedDuration = timedMode ? formatTimer(timerMinutes) : formatDuration(questionCount)

  const addSubject = useCallback((subjectId: string) => {
    setError(null)
    setValidationTouched(false)
    setSelectedSubjectIds((previous) => {
      const next = new Set(previous)
      next.add(subjectId)
      return next
    })
  }, [])

  const removeSubject = useCallback((subjectId: string) => {
    setError(null)
    setSelectedSubjectIds((previous) => {
      const next = new Set(previous)
      next.delete(subjectId)
      return next
    })
  }, [])

  const addAllSubjects = useCallback(() => {
    setError(null)
    setValidationTouched(false)
    setSelectedSubjectIds(new Set(subjects.map((subject) => subject.node_id)))
  }, [subjects])

  const clearSubjects = useCallback(() => {
    setError(null)
    setSelectedSubjectIds(new Set())
  }, [])

  const start = useCallback(async () => {
    setValidationTouched(true)
    setError(null)

    if (!valid) {
      setTooltipOpen(true)
      return
    }

    if (isStarting) return
    setIsStarting(true)

    try {
      const result = await startSession({
        mode: 'custom',
        config: {
          setup: {
            questionCount,
            topics: Array.from(selectedSubjectIds),
            disciplines: [],
            difficultyMode: 'adaptive',
            initialDifficulty: 'medium',
            isTrailSession: false,
            trailDayId: null,
          },
          timer: {
            enabled: timedMode,
            visible: timedMode,
            mode: timedMode ? 'countdown' : 'hidden',
            totalSeconds: timedMode ? timerMinutes * 60 : null,
            perQuestion: false,
            pausable: true,
            warningThresholds: [],
          },
          results: {
            delayHours: 0,
            showImmediately: true,
            showPercentile: false,
            showSubjectBreakdown: true,
            showGrowthDelta: false,
            showReadinessScoreImpact: true,
            showStaminaChart: false,
          },
        },
      })

      if (!result.success) {
        setError((result as { message?: string }).message ?? 'Failed to start quiz.')
        setIsStarting(false)
        return
      }

      router.push(ROUTES.quiz.session(result.sessionId))
    } catch {
      setError('Something went wrong while creating your quiz.')
      setIsStarting(false)
    }
  }, [isStarting, questionCount, router, selectedSubjectIds, timedMode, timerMinutes, valid])

  return (
    <TooltipProvider>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]" data-testid="quiz-composer">
        <div className="space-y-5">
          <section aria-labelledby="slatecamp-subjects-heading" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 id="slatecamp-subjects-heading" className="text-sm font-bold text-foreground">
                  Subject selection
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Drag subjects into your set or click a card to add it.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={addAllSubjects}
                  className="rounded-sm border border-border bg-background px-3 py-1.5 font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Add all
                </button>
                <button
                  type="button"
                  onClick={clearSubjects}
                  disabled={selectedCount === 0}
                  className="rounded-sm border border-border bg-background px-3 py-1.5 font-semibold text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Clear
                </button>
              </div>
            </div>

            <div
              onDragOver={(event) => {
                event.preventDefault()
                setDropActive(true)
              }}
              onDragLeave={() => setDropActive(false)}
              onDrop={(event) => {
                event.preventDefault()
                const subjectId = event.dataTransfer.getData('text/plain')
                if (subjectId) addSubject(subjectId)
                setDropActive(false)
              }}
              className={cn(
                'min-h-[106px] rounded-xl border border-dashed p-3 transition-colors',
                dropActive || selectedCount > 0
                  ? 'border-primary/40 bg-primary-50/70'
                  : 'border-border bg-muted/20',
              )}
              aria-label="Selected subjects"
            >
              {selectedCount === 0 ? (
                <div className="flex h-full min-h-[78px] flex-col items-center justify-center text-center">
                  <Plus size={18} weight="bold" className="text-primary" />
                  <p className="mt-2 text-sm font-semibold text-foreground">No subjects selected</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Drag subjects here or click a subject below.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {selectedSubjects.map((subject, index) => (
                      <motion.div
                        key={subject.node_id}
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.92, opacity: 0 }}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-2 text-xs font-semibold text-foreground shadow-sm"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: SUBJECT_ACCENTS[index % SUBJECT_ACCENTS.length] }}
                          aria-hidden="true"
                        />
                        <span>{subject.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSubject(subject.node_id)}
                          className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-destructive focus-visible:outline-2 focus-visible:outline-primary"
                          aria-label={`Remove ${subject.name}`}
                        >
                          <X size={12} weight="bold" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {subjectsLoading ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-lg border border-border bg-muted/30" />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm font-bold text-foreground">No subjects available</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  SlateCamp could not load your subject map. Try again after your discipline profile is set.
                </p>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {subjects.map((subject, index) => {
                  const selected = selectedSubjectIds.has(subject.node_id)
                  const accent = SUBJECT_ACCENTS[index % SUBJECT_ACCENTS.length]
                  return (
                    <button
                      key={subject.node_id}
                      type="button"
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData('text/plain', subject.node_id)}
                      onClick={() => (selected ? removeSubject(subject.node_id) : addSubject(subject.node_id))}
                      aria-pressed={selected}
                      className={cn(
                        'group flex min-h-14 items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left transition-all hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary',
                        selected
                          ? 'border-primary/40 bg-primary-50 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm',
                      )}
                    >
                      <DotsSixVertical size={15} weight="bold" className="shrink-0 text-muted-foreground/50" />
                      <span className="h-8 w-1 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
                      <span className="min-w-0 flex-1 text-xs font-semibold leading-snug text-foreground">
                        {subject.name}
                      </span>
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                          selected ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground',
                        )}
                        aria-hidden="true"
                      >
                        {selected ? <Check size={11} weight="bold" /> : <Plus size={11} weight="bold" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm" aria-labelledby="slatecamp-settings-heading">
            <h3 id="slatecamp-settings-heading" className="text-sm font-bold text-foreground">
              Session settings
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-foreground">Questions</p>
                <div className="mt-2 grid grid-cols-4 gap-1.5" role="group" aria-label="Question count">
                  {QUESTION_COUNT_OPTIONS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={cn(
                        'rounded-md border px-2 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-primary',
                        questionCount === count
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-primary',
                      )}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Timed mode</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      Simulate exam pressure with a countdown.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={timedMode}
                    onClick={() => setTimedMode((value) => !value)}
                    className={cn(
                      'relative h-7 w-12 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-primary',
                      timedMode ? 'border-primary bg-primary' : 'border-border bg-background',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                        timedMode ? 'translate-x-5' : 'translate-x-1',
                      )}
                    />
                    <span className="sr-only">Toggle timed mode</span>
                  </button>
                </div>
                <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
                  {timedMode ? `Timed · ${formatTimer(timerMinutes)}` : 'Untimed'}
                </p>
                <AnimatePresence initial={false}>
                  {timedMode && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 grid grid-cols-3 gap-1.5">
                        {TIMER_PRESETS.map((minutes) => (
                          <button
                            key={minutes}
                            type="button"
                            onClick={() => setTimerMinutes(minutes)}
                            className={cn(
                              'rounded-md border px-2 py-1.5 text-[11px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-primary',
                              timerMinutes === minutes
                                ? 'border-primary/40 bg-primary-50 text-primary'
                                : 'border-border bg-background text-muted-foreground hover:border-primary/30',
                            )}
                          >
                            {formatTimer(minutes)}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-sm" aria-labelledby="slatecamp-summary-heading">
            <h3 id="slatecamp-summary-heading" className="text-sm font-bold text-foreground">
              Session summary
            </h3>
            <div className="mt-3 space-y-2 text-xs">
              <SummaryRow label="Subjects selected" value={selectedCount > 0 ? String(selectedCount) : 'None'} />
              <SummaryRow label="Questions" value={String(questionCount)} />
              <SummaryRow label="Estimated duration" value={estimatedDuration} />
              <SummaryRow label="Timer" value={timedMode ? 'On' : 'Off'} />
            </div>
          </section>

          <section className="rounded-xl border border-primary/20 bg-primary-50/70 p-4" aria-live="polite">
            {validationTouched && !valid && (
              <p className="mb-3 rounded-md border border-destructive/20 bg-white px-3 py-2 text-xs font-semibold text-destructive">
                Select at least one subject to start.
              </p>
            )}
            {error && (
              <p className="mb-3 rounded-md border border-destructive/20 bg-white px-3 py-2 text-xs font-semibold text-destructive">
                {error}
              </p>
            )}
            <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <TooltipTrigger asChild>
                <div
                  onClickCapture={(event) => {
                    if (!valid || isStarting) {
                      event.preventDefault()
                      event.stopPropagation()
                      setValidationTouched(true)
                      setTooltipOpen(true)
                    }
                  }}
                >
                  <SlideToSubmit
                    disabled={!valid || isStarting}
                    onSubmit={start}
                    label={isStarting ? 'Building quiz…' : 'Slide to start quiz'}
                    testId="quiz-start-slider"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="border-none bg-foreground px-3 py-2 text-white">
                <p className="text-[11px] font-medium">
                  {valid ? 'Slide or press Enter to start.' : 'Select at least one subject.'}
                </p>
              </TooltipContent>
            </Tooltip>
          </section>
        </aside>
      </div>
    </TooltipProvider>
  )
}

QuizComposer.displayName = 'QuizComposer'

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 rounded-md bg-muted/30 px-3 py-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-bold text-foreground">{value}</span>
  </div>
)
