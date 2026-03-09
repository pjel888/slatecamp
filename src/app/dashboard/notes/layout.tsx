import { getNotesList } from '@/lib/actions/notes'
import { NotesLayoutClient } from '@/components/notes/NotesLayoutClient'

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialNotes = await getNotesList()
  return (
    <div className="flex h-[calc(100vh-3.5rem)] -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 overflow-hidden bg-[var(--color-bone)] dark:bg-background">
      <NotesLayoutClient initialNotes={initialNotes}>
        {children}
      </NotesLayoutClient>
    </div>
  )
}
