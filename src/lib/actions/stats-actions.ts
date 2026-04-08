import { unstable_cache } from 'next/cache'
import { createClient, getUser, createServiceClient } from '@/lib/supabase/server'
import { getWeekBoundary } from './dashboard-helpers'
import { transformSyllabusCoverage } from './mastery-actions'
import { getCachedTaxonomyTreeByDiscipline, getCachedWikiArticles } from './cached-queries'
import {
  getDashboardTag,
  getReadinessScoreTag,
  getUserMasteryTag,
  getUserStatsTag,
} from './cache-tags'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  HeroMicroStat,
  WeekStat,
  DailyWikiArticle,
  NotePreview,
} from '@/types/dashboard'

// ── Week interaction stats ──────────────────────────────────────────────────

interface WeekInteractionRow {
  topic_id: string | null
  interaction_timestamp: string
}

interface WeekInteractionCounts {
  questions: number
  topics: number
  days: number
}

export const computeWeekCounts = (rows: WeekInteractionRow[]): WeekInteractionCounts => {
  return {
    questions: rows.length,
    topics: new Set(rows.filter(r => r.topic_id).map(r => r.topic_id)).size,
    days: new Set(rows.map(r => r.interaction_timestamp.split('T')[0])).size,
  }
}

// ── Hero micro-stats ────────────────────────────────────────────────────────

export const buildHeroStats = (
  thisWeek: WeekInteractionCounts,
  lastWeek: WeekInteractionCounts,
): HeroMicroStat[] => {
  return [
    {
      value: thisWeek.questions,
      label: 'Questions answered',
      description: '',
      delta: lastWeek.questions > 0 ? thisWeek.questions - lastWeek.questions : null,
      tooltip: 'Total questions you\'ve answered in quiz sessions this week',
    },
    {
      value: thisWeek.topics,
      label: 'Topics studied',
      description: '',
      delta: lastWeek.topics > 0 ? thisWeek.topics - lastWeek.topics : null,
      tooltip: 'Number of distinct LEA topics you\'ve studied this week',
    },
    {
      value: thisWeek.days,
      label: 'Study days',
      description: '',
      delta: lastWeek.days > 0 ? thisWeek.days - lastWeek.days : null,
      tooltip: 'Days this week where you completed at least one session',
    },
  ]
}

// ── Week at a glance ────────────────────────────────────────────────────────

export const buildWeekStats = (
  thisWeek: WeekInteractionCounts,
  lastWeek: WeekInteractionCounts,
): WeekStat[] => {
  return [
    {
      value: thisWeek.questions,
      label: 'Questions Answered',
      subLabel: 'this week',
      delta: lastWeek.questions > 0 ? thisWeek.questions - lastWeek.questions : null,
      tooltip: 'Total questions you\'ve answered in quiz sessions this week',
    },
    {
      value: thisWeek.topics,
      label: 'Topics Touched',
      subLabel: 'this week',
      delta: lastWeek.topics > 0 ? thisWeek.topics - lastWeek.topics : null,
      tooltip: 'Number of distinct LEA topics you\'ve studied this week',
    },
    {
      value: thisWeek.days,
      label: 'Study Days',
      subLabel: 'this week',
      delta: lastWeek.days > 0 ? thisWeek.days - lastWeek.days : null,
      tooltip: 'Days this week where you completed at least one session',
    },
  ]
}

// ── Streak data ─────────────────────────────────────────────────────────────

export const buildStreakData = (
  globalStats: any | null,
): { currentStreak: number; longestStreak: number; streakStatus: 'active' | 'at_risk' | 'broken' } => {
  const lastStudyDate = globalStats?.last_study_date ?? null
  const globalCurrentStreak = globalStats?.global_current_streak ?? 0
  const globalLongestStreak = globalStats?.global_longest_streak ?? 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const streakStatus = (() => {
    if (lastStudyDate === today) return 'active' as const
    if (lastStudyDate === yesterday) return 'at_risk' as const
    return 'broken' as const
  })()

  return {
    currentStreak: globalCurrentStreak,
    longestStreak: globalLongestStreak,
    streakStatus,
  }
}

export const getStreakData = async () => {
  const { data: { user } } = await getUser()
  if (!user) return { currentStreak: 0, longestStreak: 0, streakStatus: 'broken' as const }

  return unstable_cache(
    async () => {
      const supabase = await createServiceClient()
      const { data: globalStats } = await supabase
        .from('user_global_stats')
        .select('global_current_streak, global_longest_streak, last_study_date')
        .eq('user_id', user.id)
        .maybeSingle()

      return buildStreakData(globalStats)
    },
    ['streak-data', user.id],
    {
      revalidate: false,
      tags: [getDashboardTag(user.id), getUserStatsTag(user.id)],
    },
  )()
}

/**
 * Server action to fetch hero data for the current user.
 */
export const getHeroData = async () => {
  const { data: { user } } = await getUser()
  if (!user) return null

  return unstable_cache(
    async () => {
      const supabase = await createServiceClient()
      const thisWeek = getWeekBoundary(0)
      const lastWeek = getWeekBoundary(1)

      const [
        globalStatsResult,
        snapshotsResult,
        thisWeekInteractionsResult,
        lastWeekInteractionsResult,
        masteryCountResult,
      ] = await Promise.all([
        supabase
          .from('user_global_stats')
          .select('global_readiness_score, target_exam_date, current_discipline_id, last_study_date, readiness_sub_scores')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('readiness_score_snapshots')
          .select('score')
          .eq('user_id', user.id)
          .order('computed_at', { ascending: false })
          .limit(2),
        supabase
          .from('user_interactions')
          .select('topic_id, interaction_timestamp')
          .eq('user_id', user.id)
          .gte('interaction_timestamp', thisWeek.start)
          .lt('interaction_timestamp', thisWeek.end),
        supabase
          .from('user_interactions')
          .select('topic_id, interaction_timestamp')
          .eq('user_id', user.id)
          .gte('interaction_timestamp', lastWeek.start)
          .lt('interaction_timestamp', lastWeek.end),
        supabase
          .from('user_node_mastery')
          .select('current_mastery_weight')
          .eq('user_id', user.id),
      ])

      const globalStats = globalStatsResult.data
      const readinessScore = Math.round(globalStats?.global_readiness_score ?? 0)
      const snapshots = snapshotsResult.data as Array<{ score: number }> | null
      const previousScore = snapshots && snapshots.length >= 2 ? Math.round(snapshots[1].score) : null

      const examDateRaw = globalStats?.target_exam_date ?? null
      let daysUntilExam: number | null = null
      if (examDateRaw) {
        const diff = new Date(examDateRaw).getTime() - Date.now()
        if (diff > 0) daysUntilExam = Math.ceil(diff / (24 * 60 * 60 * 1000))
      }

      const thisWeekCounts = computeWeekCounts((thisWeekInteractionsResult.data ?? []) as WeekInteractionRow[])
      const lastWeekCounts = computeWeekCounts((lastWeekInteractionsResult.data ?? []) as WeekInteractionRow[])
      const disciplineRows =
        globalStats?.current_discipline_id
          ? await getCachedTaxonomyTreeByDiscipline(globalStats.current_discipline_id)
          : []

      const heroStats = buildHeroStats(thisWeekCounts, lastWeekCounts)
      const readinessMeta = buildReadinessMeta(globalStats)
      const syllabusCoveragePercent = transformSyllabusCoverage(
        disciplineRows.filter((row) => row.is_leaf).length,
        masteryCountResult.data,
      )

      const firstName =
        user?.user_metadata?.full_name?.split(' ')[0] ??
        user?.email?.split('@')[0] ??
        'there'

      return {
        userName: firstName,
        readinessScore,
        previousScore,
        daysUntilExam,
        heroStats,
        syllabusCoveragePercent,
        readinessMeta,
      }
    },
    ['hero-data', user.id],
    {
      revalidate: false,
      tags: [
        getDashboardTag(user.id),
        getUserStatsTag(user.id),
        getUserMasteryTag(user.id),
        getReadinessScoreTag(user.id),
      ],
    },
  )()
}

/**
 * Server action to fetch daily wiki and recent notes data for the current user.
 */
export const getDailyWikiData = async () => {
  const { data: { user } } = await getUser()
  if (!user) return { dailyArticle: null, recentNotes: [] }

  const supabase = await createServiceClient()
  const [notesResult, wikiArticlesResult] = await Promise.all([
    supabase
      .from('notes')
      .select('note_id, title, content, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(2),
    getCachedWikiArticles(),
  ])

  const dailyArticle = buildDailyArticle(wikiArticlesResult)
  const recentNotes = buildRecentNotes(notesResult.data)

  return { dailyArticle, recentNotes }
}

// ── SRS review data ─────────────────────────────────────────────────────────

export const transformSrsReview = (
  srsItems: any[] | null,
): { itemsDue: number; subjects: string[]; estimatedMinutes: number } => {
  const srsSubjects = new Set<string>()
  for (const item of (srsItems ?? [])) {
    const sa = (item.taxonomy_tree as any)?.subject_area
    if (sa) srsSubjects.add(sa)
  }

  return {
    itemsDue: srsItems?.length ?? 0,
    subjects: Array.from(srsSubjects),
    estimatedMinutes: Math.max(5, Math.round((srsItems?.length ?? 0) * 1.5)),
  }
}

// ── Daily wiki article (deterministic rotation by day of year) ──────────────

export const buildDailyArticle = (wikiArticlesData: any[] | null): DailyWikiArticle | null => {
  const wikiArticles = (wikiArticlesData ?? []) as Array<{
    article_id: string
    title: string
    slug: string
    excerpt: string
  }>
  if (wikiArticles.length === 0) return null

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000))
  const idx = dayOfYear % wikiArticles.length
  const article = wikiArticles[idx]
  return {
    articleId: article.article_id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
  }
}

// ── Recent notes ────────────────────────────────────────────────────────────

export const buildRecentNotes = (notesData: any[] | null): NotePreview[] => {
  const notesRaw = (notesData ?? []) as Array<{ note_id: string; title: string; content: unknown; updated_at: string }>
  return notesRaw.map(n => {
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
}

// ── Readiness score metadata ────────────────────────────────────────────────

export const buildReadinessMeta = (globalStats: any | null): {
  ceilingActive?: boolean
  ceilingValue?: number | null
  ceilingReason?: string | null
  greyPenalty?: number
} | null => {
  const subScores = (globalStats as any)?.readiness_sub_scores ?? {}
  return subScores._meta
    ? {
        ceilingActive: subScores._meta.ceilingActive as boolean | undefined,
        ceilingValue: subScores._meta.ceilingValue as number | null | undefined,
        ceilingReason: subScores._meta.ceilingReason as string | null | undefined,
        greyPenalty: subScores._meta.greyPenalty as number | undefined,
      }
    : null
}
