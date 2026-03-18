import { createClient, getUser } from '@/lib/supabase/server'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'
import { WikiSidebarShell } from '@/components/wiki/WikiSidebarShell'
import { WikiDisciplineProvider } from '@/components/wiki/WikiDisciplineContext'
import React from 'react'

export async function WikiLayoutContent({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) {
    console.log('[WikiLayout] No user found')
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
      <div className="flex flex-col h-full w-full overflow-hidden bg-background">
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar — desktop only (md+), resizable + collapsible */}
          <WikiSidebarShell>
            <WikiSidebar
              disciplineId={disciplineId!}
              disciplineName={disciplineName}
            />
          </WikiSidebarShell>

          {/* Center + Right (managed by page) */}
          <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </WikiDisciplineProvider>
  )
}
