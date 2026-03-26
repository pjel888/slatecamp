'use server'

import { createClient } from '@/lib/supabase/server'
import type { Recommendation } from '@/types/quiz-config'

// ─── Helper: Topic accuracy for a session ────────────────────────────────────

interface TopicAccuracy {
  topicId: string
  topicName: string
  accuracy: number
  total: number
}

const getSessionTopicAccuracy = async (
  sessionId: string,
): Promise<TopicAccuracy[]> => {
  const supabase = await createClient()

  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('topic_id, is_correct')
    .eq('session_id', sessionId)

  if (!interactions || interactions.length === 0) return []

  // Group by topic_id
  const topicMap = new Map<
    string,
    { correct: number; total: number }
  >()

  for (const row of interactions) {
    if (!row.topic_id) continue
    const existing = topicMap.get(row.topic_id) ?? { correct: 0, total: 0 }
    existing.total += 1
    if (row.is_correct) existing.correct += 1
    topicMap.set(row.topic_id, existing)
  }

  // Resolve topic names
  const topicIds = [...topicMap.keys()]
  if (topicIds.length === 0) return []

  const { data: nodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name')
    .in('node_id', topicIds)

  const nameMap = new Map<string, string>()
  for (const node of nodes ?? []) {
    nameMap.set(node.node_id, node.name)
  }

  return topicIds.map((topicId) => {
    const stats = topicMap.get(topicId)!
    return {
      topicId,
      topicName: nameMap.get(topicId) ?? 'Unknown Topic',
      accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
      total: stats.total,
    }
  })
}

// ─── Helper: Unread wiki article for a topic ─────────────────────────────────

interface WikiRecommendation {
  slug: string
  title: string
}

const getUnreadWikiForTopic = async (
  userId: string,
  topicId: string,
): Promise<WikiRecommendation | null> => {
  const supabase = await createClient()

  // Find articles linked to this topic via wiki_article_taxonomy
  const { data: mappings } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id')
    .eq('node_id', topicId)

  if (!mappings || mappings.length === 0) return null

  const articleIds = mappings.map((m) => m.article_id)

  // Get published articles for these IDs
  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('article_id, slug, title')
    .in('article_id', articleIds)
    .eq('status', 'published')
    .limit(5)

  if (!articles || articles.length === 0) return null

  // Check which articles the user has already visited via user_interactions
  // (wiki visits are tracked as interactions with interaction_type = 'wiki_view')
  // If no visit tracking exists, just return the first article
  const { data: visited } = await supabase
    .from('user_interactions')
    .select('question_id')
    .eq('user_id', userId)
    .in(
      'question_id',
      articles.map((a) => a.article_id),
    )

  const visitedIds = new Set((visited ?? []).map((v) => v.question_id))
  const unread = articles.find((a) => !visitedIds.has(a.article_id))

  // If all are "visited," return the first one as a refresher
  const target = unread ?? articles[0]
  return { slug: target.slug, title: target.title }
}

// ─── Helper: Overdue SRS items count ─────────────────────────────────────────

const getOverdueSRSCount = async (userId: string): Promise<number> => {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { count } = await supabase
    .from('user_node_mastery')
    .select('topic_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_review_at', now)
    .gt('total_attempts', 0)

  return count ?? 0
}

// ─── Helper: Total study minutes today ───────────────────────────────────────

const getTodayStudyMinutes = async (userId: string): Promise<number> => {
  const supabase = await createClient()

  // Start of today in UTC
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('time_spent_ms')
    .eq('user_id', userId)
    .gte('created_at', todayStart.toISOString())

  if (!interactions || interactions.length === 0) return 0

  const totalMs = interactions.reduce(
    (sum, row) => sum + (row.time_spent_ms ?? 0),
    0,
  )

  return Math.round(totalMs / 60000)
}

// ─── Main: Generate Recommendations ──────────────────────────────────────────

export const generateRecommendations = async (
  userId: string,
  sessionId: string,
  limit: number = 3,
): Promise<Recommendation[]> => {
  const recommendations: Recommendation[] = []

  try {
    // 1. Get topic accuracy for this session
    const topicAccuracies = await getSessionTopicAccuracy(sessionId)

    // 2. Find weakest topic (accuracy < 50%) — recommend targeted Camp session
    const weakTopics = topicAccuracies
      .filter((t) => t.accuracy < 0.5 && t.total >= 2)
      .sort((a, b) => a.accuracy - b.accuracy)

    const weakestTopic = weakTopics[0] ?? null

    if (weakestTopic) {
      recommendations.push({
        type: 'quiz',
        priority: 90,
        title: `Practice ${weakestTopic.topicName}`,
        description: `You answered ${Math.round(weakestTopic.accuracy * 100)}% correctly on this topic. A focused session can strengthen your understanding.`,
        action: {
          type: 'start_session',
          href: `/quiz/focused/setup?topics=${weakestTopic.topicId}`,
        },
      })
    }

    // 3. Find wiki article for weakest topic (or any topic with < 70% accuracy)
    const wikiTargetTopic =
      weakestTopic ??
      topicAccuracies.find((t) => t.accuracy < 0.7) ??
      null

    if (wikiTargetTopic) {
      const wikiRec = await getUnreadWikiForTopic(
        userId,
        wikiTargetTopic.topicId,
      )

      if (wikiRec) {
        recommendations.push({
          type: 'wiki',
          priority: 70,
          title: `Read: ${wikiRec.title}`,
          description: `Review the core concepts for ${wikiTargetTopic.topicName} before your next session.`,
          action: {
            type: 'open_wiki',
            href: `/dashboard/wiki/${wikiRec.slug}`,
          },
        })
      }
    }

    // 4. Check overdue SRS items
    const overdueCount = await getOverdueSRSCount(userId)

    if (overdueCount > 0) {
      recommendations.push({
        type: 'review',
        priority: 80,
        title: `${overdueCount} Topic${overdueCount !== 1 ? 's' : ''} Ready for Review`,
        description:
          'Spaced repetition items are due. A quick review session keeps your knowledge fresh.',
        action: {
          type: 'open_srs',
          href: '/dashboard/testing?tab=review',
        },
      })
    }

    // 5. Check total study time today — suggest rest if > 90 minutes
    const studyMinutes = await getTodayStudyMinutes(userId)

    if (studyMinutes > 90) {
      recommendations.push({
        type: 'rest',
        priority: 60,
        title: 'Take a Break',
        description: `You have studied for ${studyMinutes} minutes today. Rest helps consolidate what you have learned.`,
        action: {
          type: 'start_session',
          href: '#',
        },
      })
    }

    // 6. If we have fewer than limit recommendations, add a general practice fallback
    if (recommendations.length < limit && !weakestTopic) {
      // No weak topics — suggest a general camp session to keep momentum
      recommendations.push({
        type: 'quiz',
        priority: 50,
        title: 'Continue Practicing',
        description:
          'Strong session. Keep building momentum with another round of practice.',
        action: {
          type: 'start_session',
          href: '/quiz/camp/setup',
        },
      })
    }

    // Sort by priority descending and return top N
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit)
  } catch (error) {
    // Recommendations are non-critical — return empty on failure
    console.error('Failed to generate recommendations:', error)
    return []
  }
}
