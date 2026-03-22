import { getBreadcrumbTrail } from '@/lib/actions/wiki-actions'
import { WikiHeaderClient } from './WikiHeaderClient'
import type { BreadcrumbItem } from '@/lib/actions/wiki-actions'

interface WikiHeaderProps {
  nodeId?: string
  articleId?: string
  articleTitle?: string
  articleSlug?: string
  scrollContainerId?: string
  /** Right sidebar content rendered inside the mobile actions drawer */
  mobileActionsContent?: React.ReactNode
}

export async function WikiHeader({
  nodeId,
  articleId,
  articleTitle,
  articleSlug,
  scrollContainerId,
  mobileActionsContent,
}: WikiHeaderProps) {
  let breadcrumbs: BreadcrumbItem[] = []

  if (nodeId) {
    breadcrumbs = await getBreadcrumbTrail(nodeId)
  }

  return (
    <WikiHeaderClient
      breadcrumbs={breadcrumbs}
      articleId={articleId}
      articleTitle={articleTitle}
      articleSlug={articleSlug}
      scrollContainerId={scrollContainerId}
      mobileActionsContent={mobileActionsContent}
    />
  )
}
