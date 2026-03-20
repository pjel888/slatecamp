'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import type { DashboardPageData } from '@/types/dashboard'
import { MODE_TOOLTIPS, getWeekBoundary } from './dashboard-helpers'
import { buildSubjectMastery, buildSubjectFloorAlerts, buildFocusAreas, buildSyllabusCoverage } from './mastery-actions'
import { buildInProgressSession, buildRecentSessions, buildAction } from './session-actions'
import { computeWeekCounts, buildHeroStats, buildWeekStats, buildStreakData, buildSrsReview, buildDailyArticle, buildRecentNotes, buildReadinessMeta } from './stats-actions'

// ── Main fetcher ────────────────────────────────────────────────────────────

export const getDashboardPageData = async (): Promise<DashboardPageData> => {
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

  // ── Extract globals ───────────────────────────────────────────────────────

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

  // ── Delegate to domain modules ────────────────────────────────────────────

  const thisWeekCounts = computeWeekCounts(
    (thisWeekInteractionsResult.data ?? []) as Array<{ interaction_id: string; topic_id: string | null; interaction_timestamp: string }>
  )
  const lastWeekCounts = computeWeekCounts(
    (lastWeekInteractionsResult.data ?? []) as Array<{ interaction_id: string; topic_id: string | null; interaction_timestamp: string }>
  )

  const heroStats = buildHeroStats(thisWeekCounts, lastWeekCounts)
  const weekStats = buildWeekStats(thisWeekCounts, lastWeekCounts)
  const streak = buildStreakData(globalStats)
  const readinessMeta = buildReadinessMeta(globalStats)
  const dailyArticle = buildDailyArticle(wikiArticlesResult.data)
  const recentNotes = buildRecentNotes(notesResult.data)
  const inProgressSession = buildInProgressSession(inProgressResult.data)
  const focusAreas = buildFocusAreas(focusTopicsResult.data)
  const subjectMastery = buildSubjectMastery(subjectAreasResult.data, subjectMasteryResult.data)
  const subjectFloorAlerts = buildSubjectFloorAlerts(subjectMastery)
  const action = buildAction(inProgressSession, focusAreas)

  const [syllabusCoveragePercent, recentSessions, srsReview] = await Promise.all([
    buildSyllabusCoverage(supabase, disciplineId, masteryCountResult.data),
    buildRecentSessions(supabase, recentSessionsResult.data),
    buildSrsReview(supabase, user.id),
  ])

  // ── 3D Lab module count ─────────────────────────────────────────────────
  const { count: labCount } = await supabase
    .from('models_3d')
    .select('model_id', { count: 'exact', head: true })

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
    streak,
    srsReview,
  }
}

// ── Empty dashboard ─────────────────────────────────────────────────────────

const emptyDashboard = (userName: string): DashboardPageData => {
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
