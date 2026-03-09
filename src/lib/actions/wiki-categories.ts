'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminByEmail } from '@/lib/admin/is-admin'
import type { WikiCategory } from '@/types/app'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (!isAdminByEmail(user.email ?? undefined)) throw new Error('Forbidden')
  return { user }
}

/** Create a wiki category (root or under a parent). Admin only. */
export async function createWikiCategory(params: {
  parent_id: string | null
  name: string
  slug: string
  description?: string | null
  order_index?: number
}) {
  await requireAdmin()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('wiki_categories')
    .insert({
      parent_id: params.parent_id || null,
      name: params.name.trim(),
      slug: params.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: params.description?.trim() || null,
      order_index: params.order_index ?? 0,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/wiki')
  return { id: data.id }
}

/** Update a wiki category. Admin only. */
export async function updateWikiCategory(
  id: string,
  updates: {
    name?: string
    slug?: string
    description?: string | null
    order_index?: number
    parent_id?: string | null
  }
) {
  await requireAdmin()
  const admin = createAdminClient()
  const payload: Record<string, unknown> = {}
  if (updates.name !== undefined) payload.name = updates.name.trim()
  if (updates.slug !== undefined) payload.slug = updates.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  if (updates.description !== undefined) payload.description = updates.description?.trim() || null
  if (updates.order_index !== undefined) payload.order_index = updates.order_index
  if (updates.parent_id !== undefined) payload.parent_id = updates.parent_id || null

  const { error } = await admin.from('wiki_categories').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/wiki')
}

/** Delete a wiki category. Admin only. Children become root (parent_id set null by ON DELETE SET NULL). */
export async function deleteWikiCategory(id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('wiki_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/wiki')
}
