'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { FileText } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ROUTES } from '@/lib/constants/routes'

interface RelatedTopic {
  slug: string
  title: string
}

interface WikiRelatedPopoverProps {
  topics: RelatedTopic[]
}

export const WikiRelatedPopover = ({ topics }: WikiRelatedPopoverProps) => {
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

  if (topics.length === 0) return null

  return (
    <div className="mb-5">
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
        Related
      </p>
      <div>
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          className="flex items-center gap-1.5 text-[13px] text-[#737370] hover:text-camp-cobalt transition-colors duration-150 py-1"
        >
          <span className="w-4 h-4 rounded bg-[#F5F5F5] flex items-center justify-center text-[11px] font-bold text-[#A8A8A5]">
            {topics.length}
          </span>
          <span>Related topics</span>
        </button>

        {isOpen && pos && createPortal(
          <div
            ref={popoverRef}
            className="fixed w-64 max-h-[360px] overflow-y-auto bg-white border border-[#E0DED8] rounded-[10px] shadow-lg z-[100] dark:bg-[#1A1A1A] dark:border-[#3A3835]"
            style={{ top: pos.top, right: pos.right }}
          >
            <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-[#A8A8A5] px-3 pt-3 pb-1.5 border-b border-[#ECEAE4] dark:border-[#3A3835]">
              Related ({topics.length})
            </div>

            {topics.map((topic, i) => (
              <Link
                key={topic.slug}
                href={ROUTES.WIKI_PAGE(topic.slug)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 hover:bg-[#F5F5F5] transition-colors dark:hover:bg-[#252420] ${i < topics.length - 1 ? 'border-b border-[#ECEAE4] dark:border-[#3A3835]' : ''}`}
              >
                <SCIcon icon={FileText} size="xs" className="text-[#A8A8A5] shrink-0" />
                <span className="text-[11px] font-bold text-[#1A1A1A] dark:text-[#E2E0D8]">
                  {topic.title}
                </span>
              </Link>
            ))}
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}
