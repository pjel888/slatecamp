import { redirect, notFound } from 'next/navigation'
import { canManageContent } from '@/lib/admin/roles'
import {
  getArticleFull,
  getArticleTaxonomyNodes,
  getQuestionsByNodeIds,
  getQuestionsByArticleId,
  getAllEIPromptsForArticle,
  getTaxonomyNodesInfo,
} from '@/lib/actions/admin/content'
import { getTaxonomyNodes } from '@/lib/actions/admin/taxonomy'
import { ArticleDetailClient } from './ArticleDetailClient'

import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Edit Article — SlateCamp Admin' }

interface PageProps {
  params: Promise<{ id: string }>
}

const EditArticleFromTreePage = async ({ params }: PageProps) => {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin')

  const { id } = await params
  const article = await getArticleFull(id)
  if (!article) notFound()

  const [taxonomyLinks, eiPrompts, allTaxonomyNodes] = await Promise.all([
    getArticleTaxonomyNodes(article.article_id),
    getAllEIPromptsForArticle(article.article_id),
    getTaxonomyNodes(),
  ])

  const nodeIds = taxonomyLinks.map((l) => l.node_id)

  const [questions, taxonomyNodesInfo, articleQuestions] = await Promise.all([
    getQuestionsByNodeIds(nodeIds),
    getTaxonomyNodesInfo(nodeIds),
    getQuestionsByArticleId(article.article_id),
  ])

  return (
    <ArticleDetailClient
      article={article}
      questions={questions}
      articleQuestions={articleQuestions}
      eiPrompts={eiPrompts}
      taxonomyNodes={allTaxonomyNodes}
      taxonomyLinks={taxonomyLinks}
    />
  )
}

export default EditArticleFromTreePage
