'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ReadinessScoreRing } from '@/components/score/ReadinessScoreRing'
import { SectionHeader } from '@/components/shared/section-header'
import { MODE_DEFINITIONS, MODES_BY_ZONE } from '@/lib/constants/testing-modes'
import { SessionsTable } from './SessionsTable'
import { ModeCard } from './ModeCard'
import type {
  ModeStats,
  ModeSource,
  SimulationGateStatus,
} from '@/types/testing'
import type {
  SRActiveCycle,
  SRDueCycle,
  SRProgressSummary,
} from '@/lib/actions/quiz-v2/successive-relearning'

interface RawSession {
  session_id: string
  test_mode: string
  config: {
    mode?: string
    source?: ModeSource
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

interface RawBlindspotQueue {
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

interface ReviewHubProps {
  userTier: string
  readinessScore: number
  lastStudyDate: string | null
  completedSessions: RawSession[]
  inProgressSession: RawSession | null
  allSessions: RawSession[]
  blindspotQueues: RawBlindspotQueue[]
  targetExamDate: string | null
  weakNodes: RawWeakNode[]
  srActiveCycles?: SRActiveCycle[]
  srDueCycles?: SRDueCycle[]
  srProgress?: SRProgressSummary
}

interface HubSignal {
  title: string
  description: string
  href: string
  ctaLabel: string
}

const getModeKey = (session: RawSession): string => {
  const mode = session.config?.mode
  if (mode) {
    const modeMap: Record<string, string> = {
      focused: 'focus-review',
      fullexam: 'simulation',
      extended: 'endurance',
    }
    return modeMap[mode] ?? mode
  }

  const src = session.config?.source
  if (src) {
    const map: Record<ModeSource, string> = {
      camp_mode: 'camp',
      chill_mode: 'chill',
      subject_mode: 'subject',
      focus_review: 'focus-review',
      custom_session: 'custom',
      storm_mode: 'storm',
      proof_simulation: 'simulation',
      extended_practice: 'endurance',
      assessment_quiz: 'camp',
      trail_quiz: 'camp',
      blindspot_queue: 'focus-review',
      article_review: 'article-review',
    }
    return map[src] ?? 'camp'
  }

  const testModeMap: Record<string, string> = {
    camp: 'camp',
    chill: 'chill',
    custom: 'custom',
    storm: 'storm',
    practice: 'subject',
    blindspot: 'focus-review',
    proof_sim: 'simulation',
    endurance: 'endurance',
  }
  return testModeMap[session.test_mode] ?? 'camp'
}

const getSessionHref = (session: RawSession): string => {
  const modeKey = getModeKey(session)
  const modeToRoute: Record<string, string> = {
    'focus-review': 'focused',
    focus_review: 'focused',
    blindspot_queue: 'focused',
    simulation: 'fullexam',
    full_exam: 'fullexam',
    proof_simulation: 'fullexam',
    endurance: 'extended',
    extended_practice: 'extended',
    assessment_quiz: 'camp',
    trail_quiz: 'camp',
    camp_mode: 'camp',
    chill_mode: 'chill',
    subject_mode: 'subject',
    custom_session: 'custom',
    storm_mode: 'storm',
  }
  const routeMode = modeToRoute[modeKey] ?? modeKey.replace(/_/g, '-')
  return session.status === 'completed'
    ? `/quiz/${routeMode}/session/${session.session_id}/results`
    : `/quiz/${routeMode}/session/${session.session_id}`
}

const buildModeStatsMap = (
  sessions: RawSession[],
): Record<string, ModeStats> => {
  const map: Record<string, { count: number; accuracies: number[]; qCounts: number[] }> = {}

  for (const session of sessions) {
    const key = getModeKey(session)
    if (!map[key]) map[key] = { count: 0, accuracies: [], qCounts: [] }
    map[key].count += 1
    if (session.accuracy != null) map[key].accuracies.push(session.accuracy)
    const qCount = session.question_ids?.length ?? 0
    if (qCount > 0) map[key].qCounts.push(qCount)
  }

  const result: Record<string, ModeStats> = {}
  for (const [key, data] of Object.entries(map)) {
    result[key] = {
      sessionCount: data.count,
      lastAccuracy: data.accuracies.length > 0 ? data.accuracies[0] : null,
      avgQuestionsPerSession:
        data.qCounts.length > 0
          ? data.qCounts.reduce((a, b) => a + b, 0) / data.qCounts.length
          : null,
      fatigueThreshold: null,
    }
  }
  return result
}

const computeSimulationGate = (readinessScore: number): SimulationGateStatus => {
  const required = 65
  return {
    isUnlocked: readinessScore >= required,
    currentReadiness: readinessScore,
    requiredReadiness: required,
    hasEnduranceCalibration: false,
    pointsNeeded: Math.max(0, required - readinessScore),
  }
}

const getReadinessZone = (
  score: number,
): 'strong' | 'green' | 'amber' | 'needs-review' => {
  if (score >= 80) return 'strong'
  if (score >= 65) return 'green'
  if (score >= 40) return 'amber'
  return 'needs-review'
}

const getRelativeDayLabel = (date: string | null): string => {
  if (!date) return 'No recent study activity'
  const diffMs = Date.now() - new Date(date).getTime()
  const days = Math.floor(diffMs / 86_400_000)
  if (days <= 0) return 'Studied today'
  if (days === 1) return 'Studied yesterday'
  return `Last studied ${days} days ago`
}

const getDaysUntilExam = (date: string | null): number | null => {
  if (!date) return null
  const diffMs = new Date(date).getTime() - Date.now()
  return Math.max(0, Math.ceil(diffMs / 86_400_000))
}

const ReviewHub = ({
  userTier,
  readinessScore,
  lastStudyDate,
  completedSessions,
  inProgressSession,
  allSessions,
  blindspotQueues,
  targetExamDate,
  weakNodes,
  srActiveCycles = [],
  srDueCycles = [],
  srProgress = { active: 0, spacing: 0, durable: 0, reset: 0, total: 0 },
}: ReviewHubProps) => {
  const modeStats = useMemo(
    () => buildModeStatsMap(completedSessions),
    [completedSessions],
  )
  const simulationGateStatus = useMemo(
    () => computeSimulationGate(readinessScore),
    [readinessScore],
  )
  const readinessZone = useMemo(
    () => getReadinessZone(readinessScore),
    [readinessScore],
  )
  const normalizedTier = (userTier === 'free' ? 'free' : 'pro') as 'free' | 'pro'
  const daysUntilExam = useMemo(
    () => getDaysUntilExam(targetExamDate),
    [targetExamDate],
  )
  const resumeHref = useMemo(
    () => (inProgressSession ? getSessionHref(inProgressSession) : null),
    [inProgressSession],
  )
  const focusQueue = blindspotQueues[0] ?? null
  const weakTopicsPreview = useMemo(
    () =>
      weakNodes
        .slice(0, 3)
        .map((node) => node.taxonomy_tree?.name)
        .filter((name): name is string => Boolean(name)),
    [weakNodes],
  )
  const hubSignals = useMemo<HubSignal[]>(() => {
    const signals: HubSignal[] = []

    if (focusQueue) {
      signals.push({
        title: 'Focus Review is ready',
        description:
          focusQueue.question_count > 0
            ? `${focusQueue.question_count} queued questions across ${focusQueue.node_ids.length} weak areas.`
            : `${focusQueue.node_ids.length} weak areas are waiting for a targeted session.`,
        href: '/quiz/focused/setup',
        ctaLabel: 'Start Focus Review',
      })
    } else if (weakTopicsPreview.length > 0) {
      signals.push({
        title: 'Weak areas are visible',
        description: `Lowest-confidence topics: ${weakTopicsPreview.join(', ')}.`,
        href: '/quiz/focused/setup',
        ctaLabel: 'Target weak areas',
      })
    }

    if (srDueCycles.length > 0) {
      signals.push({
        title: 'Successive Relearning is due',
        description: `${srDueCycles.length} due cycle${srDueCycles.length === 1 ? '' : 's'} need reinforcement right now.`,
        href: '/quiz/camp/setup',
        ctaLabel: 'Do a quick session',
      })
    }

    if (daysUntilExam !== null) {
      signals.push({
        title: 'Exam countdown is active',
        description:
          daysUntilExam === 0
            ? 'Your exam is today. Choose the mode that best matches your confidence window.'
            : `${daysUntilExam} day${daysUntilExam === 1 ? '' : 's'} until your target exam date.`,
        href: simulationGateStatus.isUnlocked ? '/quiz/fullexam/setup' : '/quiz/storm/setup',
        ctaLabel: simulationGateStatus.isUnlocked ? 'Run a simulation' : 'Build exam pacing',
      })
    }

    return signals.slice(0, 3)
  }, [daysUntilExam, focusQueue, simulationGateStatus.isUnlocked, srDueCycles.length, weakTopicsPreview])

  const zone1Modes = MODES_BY_ZONE[1].map((key) => MODE_DEFINITIONS[key])
  const zone2Modes = MODES_BY_ZONE[2].map((key) => MODE_DEFINITIONS[key])
  const zone3Modes = MODES_BY_ZONE[3].map((key) => MODE_DEFINITIONS[key])

  return (
    <div className="w-full" style={{ backgroundColor: 'var(--background)' }}>
      <main
        className="mx-auto max-w-[960px] px-6 py-8"
        aria-label="Review and Testing hub"
      >
        <header className="mb-8">
          <SectionHeader
            eyebrow="Review & Testing"
            title="Build Mastery. Earn your Score."
            subtitle="Choose a session mode that fits your goal today. Every answer feeds your Readiness Score."
            level="page"
          />
        </header>

        <div className="space-y-10">
          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-md border border-border bg-white p-5">
              <SectionHeader
                eyebrow="Readiness"
                title="Today’s testing posture"
                subtitle={getRelativeDayLabel(lastStudyDate)}
                level="section"
              />
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <ReadinessScoreRing
                  score={Math.round(readinessScore)}
                  zone={readinessZone}
                  size="sm"
                />
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-md bg-primary-50 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                      Completed Sessions
                    </p>
                    <p className="mt-1 font-sans text-2xl font-semibold text-foreground">
                      {completedSessions.length}
                    </p>
                  </div>
                  <div className="rounded-md bg-background p-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Due SR Cycles
                    </p>
                    <p className="mt-1 font-sans text-2xl font-semibold text-foreground">
                      {srDueCycles.length}
                    </p>
                  </div>
                  <div className="rounded-md bg-background p-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Active SR Cycles
                    </p>
                    <p className="mt-1 font-sans text-2xl font-semibold text-foreground">
                      {srActiveCycles.length}
                    </p>
                  </div>
                  <div className="rounded-md bg-background p-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      SR Coverage
                    </p>
                    <p className="mt-1 font-sans text-2xl font-semibold text-foreground">
                      {srProgress.total}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-border bg-white p-5">
              <SectionHeader
                eyebrow="Next Best Move"
                title={inProgressSession ? 'Resume your live session' : 'Choose today’s launch point'}
                subtitle={
                  inProgressSession
                    ? `${MODE_DEFINITIONS[getModeKey(inProgressSession)]?.label ?? 'Session'} · question ${Math.min(
                        (inProgressSession.current_question_index ?? 0) + 1,
                        Math.max(1, inProgressSession.question_ids?.length ?? 1),
                      )} of ${inProgressSession.question_ids?.length ?? 0}`
                    : 'Pick the mode that matches your cognitive goal right now.'
                }
                level="section"
              />
              {inProgressSession && resumeHref ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-md bg-primary-50 p-4">
                    <p className="text-sm text-text-secondary">
                      You already have an active session running. Resume it before starting another one.
                    </p>
                  </div>
                  <Link
                    href={resumeHref}
                    className="inline-flex w-full items-center justify-center rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90"
                  >
                    Resume session
                  </Link>
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  <Link
                    href="/quiz/camp/setup"
                    className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90"
                  >
                    Start Camp Mode
                  </Link>
                  <Link
                    href={simulationGateStatus.isUnlocked ? '/quiz/fullexam/setup' : '/quiz/storm/setup'}
                    className="inline-flex items-center justify-center rounded-sm border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-background"
                  >
                    {simulationGateStatus.isUnlocked ? 'Begin Full Exam Simulation' : 'Build exam pacing'}
                  </Link>
                </div>
              )}
            </div>
          </section>

          {hubSignals.length > 0 && (
            <section>
              <SectionHeader
                eyebrow="Suggested Next"
                title="High-impact ways to spend your next session"
                level="section"
              />
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {hubSignals.map((signal) => (
                  <div key={signal.title} className="rounded-md border border-border bg-white p-4">
                    <h3 className="text-sm font-semibold text-foreground">{signal.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">{signal.description}</p>
                    <Link
                      href={signal.href}
                      className="mt-4 inline-flex items-center text-sm font-medium text-primary transition-colors duration-150 hover:text-primary-700"
                    >
                      {signal.ctaLabel}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeader
              eyebrow="Zone 01"
              title="Foundations"
              subtitle="Low-friction modes for recall, confidence building, and quick daily reps."
              level="section"
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {zone1Modes.map((mode) => (
                <ModeCard
                  key={mode.key}
                  mode={mode}
                  stats={modeStats[mode.key] ?? null}
                  userTier={normalizedTier}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              eyebrow="Zone 02"
              title="Deliberate Practice"
              subtitle="Target subjects and weaknesses once your daily foundation work is underway."
              level="section"
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {zone2Modes.map((mode) => (
                <ModeCard
                  key={mode.key}
                  mode={mode}
                  stats={modeStats[mode.key] ?? null}
                  userTier={normalizedTier}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              eyebrow="Zone 03"
              title="Exam Readiness"
              subtitle="Timed pressure, long-form endurance, and the full exam simulation."
              level="section"
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {zone3Modes.map((mode) => (
                <ModeCard
                  key={mode.key}
                  mode={mode}
                  stats={modeStats[mode.key] ?? null}
                  isLocked={mode.key === 'simulation' && !simulationGateStatus.isUnlocked}
                  lockProgress={mode.key === 'simulation' ? simulationGateStatus : null}
                  userTier={normalizedTier}
                />
              ))}
            </div>
          </section>

          <div className="rounded-md border border-border bg-primary-50 p-4">
            <p className="text-sm text-text-secondary">
              Focus Review queue:{' '}
              <span className="font-medium text-foreground">{focusQueue?.question_count ?? 0}</span>
              {' '}queued questions across{' '}
              <span className="font-medium text-foreground">{focusQueue?.node_ids.length ?? weakNodes.length}</span>
              {' '}weak area{(focusQueue?.node_ids.length ?? weakNodes.length) === 1 ? '' : 's'}.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <SectionHeader
            eyebrow="Session History"
            title="Your Sessions"
            level="section"
          />
          <div className="mt-4">
            <SessionsTable sessions={allSessions} />
          </div>
        </div>
      </main>
    </div>
  )
}

ReviewHub.displayName = 'ReviewHub'

export { ReviewHub }
