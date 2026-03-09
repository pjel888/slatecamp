import Link from 'next/link'
import { Search, FileText } from 'lucide-react'
import { getWikiCategoryTree, searchWiki } from '@/lib/actions/wiki'
import { createClient } from '@/lib/supabase/server'
import { WikiSearchBar } from '@/components/wiki/WikiSearchBar'
import { WIKI_SUBJECT_ICONS, DEFAULT_WIKI_ICON } from '@/components/wiki/wiki-icons'
import type { WikiSearchResult } from '@/types/app'

interface WikiHomeProps {
  searchParams: Promise<{ q?: string }>
}

export default async function WikiHomePage({ searchParams }: WikiHomeProps) {
  const { q } = await searchParams
  const tree = await getWikiCategoryTree()

  // Fetch page counts per category for the subject cards
  const supabase = await createClient()
  const { data: allPages } = await supabase
    .from('wiki_pages')
    .select('category_id')

  const pageCountByCategory: Record<string, number> = {}
  for (const row of (allPages ?? []) as { category_id: string }[]) {
    pageCountByCategory[row.category_id] = (pageCountByCategory[row.category_id] ?? 0) + 1
  }

  // Roll up child-category page counts into their root parent
  function countPagesInTree(categoryId: string, childIds: string[]): number {
    let total = pageCountByCategory[categoryId] ?? 0
    for (const childId of childIds) {
      total += pageCountByCategory[childId] ?? 0
    }
    return total
  }

  let searchResults: WikiSearchResult[] = []
  if (q) {
    searchResults = await searchWiki(q)
  }

  return (
    <div className="max-w-[720px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground tracking-tight mb-1">
          Resources Wiki
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse reference notes by architectural subject.
        </p>
      </div>

      <div className="mb-6">
        <WikiSearchBar />
      </div>

      {/* Search Results */}
      {q && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
          </h2>
          {searchResults.length === 0 ? (
            <div className="rounded-lg border border-border/40 p-8 text-center">
              <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">No pages found. Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  href={`/dashboard/wiki/${result.slug}`}
                  className="block rounded-lg border border-border/40 p-4 transition-colors hover:bg-secondary/40"
                >
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    {result.title}
                    {result.is_deprecated && (
                      <span className="ml-2 text-[11px] font-normal text-color-signal-amber">(Deprecated)</span>
                    )}
                  </h3>
                  <p
                    className="text-xs text-muted-foreground line-clamp-2 [&_mark]:bg-color-signal-amber/20 [&_mark]:text-foreground [&_mark]:rounded-sm [&_mark]:px-0.5"
                    dangerouslySetInnerHTML={{ __html: result.headline }}
                  />
                  {result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subject Cards (shown when not searching) */}
      {!q && (
        <div className="grid gap-3 sm:grid-cols-2">
          {tree.map((subject) => {
            const Icon = WIKI_SUBJECT_ICONS[subject.slug] ?? DEFAULT_WIKI_ICON
            const childIds = (subject.children ?? []).map((c) => c.id)
            const totalPages = countPagesInTree(subject.id, childIds)
            const subTopics = subject.children ?? []

            return (
              <div
                key={subject.id}
                className="group rounded-lg border border-border/40 p-4 transition-colors hover:border-border"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground leading-snug">
                      {subject.name}
                    </h3>
                    {subject.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {subject.description}
                      </p>
                    )}

                    {/* Sub-topic pills */}
                    {subTopics.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {subTopics.map((child) => (
                          <span
                            key={child.id}
                            className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5"
                          >
                            {child.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Page count */}
                    {totalPages > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <FileText className="h-3 w-3" strokeWidth={1.5} />
                        {totalPages} {totalPages === 1 ? 'page' : 'pages'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
