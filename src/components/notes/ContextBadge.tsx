'use client'

import { BookOpen, Question, Tag } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import type { NoteAnchor } from '@/lib/context/note-context'

interface ContextBadgeProps {
  anchor: NoteAnchor
  className?: string
}

export function ContextBadge({ anchor, className }: ContextBadgeProps) {
  const hasAny = anchor.topic_id || anchor.article_id || anchor.question_id
  if (!hasAny) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {anchor.topic_name && (
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-[#EEF2FC] px-2.5 py-1 text-[11px] font-medium text-[#1535A8]">
          <SCIcon icon={Tag} size="xs" className="shrink-0" />
          <span className="truncate max-w-[160px]">{anchor.topic_name}</span>
        </span>
      )}
      {anchor.article_title && (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-[#F5F5F5] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
          <SCIcon icon={BookOpen} size="xs" className="shrink-0" />
          <span className="truncate max-w-[160px]">{anchor.article_title}</span>
        </span>
      )}
      {anchor.question_text && (
        <span className="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-[#FEF8ED] px-2.5 py-1 text-[11px] font-medium text-warning">
          <SCIcon icon={Question} size="xs" className="shrink-0" />
          <span className="truncate max-w-[180px]">
            {anchor.question_text.length > 55
              ? anchor.question_text.slice(0, 55) + '…'
              : anchor.question_text}
          </span>
        </span>
      )}
    </div>
  )
}
