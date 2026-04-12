'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateDashboardCacheTags } from './cache-tags'
import type { WikiActionResult } from '@/types/wiki'

export interface WikiBookmarkRow {
  article_id: string
  slug: string
  title: string
  created_at: string
}

/**
 * Fetch all bookmarks for the current user, newest first.
 * Joins with wiki_articles to get slug + title for display.
 */
export async function getWikiBookmarks(): Promise<WikiBookmarkRow[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('wiki_bookmarks')
    .select('article_id, created_at, wiki_articles(slug, title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Wiki] getWikiBookmarks failed:', error.message)
    return []
  }

  return (data ?? []).map((row: any) => ({
    article_id: row.article_id,
    slug: row.wiki_articles?.slug ?? '',
    title: row.wiki_articles?.title ?? '',
    created_at: row.created_at,
  }))
}

/**
 * Add a bookmark for the current user.
 * Uses upsert so duplicate calls are safe.
 */
export async function addWikiBookmark(articleId: string): Promise<WikiActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('wiki_bookmarks')
    .upsert(
      { user_id: user.id, article_id: articleId },
      { onConflict: 'user_id,article_id' },
    )

  if (error) {
    console.error('[Wiki] addWikiBookmark failed:', error.message)
    return { success: false, error: error.message }
  }
  revalidateDashboardCacheTags(user.id)
  return { success: true }
}

/**
 * Remove a bookmark for the current user by article_id.
 */
export async function removeWikiBookmark(articleId: string): Promise<WikiActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('wiki_bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('article_id', articleId)

  if (error) {
    console.error('[Wiki] removeWikiBookmark failed:', error.message)
    return { success: false, error: error.message }
  }
  revalidateDashboardCacheTags(user.id)
  return { success: true }
}

