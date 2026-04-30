'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Lock } from '@phosphor-icons/react'
import { ROUTES } from '@/lib/routes'
import { ReadinessScoreRing } from '@/components/score/ReadinessScoreRing'
import { SectionHeader } from '@/components/shared/section-header'
import { HeroConfigurator } from './HeroConfigurator'
import type { ModeSource } from '@/types/testing'
import type {
  SRActiveCycle,
  SRDueCycle,
  SRProgressSummary,
} from '@/lib/actions/quiz-v2/successive-relearning'
import type { ViewerEntitlements } from '@/lib/entitlements/types'

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
  coreSubjects?: { node_id: string; name: string; subject_area: string }[]
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

const getSessionHref = (session: RawSession): string => {
  return session.status === 'completed'
    ? ROUTES.quiz.results(session.session_id)
    : ROUTES.quiz.session(session.session_id)
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
  viewerEntitlements,
  readinessScore,
  lastStudyDate,
  completedSessions,
  inProgressSession,
  focusReviewQueues,
  targetExamDate,
  weakNodes,
  coreSubjects,
  srActiveCycles = [],
  srDueCycles = [],
  srProgress = { active: 0, spacing: 0, durable: 0, reset: 0, total: 0 },
}: ReviewHubProps) => {
  const { effectiveTier } = viewerEntitlements
  const readinessZone = useMemo(
    () => getReadinessZone(readinessScore),
    [readinessScore],
  )
  const daysUntilExam = useMemo(
    () => getDaysUntilExam(targetExamDate),
    [targetExamDate],
  )
  const resumeHref = useMemo(
    () => (inProgressSession ? getSessionHref(inProgressSession) : null),
    [inProgressSession],
  )
  const focusQueue = focusReviewQueues[0] ?? null
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
        href: '#hero-configurator',
        ctaLabel: 'Target Weak Areas',
      })
    } else if (weakTopicsPreview.length > 0) {
      signals.push({
        title: 'Weak areas are visible',
        description: `Lowest-confidence topics: ${weakTopicsPreview.join(', ')}.`,
        href: '#hero-configurator',
        ctaLabel: 'Target weak areas',
      })
    }

    if (srDueCycles.length > 0) {
      signals.push({
        title: 'Successive Relearning is due',
        description: `${srDueCycles.length} due cycle${srDueCycles.length === 1 ? '' : 's'} need reinforcement right now.`,
        href: '#hero-configurator',
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
        href: '#hero-configurator',
        ctaLabel: 'Configure session',
      })
    }

    return signals.slice(0, 3)
  }, [daysUntilExam, focusQueue, srDueCycles.length, weakTopicsPreview])

  return (
    <div className="w-full bg-background">
      <main
        className="w-full px-6 py-8"
        aria-label="Quiz hub"
      >
        <header className="mb-8">
          <SectionHeader
            eyebrow="Quiz"
            title="Build mastery with one focused quiz."
            subtitle="Choose topics, set the question count, slide to start, and let every answer feed your Readiness Score."
            level="page"
          />
        </header>

        <div className="space-y-10">
          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-md border border-border bg-card p-5">
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

            <div className="rounded-md border border-border bg-card p-5">
              <SectionHeader
                eyebrow="Next Best Move"
                title={inProgressSession ? 'Resume your live quiz' : 'Choose today’s quiz'}
                subtitle={
                  inProgressSession
                    ? `Session · question ${Math.min(
                        (inProgressSession.current_question_index ?? 0) + 1,
                        Math.max(1, inProgressSession.question_ids?.length ?? 1),
                      )} of ${inProgressSession.question_ids?.length ?? 0}`
                    : 'Use the quiz configurator to launch a targeted question set.'
                }
                level="section"
              />
              {inProgressSession && resumeHref ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-md bg-primary-50 p-4">
                    <p className="text-sm text-text-secondary">
                      You already have an active quiz running. Resume it before starting another one.
                    </p>
                  </div>
                  <Link
                    href={resumeHref}
                    className="inline-flex w-full items-center justify-center rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90"
                  >
                    Resume quiz
                  </Link>
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  <a
                    href="#hero-configurator"
                    className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90"
                  >
                    Configure Quiz
                  </a>
                </div>
              )}
            </div>
          </section>

          <section id="hero-configurator">
            <SectionHeader
              eyebrow="Quiz Builder"
              title="Configure your quiz"
              subtitle="Select subjects, set the question count, and slide to start. The engine mixes unseen, remediation, and reinforcement questions."
              level="section"
            />
            <div className="mt-4">
              <HeroConfigurator initialSubjects={coreSubjects} />
            </div>
          </section>

          {hubSignals.length > 0 && (
            <section>
              <SectionHeader
                eyebrow="Suggested Next"
                title="High-impact ways to spend your next quiz"
                level="section"
              />
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {hubSignals.map((signal) => (
                  <div key={signal.title} className="rounded-md border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold text-foreground">{signal.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">{signal.description}</p>
                    <a
                      href={signal.href}
                      className="mt-4 inline-flex items-center text-sm font-medium text-primary transition-colors duration-150 hover:text-primary-700"
                    >
                      {signal.ctaLabel}
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeader
              eyebrow="Special Formats"
              title="Use focused quiz formats only when the task is different"
              subtitle="The standard Quiz is the default. Design and Endurance remain separate because they test a different kind of performance."
              level="section"
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="flex flex-col justify-between rounded-md border border-border bg-card p-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Design Quiz</h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    Scenario-based Area C design practice with project briefs, design decisions, and solution review.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href="/dashboard/area-c/design-quiz"
                    className="inline-flex w-full items-center justify-center rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-background"
                  >
                    Open Design Quiz
                  </Link>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-md border border-border bg-card p-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Endurance Quiz</h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    Long-form extended practice. Tracks stamina and accuracy over time for exam-length focus.
                  </p>
                </div>
                <div className="mt-6">
                  {effectiveTier === 'free' ? (
                    <div className="flex items-center justify-between rounded-md border border-dashed border-border bg-muted/50 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Lock size={14} weight="bold" />
                        <span>Pro Subscription Required</span>
                      </div>
                      <Link
                        href={ROUTES.pricing}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Upgrade
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={ROUTES.quiz.setup('endurance')}
                      className="inline-flex w-full items-center justify-center rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-background"
                    >
                      Start Endurance Quiz
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="rounded-md border border-border bg-primary-50 p-4">
            <p className="text-sm text-text-secondary">
              Focus Review signal:{' '}
              <span className="font-medium text-foreground">{focusQueue?.question_count ?? 0}</span>
              {' '}queued questions across{' '}
              <span className="font-medium text-foreground">{focusQueue?.node_ids.length ?? weakNodes.length}</span>
              {' '}weak area{(focusQueue?.node_ids.length ?? weakNodes.length) === 1 ? '' : 's'}.
            </p>
          </div>
        </div>

      </main>
    </div>
  )
}

ReviewHub.displayName = 'ReviewHub'

export { ReviewHub }
