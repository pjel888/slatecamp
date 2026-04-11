import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'
import { bootstrapUser } from '@/lib/supabase/bootstrap'
import { completeOnboardingSetup, type CompleteOnboardingResult } from '@/lib/actions/profile'
import { OnboardingForm } from './_components/OnboardingForm'
import type { Discipline } from '@/types/app'

type OnboardingSubmitResult = CompleteOnboardingResult & {
  redirectTo?: string
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) redirect(ROUTES.auth.login)

  await bootstrapUser(user.id)

  const [{ data: disciplines }, { data: subjectRows }] = await Promise.all([
    supabase
      .from('disciplines')
      .select('discipline_id, name, acronym, created_at, updated_at')
      .order('name'),
    supabase
      .from('taxonomy_tree')
      .select('node_id, name, discipline_id')
      .eq('level', 1)
      .order('name'),
  ])

  const subjectsByDiscipline: Record<string, { node_id: string; name: string }[]> = {}
  for (const row of subjectRows ?? []) {
    if (!subjectsByDiscipline[row.discipline_id]) {
      subjectsByDiscipline[row.discipline_id] = []
    }
    subjectsByDiscipline[row.discipline_id].push({
      node_id: row.node_id,
      name: row.name,
    })
  }

  const selectDiscipline = async (formData: FormData): Promise<OnboardingSubmitResult> => {
    'use server'
    const result = await completeOnboardingSetup(formData)

    if (!result.success) {
      return result
    }

    const { trackServerEvent } = await import('@/lib/analytics-server')
    const reviewerType = (formData.get('reviewerType') as string | null) || 'first_taker'
    const examDate = formData.get('examDate') as string | null
    const studyWindow = (formData.get('studyWindow') as string | null) || 'any'
    const rawStruggled = formData.get('struggledSubjects') as string | null
    let struggledSubjectNames: string[] = []
    if (rawStruggled) {
      try {
        const parsed = JSON.parse(rawStruggled)
        if (Array.isArray(parsed)) {
          struggledSubjectNames = parsed.filter((value): value is string => typeof value === 'string')
        }
      } catch {
        struggledSubjectNames = []
      }
    }

    void trackServerEvent('onboarding_completed', {
      reviewer_type: reviewerType,
      has_exam_date: !!examDate,
      preferred_study_window: studyWindow,
      struggled_subjects_count: Array.isArray(struggledSubjectNames) ? struggledSubjectNames.length : 0,
    })

    return {
      ...result,
      redirectTo: ROUTES.dashboard.root,
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-6">
      <div className="w-full max-w-md">
        <div className="rounded-md border border-border bg-card p-6 shadow-sm">
          <OnboardingForm
            disciplines={(disciplines ?? []) as Discipline[]}
            subjectsByDiscipline={subjectsByDiscipline}
            onSubmit={selectDiscipline}
          />
        </div>
      </div>
    </div>
  )
}
