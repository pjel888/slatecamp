'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/dialog'
import { updateArticleStatus } from '@/lib/actions/admin/pipeline'
import { normalizeEditorStatus } from '@/lib/admin/editor-workflow'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PipelineArticle {
  article_id: string
  title: string
  slug: string
  status: string
  updated_at: string
  created_at: string
}

type PipelineStatus = 'draft' | 'in_review' | 'approved' | 'published'

interface PipelineCardProps {
  article: PipelineArticle
  columnKey: PipelineStatus
}

/* ------------------------------------------------------------------ */
/*  Status action config                                               */
/* ------------------------------------------------------------------ */

interface StatusAction {
  label: string
  targetStatus: PipelineStatus
  variant: 'default' | 'outline' | 'ghost'
  requiresConfirm: boolean
  confirmTitle?: string
  confirmDescription?: string
}

const STATUS_ACTIONS: Record<PipelineStatus, StatusAction[]> = {
  draft: [
    {
      label: 'Move to Review →',
      targetStatus: 'in_review',
      variant: 'default',
      requiresConfirm: false,
    },
  ],
  in_review: [
    {
      label: 'Approve →',
      targetStatus: 'approved',
      variant: 'default',
      requiresConfirm: false,
    },
    {
      label: '← Back to Draft',
      targetStatus: 'draft',
      variant: 'ghost',
      requiresConfirm: false,
    },
  ],
  approved: [
    {
      label: 'Publish →',
      targetStatus: 'published',
      variant: 'default',
      requiresConfirm: true,
      confirmTitle: 'Publish article?',
      confirmDescription:
        'This will make the article visible to all users. You can unpublish it later.',
    },
    {
      label: '← Back to Draft',
      targetStatus: 'draft',
      variant: 'ghost',
      requiresConfirm: false,
    },
  ],
  published: [
    {
      label: '← Unpublish',
      targetStatus: 'draft',
      variant: 'ghost',
      requiresConfirm: false,
    },
  ],
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const PipelineCard = ({ article, columnKey }: PipelineCardProps) => {
  const [isPending, startTransition] = useTransition()
  const [confirmAction, setConfirmAction] = useState<StatusAction | null>(null)
  const normalizedStatus = normalizeEditorStatus(article.status) as PipelineStatus

  const updatedAtLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(article.updated_at))

  const handleAction = (action: StatusAction) => {
    if (action.requiresConfirm) {
      setConfirmAction(action)
      return
    }
    startTransition(async () => {
      await updateArticleStatus(article.article_id, action.targetStatus)
    })
  }

  const handleConfirm = () => {
    if (!confirmAction) return
    startTransition(async () => {
      await updateArticleStatus(article.article_id, confirmAction.targetStatus)
    })
    setConfirmAction(null)
  }

  const actions = STATUS_ACTIONS[columnKey] ?? []

  return (
    <>
      <div
        className="rounded-md border border-border bg-card p-2.5 transition-colors duration-150 hover:border-primary/30 hover:bg-muted/50"
        aria-label={`${article.title} — ${normalizedStatus}`}
      >
        <Link
          href={`/admin/knowledge/${article.article_id}`}
          className="block"
          tabIndex={isPending ? -1 : undefined}
        >
          <p className="text-sm font-medium leading-snug line-clamp-2">
            {article.title}
          </p>
          <p className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground mt-0.5 truncate">
            {article.slug}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Updated {updatedAtLabel}
          </p>
        </Link>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/60">
            {actions.map((action) => (
              <Button
                key={action.targetStatus}
                variant={action.variant}
                size="xs"
                disabled={isPending}
                onClick={() => handleAction(action)}
                className={
                  action.variant === 'default'
                    ? 'text-[11px] h-6 px-2'
                    : 'text-[11px] h-6 px-2 text-muted-foreground hover:text-foreground'
                }
              >
                {isPending ? '…' : action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => {
            if (!open) setConfirmAction(null)
          }}
          title={confirmAction.confirmTitle ?? 'Are you sure?'}
          description={confirmAction.confirmDescription}
          confirmLabel="Publish"
          cancelLabel="Cancel"
          confirmVariant="primary"
          onConfirm={handleConfirm}
          loading={isPending}
        />
      )}
    </>
  )
}
