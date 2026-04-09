import { redirect, notFound } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'
import { getPodData } from '@/lib/actions/pods'
import { PodView } from '../_components/PodView'

interface PodPageProps {
  params: Promise<{ podId: string }>
}

export const generateMetadata = async ({ params }: PodPageProps) => {
  const { podId } = await params
  const result = await getPodData(podId)
  if (!result.ok) return { title: 'Study Pod' }
  return { title: result.data.pod_name }
}

const PodPage = async ({ params }: PodPageProps) => {
  const { podId } = await params
  const {
    data: { user },
  } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const result = await getPodData(podId)

  if (result.ok === false) {
    if (result.error === 'You are not a member of this pod.' || result.error === 'Pod not found.') {
      notFound()
    }
    redirect(ROUTES.PODS)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <PodView pod={result.data} currentUserId={user.id} />
    </div>
  )
}

export default PodPage
