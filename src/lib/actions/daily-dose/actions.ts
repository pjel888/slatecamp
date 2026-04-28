'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { generateDailyDose, adjustDoseToTimeBudget } from './generate'
import type { DoseActivity } from './generate'

// ── Types ────────────────────────────────────────────────────────────────────

export interface StoredDose {
  id: string
  userId: string
  doseDate: string
  activities: DoseActivity[]
  estimatedMinutes: number
  rationale: string
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const todayDateString = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const mapRowToStoredDose = (row: {
  id: string
  user_id: string
  dose_date: string
  activities: unknown
  estimated_minutes: number
  rationale: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}): StoredDose => ({
  id: row.id,
  userId: row.user_id,
  doseDate: row.dose_date,
  activities: (row.activities ?? []) as DoseActivity[],
  estimatedMinutes: row.estimated_minutes,
  rationale: row.rationale ?? '',
  startedAt: row.started_at,
  completedAt: row.completed_at,
  createdAt: row.created_at,
})

// ── getTodayDose ─────────────────────────────────────────────────────────────
// Fetch today's dose if it exists; otherwise generate, persist, and return it.

export const getTodayDose = async (
  timeBudgetMinutes?: number,
): Promise<StoredDose | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const today = todayDateString()

  // Try to fetch existing dose for today
  const { data: existing } = await supabase
    .from('daily_doses')
    .select('id, user_id, dose_date, activities, estimated_minutes, rationale, started_at, completed_at, created_at')
    .eq('user_id', user.id)
    .eq('dose_date', today)
    .maybeSingle()

  if (existing) {
    // If a time budget was specified and differs from stored, adjust the activities
    if (timeBudgetMinutes && timeBudgetMinutes !== existing.estimated_minutes) {
      const adjusted = await adjustDoseToTimeBudget(
        {
          activities: (existing.activities ?? []) as DoseActivity[],
          estimatedMinutes: existing.estimated_minutes,
          rationale: existing.rationale ?? '',
        },
        timeBudgetMinutes,
      )

      const { data: updated } = await supabase
        .from('daily_doses')
        .update({
          activities: adjusted.activities as unknown as Record<string, unknown>[],
          estimated_minutes: adjusted.estimatedMinutes,
        })
        .eq('id', existing.id)
        .select('id, user_id, dose_date, activities, estimated_minutes, rationale, started_at, completed_at, created_at')
        .single()

      if (updated) return mapRowToStoredDose(updated)
    }

    return mapRowToStoredDose(existing)
  }

  // Generate a new dose
  let dose = await generateDailyDose(user.id, timeBudgetMinutes)

  // Adjust if explicit time budget given
  if (timeBudgetMinutes) {
    dose = await adjustDoseToTimeBudget(dose, timeBudgetMinutes)
  }

  // Persist
  const { data: inserted } = await supabase
    .from('daily_doses')
    .insert({
      user_id: user.id,
      dose_date: today,
      activities: dose.activities as unknown as Record<string, unknown>[],
      estimated_minutes: dose.estimatedMinutes,
      rationale: dose.rationale,
    })
    .select('id, user_id, dose_date, activities, estimated_minutes, rationale, started_at, completed_at, created_at')
    .single()

  if (!inserted) return null
  return mapRowToStoredDose(inserted)
}

// ── startDoseActivity ────────────────────────────────────────────────────────
// Mark the dose as started (sets started_at if not already set).

export const startDoseActivity = async (
  doseId: string,
): Promise<{ success: boolean }> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { success: false }

  const { error } = await supabase
    .from('daily_doses')
    .update({ started_at: new Date().toISOString() })
    .eq('id', doseId)
    .eq('user_id', user.id)
    .is('started_at', null)

  return { success: !error }
}

// ── completeDoseActivity ─────────────────────────────────────────────────────
// Mark the dose as completed.

export const completeDoseActivity = async (
  doseId: string,
): Promise<{ success: boolean }> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { success: false }

  const { error } = await supabase
    .from('daily_doses')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', doseId)
    .eq('user_id', user.id)

  return { success: !error }
}

// ── getDoseHistory ───────────────────────────────────────────────────────────
// Get recent dose history for the user.

export const getDoseHistory = async (
  days: number = 7,
): Promise<StoredDose[]> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data } = await supabase
    .from('daily_doses')
    .select('id, user_id, dose_date, activities, estimated_minutes, rationale, started_at, completed_at, created_at')
    .eq('user_id', user.id)
    .gte('dose_date', since)
    .order('dose_date', { ascending: false })

  return (data ?? []).map(mapRowToStoredDose)
}

// ── regenerateDose ───────────────────────────────────────────────────────────
// Force-regenerate today's dose with a new time budget.

export const regenerateDose = async (
  timeBudgetMinutes: number,
): Promise<StoredDose | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const today = todayDateString()

  // Delete existing dose for today (if any)
  await supabase
    .from('daily_doses')
    .delete()
    .eq('user_id', user.id)
    .eq('dose_date', today)
    .is('started_at', null) // only delete if not yet started

  // Generate fresh
  const dose = await adjustDoseToTimeBudget(
    await generateDailyDose(user.id, timeBudgetMinutes),
    timeBudgetMinutes,
  )

  const { data: inserted } = await supabase
    .from('daily_doses')
    .insert({
      user_id: user.id,
      dose_date: today,
      activities: dose.activities as unknown as Record<string, unknown>[],
      estimated_minutes: dose.estimatedMinutes,
      rationale: dose.rationale,
    })
    .select('id, user_id, dose_date, activities, estimated_minutes, rationale, started_at, completed_at, created_at')
    .single()

  if (!inserted) return null
  return mapRowToStoredDose(inserted)
}
