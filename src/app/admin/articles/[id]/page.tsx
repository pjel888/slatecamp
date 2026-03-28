import { redirect, notFound } from 'next/navigation'
import { canManageContent } from '@/lib/admin/roles'
import {
  getArticleFull,
  getArticleTaxonomyNodes,
  getQuestionsByNodeIds,
  getAllEIPromptsForArticle,
  getTaxonomyNodesInfo,
} from '@/lib/actions/admin/content'
import { UnifiedContentEditor } from '@/components/admin/unified-editor'

import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Edit Article — SlateCamp Admin' }

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * /admin/articles/[id] — opens the full UnifiedContentEditor.
 *
 * This is the canonical editor entry point reached by clicking any article in
 * the taxonomy tree on /admin/articles. The /admin/content/[id] route resolves
 * identically — both render the same component. We keep both routes so that
 * direct links from either path continue to work.
 */
const EditArticleFromTreePage = async ({ params }: PageProps) => {
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
    <UnifiedContentEditor
      article={article}
      questions={questions}
      eiPrompts={eiPrompts}
      taxonomyNodes={taxonomyNodes}
      taxonomyLinks={taxonomyLinks}
    />
  )
}

export default EditArticleFromTreePage
