import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ArrowLeft,
  Calendar,
  Tag,
  AlertTriangle,
  Link2,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react'
import {
  getWikiPageBySlug,
  getWikiBacklinks,
  getWikiForwardLinks,
  getWikiCategoryBreadcrumb,
} from '@/lib/actions/wiki'
import { Badge } from '@/components/ui/badge'

interface WikiPageProps {
  params: Promise<{ slug: string }>
}

export default async function WikiPageRoute({ params }: WikiPageProps) {
  const { slug } = await params
  const page = await getWikiPageBySlug(slug)

  if (!page) notFound()

  const [backlinks, forwardLinks, breadcrumb] = await Promise.all([
    getWikiBacklinks(page.id),
    getWikiForwardLinks(page.id),
    getWikiCategoryBreadcrumb(page.category_id),
  ])

  const formattedDate = new Date(page.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article className="max-w-[720px]">
      {/* Breadcrumb: Wiki / Subject / Subcategory */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link
          href="/dashboard/wiki"
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
          Wiki
        </Link>
        {breadcrumb.map((crumb) => (
          <span key={crumb.id} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
            <span>{crumb.name}</span>
          </span>
        ))}
      </nav>

      {/* Deprecation banner */}
      {page.is_deprecated && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-color-signal-amber/30 bg-color-signal-amber/5 p-3">
          <AlertTriangle
            className="h-4 w-4 shrink-0 text-color-signal-amber mt-0.5"
            strokeWidth={1.5}
          />
          <div>
            <p className="text-sm font-medium text-foreground">
              This page is deprecated
            </p>
            {page.deprecated_note && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {page.deprecated_note}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Title */}
      <h1 className="text-xl font-semibold text-foreground tracking-tight mb-2">
        {page.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-6">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" strokeWidth={1.5} />
          Updated {formattedDate}
        </span>
        {!page.is_free && (
          <Badge variant="outline" className="text-[10px] h-5">
            Pro
          </Badge>
        )}
      </div>

      {/* Tags */}
      {page.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          <Tag
            className="h-3 w-3 text-muted-foreground"
            strokeWidth={1.5}
          />
          {page.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-muted-foreground bg-secondary rounded-md px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Markdown Content */}
      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none [&_table]:text-xs [&_th]:text-left [&_th]:font-medium [&_td]:py-1.5 [&_th]:py-1.5 [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:border-border/40 [&_th]:border-border/40 [&_td]:px-3 [&_th]:px-3 [&_h2]:text-base [&_h3]:text-sm [&_h2]:font-semibold [&_h3]:font-medium [&_h2]:tracking-tight [&_p]:text-[13px] [&_li]:text-[13px] [&_strong]:font-semibold">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {page.markdown_content}
        </ReactMarkdown>
      </div>

      {/* Links Section */}
      {(forwardLinks.length > 0 || backlinks.length > 0) && (
        <div className="mt-8 border-t border-border/40 pt-6 space-y-4">
          {/* Forward Links */}
          {forwardLinks.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                Links to
              </h2>
              <div className="flex flex-wrap gap-2">
                {forwardLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={`/dashboard/wiki/${link.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Link2 className="h-3 w-3" strokeWidth={1.5} />
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Backlinks */}
          {backlinks.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Link2 className="h-3 w-3" strokeWidth={1.5} />
                Backlinks ({backlinks.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {backlinks.map((link) => (
                  <Link
                    key={link.id}
                    href={`/dashboard/wiki/${link.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
