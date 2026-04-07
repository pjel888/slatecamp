import { getCachedTaxonomyTreeFull } from '@/lib/actions/cached-queries'
import { WikiSidebar } from './WikiSidebar'

/**
 * Async server component that fetches taxonomy data independently.
 * Wrapped in its own Suspense boundary so the rest of the layout
 * (content area, providers) renders immediately without waiting
 * for the full taxonomy tree.
 *
 * Uses getCachedTaxonomyTreeFull (2h TTL + tag revalidation)
 * instead of uncached getTaxonomyTree to eliminate redundant DB hits.
 */
export const WikiSidebarLoader = async ({
  disciplineId,
  disciplineName,
}: {
  disciplineId: string
  disciplineName: string
}) => {
  const nodes = await getCachedTaxonomyTreeFull(disciplineId)

  return (
    <WikiSidebar
      disciplineId={disciplineId}
      disciplineName={disciplineName}
      initialNodes={nodes}
    />
  )
}
