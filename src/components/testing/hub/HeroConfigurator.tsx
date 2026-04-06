'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash, Info, Layout, MagicWand } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { getCoreSubjects } from '@/lib/actions/taxonomy'
import { startSession } from '@/lib/actions/quiz-v2'
import { useRouter } from 'next/navigation'
import { SlideToSubmit } from '@/components/quiz-v2/SlideToSubmit'
import { UnifiedSlider } from '@/components/ui/unified-slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

interface Subject {
  node_id: string
  name: string
  subject_area: string
}

interface HeroConfiguratorProps {
  initialSubjects?: Subject[]
}

export const HeroConfigurator = ({ initialSubjects }: HeroConfiguratorProps) => {
  const router = useRouter()
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>(initialSubjects ?? [])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(new Set())
  const [questionCount, setQuestionCount] = useState(50)
  const [timerMinutes, setTimerMinutes] = useState(0) // 0 = Off
  const [isLoading, setIsLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Fetch subjects on mount if not provided
  useEffect(() => {
    if (!initialSubjects) {
      getCoreSubjects().then(setAvailableSubjects)
    }
  }, [initialSubjects])

  const selectedSubjects = useMemo(() => 
    availableSubjects.filter(s => selectedSubjectIds.has(s.node_id)),
    [availableSubjects, selectedSubjectIds]
  )

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addAll = () => {
    setSelectedSubjectIds(new Set(availableSubjects.map(s => s.node_id)))
  }

  const clearAll = () => {
    setSelectedSubjectIds(new Set())
  }

  const handleStart = async () => {
    if (selectedSubjectIds.size === 0) {
      setShowTooltip(true)
      return
    }

    setIsLoading(true)
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

      if (result.sessionId) {
        router.push(`/quiz/custom/session/${result.sessionId}`)
      }
    } catch (error) {
      console.error('Failed to start session:', error)
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="relative overflow-hidden rounded-xl border border-border bg-white p-6 shadow-sm">
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
                <div className="flex h-20 items-center justify-center">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
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
              {selectedSubjectIds.size === 0 && (
                <p className="mt-4 text-center text-xs text-muted-foreground italic">
                  Select subjects from your discipline to begin building your session.
                </p>
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

            {/* Slide to Start CTA */}
            <div className="mt-8">
              <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                <TooltipTrigger asChild>
                  <div 
                    className="w-full"
                    onClickCapture={(e) => {
                      if (selectedSubjectIds.size === 0 || isLoading) {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowTooltip(true)
                      }
                    }}
                  >
                    <SlideToSubmit 
                      disabled={selectedSubjectIds.size === 0 || isLoading}
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

        {/* Global Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
            >
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm font-bold text-primary animate-pulse tracking-widest uppercase">
                Initializing Intelligent Queue...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
