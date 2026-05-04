'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowRight, Lock, Play, Target, Clock, BookOpen } from '@phosphor-icons/react'
import { ROUTES } from '@/lib/routes'
import { ReadinessScoreRing } from '@/components/score/ReadinessScoreRing'
import { SectionHeader } from '@/components/shared/section-header'
import { HeroConfigurator } from './HeroConfigurator'
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Session Mode Label ──────────────────────────────────────────────────────

const getModeLabel = (mode?: string): string => {
  const labels: Record<string, string> = {
    custom: 'Standard Quiz',
    camp: 'Camp',
    chill: 'Chill',
    storm: 'Storm',
    full_exam: 'Full Exam',
    endurance: 'Endurance',
    focus_review: 'Focus Review',
    subject: 'Subject Quiz',
    article_review: 'Article Review',
  }
  return labels[mode ?? ''] ?? 'Quiz'
}

// ─── ReviewHub ───────────────────────────────────────────────────────────────

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
  srActiveCycles: _srActiveCycles = [],
  srDueCycles: _srDueCycles = [],
  srProgress: _srProgress = { active: 0, spacing: 0, durable: 0, reset: 0, total: 0 },
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
        .slice(0, 4)
        .map((node) => node.taxonomy_tree?.name)
        .filter((name): name is string => Boolean(name)),
    [weakNodes],
  )

  const currentQuestion = inProgressSession
    ? Math.min(
        (inProgressSession.current_question_index ?? 0) + 1,
        Math.max(1, inProgressSession.question_ids?.length ?? 1),
      )
    : 0
  const totalQuestions = inProgressSession?.question_ids?.length ?? 0
  const modeName = getModeLabel(inProgressSession?.config?.mode)

  return (
    <div className="w-full bg-background">
      <main className="mx-auto w-full max-w-[960px] px-6 py-8" aria-label="Quiz hub">

        {/* ═══════════════════════════════════════════════════════════════════
            HERO AREA — Title, value prop, compact readiness
           ═══════════════════════════════════════════════════════════════════ */}
        <header className="mb-10">
          <SectionHeader
            eyebrow="Quiz"
            title="Practice makes exam-ready."
            subtitle="Each session sharpens your mastery. Choose what to practice, configure your session, and slide to begin."
            level="page"
          />
          <div className="mt-6 flex flex-wrap items-center gap-5 rounded-lg border border-border bg-card px-5 py-4">
            <ReadinessScoreRing
              score={Math.round(readinessScore)}
              zone={readinessZone}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {getRelativeDayLabel(lastStudyDate)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {completedSessions.length} completed session{completedSessions.length === 1 ? '' : 's'}
                {daysUntilExam !== null &&
                  ` · ${daysUntilExam} day${daysUntilExam === 1 ? '' : 's'} until your exam`}
                {_srDueCycles.length > 0 &&
                  ` · ${_srDueCycles.length} SR cycle${_srDueCycles.length === 1 ? '' : 's'} due`}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-14">

          {/* ═══════════════════════════════════════════════════════════════════
              ACTIVE QUIZ BANNER — Dominant resume action (only when active)
             ═══════════════════════════════════════════════════════════════════ */}
          {inProgressSession && resumeHref && (
            <section aria-label="Active quiz session">
              <div className="rounded-lg border-2 border-primary/20 bg-primary-50 p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Play size={20} weight="fill" className="text-primary" />
                      <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-primary">
                        Active Quiz
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-foreground font-[family-name:var(--font-display)]">
                      You have a quiz in progress
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {modeName} · Question {currentQuestion} of {totalQuestions}
                      {inProgressSession.started_at && (
                        <> · Started {getRelativeDayLabel(inProgressSession.started_at).toLowerCase()}</>
                      )}
                    </p>
                  </div>
                  <Link
                    href={resumeHref}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    Resume Quiz
                    <ArrowRight size={16} weight="bold" />
                  </Link>
                </div>
                <p className="mt-5 rounded-md bg-background/60 px-4 py-3 text-xs text-muted-foreground">
                  Complete or abandon your active quiz before starting a new one.
                </p>
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              QUIZ BUILDER — Subject selection, configuration, slide-to-start
              Only shown when NO active quiz is running
             ═══════════════════════════════════════════════════════════════════ */}
          {!inProgressSession && (
            <section id="quiz-builder" aria-label="Quiz builder">
              <SectionHeader
                eyebrow="Quiz Builder"
                title="Choose what to practice"
                subtitle="Select subjects, set the question count, and slide to start. The engine mixes unseen, remediation, and reinforcement questions."
                level="section"
              />
              <div className="mt-5">
                <HeroConfigurator initialSubjects={coreSubjects} />
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              SUGGESTED NEXT — Recommendation cards with clear reasoning
             ═══════════════════════════════════════════════════════════════════ */}
          {(focusQueue || weakTopicsPreview.length > 0 || _srDueCycles.length > 0) && !inProgressSession && (
            <section aria-label="Suggested next">
              <SectionHeader
                eyebrow="Suggested Next"
                title="High-impact practice opportunities"
                subtitle="Based on your performance data and spaced-repetition schedule."
                level="section"
              />
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Focus Review */}
                {focusQueue && (
                  <a
                    href="#quiz-builder"
                    className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-primary-50/50"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-sm bg-warning-50">
                      <Target size={18} weight="fill" className="text-warning" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Target your weak areas
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {focusQueue.question_count} questions across {focusQueue.node_ids.length} weak area{focusQueue.node_ids.length === 1 ? '' : 's'} are ready for review. Focus on what needs the most work.
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                      Select subjects below
                      <ArrowRight size={12} weight="bold" />
                    </span>
                  </a>
                )}

                {/* Weak Areas (shown when no focus queue) */}
                {!focusQueue && weakTopicsPreview.length > 0 && (
                  <div className="rounded-lg border border-border bg-card p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-sm bg-amber-50">
                      <BookOpen size={18} weight="fill" className="text-amber-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Lowest-confidence topics
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      These topics need more practice:{' '}
                      <span className="font-medium text-foreground">
                        {weakTopicsPreview.join(', ')}
                      </span>
                    </p>
                    <a
                      href="#quiz-builder"
                      className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Practice these areas
                      <ArrowRight size={12} weight="bold" />
                    </a>
                  </div>
                )}

                {/* Successive Relearning */}
                {_srDueCycles.length > 0 && (
                  <div className="rounded-lg border border-border bg-card p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-sm bg-primary-50">
                      <Clock size={18} weight="fill" className="text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Spaced review is due
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {_srDueCycles.length} topic{_srDueCycles.length === 1 ? '' : 's'} due for spaced
                      reinforcement. Quick review now locks in long-term retention.
                    </p>
                    <a
                      href="#quiz-builder"
                      className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Reinforce now
                      <ArrowRight size={12} weight="bold" />
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              SPECIAL FORMATS — Lower-priority quiz types
             ═══════════════════════════════════════════════════════════════════ */}
          <section aria-label="Special quiz formats">
            <SectionHeader
              eyebrow="Special Formats"
              title="Scenario and endurance practice"
              subtitle="Use these when you need focused design practice or exam-length stamina training."
              level="section"
            />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {/* Design Quiz */}
              <div className="flex flex-col rounded-lg border border-border bg-card p-6">
                <h3 className="text-base font-bold text-foreground">
                  Design Quiz
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Scenario-based design practice with project briefs, design decisions, and
                  solution review for the Area C exam section.
                </p>
                <div className="mt-auto pt-5">
                  <Link
                    href="/dashboard/area-c/design-quiz"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Open Design Quiz
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Endurance Quiz */}
              <div className="flex flex-col rounded-lg border border-border bg-card p-6">
                <h3 className="text-base font-bold text-foreground">
                  Endurance Quiz
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Long-form extended practice for exam-length focus. Tracks stamina and accuracy
                  over time to build your test-taking endurance.
                </p>
                <div className="mt-auto pt-5">
                  {effectiveTier === 'free' ? (
                    <div className="flex items-center justify-between rounded-sm border border-dashed border-border bg-muted/50 px-4 py-2.5">
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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      Start Endurance Quiz
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}

ReviewHub.displayName = 'ReviewHub'

export { ReviewHub }
