'use client'

import { useEffect } from 'react'
import { useNoteContext } from '@/lib/context/note-context'

interface WikiNoteAnchorProps {
  article_id: string
  article_title: string
  topic_id?: string
  topic_name?: string
  source_url: string
}

/**
 * Invisible component rendered inside the Wiki article page.
 * Sets the NoteContext anchor so QuickCaptureDrawer knows what article
 * the user is reading when they open Quick Note.
 */
export function WikiNoteAnchor({
  article_id,
  article_title,
  topic_id,
  topic_name,
  source_url,
}: WikiNoteAnchorProps) {
  const { setAnchor, clearAnchor } = useNoteContext()

  useEffect(() => {
    setAnchor({ article_id, article_title, topic_id, topic_name, source_url })
    return () => clearAnchor()
  }, [article_id, article_title, topic_id, topic_name, source_url, setAnchor, clearAnchor])

  return null
}
