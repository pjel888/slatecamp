'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, Flag, X } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'

interface ConfirmSubmitSheetProps {
  isOpen: boolean
  answeredCount: number
  unansweredCount: number
  flaggedCount: number
  totalCount: number
  isSaving: boolean
  onConfirm: () => void
  onCancel: () => void
  onExit: () => void
}

export function ConfirmSubmitSheet({
  isOpen,
  answeredCount,
  unansweredCount,
  flaggedCount,
  totalCount,
  isSaving,
  onConfirm,
  onCancel,
  onExit,
}: ConfirmSubmitSheetProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => confirmRef.current?.focus(), 200)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Trap focus and close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onCancel])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
            onClick={onCancel}
            aria-hidden
          />

          {/* Center-screen dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-0 z-[70] flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Submit session"
          >
            <div className="w-full max-w-[420px] bg-white rounded-md border border-zinc-200 shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
                  Submit Session?
                </h2>
                <button
                  onClick={onCancel}
                  aria-label="Cancel"
                  className="h-6 w-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  <SCIcon icon={X} size="xs" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-3 rounded-md bg-green-50 border border-green-100">
                    <SCIcon icon={CheckCircle} size="sm" className="text-green-500 mb-1.5" />
                    <span className="text-xl font-black text-green-700 leading-none">{answeredCount}</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-green-600/70 mt-1">Answered</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-md bg-zinc-50 border border-zinc-100">
                    <SCIcon icon={Circle} size="sm" className="text-zinc-300 mb-1.5" />
                    <span className="text-xl font-black text-zinc-500 leading-none">{unansweredCount}</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Skipped</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-md bg-amber-50 border border-amber-100">
                    <SCIcon icon={Flag} size="sm" weight="fill" className="text-amber-500 mb-1.5" />
                    <span className="text-xl font-black text-amber-700 leading-none">{flaggedCount}</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600/70 mt-1">Flagged</span>
                  </div>
                </div>

                {unansweredCount > 0 && (
                  <p className="text-[11px] text-zinc-500 text-center">
                    {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} unanswered. You can go back to review them.
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    ref={confirmRef}
                    onClick={onConfirm}
                    disabled={isSaving}
                    className="w-full h-10 rounded-md bg-primary text-white font-semibold text-sm hover:bg-[#2F5A85] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Submitting...' : `Submit — ${answeredCount} of ${totalCount} Answered`}
                  </button>
                  <button
                    onClick={onCancel}
                    className="w-full h-9 rounded-md border border-zinc-200 text-zinc-600 font-medium text-sm hover:bg-zinc-50 transition-colors"
                  >
                    Keep Reviewing
                  </button>
                  <button
                    onClick={onExit}
                    className="w-full h-8 text-zinc-400 hover:text-zinc-600 text-[11px] font-semibold uppercase tracking-widest transition-colors"
                  >
                    Exit Without Submitting
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
