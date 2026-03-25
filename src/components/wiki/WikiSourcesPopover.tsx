'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { WikiArticleSource } from '@/lib/actions/wiki-actions'

interface WikiSourcesPopoverProps {
  sources: WikiArticleSource[]
}

export const WikiSourcesPopover = ({ sources }: WikiSourcesPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)

  // Position popover so its right edge aligns with the sidebar's left edge
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const triggerRect = triggerRef.current.getBoundingClientRect()
    // Top-aligned with trigger, popover extends to the left
    setPos({
      top: triggerRect.top,
      right: window.innerWidth - triggerRect.left + 8,
    })
  }, [])

  const toggle = () => {
    if (!isOpen) updatePosition()
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = () => setIsOpen(false)
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [isOpen])

  if (sources.length === 0) return null

  return (
    <div className="mb-5">
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
        Sources
      </p>
      <div>
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          className="flex items-center gap-1.5 text-[13px] text-[#737370] hover:text-camp-cobalt transition-colors duration-150 py-1"
        >
          <span className="w-4 h-4 rounded bg-[#F5F5F5] flex items-center justify-center text-[11px] font-bold text-[#A8A8A5]">
            {sources.length}
          </span>
          <span>View all sources</span>
        </button>

        {isOpen && pos && createPortal(
          <div
            ref={popoverRef}
            className="fixed w-64 max-h-[360px] overflow-y-auto bg-white border border-[#E0DED8] rounded-[10px] shadow-lg z-[100] dark:bg-[#1A1A1A] dark:border-[#3A3835]"
            style={{ top: pos.top, right: pos.right }}
          >
            <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-[#A8A8A5] px-3 pt-3 pb-1.5 border-b border-[#ECEAE4] dark:border-[#3A3835]">
              Sources ({sources.length})
            </div>

            {sources.map((source, i) => (
              <div
                key={source.source_id}
                className={`px-3 py-2 ${i < sources.length - 1 ? 'border-b border-[#ECEAE4] dark:border-[#3A3835]' : ''}`}
              >
                <p className="text-[11px] font-bold text-[#1A1A1A] leading-tight dark:text-[#E2E0D8]">
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-camp-cobalt transition-colors">
                      {source.label}
                    </a>
                  ) : source.label}
                </p>
                {source.description && (
                  <p className="text-[11px] text-[#A8A8A5] leading-snug mt-0.5 line-clamp-1 dark:text-[#737370]">
                    {source.description}
                  </p>
                )}
              </div>
            ))}
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}
