'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  Books,
  ChartBar,
  CheckCircle,
  Clock,
  Fire,
  Gauge,
  Lightning,
  Lightbulb,
  Lock,
  Play,
  Target,
  Timer,
} from '@phosphor-icons/react'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { QuizComposer } from './QuizComposer'
import type {
  SRActiveCycle,
  SRDueCycle,
  SRProgressSummary,
} from '@/lib/actions/quiz-v2/successive-relearning'
import type { ViewerEntitlements } from '@/lib/entitlements/types'
import type { DesignScenario } from '@/lib/design-scenarios'
import type { QuizSessionConfig } from '@/types/quiz-config'
import { startSession } from '@/lib/actions/quiz-v2'
import { mergeWithPreset } from '@/lib/quiz/mode-presets'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RawSession {
  session_id: string
  test_mode: string
  config: {
    mode?: string
    source?: string
    isProofSimulation?: boolean
    isEnduranceSession?: boolean
    isBlindspotSession?: boolean
    articleSlug?: string
  } | null
  status: string
  question_ids: string[] | null
  started_at: string
  completed_at: string | null
  current_question_index: number
  updated_at: string
  accuracy?: number | null
}

interface RawFocusReviewQueue {
  queue_id: string
  node_ids: string[]
  question_count: number
  status: string
  pre_queue_mastery: number | null
}

interface RawWeakNode {
  topic_id: string
  current_mastery_weight: number
  taxonomy_tree: {
    name: string
    subject_area: string | null
  } | null
}

interface CoreSubject {
  node_id: string
  name: string
  subject_area: string
}

interface ReviewHubProps {
  viewerEntitlements: Pick<
    ViewerEntitlements,
    'effectiveTier' | 'tooling' | 'traceId' | 'normalizedRole'
  >
  readinessScore: number
  lastStudyDate: string | null
  completedSessions: RawSession[]
  inProgressSession: RawSession | null
  focusReviewQueues: RawFocusReviewQueue[]
  targetExamDate: string | null
  weakNodes: RawWeakNode[]
  coreSubjects?: CoreSubject[]
  designScenarios?: DesignScenario[]
  srActiveCycles?: SRActiveCycle[]
  srDueCycles?: SRDueCycle[]
  srProgress?: SRProgressSummary
}

type QuizModeSlug = 'slatecamp' | 'design' | 'endurance'
type ModeAccent = 'blue' | 'purple' | 'orange'

const QUIZ_MODES: Array<{
  id: QuizModeSlug
  title: string
  description: string
  cta: string
  meta: string
  accent: ModeAccent
  icon: typeof Target
}> = [
  {
    id: 'slatecamp',
    title: 'SlateCamp Quiz',
    description: 'Focused practice by subject, question count, and timing.',
    cta: 'Build quiz',
    meta: 'Subject-based builder',
    accent: 'blue',
    icon: Target,
  },
  {
    id: 'design',
    title: 'Design Quiz',
    description: 'Scenario-based design practice with project briefs and solution review.',
    cta: 'Open design quiz',
    meta: 'Area C scenarios',
    accent: 'purple',
    icon: Lightbulb,
  },
  {
    id: 'endurance',
    title: 'Endurance Quiz',
    description: 'Long-form exam stamina training with extended question sets.',
    cta: 'Start endurance setup',
    meta: '30, 50, or 100 questions',
    accent: 'orange',
    icon: Fire,
  },
]

const ENDURANCE_COUNT_OPTIONS = [30, 50, 100] as const

type EnduranceCount = (typeof ENDURANCE_COUNT_OPTIONS)[number]

const getSessionHref = (session: RawSession): string =>
  session.status === 'completed'
    ? ROUTES.quiz.results(session.session_id)
    : ROUTES.quiz.session(session.session_id)

const getRelativeDayLabel = (date: string | null): string => {
  if (!date) return ''
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

const getModeLabel = (mode?: string): string => {
  const labels: Record<string, string> = {
    custom: 'SlateCamp Quiz',
    camp: 'Camp',
    chill: 'Chill',
    storm: 'Storm',
    full_exam: 'Full Exam',
    endurance: 'Endurance',
    focus_review: 'Focus Review',
    subject: 'Subject',
    article_review: 'Article Review',
  }
  return labels[mode ?? ''] ?? 'Quiz'
}

const isQuizModeSlug = (mode: string | null): mode is QuizModeSlug =>
  mode === 'slatecamp' || mode === 'design' || mode === 'endurance'

const modeAccentClasses: Record<ModeAccent, {
  ring: string
  icon: string
  bg: string
  text: string
  border: string
}> = {
  blue: {
    ring: 'hover:border-primary/40 hover:shadow-primary/10',
    icon: 'bg-primary-50 text-primary',
    bg: 'bg-primary-50/70',
    text: 'text-primary',
    border: 'border-primary/30',
  },
  purple: {
    ring: 'hover:border-purple-300 hover:shadow-purple-100',
    icon: 'bg-purple-50 text-purple-700',
    bg: 'bg-purple-50/70',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  orange: {
    ring: 'hover:border-amber-300 hover:shadow-amber-100',
    icon: 'bg-amber-50 text-amber-700',
    bg: 'bg-amber-50/70',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
}

const ReviewHub = ({
  viewerEntitlements,
  readinessScore,
  lastStudyDate,
  completedSessions,
  inProgressSession,
  focusReviewQueues,
  targetExamDate,
  weakNodes,
  coreSubjects = [],
  designScenarios = [],
  srActiveCycles: _srActiveCycles = [],
  srDueCycles = [],
  srProgress = { active: 0, spacing: 0, durable: 0, reset: 0, total: 0 },
}: ReviewHubProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentMode = searchParams.get('mode')
  const openMode = isQuizModeSlug(currentMode) ? currentMode : null
  const { effectiveTier } = viewerEntitlements
  const enduranceLocked = effectiveTier === 'free'

  const resumeHref = useMemo(
    () => (inProgressSession ? getSessionHref(inProgressSession) : null),
    [inProgressSession],
  )

  const focusQueue = focusReviewQueues[0] ?? null
  const currentQuestion = inProgressSession
    ? Math.min(
        (inProgressSession.current_question_index ?? 0) + 1,
        Math.max(1, inProgressSession.question_ids?.length ?? 1),
      )
    : 0
  const totalQuestions = inProgressSession?.question_ids?.length ?? 0
  const modeName = getModeLabel(inProgressSession?.config?.mode)
  const recentActivity = completedSessions.length > 0
    ? `${completedSessions.length} completed session${completedSessions.length === 1 ? '' : 's'}`
    : 'No completed sessions yet'
  const readinessLabel = readinessScore >= 75 ? 'Exam-ready' : readinessScore >= 50 ? 'Building' : 'Needs reps'
  const weakTopics = weakNodes.slice(0, 3)

  const openModal = useCallback(
    (mode: QuizModeSlug) => {
      const nextParams = new URLSearchParams(searchParams.toString())
      nextParams.set('mode', mode)
      router.push(`${pathname}?${nextParams.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const closeModal = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete('mode')
    const query = nextParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-1 py-1 sm:px-2">
        <QuizPageHeader />

        {inProgressSession && resumeHref && (
          <ActiveSessionBanner
            href={resumeHref}
            modeName={modeName}
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            startedLabel={getRelativeDayLabel(inProgressSession.started_at)}
          />
        )}

        <section aria-labelledby="quiz-mode-heading" className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Practice</p>
              <h2 id="quiz-mode-heading" className="mt-1 text-xl font-extrabold text-foreground font-[family-name:var(--font-display)]">
                Choose a quiz mode
              </h2>
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Setup opens after you choose a practice intent.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {QUIZ_MODES.map((mode) => (
              <QuizModeCard
                key={mode.id}
                mode={mode}
                locked={mode.id === 'endurance' && enduranceLocked}
                onOpen={() => openModal(mode.id)}
              />
            ))}
          </div>
        </section>

        <QuizInsightsPanel
          readinessScore={readinessScore}
          readinessLabel={readinessLabel}
          lastStudyDate={lastStudyDate}
          recentActivity={recentActivity}
          weakTopics={weakTopics}
          srDueCount={srDueCycles.length}
          srTotal={srProgress.total}
          focusQueueCount={focusQueue?.question_count ?? 0}
          targetExamDate={targetExamDate}
        />
      </div>

      <QuizSetupModalController
        openMode={openMode}
        onClose={closeModal}
        coreSubjects={coreSubjects}
        designScenarios={designScenarios}
        enduranceLocked={enduranceLocked}
      />
    </div>
  )
}

ReviewHub.displayName = 'ReviewHub'

export { ReviewHub }

const QuizPageHeader = () => (
  <header className="flex flex-col gap-1">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Practice</p>
    <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-[family-name:var(--font-display)]">
      Quiz
    </h1>
    <p className="max-w-2xl text-sm text-muted-foreground">
      Choose how you want to practice today.
    </p>
  </header>
)

const ActiveSessionBanner = ({
  href,
  modeName,
  currentQuestion,
  totalQuestions,
  startedLabel,
}: {
  href: string
  modeName: string
  currentQuestion: number
  totalQuestions: number
  startedLabel: string
}) => (
  <section className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary-50 px-4 py-3 shadow-sm" aria-label="Resume active quiz session">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
      <Play size={18} weight="fill" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-foreground">Resume your last session</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {modeName} · Q{currentQuestion}/{totalQuestions || '—'}{startedLabel ? ` · Started ${startedLabel}` : ''}
      </p>
    </div>
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      Resume
      <ArrowRight size={13} weight="bold" />
    </Link>
  </section>
)

const QuizModeCard = ({
  mode,
  locked,
  onOpen,
}: {
  mode: (typeof QUIZ_MODES)[number]
  locked: boolean
  onOpen: () => void
}) => {
  const accent = modeAccentClasses[mode.accent]
  const Icon = locked ? Lock : mode.icon

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group flex min-h-[230px] flex-col rounded-2xl border bg-card p-5 text-left shadow-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        locked
          ? 'border-dashed border-border bg-muted/20 hover:border-primary/25 hover:bg-muted/30'
          : `cursor-pointer border-border hover:-translate-y-0.5 hover:shadow-md ${accent.ring}`,
        mode.id === 'slatecamp' && !locked && 'border-primary/25 shadow-primary/5',
      )}
      aria-label={locked ? `${mode.title} is locked` : mode.cta}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl', locked ? 'bg-muted text-muted-foreground' : accent.icon)}>
          <Icon size={23} weight="fill" />
        </span>
        {!locked && (
          <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-bold', accent.bg, accent.border, accent.text)}>
            {mode.meta}
          </span>
        )}
      </div>
      <div className="mt-5 flex-1">
        <h3 className="text-lg font-extrabold text-foreground font-[family-name:var(--font-display)]">
          {mode.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {locked ? 'Pro required for exam-stamina sessions.' : mode.description}
        </p>
      </div>
      <span className={cn('mt-5 inline-flex items-center gap-2 text-sm font-bold', locked ? 'text-muted-foreground' : accent.text)}>
        {locked ? 'Upgrade required' : mode.cta}
        <ArrowRight size={15} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  )
}

const QuizInsightsPanel = ({
  readinessScore,
  readinessLabel,
  lastStudyDate,
  recentActivity,
  weakTopics,
  srDueCount,
  srTotal,
  focusQueueCount,
  targetExamDate,
}: {
  readinessScore: number
  readinessLabel: string
  lastStudyDate: string | null
  recentActivity: string
  weakTopics: RawWeakNode[]
  srDueCount: number
  srTotal: number
  focusQueueCount: number
  targetExamDate: string | null
}) => (
  <section aria-labelledby="quiz-insights-heading" className="space-y-3">
    <div className="flex items-center justify-between gap-3">
      <h2 id="quiz-insights-heading" className="text-base font-bold text-foreground">
        Practice insights
      </h2>
      {targetExamDate && (
        <span className="text-xs text-muted-foreground">Target exam: {new Date(targetExamDate).toLocaleDateString()}</span>
      )}
    </div>
    <div className="grid gap-3 lg:grid-cols-4">
      <InsightCard icon={Gauge} label="Readiness" value={`${Math.round(readinessScore)}%`} detail={readinessLabel} />
      <InsightCard icon={ChartBar} label="Activity" value={recentActivity} detail={lastStudyDate ? `Last studied ${getRelativeDayLabel(lastStudyDate)}` : 'Start a session today'} />
      <InsightCard icon={Lightning} label="Review due" value={`${srDueCount} SR due`} detail={`${srTotal} total spaced cycles`} />
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <Target size={15} weight="bold" className="text-primary" />
          Weak areas
        </div>
        <div className="mt-3 space-y-2">
          {weakTopics.length > 0 ? (
            weakTopics.map((node) => (
              <div key={node.topic_id} className="truncate rounded-md bg-muted/30 px-2 py-1.5 text-xs font-semibold text-foreground">
                {node.taxonomy_tree?.name ?? 'Unlabeled topic'}
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No low-confidence topics yet.</p>
          )}
        </div>
        {focusQueueCount > 0 && (
          <p className="mt-3 text-[11px] font-semibold text-primary">{focusQueueCount} focus questions ready</p>
        )}
      </div>
    </div>
  </section>
)

const InsightCard = ({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Gauge
  label: string
  value: string
  detail: string
}) => (
  <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
      <Icon size={15} weight="bold" className="text-primary" />
      {label}
    </div>
    <p className="mt-3 text-lg font-extrabold text-foreground">{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
  </div>
)

const QuizSetupModalController = ({
  openMode,
  onClose,
  coreSubjects,
  designScenarios,
  enduranceLocked,
}: {
  openMode: QuizModeSlug | null
  onClose: () => void
  coreSubjects: CoreSubject[]
  designScenarios: DesignScenario[]
  enduranceLocked: boolean
}) => (
  <Dialog open={openMode !== null} onOpenChange={(open) => { if (!open) onClose() }}>
    {openMode === 'slatecamp' && (
      <DialogContent size="full" className="max-h-[92vh] overflow-hidden p-0 sm:max-w-[1080px]">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-foreground font-[family-name:var(--font-display)]">
              Build SlateCamp Quiz
            </DialogTitle>
            <DialogDescription>
              Choose subjects, set the session, then slide to start.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="max-h-[calc(92vh-96px)] overflow-y-auto px-5 py-5 sm:px-6">
          <QuizComposer initialSubjects={coreSubjects} />
        </div>
      </DialogContent>
    )}

    {openMode === 'design' && (
      <DialogContent size="full" className="max-h-[92vh] overflow-hidden p-0 sm:max-w-[980px]">
        <DesignQuizModal scenarios={designScenarios} />
      </DialogContent>
    )}

    {openMode === 'endurance' && (
      <DialogContent size="lg" className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-[720px]">
        <EnduranceQuizModal subjects={coreSubjects} locked={enduranceLocked} />
      </DialogContent>
    )}
  </Dialog>
)

const DesignQuizModal = ({ scenarios }: { scenarios: DesignScenario[] }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(scenarios[0]?.id ?? null)
  const [query, setQuery] = useState('')

  const filteredScenarios = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return scenarios
    return scenarios.filter((scenario) =>
      [scenario.title, scenario.building_type, scenario.brief, scenario.difficulty]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
  }, [query, scenarios])

  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? null

  return (
    <>
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-foreground font-[family-name:var(--font-display)]">
            Design Quiz
          </DialogTitle>
          <DialogDescription>
            Practice scenario-based design decisions with project briefs and review.
          </DialogDescription>
        </DialogHeader>
      </div>
      <div className="max-h-[calc(92vh-170px)] overflow-y-auto px-5 py-5 sm:px-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-foreground">Choose a scenario</p>
          <label className="sr-only" htmlFor="design-scenario-search">Search scenarios</label>
          <input
            id="design-scenario-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search scenarios…"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary sm:w-72"
          />
        </div>
        {filteredScenarios.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            No scenarios match your search.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredScenarios.map((scenario) => (
              <DesignScenarioCard
                key={scenario.id}
                scenario={scenario}
                selected={scenario.id === selectedScenarioId}
                onSelect={() => setSelectedScenarioId(scenario.id)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-muted-foreground">
          {selectedScenario ? `Selected: ${selectedScenario.title}` : 'Select one scenario to continue.'}
        </p>
        <Button asChild disabled={!selectedScenario} className="bg-purple-700 text-white hover:bg-purple-800">
          <Link href={selectedScenario ? `/dashboard/area-c/design-quiz/${selectedScenario.id}` : '#'}>
            Start Design Quiz
            <ArrowRight size={14} weight="bold" className="ml-1.5" />
          </Link>
        </Button>
      </div>
    </>
  )
}

const DesignScenarioCard = ({
  scenario,
  selected,
  onSelect,
}: {
  scenario: DesignScenario
  selected: boolean
  onSelect: () => void
}) => {
  const difficulty = scenario.difficulty === 'FOUNDATIONAL'
    ? 'Foundational'
    : scenario.difficulty === 'INTERMEDIATE'
      ? 'Intermediate'
      : 'Advanced'
  const timeLabel = scenario.time_limit_minutes >= 60
    ? `${Math.floor(scenario.time_limit_minutes / 60)}h${scenario.time_limit_minutes % 60 ? ` ${scenario.time_limit_minutes % 60}m` : ''}`
    : `${scenario.time_limit_minutes}m`

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex min-h-[190px] flex-col rounded-xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-primary',
        selected ? 'border-purple-400 bg-purple-50/70 shadow-sm' : 'border-border hover:border-purple-300',
      )}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {scenario.building_type}
          </p>
          <h3 className="mt-1 text-sm font-extrabold leading-snug text-foreground">{scenario.title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-purple-700 shadow-sm">
          {difficulty}
        </span>
      </div>
      <p className="mt-3 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
        {scenario.brief}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3 text-[11px] font-semibold text-muted-foreground">
        <span>{scenario.questions.length > 0 ? `${scenario.questions.length} questions` : 'Scenario set'}</span>
        <span>·</span>
        <span>{timeLabel}</span>
        {scenario.trap_count > 0 && (
          <>
            <span>·</span>
            <span className="text-warning">{scenario.trap_count} hidden trap{scenario.trap_count === 1 ? '' : 's'}</span>
          </>
        )}
      </div>
    </button>
  )
}

const EnduranceQuizModal = ({ subjects, locked }: { subjects: CoreSubject[]; locked: boolean }) => {
  const router = useRouter()
  const [questionCount, setQuestionCount] = useState<EnduranceCount>(100)
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  const begin = useCallback(async () => {
    if (locked || isStarting) return
    setError(null)
    setIsStarting(true)

    const config: QuizSessionConfig = mergeWithPreset('endurance', {
      setup: {
        questionCount,
        topics: subjects.map((subject) => subject.node_id),
        disciplines: [],
        difficultyMode: 'adaptive',
        initialDifficulty: 'mixed',
        isTrailSession: false,
        trailDayId: null,
      },
      timer: {
        enabled: true,
        visible: true,
        mode: 'countup',
        totalSeconds: null,
        perQuestion: false,
        pausable: true,
        warningThresholds: [],
      },
      feedback: {
        timing: 'deferred',
        showExplanation: true,
        showCorrectAnswer: true,
        showConfidenceRating: true,
        gatedProgressionDelayMs: 0,
        explanationDepth: 'brief',
      },
      results: {
        delayHours: 0,
        showImmediately: true,
        showPercentile: false,
        showSubjectBreakdown: true,
        showGrowthDelta: true,
        showReadinessScoreImpact: true,
        showStaminaChart: true,
      },
    })

    try {
      const result = await startSession({ mode: 'endurance', config })
      if (!result.success) {
        setError((result as { message?: string }).message ?? 'Failed to start endurance quiz.')
        setIsStarting(false)
        return
      }
      router.push(ROUTES.quiz.session(result.sessionId))
    } catch {
      setError('Something went wrong while creating your endurance session.')
      setIsStarting(false)
    }
  }, [isStarting, locked, questionCount, router, subjects])

  return (
    <>
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-foreground font-[family-name:var(--font-display)]">
            Endurance Quiz
          </DialogTitle>
          <DialogDescription>
            Build exam stamina with long-form extended practice.
          </DialogDescription>
        </DialogHeader>
      </div>
      <div className="space-y-5 px-5 py-5 sm:px-6">
        {locked ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-center">
            <Lock size={26} weight="bold" className="mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm font-bold text-foreground">Endurance Quiz is a Pro feature.</p>
            <p className="mt-1 text-xs text-muted-foreground">Upgrade to unlock long-form exam-stamina sessions.</p>
            <Button asChild className="mt-4 bg-primary text-white hover:bg-primary/90">
              <Link href={ROUTES.pricing}>Upgrade</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Endurance question count">
              {ENDURANCE_COUNT_OPTIONS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={cn(
                    'rounded-xl border p-4 text-center transition-all focus-visible:outline-2 focus-visible:outline-primary',
                    questionCount === count
                      ? 'border-amber-400 bg-amber-50 shadow-sm'
                      : 'border-border bg-card hover:border-amber-300 hover:shadow-sm',
                  )}
                >
                  <span className="block text-2xl font-extrabold text-foreground">{count}</span>
                  <span className="mt-1 block text-xs font-semibold text-muted-foreground">questions</span>
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <EnduranceFeature icon={Clock} title="Extended practice" description="Longer sets that train attention span." />
              <EnduranceFeature icon={Timer} title="Count-up timer" description="Track pacing without hard cutoff pressure." />
              <EnduranceFeature icon={CheckCircle} title="Brief feedback" description="Keep momentum while still learning from misses." />
              <EnduranceFeature icon={Books} title="Full-subject coverage" description="Draws from your available LEA subject map." />
            </div>

            {error && (
              <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive">
                {error}
              </p>
            )}
          </>
        )}
      </div>
      {!locked && (
        <div className="sticky bottom-0 border-t border-border bg-card px-5 py-4 sm:px-6">
          <Button onClick={begin} disabled={isStarting} className="w-full bg-amber-600 text-white hover:bg-amber-700">
            {isStarting ? 'Building session…' : `Begin ${questionCount}-question session`}
            <ArrowRight size={14} weight="bold" className="ml-1.5" />
          </Button>
        </div>
      )}
    </>
  )
}

const EnduranceFeature = ({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Clock
  title: string
  description: string
}) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
      <Icon size={16} weight="bold" className="text-amber-600" />
      {title}
    </div>
    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
  </div>
)
