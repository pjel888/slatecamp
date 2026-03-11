import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { searchWikiPaginated, getWikiCategoryTree } from '@/lib/actions/wiki'
import { WikiCommandPalette } from '@/components/wiki/WikiCommandPalette'
import { ROUTES } from '@/lib/constants/routes'

interface Props {
  searchParams: Promise<{ q?: string; subject?: string; page?: string }>
}

export default async function WikiSearchPage({ searchParams }: Props) {
  const { q, subject, page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))
  const query = q?.trim() ?? ''

  const [{ results, totalCount }, tree] = await Promise.all([
    query
      ? searchWikiPaginated(query, subject, currentPage, 10)
      : Promise.resolve({ results: [], totalCount: 0 }),
    getWikiCategoryTree(),
  ])

  const totalPages = Math.ceil(totalCount / 10)

  function buildUrl(overrides: { q?: string; subject?: string | null; page?: string }) {
    const params = new URLSearchParams()
    const nextQ = overrides.q ?? query
    if (nextQ) params.set('q', nextQ)
    const nextSubject = 'subject' in overrides ? overrides.subject : subject
    if (nextSubject) params.set('subject', nextSubject)
    if (overrides.page) params.set('page', overrides.page)
    return `/dashboard/wiki/search?${params.toString()}`
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={ROUTES.WIKI}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
          Back to Wiki
        </Link>
        <div className="mb-4">
          <WikiCommandPalette />
        </div>
        {query && (
          <p className="text-sm text-muted-foreground">
            {totalCount} result{totalCount !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Subject filter chips */}
      {query && tree.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={buildUrl({ subject: null, page: '1' })}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              !subject
                ? 'bg-foreground text-background'
                : 'border border-border/40 text-muted-foreground hover:bg-secondary'
            }`}
          >
            All
          </Link>
          {tree.map((s) => (
            <Link
              key={s.id}
              href={buildUrl({ subject: s.slug, page: '1' })}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                subject === s.slug
                  ? 'bg-foreground text-background'
                  : 'border border-border/40 text-muted-foreground hover:bg-secondary'
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      {/* No results */}
      {query && results.length === 0 && (
        <div className="rounded-lg border border-border/40 p-12 text-center">
          <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground mb-4">
            No pages found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-muted-foreground">Try browsing a subject instead:</p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {tree.slice(0, 4).map((s) => (
              <Link
                key={s.id}
                href={ROUTES.WIKI_SUBJECT(s.slug)}
                className="rounded-full border border-border/40 px-3 py-1 text-xs text-muted-foreground hover:bg-secondary transition-colors"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          <div className="space-y-2 mb-6">
            {results.map((result) => (
              <Link
                key={result.id}
                href={ROUTES.WIKI_PAGE(result.slug)}
                className="block rounded-lg border border-border/40 p-4 transition-colors hover:bg-secondary/40"
              >
                <h3 className="text-sm font-medium text-foreground mb-1">
                  {result.title}
                  {result.is_deprecated && (
                    <span className="ml-2 text-[11px] font-normal text-color-signal-amber">
                      (Deprecated)
                    </span>
                  )}
                </h3>
                <p
                  className="text-xs text-muted-foreground line-clamp-2 mb-2 [&_mark]:bg-color-signal-amber/20 [&_mark]:text-foreground [&_mark]:rounded-sm [&_mark]:px-0.5"
                  dangerouslySetInnerHTML={{
                    __html: result.headline,
                  }}
                />
                {result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 text-sm">
              {currentPage > 1 ? (
                <Link
                  href={buildUrl({ page: String(currentPage - 1) })}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Prev
                </Link>
              ) : (
                <span className="text-muted-foreground/40">← Prev</span>
              )}
              <span className="text-muted-foreground text-xs">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={buildUrl({ page: String(currentPage + 1) })}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Next →
                </Link>
              ) : (
                <span className="text-muted-foreground/40">Next →</span>
              )}
            </div>
          )}
        </>
      )}

      {!query && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            Enter a search term above to find wiki pages.
          </p>
        </div>
      )}
    </div>
  )
}
