import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { WikiLayoutClient } from '@/components/wiki/WikiLayoutClient'
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

  const disciplineId = stats?.current_discipline_id ?? null
  const disciplineName = (stats?.disciplines as any)?.name || 'Discipline'

  return (
    <SharedPageLayout>
      <WikiLayoutClient
        disciplineId={disciplineId}
        disciplineName={disciplineName}
      >
        {children}
      </WikiLayoutClient>
    </SharedPageLayout>
  )
}

export default WikiPageLayout
