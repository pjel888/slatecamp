import type { Metadata } from 'next'
import { PreAssessmentTeaser } from '@/components/assessment/PreAssessmentTeaser'

/**
 * Pre-Assessment Teaser — UX Strategy Section 4 (Step 2)
 *
 * Public page (no auth required). Let users answer 5 sample questions
 * before the "create account" gate. Duolingo insight: delayed sign-up
 * always wins. "Skin in the game" before commitment.
 *
 * After 5 questions: "Create a free account to see your score."
 */

export const metadata: Metadata = {
  title: 'Try SlateCamp — Free Diagnostic Sample',
  description: 'Answer 5 sample ALE questions to see how SlateCamp works. No account required to start.',
}

const TryPage = () => {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F7F5' }}>
      <PreAssessmentTeaser />
    </main>
  )
}

export default TryPage
