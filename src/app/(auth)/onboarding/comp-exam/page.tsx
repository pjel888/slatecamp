import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { CompExamFlow } from './_components/CompExamFlow'

export const metadata = {
  title: 'Comp Exam Bridge — SlateCamp',
  description: 'Map your comp exam scores to your heatmap in 2 minutes.',
}

export default async function CompExamOnboardingPage() {
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-[#F8F7F5]">
      <div className="w-full max-w-md space-y-6">
        {/* Progress indicator */}
        <p className="text-center text-[11px] uppercase tracking-[1.5px] text-[#8896A7]">
          Optional · Comp Exam Bridge
        </p>

        <div className="rounded-md border border-[#D4DAE3] bg-white p-6">
          <CompExamFlow />
        </div>

        {/* Trust line */}
        <p className="text-center text-xs text-[#8896A7]">
          Your scores are only used to personalise your study map. They&apos;re never shared.
        </p>
      </div>
    </div>
  )
}
