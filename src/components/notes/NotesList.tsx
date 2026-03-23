'use client'

import { Plus, MagnifyingGlass, Trash, PushPin, BookOpen, Question, SquaresFour, Warning, CaretLeft, CaretRight, FileText } from '@phosphor-icons/react'
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
  collapsed: boolean
  onToggle: () => void
}

export function NotesList({
  notes, selectedId, onSelect, onCreate, onDelete, onPin,
  searchQuery, onSearchChange, collapsed, onToggle,
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
    <div className={cn(
      'flex h-full shrink-0 flex-col border-r border-[#D4DAE3] bg-white transition-all duration-200 ease-out',
      collapsed ? 'w-12' : 'w-[268px]',
    )}>
      {/* Collapse toggle — identical to NotesNavigator */}
      <div className="flex shrink-0 items-center justify-end px-2 py-3">
        <button
          onClick={onToggle}
          className="flex items-center justify-center h-7 w-7 shrink-0 rounded-md text-[#8896A7] hover:text-[#1B3FC4] hover:bg-[#EEF2FC]/60 transition-colors duration-150"
          aria-label={collapsed ? 'Expand notes list' : 'Collapse notes list'}
        >
          <SCIcon icon={collapsed ? CaretRight : CaretLeft} size="sm" />
        </button>
      </div>

      {collapsed ? (
        /* Collapsed: icon-only strip */
        <div className="flex flex-1 flex-col items-center gap-3 pt-2">
          <button
            onClick={onCreate}
            className="flex items-center justify-center h-7 w-7 rounded-md text-[#8896A7] hover:bg-[#EEF2FC] hover:text-[#1B3FC4] transition-colors"
            title="New note"
          >
            <SCIcon icon={Plus} size="sm" />
          </button>
          <div className="flex items-center justify-center h-7 w-7 text-[#8896A7]" title="Notes list">
            <SCIcon icon={FileText} size="sm" />
          </div>
          {notes.length > 0 && (
            <span className="text-[11px] font-medium text-[#8896A7]">{notes.length}</span>
          )}
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex shrink-0 flex-col gap-2.5 border-b border-[#D4DAE3] px-3 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#1A2332]">Notes</span>
              <button
                onClick={onCreate}
                className="rounded-md p-1 text-[#8896A7] hover:bg-[#EEF2FC] hover:text-[#1B3FC4] transition-colors"
                title="New note"
              >
                <SCIcon icon={Plus} size="sm" />
              </button>
            </div>
            <div className="relative">
              <SCIcon icon={MagnifyingGlass} size="xs" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8896A7] pointer-events-none" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-md bg-[#F5F5F5] py-1.5 pl-8 pr-3 text-xs text-[#1A2332] border border-[#D4DAE3] placeholder:text-[#8896A7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3FC4]/20 focus:border-[#1B3FC4] transition-all duration-150"
              />
            </div>
          </div>

          {/* List */}
          <ul className="flex-1 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="py-10 text-center text-xs text-[#8896A7]">
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
                        'flex w-full flex-col items-start gap-1.5 rounded-md mx-1 px-3 py-3 text-left transition-colors duration-100',
                        isSelected
                          ? 'bg-[#EEF2FC]'
                          : 'hover:bg-[#1B3FC4]/[0.04]',
                      )}
                      style={{ width: 'calc(100% - 8px)' }}
                    >
                      {/* Title row */}
                      <div className="flex w-full items-center gap-1.5">
                        {note.color && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white"
                            style={{ backgroundColor: note.color }}
                          />
                        )}
                        <span className={cn(
                          'flex-1 truncate text-[13px] font-semibold leading-snug',
                          isSelected ? 'text-[#1B3FC4]' : 'text-[#1A2332]',
                        )}>
                          {note.title || 'Untitled Note'}
                        </span>
                        {note.is_pinned && (
                          <SCIcon icon={PushPin} size="xs" className="shrink-0 text-primary" />
                        )}
                      </div>

                      {/* Snippet */}
                      {note.snippet && (
                        <span className="line-clamp-2 text-[11px] leading-relaxed text-[#4A5568]">
                          {note.snippet}
                        </span>
                      )}

                      {/* Meta row */}
                      <div className="flex w-full items-center gap-2">
                        <span className="text-[11px] text-[#8896A7]">
                          {formatDistanceToNow(new Date(note.updated_at), { addSuffix: false })
                            .replace('about ', '')
                            .replace('less than a minute', 'now')}
                        </span>
                        {badge && (
                          <span className={cn(
                            'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                            isSelected
                              ? 'bg-[#1B3FC4]/10 text-[#1B3FC4]'
                              : 'bg-[#F5F5F5] text-[#4A5568]',
                          )}>
                            <badge.icon className="h-2.5 w-2.5" />
                            {badge.label}
                          </span>
                        )}
                        {note.article_id && (
                          <span className="text-[11px] text-primary" title="From Wiki">
                            <SCIcon icon={BookOpen} size="xs" />
                          </span>
                        )}
                        {note.question_id && (
                          <span className="text-[11px] text-[#D4951A]" title="From Quiz">
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
                        className="rounded p-1 text-[#D4DAE3] hover:bg-[#EEF2FC] hover:text-primary transition-colors"
                        title={note.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        <SCIcon icon={PushPin} size="xs" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
                        className="rounded p-1 text-[#D4DAE3] hover:bg-[#FDF0F0] hover:text-[#D64545] transition-colors"
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
        </>
      )}
    </div>
  )
}
