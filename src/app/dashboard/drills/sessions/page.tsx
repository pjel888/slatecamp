import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { SessionsTable } from '@/components/testing/hub/SessionsTable'

const SessionsPage = async () => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.auth.login)

  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('session_id, test_mode, config, status, question_ids, started_at, completed_at, current_question_index, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(200)

  return (
    <div className="w-full px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Session History</h1>
      <SessionsTable sessions={sessions ?? []} />
    </div>
  )
}

export default SessionsPage
