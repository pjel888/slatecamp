'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import type {
  DashboardPageData,
  RecommendedAction,
  FocusAreaItem,
  MasteryLabel,
  ActivityFeedItem,
  InProgressSession,
  HeroMicroStat,
  WeekStat,
  DailyWikiArticle,
  NotePreview,
  SubjectMastery,
  SubjectFloorAlert,
  TopicRing,
} from '@/types/dashboard'

// ── Short labels for radar chart axes ─────────────────────────────────────────

const SHORT_LABELS: Record<string, string> = {
  'Architectural Design and Site Planning': 'Arch Design',
  'Architectural Practice': 'Practice',
  'Building Materials and Construction': 'Materials',
  'Building Utilities': 'Utilities',
  'History of Architecture': 'History',
  'Structural Design': 'Structural',
  'Theory and Principles of Planning': 'Planning',
  'Theory of Architecture': 'Theory',
}

function shortLabel(subject: string): string {
  return SHORT_LABELS[subject] ?? subject.split(' ').slice(0, 2).join(' ')
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getMasteryLabel(weight: number): MasteryLabel {
  if (weight >= 0.76) return 'Strong'
  if (weight >= 0.51) return 'Developing'
  if (weight >= 0.26) return 'Building'
  return 'Exploring'
}

const MODE_NAMES: Record<string, string> = {
  camp: 'Camp Mode',
  storm: 'Storm Mode',
  chill: 'Chill Mode',
  timed: 'Timed Quiz',
  practice: 'Practice Quiz',
  custom: 'Custom Quiz',
  blindspot: 'Focus Review',
  proof_sim: 'Full Exam Simulation',
  endurance: 'Extended Practice',
}

const MODE_BADGES: Record<string, string> = {
  camp: 'CAMP',
  storm: 'STORM',
  timed: 'TIMED',
  practice: 'PRACTICE',
  chill: 'CHILL',
  custom: 'CUSTOM',
  blindspot: 'FOCUS',
}

const MODE_TOOLTIPS: Record<string, string> = {
  camp: 'Camp Mode gives you instant feedback after each question — ideal for learning and review.',
  storm: 'Storm Mode simulates real exam conditions — no feedback until you finish.',
  timed: 'Timed Quiz adds a countdown — practice working under pressure.',
  practice: 'Practice Quiz lets you study at your own pace with full explanations.',
  chill: 'Chill Mode removes all pressure — study relaxed, no timer, full feedback.',
}

function formatModeName(mode: string): string {
  return MODE_NAMES[mode] ?? 'Quiz'
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = diff / (1000 * 60 * 60)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${Math.floor(hours)}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getWeekBoundary(weeksAgo: number): { start: string; end: string } {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(now.getDate() - dayOfWeek - (weeksAgo * 7))
  startOfThisWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfThisWeek)
  endOfWeek.setDate(startOfThisWeek.getDate() + 7)
  return { start: startOfThisWeek.toISOString(), end: endOfWeek.toISOString() }
}

// ── Main fetcher ────────────────────────────────────────────────────────────

export async function getDashboardPageData(): Promise<DashboardPageData> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  const firstName =
    user?.user_metadata?.full_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'there'

  if (!user) return emptyDashboard(firstName)

  const thisWeek = getWeekBoundary(0)
  const lastWeek = getWeekBoundary(1)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    globalStatsResult,          // Q1: DASHBOARD: HeroCommandBar
    snapshotsResult,            // Q2: DASHBOARD: HeroCommandBar (delta)
    inProgressResult,           // Q3: DASHBOARD: NextMissionCard
    focusTopicsResult,          // Q4: DASHBOARD: FocusAreasCard + NextMissionCard
    thisWeekInteractionsResult, // Q5: DASHBOARD: WeekAtAGlance (this week)
    lastWeekInteractionsResult, // Q6: DASHBOARD: WeekAtAGlance (last week)
    recentSessionsResult,       // Q7: DASHBOARD: RecentActivityFeed
    masteryCountResult,         // Q8: DASHBOARD: HeroCommandBar (syllabus coverage)
    notesResult,                // Q9: DASHBOARD: RecentNotesCard
    wikiArticlesResult,         // Q10: DASHBOARD: DailyWikiCard
    subjectAreasResult,         // Q11: DASHBOARD: Subject Mastery (radar + bars)
    subjectMasteryResult,       // Q12: DASHBOARD: Subject Mastery (per-subject weights)
  ] = await Promise.all([
    // Q1
    supabase
      .from('user_global_stats')
      .select('global_readiness_score, target_exam_date, current_discipline_id, assessment_completed_at, score_reveal_shown_at, global_current_streak, global_longest_streak, last_study_date, readiness_sub_scores')
      .eq('user_id', user.id)
      .maybeSingle(),

    // Q2
    supabase
      .from('readiness_score_snapshots')
      .select('score')
      .eq('user_id', user.id)
      .order('computed_at', { ascending: false })
      .limit(2),

    // Q3
    supabase
      .from('quiz_sessions')
      .select('session_id, test_mode, current_question_index, question_ids, subject_ids, started_at, updated_at')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Q4: weak topics
    supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight, last_encountered, taxonomy_tree(name, subject_area)')
      .eq('user_id', user.id)
      .gt('total_attempts', 0)
      .order('current_mastery_weight', { ascending: true })
      .limit(4),

    // Q5: this week interactions
    supabase
      .from('user_interactions')
      .select('interaction_id, topic_id, interaction_timestamp')
      .eq('user_id', user.id)
      .gte('interaction_timestamp', thisWeek.start)
      .lt('interaction_timestamp', thisWeek.end),

    // Q6: last week interactions
    supabase
      .from('user_interactions')
      .select('interaction_id, topic_id, interaction_timestamp')
      .eq('user_id', user.id)
      .gte('interaction_timestamp', lastWeek.start)
      .lt('interaction_timestamp', lastWeek.end),

    // Q7: recent sessions (last 7 days) with subject info
    supabase
      .from('quiz_sessions')
      .select('session_id, test_mode, status, question_ids, subject_ids, completed_at, updated_at')
      .eq('user_id', user.id)
      .in('status', ['completed', 'abandoned'])
      .gte('updated_at', sevenDaysAgo)
      .order('updated_at', { ascending: false })
      .limit(5),

    // Q8: mastery entries for coverage calc
    supabase
      .from('user_node_mastery')
      .select('current_mastery_weight')
      .eq('user_id', user.id),

    // Q9: recent notes
    supabase
      .from('notes')
      .select('note_id, title, content, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(2),

    // Q10: wiki articles for daily rotation
    supabase
      .from('wiki_articles')
      .select('article_id, title, slug, content')
      .order('created_at', { ascending: true })
      .limit(50),

    // Q11: full taxonomy tree (levels 1-3) for radial heatmap structure
    // Exclude ALE-LAWS (cross-ref only, zero exam weight) and deprecated v1 nodes
    supabase
      .from('taxonomy_tree')
      .select('node_id, parent_id, level, name, subject_area')
      .in('level', [1, 2, 3])
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('ale_id', 'is', null)
      .order('subject_area')
      .order('level')
      .order('name'),

    // Q12: per-topic mastery for current user
    supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight, total_attempts')
      .eq('user_id', user.id),
  ])

  // ── Log partial failures ──────────────────────────────────────────────────
  const _queryResults = [
    { key: 'globalStats', result: globalStatsResult },
    { key: 'snapshots', result: snapshotsResult },
    { key: 'inProgress', result: inProgressResult },
    { key: 'focusTopics', result: focusTopicsResult },
    { key: 'thisWeekInteractions', result: thisWeekInteractionsResult },
    { key: 'lastWeekInteractions', result: lastWeekInteractionsResult },
    { key: 'recentSessions', result: recentSessionsResult },
    { key: 'masteryCount', result: masteryCountResult },
    { key: 'notes', result: notesResult },
    { key: 'wikiArticles', result: wikiArticlesResult },
    { key: 'subjectAreas', result: subjectAreasResult },
    { key: 'subjectMastery', result: subjectMasteryResult },
  ]

  const _failedKeys = _queryResults
    .filter(q => {
      const err = (q.result as any).error
      // Only treat as failure if error is a real Supabase PostgrestError (has message or code)
      return err != null && (err.message || err.code)
    })
    .map(q => {
      const err = (q.result as any).error
      console.error(`[DASHBOARD] ${q.key} query failed:`, JSON.stringify(err))
      return q.key
    })

  // ── Onboarding state queries (UX Strategy Section 7) ────────────────────

  const assessmentCompletedAt = globalStatsResult.data?.assessment_completed_at ?? null
  const scoreRevealShownAt = globalStatsResult.data?.score_reveal_shown_at ?? null

  // Check user tier
  const { data: userSub } = await supabase
    .from('user_subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle()

  const isFreeUser = !userSub || userSub.tier === 'free' || userSub.status !== 'active'

  // Active trail enrollment
  const { data: activeEnrollment } = await supabase
    .from('user_trail_enrollments')
    .select('enrollment_id, trail_id, current_day, status, camp_trails(slug, name, duration_days)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Score updates since reveal (for locked widget)
  let scoreUpdatesSinceReveal = 0
  if (isFreeUser && scoreRevealShownAt) {
    const { count } = await supabase
      .from('readiness_score_snapshots')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gt('computed_at', scoreRevealShownAt)
    scoreUpdatesSinceReveal = count ?? 0
  }

  // Determine onboarding state
  const onboardingState = (() => {
    if (!assessmentCompletedAt) return 'needs_assessment' as const
    if (!scoreRevealShownAt && isFreeUser) return 'needs_score_reveal' as const
    if (!activeEnrollment) return 'needs_trail' as const
    if (activeEnrollment.status === 'active') return 'active_trail' as const
    return 'ready' as const
  })()

  // Get active trail day info
  let activeTrailDay: {
    dayNumber: number
    title: string
    estimatedMinutes: number
    trailSlug: string
    topGapSubject?: string
  } | null = null

  if (activeEnrollment) {
    const trailData = activeEnrollment.camp_trails as any
    const { data: dayData } = await supabase
      .from('trail_days')
      .select('title, trail_steps(estimated_minutes)')
      .eq('trail_id', activeEnrollment.trail_id)
      .eq('day_number', activeEnrollment.current_day)
      .maybeSingle()

    const totalMinutes = ((dayData?.trail_steps as any[]) ?? [])
      .reduce((sum: number, s: any) => sum + (s.estimated_minutes ?? 0), 0)

    activeTrailDay = {
      dayNumber: activeEnrollment.current_day,
      title: dayData?.title ?? `Day ${activeEnrollment.current_day}`,
      estimatedMinutes: totalMinutes,
      trailSlug: trailData?.slug ?? '',
    }
  }

  // ── Streak data (Sprint 2) ──────────────────────────────────────────────

  const lastStudyDate = globalStatsResult.data?.last_study_date ?? null
  const globalCurrentStreak = globalStatsResult.data?.global_current_streak ?? 0
  const globalLongestStreak = globalStatsResult.data?.global_longest_streak ?? 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const streakStatus = (() => {
    if (lastStudyDate === today) return 'active' as const
    if (lastStudyDate === yesterday) return 'at_risk' as const
    return 'broken' as const
  })()

  // ── SRS review data (Sprint 2) ────────────────────────────────────────

  const now = new Date().toISOString()
  const { data: srsItems } = await supabase
    .from('user_node_mastery')
    .select('topic_id, taxonomy_tree(subject_area)')
    .eq('user_id', user.id)
    .lte('next_review_at', now)
    .gt('total_attempts', 0)

  const srsSubjects = new Set<string>()
  for (const item of (srsItems ?? [])) {
    const sa = (item.taxonomy_tree as any)?.subject_area
    if (sa) srsSubjects.add(sa)
  }

  const srsReview = {
    itemsDue: srsItems?.length ?? 0,
    subjects: Array.from(srsSubjects),
    estimatedMinutes: Math.max(5, Math.round((srsItems?.length ?? 0) * 1.5)),
  }

  // ── Extract ─────────────────────────────────────────────────────────────

  const globalStats = globalStatsResult.data
  const disciplineId = globalStats?.current_discipline_id
  const readinessScore = Math.round(globalStats?.global_readiness_score ?? 0)

  // Previous score
  const snapshots = snapshotsResult.data as Array<{ score: number }> | null
  const previousScore = snapshots && snapshots.length >= 2 ? Math.round(snapshots[1].score) : null

  // Exam date
  const examDateRaw = globalStats?.target_exam_date ?? null
  const examDate = examDateRaw ? new Date(examDateRaw).toISOString() : null
  let daysUntilExam: number | null = null
  if (examDateRaw) {
    const diff = new Date(examDateRaw).getTime() - Date.now()
    if (diff > 0) daysUntilExam = Math.ceil(diff / (24 * 60 * 60 * 1000))
  }

  // ── This week vs last week stats ────────────────────────────────────────

  const thisWeekRows = (thisWeekInteractionsResult.data ?? []) as Array<{ interaction_id: string; topic_id: string | null; interaction_timestamp: string }>
  const lastWeekRows = (lastWeekInteractionsResult.data ?? []) as Array<{ interaction_id: string; topic_id: string | null; interaction_timestamp: string }>

  const thisWeekQuestions = thisWeekRows.length
  const lastWeekQuestions = lastWeekRows.length
  const thisWeekTopics = new Set(thisWeekRows.filter(r => r.topic_id).map(r => r.topic_id)).size
  const lastWeekTopics = new Set(lastWeekRows.filter(r => r.topic_id).map(r => r.topic_id)).size
  const thisWeekDays = new Set(thisWeekRows.map(r => r.interaction_timestamp.split('T')[0])).size
  const lastWeekDays = new Set(lastWeekRows.map(r => r.interaction_timestamp.split('T')[0])).size

  // ── Hero micro-stats ────────────────────────────────────────────────────

  const heroStats: HeroMicroStat[] = [
    {
      value: thisWeekQuestions,
      label: 'Questions answered',
      description: '',
      delta: lastWeekQuestions > 0 ? thisWeekQuestions - lastWeekQuestions : null,
      tooltip: 'Total questions you\'ve answered in quiz sessions this week',
    },
    {
      value: thisWeekTopics,
      label: 'Topics studied',
      description: '',
      delta: lastWeekTopics > 0 ? thisWeekTopics - lastWeekTopics : null,
      tooltip: 'Number of distinct ALE topics you\'ve studied this week',
    },
    {
      value: thisWeekDays,
      label: 'Study days',
      description: '',
      delta: lastWeekDays > 0 ? thisWeekDays - lastWeekDays : null,
      tooltip: 'Days this week where you completed at least one session',
    },
  ]

  // ── Week at a glance ────────────────────────────────────────────────────

  const weekStats: WeekStat[] = [
    {
      value: thisWeekQuestions,
      label: 'Questions Answered',
      subLabel: 'this week',
      delta: lastWeekQuestions > 0 ? thisWeekQuestions - lastWeekQuestions : null,
      tooltip: 'Total questions you\'ve answered in quiz sessions this week',
    },
    {
      value: thisWeekTopics,
      label: 'Topics Touched',
      subLabel: 'this week',
      delta: lastWeekTopics > 0 ? thisWeekTopics - lastWeekTopics : null,
      tooltip: 'Number of distinct ALE topics you\'ve studied this week',
    },
    {
      value: thisWeekDays,
      label: 'Study Days',
      subLabel: 'this week',
      delta: lastWeekDays > 0 ? thisWeekDays - lastWeekDays : null,
      tooltip: 'Days this week where you completed at least one session',
    },
  ]

  // ── Syllabus coverage ───────────────────────────────────────────────────

  let totalLeaves = 0
  if (disciplineId) {
    const { count } = await supabase
      .from('taxonomy_tree')
      .select('node_id', { count: 'exact', head: true })
      .eq('discipline_id', disciplineId)
      .eq('is_leaf', true)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('ale_id', 'is', null)
    totalLeaves = count ?? 0
  }

  const masteryEntries = (masteryCountResult.data ?? []) as Array<{ current_mastery_weight: number }>
  const topicsWithAnyProgress = masteryEntries.filter(m => m.current_mastery_weight > 0).length
  const syllabusCoveragePercent = totalLeaves > 0 ? Math.round((topicsWithAnyProgress / totalLeaves) * 100) : 0

  // ── In-progress session ─────────────────────────────────────────────────

  const ipRaw = inProgressResult.data
  const inProgressSession: InProgressSession | null = ipRaw
    ? {
        sessionId: ipRaw.session_id,
        testMode: ipRaw.test_mode,
        currentIndex: ipRaw.current_question_index ?? 0,
        totalQuestions: ipRaw.question_ids?.length ?? 0,
        startedAt: ipRaw.started_at,
        updatedAt: ipRaw.updated_at,
      }
    : null

  // ── Subject mastery (radial heatmap + progress bars) ────────────────────

  const taxonomyRows = (subjectAreasResult.data ?? []) as Array<{
    node_id: string; parent_id: string | null; level: number; name: string; subject_area: string
  }>
  const masteryRows = (subjectMasteryResult.data ?? []) as Array<{
    topic_id: string; current_mastery_weight: number; total_attempts: number
  }>

  // Build mastery lookup: topic_id → { weight, attempts }
  const masteryMap = new Map<string, { weight: number; attempts: number }>()
  for (const m of masteryRows) {
    masteryMap.set(m.topic_id, { weight: m.current_mastery_weight, attempts: m.total_attempts })
  }

  // Group taxonomy: level 1 = subjects, level 2 = topics (rings), level 3 = leaves
  const level1 = taxonomyRows.filter(n => n.level === 1).sort((a, b) => a.name.localeCompare(b.name))
  const level2 = taxonomyRows.filter(n => n.level === 2)
  const level3 = taxonomyRows.filter(n => n.level === 3)

  // Map level 3 leaves to their level 2 parent for mastery aggregation
  const leavesByParent = new Map<string, typeof level3>()
  for (const leaf of level3) {
    const existing = leavesByParent.get(leaf.parent_id!) ?? []
    existing.push(leaf)
    leavesByParent.set(leaf.parent_id!, existing)
  }

  const subjectMastery: SubjectMastery[] = level1.map(subject => {
    const topics = level2.filter(t => t.parent_id === subject.node_id)

    const topicRings: TopicRing[] = topics.map(topic => {
      const leaves = leavesByParent.get(topic.node_id) ?? []
      let totalWeight = 0, totalAttempts = 0, count = 0
      for (const leaf of leaves) {
        const m = masteryMap.get(leaf.node_id)
        if (m) {
          totalWeight += m.weight
          totalAttempts += m.attempts
          count++
        }
      }
      return {
        topicName: topic.name,
        mastery: count > 0 ? Math.round((totalWeight / count) * 100) : 0,
        questionsAnswered: totalAttempts,
      }
    })

    const allAttempts = topicRings.reduce((sum, t) => sum + t.questionsAnswered, 0)
    const answeredTopics = topicRings.filter(t => t.questionsAnswered > 0)
    const avgMastery = answeredTopics.length > 0
      ? Math.round(answeredTopics.reduce((sum, t) => sum + t.mastery, 0) / answeredTopics.length)
      : 0

    return {
      subject: subject.name,
      shortLabel: shortLabel(subject.name),
      mastery: avgMastery,
      questionsAnswered: allAttempts,
      topics: topicRings,
    }
  })

  // ── Subject floor alerts (Task 0.3) ───────────────────────────────────
  // ALE requires minimum 50% per subject. Alert when any subject is below.
  const SUBJECT_FLOOR_PCT = 50 // from disciplines.subject_floor_pct default
  const subjectFloorAlerts: SubjectFloorAlert[] = subjectMastery
    .filter(s => s.questionsAnswered > 0 && s.mastery < SUBJECT_FLOOR_PCT)
    .map(s => ({
      subject: s.subject,
      mastery: s.mastery,
      floorPct: SUBJECT_FLOOR_PCT,
      gap: SUBJECT_FLOOR_PCT - s.mastery,
    }))
    .sort((a, b) => b.gap - a.gap)

  // ── Focus areas ─────────────────────────────────────────────────────────

  const focusRaw = (focusTopicsResult.data ?? []) as Array<{
    topic_id: string
    current_mastery_weight: number
    last_encountered: string
    taxonomy_tree: { name: string; subject_area: string } | null
  }>

  const focusAreas: FocusAreaItem[] = focusRaw
    .filter(r => r.current_mastery_weight < 0.76)
    .slice(0, 4)
    .map(row => ({
      topicId: row.topic_id,
      topicName: row.taxonomy_tree?.name ?? 'Unknown Topic',
      masteryWeight: row.current_mastery_weight,
      masteryLabel: getMasteryLabel(row.current_mastery_weight),
    }))

  // ── Recent sessions with subject lookup ─────────────────────────────────

  const recentRaw = (recentSessionsResult.data ?? []) as Array<{
    session_id: string
    test_mode: string
    status: string
    question_ids: string[]
    subject_ids: string[]
    completed_at: string | null
    updated_at: string
  }>

  // Get subject names for session subject_ids
  const allSubjectIds = [...new Set(recentRaw.flatMap(r => r.subject_ids ?? []))]
  let subjectNameMap = new Map<string, string>()
  if (allSubjectIds.length > 0) {
    const { data: subjects } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name')
      .in('node_id', allSubjectIds)
    if (subjects) {
      subjectNameMap = new Map(subjects.map((s: { node_id: string; name: string }) => [s.node_id, s.name]))
    }
  }

  // Get scores for recent sessions from user_interactions
  const sessionIds = recentRaw.map(r => r.session_id)
  let sessionScoreMap = new Map<string, number>()
  if (sessionIds.length > 0) {
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('session_id, is_correct')
      .in('session_id', sessionIds)

    if (interactions) {
      const grouped = new Map<string, { correct: number; total: number }>()
      for (const i of interactions as Array<{ session_id: string; is_correct: boolean }>) {
        const g = grouped.get(i.session_id) ?? { correct: 0, total: 0 }
        g.total++
        if (i.is_correct) g.correct++
        grouped.set(i.session_id, g)
      }
      for (const [sid, g] of grouped) {
        sessionScoreMap.set(sid, g.total > 0 ? Math.round((g.correct / g.total) * 100) : 0)
      }
    }
  }

  const recentSessions: ActivityFeedItem[] = recentRaw.map(row => {
    const mode = row.test_mode
    const firstSubjectId = row.subject_ids?.[0]
    return {
      sessionId: row.session_id,
      testMode: formatModeName(mode),
      modeBadge: MODE_BADGES[mode] ?? 'QUIZ',
      modeTooltip: MODE_TOOLTIPS[mode] ?? '',
      subjectName: firstSubjectId ? (subjectNameMap.get(firstSubjectId) ?? null) : null,
      scorePercent: sessionScoreMap.get(row.session_id) ?? null,
      questionCount: row.question_ids?.length ?? 0,
      status: row.status as 'completed' | 'abandoned',
      updatedAt: row.updated_at,
    }
  })

  // ── Action priority ─────────────────────────────────────────────────────

  const action = buildAction(inProgressSession, focusAreas)

  // ── Daily wiki article (deterministic rotation by day of year) ──────────

  let dailyArticle: DailyWikiArticle | null = null
  const wikiArticles = (wikiArticlesResult.data ?? []) as Array<{ article_id: string; title: string; slug: string; content: string }>
  if (wikiArticles.length > 0) {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000))
    const idx = dayOfYear % wikiArticles.length
    const article = wikiArticles[idx]
    // Extract first ~150 chars as excerpt (strip markdown)
    const plainText = article.content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim()
    dailyArticle = {
      articleId: article.article_id,
      title: article.title,
      slug: article.slug,
      excerpt: plainText.length > 150 ? plainText.slice(0, 147) + '...' : plainText,
    }
  }

  // ── Recent notes ────────────────────────────────────────────────────────

  const notesRaw = (notesResult.data ?? []) as Array<{ note_id: string; title: string; content: unknown; updated_at: string }>
  const recentNotes: NotePreview[] = notesRaw.map(n => {
    // Extract snippet from Tiptap JSONB content
    let snippet = ''
    if (Array.isArray(n.content)) {
      const textNodes = n.content
        .filter((block: any) => block.type === 'paragraph' && block.content)
        .flatMap((block: any) => block.content)
        .filter((node: any) => node.type === 'text')
        .map((node: any) => node.text)
      snippet = textNodes.join(' ').slice(0, 80)
    }
    return {
      noteId: n.note_id,
      title: n.title || 'Untitled Note',
      snippet: snippet || 'No preview available',
      updatedAt: n.updated_at,
    }
  })

  // ── 3D Lab module count ─────────────────────────────────────────────────
  // Models_3d table has 0 rows in production, but we count anyway
  const { count: labCount } = await supabase
    .from('models_3d')
    .select('model_id', { count: 'exact', head: true })

  // ── Readiness score anti-inflation metadata ────────────────────────────
  const subScores = (globalStats as any)?.readiness_sub_scores ?? {}
  const readinessMeta = subScores._meta
    ? {
        ceilingActive: subScores._meta.ceilingActive as boolean | undefined,
        ceilingValue: subScores._meta.ceilingValue as number | null | undefined,
        ceilingReason: subScores._meta.ceilingReason as string | null | undefined,
        greyPenalty: subScores._meta.greyPenalty as number | undefined,
      }
    : null

  return {
    userName: firstName,
    readinessScore,
    previousScore,
    examDate,
    daysUntilExam,
    heroStats,
    syllabusCoveragePercent,
    readinessMeta,
    action,
    focusAreas,
    subjectMastery,
    subjectFloorAlerts,
    recentSessions,
    weekStats,
    inProgressSession,
    dailyArticle,
    recentNotes,
    labModuleCount: labCount ?? 0,
    onboardingState,
    scoreUpdatesSinceReveal,
    isFreeUser,
    activeTrailDay,
    streak: {
      currentStreak: globalCurrentStreak,
      longestStreak: globalLongestStreak,
      streakStatus,
    },
    srsReview,
  }
}

// ── Action builder ──────────────────────────────────────────────────────────

function buildAction(
  inProgress: InProgressSession | null,
  focusAreas: FocusAreaItem[],
): RecommendedAction {
  if (inProgress) {
    const remaining = inProgress.totalQuestions - inProgress.currentIndex
    const mode = inProgress.testMode
    return {
      type: 'resume',
      title: `Continue ${formatModeName(mode)}`,
      subtitle: `Question ${inProgress.currentIndex + 1} of ${inProgress.totalQuestions} — pick up where you left off`,
      ctaLabel: 'Continue',
      href: `/dashboard/testing?session=${inProgress.sessionId}`,
      estimatedMinutes: Math.max(1, Math.ceil(remaining * 1.2)),
      modeTooltip: MODE_TOOLTIPS[mode] ?? '',
      progress: { current: inProgress.currentIndex + 1, total: inProgress.totalQuestions },
    }
  }

  if (focusAreas.length > 0) {
    const weakest = focusAreas[0]
    return {
      type: 'blindspot',
      title: `Practice: ${weakest.topicName}`,
      subtitle: `This topic needs attention — 10 focused questions to strengthen your understanding`,
      ctaLabel: 'Start session',
      href: '/dashboard/testing?mode=camp',
      estimatedMinutes: 8,
      modeTooltip: MODE_TOOLTIPS['camp'] ?? '',
    }
  }

  return {
    type: 'warmup',
    title: 'Start a Camp session',
    subtitle: '10 questions across your core subjects — about 8 minutes',
    ctaLabel: 'Begin',
    href: '/dashboard/testing?mode=camp',
    estimatedMinutes: 8,
    modeTooltip: MODE_TOOLTIPS['camp'] ?? '',
  }
}

// ── Empty dashboard ─────────────────────────────────────────────────────────

function emptyDashboard(userName: string): DashboardPageData {
  return {
    userName,
    readinessScore: 0,
    previousScore: null,
    examDate: null,
    daysUntilExam: null,
    heroStats: [
      { value: 0, label: 'Questions answered', description: '', delta: null, tooltip: 'Total questions answered this week' },
      { value: 0, label: 'Topics studied', description: '', delta: null, tooltip: 'Topics studied this week' },
      { value: 0, label: 'Study days', description: '', delta: null, tooltip: 'Days with at least one session this week' },
    ],
    syllabusCoveragePercent: 0,
    readinessMeta: null,
    action: {
      type: 'warmup',
      title: 'Start Your First Session',
      subtitle: 'Jump in with a quick warmup — no setup needed',
      ctaLabel: 'Begin',
      href: '/dashboard/testing?mode=camp',
      estimatedMinutes: 3,
      modeTooltip: MODE_TOOLTIPS['camp'] ?? '',
    },
    focusAreas: [],
    subjectMastery: [],
    subjectFloorAlerts: [],
    recentSessions: [],
    weekStats: [
      { value: 0, label: 'Questions Answered', subLabel: 'this week', delta: null, tooltip: 'Total questions answered this week' },
      { value: 0, label: 'Topics Touched', subLabel: 'this week', delta: null, tooltip: 'Topics studied this week' },
      { value: 0, label: 'Study Days', subLabel: 'this week', delta: null, tooltip: 'Days with at least one session this week' },
    ],
    inProgressSession: null,
    dailyArticle: null,
    recentNotes: [],
    labModuleCount: 0,
    onboardingState: 'needs_assessment',
    scoreUpdatesSinceReveal: 0,
    isFreeUser: true,
    activeTrailDay: null,
    streak: { currentStreak: 0, longestStreak: 0, streakStatus: 'broken' },
    srsReview: { itemsDue: 0, subjects: [], estimatedMinutes: 0 },
  }
}
