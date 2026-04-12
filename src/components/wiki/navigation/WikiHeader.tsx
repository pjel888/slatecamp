import { getBreadcrumbTrail } from '@/lib/actions/wiki-actions'
import { WikiHeaderClient } from './WikiHeaderClient'
import type { BreadcrumbItem } from '@/lib/actions/wiki-actions'

interface WikiHeaderProps {
  nodeId?: string
  disciplineId?: string
  articleId?: string
  articleTitle?: string
  articleSlug?: string
  scrollContainerId?: string
  disableUserActions?: boolean
  /** Right sidebar content rendered inside the mobile actions drawer */
  mobileActionsContent?: React.ReactNode
}

export async function WikiHeader({
  nodeId,
  disciplineId,
  articleId,
  articleTitle,
  articleSlug,
  scrollContainerId,
  disableUserActions = false,
  mobileActionsContent,
}: WikiHeaderProps) {
  let breadcrumbs: BreadcrumbItem[] = []

  if (nodeId) {
    breadcrumbs = await getBreadcrumbTrail(nodeId, disciplineId)
  }

  return (
    <WikiHeaderClient
      breadcrumbs={breadcrumbs}
      articleId={articleId}
      articleTitle={articleTitle}
      articleSlug={articleSlug}
      scrollContainerId={scrollContainerId}
      disableUserActions={disableUserActions}
      mobileActionsContent={mobileActionsContent}
    />
  )
}
