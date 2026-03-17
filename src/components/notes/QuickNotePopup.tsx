'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DotsSixVertical, X } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { createNote } from '@/lib/actions/notes'
import { ROUTES } from '@/lib/constants/routes'
import { useDraggableFloatingPosition } from '@/lib/hooks/useDraggableFloatingPosition'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const POPUP_WIDTH = 380
const POPUP_HEIGHT = 320
const DEFAULT_RIGHT = 80
const DEFAULT_BOTTOM = 140

function textToTipTapDoc(text: string): Record<string, unknown> {
  const lines = text.split(/\n/).map((s) => s.trimEnd())
  if (lines.every((l) => !l)) return { type: 'doc', content: [] }
  const content = lines.map((line) => ({
    type: 'paragraph',
    content: line ? [{ type: 'text', text: line }] : [],
  }))
  return { type: 'doc', content }
}

interface QuickNotePopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickNotePopup({ open, onOpenChange }: QuickNotePopupProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const { style: floatStyle, onPointerDown: onDrag } =
    useDraggableFloatingPosition(
      'quick-note-popup',
      DEFAULT_RIGHT,
      DEFAULT_BOTTOM,
    )

  useEffect(() => {
    if (open) {
      setSavedId(null)
      setSaveError(null)
      setTitle('')
      setBody('')
      titleInputRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    const content = textToTipTapDoc(body)
    const result = await createNote({
      title: title.trim() || 'Untitled Note',
      content,
    })
    setSaving(false)
    if ('error' in result) {
      setSaveError(result.error)
      return
    }
    setSavedId(result.id)
  }

  if (!open || typeof document === 'undefined') return null

  const popup = (
    <div
      role='dialog'
      aria-label='Quick note'
      className={cn(
        'flex flex-col rounded-lg border border-[#E8E4DF] bg-white shadow-[0_1px_3px_rgba(26,26,26,0.06)]',
        'transition-all duration-150 ease-out',
      )}
      style={{
        ...floatStyle,
        width: POPUP_WIDTH,
        height: POPUP_HEIGHT,
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100vh - 24px)',
      }}
    >
      {/* Header: drag handle + label + close */}
      <div className='flex min-h-[44px] shrink-0 items-center gap-2 border-b border-[#E8E4DF] px-3 py-2'>
        <span
          role='button'
          tabIndex={0}
          onPointerDown={onDrag}
          className='flex h-10 w-10 shrink-0 cursor-grab active:cursor-grabbing touch-none items-center justify-center text-zinc-400 hover:text-zinc-600 rounded-sm'
          aria-label='Drag to move'
        >
          <SCIcon icon={DotsSixVertical} size='sm' />
        </span>
        <span className='min-w-0 flex-1 text-sm font-medium text-zinc-900'>
          Quick note
        </span>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 shrink-0 rounded-sm'
          onClick={() => onOpenChange(false)}
          aria-label='Close'
        >
          <SCIcon icon={X} size='sm' />
        </Button>
      </div>

      {/* Body: title + textarea */}
      <div className='flex min-h-0 flex-1 flex-col gap-2 p-3'>
        <input
          ref={titleInputRef}
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Title'
          className='w-full rounded border border-[#E8E4DF] bg-white px-3 py-2 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-zinc-300'
          aria-label='Note title'
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='Write something…'
          className='min-h-0 flex-1 resize-none rounded border border-[#E8E4DF] bg-white px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 outline-none transition-colors focus:border-zinc-300'
          aria-label='Note content'
          rows={4}
        />
      </div>

      {/* Footer: save + open link */}
      <div className='flex shrink-0 flex-col gap-2 border-t border-[#E8E4DF] p-3'>
        {saveError && (
          <p className='text-xs text-red-600' role='alert'>
            {saveError}
          </p>
        )}
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            onClick={handleSave}
            disabled={saving}
            className='rounded-md bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-[#1535A8] transition-colors'
          >
            {saving ? 'Saving…' : 'Save to notes'}
          </Button>
          {savedId && (
            <a
              href={`${ROUTES.NOTES}?open=${encodeURIComponent(savedId)}`}
              className='text-xs font-medium text-primary hover:underline'
            >
              Open in Notes
            </a>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(popup, document.body)
}
