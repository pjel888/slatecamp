'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, FileText, Book } from 'lucide-react'
import { getTaxonomyTree } from '@/lib/actions/wiki-actions'
import type { TaxonomyNode } from '@/lib/actions/taxonomy'
import { cn } from '@/lib/utils'

interface WikiSidebarProps {
  disciplineId: string
  disciplineName: string
  collapsed?: boolean
}

export function WikiSidebar({
  disciplineId,
  disciplineName,
  collapsed,
}: WikiSidebarProps) {
  const pathname = usePathname()
  const [nodes, setNodes] = useState<TaxonomyNode[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (disciplineId) {
      setLoading(true)
      getTaxonomyTree(disciplineId).then((data) => {
        setNodes(data)
        // Auto-expand nodes that contain the active slug
        const activeNode = data.find((n) => n.slug && pathname.includes(n.slug))
        if (activeNode?.parent_id) {
          setExpanded((prev) => ({ ...prev, [activeNode.parent_id!]: true }))
        }
        setLoading(false)
      })
    }
  }, [disciplineId, pathname])

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const rootNodes = nodes.filter((n) => n.level === 1)

  return (
    <aside className='w-64 shrink-0 border-r border-zinc-200 bg-zinc-50/50 h-full overflow-y-auto rounded-tl-xl'>
      <div className='p-2'>
        <div className='flex items-center gap-2 mb-6'>
          <div className='bg-blue-600 rounded-sm p-1'>
            <Book className='h-4 w-4 text-white' />
          </div>
          <h2 className='text-sm font-semibold text-zinc-900 truncate'>
            {disciplineName}
          </h2>
        </div>

        <nav className='space-y-1'>
          <div className='text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-3'>
            Taxonomy
          </div>

          {loading ? (
            <div className='space-y-3 pt-2'>
              <div className='h-3 w-3/4 bg-zinc-200 animate-pulse rounded' />
              <div className='h-3 w-1/2 bg-zinc-200 animate-pulse rounded' />
              <div className='h-3 w-2/3 bg-zinc-200 animate-pulse rounded' />
            </div>
          ) : (
            <div className='space-y-1'>
              {rootNodes.map((node) => {
                const children = nodes.filter(
                  (n) => n.parent_id === node.node_id,
                )

                const hasActiveChild = children.some(
                  (child) => child.slug && pathname.includes(child.slug),
                )

                const hasActiveArticle =
                  node.articles?.some((article) =>
                    pathname.includes(article.slug || ''),
                  ) ?? false

                const isActiveBranch = hasActiveChild || hasActiveArticle
                const isExpanded = expanded[node.node_id]

                return (
                  <div key={node.node_id} className='space-y-0.5'>
                    <button
                      onClick={() => toggle(node.node_id)}
                      className={cn(
                        'w-full flex items-center justify-between py-1.5 px-2 text-[13px] font-medium rounded-sm transition-all group',
                        isActiveBranch
                          ? 'text-blue-700'
                          : 'text-zinc-700 hover:bg-white hover:shadow-sm',
                      )}
                    >
                      <div className='flex items-center gap-2 min-w-0'>
                        {isExpanded ? (
                          <ChevronDown
                            className={cn(
                              'h-3.5 w-3.5',
                              isActiveBranch
                                ? 'text-blue-500'
                                : 'text-zinc-400',
                            )}
                          />
                        ) : (
                          <ChevronRight
                            className={cn(
                              'h-3.5 w-3.5',
                              isActiveBranch
                                ? 'text-blue-500'
                                : 'text-zinc-400',
                            )}
                          />
                        )}
                        <span className='truncate'>{node.name}</span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div
                        className={cn(
                          'ml-3.5 pl-3 border-l mt-0.5 mb-1 space-y-0.5',
                          isActiveBranch
                            ? 'border-blue-300'
                            : 'border-zinc-200/60',
                        )}
                      >
                        {children.map((child) => (
                          <Link
                            key={child.node_id}
                            href={`/dashboard/wiki/${child.slug ?? ''}`}
                            className={cn(
                              'group flex items-center gap-2 py-1.5 px-2 text-[12px] rounded-sm transition-all',
                              child.slug && pathname.includes(child.slug)
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-zinc-500 hover:text-zinc-900 hover:bg-white',
                            )}
                          >
                            <FileText
                              className={cn(
                                'h-3 w-3 shrink-0',
                                child.slug && pathname.includes(child.slug)
                                  ? 'text-blue-500'
                                  : 'text-zinc-300',
                              )}
                            />
                            <span className='truncate'>{child.name}</span>
                          </Link>
                        ))}

                        {node.articles && node.articles.length > 0 && (
                          <div className='pt-1 space-y-0.5'>
                            {node.articles.map((article) => (
                              <Link
                                key={article.article_id}
                                href={`/dashboard/wiki/${article.slug}`}
                                className={cn(
                                  'group flex items-center gap-2 py-1.5 px-2 text-[12px] rounded-sm transition-all',
                                  pathname.includes(article.slug || '')
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-white',
                                )}
                              >
                                <FileText
                                  className={cn(
                                    'h-3 w-3 shrink-0',
                                    pathname.includes(article.slug || '')
                                      ? 'text-blue-500'
                                      : 'text-zinc-300',
                                  )}
                                />
                                <span className='truncate'>
                                  {article.title}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </nav>
      </div>
    </aside>
  )
}
