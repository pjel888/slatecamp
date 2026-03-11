'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, FileText, FolderOpen, AlertTriangle } from 'lucide-react'
import { WIKI_SUBJECT_ICONS, DEFAULT_WIKI_ICON } from './wiki-icons'
import type { WikiCategory, WikiPage } from '@/types/app'

interface WikiSidebarProps {
  tree: WikiCategory[]
  pagesByCategory: Record<string, Pick<WikiPage, 'id' | 'title' | 'slug' | 'is_deprecated'>[]>
}

function CategoryNode({
  category,
  pagesByCategory,
  pathname,
  depth = 0,
  activeRootId,
}: {
  category: WikiCategory
  pagesByCategory: WikiSidebarProps['pagesByCategory']
  pathname: string
  depth?: number
  activeRootId?: string
}) {
  // Auto-expand only the subject that contains the active page; collapse all others
  const defaultExpanded = depth === 0 ? category.id === activeRootId : false
  const [expanded, setExpanded] = useState(defaultExpanded)
  const pages = pagesByCategory[category.id] ?? []
  const hasChildren = (category.children?.length ?? 0) > 0 || pages.length > 0
  const isRoot = depth === 0

  const SubjectIcon = isRoot
    ? (WIKI_SUBJECT_ICONS[category.slug] ?? DEFAULT_WIKI_ICON)
    : FolderOpen

  const totalPages = isRoot
    ? pages.length +
      (category.children ?? []).reduce(
        (sum, child) => sum + (pagesByCategory[child.id]?.length ?? 0),
        0
      )
    : 0

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-secondary/60 ${
          isRoot ? 'font-medium text-foreground' : 'text-muted-foreground'
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        {hasChildren ? (
          <ChevronRight
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
            strokeWidth={1.5}
          />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <SubjectIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <span className="truncate flex-1">{category.name}</span>
        {isRoot && totalPages > 0 && (
          <span className="text-[10px] text-muted-foreground tabular-nums">{totalPages}</span>
        )}
      </button>

      {expanded && (
        <div>
          {category.children?.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              pagesByCategory={pagesByCategory}
              pathname={pathname}
              depth={depth + 1}
              activeRootId={activeRootId}
            />
          ))}
          {pages.map((page) => {
            const href = `/dashboard/wiki/${page.slug}`
            const isActive = pathname === href
            return (
              <Link
                key={page.id}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
                  isActive
                    ? 'bg-secondary font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                } ${page.is_deprecated ? 'opacity-60' : ''}`}
                style={{ paddingLeft: `${20 + (depth + 1) * 12}px` }}
              >
                {page.is_deprecated ? (
                  <AlertTriangle
                    className="h-3.5 w-3.5 shrink-0 text-color-signal-amber"
                    strokeWidth={1.5}
                  />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                )}
                <span className="truncate">{page.title}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function WikiSidebar({ tree, pagesByCategory }: WikiSidebarProps) {
  const pathname = usePathname()

  // Determine which root subject contains the active page
  const activeRootId = tree.find((root) => {
    const rootPageSlugs = (pagesByCategory[root.id] ?? []).map((p) => `/dashboard/wiki/${p.slug}`)
    if (rootPageSlugs.includes(pathname)) return true
    return (root.children ?? []).some((child) =>
      (pagesByCategory[child.id] ?? []).some((p) => `/dashboard/wiki/${p.slug}` === pathname)
    )
  })?.id

  return (
    <aside className="hidden lg:block w-[280px] shrink-0 border-r border-border/40 overflow-y-auto">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Subjects</h2>
      </div>
      <nav className="p-2 space-y-0.5">
        {tree.map((root) => (
          <CategoryNode
            key={root.id}
            category={root}
            pagesByCategory={pagesByCategory}
            pathname={pathname}
            activeRootId={activeRootId}
          />
        ))}
      </nav>
    </aside>
  )
}
