import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  HeroMicroStat,
  WeekStat,
  DailyWikiArticle,
  NotePreview,
} from '@/types/dashboard'

// ── Week interaction stats ──────────────────────────────────────────────────

interface WeekInteractionRow {
  interaction_id: string
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
      tooltip: 'Number of distinct ALE topics you\'ve studied this week',
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
      tooltip: 'Number of distinct ALE topics you\'ve studied this week',
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

// ── SRS review data ─────────────────────────────────────────────────────────

export const buildSrsReview = async (
  supabase: SupabaseClient,
  userId: string,
): Promise<{ itemsDue: number; subjects: string[]; estimatedMinutes: number }> => {
  const now = new Date().toISOString()
  const { data: srsItems } = await supabase
    .from('user_node_mastery')
    .select('topic_id, taxonomy_tree(subject_area)')
    .eq('user_id', userId)
    .lte('next_review_at', now)
    .gt('total_attempts', 0)

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
  const wikiArticles = (wikiArticlesData ?? []) as Array<{ article_id: string; title: string; slug: string; content: string }>
  if (wikiArticles.length === 0) return null

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
  return {
    articleId: article.article_id,
    title: article.title,
    slug: article.slug,
    excerpt: plainText.length > 150 ? plainText.slice(0, 147) + '...' : plainText,
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
