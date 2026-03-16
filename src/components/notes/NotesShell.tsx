'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FileText } from 'lucide-react'
import { type Note, getNotes, getNote, createNote, updateNote, deleteNote } from '@/lib/actions/notes-actions'
import { NotesList } from '@/components/notes/NotesList'
import { NotesEditor } from '@/components/notes/NotesEditor'

interface NotesShellProps {
  initialNotes: Note[]
  initialOpenNoteId?: string | null
}

export function NotesShell({ initialNotes, initialOpenNoteId }: NotesShellProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [_loading, setLoading] = useState(true)
  const [pendingContent, setPendingContent] = useState<Record<string, unknown> | null>(null)
  const [pendingTitle, setPendingTitle] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const handleSelectNote = useCallback(async (id: string) => {
    if (id === selectedId) return
    const note = await getNote(id)
    if (note) {
      setCurrentNote(note)
      setSelectedId(id)
      setPendingTitle(null)
      setPendingContent(null)
    }
  }, [selectedId])

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getNotes()
      setNotes(list)
      if (selectedId && !list.some(n => n.note_id === selectedId)) {
        setSelectedId(null)
        setCurrentNote(null)
      }
    } catch (error) {
      console.error("Error fetching notes in NotesShell:", error)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  useEffect(() => {
    if (initialOpenNoteId) {
      handleSelectNote(initialOpenNoteId)
    }
  }, [initialOpenNoteId, handleSelectNote])

  const handleCreate = async () => {
    const tempId = `temp-${Date.now()}`
    const tempNote: Note = {
      note_id: tempId,
      user_id: 'me',
      title: '',
      content: { type: 'doc', content: [] },
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    setNotes([tempNote, ...notes])
    setSelectedId(tempId)

    try {
      const newNote = await createNote()
      setNotes((prev) => prev.map(n => n.note_id === tempId ? newNote : n))
      setSelectedId(newNote.note_id)
      setTimeout(() => titleInputRef.current?.focus(), 100)
    } catch (e: unknown) {
      console.error('Failed to create note:', e)
      setNotes((prev) => prev.filter(n => n.note_id !== tempId))
      setSelectedId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return

    const originalNotes = [...notes]
    setNotes(notes.filter((n) => n.note_id !== id))
    if (selectedId === id) setSelectedId(null)

    try {
      await deleteNote(id)
    } catch (e: unknown) {
      console.error('Failed to delete note:', e)
      setNotes(originalNotes)
      if (originalNotes.find(n => n.note_id === id)) {
        setSelectedId(id)
      }
    }
  }

  useEffect(() => {
    if (!currentNote || (!pendingContent && pendingTitle === null)) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    setIsSaving(true)

    debounceRef.current = setTimeout(async () => {
      const updates: { title?: string; content?: Record<string, unknown> } = {}
      if (pendingTitle !== null) updates.title = pendingTitle || 'Untitled Note'
      if (pendingContent) updates.content = pendingContent

      try {
        await updateNote(currentNote.note_id, updates)
        setNotes(prev => prev.map(n =>
          n.note_id === currentNote.note_id
            ? { ...n, title: updates.title ?? n.title, updated_at: new Date().toISOString() }
            : n
        ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()))
      } catch (e) {
        console.error('Failed to save note:', e)
      } finally {
        setIsSaving(false)
      }
    }, 800)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [currentNote, pendingContent, pendingTitle, handleSelectNote])

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      <NotesList
        notes={notes}
        selectedId={selectedId}
        onSelect={handleSelectNote}
        onCreate={handleCreate}
        onDelete={handleDelete}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="w-px bg-zinc-200" />

      <main className="flex flex-1 flex-col bg-white h-full relative">
        {currentNote ? (
          <div className="flex flex-1 flex-col h-full">
            <div className="shrink-0 px-8 pt-8 pb-4 max-w-3xl mx-auto w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-zinc-400">
                  {new Date(currentNote.updated_at).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                </span>
                {isSaving && <span className="text-[10px] text-zinc-400 animate-pulse">Saving...</span>}
              </div>
              <input
                ref={titleInputRef}
                type="text"
                value={pendingTitle ?? currentNote.title}
                onChange={(e) => setPendingTitle(e.target.value)}
                className="w-full border-none bg-transparent p-0 text-xl font-semibold text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-0"
                placeholder="Note Title"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 [&_.ProseMirror]:min-h-[500px] [&_.ProseMirror]:font-sans [&_.ProseMirror]:text-[15px] [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:text-zinc-800 [&_.ProseMirror]:px-4">
              <NotesEditor
                content={currentNote.content}
                onChange={(content) => setPendingContent(content)}
                onTitleChange={(title) => setPendingTitle(title)}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-300">
            <FileText className="h-16 w-16 opacity-20" />
            <p className="text-sm font-medium">Select a note or create a new one</p>
          </div>
        )}
      </main>
    </div>
  )
}
