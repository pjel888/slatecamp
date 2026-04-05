import { createClient, getUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

interface DebriefPageProps {
  params: Promise<{ sessionId: string }>
}

/** Legacy v1 debrief route — redirects to v2 results dashboard */
const DebriefPage = async ({ params }: DebriefPageProps) => {
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

  // Redirect to v2 results
  redirect(`/quiz/${mode}/session/${sessionId}/results`)
}

export default DebriefPage
