import { createClient, getUser } from '@/lib/supabase/server'
import { type Note } from '@/lib/actions/notes-actions'
import { NotesShell } from '@/components/notes/NotesShell'

type NotesPageProps = { searchParams?: Promise<{ open?: string }> }

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = searchParams ? await searchParams : {}
  const initialOpenNoteId = params?.open ?? null

  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) {
    // Redirect to login if user is not authenticated
    // This should ideally be handled by middleware or root layout,
    // but as a safeguard, we redirect here.
    return null
  }

  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes in server component:', error)
    // Render an error state or empty state if fetching fails
    return <div>Error loading notes. Please try again later.</div>
  }

  return (
    <div className='h-full w-full overflow-hidden'>
      <NotesShell initialNotes={notes} initialOpenNoteId={initialOpenNoteId} />
    </div>
  )
}
