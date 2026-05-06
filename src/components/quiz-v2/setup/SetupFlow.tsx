'use client'

import { useState } from 'react'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { IntroSlide1 } from './IntroSlide1'
import { IntroSlide2 } from './IntroSlide2'
import { IntroSlide3 } from './IntroSlide3'
import { PressureLevelSelector } from './PressureLevelSelector'
import { SimulationChecklist } from './SimulationChecklist'
import { MODE_LABELS, MODE_PRESETS, mergeWithPreset } from '@/lib/quiz/mode-presets'
import { getUnlockedPressureLevel, type PressureLevel } from '@/lib/quiz/pressure-config'
import type { QuizMode, QuizSessionConfig, TaxonomySubject } from '@/types/quiz-config'
import type { AdvancedConfig } from './IntroSlide3'

// ─── Slide count per mode ─────────────────────────────────────────────────────

const SLIDE_COUNT: Record<QuizMode, number> = {
  camp: 2,
  chill: 2,
  storm: 2,
  full_exam: 1,
  endurance: 2,
  subject: 2,
  focus_review: 2,
  custom: 3,
  article_review: 1,
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SetupFlowProps {
  mode: QuizMode
  subjects?: TaxonomySubject[]
  readinessScore?: number
  onBegin: (config: QuizSessionConfig) => void
  onBack?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

const SetupFlow = ({ mode, subjects, readinessScore = 0, onBegin, onBack }: SetupFlowProps) => {
  const slideCount = SLIDE_COUNT[mode]
  const [slideIndex, setSlideIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  // Accumulated config overrides
  const [questionCount, setQuestionCount] = useState(
    MODE_PRESETS[mode].setup.questionCount,
  )
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedConfig | null>(null)
  const [interleaveEnabled, setInterleaveEnabled] = useState(false)

  // Pressure level state (storm/full_exam modes)
  const hasPressureSelector = mode === 'storm' || mode === 'full_exam'
  const maxUnlocked = getUnlockedPressureLevel(readinessScore)
  const [pressureLevel, setPressureLevel] = useState<PressureLevel>(
    hasPressureSelector ? Math.min(maxUnlocked, (mode === 'full_exam' ? 3 : 2)) as PressureLevel : 0,
  )

  // Simulation checklist gate (full_exam at pressure level 3)
  const needsChecklist = mode === 'full_exam' && pressureLevel === 3
  const [checklistPassed, setChecklistPassed] = useState(false)

  // Interleaving only makes sense when specific topics are selected (otherwise there's nothing to interleave against)
  const showInterleaveToggle = (mode === 'camp' || mode === 'custom') && selectedTopics.length > 0

  // Crossfade transition helper
  const transitionTo = (nextIndex: number) => {
    setVisible(false)
    setTimeout(() => {
      setSlideIndex(nextIndex)
      setVisible(true)
    }, 150)
  }

  // ── Slide handlers ──────────────────────────────────────────────────────────

  /** Called from slide 1 "Begin" — either finishes or advances */
  const handleSlide1Begin = () => {
    if (slideCount === 1) {
      // For full_exam at pressure 3, require checklist before finalizing
      if (needsChecklist && !checklistPassed) {
        setChecklistPassed(false)
        transitionTo(1) // Show checklist as "slide 1"
        return
      }
      finalize(selectedTopics, null)
    } else {
      transitionTo(1)
    }
  }

  /** Called from simulation checklist "Start Simulation" */
  const handleChecklistReady = () => {
    setChecklistPassed(true)
    finalize(selectedTopics, null)
  }

  /** Called from slide 2 "Continue" */
  const handleSlide2Continue = (topics: string[]) => {
    setSelectedTopics(topics)
    if (slideCount === 2) {
      finalize(topics, null)
    } else {
      transitionTo(2)
    }
  }

  /** Called from slide 3 "Begin Session" */
  const handleSlide3Begin = (adv: AdvancedConfig) => {
    setAdvancedConfig(adv)
    finalize(selectedTopics, adv)
  }

  // ── Config assembly ─────────────────────────────────────────────────────────

  const finalize = (topics: string[], adv: AdvancedConfig | null) => {
    const overrides: Partial<QuizSessionConfig> = {
      setup: {
        ...MODE_PRESETS[mode].setup,
        questionCount,
        topics,
      },
    }

    if (adv) {
      overrides.timer = {
        ...MODE_PRESETS[mode].timer,
        enabled: adv.timer.enabled,
        visible: adv.timer.enabled,
        mode: adv.timer.mode,
        totalSeconds: adv.timer.enabled ? adv.timer.totalSeconds : null,
      }
      overrides.feedback = {
        ...MODE_PRESETS[mode].feedback,
        timing: adv.feedback.timing,
      }
      overrides.navigation = {
        ...MODE_PRESETS[mode].navigation,
        backAllowed: adv.navigation.backAllowed,
        questionPalette: adv.navigation.questionPalette,
      }
      overrides.setup = {
        ...overrides.setup!,
        difficultyMode: adv.setup.difficultyMode,
        initialDifficulty: adv.setup.initialDifficulty,
      }
    }

    // Interleave config — only when user has opted in
    if (showInterleaveToggle && interleaveEnabled) {
      overrides.interleave = true
      overrides.interleave_ratio = 0.3
    }

    // Pressure level — storm/full_exam modes
    if (hasPressureSelector) {
      overrides.pressure_level = pressureLevel
    }

    onBegin(mergeWithPreset(mode, overrides))
  }

  // ── Back navigation ─────────────────────────────────────────────────────────

  const handleBack = () => {
    if (slideIndex === 0) {
      onBack?.()
    } else {
      transitionTo(slideIndex - 1)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[560px] mx-auto px-4 py-8">
      {/* Back button */}
      {(slideIndex > 0 || onBack) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-6 h-auto gap-1.5 px-0 py-0 text-[13px] text-text-secondary hover:bg-transparent hover:text-primary focus-visible:underline"
          aria-label="Go back"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back
        </Button>
      )}

      {/* Mode heading */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-foreground">{MODE_LABELS[mode]}</h1>
        {slideCount > 1 && (
          <div className="flex items-center gap-1.5 mt-2" aria-label={`Step ${slideIndex + 1} of ${slideCount}`}>
            {Array.from({ length: slideCount }).map((_, i) => (
              <span
                key={i}
                className="h-1 rounded-full transition-all duration-150 ease-out"
                style={{
                  width: i === slideIndex ? '20px' : '6px',
                  backgroundColor: i === slideIndex ? 'var(--primary)' : 'var(--border)',
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>

      {/* Slide container with opacity crossfade */}
      <div
        className="transition-opacity duration-150 ease-out"
        style={{ opacity: visible ? 1 : 0 }}
        aria-live="polite"
        aria-atomic="true"
      >
        {slideIndex === 0 && (
          <div className="space-y-6">
            <IntroSlide1
              mode={mode}
              questionCount={questionCount}
              onCountChange={setQuestionCount}
              onBegin={handleSlide1Begin}
              showInterleaveToggle={showInterleaveToggle}
              interleaveEnabled={interleaveEnabled}
              onInterleaveChange={setInterleaveEnabled}
            />

            {/* Pressure level selector for storm/full_exam */}
            {hasPressureSelector && (
              <PressureLevelSelector
                currentRS={readinessScore}
                selected={pressureLevel}
                onChange={setPressureLevel}
              />
            )}
          </div>
        )}

        {/* Simulation checklist (full_exam + pressure 3) replaces slide 1 */}
        {slideIndex === 1 && needsChecklist && !checklistPassed && (
          <SimulationChecklist onReady={handleChecklistReady} />
        )}

        {/* Normal slide 1 for multi-slide modes (subject/focus_review/custom) */}
        {slideIndex === 1 && !(needsChecklist && !checklistPassed) && (
          <IntroSlide2
            mode={mode}
            subjects={subjects}
            onContinue={handleSlide2Continue}
          />
        )}

        {slideIndex === 2 && (
          <IntroSlide3
            initial={advancedConfig ?? undefined}
            onBegin={handleSlide3Begin}
          />
        )}
      </div>
    </div>
  )
}

SetupFlow.displayName = 'SetupFlow'

export { SetupFlow }
