import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { getResultsDayProfile } from '@/lib/actions/results-day'
import ResultsDayClient from './_components/ResultsDayClient'

const ResultsDayPage = async () => {
  const { data: { user } } = await getUser()
  if (!user) redirect('/login')

  const profile = await getResultsDayProfile()

  if (!profile) redirect('/dashboard')

  return (
    <SharedPageLayout>
      <div className="flex flex-col gap-6 w-full min-h-full px-4 py-10">
        <div className="mx-auto w-full max-w-lg">
          <h1 className="text-xl font-bold text-[#1A2332]">
            Results Day
          </h1>
          <p className="mt-1 text-sm text-[#4A5568]">
            {new Date().toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <ResultsDayClient
          aleResult={profile.aleResult}
          firstName={profile.firstName}
          readinessScore={profile.readinessScore}
          topSubjects={profile.topSubjects}
        />
      </div>
    </SharedPageLayout>
  )
}

export default ResultsDayPage
