import { redirect, notFound } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { canManageContent } from '@/lib/admin/roles'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import {
  getArticleFull,
  getArticleTaxonomyNodes,
  getQuestionsByNodeIds,
  getAllEIPromptsForArticle,
  getTaxonomyNodesInfo,
} from '@/lib/actions/admin/content'
import { ArticleDetailClient } from '../_components/ArticleDetailClient'

export const metadata = {
  title: 'Content Editor | SlateCamp Admin',
}

interface PageProps {
  params: Promise<{ id: string }>
}

const UnifiedEditorPage = async ({ params }: PageProps) => {
  const authorized = await canManageContent()
  if (!authorized) redirect(ROUTES.admin.root)

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
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'Knowledge Browser', href: ROUTES.admin.knowledge },
            { label: 'Article Editor' },
          ]}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <ArticleDetailClient
          article={article}
          questions={questions}
          eiPrompts={eiPrompts}
          taxonomyNodes={taxonomyNodes}
          taxonomyLinks={taxonomyLinks}
        />
      </div>
    </div>
  )
}

export default UnifiedEditorPage
