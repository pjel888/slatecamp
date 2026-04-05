'use client'

import { ArrowLeft, SignOut } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ExitConfirmModalProps {
  answeredCount: number
  totalCount: number
  onContinue: () => void
  onExit: () => void
}

export const ExitConfirmModal = ({
  answeredCount,
  totalCount,
  onContinue,
  onExit,
}: ExitConfirmModalProps) => {
  const unansweredCount = totalCount - answeredCount

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onContinue()
        }
      }}
    >
      <DialogContent
        size="sm"
        showCloseButton={false}
        className="gap-0 rounded-lg bg-white p-6"
      >
        <DialogHeader className="mb-4 space-y-1">
          <DialogTitle className="text-sm font-semibold text-foreground">
            Leave this session?
          </DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">
            Your progress will be saved, but this session will end.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-5 rounded-md border border-border bg-surface-light px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Answered</span>
            <span className="font-semibold text-foreground">
              {answeredCount} / {totalCount}
            </span>
          </div>
          {unansweredCount > 0 && (
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-text-secondary">Not yet answered</span>
              <span
                className={cn(
                  'font-semibold',
                  unansweredCount > 0 ? 'text-warning' : 'text-foreground',
                )}
              >
                {unansweredCount}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="secondary"
            size="md"
            onClick={onExit}
            leftIcon={<SignOut size={16} aria-hidden="true" />}
            className="order-2 sm:order-1"
          >
            Exit session
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onContinue}
            leftIcon={<ArrowLeft size={16} aria-hidden="true" />}
            className="order-1 sm:order-2"
            autoFocus
          >
            Continue quiz
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
