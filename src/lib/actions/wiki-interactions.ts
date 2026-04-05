'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Submit feedback for a wiki article.
 */
export async function submitArticleFeedback(articleId: string, isHelpful: boolean): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('wiki_article_feedback')
    .upsert({
      article_id: articleId,
      user_id: user.id,
      is_helpful: isHelpful,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'article_id,user_id'
    })

  if (error) {
    console.error('[submitArticleFeedback] Error:', error.message)
    return false
  }

  return true
}

/**
 * Fetch feedback for a wiki article for the current user.
 */
export async function getUserArticleFeedback(articleId: string): Promise<'up' | 'down' | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('wiki_article_feedback')
    .select('is_helpful')
    .eq('article_id', articleId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) return null
  return data.is_helpful ? 'up' : 'down'
}

/**
 * Save a text highlight for a wiki article.
 */
export async function addWikiHighlight(articleId: string, text: string, color = 'yellow'): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('wiki_highlights')
    .insert({
      user_id: user.id,
      article_id: articleId,
      highlight_text: text,
      color: color
    })

  if (error) {
    console.error('[addWikiHighlight] Error:', error.message)
    return false
  }

  return true
}

/**
 * Fetch all highlights for a wiki article for the current user.
 */
export async function getWikiHighlights(articleId: string): Promise<any[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('wiki_highlights')
    .select('*')
    .eq('article_id', articleId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[getWikiHighlights] Error:', error.message)
    return []
  }

  return data || []
}

/**
 * Remove a highlight by ID.
 */
export async function removeWikiHighlight(highlightId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('wiki_highlights')
    .delete()
    .eq('id', highlightId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[removeWikiHighlight] Error:', error.message)
    return false
  }

  return true
}
