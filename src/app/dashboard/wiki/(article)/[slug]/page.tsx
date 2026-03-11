import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ArrowLeft, Calendar, Tag, AlertTriangle, Link2, ArrowUpRight, ChevronRight,
} from 'lucide-react'
import {
  getWikiPageBySlug,
  getWikiBacklinks,
  getWikiForwardLinks,
  getWikiCategoryBreadcrumb,
  getAdjacentWikiPages,
} from '@/lib/actions/wiki'
import { Badge } from '@/components/ui/badge'
import { WikiTableOfContents, extractHeadings } from '@/components/wiki/WikiTableOfContents'
import { ArticlePrevNext } from '@/components/wiki/ArticlePrevNext'
import { SponsoredCard } from '@/components/wiki/SponsoredCard'
import { createClient } from '@/lib/supabase/server'
import { pickAd, AD_SLOTS } from '@/lib/constants/ads'
import { ROUTES } from '@/lib/constants/routes'

interface WikiPageProps {
  params: Promise<{ slug: string }>
}

export default async function WikiPageRoute({ params }: WikiPageProps) {
  const { slug } = await params
  const page = await getWikiPageBySlug(slug)
  if (!page) notFound()

  const [backlinks, forwardLinks, breadcrumb, adjacent] = await Promise.all([
    getWikiBacklinks(page.id),
    getWikiForwardLinks(page.id),
    getWikiCategoryBreadcrumb(page.category_id),
    getAdjacentWikiPages(page.id, page.category_id),
  ])

  // Subject crumb (first item in breadcrumb) for the mobile back link
  const subjectCrumb = breadcrumb[0]
  const subjectHref = subjectCrumb
    ? ROUTES.WIKI_SUBJECT(subjectCrumb.slug)
    : ROUTES.WIKI

  // Tier check for ad
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let userTier = 'free'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
    userTier = profile?.tier ?? 'free'
  }
  const showAd = userTier === 'free' && AD_SLOTS.length > 0
  const ad = showAd ? pickAd(slug) : null

  const formattedDate = new Date(page.updated_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  const headings = extractHeadings(page.markdown_content)
  const showConnections = backlinks.length > 0 || forwardLinks.length > 0
  const showRightRail = headings.length > 0 || ad

  return (
    <div className="flex gap-8 w-full max-w-[calc(720px+200px+32px)]">
      {/* Article Content */}
      <article className="flex-1 min-w-0 max-w-[720px]">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
          <Link
            href={ROUTES.WIKI}
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
            Wiki
          </Link>
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.id} className="inline-flex items-center gap-1">
              <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
              {i === 0 ? (
                <Link
                  href={ROUTES.WIKI_SUBJECT(crumb.slug)}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.name}
                </Link>
              ) : (
                <span>{crumb.name}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Mobile back link */}
        <Link
          href={subjectHref}
          className="lg:hidden inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
          Back to {subjectCrumb?.name ?? 'Wiki'}
        </Link>

        {/* Deprecation banner */}
        {page.is_deprecated && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-color-signal-amber/30 bg-color-signal-amber/5 p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-color-signal-amber mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-foreground">This page is deprecated</p>
              {page.deprecated_note && (
                <p className="text-xs text-muted-foreground mt-0.5">{page.deprecated_note}</p>
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-xl font-semibold text-foreground tracking-tight mb-2">
          {page.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" strokeWidth={1.5} />
            Updated {formattedDate}
          </span>
          {!page.is_free && (
            <Badge variant="outline" className="text-[10px] h-5">Pro</Badge>
          )}
        </div>

        {/* Tags */}
        {page.tags && page.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-6">
            <Tag className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
            {page.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <hr className="border-border/40 mb-6" />

        {/* Markdown Content */}
        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none [&_table]:text-xs [&_th]:text-left [&_th]:font-medium [&_td]:py-1.5 [&_th]:py-1.5 [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:border-border/40 [&_th]:border-border/40 [&_td]:px-3 [&_th]:px-3 [&_h2]:text-base [&_h3]:text-sm [&_h2]:font-semibold [&_h3]:font-medium [&_h2]:tracking-tight [&_p]:text-[13px] [&_li]:text-[13px] [&_strong]:font-semibold">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.markdown_content}</ReactMarkdown>
        </div>

        {/* Connections (backlinks + forward links) */}
        {showConnections && (
          <div className="mt-8 pt-6 border-t border-border/40 space-y-4">
            {forwardLinks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Links to
                </p>
                <div className="flex flex-wrap gap-2">
                  {forwardLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={ROUTES.WIKI_PAGE(link.slug)}
                      className="inline-flex items-center gap-1 rounded-full border border-border/40 px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      {link.title}
                      <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {backlinks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Linked from
                </p>
                <div className="flex flex-wrap gap-2">
                  {backlinks.map((link) => (
                    <Link
                      key={link.id}
                      href={ROUTES.WIKI_PAGE(link.slug)}
                      className="inline-flex items-center gap-1 rounded-full border border-border/40 px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <ArticlePrevNext prev={adjacent.prev} next={adjacent.next} />
      </article>

      {/* Right Rail */}
      {showRightRail && (
        <aside className="hidden xl:block w-[200px] shrink-0">
          <div className="sticky top-8 space-y-6">
            {headings.length > 0 && (
              <WikiTableOfContents headings={headings} />
            )}
            {ad && (
              <SponsoredCard ad={ad} variant="rail" />
            )}
          </div>
        </aside>
      )}
    </div>
  )
}
