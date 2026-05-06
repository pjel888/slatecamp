import { redirect, notFound } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'
import { getPodData } from '@/lib/actions/pods'
import { PodView } from '../_components/PodView'
import { DataLayout } from '@/components/layouts/category/DataLayout'

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
  if (!user) redirect(ROUTES.auth.login)

  const result = await getPodData(podId)

  if (result.ok === false) {
    if (result.error === 'You are not a member of this pod.' || result.error === 'Pod not found.') {
      notFound()
    }
    redirect(ROUTES.dashboard.pods)
  }

  return (
    <DataLayout
      hero={{
        subtitle: result.data.pod_name,
        description: 'View your study pod and track progress together.',
      }}
    >
      <PodView pod={result.data} currentUserId={user.id} />
    </DataLayout>
  )
}

export default PodPage
