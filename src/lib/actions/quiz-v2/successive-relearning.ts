'use server'

import { createClient } from '@/lib/supabase/server'

// ─── Constants ───────────────────────────────────────────────────────────────

const SPACING_INTERVALS = [1, 3, 7, 14] as const
const CRITERION_THRESHOLD = 3
const SR_CYCLE_COLUMNS = 'id, user_id, topic_id, status, consecutive_correct, current_spacing_interval, spacing_level, next_retest_at, total_resets, created_at, updated_at'

// ─── Types ───────────────────────────────────────────────────────────────────

export type SRStatus = 'active' | 'criterion_met' | 'spacing' | 'durable' | 'reset'

export interface SRCycle {
  id: string
  user_id: string
  topic_id: string
  status: SRStatus
  consecutive_correct: number
  current_spacing_interval: number | null
  spacing_level: number
  next_retest_at: string | null
  total_resets: number
  created_at: string
  updated_at: string
}

export interface SRProcessResult {
  cycle: SRCycle
  previousStatus: SRStatus
  newStatus: SRStatus
  criterionJustMet: boolean
  justBecameDurable: boolean
  justReset: boolean
}

export interface SRProgressSummary {
  active: number
  spacing: number
  durable: number
  reset: number
  total: number
}

export interface SRDueCycle {
  id: string
  topic_id: string
  topic_name: string
  subject_area: string | null
  spacing_level: number
  current_spacing_interval: number | null
  next_retest_at: string
  total_resets: number
}

// ─── Core State Machine ─────────────────────────────────────────────────────

export const processSuccessiveRelearning = async (
  userId: string,
  topicId: string,
  isCorrect: boolean,
): Promise<SRProcessResult> => {
  const supabase = await createClient()

  // Fetch or create cycle for user+topic
  const { data: existing } = await supabase
    .from('successive_relearning_cycles')
    .select(SR_CYCLE_COLUMNS)
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .maybeSingle()

  let cycle: SRCycle

  if (!existing) {
    const { data: created, error: createError } = await supabase
      .from('successive_relearning_cycles')
      .insert({
        user_id: userId,
        topic_id: topicId,
        status: 'active',
        consecutive_correct: 0,
        spacing_level: 0,
        total_resets: 0,
      })
      .select(SR_CYCLE_COLUMNS)
      .single()

    if (createError || !created) throw new Error('Failed to create SR cycle')
    cycle = created as SRCycle
  } else {
    cycle = existing as SRCycle
  }

  const previousStatus = cycle.status as SRStatus
  let criterionJustMet = false
  let justBecameDurable = false
  let justReset = false

  const now = new Date().toISOString()

  if (cycle.status === 'active' || cycle.status === 'reset') {
    // Initial learning phase: need CRITERION_THRESHOLD consecutive correct
    if (isCorrect) {
      const newCount = cycle.consecutive_correct + 1

      if (newCount >= CRITERION_THRESHOLD) {
        // Criterion met — enter spacing phase
        const spacingLevel = 1
        const intervalDays = SPACING_INTERVALS[0]
        const nextRetest = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000)

        const { data: updated, error } = await supabase
          .from('successive_relearning_cycles')
          .update({
            status: 'spacing',
            consecutive_correct: newCount,
            spacing_level: spacingLevel,
            current_spacing_interval: intervalDays,
            next_retest_at: nextRetest.toISOString(),
            updated_at: now,
          })
          .eq('id', cycle.id)
          .select(SR_CYCLE_COLUMNS)
          .single()

        if (error || !updated) throw new Error('Failed to update SR cycle')
        cycle = updated as SRCycle
        criterionJustMet = true
      } else {
        const { data: updated, error } = await supabase
          .from('successive_relearning_cycles')
          .update({
            consecutive_correct: newCount,
            updated_at: now,
          })
          .eq('id', cycle.id)
          .select(SR_CYCLE_COLUMNS)
          .single()

        if (error || !updated) throw new Error('Failed to update SR cycle')
        cycle = updated as SRCycle
      }
    } else {
      // Wrong — reset consecutive count
      const { data: updated, error } = await supabase
        .from('successive_relearning_cycles')
        .update({
          consecutive_correct: 0,
          updated_at: now,
        })
        .eq('id', cycle.id)
        .select(SR_CYCLE_COLUMNS)
        .single()

      if (error || !updated) throw new Error('Failed to update SR cycle')
      cycle = updated as SRCycle
    }
  } else if (cycle.status === 'spacing') {
    // Spacing phase: re-test at scheduled intervals
    if (isCorrect) {
      const nextLevel = cycle.spacing_level + 1

      if (nextLevel > SPACING_INTERVALS.length) {
        // All spacing intervals passed — topic is durable
        const { data: updated, error } = await supabase
          .from('successive_relearning_cycles')
          .update({
            status: 'durable',
            spacing_level: nextLevel,
            current_spacing_interval: null,
            next_retest_at: null,
            updated_at: now,
          })
          .eq('id', cycle.id)
          .select(SR_CYCLE_COLUMNS)
          .single()

        if (error || !updated) throw new Error('Failed to update SR cycle')
        cycle = updated as SRCycle
        justBecameDurable = true
      } else {
        // Advance to next spacing interval
        const intervalDays = SPACING_INTERVALS[nextLevel - 1]
        const nextRetest = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000)

        const { data: updated, error } = await supabase
          .from('successive_relearning_cycles')
          .update({
            spacing_level: nextLevel,
            current_spacing_interval: intervalDays,
            next_retest_at: nextRetest.toISOString(),
            updated_at: now,
          })
          .eq('id', cycle.id)
          .select(SR_CYCLE_COLUMNS)
          .single()

        if (error || !updated) throw new Error('Failed to update SR cycle')
        cycle = updated as SRCycle
      }
    } else {
      // Wrong during spacing — full reset
      const { data: updated, error } = await supabase
        .from('successive_relearning_cycles')
        .update({
          status: 'reset',
          consecutive_correct: 0,
          spacing_level: 0,
          current_spacing_interval: null,
          next_retest_at: null,
          total_resets: cycle.total_resets + 1,
          updated_at: now,
        })
        .eq('id', cycle.id)
        .select(SR_CYCLE_COLUMNS)
        .single()

      if (error || !updated) throw new Error('Failed to update SR cycle')
      cycle = updated as SRCycle
      justReset = true
    }
  }
  // If status is 'durable' or 'criterion_met', no state change needed

  return {
    cycle,
    previousStatus,
    newStatus: cycle.status as SRStatus,
    criterionJustMet,
    justBecameDurable,
    justReset,
  }
}

// ─── Query: Due SR Cycles ───────────────────────────────────────────────────

export const getDueSRCycles = async (userId: string): Promise<SRDueCycle[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('successive_relearning_cycles')
    .select('id, topic_id, spacing_level, current_spacing_interval, next_retest_at, total_resets')
    .eq('user_id', userId)
    .eq('status', 'spacing')
    .lte('next_retest_at', new Date().toISOString())
    .order('next_retest_at', { ascending: true })

  if (error) throw error
  if (!data || data.length === 0) return []

  // Fetch topic names in batch
  const topicIds = data.map((c: { topic_id: string }) => c.topic_id)
  const { data: topics } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, subject_area')
    .in('node_id', topicIds)

  const topicMap = new Map<string, { name: string; subject_area: string | null }>()
  for (const t of (topics ?? []) as Array<{ node_id: string; name: string; subject_area: string | null }>) {
    topicMap.set(t.node_id, { name: t.name, subject_area: t.subject_area })
  }

  return data.map((c: {
    id: string
    topic_id: string
    spacing_level: number
    current_spacing_interval: number | null
    next_retest_at: string
    total_resets: number
  }) => ({
    id: c.id,
    topic_id: c.topic_id,
    topic_name: topicMap.get(c.topic_id)?.name ?? 'Unknown Topic',
    subject_area: topicMap.get(c.topic_id)?.subject_area ?? null,
    spacing_level: c.spacing_level,
    current_spacing_interval: c.current_spacing_interval,
    next_retest_at: c.next_retest_at,
    total_resets: c.total_resets,
  }))
}

// ─── Query: User SR Progress Summary ────────────────────────────────────────

export const getUserSRProgress = async (userId: string): Promise<SRProgressSummary> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('successive_relearning_cycles')
    .select('status')
    .eq('user_id', userId)

  if (error) throw error

  const cycles = (data ?? []) as Array<{ status: string }>
  const counts = { active: 0, spacing: 0, durable: 0, reset: 0 }

  for (const c of cycles) {
    if (c.status === 'active') counts.active++
    else if (c.status === 'spacing') counts.spacing++
    else if (c.status === 'durable') counts.durable++
    else if (c.status === 'reset') counts.reset++
  }

  return {
    ...counts,
    total: cycles.length,
  }
}

// ─── Query: Topic SR Status ─────────────────────────────────────────────────

export const getTopicSRStatus = async (
  userId: string,
  topicId: string,
): Promise<SRCycle | null> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('successive_relearning_cycles')
    .select(SR_CYCLE_COLUMNS)
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .maybeSingle()

  if (error) throw error
  return (data as SRCycle) ?? null
}

// ─── Query: Active SR Cycles with Topic Names ──────────────────────────────

export interface SRActiveCycle {
  id: string
  topic_id: string
  topic_name: string
  subject_area: string | null
  status: SRStatus
  consecutive_correct: number
  spacing_level: number
  current_spacing_interval: number | null
  next_retest_at: string | null
  total_resets: number
}

export const getActiveSRCycles = async (userId: string): Promise<SRActiveCycle[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('successive_relearning_cycles')
    .select('id, topic_id, status, consecutive_correct, spacing_level, current_spacing_interval, next_retest_at, total_resets')
    .eq('user_id', userId)
    .in('status', ['active', 'reset', 'spacing'])
    .order('updated_at', { ascending: false })
    .limit(20)

  if (error) throw error
  if (!data || data.length === 0) return []

  const topicIds = data.map((c: { topic_id: string }) => c.topic_id)
  const { data: topics } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, subject_area')
    .in('node_id', topicIds)

  const topicMap = new Map<string, { name: string; subject_area: string | null }>()
  for (const t of (topics ?? []) as Array<{ node_id: string; name: string; subject_area: string | null }>) {
    topicMap.set(t.node_id, { name: t.name, subject_area: t.subject_area })
  }

  return data.map((c: {
    id: string
    topic_id: string
    status: string
    consecutive_correct: number
    spacing_level: number
    current_spacing_interval: number | null
    next_retest_at: string | null
    total_resets: number
  }) => ({
    id: c.id,
    topic_id: c.topic_id,
    topic_name: topicMap.get(c.topic_id)?.name ?? 'Unknown Topic',
    subject_area: topicMap.get(c.topic_id)?.subject_area ?? null,
    status: c.status as SRStatus,
    consecutive_correct: c.consecutive_correct,
    spacing_level: c.spacing_level,
    current_spacing_interval: c.current_spacing_interval,
    next_retest_at: c.next_retest_at,
    total_resets: c.total_resets,
  }))
}
