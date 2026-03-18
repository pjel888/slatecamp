import { createClient } from '@/lib/supabase/server'

export async function getArticles() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wiki_articles')
    .select('id:article_id, title, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return data || []
}

export async function getArticle(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wiki_articles')
    .select('id:article_id, title, content')
    .eq('article_id', id)
    .single()

  if (error || !data) return null
  return data
}
