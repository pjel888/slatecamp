'use server'

import { createClient } from '@/lib/supabase/server'
import { assertCeoAccess } from '@/lib/ceo/access'
import { wrapResult, wrapError } from '@/lib/actions/analytics/shared-helpers'
import type { AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

export type EngagementDepthBucket = {
  scoreRange: string
  userCount: number
  minScore: number
  maxScore: number
}

export type EngagementDepthData = {
  buckets: EngagementDepthBucket[]
  avgScore: number
  totalUsers: number
}

// Weights per the spec
const WEIGHTS = {
  highlights: 0.15,
  bookmarks: 0.10,
  teachBacks: 0.25,
  eiResponses: 0.20,
  sessionQuality: 0.30,
}

const BUCKET_LABELS = [
  { label: '0–20', min: 0, max: 0.2 },
  { label: '20–40', min: 0.2, max: 0.4 },
  { label: '40–60', min: 0.4, max: 0.6 },
  { label: '60–80', min: 0.6, max: 0.8 },
  { label: '80–100', min: 0.8, max: 1.01 },
]

export const getEngagementDepthData = async (): Promise<
  AnalyticsResult<EngagementDepthData>
> => {
  await assertCeoAccess()

  try {
    const supabase = await createClient()

    // Fetch counts per user from each table in parallel
    const [
      highlightsRes,
      bookmarksRes,
      teachBacksRes,
      eiResponsesRes,
      sessionsRes,
    ] = await Promise.all([
      supabase
        .from('wiki_highlights')
        .select('user_id'),
      supabase
        .from('wiki_bookmarks')
        .select('user_id'),
      supabase
        .from('teach_back_responses')
        .select('user_id'),
      supabase
        .from('wiki_ei_responses')
        .select('user_id'),
      supabase
        .from('quiz_sessions')
        .select('user_id, completed_at, total_questions, correct_count')
        .not('completed_at', 'is', null),
    ])

    // Build per-user count maps
    const countMap = <T extends { user_id: string }>(
      rows: T[] | null,
    ): Record<string, number> => {
      const acc: Record<string, number> = {}
      for (const row of rows ?? []) {
        acc[row.user_id] = (acc[row.user_id] ?? 0) + 1
      }
      return acc
    }

    const highlightCounts = countMap(highlightsRes.data)
    const bookmarkCounts = countMap(bookmarksRes.data)
    const teachBackCounts = countMap(teachBacksRes.data)
    const eiCounts = countMap(eiResponsesRes.data)

    // Session quality: completion rate × accuracy per user
    const sessionQuality: Record<string, { qualSum: number; count: number }> = {}
    for (const s of sessionsRes.data ?? []) {
      const uid = s.user_id
      if (!uid) continue
      const total = s.total_questions ?? 0
      const correct = s.correct_count ?? 0
      const qual = total > 0 ? correct / total : 0
      if (!sessionQuality[uid]) sessionQuality[uid] = { qualSum: 0, count: 0 }
      sessionQuality[uid].qualSum += qual
      sessionQuality[uid].count += 1
    }

    // Collect all user IDs seen
    const allUsers = new Set<string>([
      ...Object.keys(highlightCounts),
      ...Object.keys(bookmarkCounts),
      ...Object.keys(teachBackCounts),
      ...Object.keys(eiCounts),
      ...Object.keys(sessionQuality),
    ])

    if (allUsers.size === 0) {
      return wrapResult({ buckets: [], avgScore: 0, totalUsers: 0 })
    }

    // Normalisation caps (95th percentile heuristics)
    const CAPS = {
      highlights: 50,
      bookmarks: 30,
      teachBacks: 20,
      eiResponses: 40,
    }

    const clamp = (v: number, cap: number) => Math.min(v / cap, 1)

    let scoreSum = 0
    const bucketCounts = BUCKET_LABELS.map(() => 0)

    for (const uid of allUsers) {
      const sq = sessionQuality[uid]
      const sqScore = sq && sq.count > 0 ? sq.qualSum / sq.count : 0

      const score =
        clamp(highlightCounts[uid] ?? 0, CAPS.highlights) * WEIGHTS.highlights +
        clamp(bookmarkCounts[uid] ?? 0, CAPS.bookmarks) * WEIGHTS.bookmarks +
        clamp(teachBackCounts[uid] ?? 0, CAPS.teachBacks) * WEIGHTS.teachBacks +
        clamp(eiCounts[uid] ?? 0, CAPS.eiResponses) * WEIGHTS.eiResponses +
        sqScore * WEIGHTS.sessionQuality

      scoreSum += score

      const bucketIdx = BUCKET_LABELS.findIndex(
        (b) => score >= b.min && score < b.max,
      )
      if (bucketIdx >= 0) bucketCounts[bucketIdx] += 1
    }

    const totalUsers = allUsers.size
    const avgScore = Math.round((scoreSum / totalUsers) * 1000) / 10

    const buckets: EngagementDepthBucket[] = BUCKET_LABELS.map((b, i) => ({
      scoreRange: b.label,
      userCount: bucketCounts[i],
      minScore: b.min * 100,
      maxScore: b.max * 100,
    }))

    return wrapResult({ buckets, avgScore, totalUsers })
  } catch (err) {
    return wrapError(
      err instanceof Error ? err.message : 'Failed to load engagement depth',
      { buckets: [], avgScore: 0, totalUsers: 0 },
    )
  }
}
