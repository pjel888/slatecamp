import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AdminWikiEditor } from '@/components/admin/AdminWikiEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getArticle(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('wiki_articles')
    .select('id, title, content, discipline_id, status, created_at, updated_at')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function EditWikiArticlePage({ params }: PageProps) {
  const { id } = await params
  const article = await getArticle(id)

  if (!article) {
    notFound()
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <AdminWikiEditor 
        initialContent={article.content}
        initialMetadata={{
          title: article.title,
          discipline_id: article.discipline_id || '',
          status: article.status as any,
        }}
        articleId={article.id}
      />
    </div>
  )
}
