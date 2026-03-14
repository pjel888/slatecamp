import { createClient, getUser } from '@/lib/supabase/server'
import { getQuizSession } from '@/lib/actions/quiz'
import { ensureUserGlobalStats } from '@/lib/actions/user-stats'
import { CampDashboard } from './CampDashboard'
import { redirect } from 'next/navigation'

export default async function TestingPage() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect('/login')

  const stats = await ensureUserGlobalStats()
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <h1 className="text-xl font-medium text-zinc-900">No discipline found</h1>
        <p className="text-zinc-500 mt-2">Please select a discipline in settings first.</p>
      </div>
    )
  }

  // 1. Look for existing in-progress session
  const { data: existingSession } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .eq('test_mode', 'camp')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 2. Fetch all available question IDs for this discipline
  const { data: allQuestions } = await supabase
    .from('questions')
    .select('question_id')

  // 3. Fetch top-level subjects for custom session builder
  const { data: subjects } = await supabase
    .from('taxonomy_tree')
    .select('*')
    .eq('discipline_id', stats.current_discipline_id)
    .eq('level', 1)
    .order('name')

  const questionIds = (allQuestions as any[])?.map((q: { question_id: string }) => q.question_id) || []
  const disciplineName = (stats as any).disciplines?.name || 'Architecture'

  return (
    <div className="w-full h-full bg-zinc-50">
      <CampDashboard 
        initialSession={existingSession}
        disciplineId={stats.current_discipline_id!}
        disciplineName={disciplineName}
        subjects={subjects || []}
        allQuestionIds={questionIds}
      />
    </div>
  )
}
