import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'
import { getUserPods } from '@/lib/actions/pods'
import { PodHub } from './_components/PodHub'
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
    <div className="mx-auto max-w-xl px-4 py-6">
      <PodHub pods={pods} isPro={isPro} />
    </div>
  )
}

export default PodsPage
