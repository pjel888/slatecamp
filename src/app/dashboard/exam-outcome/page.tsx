import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import ExamOutcomeSurvey from './ExamOutcomeSurvey'

/**
 * Exam Outcome Survey — D3
 *
 * 3 questions only:
 * 1. "Did you take the June 2026 ALE?" → passed / failed / did not take
 * 2. (If passed or failed) "What was your reported score?" → optional number
 * 3. "Thank you. Your result helps us improve SlateCamp."
 *
 * Voice rules:
 * - No "Congratulations!" if they passed — factual acknowledgment only
 * - No sympathy language if they failed — just "Thank you for sharing."
 * - Never reference "failure" by name
 */

const CURRENT_EXAM_BATCH = 'June 2026'

const ExamOutcomePage = async () => {
  const { data: { user } } = await getUser()
  if (!user) redirect('/login')

  return (
    <SharedPageLayout>
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <h1 className="font-[family-name:var(--font-syne)] text-xl font-bold text-[text-primary]">
          How did the {CURRENT_EXAM_BATCH} ALE go?
        </h1>
        <p className="mt-2 text-sm text-[text-secondary]">
          Your response helps us improve SlateCamp for the next batch of candidates.
          Takes about 30 seconds.
        </p>

        <div className="mt-6">
          <ExamOutcomeSurvey examBatch={CURRENT_EXAM_BATCH} />
        </div>
      </div>
    </SharedPageLayout>
  )
}

export default ExamOutcomePage
