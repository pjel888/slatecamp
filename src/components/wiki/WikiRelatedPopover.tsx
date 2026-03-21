'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { FileText } from '@phosphor-icons/react'
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

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    })
  }, [])

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

  if (topics.length === 0) return null

  return (
    <div className="mb-5">
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
        Related
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
            {topics.length}
          </span>
          <span>Related topics</span>
        </button>

        {/* Portal popover */}
        {isOpen && pos && createPortal(
          <div
            ref={popoverRef}
            className="fixed w-72 max-h-[360px] overflow-y-auto bg-white border border-[#E0DED8] rounded-[10px] shadow-lg z-[100] dark:bg-[#1A1A1A] dark:border-[#3A3835]"
            style={{ top: pos.top, right: pos.right }}
          >
            {/* Header */}
            <div className="font-[var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.1em] text-[#A8A8A5] px-4 pt-3.5 pb-2 border-b border-[#ECEAE4] dark:border-[#3A3835]">
              Related ({topics.length})
            </div>

            {/* Items */}
            {topics.map((topic, i) => (
              <Link
                key={topic.slug}
                href={ROUTES.WIKI_PAGE(topic.slug)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F8F7F5] transition-colors dark:hover:bg-[#252420] ${i < topics.length - 1 ? 'border-b border-[#ECEAE4] dark:border-[#3A3835]' : ''}`}
              >
                <SCIcon icon={FileText} size="xs" className="text-[#A8A8A5] shrink-0" />
                <span className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#E2E0D8]">
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
