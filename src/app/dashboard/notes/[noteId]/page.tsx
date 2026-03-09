import { notFound } from 'next/navigation'
import { getNote } from '@/lib/actions/notes'
import { NoteEditorPage } from '@/components/notes/NoteEditorPage'

interface NotePageProps {
  params: Promise<{ noteId: string }>
}

export default async function NotePage({ params }: NotePageProps) {
  const { noteId } = await params
  const note = await getNote(noteId)
  if (!note) notFound()
  return <NoteEditorPage note={note} />
}
