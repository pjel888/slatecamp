'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Link2,
  FileText,
  ChevronRight,
  FolderOpen,
  Sparkles,
} from 'lucide-react'
import { getNotesList, getNote, createNote, updateNote, deleteNote } from '@/lib/actions/notes'
import { NotesEditor } from '@/components/notes/NotesEditor'
import { WIKI_SUBJECT_ICONS, DEFAULT_WIKI_ICON } from '@/components/wiki/wiki-icons'
import type { WikiCategory } from '@/types/app'
import type { Note, NoteStub } from '@/types/app'

const DEBOUNCE_MS = 800

interface NotesShellProps {
  tree: WikiCategory[]
  children?: React.ReactNode
}

export function NotesShell({ tree }: NotesShellProps) {
  const router = useRouter()
  const [subjectId, setSubjectId] = useState<string | null>(tree[0]?.id ?? null)
  const [notes, setNotes] = useState<NoteStub[]>([])
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingContent, setPendingContent] = useState<Record<string, unknown> | null>(null)
  const [pendingTitle, setPendingTitle] = useState<string | null>(null)
  const [agentResult, setAgentResult] = useState<string | null>(null)
  const [agentLoading, setAgentLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadNotes = useCallback(async () => {
    const list = await getNotesList(subjectId)
    setNotes(list)
  }, [subjectId])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  const openNote = useCallback(async (id: string) => {
    const note = await getNote(id)
    setCurrentNote(note)
    setPendingTitle(null)
    setPendingContent(null)
  }, [])

  const handleCreateNote = useCallback(async () => {
    if (!subjectId) return
    const result = await createNote({ subject_id: subjectId })
    if ('error' in result) return
    router.refresh()
    await loadNotes()
    openNote(result.id)
  }, [subjectId, loadNotes, openNote, router])

  const handleDeleteNote = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      if (!confirm('Delete this note?')) return
      await deleteNote(id)
      if (currentNote?.id === id) setCurrentNote(null)
      router.refresh()
      loadNotes()
    },
    [currentNote?.id, loadNotes, router]
  )

  const persistNote = useCallback(
    async (id: string, title: string, content: Record<string, unknown>) => {
      setSaving(true)
      const err = await updateNote(id, { title, content })
      setSaving(false)
      if (!err.error) {
        router.refresh()
        loadNotes()
      }
    },
    [loadNotes, router]
  )

  useEffect(() => {
    if (!currentNote || !pendingContent && !pendingTitle) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      const title = pendingTitle ?? currentNote.title
      const content = pendingContent ?? currentNote.content as Record<string, unknown>
      persistNote(currentNote.id, title, content)
      setPendingTitle(null)
      setPendingContent(null)
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [currentNote, pendingContent, pendingTitle, persistNote])

  const handleContentChange = useCallback((content: Record<string, unknown>) => {
    setPendingContent(content)
  }, [])

  const handleTitleChange = useCallback((title: string) => {
    setPendingTitle(title)
  }, [])

  function extractPlainTextFromContent(json: Record<string, unknown>): string {
    const doc = json as { type?: string; content?: Array<{ type?: string; content?: Array<{ text?: string }> }> }
    if (!doc.content) return ''
    function walk(n: { content?: Array<{ text?: string }> }): string {
      if (n.content) return n.content.map((c) => ('text' in c && c.text) || walk(c as never)).join('')
      return ''
    }
    return doc.content.map((n) => walk(n)).join('\n')
  }

  const runStudyAgent = useCallback(
    async (action: 'summarize' | 'flashcards' | 'code_check') => {
      if (!currentNote) return
      const content = extractPlainTextFromContent(
        (pendingContent ?? currentNote.content) as Record<string, unknown>
      )
      if (!content.trim()) {
        alert('Add some note content first.')
        return
      }
      setAgentLoading(true)
      try {
        const res = await fetch('/api/ai/study-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, content }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Request failed')
        setAgentResult(data.text ?? '')
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Study agent failed')
      } finally {
        setAgentLoading(false)
      }
    },
    [currentNote, pendingContent]
  )

  const togglePin = useCallback(
    async (e: React.MouseEvent, id: string, isPinned: boolean) => {
      e.stopPropagation()
      await updateNote(id, { is_pinned: !isPinned })
      router.refresh()
      loadNotes()
      if (currentNote?.id === id) setCurrentNote((n) => n ? { ...n, is_pinned: !isPinned } : null)
    },
    [currentNote, loadNotes, router]
  )

  const filteredNotes = search.trim()
    ? notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()))
    : notes

  return (
    <div className="flex w-full flex-1 overflow-hidden bg-muted/30">
      {/* Column 1: Subjects */}
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-3 py-3">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Subjects</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Wiki categories</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {tree.map((cat) => (
            <SubjectRow
              key={cat.id}
              category={cat}
              subjectId={subjectId}
              onSelect={setSubjectId}
            />
          ))}
        </nav>
      </aside>

      {/* Column 2: Notes list */}
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Notes</h2>
            <button
              type="button"
              onClick={handleCreateNote}
              disabled={!subjectId}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-signal-blue) text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              title="New note"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto p-2">
          {filteredNotes.length === 0 ? (
            <li className="px-2 py-6 text-center text-[13px] text-muted-foreground">
              {subjectId ? 'No notes yet. Create one.' : 'Select a subject.'}
            </li>
          ) : (
            filteredNotes.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => openNote(note.id)}
                  className={`flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    currentNote?.id === note.id ? 'bg-secondary' : 'hover:bg-secondary/60'
                  }`}
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {note.title || 'Untitled'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => togglePin(e, note.id, note.is_pinned)}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      title={note.is_pinned ? 'Unpin' : 'Pin'}
                    >
                      {note.is_pinned ? (
                        <Pin className="h-3.5 w-3.5 fill-current" strokeWidth={1.5} />
                      ) : (
                        <PinOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNote(e, note.id)}
                      className="rounded p-1 text-muted-foreground hover:text-color-signal-red"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>

      {/* Column 3: Editor */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-[720px] px-6 py-8">
          {currentNote ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-4">
                <input
                  type="text"
                  value={pendingTitle ?? currentNote.title}
                  onChange={(e) => setPendingTitle(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-xl font-semibold text-foreground tracking-tight focus:outline-none focus:ring-0"
                  placeholder="Note title"
                />
                {saving && (
                  <span className="text-[11px] text-muted-foreground">Saving…</span>
                )}
                {currentNote.linked_wiki_page_id && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Link2 className="h-3 w-3" strokeWidth={1.5} />
                    Linked
                  </span>
                )}
              </div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Study Agent
                </span>
                <button
                  type="button"
                  onClick={() => runStudyAgent('summarize')}
                  disabled={agentLoading}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  Summarize & atomicize
                </button>
                <button
                  type="button"
                  onClick={() => runStudyAgent('flashcards')}
                  disabled={agentLoading}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  Generate flashcards
                </button>
                <button
                  type="button"
                  onClick={() => runStudyAgent('code_check')}
                  disabled={agentLoading}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  Code check
                </button>
              </div>
              <NotesEditor
                content={currentNote.content as Record<string, unknown>}
                onChange={handleContentChange}
                onTitleChange={handleTitleChange}
                placeholder="Type / for commands, or use the toolbar when you select text."
                agentResult={agentResult}
                onAgentResultConsumed={() => setAgentResult(null)}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" strokeWidth={1} />
              <p className="mt-4 text-sm font-medium text-foreground">Select a note or create one</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Your notes are organized by Wiki subject.
              </p>
              <button
                type="button"
                onClick={handleCreateNote}
                disabled={!subjectId}
                className="mt-6 rounded-lg bg-(--color-signal-blue) px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                New note
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SubjectRow({
  category,
  subjectId,
  onSelect,
  depth = 0,
}: {
  category: WikiCategory
  subjectId: string | null
  onSelect: (id: string) => void
  depth?: number
}) {
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = (category.children?.length ?? 0) > 0
  const isRoot = depth === 0
  const Icon = isRoot ? (WIKI_SUBJECT_ICONS[category.slug] ?? DEFAULT_WIKI_ICON) : FolderOpen
  const isSelected = subjectId === category.id

  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
          isSelected ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="shrink-0"
          >
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
              strokeWidth={1.5}
            />
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onSelect(category.id)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          <span className="truncate">{category.name}</span>
        </button>
      </div>
      {expanded &&
        (category.children ?? []).map((child) => (
          <SubjectRow
            key={child.id}
            category={child}
            subjectId={subjectId}
            onSelect={onSelect}
            depth={depth + 1}
          />
        ))}
    </div>
  )
}
