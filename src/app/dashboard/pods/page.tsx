import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'
import { getUserPods } from '@/lib/actions/pods'
import { PodHub } from './_components/PodHub'

export const metadata = { title: 'Study Pods' }

const PodsPage = async () => {
  const {
    data: { user },
  } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const supabase = await createClient()

  const [podsResult, { data: sub }] = await Promise.all([
    getUserPods(),
    supabase
      .from('user_subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const pods = podsResult.ok ? podsResult.data : []
  const isPro = sub?.tier === 'pro' || sub?.tier === 'enterprise'

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <PodHub pods={pods} isPro={isPro} />
    </div>
  )
}

export default PodsPage
