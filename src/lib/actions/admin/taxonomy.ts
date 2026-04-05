'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath, revalidateTag } from 'next/cache'
import { canManageContent } from '@/lib/admin/roles'
import { z } from 'zod'
import { CACHE_TAGS } from '../cache-tags'

export const getTaxonomyNodes = async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, level, subject_area, is_leaf, parent_id, discipline_id, sort_order, ale_id')
    .order('level', { ascending: true })
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching taxonomy nodes:', error)
    return []
  }

  return data || []
}

const updateNodeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
})

export const updateTaxonomyNode = async (id: string, data: { name: string }) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const parsed = updateNodeSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('taxonomy_tree')
    .update({ name: parsed.data.name })
    .eq('node_id', id)

  if (!error) {
    revalidateTag(CACHE_TAGS.taxonomy, 'max')
    revalidatePath('/admin/taxonomy')
  }

  return { error }
}

const createNodeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  parent_id: z.string().nullable(),
  level: z.number().int().min(1).max(3),
  discipline_id: z.string().min(1),
  sort_order: z.number().int().optional(),
})

export const createTaxonomyNode = async (data: {
  name: string
  parent_id: string | null
  level: number
  discipline_id: string
  sort_order?: number
}) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const parsed = createNodeSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const supabase = createAdminClient()

  // Generate slug
  const slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Default sort order
  let sortOrder = parsed.data.sort_order ?? 10
  if (parsed.data.name === 'Subject Overview & Strategy') sortOrder = 1
  if (parsed.data.name === 'Subject Mastery & Connections') sortOrder = 99

  const { data: newNode, error } = await supabase
    .from('taxonomy_tree')
    .insert({
      discipline_id: parsed.data.discipline_id,
      name: parsed.data.name,
      slug,
      level: parsed.data.level,
      subject_area: parsed.data.parent_id ? 'Subject' : null,
      is_leaf: parsed.data.level === 3,
      parent_id: parsed.data.parent_id,
      sort_order: sortOrder,
      ale_id: parsed.data.level === 3 ? `USER-NEW-${Date.now()}` : null,
    })
    .select('node_id, name, level, subject_area, is_leaf, parent_id, discipline_id')
    .single()

  if (!error) {
    revalidateTag(CACHE_TAGS.taxonomy, 'max')
    revalidatePath('/admin/taxonomy')
  }

  return { data: newNode, error }
}

export const deleteTaxonomyNode = async (id: string) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('taxonomy_tree')
    .delete()
    .eq('node_id', id)

  if (!error) {
    revalidateTag(CACHE_TAGS.taxonomy, 'max')
    revalidatePath('/admin/taxonomy')
  }

  return { error }
}
