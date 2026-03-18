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
} from '@/types/dashboard'

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
  ] = await Promise.all([
    // Q1
    supabase
      .from('user_global_stats')
      .select('global_readiness_score, target_exam_date, current_discipline_id')
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
  ])

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

  return {
    userName: firstName,
    readinessScore,
    previousScore,
    examDate,
    daysUntilExam,
    heroStats,
    syllabusCoveragePercent,
    action,
    focusAreas,
    recentSessions,
    weekStats,
    inProgressSession,
    dailyArticle,
    recentNotes,
    labModuleCount: labCount ?? 0,
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
  }
}
