'use server'

import { unstable_cache } from 'next/cache'
import { createClient, getUser, createServiceClient } from '@/lib/supabase/server'
import { WEAKEST_TOPICS_MIN_ATTEMPTS, WEAKEST_TOPICS_LIMIT } from '@/lib/constants/analytics'
import { fetchTaxonomyNodeMap, buildLevel1Resolver, type TaxNode, wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

// ── Types ────────────────────────────────────────────────────────────────────

export interface AccuracyBySubjectItem {
  subject: string
  accuracy: number
  total: number
}

export interface TimeSpentBucket {
  label: string
  count: number
}

export interface TimeSpentDistributionData {
  buckets: TimeSpentBucket[]
  avgMs: number
}

export interface SessionHistoryPoint {
  date: string
  accuracy: number
  questionCount: number
}

export interface SessionHistoryData {
  points: SessionHistoryPoint[]
  trend: 'improving' | 'declining' | 'stable'
}

export interface ConfidenceCalibrationItem {
  level: string
  confidence: number
  accuracy: number
  count: number
}

export interface WeakestTopicItem {
  topicId: string
  topic: string
  masteryPct: number
  attempts: number
  lastEncountered: string | null
}

export interface StudyActivityDay {
  date: string
  count: number
  intensity: 0 | 1 | 2 | 3 | 4
}

// ── Helpers (imported from shared-helpers.ts) ───────────────────────────────

// ── Queries ──────────────────────────────────────────────────────────────────

const getAccuracyBySubjectInternal = async (userId: string): Promise<AnalyticsResult<AccuracyBySubjectItem[]>> => {
  try {
    const supabase = await createServiceClient()

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

    const [interactionsRes, statsRes] = await Promise.all([
      supabase
        .from('user_interactions')
        .select('topic_id, is_correct')
        .eq('user_id', userId)
        .gte('interaction_timestamp', ninetyDaysAgo)
        .limit(10000),
      supabase
        .from('user_global_stats')
        .select('current_discipline_id')
        .eq('user_id', userId)
        .single(),
    ])

    const interactions = (interactionsRes.data || []) as Array<{ topic_id: string; is_correct: boolean }>
    if (!interactions.length || !statsRes.data?.current_discipline_id) return wrapResult([])

    const nodeMap = await fetchTaxonomyNodeMap(supabase, statsRes.data.current_discipline_id)
    const getLevel1Ancestor = buildLevel1Resolver(nodeMap)

    const subjectMap = new Map<string, { name: string; correct: number; total: number }>()

    for (const i of interactions) {
      if (!i.topic_id) continue
      const ancestor = getLevel1Ancestor(i.topic_id)
      if (!ancestor) continue
      const s = subjectMap.get(ancestor.id) ?? { name: ancestor.name, correct: 0, total: 0 }
      s.correct += i.is_correct ? 1 : 0
      s.total += 1
      subjectMap.set(ancestor.id, s)
    }

    return wrapResult(Array.from(subjectMap.values())
      .filter(s => s.total >= 1)
      .map(s => ({
        subject: s.name,
        accuracy: Math.round((s.correct / s.total) * 100),
        total: s.total,
      }))
      .sort((a, b) => a.accuracy - b.accuracy))
  } catch (err) {
    console.error('[ANALYTICS] getAccuracyBySubject failed:', err)
    return wrapError('Failed to load accuracy by subject', [])
  }
}

export const getAccuracyBySubject = async (): Promise<AnalyticsResult<AccuracyBySubjectItem[]>> => {
  const { data: { user } } = await getUser()
  if (!user) return wrapResult([])
  return unstable_cache(
    () => getAccuracyBySubjectInternal(user.id),
    [`accuracy-by-subject-${user.id}`],
    { revalidate: 300 },
  )()
}

export const getTimeSpentDistribution = async (): Promise<AnalyticsResult<TimeSpentDistributionData>> => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return wrapResult({ buckets: [], avgMs: 0 })

    const { data } = await supabase
      .from('user_interactions')
      .select('time_spent_ms')
      .eq('user_id', user.id)
      .gt('time_spent_ms', 0)
      .lt('time_spent_ms', 300_000)

    const times = (data || []) as Array<{ time_spent_ms: number }>
    if (!times.length) return wrapResult({ buckets: [], avgMs: 0 })

    const bucketDefs = [
      { label: '0–10s', min: 0, max: 10_000 },
      { label: '10–20s', min: 10_000, max: 20_000 },
      { label: '20–30s', min: 20_000, max: 30_000 },
      { label: '30–60s', min: 30_000, max: 60_000 },
      { label: '60s+', min: 60_000, max: Infinity },
    ]

    const counts = bucketDefs.map(b => ({
      label: b.label,
      count: times.filter(t => t.time_spent_ms >= b.min && t.time_spent_ms < b.max).length,
    }))

    const avgMs = Math.round(times.reduce((acc, t) => acc + t.time_spent_ms, 0) / times.length)

    return wrapResult({ buckets: counts, avgMs })
  } catch (err) {
    console.error('[ANALYTICS] getTimeSpentDistribution failed:', err)
    return wrapError('Failed to load time spent distribution', { buckets: [], avgMs: 0 })
  }
}

export const getSessionHistory = async (): Promise<AnalyticsResult<SessionHistoryData>> => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return wrapResult({ points: [], trend: 'stable' as const })

    const [sessionsRes, interactionsRes] = await Promise.all([
      supabase
        .from('quiz_sessions')
        .select('session_id, started_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: true })
        .limit(30),
      supabase
        .from('user_interactions')
        .select('session_id, is_correct')
        .eq('user_id', user.id),
    ])

    const sessions = (sessionsRes.data || []) as Array<{ session_id: string; started_at: string }>
    const interactions = (interactionsRes.data || []) as Array<{ session_id: string; is_correct: boolean }>

    if (!sessions.length || !interactions.length) return wrapResult({ points: [], trend: 'stable' as const })

    const interactionsBySession = new Map<string, { correct: number; total: number }>()
    for (const i of interactions) {
      const s = interactionsBySession.get(i.session_id) ?? { correct: 0, total: 0 }
      s.correct += i.is_correct ? 1 : 0
      s.total += 1
      interactionsBySession.set(i.session_id, s)
    }

    const points: SessionHistoryPoint[] = sessions
      .map(s => {
        const stats = interactionsBySession.get(s.session_id)
        if (!stats || stats.total === 0) return null
        return {
          date: new Date(s.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          accuracy: Math.round((stats.correct / stats.total) * 100),
          questionCount: stats.total,
        }
      })
      .filter((p): p is SessionHistoryPoint => p !== null)

    if (points.length < 2) return wrapResult({ points, trend: 'stable' as const })

    const firstHalf = points.slice(0, Math.floor(points.length / 2))
    const secondHalf = points.slice(Math.floor(points.length / 2))
    const avgFirst = firstHalf.reduce((a, p) => a + p.accuracy, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((a, p) => a + p.accuracy, 0) / secondHalf.length
    const diff = avgSecond - avgFirst
    const trend: SessionHistoryData['trend'] = diff >= 3 ? 'improving' : diff <= -3 ? 'declining' : 'stable'

    return wrapResult({ points, trend })
  } catch (err) {
    console.error('[ANALYTICS] getSessionHistory failed:', err)
    return wrapError('Failed to load session history', { points: [], trend: 'stable' as const })
  }
}

export const getConfidenceCalibration = async (): Promise<AnalyticsResult<ConfidenceCalibrationItem[]>> => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return wrapResult([])

    const { data } = await supabase
      .from('user_interactions')
      .select('confidence, is_correct')
      .eq('user_id', user.id)
      .not('confidence', 'is', null)

    const interactions = (data || []) as Array<{ confidence: number; is_correct: boolean }>
    if (!interactions.length) return wrapResult([])

    const levelMap = new Map<number, { correct: number; total: number }>()
    for (const i of interactions) {
      const lvl = i.confidence
      const s = levelMap.get(lvl) ?? { correct: 0, total: 0 }
      s.correct += i.is_correct ? 1 : 0
      s.total += 1
      levelMap.set(lvl, s)
    }

    const labelMap: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' }

    return wrapResult([1, 2, 3]
      .filter(lvl => levelMap.has(lvl))
      .map(lvl => {
        const s = levelMap.get(lvl)!
        return {
          level: labelMap[lvl] ?? `Level ${lvl}`,
          confidence: lvl * 33,
          accuracy: Math.round((s.correct / s.total) * 100),
          count: s.total,
        }
      }))
  } catch (err) {
    console.error('[ANALYTICS] getConfidenceCalibration failed:', err)
    return wrapError('Failed to load confidence calibration', [])
  }
}

const getWeakestTopicsInternal = async (userId: string): Promise<AnalyticsResult<WeakestTopicItem[]>> => {
  try {
    const supabase = await createClient()

    const { data: mastery } = await supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight, total_attempts, last_encountered')
      .eq('user_id', userId)
      .gte('total_attempts', WEAKEST_TOPICS_MIN_ATTEMPTS)
      .order('current_mastery_weight', { ascending: true })
      .limit(WEAKEST_TOPICS_LIMIT)

    if (!mastery?.length) return wrapResult([])

    const topicIds = (mastery as any[]).map(m => m.topic_id)
    const { data: topics } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name')
      .in('node_id', topicIds)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)

    const nameMap = new Map((topics || []).map((t: any) => [t.node_id, t.name]))

    return wrapResult((mastery as any[])
      .filter(m => nameMap.has(m.topic_id))
      .map(m => ({
        topicId: m.topic_id as string,
        topic: nameMap.get(m.topic_id) as string,
        masteryPct: Math.round((m.current_mastery_weight as number) * 100),
        attempts: m.total_attempts as number,
        lastEncountered: m.last_encountered as string | null,
      })))
  } catch (err) {
    console.error('[ANALYTICS] getWeakestTopics failed:', err)
    return wrapError('Failed to load weakest topics', [])
  }
}

export const getWeakestTopics = async (): Promise<AnalyticsResult<WeakestTopicItem[]>> => {
  const { data: { user } } = await getUser()
  if (!user) return wrapResult([])
  return unstable_cache(
    () => getWeakestTopicsInternal(user.id),
    [`weakest-topics-${user.id}`],
    { revalidate: 300 },
  )()
}

export const getStudyActivity = async (): Promise<AnalyticsResult<StudyActivityDay[]>> => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return wrapResult([])

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const { data } = await supabase
      .from('user_interactions')
      .select('interaction_timestamp')
      .eq('user_id', user.id)
      .gte('interaction_timestamp', firstDay.toISOString())
      .lte('interaction_timestamp', lastDay.toISOString())

    const interactions = (data || []) as Array<{ interaction_timestamp: string }>

    const countByDate = new Map<string, number>()
    for (const i of interactions) {
      const date = i.interaction_timestamp.split('T')[0]
      countByDate.set(date, (countByDate.get(date) ?? 0) + 1)
    }

    const maxCount = Math.max(...Array.from(countByDate.values()), 1)
    const result: StudyActivityDay[] = []

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const count = countByDate.get(date) ?? 0
      const ratio = count / maxCount
      const intensity: StudyActivityDay['intensity'] =
        count === 0 ? 0 :
        ratio <= 0.25 ? 1 :
        ratio <= 0.5 ? 2 :
        ratio <= 0.75 ? 3 : 4
      result.push({ date, count, intensity })
    }

    return wrapResult(result)
  } catch (err) {
    console.error('[ANALYTICS] getStudyActivity failed:', err)
    return wrapError('Failed to load study activity', [])
  }
}
