'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import type { HeatmapCluster, HeatmapNode, NodeState } from '@/components/dashboard/TaxonomyHeatmap'
import { PACING_TARGET_MS, PASSING_ACCURACY, getSubjectColor } from '@/lib/constants/analytics'

// ── Analytics data interfaces ────────────────────────────────────────────────

export interface ReadinessTrajectoryPoint {
  date: string
  score: number
  target: number
}

export interface PacingQuadrantPoint {
  subject: string
  avgTimeMs: number
  accuracy: number
  questionCount: number
  color: string
}

export interface StaminaBucket {
  bucket: string
  accuracy: number
  sampleSize: number
}

export interface PacingInsightItem {
  subject: string
  avgTimeMs: number
  targetTimeMs: number
  ratio: number
  accuracy: number
}

export interface MemoryHealthItem {
  topic: string
  topicId: string
  lastEncountered: string
  daysSince: number
  estimatedRetention: number
  status: 'strong' | 'review' | 'fading' | 'critical'
  totalAttempts: number
}

export interface AnalyticsSummaryMetrics {
  totalQuestions: number
  avgAccuracy: number
  avgPacingMs: number
  streak: number
  daysUntilExam: number | null
  totalSessions: number
}

// ── Shared helpers ───────────────────────────────────────────────────────────

type TaxNode = { node_id: string; parent_id: string | null; level: number; name: string }

function buildLevel1Resolver(nodeMap: Map<string, TaxNode>) {
  return function getLevel1Ancestor(topicId: string): { id: string; name: string } | null {
    let current = nodeMap.get(topicId)
    if (!current) return null
    while (current && current.level > 1 && current.parent_id) {
      current = nodeMap.get(current.parent_id)
    }
    if (current?.level === 1) return { id: current.node_id, name: current.name }
    return null
  }
}

async function fetchTaxonomyNodeMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  disciplineId: string,
): Promise<Map<string, TaxNode>> {
  const { data } = await supabase
    .from('taxonomy_tree')
    .select('node_id, parent_id, level, name')
    .eq('discipline_id', disciplineId)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('lea_id', 'is', null)
  return new Map((data || []).map((n: TaxNode) => [n.node_id, n]))
}

/**
 * Returns the state label based on mastery weight (0.0 - 1.0).
 * thin_coverage: node has been visited but question bank is too shallow for reliable assessment.
 * Decision: Phase 2 Decisions Step 3.
 */
function getMasteryState(weight: number, distinctQuestionsSeen: number = 999): NodeState {
  if (weight <= 0) return 'unexplored'
  if (distinctQuestionsSeen < 5) return 'thin_coverage'
  if (weight >= 0.85) return 'mastered'
  if (weight >= 0.60) return 'familiar'
  return 'danger'
}

export async function getTaxonomyHeatmap(disciplineId: string): Promise<HeatmapCluster[]> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  // 1. Fetch entire taxonomy tree for discipline
  const { data: nodesData, error: treeError } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, level, parent_id')
    .eq('discipline_id', disciplineId)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('lea_id', 'is', null)
    .order('level', { ascending: true })

  if (treeError || !nodesData) {
    if (treeError) console.error('[ANALYTICS] getTaxonomyHeatmap tree query failed:', { error: treeError.message, timestamp: new Date().toISOString() })
    return []
  }
  const nodes = nodesData as Array<{ node_id: string; name: string; level: number; parent_id: string | null }>

  // 2. Fetch user's node mastery (including distinct_questions_seen for thin_coverage state)
  const { data: masteryData, error: masteryError } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, distinct_questions_seen')
    .eq('user_id', user.id)

  if (masteryError) {
    console.error('[ANALYTICS] getTaxonomyHeatmap mastery query failed:', { error: masteryError.message, timestamp: new Date().toISOString() })
    return []
  }
  const mastery = masteryData as Array<{ topic_id: string; current_mastery_weight: number; distinct_questions_seen: number }>

  const masteryMap = new Map(mastery?.map(m => [m.topic_id, { weight: m.current_mastery_weight, distinctQs: m.distinct_questions_seen ?? 0 }]) || [])

  // 3. Group by level 1 (Clusters)
  const clusters: HeatmapCluster[] = nodes
    .filter(n => n.level === 1)
    .map(parent => {
      const children = nodes.filter(n => n.parent_id === parent.node_id)
      return {
        id: parent.node_id,
        title: parent.name,
        nodes: children.map(child => {
          const entry = masteryMap.get(child.node_id)
          const weight = entry?.weight ?? 0
          const distinctQs = entry?.distinctQs ?? 0
          return {
            id: child.node_id,
            label: child.name,
            state: getMasteryState(weight, distinctQs),
            progress: weight * 100,
          }
        })
      }
    })

  return clusters
}

export async function getNodePerformance(topicId: string) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch daily averages for the node
  const { data, error } = await supabase
    .from('user_interactions')
    .select('is_correct, interaction_timestamp')
    .eq('user_id', user.id)
    .eq('topic_id', topicId)
    .gte('interaction_timestamp', thirtyDaysAgo)
    .order('interaction_timestamp', { ascending: true })

  if (error || !data) {
    if (error) console.error('[ANALYTICS] getNodePerformance query failed:', { error: error.message, timestamp: new Date().toISOString() })
    return []
  }

  // Group by date
  const grouped = (data || []).reduce((acc: Record<string, { date: string; correct: number; total: number }>, curr: { is_correct: boolean; interaction_timestamp: string }) => {
    const date = curr.interaction_timestamp.split('T')[0]
    if (!acc[date]) acc[date] = { date, correct: 0, total: 0 }
    acc[date].total++
    if (curr.is_correct) acc[date].correct++
    return acc
  }, {})

  return Object.values(grouped).map((g: any) => ({
    date: g.date,
    accuracy: (g.correct / g.total) * 100
  }))
}

export async function getAnalyticsSummary() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  // Readiness
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score')
    .eq('user_id', user.id)
    .single()

  // Snapshot Trend (last 30)
  const { data: snapshots } = await supabase
    .from('readiness_score_snapshots')
    .select('score, computed_at')
    .eq('user_id', user.id)
    .order('computed_at', { ascending: true })
    .limit(30)

  // Pacing (avg of last 50 interactions)
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('time_spent_ms')
    .eq('user_id', user.id)
    .order('interaction_timestamp', { ascending: false })
    .limit(50)

  const avgMs = interactions && (interactions as any[]).length > 0
    ? (interactions as any[]).reduce((acc: number, i: any) => acc + (i.time_spent_ms || 0), 0) / (interactions as any[]).length
    : 0

  return {
    readinessScore: stats?.global_readiness_score || 0,
    readinessTrend: snapshots || [],
    averageSecondsPerItem: Math.round(avgMs / 1000),
    targetSecondsPerItem: 120, // LEA Standard
    enduranceMinutes: 240, // LEA Standard
    trend: 'stable' as const
  }
}

// ── New analytics functions ──────────────────────────────────────────────────

export async function getReadinessTrajectory(): Promise<ReadinessTrajectoryPoint[]> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data } = await supabase
    .from('readiness_score_snapshots')
    .select('score, computed_at')
    .eq('user_id', user.id)
    .order('computed_at', { ascending: true })
    .limit(30)

  if (!data?.length) return []

  return data.map((s: any) => ({
    date: new Date(s.computed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: Math.round(s.score),
    target: PASSING_ACCURACY,
  }))
}

export async function getPacingQuadrantData(): Promise<PacingQuadrantPoint[]> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('topic_id, is_correct, time_spent_ms')
    .eq('user_id', user.id)
    .gt('time_spent_ms', 0)

  if (!interactions?.length) return []

  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', user.id)
    .single()

  if (!stats?.current_discipline_id) return []

  const nodeMap = await fetchTaxonomyNodeMap(supabase, stats.current_discipline_id)
  const getLevel1Ancestor = buildLevel1Resolver(nodeMap)

  const subjectMap = new Map<string, { name: string; totalMs: number; correct: number; total: number }>()

  for (const i of interactions as any[]) {
    if (!i.topic_id) continue
    const timeMs = Math.min(i.time_spent_ms, 300_000)
    const ancestor = getLevel1Ancestor(i.topic_id)
    if (!ancestor) continue
    const s = subjectMap.get(ancestor.id) ?? { name: ancestor.name, totalMs: 0, correct: 0, total: 0 }
    s.totalMs += timeMs
    s.correct += i.is_correct ? 1 : 0
    s.total += 1
    subjectMap.set(ancestor.id, s)
  }

  return Array.from(subjectMap.values())
    .filter(s => s.total >= 1)
    .map(s => ({
      subject: s.name,
      avgTimeMs: Math.round(s.totalMs / s.total),
      accuracy: Math.round((s.correct / s.total) * 100),
      questionCount: s.total,
      color: getSubjectColor(s.name),
    }))
}

export async function getStaminaCurveData(): Promise<StaminaBucket[]> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const [sessionsRes, interactionsRes] = await Promise.all([
    supabase
      .from('quiz_sessions')
      .select('session_id, question_ids')
      .eq('user_id', user.id)
      .eq('status', 'completed'),
    supabase
      .from('user_interactions')
      .select('session_id, question_id, is_correct')
      .eq('user_id', user.id),
  ])

  const sessions = (sessionsRes.data || []) as Array<{ session_id: string; question_ids: string[] }>
  const interactions = (interactionsRes.data || []) as any[]
  if (!sessions.length || !interactions.length) return []

  const sessionMap = new Map(sessions.map(s => [s.session_id, s.question_ids]))
  const buckets = new Map<number, { correct: number; total: number }>()

  for (const i of interactions) {
    const questionIds = sessionMap.get(i.session_id)
    if (!questionIds) continue
    const position = questionIds.indexOf(i.question_id) + 1
    if (position <= 0) continue
    const idx = Math.ceil(position / 5)
    const b = buckets.get(idx) ?? { correct: 0, total: 0 }
    b.correct += i.is_correct ? 1 : 0
    b.total += 1
    buckets.set(idx, b)
  }

  const maxIdx = Math.max(...Array.from(buckets.keys()), 0)
  const result: StaminaBucket[] = []
  for (let i = 1; i <= maxIdx; i++) {
    const b = buckets.get(i)
    if (!b || b.total < 1) continue
    result.push({
      bucket: `${(i - 1) * 5 + 1}–${i * 5}`,
      accuracy: Math.round((b.correct / b.total) * 100),
      sampleSize: b.total,
    })
  }
  return result
}

export async function getPacingInsights(): Promise<PacingInsightItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const [interactionsRes, statsRes] = await Promise.all([
    supabase
      .from('user_interactions')
      .select('topic_id, is_correct, time_spent_ms')
      .eq('user_id', user.id)
      .gt('time_spent_ms', 0),
    supabase
      .from('user_global_stats')
      .select('current_discipline_id')
      .eq('user_id', user.id)
      .single(),
  ])

  const interactions = (interactionsRes.data || []) as any[]
  if (!interactions.length || !statsRes.data?.current_discipline_id) return []

  const nodeMap = await fetchTaxonomyNodeMap(supabase, statsRes.data.current_discipline_id)
  const getLevel1Ancestor = buildLevel1Resolver(nodeMap)

  const subjectMap = new Map<string, { name: string; totalMs: number; correct: number; total: number }>()

  for (const i of interactions) {
    if (!i.topic_id) continue
    const timeMs = Math.min(i.time_spent_ms, 300_000)
    const ancestor = getLevel1Ancestor(i.topic_id)
    if (!ancestor) continue
    const s = subjectMap.get(ancestor.id) ?? { name: ancestor.name, totalMs: 0, correct: 0, total: 0 }
    s.totalMs += timeMs
    s.correct += i.is_correct ? 1 : 0
    s.total += 1
    subjectMap.set(ancestor.id, s)
  }

  return Array.from(subjectMap.values())
    .filter(s => s.total >= 2)
    .map(s => ({
      subject: s.name,
      avgTimeMs: Math.round(s.totalMs / s.total),
      targetTimeMs: PACING_TARGET_MS,
      ratio: parseFloat((s.totalMs / s.total / PACING_TARGET_MS).toFixed(2)),
      accuracy: Math.round((s.correct / s.total) * 100),
    }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 3)
}

export async function getMemoryHealthData(): Promise<MemoryHealthItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data: mastery } = await supabase
    .from('user_node_mastery')
    .select('topic_id, last_encountered, total_attempts')
    .eq('user_id', user.id)
    .gt('total_attempts', 0)
    .order('last_encountered', { ascending: true })
    .limit(20)

  if (!mastery?.length) return []

  const topicIds = mastery.map((m: any) => m.topic_id)
  const { data: topics } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name')
    .in('node_id', topicIds)

  const topicNameMap = new Map((topics || []).map((t: any) => [t.node_id, t.name]))
  const now = Date.now()

  return mastery.map((m: any) => {
    const daysSince = Math.floor((now - new Date(m.last_encountered).getTime()) / 86_400_000)
    const estimatedRetention = Math.round(100 * Math.exp(-daysSince / 14))
    const status: MemoryHealthItem['status'] =
      estimatedRetention >= 80 ? 'strong' :
      estimatedRetention >= 60 ? 'review' :
      estimatedRetention >= 40 ? 'fading' : 'critical'
    return {
      topic: topicNameMap.get(m.topic_id) as string ?? 'Unknown Topic',
      topicId: m.topic_id as string,
      lastEncountered: m.last_encountered as string,
      daysSince,
      estimatedRetention,
      status,
      totalAttempts: m.total_attempts as number,
    }
  })
}

// ── Timeline Heatmap (swim-lane) ────────────────────────────────────────────

export interface TimelineHeatmapData {
  rows: Array<{
    subject: string
    color: string
    totalQuestions: number
    cells: Array<{
      weekStart: string
      subject: string
      count: number
      accuracy: number | null
    }>
  }>
  weekLabels: string[]
}

export async function getTimelineHeatmapData(): Promise<TimelineHeatmapData> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { rows: [], weekLabels: [] }

  // Fetch discipline
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', user.id)
    .single()

  if (!stats?.current_discipline_id) return { rows: [], weekLabels: [] }

  // Fetch interactions from last 12 weeks
  const twelveWeeksAgo = new Date()
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7)

  const [interactionsRes, nodeMap] = await Promise.all([
    supabase
      .from('user_interactions')
      .select('topic_id, is_correct, interaction_timestamp')
      .eq('user_id', user.id)
      .gte('interaction_timestamp', twelveWeeksAgo.toISOString()),
    fetchTaxonomyNodeMap(supabase, stats.current_discipline_id),
  ])

  const interactions = (interactionsRes.data || []) as Array<{
    topic_id: string
    is_correct: boolean
    interaction_timestamp: string
  }>

  const getLevel1Ancestor = buildLevel1Resolver(nodeMap)

  // Build week buckets (Monday-aligned)
  function getWeekStart(dateStr: string): string {
    const d = new Date(`${dateStr}T12:00:00`)
    const day = d.getDay()
    const diff = day === 0 ? 6 : day - 1 // Monday = 0
    d.setDate(d.getDate() - diff)
    return d.toISOString().split('T')[0]
  }

  // Generate all 12 week labels
  const weekLabels: string[] = []
  const cursor = new Date()
  cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7)) // align to Monday
  for (let i = 11; i >= 0; i--) {
    const wk = new Date(cursor)
    wk.setDate(wk.getDate() - i * 7)
    weekLabels.push(wk.toISOString().split('T')[0])
  }

  // Aggregate: subject × week → { count, correct, total }
  const grid = new Map<string, Map<string, { count: number; correct: number; total: number }>>()
  const subjectMeta = new Map<string, { name: string; color: string; total: number }>()

  for (const i of interactions) {
    if (!i.topic_id) continue
    const ancestor = getLevel1Ancestor(i.topic_id)
    if (!ancestor) continue

    const date = i.interaction_timestamp.split('T')[0]
    const wk = getWeekStart(date)

    if (!subjectMeta.has(ancestor.id)) {
      subjectMeta.set(ancestor.id, {
        name: ancestor.name,
        color: getSubjectColor(ancestor.name),
        total: 0,
      })
    }
    subjectMeta.get(ancestor.id)!.total++

    if (!grid.has(ancestor.id)) grid.set(ancestor.id, new Map())
    const row = grid.get(ancestor.id)!
    if (!row.has(wk)) row.set(wk, { count: 0, correct: 0, total: 0 })
    const cell = row.get(wk)!
    cell.count++
    cell.total++
    if (i.is_correct) cell.correct++
  }

  // Build rows
  const rows = Array.from(subjectMeta.entries()).map(([id, meta]) => {
    const rowGrid = grid.get(id) ?? new Map()
    const cells = weekLabels.map((wk) => {
      const cell = rowGrid.get(wk)
      return {
        weekStart: wk,
        subject: meta.name,
        count: cell?.count ?? 0,
        accuracy: cell && cell.total > 0 ? Math.round((cell.correct / cell.total) * 100) : null,
      }
    })
    return {
      subject: meta.name,
      color: meta.color,
      totalQuestions: meta.total,
      cells,
    }
  })

  return { rows, weekLabels }
}

export async function getAnalyticsSummaryMetrics(): Promise<AnalyticsSummaryMetrics> {
  const empty: AnalyticsSummaryMetrics = {
    totalQuestions: 0, avgAccuracy: 0, avgPacingMs: 0,
    streak: 0, daysUntilExam: null, totalSessions: 0,
  }

  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return empty

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const [interactionsRes, sessionsRes, statsRes] = await Promise.all([
    supabase.from('user_interactions').select('is_correct, time_spent_ms').eq('user_id', user.id).gte('interaction_timestamp', ninetyDaysAgo),
    supabase
      .from('quiz_sessions')
      .select('completed_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false }),
    supabase.from('user_global_stats').select('target_exam_date').eq('user_id', user.id).single(),
  ])

  const interactions = (interactionsRes.data || []) as any[]
  const sessions = (sessionsRes.data || []) as any[]

  const totalQuestions = interactions.length
  const correct = interactions.filter(i => i.is_correct).length
  const avgAccuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0

  const validTimes = interactions.filter(i => i.time_spent_ms > 0 && i.time_spent_ms < 300_000)
  const avgPacingMs = validTimes.length > 0
    ? Math.round(validTimes.reduce((acc, i) => acc + i.time_spent_ms, 0) / validTimes.length)
    : 0

  const completedDates = new Set(
    sessions.filter((s: any) => s.completed_at).map((s: any) => s.completed_at.split('T')[0])
  )
  let streak = 0
  const cursor = new Date()
  while (completedDates.has(cursor.toISOString().split('T')[0])) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  let daysUntilExam: number | null = null
  if (statsRes.data?.target_exam_date) {
    const diff = new Date(statsRes.data.target_exam_date).getTime() - Date.now()
    if (diff > 0) daysUntilExam = Math.ceil(diff / 86_400_000)
  }

  return { totalQuestions, avgAccuracy, avgPacingMs, streak, daysUntilExam, totalSessions: sessions.length }
}
