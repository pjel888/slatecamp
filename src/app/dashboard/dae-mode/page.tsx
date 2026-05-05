import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'
import { getDAEState } from '@/lib/actions/dae-mode'
import { DAEModeClient } from './_components/DAEModeClient'
import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'
import { Skeleton } from '@/components/ui/skeleton'

const DAEContent = async () => {
  const {
    data: { user },
  } = await getUser()
  if (!user) redirect(ROUTES.auth.login)

  const { savedContexts, userTier, dailyUsedCount } = await getDAEState()

  return (
    <PracticeLayout
      hero={{
        subtitle: 'DAE Maintenance Mode',
        description: 'Stay current with the codes you use every day.',
      }}
    >
      <DAEModeClient
        savedContexts={savedContexts}
        userTier={userTier}
        dailyUsedCount={dailyUsedCount}
      />
    </PracticeLayout>
  )
}

const DAEModePage = () => (
  <Suspense fallback={<Skeleton className="h-screen w-full" />}>
    <DAEContent />
  </Suspense>
)

export default DAEModePage

export const metadata = {
  title: 'DAE Maintenance Mode',
  description: 'Stay current with the codes you use every day.',
}
