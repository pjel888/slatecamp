import { getTaxonomyTree } from '@/lib/actions/wiki-actions'
import { WikiSidebar } from './WikiSidebar'

/**
 * Async server component that fetches taxonomy data independently.
 * Wrapped in its own Suspense boundary so the rest of the layout
 * (content area, providers) renders immediately without waiting
 * for the full taxonomy tree.
 */
export const WikiSidebarLoader = async ({
  disciplineId,
  disciplineName,
}: {
  disciplineId: string
  disciplineName: string
}) => {
  const nodes = await getTaxonomyTree(disciplineId)

  return (
    <WikiSidebar
      disciplineId={disciplineId}
      disciplineName={disciplineName}
      initialNodes={nodes}
    />
  )
}
