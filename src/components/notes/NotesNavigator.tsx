'use client'

import { useState } from 'react'
import { FileText, Folder, BookOpen, Question, PushPin, Plus, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { createNoteFolder } from '@/lib/actions/notes-actions'

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
  collapsed: boolean
  onToggle: () => void
}

export function NotesNavigator({ folders, filter, onFilterChange, onFoldersChange, collapsed, onToggle }: NotesNavigatorProps) {
  const [newFolderName, setNewFolderName] = useState('')
  const [addingFolder, setAddingFolder] = useState(false)
  const [creating, setCreating] = useState(false)

  const is = (f: NavFilter) => JSON.stringify(filter) === JSON.stringify(f)

  const navBtn = (active: boolean) =>
    cn(
      'flex items-center gap-2.5 rounded-md transition-colors duration-100 w-full text-left text-[13px]',
      collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2',
      active
        ? 'bg-[#EEF2FC] text-[#1B3FC4] font-medium'
        : 'text-[#4A5568] hover:bg-[#EEF2FC]/60 hover:text-[#1B3FC4]',
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
    <nav className={cn(
      'flex h-full shrink-0 flex-col overflow-y-auto border-r border-[#D4DAE3] bg-white transition-all duration-200 ease-out',
      collapsed ? 'w-12' : 'w-[220px]',
    )}>
      {/* Collapse toggle — identical to NotesList */}
      <div className="flex shrink-0 items-center justify-end px-2 py-3">
        <button
          onClick={onToggle}
          className="flex items-center justify-center h-7 w-7 shrink-0 rounded-md text-[#8896A7] hover:text-[#1B3FC4] hover:bg-[#EEF2FC]/60 transition-colors duration-150"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <SCIcon icon={collapsed ? CaretRight : CaretLeft} size="sm" />
        </button>
      </div>

      {/* All notes + Pinned */}
      <div className={cn(collapsed ? 'px-1' : 'px-2')}>
        <button onClick={() => onFilterChange({ type: 'all' })} className={navBtn(is({ type: 'all' }))} title={collapsed ? 'All Notes' : undefined}>
          <SCIcon icon={FileText} size="sm" className="shrink-0" weight={is({ type: 'all' }) ? 'bold' : 'regular'} />
          {!collapsed && <span className="truncate flex-1">All Notes</span>}
        </button>
        <button onClick={() => onFilterChange({ type: 'pinned' })} className={navBtn(is({ type: 'pinned' }))} title={collapsed ? 'Pinned' : undefined}>
          <SCIcon icon={PushPin} size="sm" className="shrink-0" weight={is({ type: 'pinned' }) ? 'bold' : 'regular'} />
          {!collapsed && <span className="truncate flex-1">Pinned</span>}
        </button>
      </div>

      {/* Folders */}
      <div className={cn('mt-4', collapsed ? 'px-1' : 'px-2')}>
        <div className={cn('mb-1 flex items-center', collapsed ? 'justify-center' : 'justify-between px-1')}>
          {!collapsed && (
            <span className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B6B6B]">Folders</span>
          )}
          <button
            onClick={() => setAddingFolder(true)}
            className="rounded p-0.5 text-[#8896A7] hover:text-[#1B3FC4] transition-colors"
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
              title={collapsed ? f.name : undefined}
            >
              <SCIcon icon={Folder} size="sm" className="shrink-0" weight={active ? 'bold' : 'regular'} />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{f.name}</span>
                  {active && <SCIcon icon={CaretRight} size="xs" className="shrink-0 opacity-60" />}
                </>
              )}
            </button>
          )
        })}
        {addingFolder && !collapsed && (
          <form
            onSubmit={(e) => { e.preventDefault(); handleCreateFolder() }}
            className="mt-1 flex items-center gap-1 px-1"
          >
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setAddingFolder(false)}
              placeholder="Folder name..."
              className="flex-1 rounded border border-[#D4DAE3] bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3FC4]/20 focus:border-[#1B3FC4]"
            />
            <button
              type="submit"
              disabled={creating || !newFolderName.trim()}
              className="rounded-md bg-primary px-2 py-1 text-[11px] text-white disabled:opacity-40"
            >
              {creating ? '...' : 'Add'}
            </button>
          </form>
        )}
      </div>

      {/* By Source */}
      <div className={cn('mt-4', collapsed ? 'px-1' : 'px-2')}>
        {!collapsed && (
          <p className="mb-1 px-1 font-dm-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B6B6B]">By Source</p>
        )}
        <button onClick={() => onFilterChange({ type: 'source', source: 'wiki' })} className={navBtn(is({ type: 'source', source: 'wiki' }))} title={collapsed ? 'From Wiki' : undefined}>
          <SCIcon icon={BookOpen} size="sm" className="shrink-0" weight={is({ type: 'source', source: 'wiki' }) ? 'bold' : 'regular'} />
          {!collapsed && <span className="truncate flex-1">From Wiki</span>}
        </button>
        <button onClick={() => onFilterChange({ type: 'source', source: 'quiz' })} className={navBtn(is({ type: 'source', source: 'quiz' }))} title={collapsed ? 'From Quizzes' : undefined}>
          <SCIcon icon={Question} size="sm" className="shrink-0" weight={is({ type: 'source', source: 'quiz' }) ? 'bold' : 'regular'} />
          {!collapsed && <span className="truncate flex-1">From Quizzes</span>}
        </button>
      </div>
    </nav>
  )
}
