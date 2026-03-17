'use client'

import { useState } from 'react'
import { FileText, Folder, BookOpen, Question, PushPin, Plus, CaretRight } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { createNoteFolder } from '@/lib/actions/notes'

export type NavFilter =
  | { type: 'all' }
  | { type: 'pinned' }
  | { type: 'folder'; id: string; name: string }
  | { type: 'source'; source: 'wiki' | 'quiz' }
  | { type: 'topic'; id: string; name: string }

interface Folder { folder_id: string; name: string }

interface NotesNavigatorProps {
  folders: Folder[]
  filter: NavFilter
  onFilterChange: (f: NavFilter) => void
  onFoldersChange: (folders: Folder[]) => void
}

export function NotesNavigator({ folders, filter, onFilterChange, onFoldersChange }: NotesNavigatorProps) {
  const [newFolderName, setNewFolderName] = useState('')
  const [addingFolder, setAddingFolder] = useState(false)
  const [creating, setCreating] = useState(false)

  const is = (f: NavFilter) => JSON.stringify(filter) === JSON.stringify(f)

  const navBtn = (active: boolean) =>
    cn(
      'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors text-left',
      active ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
    )

  const handleCreateFolder = async () => {
    const name = newFolderName.trim()
    if (!name) return
    setCreating(true)
    const result = await createNoteFolder(name)
    setCreating(false)
    if (result && 'folder_id' in result) {
      onFoldersChange([...folders, result as Folder])
    }
    setNewFolderName('')
    setAddingFolder(false)
  }

  return (
    <nav className="flex h-full w-[220px] shrink-0 flex-col overflow-y-auto border-r border-border bg-zinc-50/80 py-3">
      {/* All notes */}
      <div className="px-2">
        <button onClick={() => onFilterChange({ type: 'all' })} className={navBtn(is({ type: 'all' }))}>
          <SCIcon icon={FileText} size="sm" className="shrink-0" />
          All Notes
        </button>
        <button onClick={() => onFilterChange({ type: 'pinned' })} className={navBtn(is({ type: 'pinned' }))}>
          <SCIcon icon={PushPin} size="sm" className="shrink-0" />
          Pinned
        </button>
      </div>

      {/* Folders */}
      <div className="mt-4 px-2">
        <div className="mb-1 flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Folders</span>
          <button
            onClick={() => setAddingFolder(true)}
            className="rounded p-0.5 text-zinc-400 hover:text-zinc-700 transition-colors"
            title="New folder"
          >
            <SCIcon icon={Plus} size="xs" />
          </button>
        </div>
        {folders.map((f) => {
          const active = is({ type: 'folder', id: f.folder_id, name: f.name })
          return (
            <button
              key={f.folder_id}
              onClick={() => onFilterChange({ type: 'folder', id: f.folder_id, name: f.name })}
              className={navBtn(active)}
            >
              <SCIcon icon={Folder} size="sm" className="shrink-0" />
              <span className="flex-1 truncate">{f.name}</span>
              {active && <SCIcon icon={CaretRight} size="xs" className="shrink-0 opacity-60" />}
            </button>
          )
        })}
        {addingFolder && (
          <form
            onSubmit={(e) => { e.preventDefault(); handleCreateFolder() }}
            className="mt-1 flex items-center gap-1 px-1"
          >
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setAddingFolder(false)}
              placeholder="Folder name…"
              className="flex-1 rounded border border-zinc-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={creating || !newFolderName.trim()}
              className="rounded-md bg-primary px-2 py-1 text-[11px] text-white disabled:opacity-40"
            >
              {creating ? '…' : 'Add'}
            </button>
          </form>
        )}
      </div>

      {/* By Source */}
      <div className="mt-4 px-2">
        <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">By Source</p>
        <button onClick={() => onFilterChange({ type: 'source', source: 'wiki' })} className={navBtn(is({ type: 'source', source: 'wiki' }))}>
          <SCIcon icon={BookOpen} size="sm" className="shrink-0" />
          From Wiki
        </button>
        <button onClick={() => onFilterChange({ type: 'source', source: 'quiz' })} className={navBtn(is({ type: 'source', source: 'quiz' }))}>
          <SCIcon icon={Question} size="sm" className="shrink-0" />
          From Quizzes
        </button>
      </div>
    </nav>
  )
}
