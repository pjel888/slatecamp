'use client'

import { useState } from 'react'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { IntroSlide1 } from './IntroSlide1'
import { IntroSlide2 } from './IntroSlide2'
import { IntroSlide3 } from './IntroSlide3'
import { MODE_LABELS, MODE_PRESETS, mergeWithPreset } from '@/lib/quiz/mode-presets'
import type { QuizMode, QuizSessionConfig, TaxonomySubject } from '@/types/quiz-config'
import type { AdvancedConfig } from './IntroSlide3'

// ─── Slide count per mode ─────────────────────────────────────────────────────

const SLIDE_COUNT: Record<QuizMode, number> = {
  camp: 1,
  chill: 1,
  storm: 1,
  fullexam: 1,
  extended: 1,
  subject: 2,
  focused: 2,
  custom: 3,
  article_review: 1,
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SetupFlowProps {
  mode: QuizMode
  subjects?: TaxonomySubject[]
  onBegin: (config: QuizSessionConfig) => void
  onBack?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

const SetupFlow = ({ mode, subjects, onBegin, onBack }: SetupFlowProps) => {
  const slideCount = SLIDE_COUNT[mode]
  const [slideIndex, setSlideIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  // Accumulated config overrides
  const [questionCount, setQuestionCount] = useState(
    MODE_PRESETS[mode].setup.questionCount,
  )
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedConfig | null>(null)

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
      finalize(selectedTopics, null)
    } else {
      transitionTo(1)
    }
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
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-[13px] text-[#4A5568] hover:text-[#1B3FC4] transition-colors duration-150 ease-out mb-6 focus-visible:outline-none focus-visible:underline"
          aria-label="Go back"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back
        </button>
      )}

      {/* Mode heading */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#1A2332]">{MODE_LABELS[mode]}</h1>
        {slideCount > 1 && (
          <div className="flex items-center gap-1.5 mt-2" aria-label={`Step ${slideIndex + 1} of ${slideCount}`}>
            {Array.from({ length: slideCount }).map((_, i) => (
              <span
                key={i}
                className="h-1 rounded-full transition-all duration-150 ease-out"
                style={{
                  width: i === slideIndex ? '20px' : '6px',
                  backgroundColor: i === slideIndex ? '#1B3FC4' : '#D4DAE3',
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
          <IntroSlide1
            mode={mode}
            questionCount={questionCount}
            onCountChange={setQuestionCount}
            onBegin={handleSlide1Begin}
          />
        )}

        {slideIndex === 1 && (
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
