'use client'

import { useState } from 'react'
import { FileText, Folder, BookOpen, Question, PushPin, Plus, CaretLeft, CaretRight, BookmarkSimple } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { createNoteFolder } from '@/lib/actions/notes-actions'
import { Button } from '@/components/ui/button'

export type NavFilter =
  | { type: 'all' }
  | { type: 'pinned' }
  | { type: 'bookmarks' }
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
        ? 'bg-primary-50 text-camp-cobalt font-medium'
        : 'text-text-secondary hover:bg-primary-50/60 hover:text-camp-cobalt',
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
      'flex h-full shrink-0 flex-col overflow-y-auto border-r border-border bg-card transition-all duration-200 ease-out',
      collapsed ? 'w-12' : 'w-[220px]',
    )}>
      {/* Collapse toggle — identical to NotesList */}
      <div className="flex shrink-0 items-center justify-end px-2 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <SCIcon icon={collapsed ? CaretRight : CaretLeft} size="sm" />
        </Button>
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
        <button onClick={() => onFilterChange({ type: 'bookmarks' })} className={navBtn(is({ type: 'bookmarks' }))} title={collapsed ? 'Wiki Bookmarks' : undefined}>
          <SCIcon icon={BookmarkSimple} size="sm" className="shrink-0" weight={is({ type: 'bookmarks' }) ? 'bold' : 'regular'} />
          {!collapsed && <span className="truncate flex-1">Wiki Bookmarks</span>}
        </button>
      </div>

      {/* Folders */}
      <div className={cn('mt-4', collapsed ? 'px-1' : 'px-2')}>
        <div className={cn('mb-1 flex items-center', collapsed ? 'justify-center' : 'justify-between px-1')}>
          {!collapsed && (
            <span className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.2em] text-text-2">Folders</span>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setAddingFolder(true)}
            title="New folder"
          >
            <SCIcon icon={Plus} size="xs" />
          </Button>
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
              className="flex-1 rounded border border-border bg-card px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-camp-cobalt/20 focus:border-camp-cobalt"
            />
            <Button
              type="submit"
              size="xs"
              disabled={creating || !newFolderName.trim()}
              loading={creating}
            >
              Add
            </Button>
          </form>
        )}
      </div>

      {/* By Source */}
      <div className={cn('mt-4', collapsed ? 'px-1' : 'px-2')}>
        {!collapsed && (
          <p className="mb-1 px-1 font-dm-mono text-[11px] font-medium uppercase tracking-[0.2em] text-text-2">By Source</p>
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
