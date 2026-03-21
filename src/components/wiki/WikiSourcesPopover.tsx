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

  // Calculate position from trigger button
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    })
  }, [])

  // Open/close + position
  const toggle = () => {
    if (!isOpen) updatePosition()
    setIsOpen(!isOpen)
  }

  // Close on outside click
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

  // Close on scroll
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
        {/* Trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          className="flex items-center gap-1.5 text-[13px] text-[#737370] hover:text-[#1B3FC4] transition-colors duration-150 py-1"
        >
          <span className="w-4 h-4 rounded bg-[#F2F0EB] flex items-center justify-center text-[9px] font-bold text-[#A8A8A5]">
            {sources.length}
          </span>
          <span>View all sources</span>
        </button>

        {/* Portal popover — escapes overflow clipping */}
        {isOpen && pos && createPortal(
          <div
            ref={popoverRef}
            className="fixed w-72 max-h-[360px] overflow-y-auto bg-white border border-[#E0DED8] rounded-[10px] shadow-lg z-[100] dark:bg-[#1A1A1A] dark:border-[#3A3835]"
            style={{ top: pos.top, right: pos.right }}
          >
            {/* Header */}
            <div className="font-[var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.1em] text-[#A8A8A5] px-4 pt-3.5 pb-2 border-b border-[#ECEAE4] dark:border-[#3A3835]">
              Sources ({sources.length})
            </div>

            {/* Items */}
            {sources.map((source, i) => (
              <div
                key={source.source_id}
                className={`px-4 py-2.5 ${i < sources.length - 1 ? 'border-b border-[#ECEAE4] dark:border-[#3A3835]' : ''}`}
              >
                <p className="text-[13px] font-semibold text-[#1A1A1A] mb-0.5 dark:text-[#E2E0D8]">
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#1B3FC4] transition-colors"
                    >
                      {source.label}
                    </a>
                  ) : (
                    source.label
                  )}
                </p>
                {source.description && (
                  <p className="text-xs text-[#737370] leading-snug dark:text-[#A8A8A5]">
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
