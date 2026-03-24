import { createClient } from '@/lib/supabase/server'

export const getPipelineArticles = async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('wiki_articles')
    .select('article_id, title, slug, status, updated_at, created_at')
    .order('updated_at', { ascending: false })
  return data || []
}
