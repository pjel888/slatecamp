import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { getUser } from '@/lib/supabase/server'
import { DataLayout } from '@/components/layouts/category/DataLayout'
import ExamOutcomeSurvey from './ExamOutcomeSurvey'

/**
 * Exam Outcome Survey — D3
 *
 * 3 questions only:
 * 1. "Did you take the June 2026 LEA?" → passed / failed / did not take
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
  if (!user) redirect(ROUTES.auth.login)

  return (
    <DataLayout
      hero={{
        subtitle: `How did the ${CURRENT_EXAM_BATCH} LEA go?`,
        description: 'Help improve SlateCamp for the next batch of candidates.',
      }}
    >
      <ExamOutcomeSurvey examBatch={CURRENT_EXAM_BATCH} />
    </DataLayout>
  )
}

export default ExamOutcomePage
