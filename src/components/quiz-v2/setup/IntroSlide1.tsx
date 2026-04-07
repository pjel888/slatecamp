'use client'

import {
  Book,
  Leaf,
  Crosshair,
  MagnifyingGlass,
  GearSix,
  Lightning,
  Shield,
  Barbell,
  Warning,
  Info,
} from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { QuestionCountPills } from './QuestionCountPills'
import { MODE_LABELS } from '@/lib/quiz/mode-presets'
import type { QuizMode } from '@/types/quiz-config'

// ─── Icon map ─────────────────────────────────────────────────────────────────

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties; 'aria-hidden'?: boolean | 'true' | 'false' }>

const MODE_ICONS: Record<QuizMode, IconComponent> = {
  camp: ({ className, ...p }) => <Book className={className} {...p} />,
  chill: ({ className, ...p }) => <Leaf className={className} {...p} />,
  subject: ({ className, ...p }) => <MagnifyingGlass className={className} {...p} />,
  focused: ({ className, ...p }) => <Crosshair className={className} {...p} />,
  custom: ({ className, ...p }) => <GearSix className={className} {...p} />,
  storm: ({ className, ...p }) => <Lightning className={className} {...p} />,
  fullexam: ({ className, ...p }) => <Shield className={className} {...p} />,
  extended: ({ className, ...p }) => <Barbell className={className} {...p} />,
  article_review: ({ className, ...p }) => <Book className={className} {...p} />,
}

// ─── Session summaries ────────────────────────────────────────────────────────

const MODE_SUMMARY: Record<QuizMode, string> = {
  camp: 'Adaptive difficulty · Instant feedback',
  chill: 'No timer · Skip freely · Instant feedback',
  subject: 'Deep-dive into a subject · Adaptive difficulty',
  focused: 'Target your developing skills · Adaptive difficulty',
  custom: 'Fully configurable session',
  storm: 'Exam conditions · No feedback during session',
  fullexam: '200 questions · 4 hours · Results in 24 hours',
  extended: 'Build stamina · Count-up timer · Brief feedback',
  article_review: 'Quick review from wiki article',
}

// Zone 3 modes use Camp Orange accent
const isZone3 = (mode: QuizMode) => mode === 'fullexam' || mode === 'extended'

// ─── Props ────────────────────────────────────────────────────────────────────

interface IntroSlide1Props {
  mode: QuizMode
  questionCount: number
  onCountChange: (count: number) => void
  onBegin: () => void
  showInterleaveToggle?: boolean
  interleaveEnabled?: boolean
  onInterleaveChange?: (enabled: boolean) => void
}

// ─── Per-mode question count options ─────────────────────────────────────────

const COUNT_OPTIONS: Partial<Record<QuizMode, number[]>> = {
  storm: [50, 100],
  fullexam: [200],
  extended: [30, 50, 100],
}

const getCountOptions = (mode: QuizMode): number[] =>
  COUNT_OPTIONS[mode] ?? [10, 20, 30, 50, 100]

// ─── Component ────────────────────────────────────────────────────────────────

const IntroSlide1 = ({
  mode,
  questionCount,
  onCountChange,
  onBegin,
  showInterleaveToggle = false,
  interleaveEnabled = false,
  onInterleaveChange,
}: IntroSlide1Props) => {
  const Icon = MODE_ICONS[mode]
  const accent = isZone3(mode) ? 'var(--camp-orange)' : 'var(--primary)'
  const iconBg = isZone3(mode) ? 'color-mix(in srgb, var(--camp-orange) 10%, transparent)' : 'var(--primary-50)'
  const countOptions = getCountOptions(mode)

  // Only hide count stepper for Full Exam (fixed at 200)
  const hideCountStepper = mode === 'fullexam'

  return (
    <div className="space-y-6">
      {/* Mode identity */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: iconBg }}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" style={{ color: accent } as React.CSSProperties} aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
            {MODE_LABELS[mode]}
          </p>
          <p className="text-[13px] text-text-secondary">{MODE_SUMMARY[mode]}</p>
        </div>
      </div>

      {/* Storm warning */}
      {mode === 'storm' && (
        <div className="flex gap-2.5 rounded-md bg-warning-50 border border-warning/30 px-4 py-3">
          <Warning
            className="h-4 w-4 shrink-0 mt-0.5 text-warning"
            aria-hidden="true"
            weight="fill"
          />
          <div>
            <p className="text-[13px] font-medium text-foreground mb-0.5">
              No feedback during session
            </p>
            <p className="text-[13px] text-text-secondary">
              Timer starts immediately. You will not see correct answers until the session ends.
            </p>
          </div>
        </div>
      )}

      {/* Full Exam briefing */}
      {mode === 'fullexam' && (
        <div className="flex gap-2.5 rounded-md bg-primary-50 border border-primary/20 px-4 py-3">
          <Info
            className="h-4 w-4 shrink-0 mt-0.5 text-primary"
            aria-hidden="true"
            weight="fill"
          />
          <div>
            <p className="text-[13px] font-medium text-foreground mb-0.5">Exam conditions apply</p>
            <p className="text-[13px] text-text-secondary">
              200 questions · 4-hour countdown · Free navigation. Correct answers and explanations
              are available 24 hours after submission.
            </p>
          </div>
        </div>
      )}

      {/* Question count stepper */}
      {!hideCountStepper && (
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground mb-2.5">
            How many questions?
          </p>
          <QuestionCountPills
            selected={questionCount}
            onChange={onCountChange}
            options={countOptions}
          />
        </div>
      )}

      {/* Interleave toggle — camp & custom modes only */}
      {showInterleaveToggle && (
        <label
          htmlFor="interleave-toggle"
          className="flex items-start gap-3 rounded-md border border-border px-4 py-3 cursor-pointer transition-colors duration-150 ease-out hover:border-primary/40"
          style={interleaveEnabled ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-50)' } : undefined}
        >
          <input
            id="interleave-toggle"
            type="checkbox"
            role="switch"
            checked={interleaveEnabled}
            onChange={(e) => onInterleaveChange?.(e.target.checked)}
            className="sr-only peer"
            aria-describedby="interleave-description"
          />
          {/* Custom toggle track */}
          <span
            className="relative mt-0.5 flex h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ease-out"
            style={{ backgroundColor: interleaveEnabled ? 'var(--primary)' : 'var(--border)' }}
            aria-hidden="true"
          >
            <span
              className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-150 ease-out"
              style={{ transform: interleaveEnabled ? 'translateX(16px)' : 'translateX(0)' }}
            />
          </span>
          <span>
            <span className="text-[13px] font-medium text-foreground block">
              Shuffle in similar topics
            </span>
            <span
              id="interleave-description"
              className="text-[12px] text-muted-foreground block mt-0.5"
            >
              Mixes in questions from similar subjects so you practice telling them apart
            </span>
          </span>
        </label>
      )}

      {/* Begin button */}
      <Button
        variant="default"
        size="lg"
        fullWidth
        onClick={onBegin}
        className="rounded-sm"
        style={
          isZone3(mode)
            ? ({ '--tw-bg-opacity': 1, backgroundColor: '#E8853A' } as React.CSSProperties)
            : undefined
        }
      >
        {mode === 'storm'
          ? `Start ${questionCount}-question Storm`
          : mode === 'fullexam'
            ? 'Begin Full Exam'
            : mode === 'subject' || mode === 'focused'
              ? 'Begin Session'
              : `Begin ${questionCount}-question Session`}
      </Button>
    </div>
  )
}

IntroSlide1.displayName = 'IntroSlide1'

export { IntroSlide1 }
