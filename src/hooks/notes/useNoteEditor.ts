'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getNote, updateNote } from '@/lib/actions/notes-actions'
import type { Note, NoteStub } from '@/types/app'

interface UseNoteEditorOptions {
  initialOpenNoteId?: string | null
  setStubs: React.Dispatch<React.SetStateAction<NoteStub[]>>
}

/**
 * Manages the active note editor: selection, pending edits, and debounced saves.
 */
export const useNoteEditor = ({ initialOpenNoteId, setStubs }: UseNoteEditorOptions) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingTitle, setPendingTitle] = useState<string | null>(null)
  const [pendingContent, setPendingContent] = useState<Record<string, unknown> | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const selectNote = useCallback(async (id: string) => {
    if (id === selectedId) return
    const note = await getNote(id)
    if (note) { setCurrentNote(note); setSelectedId(id); setPendingTitle(null); setPendingContent(null) }
  }, [selectedId])

  // Open note from URL param
  useEffect(() => {
    if (initialOpenNoteId) selectNote(initialOpenNoteId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOpenNoteId])

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
  }, [currentNote, pendingContent, pendingTitle, setStubs])

  return {
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
  }
}
