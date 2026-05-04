import { redirect, notFound } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { canManageContent, canReviewContent } from '@/lib/admin/roles'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { WikiArticle } from '@/components/wiki'
import {
  getArticleFull,
  getArticleTaxonomyNodes,
  getQuestionsByArticleId,
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
  const [canManage, canReview] = await Promise.all([
    canManageContent(),
    canReviewContent(),
  ])
  if (!canManage && !canReview) redirect(ROUTES.admin.root)

  const { id } = await params
  const article = await getArticleFull(id)
  if (!article) notFound()

  const [taxonomyLinks, eiPrompts] = await Promise.all([
    getArticleTaxonomyNodes(article.article_id),
    getAllEIPromptsForArticle(article.article_id),
  ])

  const nodeIds = taxonomyLinks.map((l) => l.node_id)

  const [questions, taxonomyNodes] = await Promise.all([
    getQuestionsByArticleId(article.article_id),
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
        {canManage ? (
          <ArticleDetailClient
            article={article}
            questions={questions}
            eiPrompts={eiPrompts}
            taxonomyNodes={taxonomyNodes}
            taxonomyLinks={taxonomyLinks}
          />
        ) : (
          <div className="h-full overflow-y-auto bg-surface-light">
            <div className="mx-auto max-w-4xl space-y-4 px-8 py-8">
              <div className="rounded-md border border-border bg-card p-4 text-left">
                <p className="text-sm font-semibold text-foreground">Reviewer-safe article workspace</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reviewers can inspect the saved article render here and complete approval or change requests from the queue. Direct editing remains restricted in this pass.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <a
                    href={`/dashboard/wiki/${article.article_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Open student article route
                  </a>
                  <a
                    href={ROUTES.admin.reviews}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Return to review queue
                  </a>
                </div>
              </div>

              <div className="rounded-md border border-border bg-card px-8 py-8">
                <WikiArticle
                  article={article as any}
                  eiPrompts={eiPrompts as any}
                  eiResponses={{}}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UnifiedEditorPage
