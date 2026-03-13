import { getWikiArticleBySlug } from '@/lib/actions/wiki-actions'
import { WikiArticle } from '@/components/wiki/WikiArticle'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function WikiArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getWikiArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="h-full w-full">
      <WikiArticle article={article} />
    </div>
  )
}
