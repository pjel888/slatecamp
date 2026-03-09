import { getWikiCategoryTree } from '@/lib/actions/wiki'
import { createClient } from '@/lib/supabase/server'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'
import type { WikiPage } from '@/types/app'

export default async function WikiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tree = await getWikiCategoryTree()

  // Fetch all page stubs (lightweight — no markdown_content) grouped by category
  const supabase = await createClient()
  const { data: allPages } = await supabase
    .from('wiki_pages')
    .select('id, title, slug, category_id, is_deprecated, order_index')
    .order('order_index', { ascending: true })

  const pagesByCategory: Record<
    string,
    Pick<WikiPage, 'id' | 'title' | 'slug' | 'is_deprecated'>[]
  > = {}
  for (const page of (allPages ?? []) as (Pick<WikiPage, 'id' | 'title' | 'slug' | 'is_deprecated'> & { category_id: string })[]) {
    if (!pagesByCategory[page.category_id]) {
      pagesByCategory[page.category_id] = []
    }
    pagesByCategory[page.category_id].push(page)
  }

  return (
    <div className="flex -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 min-h-[calc(100vh-48px)]">
      <WikiSidebar tree={tree} pagesByCategory={pagesByCategory} />
      <div className="flex-1 min-w-0 p-4 lg:p-8">{children}</div>
    </div>
  )
}
