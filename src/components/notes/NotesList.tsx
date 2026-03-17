'use client'

import { useState } from 'react'
import { Plus, MagnifyingGlass, Trash, PushPin, BookOpen, Question, SquaresFour, Warning } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { NoteStub, NoteType } from '@/types/app'

const TYPE_BADGE: Partial<Record<NoteType, { label: string; icon: React.ComponentType<{ className?: string }> }>> = {
  cornell:      { label: 'Cornell', icon: SquaresFour },
  gap_analysis: { label: 'Gap',     icon: Warning },
}

interface NotesListProps {
  notes: NoteStub[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onPin: (id: string, pinned: boolean) => void
  searchQuery: string
  onSearchChange: (q: string) => void
}

export function NotesList({
  notes, selectedId, onSelect, onCreate, onDelete, onPin,
  searchQuery, onSearchChange,
}: NotesListProps) {
  const query = searchQuery.toLowerCase()
  const filtered = notes.filter((n) => {
    if (!query) return true
    return (
      n.title.toLowerCase().includes(query) ||
      n.snippet?.toLowerCase().includes(query) ||
      n.tags?.some((t) => t.toLowerCase().includes(query))
    )
  })

  return (
    <div className="flex h-full w-[268px] shrink-0 flex-col border-r border-border bg-white">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-2.5 border-b border-border px-3 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-zinc-800">Notes</span>
          <button
            onClick={onCreate}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
            title="New note"
          >
            <SCIcon icon={Plus} size="sm" />
          </button>
        </div>
        <div className="relative">
          <SCIcon icon={MagnifyingGlass} size="xs" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md bg-zinc-100 py-1.5 pl-8 pr-3 text-xs text-zinc-800 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300"
          />
        </div>
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <li className="py-10 text-center text-xs text-zinc-400">
            {searchQuery ? 'No matching notes' : 'No notes yet'}
          </li>
        ) : (
          filtered.map((note) => {
            const isSelected = selectedId === note.id
            const badge = note.note_type ? TYPE_BADGE[note.note_type] : null

            return (
              <li key={note.id} className="group relative">
                <button
                  onClick={() => onSelect(note.id)}
                  className={cn(
                    'flex w-full flex-col items-start gap-1.5 rounded-md mx-1 px-3 py-3 text-left transition-colors',
                    isSelected ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50',
                  )}
                  style={{ width: 'calc(100% - 8px)' }}
                >
                  {/* Title row */}
                  <div className="flex w-full items-center gap-1.5">
                    {/* Color dot */}
                    {note.color && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white"
                        style={{ backgroundColor: note.color }}
                      />
                    )}
                    <span className={cn(
                      'flex-1 truncate text-[13px] font-semibold leading-snug',
                      isSelected ? 'text-white' : 'text-zinc-900',
                    )}>
                      {note.title || 'Untitled Note'}
                    </span>
                    {note.is_pinned && (
                      <SCIcon icon={PushPin} size="xs" className={cn('shrink-0', isSelected ? 'text-zinc-300' : 'text-primary')} />
                    )}
                  </div>

                  {/* Snippet */}
                  {note.snippet && (
                    <span className={cn(
                      'line-clamp-2 text-[11px] leading-relaxed',
                      isSelected ? 'text-zinc-300' : 'text-zinc-400',
                    )}>
                      {note.snippet}
                    </span>
                  )}

                  {/* Meta row */}
                  <div className="flex w-full items-center gap-2">
                    <span className={cn('text-[11px]', isSelected ? 'text-zinc-400' : 'text-zinc-400')}>
                      {formatDistanceToNow(new Date(note.updated_at), { addSuffix: false })
                        .replace('about ', '')
                        .replace('less than a minute', 'now')}
                    </span>
                    {badge && (
                      <span className={cn(
                        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-zinc-100 text-zinc-500',
                      )}>
                        <badge.icon className="h-2.5 w-2.5" />
                        {badge.label}
                      </span>
                    )}
                    {note.article_id && (
                      <span className={cn('text-[11px]', isSelected ? 'text-[#5B7FE0]' : 'text-primary')} title="From Wiki">
                        <SCIcon icon={BookOpen} size="xs" />
                      </span>
                    )}
                    {note.question_id && (
                      <span className={cn('text-[11px]', isSelected ? 'text-amber-300' : 'text-amber-500')} title="From Quiz">
                        <SCIcon icon={Question} size="xs" />
                      </span>
                    )}
                  </div>
                </button>

                {/* Hover actions */}
                <div className={cn(
                  'absolute right-3 top-2.5 hidden items-center gap-0.5 group-hover:flex',
                  isSelected && 'hidden',
                )}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onPin(note.id, !note.is_pinned) }}
                    className="rounded p-1 text-zinc-300 hover:bg-zinc-100 hover:text-primary transition-colors"
                    title={note.is_pinned ? 'Unpin' : 'Pin'}
                  >
                    <SCIcon icon={PushPin} size="xs" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
                    className="rounded p-1 text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <SCIcon icon={Trash} size="xs" />
                  </button>
                </div>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
