import { createClient } from '@/lib/supabase/server'
import { isAdminByEmail } from '@/lib/admin/is-admin'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'
import { WikiDevPanel } from '@/components/wiki/WikiDevPanel'
import { getWikiCategoryTree } from '@/lib/actions/wiki'
import type { WikiPage } from '@/types/app'

export default async function ArticleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const tree = await getWikiCategoryTree()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isDevMode = user ? isAdminByEmail(user.email ?? undefined) : false

  const { data: allPages } = await supabase
    .from('wiki_pages')
    .select('id, title, slug, category_id, is_deprecated, order_index')
    .order('order_index', { ascending: true })

  const allPagesList = (allPages ?? []) as {
    id: string
    title: string
    slug: string
    category_id: string
    is_deprecated: boolean
    order_index: number
  }[]

  const pagesByCategory: Record<
    string,
    Pick<WikiPage, 'id' | 'title' | 'slug' | 'is_deprecated'>[]
  > = {}
  for (const page of allPagesList) {
    if (!pagesByCategory[page.category_id]) pagesByCategory[page.category_id] = []
    pagesByCategory[page.category_id].push({
      id: page.id,
      title: page.title,
      slug: page.slug,
      is_deprecated: page.is_deprecated,
    })
  }

  return (
    <div className="flex -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 min-h-[calc(100vh-48px)]">
      <WikiSidebar tree={tree} pagesByCategory={pagesByCategory} />
      <div className="flex-1 min-w-0 p-4 lg:p-8">{children}</div>
      <WikiDevPanel tree={tree} allPagesStubs={allPagesList} isDevMode={isDevMode} />
    </div>
  )
}
