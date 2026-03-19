import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { bootstrapUser } from '@/lib/supabase/bootstrap'

import { Discipline } from '@/types/app'
import { StudyWindowSelector } from '@/components/settings/StudyWindowSelector'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) redirect(ROUTES.LOGIN)

  await bootstrapUser(user.id)

  const { data: disciplines } = await supabase
    .from('disciplines')
    .select('*')
    .order('name')

  async function selectDiscipline(formData: FormData) {
    'use server'
    const disciplineId = formData.get('disciplineId') as string
    console.log('[Onboarding] Selecting discipline:', disciplineId)

    const supabase = await createClient()
    const {
      data: { user },
    } = await getUser()

    if (!user) {
      console.error('[Onboarding] No user found in action')
      return
    }

    console.log('[Onboarding] User ID:', user.id)

    const { error } = await supabase
      .from('user_global_stats')
      .update({ current_discipline_id: disciplineId })
      .eq('user_id', user.id)

    if (error) {
      console.error('[Onboarding] Error selecting discipline:', error)
      return
    }

    console.log('[Onboarding] Update successful, revalidating and redirecting')
    revalidatePath('/dashboard', 'layout')
    redirect(ROUTES.DASHBOARD)
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 font-sans'>
      <div className='w-full max-w-md space-y-8 rounded-md border border-zinc-200 bg-white p-8 shadow-sm'>
        <div className='text-center'>
          <h1 className='text-xl font-semibold tracking-tight text-zinc-900'>
            Let&apos;s set up your study path
          </h1>
          <p className='mt-2 text-sm text-zinc-500'>
            Choose your discipline to get started.
          </p>
        </div>

        <form action={selectDiscipline} className='mt-8 space-y-4'>
          <div className='space-y-2'>
            {disciplines?.map((discipline: Discipline) => (
              <label
                key={discipline.discipline_id}
                className='flex items-center justify-between rounded-md border border-zinc-200 p-4 transition-colors hover:border-primary hover:bg-[#EEF2FC]/50 cursor-pointer group'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100 text-zinc-900 transition-colors group-hover:bg-[#EEF2FC] group-hover:text-primary'>
                    <span className='text-xs font-bold'>
                      {discipline.acronym}
                    </span>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-zinc-900'>
                      {discipline.name}
                    </p>
                  </div>
                </div>
                <input
                  type='radio'
                  name='disciplineId'
                  value={discipline.discipline_id}
                  required
                  className='h-4 w-4 border-zinc-300 text-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-2'
                />
              </label>
            ))}
          </div>

          <button
            type='submit'
            className='flex w-full justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1535A8] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2'
          >
            Continue
          </button>
        </form>

        {/* Study window preference — sleep-aware scheduling */}
        <div className='pt-4 border-t border-zinc-200'>
          <p className='text-sm font-medium text-zinc-900 mb-3'>
            When do you usually study?
          </p>
          <p className='text-xs text-zinc-500 mb-3'>
            Optional — helps us order your trail activities for better retention.
          </p>
          <StudyWindowSelector compact />
        </div>
      </div>
    </div>
  )
}
