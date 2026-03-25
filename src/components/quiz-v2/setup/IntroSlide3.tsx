'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DifficultyInit, DifficultyMode, FeedbackTiming, TimerMode } from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdvancedConfig {
  timer: {
    enabled: boolean
    totalSeconds: number
    mode: TimerMode
  }
  feedback: {
    timing: FeedbackTiming
  }
  navigation: {
    backAllowed: boolean
    questionPalette: boolean
  }
  setup: {
    difficultyMode: DifficultyMode
    initialDifficulty: DifficultyInit
  }
}

// ─── Difficulty pills ─────────────────────────────────────────────────────────

type DifficultyPill = { value: DifficultyInit | 'adaptive'; label: string }

const DIFFICULTY_PILLS: DifficultyPill[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'adaptive', label: 'Adaptive' },
]

// ─── Presets ──────────────────────────────────────────────────────────────────

type Preset = 'quick-easy' | 'exam-sim' | 'deep-study'

const PRESETS: Record<Preset, Partial<AdvancedConfig>> = {
  'quick-easy': {
    timer: { enabled: false, totalSeconds: 0, mode: 'hidden' },
    feedback: { timing: 'immediate' },
    navigation: { backAllowed: true, questionPalette: false },
    setup: { difficultyMode: 'static', initialDifficulty: 'easy' },
  },
  'exam-sim': {
    timer: { enabled: true, totalSeconds: 3600, mode: 'countdown' },
    feedback: { timing: 'deferred' },
    navigation: { backAllowed: true, questionPalette: true },
    setup: { difficultyMode: 'static', initialDifficulty: 'mixed' },
  },
  'deep-study': {
    timer: { enabled: false, totalSeconds: 0, mode: 'hidden' },
    feedback: { timing: 'immediate' },
    navigation: { backAllowed: true, questionPalette: true },
    setup: { difficultyMode: 'adaptive', initialDifficulty: 'mixed' },
  },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}

const ToggleRow = ({ label, description, checked, onChange }: ToggleRowProps) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-[#D4DAE3] last:border-0">
    <div className="min-w-0">
      <p className="text-[13px] font-medium text-[#1A2332]">{label}</p>
      {description && <p className="text-[12px] text-[#8896A7] mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full',
        'border-2 border-transparent transition-colors duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/30 focus-visible:ring-offset-2',
        checked ? 'bg-[#1B3FC4]' : 'bg-[#D4DAE3]',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-150 ease-out',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
        aria-hidden="true"
      />
    </button>
  </div>
)

interface SegmentProps {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}

const SegmentedControl = ({ value, options, onChange }: SegmentProps) => (
  <div className="flex rounded-sm border border-[#D4DAE3] bg-[#F8F7F5] p-0.5 gap-0.5" role="group">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        aria-pressed={value === opt.value}
        className={cn(
          'flex-1 px-3 py-1.5 text-[12px] font-medium rounded-[3px] transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/30',
          value === opt.value
            ? 'bg-white text-[#1B3FC4] shadow-sm'
            : 'text-[#4A5568] hover:text-[#1A2332]',
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

// ─── IntroSlide3 ──────────────────────────────────────────────────────────────

interface IntroSlide3Props {
  initial?: Partial<AdvancedConfig>
  onBegin: (config: AdvancedConfig) => void
}

const DEFAULT: AdvancedConfig = {
  timer: { enabled: false, totalSeconds: 1800, mode: 'countdown' },
  feedback: { timing: 'immediate' },
  navigation: { backAllowed: true, questionPalette: true },
  setup: { difficultyMode: 'user-selected', initialDifficulty: 'mixed' },
}

const IntroSlide3 = ({ initial, onBegin }: IntroSlide3Props) => {
  const [config, setConfig] = useState<AdvancedConfig>({ ...DEFAULT, ...initial })
  const [activePreset, setActivePreset] = useState<Preset | null>(null)

  const patch = (partial: Partial<AdvancedConfig>) => {
    setConfig((prev) => ({
      ...prev,
      timer: { ...prev.timer, ...partial.timer },
      feedback: { ...prev.feedback, ...partial.feedback },
      navigation: { ...prev.navigation, ...partial.navigation },
      setup: { ...prev.setup, ...partial.setup },
    }))
    setActivePreset(null)
  }

  const applyPreset = (key: Preset) => {
    setConfig((prev) => {
      const p = PRESETS[key]
      return {
        timer: { ...prev.timer, ...p.timer },
        feedback: { ...prev.feedback, ...p.feedback },
        navigation: { ...prev.navigation, ...p.navigation },
        setup: { ...prev.setup, ...p.setup },
      }
    })
    setActivePreset(key)
  }

  const difficultyValue: string =
    config.setup.difficultyMode === 'adaptive' ? 'adaptive' : config.setup.initialDifficulty

  const setDifficulty = (v: string) => {
    if (v === 'adaptive') {
      patch({ setup: { difficultyMode: 'adaptive', initialDifficulty: 'mixed' } })
    } else {
      patch({ setup: { difficultyMode: 'user-selected', initialDifficulty: v as DifficultyInit } })
    }
  }

  const TIMER_DURATION_OPTIONS = [
    { value: '900', label: '15 min' },
    { value: '1800', label: '30 min' },
    { value: '2700', label: '45 min' },
    { value: '3600', label: '60 min' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-[12px] font-medium uppercase tracking-wide text-[#8896A7] mb-1">
          Step 3 — Advanced Config
        </p>
        <h2 className="text-[17px] font-semibold text-[#1A2332]">Customise your session</h2>
      </div>

      {/* Preset shortcuts */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#8896A7] mb-2">
          Quick presets
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'quick-easy' as Preset, label: 'Quick & Easy' },
              { key: 'exam-sim' as Preset, label: 'Exam Simulation' },
              { key: 'deep-study' as Preset, label: 'Deep Study' },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className={cn(
                'px-3 py-1.5 rounded-sm text-[12px] font-medium border transition-all duration-150 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/30',
                activePreset === key
                  ? 'bg-[#EEF2FC] border-[#1B3FC4] text-[#1B3FC4]'
                  : 'bg-white border-[#D4DAE3] text-[#4A5568] hover:border-[#1B3FC4]/40',
              )}
              aria-pressed={activePreset === key}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle rows */}
      <div className="rounded-md border border-[#D4DAE3] bg-white px-4">
        <ToggleRow
          label="Timer"
          description={config.timer.enabled ? 'Countdown enabled' : 'No timer'}
          checked={config.timer.enabled}
          onChange={(v) => patch({ timer: { ...config.timer, enabled: v } })}
        />
        {config.timer.enabled && (
          <div className="pb-3">
            <SegmentedControl
              value={String(config.timer.totalSeconds)}
              options={TIMER_DURATION_OPTIONS}
              onChange={(v) => patch({ timer: { ...config.timer, totalSeconds: Number(v) } })}
            />
          </div>
        )}
        <ToggleRow
          label="Back navigation"
          description="Allow returning to previous questions"
          checked={config.navigation.backAllowed}
          onChange={(v) => patch({ navigation: { ...config.navigation, backAllowed: v } })}
        />
        <ToggleRow
          label="Question palette"
          description="Overview panel showing all question statuses"
          checked={config.navigation.questionPalette}
          onChange={(v) => patch({ navigation: { ...config.navigation, questionPalette: v } })}
        />
      </div>

      {/* Feedback timing */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#8896A7] mb-2">
          Feedback timing
        </p>
        <SegmentedControl
          value={config.feedback.timing}
          options={[
            { value: 'immediate', label: 'Immediate' },
            { value: 'deferred', label: 'Deferred' },
          ]}
          onChange={(v) => patch({ feedback: { timing: v as FeedbackTiming } })}
        />
      </div>

      {/* Difficulty */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#8896A7] mb-2">
          Difficulty
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Difficulty">
          {DIFFICULTY_PILLS.map((pill) => {
            const isSelected = difficultyValue === pill.value
            return (
              <button
                key={pill.value}
                type="button"
                onClick={() => setDifficulty(pill.value)}
                aria-pressed={isSelected}
                className={cn(
                  'px-3 py-1.5 rounded-sm text-[12px] font-medium border transition-all duration-150 ease-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/30',
                  isSelected
                    ? 'bg-[#1B3FC4] text-white border-[#1B3FC4]'
                    : 'bg-white text-[#4A5568] border-[#D4DAE3] hover:border-[#1B3FC4]/40',
                )}
              >
                {pill.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Save as preset (future hook) */}
      <button
        type="button"
        className="text-[12px] text-[#1B3FC4] hover:text-[#1535A8] transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
        aria-label="Save current configuration as a preset (coming soon)"
        disabled
      >
        Save as preset
      </button>

      {/* Begin */}
      <Button variant="default" size="lg" fullWidth onClick={() => onBegin(config)} className="rounded-sm">
        Begin Session
      </Button>
    </div>
  )
}

IntroSlide3.displayName = 'IntroSlide3'

export { IntroSlide3 }
export type { AdvancedConfig as CustomAdvancedConfig }
