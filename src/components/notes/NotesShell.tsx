'use client'

import { useRef, useState, useCallback } from 'react'
import { Notepad } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { getNote, createNote, updateNote, deleteNote } from '@/lib/actions/notes-actions'
import { ConfirmDialog } from '@/components/ui/dialog'
import { NotesNavigator, type NavFilter } from '@/components/notes/NotesNavigator'
import { NotesList } from '@/components/notes/NotesList'
import dynamic from 'next/dynamic'

const NotesEditor = dynamic(
  () => import('@/components/notes/NotesEditor').then(m => m.NotesEditor),
  { ssr: false },
)
import { ContextBadge } from '@/components/notes/ContextBadge'
import { useNotesPanels, useNotesList, useNoteEditor } from '@/hooks/notes'
import type { NoteStub } from '@/types/app'

interface NotesShellProps {
  initialNotes: NoteStub[]
  initialFolders: { folder_id: string; name: string }[]
  initialOpenNoteId?: string | null
  userId?: string
}

const applyFilter = (stubs: NoteStub[], filter: NavFilter): NoteStub[] => {
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

export const NotesShell = ({ initialNotes, initialFolders, initialOpenNoteId, userId }: NotesShellProps) => {
  const [folders, setFolders] = useState(initialFolders)
  const [filter, setFilter] = useState<NavFilter>({ type: 'all' })
  const [searchQuery, setSearchQuery] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  // Extracted hooks
  const { navCollapsed, setNavCollapsed, listCollapsed, setListCollapsed } = useNotesPanels()
  const { stubs, setStubs } = useNotesList(initialNotes, filter)
  const {
    selectedId,
    setSelectedId,
    currentNote,
    setCurrentNote,
    isSaving,
    pendingTitle,
    setPendingTitle,
    pendingContent,
    setPendingContent,
    selectNote,
  } = useNoteEditor({ initialOpenNoteId, setStubs })

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

  const handleDelete = useCallback((id: string) => {
    setPendingDeleteId(id)
    setShowDeleteConfirm(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteId) return
    const id = pendingDeleteId
    setPendingDeleteId(null)
    setStubs((prev) => prev.filter((n) => n.id !== id))
    if (selectedId === id) { setSelectedId(null); setCurrentNote(null) }
    await deleteNote(id)
  }, [pendingDeleteId, selectedId, setStubs, setSelectedId, setCurrentNote])

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
    <div className="flex h-full w-full overflow-hidden bg-[#F5F5F5]">
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete note?"
        description="Delete this note? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
      />
      {/* Pane 1: Navigator (collapsible) */}
      <NotesNavigator
        folders={folders}
        filter={filter}
        onFilterChange={setFilter}
        onFoldersChange={setFolders}
        collapsed={navCollapsed}
        onToggle={() => setNavCollapsed((prev) => !prev)}
      />

      {/* Pane 2: Note List (collapsible) */}
      <NotesList
        notes={displayed}
        selectedId={selectedId}
        onSelect={selectNote}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onPin={handlePin}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        collapsed={listCollapsed}
        onToggle={() => setListCollapsed((prev) => !prev)}
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
                  <span className={cn('text-[11px] text-text-tertiary', isSaving && 'animate-pulse')}>
                    {isSaving ? 'Saving...' : new Date(currentNote.updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={pendingTitle ?? currentNote.title}
                  onChange={(e) => setPendingTitle(e.target.value)}
                  placeholder="Untitled Note"
                  className="w-full border-none bg-transparent p-0 text-xl font-bold text-text-primary placeholder:text-border focus:outline-none focus:ring-0"
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
                  placeholder="Write... select text to highlight and format"
                  className="min-h-full"
                  toolbarWrapperClassName="sticky top-0 z-10"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-8">
            <SCIcon icon={Notepad} size="2xl" weight="duotone" className="text-primary opacity-20 mb-1" />
            <p className="text-base font-medium text-text-primary">
              Your workspace is ready
            </p>
            <p className="text-sm text-text-tertiary mt-0.5 max-w-[280px]">
              Select a note from the list, or create a new one to start capturing ideas.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
