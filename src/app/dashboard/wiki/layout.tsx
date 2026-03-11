import { createClient } from '@/lib/supabase/server'
import { WikiDevPanel } from '@/components/wiki/WikiDevPanel'
import { getWikiCategoryTree } from '@/lib/actions/wiki'
import type { WikiPageStub } from '@/lib/actions/wiki-pages'

export default async function WikiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isDevMode = !!user

  let tree: Awaited<ReturnType<typeof getWikiCategoryTree>> = []
  let allPagesList: WikiPageStub[] = []

  if (isDevMode) {
    const [treeResult, pagesResult] = await Promise.all([
      getWikiCategoryTree(),
      supabase
        .from('wiki_pages')
        .select('id, title, slug, category_id, is_deprecated, order_index')
        .order('order_index', { ascending: true }),
    ])
    tree = treeResult
    allPagesList = (pagesResult.data ?? []) as WikiPageStub[]
  }

  return (
    <>
      {children}
      <WikiDevPanel tree={tree} allPagesStubs={allPagesList} isDevMode={isDevMode} />
    </>
  )
}
