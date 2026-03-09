'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Trash2 } from 'lucide-react'
import { getNotesList, createNote, deleteNote } from '@/lib/actions/notes'
import type { NoteStub } from '@/types/app'

interface NotesLayoutClientProps {
  initialNotes: NoteStub[]
  children: React.ReactNode
}

export function NotesLayoutClient({ initialNotes, children }: NotesLayoutClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [notes, setNotes] = useState<NoteStub[]>(initialNotes)

  const refreshNotes = useCallback(async () => {
    const list = await getNotesList()
    setNotes(list)
  }, [])

  useEffect(() => {
    refreshNotes()
  }, [pathname, refreshNotes])

  const handleCreateNote = useCallback(async () => {
    const result = await createNote()
    if ('error' in result) {
      return
    }
    router.push(`/dashboard/notes/${result.id}`)
  }, [router])

  const handleDeleteNote = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.preventDefault()
      e.stopPropagation()
      if (!confirm('Delete this note?')) return
      await deleteNote(id)
      const noteId = pathname.split('/').pop()
      if (noteId === id) router.push('/dashboard/notes')
      refreshNotes()
    },
    [pathname, refreshNotes, router]
  )

  const noteId = pathname.startsWith('/dashboard/notes/') && pathname !== '/dashboard/notes'
    ? pathname.replace('/dashboard/notes/', '')
    : null

  return (
    <>
      <aside className="w-[280px] shrink-0 flex flex-col border-r border-border bg-card shadow-sm">
        <div className="p-3 border-b border-border">
          <button
            type="button"
            onClick={handleCreateNote}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-signal-blue) py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            New Note
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {notes.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
              No notes yet. Create one above.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {notes.map((n) => {
                const isActive = noteId === n.id
                return (
                  <li key={n.id}>
                    <Link
                      href={`/dashboard/notes/${n.id}`}
                      className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        isActive ? 'bg-secondary' : 'hover:bg-secondary/60'
                      }`}
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {n.title || 'Untitled Note'}
                        </p>
                        {n.snippet && (
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {n.snippet}
                          </p>
                        )}
                        <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                          {new Date(n.updated_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNote(e, n.id)}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-color-signal-red"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </>
  )
}
