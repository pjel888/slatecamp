import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'
import { getUserPods } from '@/lib/actions/pods'
import { PodHub } from './_components/PodHub'
import { DataLayout } from '@/components/layouts/category/DataLayout'
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { ENTITLEMENT_FEATURE_KEYS } from '@/lib/entitlements/feature-keys'

export const metadata = { title: 'Study Pods' }

const PodsPage = async () => {
  const {
    data: { user },
  } = await getUser()
  if (!user) redirect(ROUTES.auth.login)

  const [podsResult, entitlements] = await Promise.all([
    getUserPods(),
    getViewerEntitlements([ENTITLEMENT_FEATURE_KEYS.questionsUnlimited]),
  ])

  const pods = podsResult.ok ? podsResult.data : []
  const isPro =
    entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.questionsUnlimited]?.allowed ?? false

  return (
    <DataLayout
      hero={{
        subtitle: 'Study Pods',
        description: 'Join or create a study pod. Learn together, stay accountable, and track each other\'s progress.',
      }}
    >
      <PodHub pods={pods} isPro={isPro} />
    </DataLayout>
  )
}

export default PodsPage
