'use client'

import { useState, useEffect } from 'react'
import { getNotesList } from '@/lib/actions/notes-actions'
import type { NoteStub } from '@/types/app'
import type { NavFilter } from '@/components/notes/NotesNavigator'

/**
 * Manages the notes list: stubs state and filter-driven refetching.
 */
export const useNotesList = (initialNotes: NoteStub[], filter: NavFilter) => {
  const [stubs, setStubs] = useState<NoteStub[]>(initialNotes)

  // Refresh list when filter changes
  useEffect(() => {
    const folderId = filter.type === 'folder' ? filter.id : undefined
    getNotesList(folderId).then(setStubs)
  }, [filter])

  return { stubs, setStubs }
}
