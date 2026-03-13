import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'
import { createClient, getUser } from '@/lib/supabase/server'
import React from 'react'

const WikiPageLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id, disciplines(name)')
    .eq('user_id', user?.id)
    .single()

  const disciplineId = stats?.current_discipline_id
  const disciplineName = (stats?.disciplines as any)?.name || 'Discipline'

  return (
    <SharedPageLayout>
      <div className='flex h-full w-full   border border-zinc-200 overflow-hidden  '>
        {disciplineId && (
          <WikiSidebar
            disciplineId={disciplineId}
            disciplineName={disciplineName}
          />
        )}
        <div className='flex-1 min-w-0 h-full'>{children}</div>
      </div>
    </SharedPageLayout>
  )
}

export default WikiPageLayout
