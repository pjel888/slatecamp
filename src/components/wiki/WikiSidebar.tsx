import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, FileText, Book, Folder } from 'lucide-react'
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
  const [nodes, setNodes] = React.useState<TaxonomyNode[]>([])
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    console.log('[WikiSidebar] Fetching tree for discipline:', disciplineId)
    if (disciplineId) {
      setLoading(true)
      getTaxonomyTree(disciplineId).then((data) => {
        console.log('[WikiSidebar] Tree data received. Count:', data.length)
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

  // Filter root nodes: Always show Level 1
  const rootNodes = nodes.filter((n) => n.level === 1)

  if (!disciplineId) {
    return (
      <aside className='w-64 shrink-0 border-r border-zinc-200 bg-zinc-50/50 h-full overflow-y-auto rounded-tl-xl'>
        <div className='p-6 text-center space-y-4 h-full flex flex-col items-center justify-center'>
          <div className='bg-zinc-100 p-3 rounded-2xl inline-block'>
            <Book className='h-6 w-6 text-zinc-400' />
          </div>
          <div className='space-y-1'>
            <p className='text-xs font-bold text-zinc-900'>No Discipline</p>
            <p className='text-[10px] text-zinc-500 leading-relaxed'>
              Select your exam type in Settings to view the syllabus.
            </p>
          </div>
          <Link href='/dashboard/settings'>
            <button className='text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider mt-2 cursor-pointer'>
              Go to Settings
            </button>
          </Link>
        </div>
      </aside>
    )
  }

  const renderNode = (node: TaxonomyNode, isChild = false) => {
    const children = nodes.filter((n) => n.parent_id === node.node_id)
    const nodeArticles = node.articles || []

    const hasChildren = children.length > 0
    const hasArticles = nodeArticles.length > 0

    // A node is a Category if it's Level 1 OR has sub-nodes
    const isCategory = node.level === 1 || hasChildren

    // A node is an Article if it's NOT a category and HAS articles
    // OR if it's a category but we want to treat the node itself as an article (like Foundations)
    const isArticle = !hasChildren && hasArticles

    // If it's a leaf node with NO articles, hide it (unless it's Level 1)
    if (!isCategory && !hasArticles) return null

    const isExpanded = expanded[node.node_id]
    const isActive = node.slug && pathname.includes(node.slug)

    return (
      <div key={node.node_id} className='space-y-0.5'>
        {isCategory ? (
          /* CATEGORY: Toggles only, no navigation */
          <button
            onClick={() => toggle(node.node_id)}
            className={cn(
              'w-full flex items-center gap-2 py-1.5 px-2 text-[13px] font-medium rounded-sm transition-all group',
              isActive
                ? 'text-blue-700 bg-blue-50/50'
                : 'text-zinc-700 hover:bg-white hover:shadow-sm',
              isChild && 'pl-2',
            )}
          >
            {isExpanded ? (
              <ChevronDown className='h-3.5 w-3.5 text-zinc-400' />
            ) : (
              <ChevronRight className='h-3.5 w-3.5 text-zinc-400' />
            )}
            <Folder
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                isActive ? 'text-blue-500' : 'text-zinc-400',
              )}
            />
            <span className='truncate'>{node.name}</span>
          </button>
        ) : (
          /* ARTICLE: Navigates to content */
          <Link
            href={`/dashboard/wiki/${node.slug ?? ''}`}
            className={cn(
              'w-full flex items-center gap-2 py-1.5 px-2 text-[13px] font-medium rounded-sm transition-all group',
              isActive
                ? 'text-blue-700 bg-blue-50'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-white',
              isChild && 'ml-3.5',
            )}
          >
            <FileText
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                isActive ? 'text-blue-500' : 'text-zinc-300',
              )}
            />
            <span className='truncate'>{node.name}</span>
          </Link>
        )}

        {isExpanded && isCategory && (
          <div className='ml-3.5 pl-3 border-l border-zinc-200/60 mt-0.5 mb-1 space-y-0.5'>
            {/* Render sub-nodes */}
            {children.map((child) => renderNode(child, true))}

            {/* Render direct articles mapped to this category node */}
            {nodeArticles.map((art) => (
              <Link
                key={art.article_id}
                href={`/dashboard/wiki/${art.slug}`}
                className={cn(
                  'group flex items-center gap-2 py-1.5 px-2 text-[12px] rounded-sm transition-all',
                  pathname.includes(art.slug || '')
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-white',
                )}
              >
                <FileText
                  className={cn(
                    'h-3 w-3 shrink-0',
                    pathname.includes(art.slug || '')
                      ? 'text-blue-500'
                      : 'text-zinc-300',
                  )}
                />
                <span className='truncate'>{art.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className='w-64 shrink-0 border-r border-zinc-200 bg-zinc-50/50 h-full overflow-y-auto rounded-tl-xl'>
      <div className='p-2'>
        <div className='flex items-center gap-2 mb-6 p-2'>
          <div className='bg-blue-600 rounded-sm p-1'>
            <Book className='h-4 w-4 text-white' />
          </div>
          <h2 className='text-sm font-semibold text-zinc-900 truncate'>
            {disciplineName}
          </h2>
        </div>

        <nav className='space-y-1'>
          <div className='text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-3 px-2'>
            Taxonomy
          </div>

          {loading ? (
            <div className='space-y-3 pt-2 px-2'>
              <div className='h-3 w-3/4 bg-zinc-200 animate-pulse rounded' />
              <div className='h-3 w-1/2 bg-zinc-200 animate-pulse rounded' />
              <div className='h-3 w-2/3 bg-zinc-200 animate-pulse rounded' />
            </div>
          ) : (
            <div className='space-y-1'>
              {rootNodes.map((node) => renderNode(node))}
            </div>
          )}
        </nav>
      </div>
    </aside>
  )
}
