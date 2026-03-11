import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWikiSubjectBySlug, getWikiPagesBySubject } from '@/lib/actions/wiki'
import { WIKI_SUBJECT_ICONS, DEFAULT_WIKI_ICON } from '@/components/wiki/wiki-icons'
import { SponsoredCard } from '@/components/wiki/SponsoredCard'
import { ROUTES } from '@/lib/constants/routes'
import { pickAd, AD_SLOTS } from '@/lib/constants/ads'
import type { WikiCategory } from '@/types/app'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

type PageStub = { id: string; title: string; slug: string; is_deprecated: boolean }

// Recursive category section — renders a category and all its nested children
function CategorySection({
  category,
  pagesByCategory,
  depth = 0,
}: {
  category: WikiCategory
  pagesByCategory: Record<string, PageStub[]>
  depth?: number
}) {
  const directPages = pagesByCategory[category.id] ?? []
  const subcategories = category.children ?? []
  const hasContent = directPages.length > 0 || subcategories.length > 0

  if (!hasContent) return null

  const previewPages = directPages.slice(0, 4)
  const remaining = directPages.length - previewPages.length

  if (depth === 0) {
    // Top-level category: full card
    return (
      <div className="rounded-lg border border-border/40 p-4">
        <h3 className="text-sm font-medium text-foreground mb-1">{category.name}</h3>
        {category.description && (
          <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
        )}

        {/* Direct pages in this category */}
        {previewPages.length > 0 && (
          <div className="space-y-1.5 mb-3">
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
              <p className="text-xs text-muted-foreground pl-5">+ {remaining} more</p>
            )}
          </div>
        )}

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="space-y-3 mt-2">
            {subcategories.map((sub) => (
              <CategorySection
                key={sub.id}
                category={sub}
                pagesByCategory={pagesByCategory}
                depth={1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Nested subcategory: indented section without a card border
  return (
    <div className="pl-1">
      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
        <ChevronRight className="h-3 w-3 shrink-0" strokeWidth={1.5} />
        {category.name}
      </p>
      <div className="pl-4 space-y-1.5">
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
          <p className="text-xs text-muted-foreground pl-5">+ {remaining} more</p>
        )}
        {/* Deeper nesting */}
        {subcategories.map((sub) => (
          <CategorySection
            key={sub.id}
            category={sub}
            pagesByCategory={pagesByCategory}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  )
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

      {/* Category Cards Grid — now renders full nested tree */}
      {categories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Categories
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                pagesByCategory={pagesByCategory}
              />
            ))}
            {ad && <SponsoredCard key="ad" ad={ad} variant="category" />}
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
