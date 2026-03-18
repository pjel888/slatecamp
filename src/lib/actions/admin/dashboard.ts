import { createClient } from '@/lib/supabase/server'

export async function getAdminStats() {
  const supabase = await createClient()

  // Real check against database tables
  const [q, w, a] = await Promise.all([
    supabase.from('questions').select('question_id', { count: 'exact', head: true }),
    supabase.from('wiki_articles').select('article_id', { count: 'exact', head: true }),
    supabase.from('models_3d').select('model_id', { count: 'exact', head: true }),
  ])

  return {
    questions: q.count || 0,
    wiki: w.count || 0,
    assets: a.count || 0,
  }
}
