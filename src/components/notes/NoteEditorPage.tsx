'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { NotesEditor } from '@/components/notes/NotesEditor'
import { updateNote } from '@/lib/actions/notes-actions'
import type { Note } from '@/types/app'

interface NoteEditorPageProps {
  note: Note
}

const DEBOUNCE_MS = 300

function useDebouncedSave(
  noteId: string,
  title: string,
  content: Record<string, unknown>,
  isDirty: boolean
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSaved = useRef({ title, content: JSON.stringify(content) })

  useEffect(() => {
    if (!isDirty) return
    if (
      lastSaved.current.title === title &&
      lastSaved.current.content === JSON.stringify(content)
    ) {
      return
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      timeoutRef.current = null
      await updateNote(noteId, { title, content })
      lastSaved.current = { title, content: JSON.stringify(content) }
    }, DEBOUNCE_MS)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [noteId, title, content, isDirty])
}

const DEFAULT_DOC = { type: 'doc', content: [{ type: 'paragraph' }] }

export function NoteEditorPage({ note }: NoteEditorPageProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState<Record<string, unknown>>(
    note.content && Object.keys(note.content).length > 0 ? note.content : DEFAULT_DOC
  )
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    setTitle(note.title)
    setContent(
      note.content && Object.keys(note.content).length > 0 ? note.content : DEFAULT_DOC
    )
    setIsDirty(false)
  }, [note.id])

  const handleContentChange = useCallback((next: Record<string, unknown>) => {
    setContent(next)
    setIsDirty(true)
  }, [])

  const handleTitleChange = useCallback((next: string) => {
    setTitle(next)
    setIsDirty(true)
  }, [])

  useDebouncedSave(note.id, title, content, isDirty)

  return (
    <div className="flex flex-col mx-auto max-w-[720px] px-6 py-8 min-h-full">
      <div className="prose prose-neutral dark:prose-invert max-w-none flex flex-col flex-1">
        <NotesEditor
          content={content}
          onChange={handleContentChange}
          onTitleChange={handleTitleChange}
          placeholder="Write or type / for commands…"
          className="min-h-[420px] flex-1 border-0 bg-transparent shadow-none"
          toolbarWrapperClassName="-mx-6 -mt-8 px-6 pt-8 pb-2 rounded-t-none"
          titleSlot={
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setIsDirty(true)
              }}
              placeholder="Untitled Note"
              className="w-full bg-transparent text-xl font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          }
        />
      </div>
    </div>
  )
}
