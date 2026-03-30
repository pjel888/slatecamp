import { redirect, notFound } from 'next/navigation'
import { canManageContent } from '@/lib/admin/roles'
import {
  getArticleFull,
  getArticleTaxonomyNodes,
  getQuestionsByNodeIds,
  getAllEIPromptsForArticle,
  getTaxonomyNodesInfo,
} from '@/lib/actions/admin/content'
import { ArticleDetailClient } from '@/app/admin/articles/[id]/ArticleDetailClient'

export const metadata = {
  title: 'Content Editor | SlateCamp Admin',
}

interface PageProps {
  params: Promise<{ id: string }>
}

const UnifiedEditorPage = async ({ params }: PageProps) => {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin')

  const { id } = await params
  const article = await getArticleFull(id)
  if (!article) notFound()

  const [taxonomyLinks, eiPrompts] = await Promise.all([
    getArticleTaxonomyNodes(article.article_id),
    getAllEIPromptsForArticle(article.article_id),
  ])

  const nodeIds = taxonomyLinks.map((l) => l.node_id)

  const [questions, taxonomyNodes] = await Promise.all([
    getQuestionsByNodeIds(nodeIds),
    getTaxonomyNodesInfo(nodeIds),
  ])

  return (
    <ArticleDetailClient
      article={article}
      questions={questions}
      eiPrompts={eiPrompts}
      taxonomyNodes={taxonomyNodes}
      taxonomyLinks={taxonomyLinks}
    />
  )
}

export default UnifiedEditorPage
