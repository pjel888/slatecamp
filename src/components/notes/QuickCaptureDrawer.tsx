'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowSquareOut,
  Plus,
  FileText,
  PushPin,
  Check,
} from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import {
  createNote,
  updateNote,
  getNotesList,
  getNote,
} from '@/lib/actions/notes-actions'
import { ROUTES } from '@/lib/routes'
import { useNoteContext } from '@/lib/context/note-context'
import { ContextBadge } from '@/components/notes/ContextBadge'
import { TemplatePicker } from '@/components/notes/TemplatePicker'
import { FloatingPanel } from '@/components/shared/floating-panel'
import dynamic from 'next/dynamic'

const NotesEditor = dynamic(
  () => import('@/components/notes/NotesEditor').then((m) => m.NotesEditor),
  { ssr: false },
)
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { NoteType, NoteStub } from '@/types/app'

const MODAL_WIDTH = 520
const MODAL_HEIGHT = 520
const LIST_WIDTH = 180
const AUTOSAVE_DELAY = 800

const EMPTY_DOC = { type: 'doc', content: [{ type: 'paragraph' }] }

interface QuickCaptureDrawerProps {
  userId?: string
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export const QuickCaptureDrawer = ({ userId }: QuickCaptureDrawerProps) => {
  const { anchor, drawerOpen, closeDrawer } = useNoteContext()

  // Note state
  const [noteId, setNoteId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<Record<string, unknown>>(EMPTY_DOC)
  const [noteType, setNoteType] = useState<NoteType>('quick_capture')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  // Notes list
  const [stubs, setStubs] = useState<NoteStub[]>([])
  const [listLoading, setListLoading] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const noteIdRef = useRef<string | null>(null)
  const hasQuestionContext = Boolean(anchor.question_id)

  // Keep noteIdRef in sync
  useEffect(() => {
    noteIdRef.current = noteId
  }, [noteId])

  // Load notes list + reset editor on open
  useEffect(() => {
    if (drawerOpen) {
      resetToNew()
      loadNotes()
    } else {
      // Flush any pending save on close
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen])

  const loadNotes = async () => {
    setListLoading(true)
    const notes = await getNotesList()
    setStubs(notes)
    setListLoading(false)
  }

  const resetToNew = () => {
    setNoteId(null)
    noteIdRef.current = null
    setTitle('')
    
    // If we have initialText from the anchor (e.g. from wiki highlight), 
    // seed the editor with a paragraph block.
    const initialContent = anchor.initialText 
      ? { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: anchor.initialText }] }] }
      : EMPTY_DOC
    
    setContent(initialContent)
    setNoteType(hasQuestionContext ? 'gap_analysis' : 'quick_capture')
    setSaveState('idle')
    setSaveError(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setTimeout(() => titleInputRef.current?.focus(), 80)
  }

  // Select an existing note from the list
  const selectNote = useCallback(async (id: string) => {
    // Flush pending save before switching
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const note = await getNote(id)
    if (!note) return
    setNoteId(note.id)
    noteIdRef.current = note.id
    setTitle(note.title)
    setContent(note.content)
    setNoteType(note.note_type)
    setSaveState('idle')
    setSaveError(null)
  }, [])

  // Autosave: creates new note on first edit, then updates
  const scheduleSave = useCallback(
    (nextTitle: string, nextContent: Record<string, unknown>, nextType: NoteType) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(async () => {
        setSaveState('saving')
        setSaveError(null)

        const currentNoteId = noteIdRef.current

        if (!currentNoteId) {
          // Create new note
          const result = await createNote({
            title: nextTitle.trim() || 'Untitled Note',
            content: nextContent,
            note_type: nextType,
            topic_id: anchor.topic_id,
            question_id: anchor.question_id,
            article_id: anchor.article_id,
            session_id: anchor.session_id,
            source_url: anchor.source_url,
          })
          if ('error' in result) {
            setSaveState('error')
            setSaveError(result.error)
            return
          }
          setNoteId(result.id)
          noteIdRef.current = result.id
          // Refresh list to show new note
          loadNotes()
        } else {
          // Update existing note
          const result = await updateNote(currentNoteId, {
            title: nextTitle.trim() || 'Untitled Note',
            content: nextContent,
            note_type: nextType,
          })
          if (result.error) {
            setSaveState('error')
            setSaveError(result.error)
            return
          }
          // Update stub in list
          setStubs((prev) =>
            prev
              .map((s) =>
                s.id === currentNoteId
                  ? { ...s, title: nextTitle.trim() || 'Untitled Note', updated_at: new Date().toISOString() }
                  : s,
              )
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
          )
        }

        setSaveState('saved')
        // Reset indicator after a beat
        setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 1500)
      }, AUTOSAVE_DELAY)
    },
    [anchor],
  )

  const handleTitleChange = (val: string) => {
    setTitle(val)
    scheduleSave(val, content, noteType)
  }

  const handleContentChange = (val: Record<string, unknown>) => {
    setContent(val)
    scheduleSave(title, val, noteType)
  }

  const handleTypeChange = (val: NoteType) => {
    setNoteType(val)
    // Only autosave type change if we have content worth saving
    if (noteId || title.trim() || contentHasText(content)) {
      scheduleSave(title, content, val)
    }
  }

  const hasAnchor = Boolean(
    anchor.topic_id || anchor.article_id || anchor.question_id,
  )

  /* ── Sidebar: notes list ── */
  const notesSidebar = (
    <div className="flex flex-col h-full">
      {/* List header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-2.5 py-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Notes
        </span>
        <button
          type="button"
          onClick={resetToNew}
          className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="New note"
        >
          <SCIcon icon={Plus} size="xs" />
        </button>
      </div>

      {/* Notes list */}
      <ul className="flex-1 overflow-y-auto py-1">
        {listLoading ? (
          <li className="py-6 text-center text-[11px] text-muted-foreground">
            Loading...
          </li>
        ) : stubs.length === 0 ? (
          <li className="py-6 text-center text-[11px] text-muted-foreground">
            No notes yet
          </li>
        ) : (
          stubs.slice(0, 20).map((stub) => {
            const isActive = noteId === stub.id
            return (
              <li key={stub.id}>
                <button
                  type="button"
                  onClick={() => selectNote(stub.id)}
                  className={cn(
                    'flex w-full flex-col gap-0.5 px-2.5 py-2 text-left transition-colors',
                    isActive
                      ? 'bg-primary/10 text-foreground'
                      : 'hover:bg-muted text-foreground/80',
                  )}
                >
                  <div className="flex items-center gap-1">
                    <SCIcon
                      icon={FileText}
                      size="xs"
                      className={cn(
                        'shrink-0',
                        isActive ? 'text-primary' : 'text-muted-foreground',
                      )}
                    />
                    <span className="flex-1 truncate text-[12px] font-medium leading-snug">
                      {stub.title || 'Untitled Note'}
                    </span>
                    {stub.is_pinned && (
                      <SCIcon
                        icon={PushPin}
                        size="xs"
                        className="shrink-0 text-primary/60"
                      />
                    )}
                  </div>
                  {stub.snippet && (
                    <span className="line-clamp-1 pl-[18px] text-[11px] text-muted-foreground">
                      {stub.snippet}
                    </span>
                  )}
                  <span className="pl-[18px] text-[11px] text-muted-foreground/60">
                    {formatDistanceToNow(new Date(stub.updated_at), {
                      addSuffix: false,
                    })
                      .replace('about ', '')
                      .replace('less than a minute', 'now')}
                  </span>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )

  /* ── Header actions: save state indicator ── */
  const saveIndicator = (
    <span className="flex items-center gap-1 text-[11px] text-muted-foreground mr-1">
      {saveState === 'saving' && (
        <span className="animate-pulse">Saving...</span>
      )}
      {saveState === 'saved' && (
        <span className="flex items-center gap-0.5 text-emerald-600">
          <SCIcon icon={Check} size="xs" /> Saved
        </span>
      )}
      {saveState === 'error' && (
        <span className="text-destructive">Error saving</span>
      )}
    </span>
  )

  /* ── Footer ── */
  const notesFooter = (
    <>
      {saveError && (
        <p className="mb-1.5 text-[11px] text-destructive" role="alert">
          {saveError}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground select-none">
          Auto-saves as you type
        </span>
        {noteId && (
          <a
            href={`${ROUTES.dashboard.notes}?open=${encodeURIComponent(noteId)}`}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            Open in Notes
            <SCIcon icon={ArrowSquareOut} size="xs" />
          </a>
        )}
      </div>
    </>
  )

  return (
    <FloatingPanel
      open={drawerOpen}
      onClose={closeDrawer}
      title={noteId ? 'Edit Note' : 'New Note'}
      headerActions={saveIndicator}
      draggable
      dragStorageKey="quick-capture-modal"
      backdrop="none"
      width={MODAL_WIDTH}
      height={MODAL_HEIGHT}
      sidebar={notesSidebar}
      sidebarWidth={LIST_WIDTH}
      footer={notesFooter}
    >
      {/* Context badge */}
      {hasAnchor && (
        <div className="shrink-0 border-b border-border/60 bg-muted/40 px-3 py-2">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Anchored to
          </p>
          <ContextBadge anchor={anchor} />
        </div>
      )}

      {/* Template picker */}
      <div className="shrink-0 border-b border-border/60 px-3 py-2.5">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Note type
        </p>
        <TemplatePicker
          value={noteType}
          onChange={handleTypeChange}
          disableGap={!hasQuestionContext}
        />
      </div>

      {/* Title */}
      <div className="shrink-0 border-b border-border/60 px-3 py-2">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title..."
          className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
          aria-label="Note title"
        />
      </div>

      {/* Rich editor */}
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        style={{ height: MODAL_HEIGHT - 220 }}
      >
        {drawerOpen && (
          <NotesEditor
            content={content}
            onChange={handleContentChange}
            userId={userId}
            compact
            placeholder="Start writing... (select text to format)"
            className="h-full"
          />
        )}
      </div>
    </FloatingPanel>
  )
}

/** Check if tiptap doc has any text content */
const contentHasText = (content: Record<string, unknown>): boolean => {
  try {
    const doc = content as {
      content?: Array<{ content?: Array<{ text?: string }> }>
    }
    if (!doc.content) return false
    let found = false
    const walk = (n: { content?: Array<{ text?: string }> }): void => {
      if (found) return
      if (n.content)
        n.content.forEach((c) => {
          if ('text' in c && c.text?.trim()) found = true
          else walk(c as never)
        })
    }
    doc.content.forEach(walk)
    return found
  } catch {
    return false
  }
}
