import { WikiLayoutClient } from '@/components/wiki/WikiLayoutClient'
import { createClient, getUser } from '@/lib/supabase/server'
import React, { Suspense } from 'react'
import WikiLoading from './loading'

const WikiLayoutContent = async ({ children }: { children: React.ReactNode }) => {
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

  console.log('[WikiLayout] User:', user.email, 'Discipline:', disciplineId, 'Name:', disciplineName, 'Mode:', !!process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Live' : 'Mock')

  return (
    <WikiLayoutClient
      disciplineId={disciplineId}
      disciplineName={disciplineName}
    >
      {children}
    </WikiLayoutClient>
  )
}

export default function WikiPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='h-full w-full overflow-hidden'>
      <Suspense fallback={<WikiLoading />}>
        <WikiLayoutContent>{children}</WikiLayoutContent>
      </Suspense>
    </div>
  )
}
