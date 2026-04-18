import { revalidateTag } from '@/lib/cache/revalidate'

export const CACHE_TAGS = {
  dashboard: 'dashboard',
  wiki: 'wiki',
  taxonomy: 'taxonomy',
} as const

export const getDashboardTag = (userId: string) => `${CACHE_TAGS.dashboard}:${userId}`
export const getUserStatsTag = (userId: string) => `user-stats:${userId}`
export const getUserMasteryTag = (userId: string) => `user-mastery:${userId}`
export const getUserSessionsTag = (userId: string) => `user-sessions:${userId}`
export const getReadinessScoreTag = (userId: string) => `readiness-score:${userId}`
export const getTaxonomyDisciplineTag = (disciplineId: string) => `${CACHE_TAGS.taxonomy}:${disciplineId}`

export const getDashboardCacheTags = (userId: string) => ([
  getDashboardTag(userId),
  getUserStatsTag(userId),
  getUserMasteryTag(userId),
  getUserSessionsTag(userId),
  getReadinessScoreTag(userId),
])

export const revalidateDashboardCacheTags = (userId: string) => {
  for (const tag of getDashboardCacheTags(userId)) {
    revalidateTag(tag, 'max')
  }
}
