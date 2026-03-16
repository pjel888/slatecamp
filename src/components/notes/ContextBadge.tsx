'use client'

import { BookOpen, HelpCircle, Tag } from 'lucide-react'
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
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
          <Tag className="h-3 w-3 shrink-0" />
          <span className="truncate max-w-[160px]">{anchor.topic_name}</span>
        </span>
      )}
      {anchor.article_title && (
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
          <BookOpen className="h-3 w-3 shrink-0" />
          <span className="truncate max-w-[160px]">{anchor.article_title}</span>
        </span>
      )}
      {anchor.question_text && (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
          <HelpCircle className="h-3 w-3 shrink-0" />
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
