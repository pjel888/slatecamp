'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Trash, Info, Layout, MagicWand, ArrowRight } from '@phosphor-icons/react'
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
          setError('No questions found for your selection. Try adding more subjects.')
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
      router.push(ROUTES.quiz.session('custom', readySessionId))
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

  return (
    <TooltipProvider>
      <div className="relative overflow-hidden rounded-md border border-border bg-card p-6 shadow-sm">
        {/* Subtle Background Pattern */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 opacity-[0.03]">
          <MagicWand size={320} weight="fill" />
        </div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left Column: Subject Selection */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout size={20} weight="bold" className="text-primary" />
                <h3 className="text-lg font-bold text-foreground">Canvas</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addAll}
                  className="h-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
                >
                  Add All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-accent"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Subject Drop Zone / Palette */}
            <div className="min-h-[120px] rounded-lg border-2 border-dashed border-muted bg-muted/20 p-4">
              {availableSubjects.length === 0 ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-9 w-32 animate-pulse rounded-full bg-muted/50 border border-border/50"
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
                        onClick={() => toggleSubject(subject.node_id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                          isSelected
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "bg-background border border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                        )}
                      >
                        {isSelected ? <Trash size={14} /> : <Plus size={14} />}
                        {subject.name}
                      </motion.button>
                    )
                  })}
                </div>
              )}
              {selectedSubjectIds.size === 0 && availableSubjects.length > 0 && (
                <p className="mt-4 text-center text-xs text-muted-foreground italic">
                  Select subjects from your discipline to begin building your session.
                </p>
              )}
              {availableSubjects.length === 0 && !isModalOpen && (
                <div className="flex h-20 flex-col items-center justify-center">
                  <p className="text-xs text-muted-foreground">No subjects found for your discipline.</p>
                </div>
              )}
            </div>

            {/* Dynamic Status Label */}
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Info size={16} />
              {selectedSubjectIds.size === 0
                ? "Pedagogical routing ready."
                : `Targeting ${selectedSubjectIds.size} subject${selectedSubjectIds.size === 1 ? '' : 's'} with 60/30/10 logic.`}
            </div>
          </div>

          {/* Right Column: Configuration Sliders */}
          <div className="flex flex-col justify-between rounded-lg bg-muted/30 p-6">
            <div className="space-y-8">
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
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Slide to Start CTA */}
            <div className="mt-8">
              <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                <TooltipTrigger asChild>
                  <div
                    className="w-full"
                    onClickCapture={(e) => {
                      if (selectedSubjectIds.size === 0 || isModalOpen) {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowTooltip(true)
                      }
                    }}
                  >
                    <SlideToSubmit
                      disabled={selectedSubjectIds.size === 0 || isModalOpen}
                      onSubmit={handleStart}
                      label="Slide to start session"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-accent text-white border-none px-4 py-2"
                >
                  <p className="text-xs font-bold">Please select at least one subject to begin.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* ── Session Preparation Modal (Dialog with focus trap, Escape, ARIA) ── */}
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
              <DialogTitle className="sr-only">Preparing Your Session</DialogTitle>
              <DialogDescription className="sr-only">Building your personalized question queue</DialogDescription>
              <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
              <h3 className="mt-6 text-lg font-bold text-foreground" aria-hidden="true">
                Preparing Your Session
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Building your personalized question queue with 60/30/10 intelligent routing...
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
              <DialogTitle className="sr-only">Session Ready</DialogTitle>
              <DialogDescription className="sr-only">
                {readyQuestionCount} questions queued
              </DialogDescription>

              {/* Success indicator */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <ArrowRight size={16} weight="bold" className="text-white" />
                </div>
              </div>

              <h3 className="mt-6 text-lg font-bold text-foreground" aria-hidden="true">
                Session Ready
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {readyQuestionCount} questions queued across {selectedSubjectIds.size} subject{selectedSubjectIds.size === 1 ? '' : 's'}.
                {timerMinutes > 0 ? ` Timer set to ${timerMinutes} minutes.` : ' No time limit.'}
              </p>

              <div className="mt-8 flex w-full flex-col gap-3">
                <Button
                  onClick={handleEnterSession}
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  size="lg"
                  disabled={isCancellingSession}
                >
                  <ArrowRight size={16} weight="bold" className="mr-2" />
                  Enter Session
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
