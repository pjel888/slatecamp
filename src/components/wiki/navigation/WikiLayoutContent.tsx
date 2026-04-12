import { createClient, getUser } from '@/lib/supabase/server'
import { WikiSidebar } from './WikiSidebar'
import { WikiSidebarLoader } from './WikiSidebarLoader'
import { WikiSidebarSkeleton } from './WikiSidebarSkeleton'
import { WikiSidebarShell } from './WikiSidebarShell'
import { WikiContentShell } from './WikiContentShell'
import { WikiNavigationProvider } from './WikiNavigationContext'
import { WikiDisciplineProvider } from './WikiDisciplineContext'
import React, { Suspense } from 'react'

/**
 * Wiki layout orchestrator.
 *
 * Only awaits the lightweight user + discipline lookup (single row).
 * The heavy taxonomy tree fetch is pushed into <WikiSidebarLoader>,
 * wrapped in its own <Suspense> boundary so the content area and
 * providers render immediately while the sidebar streams in.
 */
export const WikiLayoutContent = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) {
    return null
  }

  const { data: stats, error } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id, disciplines(name)')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[WikiLayout] Error fetching stats:', error)
  }

  const disciplineId = stats?.current_discipline_id ?? null
  const disciplineName = (stats?.disciplines as any)?.name || 'Select Discipline'

  return (
    <WikiDisciplineProvider disciplineId={disciplineId} disciplineName={disciplineName}>
      <WikiNavigationProvider>
        <a 
          href="#wiki-center-pane" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to article content
        </a>
        <div className="flex flex-col h-full w-full overflow-hidden bg-background">
          <div className="flex flex-1 min-h-0">
            <WikiSidebarShell>
              {disciplineId ? (
                <Suspense fallback={<WikiSidebarSkeleton />}>
                  <WikiSidebarLoader
                    disciplineId={disciplineId}
                    disciplineName={disciplineName}
                  />
                </Suspense>
              ) : (
                <WikiSidebar
                  disciplineId={disciplineId!}
                  disciplineName={disciplineName}
                />
              )}
            </WikiSidebarShell>

            <WikiContentShell>
              {children}
            </WikiContentShell>
          </div>
        </div>
      </WikiNavigationProvider>
    </WikiDisciplineProvider>
  )
}
