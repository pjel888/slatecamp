import { createClient, getUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

interface SessionPageProps {
  params: Promise<{ sessionId: string }>
}

/** Legacy v1 route — redirects to v2 quiz session */
const SessionPage = async ({ params }: SessionPageProps) => {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  // Fetch session to determine mode
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('session_id, status, config, test_mode')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!session) notFound()

  // Determine mode from v2 config or fall back to test_mode
  const config = session.config as { mode?: string } | null
  const mode = config?.mode ?? session.test_mode ?? 'camp'

  // Redirect to v2 route
  if (session.status === 'completed') {
    redirect(`/quiz/${mode}/session/${sessionId}/results`)
  }

  redirect(`/quiz/${mode}/session/${sessionId}`)
}

export default SessionPage
