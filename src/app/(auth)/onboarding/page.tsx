import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { bootstrapUser } from '@/lib/supabase/bootstrap'

import { Discipline } from '@/types/app'

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
    <div className='flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-zinc-900 font-sans'>
      <div className='w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-zinc-200'>
        <div className='text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Welcome to SlateCamp
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
                className='flex items-center justify-between p-4 rounded-xl border border-zinc-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all group'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-sm bg-zinc-100 text-zinc-900 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors'>
                    <span className='text-xs font-bold'>
                      {discipline.acronym}
                    </span>
                  </div>
                  <div>
                    <p className='text-sm font-medium'>{discipline.name}</p>
                  </div>
                </div>
                <input
                  type='radio'
                  name='disciplineId'
                  value={discipline.discipline_id}
                  required
                  className='h-4 w-4 border-zinc-300 text-blue-600 focus:ring-blue-600'
                />
              </label>
            ))}
          </div>

          <button
            type='submit'
            className='w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-500 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors'
          >
            Start Studying
          </button>
        </form>
      </div>
    </div>
  )
}
