'use client'

import { useMemo } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import { CommandPalette } from '@/components/portal'
import { developerSurfaceSearchPages } from '@/lib/developer/surface-registry'

export const DevPortalSearch = () => {
  const pages = useMemo(() => developerSurfaceSearchPages, [])

  return (
    <div className="relative ml-auto flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          const isMac = navigator.platform.toUpperCase().includes('MAC')
          document.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'k',
              metaKey: isMac,
              ctrlKey: !isMac,
              bubbles: true,
            }),
          )
        }}
        className="flex w-[200px] cursor-pointer items-center gap-1.5 rounded-xs border border-white/10 bg-white/[0.06] px-2.5 py-1 transition-colors duration-150 hover:bg-white/[0.10]"
      >
        <MagnifyingGlass className="h-3.5 w-3.5 shrink-0 text-white/30" />
        <span className="flex-1 text-left text-xs text-white/25">Search docs and tools...</span>
        <kbd className="rounded border border-white/10 px-1 py-px font-[family-name:var(--font-dm-mono)] text-[11px] text-white/25">
          ⌘K
        </kbd>
      </button>

      <CommandPalette pages={pages} />
    </div>
  )
}
