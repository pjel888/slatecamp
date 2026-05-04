'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Check, ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/routes'
import { getCoreSubjects } from '@/lib/actions/taxonomy'
import { abandonSession, startSession } from '@/lib/actions/quiz-v2'
import { SlideToSubmit } from '@/components/quiz-v2/SlideToSubmit'
import { UnifiedSlider } from '@/components/ui/unified-slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Subject {
  node_id: string
  name: string
  subject_area: string
}

interface HeroConfiguratorProps {
  initialSubjects?: Subject[]
}

type ModalPhase = 'preparing' | 'ready' | null

export const HeroConfigurator = ({ initialSubjects }: HeroConfiguratorProps) => {
  const router = useRouter()
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>(initialSubjects ?? [])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(new Set())
  const [questionCount, setQuestionCount] = useState(50)
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Session preparation modal state
  const [modalPhase, setModalPhase] = useState<ModalPhase>(null)
  const [readySessionId, setReadySessionId] = useState<string | null>(null)
  const [readyQuestionCount, setReadyQuestionCount] = useState(0)
  const [isCancellingSession, setIsCancellingSession] = useState(false)

  useEffect(() => {
    if (!initialSubjects) {
      getCoreSubjects()
        .then(setAvailableSubjects)
        .catch(() => setError('Failed to load subjects. Please refresh the page.'))
    }
  }, [initialSubjects])

  const toggleSubject = (id: string) => {
    setError(null)
    setSelectedSubjectIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addAll = () => {
    setError(null)
    setSelectedSubjectIds(new Set(availableSubjects.map(s => s.node_id)))
  }

  const clearAll = () => {
    setError(null)
    setSelectedSubjectIds(new Set())
  }

  const handleStart = async () => {
    setError(null)
    if (selectedSubjectIds.size === 0) {
      setShowTooltip(true)
      return
    }

    setModalPhase('preparing')
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
            trailDayId: '',
          },
          timer: {
            enabled: timerMinutes > 0,
            visible: timerMinutes > 0,
            mode: 'countdown',
            totalSeconds: timerMinutes * 60,
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
          }
        }
      })

      if (!result.success) {
        const err = result as { message?: string; error?: string; errorCode?: string }
        console.error('Failed to start session:', err.message ?? err.error)

        setModalPhase(null)
        if (err.errorCode === 'PRO_MODE_REQUIRED' || err.error === 'TIER_INSUFFICIENT') {
          setError('This feature requires a Pro subscription.')
        } else if (err.error === 'NO_QUESTIONS') {
          setError(err.message ?? 'No questions found. Try widening your selection or changing difficulty.')
        } else {
          setError(err.message ?? 'Failed to start session. Please try again.')
        }
        return
      }

      setReadySessionId(result.sessionId)
      setReadyQuestionCount(result.totalQuestions ?? questionCount)
      setModalPhase('ready')
    } catch (err) {
      console.error('Failed to start session:', err)
      setModalPhase(null)
      setError('Something went wrong. Please try again.')
    }
  }

  const handleEnterSession = useCallback(() => {
    if (readySessionId) {
      router.push(ROUTES.quiz.session(readySessionId))
    }
  }, [readySessionId, router])

  const handleCancelSession = useCallback(async () => {
    const sessionId = readySessionId
    setIsCancellingSession(true)
    try {
      if (sessionId) {
        await abandonSession(sessionId)
      }
    } catch (err) {
      console.error('Failed to abandon provisional session:', err)
    } finally {
      setModalPhase(null)
      setReadySessionId(null)
      setReadyQuestionCount(0)
      setIsCancellingSession(false)
    }
  }, [readySessionId])

  const isModalOpen = modalPhase !== null
  const noSubjectsSelected = selectedSubjectIds.size === 0

  return (
    <TooltipProvider>
      <div
        className="rounded-lg border border-border bg-card shadow-sm"
        data-testid="quiz-configurator"
      >
        {/* ═══════════════════════════════════════════════════════════════════
            SUBJECT SELECTION
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Select subjects to practice
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {noSubjectsSelected
                  ? 'Choose at least one subject to build your quiz.'
                  : `${selectedSubjectIds.size} subject${selectedSubjectIds.size === 1 ? '' : 's'} selected`}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={addAll}
                className="h-7 text-[11px] font-medium text-muted-foreground hover:text-primary"
              >
                Select all
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={noSubjectsSelected}
                className="h-7 text-[11px] font-medium text-muted-foreground hover:text-destructive disabled:opacity-30"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Subject chips */}
          <div
            className="min-h-[80px] rounded-lg border border-dashed border-border bg-muted/20 p-4"
            data-testid="quiz-subject-palette"
          >
            {availableSubjects.length === 0 ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-28 animate-pulse rounded-full bg-muted/50 border border-border/50"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableSubjects.map((subject) => {
                  const isSelected = selectedSubjectIds.has(subject.node_id)
                  return (
                    <motion.button
                      key={subject.node_id}
                      layout
                      type="button"
                      data-testid="quiz-subject-option"
                      aria-pressed={isSelected}
                      onClick={() => toggleSubject(subject.node_id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150",
                        isSelected
                          ? "bg-primary text-white shadow-sm shadow-primary/20 ring-2 ring-primary/20"
                          : "bg-background border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      {isSelected ? (
                        <Check size={14} weight="bold" />
                      ) : (
                        <Plus size={14} />
                      )}
                      {subject.name}
                    </motion.button>
                  )
                })}
              </div>
            )}
            {noSubjectsSelected && availableSubjects.length > 0 && (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Select one or more subjects above to begin building your session.
              </p>
            )}
            {availableSubjects.length === 0 && !isModalOpen && (
              <div className="flex h-20 flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground">No subjects available for your discipline.</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            CONFIGURATION + START — Questions, timer, slide-to-start
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="border-t border-border bg-muted/20 px-6 py-5">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            {/* Configuration controls */}
            <div className="flex-1 space-y-5 sm:max-w-sm">
              <UnifiedSlider
                label="Questions"
                value={questionCount}
                min={10}
                max={100}
                step={5}
                unit=""
                onChange={setQuestionCount}
              />
              <UnifiedSlider
                label="Timer"
                value={timerMinutes}
                min={0}
                max={120}
                step={15}
                unit={timerMinutes === 0 ? 'OFF' : 'm'}
                onChange={setTimerMinutes}
                contextLine={
                  timerMinutes === 0
                    ? 'No time limit — answer at your own pace.'
                    : `Timer will count down from ${timerMinutes} minutes.`
                }
                contextLineType="info"
              />
            </div>

            {/* Slide-to-start */}
            <div className="flex-1 sm:max-w-xs">
              {error && (
                <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
                  {error}
                </div>
              )}

              <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                <TooltipTrigger asChild>
                  <div
                    className="w-full"
                    onClickCapture={(e) => {
                      if (noSubjectsSelected || isModalOpen) {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowTooltip(true)
                      }
                    }}
                  >
                    <SlideToSubmit
                      disabled={noSubjectsSelected || isModalOpen}
                      onSubmit={handleStart}
                      label="Slide to start quiz"
                      testId="quiz-start-slider"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-foreground text-white border-none px-4 py-2.5"
                >
                  <p className="text-xs font-medium">
                    {noSubjectsSelected
                      ? 'Select at least one subject to begin.'
                      : 'Configure your session and slide to start.'}
                  </p>
                </TooltipContent>
              </Tooltip>

              {noSubjectsSelected && (
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Select one or more subjects above to enable the quiz start.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Session Preparation Modal ── */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open && modalPhase === 'ready') {
            void handleCancelSession()
          }
        }}
      >
        <DialogContent showCloseButton={modalPhase === 'ready'} className="p-8">
          {modalPhase === 'preparing' && (
            <div className="flex flex-col items-center text-center">
              <DialogTitle className="sr-only">Preparing Your Quiz</DialogTitle>
              <DialogDescription className="sr-only">Building your personalized quiz queue</DialogDescription>
              <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
              <h3 className="mt-6 text-lg font-bold text-foreground" aria-hidden="true">
                Preparing Your Quiz
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Building your personalized question queue with intelligent routing...
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Routing questions
                </span>
              </div>
            </div>
          )}

          {modalPhase === 'ready' && (
            <div className="flex flex-col items-center text-center">
              <DialogTitle className="sr-only">Quiz Ready</DialogTitle>
              <DialogDescription className="sr-only">
                {readyQuestionCount} questions queued
              </DialogDescription>

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <ArrowRight size={16} weight="bold" className="text-white" />
                </div>
              </div>

              <h3 className="mt-6 text-lg font-bold text-foreground" aria-hidden="true">
                Quiz Ready
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {readyQuestionCount} questions across {selectedSubjectIds.size} subject{selectedSubjectIds.size === 1 ? '' : 's'}.
                {timerMinutes > 0 ? ` Timer set to ${timerMinutes} minutes.` : ' No time limit.'}
              </p>

              <div className="mt-8 flex w-full flex-col gap-3">
                <Button
                  data-testid="quiz-enter-session"
                  onClick={handleEnterSession}
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  size="lg"
                  disabled={isCancellingSession}
                >
                  <ArrowRight size={16} weight="bold" className="mr-2" />
                  Enter Quiz
                </Button>
                <Button
                  onClick={() => void handleCancelSession()}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  disabled={isCancellingSession}
                  loading={isCancellingSession}
                  loadingText="Canceling..."
                  aria-busy={isCancellingSession ? true : undefined}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
