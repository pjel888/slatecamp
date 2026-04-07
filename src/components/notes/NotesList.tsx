'use client'

import { Plus, MagnifyingGlass, Trash, PushPin, BookOpen, Question, SquaresFour, Warning, CaretLeft, CaretRight, FileText, BookmarkSimple } from '@phosphor-icons/react/dist/ssr'
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
      'flex h-full shrink-0 flex-col border-r border-border bg-card transition-all duration-200 ease-out',
      collapsed ? 'w-12' : 'w-[268px]',
    )}>
      {/* Collapse toggle — identical to NotesNavigator */}
      <div className="flex shrink-0 items-center justify-end px-2 py-3">
        <button
          onClick={onToggle}
          className="flex items-center justify-center h-7 w-7 shrink-0 rounded-md text-text-tertiary hover:text-camp-cobalt hover:bg-primary-50/60 transition-colors duration-150"
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
            className="flex items-center justify-center h-7 w-7 rounded-md text-text-tertiary hover:bg-primary-50 hover:text-camp-cobalt transition-colors"
            title="New note"
          >
            <SCIcon icon={Plus} size="sm" />
          </button>
          <div className="flex items-center justify-center h-7 w-7 text-text-tertiary" title="Notes list">
            <SCIcon icon={FileText} size="sm" />
          </div>
          {notes.length > 0 && (
            <span className="text-[11px] font-medium text-text-tertiary">{notes.length}</span>
          )}
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex shrink-0 flex-col gap-2.5 border-b border-border px-3 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-text-primary">Notes</span>
              <button
                onClick={onCreate}
                className="rounded-md p-1 text-text-tertiary hover:bg-primary-50 hover:text-camp-cobalt transition-colors"
                title="New note"
              >
                <SCIcon icon={Plus} size="sm" />
              </button>
            </div>
            <div className="relative">
              <SCIcon icon={MagnifyingGlass} size="xs" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-md bg-muted py-1.5 pl-8 pr-3 text-xs text-text-primary border border-border placeholder:text-text-tertiary focus:bg-card focus:outline-none focus:ring-2 focus:ring-camp-cobalt/20 focus:border-camp-cobalt transition-all duration-150"
              />
            </div>
          </div>

          {/* List */}
          <ul className="flex-1 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="py-10 text-center text-xs text-text-tertiary">
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
                          ? 'bg-primary-50'
                          : 'hover:bg-camp-cobalt/[0.04]',
                        note.is_virtual && !isSelected && 'bg-muted/50',
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
                          isSelected ? 'text-camp-cobalt' : 'text-text-primary',
                        )}>
                          {note.title || 'Untitled Note'}
                        </span>
                        {note.is_pinned && (
                          <SCIcon icon={PushPin} size="xs" className="shrink-0 text-primary" />
                        )}
                        {note.is_virtual && (
                          <SCIcon icon={BookmarkSimple} size="xs" weight="fill" className="shrink-0 text-primary/60" />
                        )}
                      </div>

                      {/* Snippet */}
                      {(note.snippet || note.is_virtual) && (
                        <span className="line-clamp-2 text-[11px] leading-relaxed text-text-secondary italic">
                          {note.is_virtual ? 'Bookmarked Wiki Article' : note.snippet}
                        </span>
                      )}

                      {/* Meta row */}
                      <div className="flex w-full items-center gap-2">
                        <span className="text-[11px] text-text-tertiary">
                          {formatDistanceToNow(new Date(note.updated_at), { addSuffix: false })
                            .replace('about ', '')
                            .replace('less than a minute', 'now')}
                        </span>
                        {badge && (
                          <span className={cn(
                            'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                            isSelected
                              ? 'bg-camp-cobalt/10 text-camp-cobalt'
                              : 'bg-muted text-text-secondary',
                          )}>
                            <badge.icon className="h-2.5 w-2.5" />
                            {badge.label}
                          </span>
                        )}
                        {note.article_id && (
                          <span className={cn("text-[11px]", note.is_virtual ? "text-primary/60" : "text-primary")} title={note.is_virtual ? "Bookmarked" : "From Wiki"}>
                            <SCIcon icon={note.is_virtual ? BookmarkSimple : BookOpen} size="xs" weight={note.is_virtual ? "fill" : "regular"} />
                          </span>
                        )}
                        {note.question_id && (
                          <span className="text-[11px] text-warning" title="From Quiz">
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
                      {!note.is_virtual && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onPin(note.id, !note.is_pinned) }}
                          className="rounded p-1 text-border hover:bg-primary-50 hover:text-primary transition-colors"
                          title={note.is_pinned ? 'Unpin' : 'Pin'}
                        >
                          <SCIcon icon={PushPin} size="xs" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
                        className="rounded p-1 text-border hover:bg-destructive-50 hover:text-destructive transition-colors"
                        title={note.is_virtual ? 'Remove Bookmark' : 'Delete'}
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
