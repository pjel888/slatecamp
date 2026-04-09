'use client'

// CommandPalette — fuzzy search across modules, parameters, presets, shortcuts
// Triggered by Ctrl+K or F3. Uses shadcn Command (cmdk-based) if available,
// otherwise a simple search dialog.

import { useState, useEffect, useCallback, useMemo } from 'react'

interface CommandItem {
  id: string
  label: string
  category: 'module' | 'action' | 'shortcut'
  shortcut?: string
  onSelect: () => void
}

// Default actions available in every module
const DEFAULT_ACTIONS: CommandItem[] = [
  { id: 'toggle-grid', label: 'Toggle Grid', category: 'action', shortcut: 'G', onSelect: () => {} },
  { id: 'toggle-dimensions', label: 'Toggle Dimensions', category: 'action', shortcut: 'D', onSelect: () => {} },
  { id: 'toggle-xray', label: 'Toggle X-ray', category: 'action', shortcut: 'X', onSelect: () => {} },
  { id: 'screenshot', label: 'Take Screenshot', category: 'action', shortcut: 'P', onSelect: () => {} },
  { id: 'fullscreen', label: 'Toggle Fullscreen', category: 'action', shortcut: 'F', onSelect: () => {} },
  { id: 'reset-camera', label: 'Reset Camera', category: 'action', shortcut: 'R', onSelect: () => {} },
  { id: 'zoom-to-fit', label: 'Zoom to Fit', category: 'action', shortcut: 'Z', onSelect: () => {} },
  { id: 'front-view', label: 'Front View', category: 'action', shortcut: '1', onSelect: () => {} },
  { id: 'top-view', label: 'Top View', category: 'action', shortcut: '2', onSelect: () => {} },
  { id: 'iso-view', label: 'Isometric View', category: 'action', shortcut: '3', onSelect: () => {} },
]

interface CommandPaletteProps {
  /** Additional items from the current module */
  items?: CommandItem[]
}

export const CommandPalette = ({ items = [] }: CommandPaletteProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  // Open on Ctrl+K or F3
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setQuery('')
      }
      if (e.key === 'F3') {
        e.preventDefault()
        setOpen(true)
        setQuery('')
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const allItems = useMemo(() => [...DEFAULT_ACTIONS, ...items], [items])

  const filtered = useMemo(() => {
    if (!query) return allItems
    const lowerQuery = query.toLowerCase()
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        (item.shortcut && item.shortcut.toLowerCase().includes(lowerQuery))
    )
  }, [allItems, query])

  const handleSelect = useCallback((item: CommandItem) => {
    item.onSelect()
    setOpen(false)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-md rounded-md border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-border px-3">
          <span className="text-muted-foreground text-sm mr-2">&#8984;</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, modules, shortcuts..."
            className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            autoFocus
          />
          <kbd className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              No results found
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="flex w-full items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-mono w-12">{item.category}</span>
                  <span>{item.label}</span>
                </div>
                {item.shortcut && (
                  <kbd className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-mono">{item.shortcut}</kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
