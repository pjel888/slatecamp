'use client'

import { useMemo, useState, useCallback } from 'react'
import { WelcomeCard } from './WelcomeCard'
import { SmartSuggestionCard } from './SmartSuggestionCard'
import { InProgressBanner } from './InProgressBanner'
import { ZoneSection } from './ZoneSection'
import { SessionsTable } from './SessionsTable'
import { SectionHeader } from '@/components/shared/section-header'
import { MODE_DEFINITIONS, MODES_BY_ZONE } from '@/lib/constants/testing-modes'
import { abandonTestingSession } from '@/lib/actions/testing'
import { getSubjectName } from '@/types/testing'
import type {
  ModeStats,
  SmartSuggestion,
  SimulationGateStatus,
  InProgressSessionInfo,
  ModeSource,
} from '@/types/testing'

// ─── Raw session shape from page.tsx query ────────────────────────────────────

interface RawSession {
  session_id: string
  test_mode: string
  config: {
    source?: ModeSource
    isProofSimulation?: boolean
    isEnduranceSession?: boolean
    isBlindspotSession?: boolean
  } | null
  status: string
  question_ids: string[] | null
  started_at: string
  completed_at: string | null
  current_question_index: number
  updated_at: string
  /** Accuracy computed from answers — may not exist in raw query; optional */
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

// ─── Props ────────────────────────────────────────────────────────────────────

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
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map a raw completed session to its UI mode key */
const getModeKey = (session: RawSession): string => {
  const src = session.config?.source
  if (!src) return 'camp'
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
  }
  return map[src] ?? 'camp'
}

/** Build ModeStats map from completed sessions */
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
    const lastAccuracy =
      data.accuracies.length > 0
        ? data.accuracies[0] // sessions ordered by updated_at desc, so first = most recent
        : null
    const avgQuestionsPerSession =
      data.qCounts.length > 0
        ? data.qCounts.reduce((a, b) => a + b, 0) / data.qCounts.length
        : null
    result[key] = {
      sessionCount: data.count,
      lastAccuracy,
      avgQuestionsPerSession,
      fatigueThreshold: null,
    }
  }
  return result
}

/** Compute the highest-priority SmartSuggestion */
const computeSmartSuggestion = ({
  blindspotQueues,
  targetExamDate,
  weakNodes,
  lastStudyDate,
}: {
  blindspotQueues: RawBlindspotQueue[]
  targetExamDate: string | null
  weakNodes: RawWeakNode[]
  lastStudyDate: string | null
}): SmartSuggestion | null => {
  // Priority 1: blindspot queue pending
  if (blindspotQueues.length > 0) {
    const queue = blindspotQueues[0]
    const nodeCount = queue.node_ids?.length ?? 0
    return {
      variant: 'blindspot',
      title: `${nodeCount} node${nodeCount !== 1 ? 's' : ''} need attention`,
      description:
        'Your mastery data shows these topics need a focused session. A targeted review here has the highest impact on your Readiness Score.',
      ctaLabel: 'Start Focus Review',
      ctaHref: '/quiz/focused/setup',
      metadata: { nodeNames: [] },
    }
  }

  // Priority 2: exam countdown (if exam date is within 30 days)
  if (targetExamDate) {
    const daysUntil = Math.ceil(
      (new Date(targetExamDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    )
    if (daysUntil > 0 && daysUntil <= 30) {
      return {
        variant: 'exam-countdown',
        title: `${daysUntil} day${daysUntil !== 1 ? 's' : ''} until your exam`,
        description:
          daysUntil <= 7
            ? 'Final week. Focus on your weakest subjects and do a full simulation if your readiness is at 65%.'
            : 'Keep your momentum. Consistent daily sessions now will move your Readiness Score the most.',
        ctaLabel: daysUntil <= 7 ? 'Start Storm Mode' : 'Start Camp Mode',
        ctaHref:
          daysUntil <= 7
            ? '/quiz/storm/setup'
            : '/quiz/camp/setup',
        metadata: { daysUntilExam: daysUntil },
      }
    }
  }

  // Priority 3: weak subject
  if (weakNodes.length > 0) {
    const weakNode = weakNodes[0]
    const subjectName = getSubjectName(weakNode.taxonomy_tree?.subject_area) ?? 'a subject area'
    return {
      variant: 'weak-subject',
      title: `${subjectName} could use attention`,
      description: `Your mastery in ${subjectName} is below your average. A Subject Mode session here would strengthen your weakest area.`,
      ctaLabel: `Practice ${subjectName}`,
      ctaHref: '/quiz/subject/setup',
      metadata: { subjectName },
    }
  }

  // Priority 4: return (48h+ absent)
  if (lastStudyDate) {
    const hoursSince =
      (Date.now() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60)
    if (hoursSince >= 48) {
      const daysSince = Math.floor(hoursSince / 24)
      return {
        variant: 'return',
        title: 'Pick up where you left off',
        description: `Your last session was ${daysSince} day${daysSince !== 1 ? 's' : ''} ago. A quick Camp Mode session is the best way to get back in rhythm.`,
        ctaLabel: 'Start Camp Mode',
        ctaHref: '/quiz/camp/setup',
      }
    }
  }

  return null
}

/** Compute simulation gate status from readiness score */
const computeSimulationGate = (readinessScore: number): SimulationGateStatus => {
  const required = 65
  const isUnlocked = readinessScore >= required
  return {
    isUnlocked,
    currentReadiness: readinessScore,
    requiredReadiness: required,
    hasEnduranceCalibration: false,
    pointsNeeded: Math.max(0, required - readinessScore),
  }
}

/** Convert a raw in-progress session to InProgressSessionInfo */
const toInProgressSessionInfo = (
  session: RawSession,
): InProgressSessionInfo => {
  const src = session.config?.source ?? 'camp_mode'
  const labelMap: Record<ModeSource, string> = {
    camp_mode: 'Camp Mode',
    chill_mode: 'Chill Mode',
    subject_mode: 'Subject Mode',
    focus_review: 'Focus Review',
    custom_session: 'Custom Session',
    storm_mode: 'Storm Mode',
    proof_simulation: 'Full Exam Simulation',
    extended_practice: 'Design Endurance Training',
    assessment_quiz: 'Assessment',
    trail_quiz: 'Trail Quiz',
    blindspot_queue: 'Focus Review',
  }
  return {
    sessionId: session.session_id,
    source: src as ModeSource,
    modeLabel: labelMap[src as ModeSource] ?? 'Study Session',
    currentIndex: session.current_question_index ?? 0,
    totalQuestions: session.question_ids?.length ?? 0,
    startedAt: session.started_at,
  }
}

// ─── Progressive disclosure helpers ──────────────────────────────────────────

const getZoneOpacity = (zone: 1 | 2 | 3, sessionCount: number): number => {
  if (zone === 1) return 1
  if (zone === 2) return sessionCount < 5 ? 0.75 : 1
  // zone 3
  if (sessionCount < 5) return 0.55
  if (sessionCount < 10) return 0.8
  return 1
}

// ─── Component ────────────────────────────────────────────────────────────────

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
}: ReviewHubProps) => {
  const sessionCount = completedSessions.length
  const isFirstTime = sessionCount === 0

  const modeStats = useMemo(
    () => buildModeStatsMap(completedSessions),
    [completedSessions],
  )

  const smartSuggestion = useMemo(
    () =>
      isFirstTime
        ? null
        : computeSmartSuggestion({ blindspotQueues, targetExamDate, weakNodes, lastStudyDate }),
    [isFirstTime, blindspotQueues, targetExamDate, weakNodes, lastStudyDate],
  )

  const simulationGateStatus = useMemo(
    () => computeSimulationGate(readinessScore),
    [readinessScore],
  )

  const inProgressInfo = useMemo(
    () => (inProgressSession ? toInProgressSessionInfo(inProgressSession) : null),
    [inProgressSession],
  )

  const [bannerDismissed, setBannerDismissed] = useState(false)

  const handleAbandon = useCallback(async () => {
    if (!inProgressSession) return
    setBannerDismissed(true)
    await abandonTestingSession(inProgressSession.session_id)
  }, [inProgressSession])

  const normalizedTier = (userTier === 'free' ? 'free' : 'pro') as 'free' | 'pro'

  const zone1Modes = MODES_BY_ZONE[1].map((key) => MODE_DEFINITIONS[key])
  const zone2Modes = MODES_BY_ZONE[2].map((key) => MODE_DEFINITIONS[key])
  const zone3Modes = MODES_BY_ZONE[3].map((key) => MODE_DEFINITIONS[key])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* In-progress session banner */}
      {inProgressInfo && !bannerDismissed && (
        <InProgressBanner session={inProgressInfo} onAbandon={handleAbandon} />
      )}

      <main
        className="mx-auto max-w-[960px] px-6 py-8"
        aria-label="Review and Testing hub"
      >
        {/* ── Page header ─────────────────────────────────────────── */}
        <header className="mb-8">
          <SectionHeader
            eyebrow="Review & Testing"
            title="Build Mastery. Earn your Score."
            subtitle="Choose a session mode that fits your goal today. Every answer feeds your Readiness Score."
            level="page"
          />
        </header>

        {/* ── Smart suggestion or Welcome card ────────────────────── */}
        {isFirstTime ? (
          <div className="mb-8">
            <WelcomeCard />
          </div>
        ) : smartSuggestion ? (
          <div className="mb-8" role="region" aria-label="Suggested next step">
            <SmartSuggestionCard suggestion={smartSuggestion} />
          </div>
        ) : null}

        {/* ── Zone sections ───────────────────────────────────────── */}
        <div className="space-y-10">
          <ZoneSection
            zone={1}
            modes={zone1Modes}
            modeStats={modeStats}
            userTier={normalizedTier}
            opacity={getZoneOpacity(1, sessionCount)}
          />

          <ZoneSection
            zone={2}
            modes={zone2Modes}
            modeStats={modeStats}
            userTier={normalizedTier}
            opacity={getZoneOpacity(2, sessionCount)}
          />

          <ZoneSection
            zone={3}
            modes={zone3Modes}
            modeStats={modeStats}
            userTier={normalizedTier}
            simulationGateStatus={simulationGateStatus}
            opacity={getZoneOpacity(3, sessionCount)}
          />
        </div>

        {/* ── Session History ──────────────────────────────────── */}
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
