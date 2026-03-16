'use client'

import { createContext, useContext, useState, useCallback } from 'react'

export interface NoteAnchor {
  topic_id?: string
  topic_name?: string
  question_id?: string
  question_text?: string
  article_id?: string
  article_title?: string
  session_id?: string
  source_url?: string
}

interface NoteContextValue {
  anchor: NoteAnchor
  setAnchor: (anchor: NoteAnchor) => void
  clearAnchor: () => void
  drawerOpen: boolean
  openDrawer: (anchor?: NoteAnchor) => void
  closeDrawer: () => void
}

const NoteContext = createContext<NoteContextValue>({
  anchor: {},
  setAnchor: () => {},
  clearAnchor: () => {},
  drawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
})

export function useNoteContext() {
  return useContext(NoteContext)
}

export function NoteContextProvider({ children }: { children: React.ReactNode }) {
  const [anchor, setAnchorState] = useState<NoteAnchor>({})
  const [drawerOpen, setDrawerOpen] = useState(false)

  const setAnchor = useCallback((next: NoteAnchor) => setAnchorState(next), [])
  const clearAnchor = useCallback(() => setAnchorState({}), [])

  const openDrawer = useCallback((next?: NoteAnchor) => {
    if (next) setAnchorState(next)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <NoteContext.Provider value={{ anchor, setAnchor, clearAnchor, drawerOpen, openDrawer, closeDrawer }}>
      {children}
    </NoteContext.Provider>
  )
}
