'use server'

import { getUser } from '@/lib/supabase/server'
import { createCachedClient, wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MultimodalWeekRow {
  weekLabel: string
  drillScore: number
  readingScore: number
  combinedScore: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKS = 12
// Soft caps for normalisation (95th-percentile heuristics)
const DRILL_CAP = 30   // sessions per week
const READING_CAP = 10 // articles per week

// ─── Helper: ISO week label ───────────────────────────────────────────────────

const isoWeekLabel = (date: Date): string => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const yearStart = new Date(d.getFullYear(), 0, 4)
  const weekNum = 1 + Math.round(
    ((d.getTime() - yearStart.getTime()) / 86400000 - 3 + ((yearStart.getDay() + 6) % 7)) / 7,
  )
  return `Wk ${weekNum}`
}

// ─── Action ───────────────────────────────────────────────────────────────────

export const getMultimodalStudyData = async (): Promise<
  AnalyticsResult<MultimodalWeekRow[]>
> => {
  try {
    const supabase = await createCachedClient()
    const { data: { user } } = await getUser()
    if (!user) return wrapResult([])

    const since = new Date()
    since.setDate(since.getDate() - WEEKS * 7)
    const sinceIso = since.toISOString()

    const [sessionsRes, readsRes] = await Promise.all([
      supabase
        .from('quiz_sessions')
        .select('started_at')
        .eq('user_id', user.id)
        .gte('started_at', sinceIso)
        .not('completed_at', 'is', null),
      supabase
        .from('wiki_article_reads')
        .select('created_at, time_spent_ms')
        .eq('user_id', user.id)
        .gte('created_at', sinceIso),
    ])

    // Build ordered week buckets (oldest → newest)
    const buckets: Map<string, { drillCount: number; readCount: number }> = new Map()
    const weekStarts: string[] = []

    for (let i = WEEKS - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i * 7)
      const label = isoWeekLabel(d)
      if (!buckets.has(label)) {
        buckets.set(label, { drillCount: 0, readCount: 0 })
        weekStarts.push(label)
      }
    }

    for (const session of sessionsRes.data ?? []) {
      const label = isoWeekLabel(new Date(session.started_at))
      const bucket = buckets.get(label)
      if (bucket) bucket.drillCount += 1
    }

    for (const read of readsRes.data ?? []) {
      if (!read.created_at) continue
      const label = isoWeekLabel(new Date(read.created_at))
      const bucket = buckets.get(label)
      if (bucket) bucket.readCount += 1
    }

    const rows: MultimodalWeekRow[] = weekStarts.map((weekLabel) => {
      const b = buckets.get(weekLabel) ?? { drillCount: 0, readCount: 0 }
      const drillScore = Math.round(Math.min(b.drillCount / DRILL_CAP, 1) * 100)
      const readingScore = Math.round(Math.min(b.readCount / READING_CAP, 1) * 100)
      const combinedScore = Math.round((drillScore + readingScore) / 2)
      return { weekLabel, drillScore, readingScore, combinedScore }
    })

    return wrapResult(rows)
  } catch (err) {
    console.error('[ANALYTICS] getMultimodalStudyData failed:', err)
    return wrapError('Failed to load multimodal study data', [])
  }
}
