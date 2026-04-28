'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { assertCeoRole } from '@/lib/queries/ceo/auth'
import { createClient } from '@/lib/supabase/server'
import type { SystemRole } from '@/types/ceo'

const SYSTEM_ROLES: SystemRole[] = ['ceo', 'super_admin', 'admin', 'lead', 'member', 'consultant', 'viewer']
const DEPARTMENTS = ['engineering', 'content', 'design', 'marketing', 'operations', 'consulting'] as const

const teamMemberSchema = z.object({
  display_name: z.string().min(1, 'Name is required'),
  role_title: z.string().min(1, 'Role title is required'),
  department: z.enum(DEPARTMENTS),
  monthly_cost_php: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().positive().nullable(),
  ),
  system_role: z.enum(['ceo', 'super_admin', 'admin', 'lead', 'member', 'consultant', 'viewer'] as const),
  start_date: z.string().min(1, 'Start date is required'),
  user_id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.string().uuid().nullable(),
  ),
})

export const addTeamMember = async (
  formData: FormData,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await assertCeoRole()

    const parsed = teamMemberSchema.safeParse({
      display_name: formData.get('display_name'),
      role_title: formData.get('role_title'),
      department: formData.get('department'),
      monthly_cost_php: formData.get('monthly_cost_php'),
      system_role: formData.get('system_role'),
      start_date: formData.get('start_date'),
      user_id: formData.get('user_id'),
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' }
    }

    const supabase = await createClient()
    const { error } = await supabase.from('ceo_team_members').insert(parsed.data)

    if (error) return { success: false, error: error.message }

    revalidatePath('/ceo/team')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

export const updateTeamMember = async (
  formData: FormData,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await assertCeoRole()

    const id = formData.get('id') as string
    if (!id) return { success: false, error: 'Missing id' }

    const parsed = teamMemberSchema.safeParse({
      display_name: formData.get('display_name'),
      role_title: formData.get('role_title'),
      department: formData.get('department'),
      monthly_cost_php: formData.get('monthly_cost_php'),
      system_role: formData.get('system_role'),
      start_date: formData.get('start_date'),
      user_id: formData.get('user_id'),
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('ceo_team_members')
      .update(parsed.data)
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/ceo/team')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

export const removeTeamMember = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await assertCeoRole()

    if (!id) return { success: false, error: 'Missing id' }

    const today = new Date().toISOString().split('T')[0]
    const supabase = await createClient()
    const { error } = await supabase
      .from('ceo_team_members')
      .update({ end_date: today })
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/ceo/team')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

export const assignSystemRole = async (
  memberId: string,
  newRole: SystemRole,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await assertCeoRole()

    if (!memberId) return { success: false, error: 'Missing memberId' }

    if (!SYSTEM_ROLES.includes(newRole)) {
      return { success: false, error: `Invalid system role: ${newRole}` }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('ceo_team_members')
      .update({ system_role: newRole })
      .eq('id', memberId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/ceo/team')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}
