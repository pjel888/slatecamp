'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FileText } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { getNotesList, getNoteFolders, getNote, createNote, updateNote, deleteNote } from '@/lib/actions/notes'
import { NotesNavigator, type NavFilter } from '@/components/notes/NotesNavigator'
import { NotesList } from '@/components/notes/NotesList'
import { NotesEditor } from '@/components/notes/NotesEditor'
import { ContextBadge } from '@/components/notes/ContextBadge'
import type { Note, NoteStub } from '@/types/app'

interface NotesShellProps {
  initialNotes: NoteStub[]
  initialFolders: { folder_id: string; name: string }[]
  initialOpenNoteId?: string | null
  userId?: string
}

function applyFilter(stubs: NoteStub[], filter: NavFilter): NoteStub[] {
  switch (filter.type) {
    case 'pinned': return stubs.filter((n) => n.is_pinned)
    case 'folder': return stubs // folder_id not in NoteStub — rely on server refetch (handled in useEffect)
    case 'source':
      return filter.source === 'wiki'
        ? stubs.filter((n) => n.article_id)
        : stubs.filter((n) => n.question_id)
    default: return stubs
  }
}

export function NotesShell({ initialNotes, initialFolders, initialOpenNoteId, userId }: NotesShellProps) {
  const [stubs, setStubs] = useState<NoteStub[]>(initialNotes)
  const [folders, setFolders] = useState(initialFolders)
  const [filter, setFilter] = useState<NavFilter>({ type: 'all' })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [pendingTitle, setPendingTitle] = useState<string | null>(null)
  const [pendingContent, setPendingContent] = useState<Record<string, unknown> | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Refresh list when filter changes
  useEffect(() => {
    const folderId = filter.type === 'folder' ? filter.id : undefined
    getNotesList(folderId).then(setStubs)
  }, [filter])

  // Open note from URL param
  useEffect(() => {
    if (initialOpenNoteId) selectNote(initialOpenNoteId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOpenNoteId])

  const selectNote = useCallback(async (id: string) => {
    if (id === selectedId) return
    const note = await getNote(id)
    if (note) { setCurrentNote(note); setSelectedId(id); setPendingTitle(null); setPendingContent(null) }
  }, [selectedId])

  // Debounced save
  useEffect(() => {
    if (!currentNote || (pendingContent === null && pendingTitle === null)) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setIsSaving(true)
    debounceRef.current = setTimeout(async () => {
      const updates: Parameters<typeof updateNote>[1] = {}
      if (pendingTitle !== null) updates.title = pendingTitle || 'Untitled Note'
      if (pendingContent) updates.content = pendingContent
      await updateNote(currentNote.id, updates)
      setStubs((prev) =>
        prev
          .map((n) => n.id === currentNote.id ? { ...n, title: updates.title ?? n.title, updated_at: new Date().toISOString() } : n)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
      )
      setIsSaving(false)
    }, 800)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [currentNote, pendingContent, pendingTitle])

  const handleCreate = async () => {
    const result = await createNote()
    if ('error' in result) return
    const note = await getNote(result.id)
    if (note) {
      setStubs((prev) => [{ id: note.id, title: note.title, updated_at: note.updated_at, is_pinned: note.is_pinned, note_type: note.note_type, tags: note.tags ?? [], article_id: note.article_id, question_id: note.question_id }, ...prev])
      setCurrentNote(note)
      setSelectedId(note.id)
      setPendingTitle(null)
      setPendingContent(null)
      setTimeout(() => titleInputRef.current?.focus(), 80)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return
    setStubs((prev) => prev.filter((n) => n.id !== id))
    if (selectedId === id) { setSelectedId(null); setCurrentNote(null) }
    await deleteNote(id)
  }

  const handlePin = async (id: string, pinned: boolean) => {
    setStubs((prev) => prev.map((n) => n.id === id ? { ...n, is_pinned: pinned } : n))
    await updateNote(id, { is_pinned: pinned })
  }

  const displayed = applyFilter(stubs, filter)
  const anchor = currentNote ? {
    topic_id: currentNote.topic_id ?? undefined,
    article_id: currentNote.article_id ?? undefined,
    question_id: currentNote.question_id ?? undefined,
    source_url: currentNote.source_url ?? undefined,
  } : {}

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {/* Pane 1: Navigator */}
      <NotesNavigator
        folders={folders}
        filter={filter}
        onFilterChange={setFilter}
        onFoldersChange={setFolders}
      />

      {/* Pane 2: Note List */}
      <NotesList
        notes={displayed}
        selectedId={selectedId}
        onSelect={selectNote}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onPin={handlePin}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Pane 3: Editor */}
      <main className="relative flex flex-1 flex-col overflow-hidden bg-white">
        {currentNote ? (
          <div className="flex h-full flex-col">
            {/* Editor header */}
            <div className="shrink-0 border-b border-border/50 px-8 pt-6 pb-3">
              <div className="mx-auto max-w-3xl">
                <div className="mb-2 flex items-center justify-between">
                  {/* Context anchors */}
                  <ContextBadge anchor={anchor} />
                  <span className={cn('text-[11px] text-zinc-400', isSaving && 'animate-pulse')}>
                    {isSaving ? 'Saving…' : new Date(currentNote.updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={pendingTitle ?? currentNote.title}
                  onChange={(e) => setPendingTitle(e.target.value)}
                  placeholder="Untitled Note"
                  className="w-full border-none bg-transparent p-0 text-xl font-bold text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Rich editor */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl">
                <NotesEditor
                  content={currentNote.content}
                  onChange={(c) => setPendingContent(c)}
                  userId={userId}
                  placeholder="Write… select text to highlight and format"
                  className="min-h-full"
                  toolbarWrapperClassName="sticky top-0 z-10"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-200">
            <SCIcon icon={FileText} size="2xl" />
            <p className="text-sm font-medium text-zinc-400">Select a note or create one</p>
          </div>
        )}
      </main>
    </div>
  )
}

// cn helper inline to avoid extra import
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
