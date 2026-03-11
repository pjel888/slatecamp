import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWikiCategoryTree, getRecentlyUpdatedPages } from '@/lib/actions/wiki'
import { WIKI_SUBJECT_ICONS, DEFAULT_WIKI_ICON } from '@/components/wiki/wiki-icons'
import { RecentlyUpdatedStrip } from '@/components/wiki/RecentlyUpdatedStrip'
import { SponsoredCard } from '@/components/wiki/SponsoredCard'
import { WikiCommandPalette } from '@/components/wiki/WikiCommandPalette'
import { pickAd, AD_SLOTS } from '@/lib/constants/ads'
import { ROUTES } from '@/lib/constants/routes'
import type { WikiCategory } from '@/types/app'

export default async function WikiHubPage() {
  const supabase = await createClient()
  const tree = await getWikiCategoryTree()
  const recentPages = await getRecentlyUpdatedPages(10)

  // Tier check for ad gating
  const { data: { user } } = await supabase.auth.getUser()
  let userTier = 'free'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()
    userTier = profile?.tier ?? 'free'
  }
  const showAd = userTier === 'free' && AD_SLOTS.length > 0

  // Page counts per subject card
  const { data: allPages } = await supabase.from('wiki_pages').select('category_id')
  const pageCountByCategory: Record<string, number> = {}
  for (const row of (allPages ?? []) as { category_id: string }[]) {
    pageCountByCategory[row.category_id] = (pageCountByCategory[row.category_id] ?? 0) + 1
  }
  function totalPagesInSubject(subject: WikiCategory): number {
    let total = pageCountByCategory[subject.id] ?? 0
    for (const child of subject.children ?? []) {
      total += pageCountByCategory[child.id] ?? 0
    }
    return total
  }

  const ad = showAd ? pickAd('hub') : null

  // Build grid with ad at position index 2 (third slot)
  type GridItem = { type: 'subject'; subject: WikiCategory } | { type: 'ad' }
  const gridItems: GridItem[] = []
  tree.forEach((subject, i) => {
    if (i === 2 && ad) gridItems.push({ type: 'ad' })
    gridItems.push({ type: 'subject', subject })
  })

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6 lg:py-8">
      {/* Header + Search */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground tracking-tight mb-1">
          Resources Wiki
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          Browse reference notes by architectural subject.
        </p>
        <WikiCommandPalette />
      </div>

      {/* Subject Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {gridItems.map((item, i) => {
          if (item.type === 'ad') {
            return <SponsoredCard key="ad" ad={ad!} variant="subject" />
          }
          const { subject } = item
          const Icon = WIKI_SUBJECT_ICONS[subject.slug] ?? DEFAULT_WIKI_ICON
          const total = totalPagesInSubject(subject)

          return (
            <Link
              key={subject.id}
              href={ROUTES.WIKI_SUBJECT(subject.slug)}
              className="group rounded-lg border border-border/40 p-4 transition-colors hover:border-border hover:bg-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  {subject.children && subject.children.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {subject.children.slice(0, 4).map((child) => (
                        <span
                          key={child.id}
                          className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5"
                        >
                          {child.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {total > 0 && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {total} {total === 1 ? 'page' : 'pages'}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <RecentlyUpdatedStrip pages={recentPages} />
    </div>
  )
}
