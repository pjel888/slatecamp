'use server'

import { createClient, getUser } from '@/lib/supabase/server'

interface SessionInsight {
  type: 'speed_comparison' | 'accuracy_trend' | 'retry_success' | 'subject_strength' | 'time_pattern'
  message: string
}

/**
 * Generate a post-session discovery insight — UX Strategy Section 10.
 * One surprising data point the student didn't know.
 * Genuine variable reward: real data with surprise value.
 */
export const generateSessionDiscovery = async (sessionId: string): Promise<SessionInsight | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  // Get this session's interactions with topic info
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('is_correct, time_spent_ms, topic_id, taxonomy_tree(name, subject_area)')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (!interactions || interactions.length < 3) return null

  const insights: SessionInsight[] = []

  // ── Insight 1: Speed comparison by subject ────────────────
  const subjectTimes = new Map<string, number[]>()
  for (const i of interactions) {
    const subject = (i.taxonomy_tree as any)?.subject_area
    if (subject && i.time_spent_ms > 0) {
      const times = subjectTimes.get(subject) ?? []
      times.push(i.time_spent_ms)
      subjectTimes.set(subject, times)
    }
  }

  if (subjectTimes.size >= 2) {
    const avgBySubject = Array.from(subjectTimes.entries()).map(([subject, times]) => ({
      subject,
      avg: times.reduce((a, b) => a + b, 0) / times.length,
    }))
    avgBySubject.sort((a, b) => a.avg - b.avg)
    const fastest = avgBySubject[0]
    const slowest = avgBySubject[avgBySubject.length - 1]

    if (fastest.subject !== slowest.subject) {
      insights.push({
        type: 'speed_comparison',
        message: `You answered ${fastest.subject} questions ${Math.round(((slowest.avg - fastest.avg) / slowest.avg) * 100)}% faster than ${slowest.subject}.`,
      })
    }
  }

  // ── Insight 2: Retry success rate ─────────────────────────
  // Check if user has answered any of these topics before
  const topicIds = [...new Set(interactions.map((i: any) => i.topic_id).filter(Boolean))]
  if (topicIds.length > 0) {
    const { data: previousAttempts } = await supabase
      .from('user_interactions')
      .select('topic_id, is_correct')
      .eq('user_id', user.id)
      .in('topic_id', topicIds)
      .neq('session_id', sessionId)
      .order('interaction_timestamp', { ascending: false })
      .limit(100)

    if (previousAttempts && previousAttempts.length > 0) {
      // Topics previously wrong, now correct
      const prevWrongTopics = new Set(
        previousAttempts.filter((p: any) => !p.is_correct).map((p: any) => p.topic_id),
      )
      const nowCorrect = interactions.filter(
        (i: any) => i.is_correct && prevWrongTopics.has(i.topic_id),
      )

      if (nowCorrect.length >= 2) {
        insights.push({
          type: 'retry_success',
          message: `${nowCorrect.length} questions you previously missed — you got them right this time.`,
        })
      }
    }
  }

  // ── Insight 3: Accuracy by session half ────────────────────
  const halfPoint = Math.floor(interactions.length / 2)
  const firstHalf = interactions.slice(0, halfPoint)
  const secondHalf = interactions.slice(halfPoint)

  const firstAccuracy = firstHalf.filter((i: any) => i.is_correct).length / firstHalf.length
  const secondAccuracy = secondHalf.filter((i: any) => i.is_correct).length / secondHalf.length

  if (Math.abs(firstAccuracy - secondAccuracy) > 0.15) {
    if (secondAccuracy > firstAccuracy) {
      insights.push({
        type: 'accuracy_trend',
        message: `Your accuracy improved ${Math.round((secondAccuracy - firstAccuracy) * 100)}% in the second half of the session. You warmed up well.`,
      })
    } else {
      insights.push({
        type: 'accuracy_trend',
        message: `Your accuracy dipped ${Math.round((firstAccuracy - secondAccuracy) * 100)}% in the second half. Shorter sessions might keep focus sharper.`,
      })
    }
  }

  // Pick one random insight (variable reward — different each time)
  if (insights.length === 0) return null
  const selected = insights[Math.floor(Math.random() * insights.length)]

  // Save to session for recall
  void supabase
    .from('quiz_sessions')
    .update({ session_discovery: selected })
    .eq('session_id', sessionId)

  return selected
}
