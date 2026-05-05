import { createClient, getUser } from '@/lib/supabase/server'
import { NotesShell } from '@/components/notes/NotesShell'
import { snippet } from '@/lib/utils/text'
import { LearnLayout } from '@/components/layouts/category/LearnLayout'
import type { NoteStub } from '@/types/app'

type NotesPageProps = { searchParams?: Promise<{ open?: string }> }

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = searchParams ? await searchParams : {}
  const initialOpenNoteId = params?.open ?? null

  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const [{ data: notesRaw }, { data: folders }] = await Promise.all([
    supabase
      .from('notes')
      .select('note_id, title, content, updated_at, is_pinned, note_type, tags, color, article_id, question_id, topic_id')
      .eq('user_id', user.id)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false }),
    supabase
      .from('note_folders')
      .select('folder_id, name')
      .eq('user_id', user.id)
      .order('name', { ascending: true }),
  ])

  const initialNotes: NoteStub[] = (notesRaw ?? []).map((row) => ({
    id: row.note_id,
    title: row.title,
    updated_at: row.updated_at,
    is_pinned: row.is_pinned ?? false,
    note_type: row.note_type ?? 'standard',
    tags: row.tags ?? [],
    color: row.color ?? null,
    article_id: row.article_id ?? null,
    question_id: row.question_id ?? null,
    topic_id: row.topic_id ?? null,
    snippet: snippet(row.content),
  }))

  return (
    <LearnLayout
      hero={{
        subtitle: 'Notes',
        description:
          'Your personal study notebook. Capture insights from articles, quiz questions, and design problems — all linked to their source.',
      }}
      fullHeight
    >
      <NotesShell
        initialNotes={initialNotes}
        initialFolders={folders ?? []}
        initialOpenNoteId={initialOpenNoteId}
        userId={user.id}
      />
    </LearnLayout>
  )
}
