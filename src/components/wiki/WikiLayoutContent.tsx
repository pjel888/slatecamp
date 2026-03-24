import { createClient, getUser } from '@/lib/supabase/server'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'
import { WikiSidebarLoader } from '@/components/wiki/WikiSidebarLoader'
import { WikiSidebarSkeleton } from '@/components/wiki/WikiSidebarSkeleton'
import { WikiSidebarShell } from '@/components/wiki/WikiSidebarShell'
import { WikiContentShell } from '@/components/wiki/WikiContentShell'
import { WikiNavigationProvider } from '@/components/wiki/WikiNavigationContext'
import { WikiDisciplineProvider } from '@/components/wiki/WikiDisciplineContext'
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
