import { getArticle } from '@/lib/actions/admin/wiki-queries'
import { notFound } from 'next/navigation'
import { WikiEditor } from '@/components/admin/WikiEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditWikiPage({ params }: PageProps) {
  const { id } = await params
  const article = await getArticle(id)

  if (!article) notFound()

  return <WikiEditor article={article} />
}
