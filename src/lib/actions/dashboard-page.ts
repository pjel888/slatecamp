'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import type { DashboardPageData } from '@/types/dashboard'
import { MODE_TOOLTIPS, getWeekBoundary } from './dashboard-helpers'
import { 
  buildSubjectMastery, 
  transformProjectedLawsMastery, 
  buildSubjectFloorAlerts, 
  buildFocusAreas, 
  transformSyllabusCoverage 
} from './mastery-actions'
import { buildInProgressSession, buildRecentSessions, buildAction } from './session-actions'
import { 
  computeWeekCounts, 
  buildHeroStats, 
  buildWeekStats, 
  buildStreakData, 
  transformSrsReview, 
  buildDailyArticle, 
  buildRecentNotes, 
  buildReadinessMeta 
} from './stats-actions'
import { getCachedTaxonomyTreeByDiscipline, getCachedWikiArticles } from './cached-queries'
import { getDashboardCacheTags } from './cache-tags'

interface ProjectedLawsMasteryRow {
  topic_id: string
  current_mastery_weight: number | null
  total_attempts: number | null
}

// ── Main fetcher ────────────────────────────────────────────────────────────

export const getDashboardPageData = async (): Promise<DashboardPageData> => {
  const { data: { user } } = await getUser()
  if (!user) {
    return emptyDashboard('there')
  }

  // Wrapped in unstable_cache for sub-second performance on study navigation
  // Invalidated via semantic dashboard tags in quiz actions
  return unstable_cache(
    async () => fetchDashboardData(user),
    [`dashboard-${user.id}`],
    {
      revalidate: 3600, // 1 hour fallback
      tags: getDashboardCacheTags(user.id),
    }
  )()
}

const fetchDashboardData = async (user: any): Promise<DashboardPageData> => {
  const supabase = await createClient()

  const firstName =
    user?.user_metadata?.full_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'there'

  const thisWeek = getWeekBoundary(0)
  const lastWeek = getWeekBoundary(1)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const globalStatsPromise = supabase
    .from('user_global_stats')
    .select('global_readiness_score, target_exam_date, current_discipline_id, assessment_completed_at, score_reveal_shown_at, global_current_streak, global_longest_streak, last_study_date, readiness_sub_scores')
    .eq('user_id', user.id)
    .maybeSingle()
    .then((result) => result)
  const snapshotsPromise = supabase
    .from('readiness_score_snapshots')
    .select('score')
    .eq('user_id', user.id)
    .order('computed_at', { ascending: false })
    .limit(2)
    .then((result) => result)
  const inProgressPromise = supabase
    .from('quiz_sessions')
    .select('session_id, test_mode, current_question_index, question_ids, subject_ids, started_at, updated_at')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
    .then((result) => result)
  const focusTopicsPromise = supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, taxonomy_tree(name, subject_area)')
    .eq('user_id', user.id)
    .gt('total_attempts', 0)
    .order('current_mastery_weight', { ascending: true })
    .limit(4)
    .then((result) => result)
  const thisWeekInteractionsPromise = supabase
    .from('user_interactions')
    .select('topic_id, interaction_timestamp')
    .eq('user_id', user.id)
    .gte('interaction_timestamp', thisWeek.start)
    .lt('interaction_timestamp', thisWeek.end)
    .then((result) => result)
  const lastWeekInteractionsPromise = supabase
    .from('user_interactions')
    .select('topic_id, interaction_timestamp')
    .eq('user_id', user.id)
    .gte('interaction_timestamp', lastWeek.start)
    .lt('interaction_timestamp', lastWeek.end)
    .then((result) => result)
  const recentSessionsQueryPromise = supabase
    .from('quiz_sessions')
    .select('session_id, test_mode, status, question_ids, subject_ids, updated_at')
    .eq('user_id', user.id)
    .in('status', ['completed', 'abandoned'])
    .gte('updated_at', sevenDaysAgo)
    .order('updated_at', { ascending: false })
    .limit(5)
    .then((result) => result)
  const masteryCountPromise = supabase
    .from('user_node_mastery')
    .select('current_mastery_weight')
    .eq('user_id', user.id)
    .then((result) => result)
  const notesPromise = supabase
    .from('notes')
    .select('note_id, title, content, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(2)
    .then((result) => result)
  const wikiArticlesPromise = getCachedWikiArticles().then((data) => ({ data, error: null }))
  const subjectMasteryPromise = supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, total_attempts')
    .eq('user_id', user.id)
    .then((result) => result)
  const totalSessionsPromise = supabase
    .from('quiz_sessions')
    .select('session_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .then((result) => result)
  const userSubPromise = supabase
    .from('user_subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle()
    .then((result) => result)
  const activeEnrollmentPromise = supabase
    .from('user_trail_enrollments')
    .select('enrollment_id, trail_id, current_day, status, camp_trails(slug, name, duration_days)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
    .then((result) => result)
  const profilePromise = supabase
    .from('profiles')
    .select('ale_result, enrolled_review_center')
    .eq('id', user.id)
    .maybeSingle()
    .then((result) => result)
  const srsReviewPromise = supabase
    .from('user_node_mastery')
    .select('taxonomy_tree(subject_area)')
    .eq('user_id', user.id)
    .lte('next_review_at', new Date().toISOString())
    .gt('total_attempts', 0)
    .then((result) => result)
  const labCountPromise = supabase
    .from('models_3d')
    .select('model_id', { count: 'exact', head: true })
    .then((result) => result)
  const projectedLawsPromise = supabase
    .from('taxonomy_tree')
    .select('node_id, name, ale_id')
    .eq('ale_id', 'ALE-LAWS')
    .single()
    .then(async ({ data: lawsSubject }) => {
    if (!lawsSubject) return null

    const { data: subtopics } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name')
      .eq('parent_id', lawsSubject.node_id)
      .eq('level', 2)
      .is('deprecated_at', null)
      .order('name')

    if (!subtopics?.length) return { lawsSubject, subtopics: [] }

    const subIds = subtopics.map((subtopic) => subtopic.node_id)
    const [crossRes, leavesRes] = await Promise.all([
      supabase
        .from('taxonomy_cross_references')
        .select('source_node_id, target_node_id')
        .in('source_node_id', subIds),
      supabase
        .from('taxonomy_tree')
        .select('node_id, parent_id')
        .in('parent_id', subIds)
        .eq('is_leaf', true)
        .is('deprecated_at', null),
    ])

    const leafIds = leavesRes.data?.map((leaf) => leaf.node_id) ?? []
    const masteryResponse = leafIds.length > 0
      ? await supabase
          .from('user_node_mastery')
          .select('topic_id, current_mastery_weight, total_attempts')
          .eq('user_id', user.id)
          .in('topic_id', leafIds)
      : { data: [] as ProjectedLawsMasteryRow[] }

    return {
      lawsSubject,
      subtopics,
      crossRefs: crossRes.data,
      targetLeaves: leavesRes.data,
      masteryRows: masteryResponse.data,
    }
  })

  const subjectAreasPromise = globalStatsPromise.then(async ({ data: globalStats }) => {
    const disciplineId = globalStats?.current_discipline_id ?? null
    return disciplineId ? getCachedTaxonomyTreeByDiscipline(disciplineId) : []
  })
  const scoreUpdatesPromise = globalStatsPromise.then(async ({ data: globalStats }) => {
    const scoreRevealShownAt = globalStats?.score_reveal_shown_at ?? null
    if (!scoreRevealShownAt) return { count: 0 }

    return supabase
      .from('readiness_score_snapshots')
      .select('score', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gt('computed_at', scoreRevealShownAt)
  })
  const trailDayPromise = activeEnrollmentPromise.then(async ({ data: activeEnrollment }) => {
    if (!activeEnrollment) return { data: null }

    return supabase
      .from('trail_days')
      .select('title, trail_steps(estimated_minutes)')
      .eq('trail_id', activeEnrollment.trail_id)
      .eq('day_number', activeEnrollment.current_day)
      .maybeSingle()
  })
  const recentSessionsPromise = recentSessionsQueryPromise.then(
    ({ data: recentSessionsData }) => buildRecentSessions(supabase, recentSessionsData),
  )

  const [
    globalStatsResult,
    snapshotsResult,
    inProgressResult,
    focusTopicsResult,
    thisWeekInteractionsResult,
    lastWeekInteractionsResult,
    masteryCountResult,
    notesResult,
    wikiArticlesResult,
    subjectMasteryResult,
    totalSessionsResult,
    userSubResult,
    activeEnrollmentResult,
    profileResult,
    srsReviewResult,
    labCountResult,
    projectedLawsResult,
    subjectAreasResult,
    scoreUpdatesResult,
    trailDayResult,
    recentSessions,
  ] = await Promise.all([
    globalStatsPromise,
    snapshotsPromise,
    inProgressPromise,
    focusTopicsPromise,
    thisWeekInteractionsPromise,
    lastWeekInteractionsPromise,
    masteryCountPromise,
    notesPromise,
    wikiArticlesPromise,
    subjectMasteryPromise,
    totalSessionsPromise,
    userSubPromise,
    activeEnrollmentPromise,
    profilePromise,
    srsReviewPromise,
    labCountPromise,
    projectedLawsPromise,
    subjectAreasPromise,
    scoreUpdatesPromise,
    trailDayPromise,
    recentSessionsPromise,
  ])

  // ── Transform Data (Synchronous) ──────────────────────────────────────────

  const globalStats = globalStatsResult.data
  const readinessScore = Math.round(globalStats?.global_readiness_score ?? 0)

  const thisWeekCounts = computeWeekCounts((thisWeekInteractionsResult.data ?? []) as any)
  const lastWeekCounts = computeWeekCounts((lastWeekInteractionsResult.data ?? []) as any)

  const heroStats = buildHeroStats(thisWeekCounts, lastWeekCounts)
  const weekStats = buildWeekStats(thisWeekCounts, lastWeekCounts)
  const streak = buildStreakData(globalStats)
  const readinessMeta = buildReadinessMeta(globalStats)
  const dailyArticle = buildDailyArticle(wikiArticlesResult.data)
  const recentNotes = buildRecentNotes(notesResult.data)
  const inProgressSession = buildInProgressSession(inProgressResult.data)
  const focusAreas = buildFocusAreas(focusTopicsResult.data)
  const subjectMastery = buildSubjectMastery(subjectAreasResult, subjectMasteryResult.data)

  const action = buildAction(inProgressSession, focusAreas)

  const srsReview = transformSrsReview(srsReviewResult.data)
  const labModuleCount = labCountResult.count ?? 0
  const syllabusCoveragePercent = transformSyllabusCoverage(
    subjectAreasResult.filter((row: { is_leaf?: boolean }) => row.is_leaf).length,
    masteryCountResult.data,
  )

  const pl = projectedLawsResult as any
  const projectedLaws = transformProjectedLawsMastery(pl?.lawsSubject, pl?.subtopics, pl?.crossRefs, pl?.targetLeaves, pl?.masteryRows)
  if (projectedLaws) subjectMastery.push(projectedLaws)

  const subjectFloorAlerts = buildSubjectFloorAlerts(subjectMastery)
  const sessionsCompleted = totalSessionsResult.count ?? 0
  const masteryEntries = masteryCountResult.data ?? []
  const greenTopics = masteryEntries.filter((e: any) => e.current_mastery_weight >= 0.7).length
  const totalTopics = masteryEntries.length

  const examDateRaw = globalStats?.target_exam_date ?? null
  const examDate = examDateRaw ? new Date(examDateRaw).toISOString() : null
  let daysUntilExam: number | null = null
  if (examDateRaw) {
    const diff = new Date(examDateRaw).getTime() - Date.now()
    if (diff > 0) daysUntilExam = Math.ceil(diff / (24 * 60 * 60 * 1000))
  }

  const aleResult = profileResult.data?.ale_result ?? null
  const enrolledReviewCenter = profileResult.data?.enrolled_review_center ?? null
  let showResultsDayBanner = false
  if (examDateRaw && !aleResult) {
    const daysSinceExam = Math.floor((Date.now() - new Date(examDateRaw).getTime()) / (24 * 60 * 60 * 1000))
    showResultsDayBanner = daysSinceExam >= 3 && daysSinceExam <= 14
  }

  return {
    userName: firstName,
    readinessScore,
    previousScore: (snapshotsResult.data && snapshotsResult.data.length >= 2) ? Math.round(snapshotsResult.data[1].score) : null,
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
    labModuleCount,
    onboardingState: (() => {
      const assessmentCompletedAt = globalStats?.assessment_completed_at ?? null
      const scoreRevealShownAt = globalStats?.score_reveal_shown_at ?? null
      const userSub = userSubResult.data
      const activeEnrollment = activeEnrollmentResult.data
      const isFreeUser = !userSub || userSub.tier === 'free' || userSub.status !== 'active'
      if (!assessmentCompletedAt) return 'needs_assessment'
      if (!scoreRevealShownAt && isFreeUser) return 'needs_score_reveal'
      if (!activeEnrollment) return 'needs_trail'
      if (activeEnrollment.status === 'active') return 'active_trail'
      return 'ready'
    })() as any,
    scoreUpdatesSinceReveal: (scoreUpdatesResult as any).count ?? 0,
    isFreeUser: !userSubResult.data || userSubResult.data.tier === 'free' || userSubResult.data.status !== 'active',
    activeTrailDay: activeEnrollmentResult.data ? {
      dayNumber: activeEnrollmentResult.data.current_day,
      title: (trailDayResult as any).data?.title ?? `Day ${activeEnrollmentResult.data.current_day}`,
      estimatedMinutes: ((trailDayResult as any).data?.trail_steps ?? []).reduce((sum: number, s: any) => sum + (s.estimated_minutes ?? 0), 0),
      trailSlug: (activeEnrollmentResult.data.camp_trails as any)?.slug ?? '',
    } : null,
    streak,
    srsReview,
    sessionsCompleted,
    greenTopics,
    totalTopics,
    aleResult,
    enrolledReviewCenter,
    showResultsDayBanner,
  }
}

const emptyDashboard = (userName: string): DashboardPageData => ({
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
    href: '/quiz/camp/setup',
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
  sessionsCompleted: 0,
  greenTopics: 0,
  totalTopics: 0,
  aleResult: null,
  enrolledReviewCenter: null,
  showResultsDayBanner: false,
})
