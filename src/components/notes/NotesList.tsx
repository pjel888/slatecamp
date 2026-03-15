'use client'

import { Plus, Search, Trash2 } from 'lucide-react'
import { type Note } from '@/lib/actions/notes-actions'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface NotesListProps {
  notes: Note[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function NotesList({
  notes,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  searchQuery,
  onSearchChange,
}: NotesListProps) {
  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase()
    const title = (note.title || 'New Note').toLowerCase()
    const contentText = JSON.stringify(note.content).toLowerCase()
    return title.includes(query) || contentText.includes(query)
  })

  // Helper to extract preview text from TipTap JSON
  const getPreview = (content: any) => {
    if (!content || !content.content) return 'No additional text'
    try {
      const text = content.content
        .map((block: any) => 
          block.content?.map((span: any) => span.text).join('') || ''
        )
        .join(' ')
      return text.slice(0, 60) || 'No additional text'
    } catch (e) {
      return 'No additional text'
    }
  }

  return (
    <div className="flex h-full w-[260px] flex-col border-r border-border bg-[#FAF9F7]">
      {/* Header */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900">Notes</span>
          <button
            onClick={onCreate}
            className="rounded p-1 text-zinc-500 hover:bg-black/5 hover:text-zinc-900 transition-colors"
            title="New Note"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border-none bg-zinc-200/50 py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-200"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filteredNotes.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            {searchQuery ? 'No matching notes' : 'No notes yet'}
          </div>
        ) : (
          <ul className="space-y-0.5">
            {filteredNotes.map((note) => {
              const isSelected = selectedId === note.note_id
              return (
                <li key={note.note_id} className="group relative">
                  <button
                    onClick={() => onSelect(note.note_id)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 rounded-lg px-4 py-3 text-left transition-colors",
                      isSelected ? "bg-[#FFF3B0]" : "hover:bg-black/5"
                    )}
                  >
                    <span className={cn(
                      "w-full truncate text-[13px] font-bold leading-tight",
                      isSelected ? "text-zinc-900" : "text-zinc-900"
                    )}>
                      {note.title || 'New Note'}
                    </span>
                    <div className="flex w-full items-center gap-2">
                      <span className="shrink-0 text-[11px] text-zinc-500">
                        {formatDistanceToNow(new Date(note.updated_at), { addSuffix: false })
                          .replace('about ', '')
                          .replace('less than a minute', 'now')}
                      </span>
                      <span className="block flex-1 truncate text-[12px] text-zinc-400">
                        {getPreview(note.content)}
                      </span>
                    </div>
                  </button>
                  
                  {/* Delete Action - Visible on Hover/Selected */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(note.note_id)
                    }}
                    className={cn(
                      "absolute right-2 top-2 hidden rounded p-1 text-zinc-400 hover:bg-red-100 hover:text-red-600",
                      "group-hover:block"
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
