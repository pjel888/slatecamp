import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWikiSubjectBySlug, getWikiPagesBySubject } from '@/lib/actions/wiki'
import { WIKI_SUBJECT_ICONS, DEFAULT_WIKI_ICON } from '@/components/wiki/wiki-icons'
import { SponsoredCard } from '@/components/wiki/SponsoredCard'
import { WikiCommandPalette } from '@/components/wiki/WikiCommandPalette'
import { ROUTES } from '@/lib/constants/routes'
import { pickAd, AD_SLOTS } from '@/lib/constants/ads'
import type { WikiCategory } from '@/types/app'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function SubjectLandingPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))

  const result = await getWikiSubjectBySlug(slug)
  if (!result) notFound()

  const { subject, pagesByCategory } = result
  const { pages: allPages, totalCount } = await getWikiPagesBySubject(slug, currentPage, 15)
  const totalPages = Math.ceil(totalCount / 15)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let userTier = 'free'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
    userTier = profile?.tier ?? 'free'
  }
  const showAd = userTier === 'free' && AD_SLOTS.length > 0
  const ad = showAd ? pickAd(slug) : null

  const Icon = WIKI_SUBJECT_ICONS[subject.slug] ?? DEFAULT_WIKI_ICON
  const categories: WikiCategory[] = subject.children ?? []

  // Build category grid with ad at last position
  type GridItem = { type: 'category'; category: WikiCategory } | { type: 'ad' }
  const gridItems: GridItem[] = categories.map((cat) => ({ type: 'category', category: cat }))
  if (ad) gridItems.push({ type: 'ad' })

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 lg:py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
        <Link
          href={ROUTES.WIKI}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
          Wiki
        </Link>
        <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
        <span className="text-foreground">{subject.name}</span>
      </nav>

      {/* Subject Header */}
      <div className="flex items-start gap-4 mb-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            {subject.name}
          </h1>
          {subject.description && (
            <p className="text-sm text-muted-foreground mt-1">{subject.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {totalCount} pages · {categories.length} categories
          </p>
        </div>
      </div>

      {/* Subject-scoped search */}
      <div className="mb-8">
        <WikiCommandPalette />
      </div>

      {/* Category Cards Grid */}
      {gridItems.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Categories
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {gridItems.map((item, i) => {
              if (item.type === 'ad') {
                return <SponsoredCard key="ad" ad={ad!} variant="category" />
              }
              const { category } = item
              const catPages = pagesByCategory[category.id] ?? []
              const previewPages = catPages.slice(0, 3)
              const remaining = catPages.length - previewPages.length

              return (
                <div key={category.id} className="rounded-lg border border-border/40 p-4">
                  <h3 className="text-sm font-medium text-foreground mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {catPages.length} {catPages.length === 1 ? 'page' : 'pages'}
                  </p>
                  <div className="space-y-1.5">
                    {previewPages.map((page) => (
                      <Link
                        key={page.id}
                        href={ROUTES.WIKI_PAGE(page.slug)}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <FileText className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                        <span className="truncate">{page.title}</span>
                      </Link>
                    ))}
                    {remaining > 0 && (
                      <p className="text-xs text-muted-foreground">+ {remaining} more</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Paginated Page List */}
      {allPages.length > 0 && (
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            All Pages
          </h2>
          <div className="space-y-1 mb-6">
            {allPages.map((page) => (
              <Link
                key={page.id}
                href={ROUTES.WIKI_PAGE(page.slug)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-secondary/40 min-h-[44px]"
              >
                <span className="flex-1 text-foreground truncate">{page.title}</span>
                <span className="text-[11px] text-muted-foreground shrink-0">{page.category_name}</span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {new Date(page.updated_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 text-sm">
              {currentPage > 1 ? (
                <Link
                  href={`?page=${currentPage - 1}`}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2 px-3"
                >
                  ← Prev
                </Link>
              ) : (
                <span className="text-muted-foreground/40 py-2 px-3">← Prev</span>
              )}
              <span className="text-muted-foreground text-xs">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={`?page=${currentPage + 1}`}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2 px-3"
                >
                  Next →
                </Link>
              ) : (
                <span className="text-muted-foreground/40 py-2 px-3">Next →</span>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
