import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { bootstrapUser } from '@/lib/supabase/bootstrap'
import { StudyWindowSelector } from '@/components/settings/StudyWindowSelector'
import type { Discipline } from '@/types/app'

/**
 * Onboarding Page — UX Strategy Section 4 (Step 4)
 *
 * Post-signup. Collects:
 * 1. Discipline selection (existing)
 * 2. "When is your target exam date?" (NEW — writes to user_global_stats.target_exam_date)
 * 3. "Have you taken the ALE before?" (NEW — writes to user_global_stats.exam_attempt_number)
 * 4. Study window preference (existing)
 *
 * Progress indicator: "Step 1 of 3 before your score is ready"
 */

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  if (!user) redirect(ROUTES.LOGIN)

  await bootstrapUser(user.id)

  const { data: disciplines } = await supabase
    .from('disciplines')
    .select('*')
    .order('name')

  const selectDiscipline = async (formData: FormData) => {
    'use server'
    const disciplineId = formData.get('disciplineId') as string
    const examDate = formData.get('examDate') as string | null
    const isRetaker = formData.get('isRetaker') as string | null

    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return

    // Write discipline + context data
    const updates: Record<string, unknown> = {
      current_discipline_id: disciplineId,
    }

    if (examDate) {
      updates.target_exam_date = examDate
    }

    if (isRetaker === 'yes') {
      updates.exam_attempt_number = 2
      updates.previous_exam_result = 'failed'
    } else if (isRetaker === 'no') {
      updates.exam_attempt_number = 1
    }

    await supabase
      .from('user_global_stats')
      .update(updates)
      .eq('user_id', user.id)

    // Also write target_exam_date to profiles (UX Strategy Section 4)
    if (examDate) {
      await supabase
        .from('profiles')
        .update({ target_exam_date: examDate })
        .eq('user_id', user.id)
    }

    revalidatePath('/dashboard', 'layout')
    redirect(ROUTES.DASHBOARD)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6" style={{ backgroundColor: '#F8F7F5' }}>
      <div className="w-full max-w-md space-y-6">
        {/* Progress indicator */}
        <p className="text-center font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[#8896A7]">
          Step 1 of 3 before your score is ready
        </p>

        <div className="rounded-md border border-[#D4DAE3] bg-white p-6 space-y-6">
          <div className="text-center">
            <h1 className="font-[family-name:var(--font-syne)] text-xl font-bold text-[#1A2332]">
              Let&apos;s set up your study path
            </h1>
            <p className="mt-1.5 text-sm text-[#4A5568]">
              Two quick questions, then we&apos;ll build your diagnostic.
            </p>
          </div>

          <form action={selectDiscipline} className="space-y-5">
            {/* Discipline Selection */}
            <div>
              <label className="block text-sm font-medium text-[#1A2332] mb-2">
                Choose your discipline
              </label>
              <div className="space-y-2">
                {disciplines?.map((discipline: Discipline) => (
                  <label
                    key={discipline.discipline_id}
                    className="flex items-center justify-between rounded-md border border-[#D4DAE3] p-3 transition-colors duration-150 hover:border-[#1B3FC4] hover:bg-[#EEF2FC]/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#EEF2FC] text-[#1B3FC4]">
                        <span className="text-[11px] font-bold">{discipline.acronym}</span>
                      </div>
                      <span className="text-sm font-medium text-[#1A2332]">{discipline.name}</span>
                    </div>
                    <input
                      type="radio"
                      name="disciplineId"
                      value={discipline.discipline_id}
                      required
                      className="h-4 w-4 border-[#D4DAE3] text-[#1B3FC4]"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Exam Date — UX Strategy: required for trail recommendation */}
            <div>
              <label htmlFor="examDate" className="block text-sm font-medium text-[#1A2332] mb-1.5">
                When is your target exam date?
              </label>
              <input
                type="date"
                id="examDate"
                name="examDate"
                className="w-full rounded-sm border border-[#D4DAE3] px-3 py-2 text-sm text-[#1A2332] focus:border-[#1B3FC4] focus:outline-none focus:ring-1 focus:ring-[#1B3FC4]"
              />
              <p className="mt-1 text-xs text-[#8896A7]">
                Helps us recommend the right study trail for your timeline.
              </p>
            </div>

            {/* Retaker Status — UX Strategy: changes onboarding tone */}
            <div>
              <p className="text-sm font-medium text-[#1A2332] mb-2">
                Have you taken this board exam before?
              </p>
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="isRetaker" value="no" className="peer sr-only" defaultChecked />
                  <div className="rounded-sm border border-[#D4DAE3] px-4 py-2.5 text-center text-sm font-medium text-[#4A5568] transition-colors duration-150 peer-checked:border-[#1B3FC4] peer-checked:bg-[#EEF2FC] peer-checked:text-[#1B3FC4]">
                    First time
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="isRetaker" value="yes" className="peer sr-only" />
                  <div className="rounded-sm border border-[#D4DAE3] px-4 py-2.5 text-center text-sm font-medium text-[#4A5568] transition-colors duration-150 peer-checked:border-[#1B3FC4] peer-checked:bg-[#EEF2FC] peer-checked:text-[#1B3FC4]">
                    Retaking
                  </div>
                </label>
              </div>
            </div>

            {/* Study Window — existing, optional */}
            <div className="pt-2 border-t border-[#D4DAE3]">
              <p className="text-sm font-medium text-[#1A2332] mb-1">
                When do you usually study?
              </p>
              <p className="text-xs text-[#8896A7] mb-2">
                Optional — helps order trail activities for better retention.
              </p>
              <StudyWindowSelector compact />
            </div>

            <button
              type="submit"
              className="flex w-full justify-center rounded-sm px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
              style={{ backgroundColor: '#1B3FC4' }}
            >
              Continue to Diagnostic &rarr;
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
