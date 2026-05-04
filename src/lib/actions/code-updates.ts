'use server'

import { createClient } from '@/lib/supabase/server'

export interface CodeUpdate {
  update_id: string
  lea_id: string | null
  article_id?: string | null
  code_name: string
  summary: string
  previous_value: string | null
  new_value: string | null
  effective_date: string | null
  is_lea_testable: boolean
  published_at: string
}

export interface CodeUpdatePage {
  data: CodeUpdate[]
  nextCursor: string | null
  error: string | null
}

export const getCodeUpdates = async (
  cursor?: string,
  limit = 20,
): Promise<CodeUpdatePage> => {
  const supabase = await createClient()

  let query = supabase
    .from('code_updates')
    .select(
      'update_id, lea_id, code_name, summary, previous_value, new_value, effective_date, is_lea_testable, published_at',
    )
    .order('published_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('published_at', cursor)
  }

  const { data, error } = await query

  if (error) {
    console.error('[CODE_UPDATES] getCodeUpdates failed:', error)
    return { data: [], nextCursor: null, error: 'Failed to fetch code updates.' }
  }

  const items = (data ?? []) as CodeUpdate[]
  const hasMore = items.length > limit
  const page = hasMore ? items.slice(0, limit) : items
  const nextCursor = hasMore ? page[page.length - 1].published_at : null

  return { data: page, nextCursor, error: null }
}

export const getCodeUpdateCount = async (): Promise<{ count: number; error: string | null }> => {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('code_updates')
    .select('update_id', { count: 'exact', head: true })

  if (error) {
    console.error('[CODE_UPDATES] getCodeUpdateCount failed:', error)
    return { count: 0, error: 'Failed to fetch count.' }
  }

  return { count: count ?? 0, error: null }
}
