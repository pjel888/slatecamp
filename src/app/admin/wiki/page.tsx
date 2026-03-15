import { createClient } from '@/lib/supabase/server'
import { WikiArticleList } from '@/components/admin/WikiArticleList'

async function getArticles() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('wiki_articles')
    .select('id, title, status, discipline_id, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return data || []
}

export default async function AdminWikiPage() {
  const articles = await getArticles()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Wiki Content Manager</h1>
        <p className="text-muted-foreground">Manage knowledge base articles</p>
      </div>

      <WikiArticleList initialArticles={articles} />
    </div>
  )
}
