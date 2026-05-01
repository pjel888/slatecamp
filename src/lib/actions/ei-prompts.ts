'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export type EIPrompt = {
  prompt_id: string
  node_id: string | null
  insert_after_heading: string
  prompt_text: string
  reveal_text: string
  options: Array<{ text: string; is_correct: boolean }>
  sort_order: number
}

export type EIResponseMap = Record<string, {
  response_text: string | null
  selected_option_index: number | null
  responded_at: string
  updated_at: string
}>

/**
 * Fetch published, active EI prompts for a wiki article.
 * Uses idx_ei_prompts_article_active partial index.
 * Returns [] for articles with no prompts — WikiArticle renders normally.
 */
export const getEIPromptsForArticle = async (articleId: string): Promise<EIPrompt[]> => {
  const supabase = await createClient()

  const { data } = await supabase
    .from('wiki_ei_prompts')
    .select('prompt_id, node_id, insert_after_heading, prompt_text, reveal_text, options, sort_order')
    .eq('article_id', articleId)
    .eq('status', 'published')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (data ?? []) as EIPrompt[]
}

/**
 * Fetch a user's existing responses for all prompts in an article.
 * Returns { [prompt_id]: response } map for O(1) lookup.
 * Returns {} for unauthenticated users or articles with no prior responses.
 */
export const getUserEIResponsesForArticle = async (
  articleId: string
): Promise<EIResponseMap> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return {}

  const { data } = await supabase
    .from('wiki_ei_responses')
    .select(`
      prompt_id,
      response_text,
      selected_option_index,
      responded_at,
      updated_at,
      wiki_ei_prompts!inner(article_id)
    `)
    .eq('user_id', user.id)
    .eq('wiki_ei_prompts.article_id', articleId)

  return Object.fromEntries(
    (data ?? []).map((r: any) => [r.prompt_id, {
      response_text: r.response_text,
      selected_option_index: r.selected_option_index,
      responded_at: r.responded_at,
      updated_at: r.updated_at,
    }])
  )
}

/**
 * Submit or update a user's response to an EI prompt.
 * Upsert on (user_id, prompt_id): first call = INSERT, subsequent = UPDATE.
 * responded_at is immutable (DB default on insert, preserved on update).
 */
export const submitEIResponse = async (params: {
  promptId: string
  responseText?: string
  selectedOptionIndex?: number
}): Promise<{ success: boolean; error?: string }> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('wiki_ei_responses')
    .upsert(
      {
        user_id: user.id,
        prompt_id: params.promptId,
        response_text: params.responseText ?? null,
        selected_option_index: params.selectedOptionIndex ?? null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id, prompt_id',
        ignoreDuplicates: false,
      }
    )

  if (error) {
    console.error('[EI] submitEIResponse failed:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true }
}
