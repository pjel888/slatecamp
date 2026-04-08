'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { PACING_TARGET_MS, PASSING_ACCURACY, getSubjectColor } from '@/lib/constants/analytics'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ForgettingCurvePoint {
  daysSince: number
  recall: number
}

export interface ForgettingCurveTopic {
  topicId: string
  topicName: string
  decayRate: number
  optimalReviewDay: number
  curve: ForgettingCurvePoint[]
  color: string
}

export interface ForgettingCurveData {
  topics: ForgettingCurveTopic[]
  reviewThreshold: number
}

export interface StaminaHeatmapCell {
  result: 'correct' | 'incorrect' | 'skipped'
}

export interface StaminaHeatmapRow {
  sessionId: string
  date: string
  mode: string
  cells: StaminaHeatmapCell[]
}

export interface StaminaHeatmapData {
  rows: StaminaHeatmapRow[]
  maxQuestions: number
  fatiguePoint: number | null
}

export interface DifficultyMasteryPoint {
  topicId: string
  topicName: string
  avgDifficulty: number
  masteryPct: number
  questionCount: number
}

export interface StudyVelocityWeek {
  weekLabel: string
  weekStart: string
  nodesMastered: number
}

export interface StudyVelocityData {
  weeks: StudyVelocityWeek[]
  avgPerWeek: number
  totalNodes: number
  projectedCompletionDate: string | null
}

export interface PacingAccuracyPoint {
  sessionId: string
  avgSeconds: number
  accuracy: number
  mode: string
  questionCount: number
  color: string
}

export interface ExamCountdownData {
  daysUntilExam: number | null
  targetExamDate: string | null
  readinessScore: number
  readinessTrend: 'up' | 'down' | 'flat'
  readinessDelta: number
  redNodeCount: number
  unexploredCount: number
  dailyDoseNeeded: number
  projectedPassProbability: number | null
}

// ── Mode color helper ────────────────────────────────────────────────────────

const MODE_COLORS: Record<string, string> = {
  camp: '#1B3FC4',
  timed: '#D4951A',
  practice: '#2D9F6F',
  storm: '#D64545',
  chill: '#7c3aed',
  custom: '#0891b2',
  blindspot: '#9333ea',
  proof_sim: '#0284c7',
  endurance: '#059669',
}

const getModeColor = (mode: string): string => MODE_COLORS[mode] ?? '#71717a'

// ── Shared helpers ───────────────────────────────────────────────────────────

type TaxNode = { node_id: string; parent_id: string | null; level: number; name: string }

const fetchTaxonomyNodeMap = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  disciplineId: string,
): Promise<Map<string, TaxNode>> => {
  const { data } = await supabase
    .from('taxonomy_tree')
    .select('node_id, parent_id, level, name')
    .eq('discipline_id', disciplineId)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('lea_id', 'is', null)
  return new Map((data || []).map((n: TaxNode) => [n.node_id, n]))
}

// ── 1. Forgetting Curves ─────────────────────────────────────────────────────

export const getForgettingCurveData = async (): Promise<ForgettingCurveData> => {
  const REVIEW_THRESHOLD = 70
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { topics: [], reviewThreshold: REVIEW_THRESHOLD }

  const { data: mastery } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, last_encountered, total_attempts, total_correct')
    .eq('user_id', user.id)
    .gt('total_attempts', 2)

  if (!mastery?.length) return { topics: [], reviewThreshold: REVIEW_THRESHOLD }

  const topicIds = (mastery as any[]).map(m => m.topic_id)
  const { data: topics } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name')
    .in('node_id', topicIds)

  const nameMap = new Map((topics || []).map((t: any) => [t.node_id, t.name]))

  // Calculate decay rate per topic based on mastery weight and accuracy ratio
  // Higher mastery = slower decay; lower accuracy ratio = faster decay
  const withDecay = (mastery as any[])
    .filter(m => nameMap.has(m.topic_id))
    .map(m => {
      const accuracyRatio = m.total_attempts > 0 ? m.total_correct / m.total_attempts : 0.5
      // Decay half-life in days: well-mastered topics decay slowly
      const halfLife = 5 + accuracyRatio * 25 // 5-30 day range
      const decayRate = Math.LN2 / halfLife
      return {
        topicId: m.topic_id as string,
        topicName: nameMap.get(m.topic_id) as string,
        decayRate,
        halfLife,
        lastEncountered: m.last_encountered as string,
      }
    })

  // Sort by decay rate descending, pick top 5 most divergent
  withDecay.sort((a, b) => b.decayRate - a.decayRate)
  const fastest = withDecay.slice(0, 3)
  const slowest = withDecay.slice(-2)
  const selected = [...fastest, ...slowest].slice(0, 5)

  // Color spectrum: fast decay = warm red, slow decay = emerald
  const decayRange = selected.length > 1
    ? { min: Math.min(...selected.map(s => s.decayRate)), max: Math.max(...selected.map(s => s.decayRate)) }
    : { min: 0, max: 1 }

  const topicCurves: ForgettingCurveTopic[] = selected.map(s => {
    const curve: ForgettingCurvePoint[] = []
    for (let day = 0; day <= 30; day++) {
      curve.push({
        daysSince: day,
        recall: Math.round(100 * Math.exp(-s.decayRate * day)),
      })
    }

    // Day where recall crosses threshold
    const optimalReviewDay = s.decayRate > 0
      ? Math.round(-Math.log(REVIEW_THRESHOLD / 100) / s.decayRate)
      : 30

    // Interpolate color: fast decay = warm red, slow = emerald
    const ratio = decayRange.max > decayRange.min
      ? (s.decayRate - decayRange.min) / (decayRange.max - decayRange.min)
      : 0.5
    const color = ratio > 0.5 ? '#D64545' : ratio > 0.25 ? '#D4951A' : '#2D9F6F'

    return {
      topicId: s.topicId,
      topicName: s.topicName,
      decayRate: s.decayRate,
      optimalReviewDay: Math.min(optimalReviewDay, 30),
      curve,
      color,
    }
  })

  return { topics: topicCurves, reviewThreshold: REVIEW_THRESHOLD }
}

// ── 2. Stamina Heatmap ───────────────────────────────────────────────────────

export const getStaminaHeatmapData = async (): Promise<StaminaHeatmapData> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { rows: [], maxQuestions: 0, fatiguePoint: null }

  // Get recent completed sessions
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('session_id, started_at, test_mode, question_ids')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(20)

  if (!sessions?.length) return { rows: [], maxQuestions: 0, fatiguePoint: null }

  const sessionIds = (sessions as any[]).map(s => s.session_id)

  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('session_id, question_id, is_correct, question_order')
    .eq('user_id', user.id)
    .in('session_id', sessionIds)

  if (!interactions?.length) return { rows: [], maxQuestions: 0, fatiguePoint: null }

  // Group interactions by session
  const interactionMap = new Map<string, Map<string, { isCorrect: boolean; order: number | null }>>()
  for (const i of interactions as any[]) {
    if (!interactionMap.has(i.session_id)) interactionMap.set(i.session_id, new Map())
    interactionMap.get(i.session_id)!.set(i.question_id, {
      isCorrect: i.is_correct,
      order: i.question_order,
    })
  }

  let maxQuestions = 0
  const rows: StaminaHeatmapRow[] = (sessions as any[]).map(s => {
    const questionIds: string[] = s.question_ids || []
    const sessionInteractions = interactionMap.get(s.session_id) ?? new Map()
    const cells: StaminaHeatmapCell[] = questionIds.map(qId => {
      const interaction = sessionInteractions.get(qId)
      if (!interaction) return { result: 'skipped' as const }
      return { result: interaction.isCorrect ? 'correct' as const : 'incorrect' as const }
    })
    if (cells.length > maxQuestions) maxQuestions = cells.length
    return {
      sessionId: s.session_id,
      date: new Date(s.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mode: s.test_mode || 'practice',
      cells,
    }
  })

  // Detect fatigue point: find the question position where accuracy drops below session average by 15%+
  let fatiguePoint: number | null = null
  if (rows.length >= 3) {
    const positionAccuracy = new Map<number, { correct: number; total: number }>()
    for (const row of rows) {
      for (let i = 0; i < row.cells.length; i++) {
        const cell = row.cells[i]
        if (cell.result === 'skipped') continue
        const entry = positionAccuracy.get(i) ?? { correct: 0, total: 0 }
        entry.total++
        if (cell.result === 'correct') entry.correct++
        positionAccuracy.set(i, entry)
      }
    }

    const positions = Array.from(positionAccuracy.entries())
      .filter(([_, v]) => v.total >= 3)
      .sort((a, b) => a[0] - b[0])

    if (positions.length >= 4) {
      const firstQuarterEnd = Math.floor(positions.length / 4)
      const earlyAcc = positions.slice(0, firstQuarterEnd)
        .reduce((sum, [_, v]) => sum + (v.correct / v.total), 0) / firstQuarterEnd

      for (let i = firstQuarterEnd; i < positions.length; i++) {
        const acc = positions[i][1].correct / positions[i][1].total
        if (earlyAcc - acc >= 0.15) {
          fatiguePoint = positions[i][0] + 1 // 1-indexed
          break
        }
      }
    }
  }

  return { rows, maxQuestions, fatiguePoint }
}

// ── 3. Difficulty vs Mastery Scatter ─────────────────────────────────────────

export const getDifficultyMasteryData = async (): Promise<DifficultyMasteryPoint[]> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  // Get mastery data per topic
  const { data: mastery } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, total_attempts')
    .eq('user_id', user.id)
    .gt('total_attempts', 0)

  if (!mastery?.length) return []

  const topicIds = (mastery as any[]).map(m => m.topic_id)

  // Get average difficulty of questions per topic
  const { data: questions } = await supabase
    .from('questions')
    .select('topic_id, difficulty')
    .in('topic_id', topicIds)
    .not('difficulty', 'is', null)

  if (!questions?.length) return []

  // Build difficulty map: topic_id -> avg difficulty
  const difficultyMap = new Map<string, { sum: number; count: number }>()
  for (const q of questions as any[]) {
    if (!q.topic_id || q.difficulty == null) continue
    const entry = difficultyMap.get(q.topic_id) ?? { sum: 0, count: 0 }
    entry.sum += q.difficulty
    entry.count++
    difficultyMap.set(q.topic_id, entry)
  }

  // Get topic names
  const { data: topics } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name')
    .in('node_id', topicIds)

  const nameMap = new Map((topics || []).map((t: any) => [t.node_id, t.name]))

  return (mastery as any[])
    .filter(m => difficultyMap.has(m.topic_id) && nameMap.has(m.topic_id))
    .map(m => {
      const diff = difficultyMap.get(m.topic_id)!
      return {
        topicId: m.topic_id as string,
        topicName: nameMap.get(m.topic_id) as string,
        avgDifficulty: parseFloat((diff.sum / diff.count).toFixed(3)),
        masteryPct: Math.round((m.current_mastery_weight as number) * 100),
        questionCount: m.total_attempts as number,
      }
    })
}

// ── 4. Study Velocity ────────────────────────────────────────────────────────

export const getStudyVelocityData = async (): Promise<StudyVelocityData> => {
  const empty: StudyVelocityData = { weeks: [], avgPerWeek: 0, totalNodes: 0, projectedCompletionDate: null }
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return empty

  // Get mastery snapshots to find when each topic crossed 0.7
  const { data: mastery } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, updated_at')
    .eq('user_id', user.id)
    .gte('current_mastery_weight', 0.7)

  if (!mastery?.length) return empty

  // Get total taxonomy nodes count for projection
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', user.id)
    .single()

  let totalNodesInTaxonomy = 0
  if (stats?.current_discipline_id) {
    const { count } = await supabase
      .from('taxonomy_tree')
      .select('node_id', { count: 'exact', head: true })
      .eq('discipline_id', stats.current_discipline_id)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('lea_id', 'is', null)
      .eq('level', 2)

    totalNodesInTaxonomy = count ?? 0
  }

  // Group mastered nodes by week
  const now = new Date()
  const twelveWeeksAgo = new Date(now)
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7)

  // Align to Monday
  const getWeekStart = (dateStr: string): string => {
    const d = new Date(`${dateStr}T12:00:00`)
    const day = d.getDay()
    const diff = day === 0 ? 6 : day - 1
    d.setDate(d.getDate() - diff)
    return d.toISOString().split('T')[0]
  }

  const weekCounts = new Map<string, number>()
  for (const m of mastery as any[]) {
    if (!m.updated_at) continue
    const date = (m.updated_at as string).split('T')[0]
    if (new Date(date) < twelveWeeksAgo) continue
    const wk = getWeekStart(date)
    weekCounts.set(wk, (weekCounts.get(wk) ?? 0) + 1)
  }

  // Generate 12 week labels
  const weekLabels: string[] = []
  const cursor = new Date()
  cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7))
  for (let i = 11; i >= 0; i--) {
    const wk = new Date(cursor)
    wk.setDate(wk.getDate() - i * 7)
    weekLabels.push(wk.toISOString().split('T')[0])
  }

  const weeks: StudyVelocityWeek[] = weekLabels.map(wk => ({
    weekLabel: new Date(`${wk}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weekStart: wk,
    nodesMastered: weekCounts.get(wk) ?? 0,
  }))

  const totalMastered = (mastery as any[]).length
  const activeWeeks = weeks.filter(w => w.nodesMastered > 0)
  const avgPerWeek = activeWeeks.length > 0
    ? parseFloat((activeWeeks.reduce((s, w) => s + w.nodesMastered, 0) / activeWeeks.length).toFixed(1))
    : 0

  // Project completion
  let projectedCompletionDate: string | null = null
  if (avgPerWeek > 0 && totalNodesInTaxonomy > totalMastered) {
    const remaining = totalNodesInTaxonomy - totalMastered
    const weeksNeeded = Math.ceil(remaining / avgPerWeek)
    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + weeksNeeded * 7)
    projectedCompletionDate = completionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return { weeks, avgPerWeek, totalNodes: totalNodesInTaxonomy, projectedCompletionDate }
}

// ── 5. Pacing vs Accuracy (per session) ──────────────────────────────────────

export const getPacingAccuracyData = async (): Promise<PacingAccuracyPoint[]> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('session_id, test_mode')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(50)

  if (!sessions?.length) return []

  const sessionIds = (sessions as any[]).map(s => s.session_id)
  const sessionModeMap = new Map((sessions as any[]).map(s => [s.session_id, s.test_mode || 'practice']))

  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('session_id, is_correct, time_spent_ms')
    .eq('user_id', user.id)
    .in('session_id', sessionIds)
    .gt('time_spent_ms', 0)

  if (!interactions?.length) return []

  // Aggregate per session
  const sessionMap = new Map<string, { totalMs: number; correct: number; total: number }>()
  for (const i of interactions as any[]) {
    const timeMs = Math.min(i.time_spent_ms, 300_000)
    const entry = sessionMap.get(i.session_id) ?? { totalMs: 0, correct: 0, total: 0 }
    entry.totalMs += timeMs
    entry.correct += i.is_correct ? 1 : 0
    entry.total += 1
    sessionMap.set(i.session_id, entry)
  }

  return Array.from(sessionMap.entries())
    .filter(([_, v]) => v.total >= 3)
    .map(([sessionId, v]) => {
      const mode = sessionModeMap.get(sessionId) ?? 'practice'
      return {
        sessionId,
        avgSeconds: Math.round(v.totalMs / v.total / 1000),
        accuracy: Math.round((v.correct / v.total) * 100),
        mode,
        questionCount: v.total,
        color: getModeColor(mode),
      }
    })
}

// ── 6. Exam Countdown ────────────────────────────────────────────────────────

export const getExamCountdownData = async (): Promise<ExamCountdownData> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  const empty: ExamCountdownData = {
    daysUntilExam: null,
    targetExamDate: null,
    readinessScore: 0,
    readinessTrend: 'flat',
    readinessDelta: 0,
    redNodeCount: 0,
    unexploredCount: 0,
    dailyDoseNeeded: 0,
    projectedPassProbability: null,
  }
  if (!user) return empty

  const [statsRes, snapshotsRes, masteryRes, disciplineRes] = await Promise.all([
    supabase
      .from('user_global_stats')
      .select('global_readiness_score, target_exam_date, current_discipline_id')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('readiness_score_snapshots')
      .select('score')
      .eq('user_id', user.id)
      .order('computed_at', { ascending: false })
      .limit(5),
    supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight')
      .eq('user_id', user.id),
    supabase
      .from('user_global_stats')
      .select('current_discipline_id')
      .eq('user_id', user.id)
      .single(),
  ])

  const readinessScore = statsRes.data?.global_readiness_score ?? 0
  const targetExamDate = statsRes.data?.target_exam_date ?? null

  // Trend
  const snapshots = (snapshotsRes.data || []) as any[]
  let readinessTrend: 'up' | 'down' | 'flat' = 'flat'
  let readinessDelta = 0
  if (snapshots.length >= 2) {
    const latest = snapshots[0].score
    const previous = snapshots[snapshots.length - 1].score
    readinessDelta = Math.abs(Math.round(latest - previous))
    readinessTrend = latest > previous ? 'up' : latest < previous ? 'down' : 'flat'
  }

  // Days until exam
  let daysUntilExam: number | null = null
  if (targetExamDate) {
    const diff = new Date(targetExamDate).getTime() - Date.now()
    if (diff > 0) daysUntilExam = Math.ceil(diff / 86_400_000)
  }

  // Node counts
  const masteryData = (masteryRes.data || []) as any[]
  const masteryMap = new Map(masteryData.map(m => [m.topic_id, m.current_mastery_weight]))

  let totalTaxonomyNodes = 0
  if (disciplineRes.data?.current_discipline_id) {
    const { count } = await supabase
      .from('taxonomy_tree')
      .select('node_id', { count: 'exact', head: true })
      .eq('discipline_id', disciplineRes.data.current_discipline_id)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('lea_id', 'is', null)
      .eq('level', 2)

    totalTaxonomyNodes = count ?? 0
  }

  const redNodeCount = masteryData.filter(m => m.current_mastery_weight > 0 && m.current_mastery_weight < 0.6).length
  const exploredIds = new Set(masteryData.map(m => m.topic_id))
  const unexploredCount = Math.max(0, totalTaxonomyNodes - exploredIds.size)

  // Daily dose: nodes needing work / days remaining
  const nodesNeedingWork = redNodeCount + unexploredCount
  const dailyDoseNeeded = daysUntilExam && daysUntilExam > 0
    ? Math.max(1, Math.ceil(nodesNeedingWork / daysUntilExam * 5)) // 5 questions per node
    : 10

  // Projected pass probability (simple sigmoid based on RS)
  const projectedPassProbability = readinessScore > 0
    ? Math.round(100 / (1 + Math.exp(-0.1 * (readinessScore - 70))))
    : null

  return {
    daysUntilExam,
    targetExamDate,
    readinessScore: Math.round(readinessScore),
    readinessTrend,
    readinessDelta,
    redNodeCount,
    unexploredCount,
    dailyDoseNeeded,
    projectedPassProbability,
  }
}

// ── Aggregated fetch ─────────────────────────────────────────────────────────

export interface AnalyticsDashboardData {
  forgettingCurves: ForgettingCurveData
  staminaHeatmap: StaminaHeatmapData
  difficultyMastery: DifficultyMasteryPoint[]
  studyVelocity: StudyVelocityData
  pacingAccuracy: PacingAccuracyPoint[]
  examCountdown: ExamCountdownData
}

export const getAnalyticsDashboardData = async (): Promise<AnalyticsDashboardData> => {
  const [
    forgettingCurves,
    staminaHeatmap,
    difficultyMastery,
    studyVelocity,
    pacingAccuracy,
    examCountdown,
  ] = await Promise.all([
    getForgettingCurveData(),
    getStaminaHeatmapData(),
    getDifficultyMasteryData(),
    getStudyVelocityData(),
    getPacingAccuracyData(),
    getExamCountdownData(),
  ])

  return {
    forgettingCurves,
    staminaHeatmap,
    difficultyMastery,
    studyVelocity,
    pacingAccuracy,
    examCountdown,
  }
}
