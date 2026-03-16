'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { GripVertical, X, ExternalLink } from 'lucide-react'
import { createNote } from '@/lib/actions/notes'
import { ROUTES } from '@/lib/constants/routes'
import { useNoteContext } from '@/lib/context/note-context'
import { useDraggableFloatingPosition } from '@/lib/hooks/useDraggableFloatingPosition'
import { ContextBadge } from '@/components/notes/ContextBadge'
import { TemplatePicker } from '@/components/notes/TemplatePicker'
import { NotesEditor } from '@/components/notes/NotesEditor'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { NoteType } from '@/types/app'

const MODAL_WIDTH  = 420
const MODAL_HEIGHT = 480
const DEFAULT_RIGHT  = 'center' as const
const DEFAULT_BOTTOM = 160

const EMPTY_DOC = { type: 'doc', content: [{ type: 'paragraph' }] }

interface QuickCaptureDrawerProps {
  userId?: string
}

export function QuickCaptureDrawer({ userId }: QuickCaptureDrawerProps) {
  const { anchor, drawerOpen, closeDrawer } = useNoteContext()

  const [title, setTitle]     = useState('')
  const [content, setContent] = useState<Record<string, unknown>>(EMPTY_DOC)
  const [noteType, setNoteType] = useState<NoteType>('quick_capture')
  const [savedId, setSavedId]   = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const hasQuestionContext = Boolean(anchor.question_id)

  const { style: floatStyle, onPointerDown: onDrag } = useDraggableFloatingPosition(
    'quick-capture-modal',
    DEFAULT_RIGHT,
    DEFAULT_BOTTOM,
  )

  // Reset state on open
  useEffect(() => {
    if (drawerOpen) {
      setTitle('')
      setContent(EMPTY_DOC)
      setNoteType(hasQuestionContext ? 'gap_analysis' : 'quick_capture')
      setSavedId(null)
      setSaveError(null)
      setTimeout(() => titleInputRef.current?.focus(), 80)
    }
  }, [drawerOpen, hasQuestionContext])

  // Keyboard shortcuts
  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen, title, content, noteType])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaveError(null)
    const result = await createNote({
      title:      title.trim() || 'Untitled Note',
      content,
      note_type:  noteType,
      topic_id:   anchor.topic_id,
      question_id: anchor.question_id,
      article_id: anchor.article_id,
      session_id: anchor.session_id,
      source_url: anchor.source_url,
    })
    setSaving(false)
    if ('error' in result) { setSaveError(result.error); return }
    setSavedId(result.id)
  }, [title, content, noteType, anchor])

  if (typeof document === 'undefined') return null

  const hasAnchor = Boolean(anchor.topic_id || anchor.article_id || anchor.question_id)

  const modal = (
    <>

      {/* Floating modal */}
      <div
        role="dialog"
        aria-label="Quick capture"
        aria-modal="true"
        style={{
          ...floatStyle,
          width:     MODAL_WIDTH,
          maxWidth:  'calc(100vw - 24px)',
          maxHeight: 'calc(100vh - 24px)',
          display:   drawerOpen ? 'flex' : 'none',
        }}
        className={cn(
          'flex-col rounded-xl border border-border bg-background',
          'shadow-[0_8px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/5',
        )}
      >
        {/* ── Header: drag handle + title + close ── */}
        <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-2">
          <span
            role="button"
            tabIndex={0}
            onPointerDown={onDrag}
            className="flex h-8 w-8 shrink-0 cursor-grab active:cursor-grabbing touch-none items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 transition-colors"
            aria-label="Drag to move"
          >
            <GripVertical className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="flex-1 text-[13px] font-semibold text-foreground">Quick Capture</span>
          <button
            type="button"
            onClick={closeDrawer}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-muted hover:text-zinc-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Context badge ── */}
        {hasAnchor && (
          <div className="shrink-0 border-b border-border/60 bg-muted/40 px-3 py-2">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Anchored to
            </p>
            <ContextBadge anchor={anchor} />
          </div>
        )}

        {/* ── Template picker ── */}
        <div className="shrink-0 border-b border-border/60 px-3 py-2.5">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Note type
          </p>
          <TemplatePicker
            value={noteType}
            onChange={setNoteType}
            disableGap={!hasQuestionContext}
          />
        </div>

        {/* ── Title ── */}
        <div className="shrink-0 border-b border-border/60 px-3 py-2">
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title…"
            className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Note title"
          />
        </div>

        {/* ── Rich editor ── */}
        <div className="min-h-0 flex-1 overflow-y-auto" style={{ height: MODAL_HEIGHT - 220 }}>
          {drawerOpen && (
            <NotesEditor
              content={content}
              onChange={setContent}
              userId={userId}
              compact
              placeholder="Start writing… (select text to format)"
              className="h-full"
            />
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-border px-3 py-2.5">
          {saveError && (
            <p className="mb-1.5 text-xs text-red-600" role="alert">{saveError}</p>
          )}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="rounded-md bg-zinc-900 text-xs font-medium text-white hover:bg-zinc-700"
            >
              {saving ? 'Saving…' : 'Save note'}
            </Button>
            {savedId ? (
              <a
                href={`${ROUTES.NOTES}?open=${encodeURIComponent(savedId)}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
              >
                Open in Notes
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-[11px] text-muted-foreground select-none">
                ⌘↵ save · Esc close
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(modal, document.body)
}
