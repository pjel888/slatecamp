import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { getUser } from '@/lib/supabase/server'
import { DataLayout } from '@/components/layouts/category/DataLayout'
import { getResultsDayProfile } from '@/lib/actions/results-day'
import ResultsDayClient from './_components/ResultsDayClient'

const ResultsDayPage = async () => {
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.auth.login)

  const profile = await getResultsDayProfile()

  if (!profile) redirect(ROUTES.dashboard.root)

  const dateStr = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <DataLayout
      hero={{
        subtitle: 'Results Day',
        description: dateStr,
      }}
    >
      <ResultsDayClient
        leaResult={profile.leaResult}
        firstName={profile.firstName}
        readinessScore={profile.readinessScore}
        topSubjects={profile.topSubjects}
      />
    </DataLayout>
  )
}

export default ResultsDayPage
