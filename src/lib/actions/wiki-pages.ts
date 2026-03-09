'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminByEmail } from '@/lib/admin/is-admin'
import type { WikiPage } from '@/types/app'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (!isAdminByEmail(user.email ?? undefined)) throw new Error('Forbidden')
}

function slugify(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/** Create a wiki page. Admin only. */
export async function createWikiPage(params: {
  category_id: string
  title: string
  slug: string
  markdown_content: string
  tags?: string[]
  is_free?: boolean
  order_index?: number
}) {
  await requireAdmin()
  const admin = createAdminClient()
  const slug = params.slug.trim() ? slugify(params.slug) : slugify(params.title)
  const { error } = await admin.from('wiki_pages').insert({
    category_id: params.category_id,
    title: params.title.trim(),
    slug,
    markdown_content: params.markdown_content.trim() || '',
    tags: params.tags ?? [],
    is_free: params.is_free ?? true,
    order_index: params.order_index ?? 0,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/wiki')
}

/** Update a wiki page. Admin only. */
export async function updateWikiPage(
  id: string,
  updates: {
    category_id?: string
    title?: string
    slug?: string
    markdown_content?: string
    tags?: string[]
    is_free?: boolean
    order_index?: number
  }
) {
  await requireAdmin()
  const admin = createAdminClient()
  const payload: Record<string, unknown> = {}
  if (updates.category_id !== undefined) payload.category_id = updates.category_id
  if (updates.title !== undefined) payload.title = updates.title.trim()
  if (updates.slug !== undefined) payload.slug = updates.slug.trim() ? slugify(updates.slug) : undefined
  if (updates.markdown_content !== undefined) payload.markdown_content = updates.markdown_content.trim()
  if (updates.tags !== undefined) payload.tags = updates.tags
  if (updates.is_free !== undefined) payload.is_free = updates.is_free
  if (updates.order_index !== undefined) payload.order_index = updates.order_index
  const { error } = await admin.from('wiki_pages').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/wiki')
}

/** Delete a wiki page. Admin only. */
export async function deleteWikiPage(id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('wiki_pages').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/wiki')
}

/** Create a single wiki page link (one direction). Admin only. For bi-directional, call twice with (A,B) and (B,A). */
export async function createWikiPageLink(source_page_id: string, target_page_id: string) {
  await requireAdmin()
  if (source_page_id === target_page_id) throw new Error('Source and target must differ')
  const admin = createAdminClient()
  const { error } = await admin.from('wiki_page_links').insert({
    source_page_id,
    target_page_id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/wiki')
}

/** Delete a wiki page link. Admin only. */
export async function deleteWikiPageLink(source_page_id: string, target_page_id: string) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin
    .from('wiki_page_links')
    .delete()
    .eq('source_page_id', source_page_id)
    .eq('target_page_id', target_page_id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/wiki')
}

export type WikiPageStub = { id: string; title: string; slug: string; category_id: string }

/** Fetch full page + backlinks + forward links for dev edit. Admin only. */
export async function getWikiPageForEdit(
  pageId: string
): Promise<{
  page: WikiPage | null
  backlinks: WikiPageStub[]
  forwardLinks: WikiPageStub[]
}> {
  await requireAdmin()
  const supabase = await createClient()
  const { data: page } = await supabase
    .from('wiki_pages')
    .select('*')
    .eq('id', pageId)
    .single()
  if (!page) return { page: null, backlinks: [], forwardLinks: [] }

  const { data: outLinks } = await supabase
    .from('wiki_page_links')
    .select('target_page_id')
    .eq('source_page_id', pageId)
  const { data: inLinks } = await supabase
    .from('wiki_page_links')
    .select('source_page_id')
    .eq('target_page_id', pageId)

  const targetIds = (outLinks ?? []).map((r: { target_page_id: string }) => r.target_page_id)
  const sourceIds = (inLinks ?? []).map((r: { source_page_id: string }) => r.source_page_id)

  const { data: forwardPages } = await supabase
    .from('wiki_pages')
    .select('id, title, slug, category_id')
    .in('id', targetIds)
  const { data: backPages } = await supabase
    .from('wiki_pages')
    .select('id, title, slug, category_id')
    .in('id', sourceIds)

  return {
    page: page as WikiPage,
    backlinks: (backPages ?? []) as WikiPageStub[],
    forwardLinks: (forwardPages ?? []) as WikiPageStub[],
  }
}
