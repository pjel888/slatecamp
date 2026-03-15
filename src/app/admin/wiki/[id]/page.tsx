import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { WikiEditor } from '@/components/admin/WikiEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getArticle(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wiki_articles')
    .select('id:article_id, title, content')
    .eq('article_id', id)
    .single()

  if (error || !data) return null
  return data
}

export default async function EditWikiPage({ params }: PageProps) {
  const { id } = await params
  const article = await getArticle(id)

  if (!article) notFound()

  return <WikiEditor article={article} />
}
