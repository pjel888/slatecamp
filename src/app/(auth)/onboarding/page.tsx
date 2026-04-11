import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'
import { bootstrapUser } from '@/lib/supabase/bootstrap'
import { OnboardingForm } from './_components/OnboardingForm'
import type { Discipline } from '@/types/app'

/**
 * Onboarding Page — Task 0.4: Retaker Onboarding Flow
 */

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  if (!user) redirect(ROUTES.auth.login)

  await bootstrapUser(user.id)

  const [{ data: disciplines }, { data: subjectRows }] = await Promise.all([
    supabase
      .from('disciplines')
      .select('discipline_id, name, acronym, created_at, updated_at')
      .order('name'),
    // Fetch level-1 subjects for every discipline (used by returning_reviewer multi-select)
    supabase
      .from('taxonomy_tree')
      .select('node_id, name, discipline_id')
      .eq('level', 1)
      .order('name'),
  ])

  // Build a lookup: disciplineId → Subject[]
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

  const selectDiscipline = async (formData: FormData) => {
    'use server'
    const disciplineId = formData.get('disciplineId') as string
    const reviewerType = (formData.get('reviewerType') as string) || 'first_taker'
    const examDate = formData.get('examDate') as string | null
    const studyWindow = formData.get('studyWindow') as string | null
    const schoolOrInstitution = formData.get('schoolOrInstitution') as string | null
    const enrolledReviewCenter = (formData.get('enrolledReviewCenter') as string | null) || 'none'

    // Deserialise struggled subjects (JSON array of subject names from the client)
    let struggledSubjectNames: string[] = []
    const rawStruggled = formData.get('struggledSubjects') as string | null
    if (rawStruggled) {
      try {
        const parsed = JSON.parse(rawStruggled)
        if (Array.isArray(parsed)) {
          struggledSubjectNames = parsed.filter((s): s is string => typeof s === 'string')
        }
      } catch {
        // Malformed JSON — treat as empty
      }
    }

    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return

    // ── user_global_stats updates ──────────────────────────────────────────
    const statsUpdates: Record<string, unknown> = {
      current_discipline_id: disciplineId,
      onboarding_completed_at: new Date().toISOString(),
    }

    if (examDate && (reviewerType === 'first_taker' || reviewerType === 'returning_reviewer')) {
      statsUpdates.target_exam_date = examDate
    }

    if (reviewerType === 'returning_reviewer') {
      statsUpdates.is_retaker = true
      statsUpdates.exam_attempt_number = 2
      statsUpdates.previous_exam_result = 'failed'
    } else if (reviewerType === 'first_taker') {
      statsUpdates.is_retaker = false
      statsUpdates.exam_attempt_number = 1
    }

    await supabase
      .from('user_global_stats')
      .update(statsUpdates)
      .eq('user_id', user.id)

    // ── profiles upsert ────────────────────────────────────────────────────
    const profileUpdates: Record<string, unknown> = {
      id: user.id,
      discipline_id: disciplineId,
      reviewer_type: reviewerType,
      preferred_study_window: studyWindow || 'any',
      onboarding_completed_at: new Date().toISOString(),
      enrolled_review_center: enrolledReviewCenter,
    }

    if (examDate && (reviewerType === 'first_taker' || reviewerType === 'returning_reviewer')) {
      profileUpdates.target_exam_date = examDate
    }

    if (reviewerType === 'returning_reviewer' && struggledSubjectNames.length > 0) {
      profileUpdates.previous_exam_subjects_struggled = JSON.stringify(struggledSubjectNames)
    }

    if (reviewerType === 'undergrad') {
      profileUpdates.account_mode = 'student_mode'
      if (schoolOrInstitution) {
        profileUpdates.school_or_institution = schoolOrInstitution
      }
    }

    if (reviewerType === 'dae') {
      profileUpdates.account_mode = 'dae_mode'
    }

    await supabase
      .from('profiles')
      .upsert(profileUpdates, { onConflict: 'id' })

    // ── Analytics event ────────────────────────────────────────────────────
    const { trackServerEvent } = await import('@/lib/analytics-server')
    void trackServerEvent('onboarding_completed', {
      reviewer_type: reviewerType,
      has_exam_date: !!(examDate && (reviewerType === 'first_taker' || reviewerType === 'returning_reviewer')),
      preferred_study_window: studyWindow || 'any',
      struggled_subjects_count: struggledSubjectNames.length,
    })

    revalidatePath(ROUTES.dashboard.root, 'layout')
    redirect(ROUTES.dashboard.root)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-muted">
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
