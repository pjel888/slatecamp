import { getBreadcrumbTrail } from '@/lib/actions/wiki-actions'
import { getCachedTaxonomyTreeFull } from '@/lib/actions/cached-queries'
import { WikiHeaderClient } from './WikiHeaderClient'
import type { BreadcrumbItem } from '@/lib/actions/wiki-actions'
import type { TaxonomyNode } from '@/lib/actions/taxonomy'

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
  let mobileSidebarNodes: TaxonomyNode[] | undefined

  if (nodeId) {
    breadcrumbs = await getBreadcrumbTrail(nodeId, disciplineId)
  }

  if (disciplineId) {
    mobileSidebarNodes = await getCachedTaxonomyTreeFull(disciplineId)
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
      mobileSidebarNodes={mobileSidebarNodes}
    />
  )
}
