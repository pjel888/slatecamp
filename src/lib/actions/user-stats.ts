'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export async function getUserGlobalStats() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { data: stats, error } = await supabase
    .from('user_global_stats')
    .select('*, disciplines(*)')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user global stats:', error)
    return null
  }

  return stats
}

export async function ensureUserGlobalStats() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { data: stats, error } = await supabase
    .from('user_global_stats')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!stats && !error) {
    // Fetch first available discipline if none set
    const { data: disciplines } = await supabase.from('disciplines').select('*').limit(1)
    const disciplineId = disciplines?.[0]?.discipline_id

    const { data: newStats, error: insertError } = await supabase
      .from('user_global_stats')
      .insert({
        user_id: user.id,
        current_discipline_id: disciplineId,
        global_readiness_score: 0,
        current_streak_days: 0,
        longest_streak_days: 0
      })
      .select('*, disciplines(*)')
      .single()
    
    if (insertError) {
      console.error('Error creating user global stats:', insertError)
      return null
    }
    return newStats
  }

  return stats
}
